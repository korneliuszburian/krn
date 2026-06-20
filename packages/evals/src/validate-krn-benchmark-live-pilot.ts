import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseKrnBenchmarkReport, type KrnBenchmarkReport } from "@krn/contracts";
import { z } from "zod";

const CodexPilotOutputSchema = z
  .object({
    selected_phase: z.string().min(1),
    current_parent_goal: z.string().min(1),
    latest_child_goal: z.string().min(1),
    source_refs: z.array(z.string().min(1)).min(1),
    next_action: z.string().min(1),
    should_claim_productivity_lift: z.boolean(),
    overclaim_boundary: z.string().min(1),
    rationale: z.string().min(1),
  })
  .strict();

type CodexPilotOutput = z.infer<typeof CodexPilotOutputSchema>;

type EvalMode = "validate" | "live";

type EvalCase = {
  id: string;
  expected_behavior: string;
  metrics: string[];
  failure_mode: string;
};

type CaseResult = {
  id: string;
  passed: boolean;
  assertions: string[];
  failure_mode: string;
  message: string;
};

type EvalReport = {
  schema_version: "krn-benchmark-live-pilot-result.v1";
  kind: "krn_benchmark_live_pilot_result";
  run_id: string;
  created_at: string;
  mode: EvalMode;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  case_pass_rate: number;
  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;
  assertion_pass_rate: number;
  cases: CaseResult[];
  generated_benchmark_report_path: string | null;
  interpretation_caveat: string;
};

type MetricScores = {
  phase_routing_score: number;
  source_grounding_score: number;
  goal_alignment_score: number;
  next_action_score: number;
  overclaim_boundary_score: number;
};

type ScoredOutput = {
  parsed: CodexPilotOutput | null;
  score: number;
  metrics: MetricScores;
  parse_error: string | null;
};

type CodexRunCapture = {
  label: "baseline" | "assisted";
  exit_code: number | null;
  timed_out: boolean;
  stdout_path: string;
  stderr_path: string;
  final_path: string;
  parsed: CodexPilotOutput | null;
  score: ScoredOutput;
  error_message: string | null;
};

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function parseCases(input: unknown): EvalCase[] {
  if (!Array.isArray(input)) {
    throw new Error("cases.json must be an array");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`case ${index} must be an object`);
    }

    const record = item as Record<string, unknown>;
    const id = record.id;
    const expectedBehavior = record.expected_behavior;
    const metrics = record.metrics;
    const failureMode = record.failure_mode;

    if (typeof id !== "string" || id.length === 0) {
      throw new Error(`case ${index} missing id`);
    }
    if (typeof expectedBehavior !== "string" || expectedBehavior.length === 0) {
      throw new Error(`case ${id} missing expected_behavior`);
    }
    if (!Array.isArray(metrics) || !metrics.every((metric) => typeof metric === "string" && metric.length > 0)) {
      throw new Error(`case ${id} missing metrics`);
    }
    if (typeof failureMode !== "string" || failureMode.length === 0) {
      throw new Error(`case ${id} missing failure_mode`);
    }

    return { id, expected_behavior: expectedBehavior, metrics, failure_mode: failureMode };
  });
}

function result(id: string, passed: boolean, assertions: string[], failureMode: string, message: string): CaseResult {
  return { id, passed, assertions, failure_mode: failureMode, message };
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function caseById(cases: EvalCase[], id: string): EvalCase {
  const found = cases.find((testCase) => testCase.id === id);
  if (!found) {
    throw new Error(`Missing case ${id}`);
  }
  return found;
}

function parseMode(argv: readonly string[]): EvalMode {
  const modeIndex = argv.indexOf("--mode");
  if (modeIndex === -1) {
    return "validate";
  }

  const mode = argv[modeIndex + 1];
  if (mode !== "validate" && mode !== "live") {
    throw new Error(`Unsupported mode: ${mode ?? "<missing>"}`);
  }

  return mode;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function includesAny(value: string, needles: readonly string[]): boolean {
  const lower = normalize(value);
  return needles.some((needle) => lower.includes(normalize(needle)));
}

function sourceIncludes(output: CodexPilotOutput, needle: string): boolean {
  return output.source_refs.some((sourceRef) => normalize(sourceRef).includes(normalize(needle)));
}

function roundScore(value: number): number {
  return Number(value.toFixed(4));
}

function scoreOutput(input: unknown): ScoredOutput {
  const parsed = CodexPilotOutputSchema.safeParse(input);
  if (!parsed.success) {
    const zeroMetrics: MetricScores = {
      phase_routing_score: 0,
      source_grounding_score: 0,
      goal_alignment_score: 0,
      next_action_score: 0,
      overclaim_boundary_score: 0,
    };
    return {
      parsed: null,
      score: 0,
      metrics: zeroMetrics,
      parse_error: parsed.error.message,
    };
  }

  const output = parsed.data;
  const phaseRoutingScore =
    includesAny(output.selected_phase, ["p8", "benchmark"]) || includesAny(output.next_action, ["benchmark"])
      ? 1
      : 0;
  const sourceGroundingScore = roundScore(
    [
      sourceIncludes(output, "docs/goals/goal-006.md"),
      sourceIncludes(output, "docs/goals/goal-017.md") || sourceIncludes(output, "docs/goals/goal-018.md"),
      sourceIncludes(output, "docs/specs/krn-benchmark-report") || sourceIncludes(output, "docs/plans/canonical/SOURCES.md"),
    ].filter(Boolean).length / 3,
  );
  const goalAlignmentScore = roundScore(
    [
      includesAny(output.current_parent_goal, ["docs/goals/goal-006.md", "goal-006"]),
      includesAny(output.latest_child_goal, ["docs/goals/goal-017.md", "goal-017", "docs/goals/goal-018.md", "goal-018"]),
    ].filter(Boolean).length / 2,
  );
  const nextActionScore = roundScore(
    [
      includesAny(output.next_action, ["live"]),
      includesAny(output.next_action, ["codex exec"]),
      includesAny(output.next_action, ["benchmark"]),
      includesAny(output.next_action, ["krnbenchmarkreport", "benchmark report"]),
    ].filter(Boolean).length / 4,
  );
  const overclaimBoundaryScore = roundScore(
    [
      output.should_claim_productivity_lift === false,
      includesAny(output.overclaim_boundary, ["not prove", "does not prove", "no productivity", "without", "unclaimed"]),
      includesAny(output.overclaim_boundary, ["lift", "productivity"]),
      includesAny(output.overclaim_boundary, ["one", "single", "larger", "future", "minimum", "suite"]),
    ].filter(Boolean).length / 4,
  );

  const metrics: MetricScores = {
    phase_routing_score: phaseRoutingScore,
    source_grounding_score: sourceGroundingScore,
    goal_alignment_score: goalAlignmentScore,
    next_action_score: nextActionScore,
    overclaim_boundary_score: overclaimBoundaryScore,
  };
  const score = roundScore(Object.values(metrics).reduce((sum, metric) => sum + metric, 0) / Object.values(metrics).length);

  return { parsed: output, score, metrics, parse_error: null };
}

function readPilotOutput(path: string): unknown {
  return readJson(path);
}

function buildPrompt(kind: "baseline" | "assisted"): string {
  const schemaInstruction =
    "Return only the JSON object requested by the provided schema. Do not edit files. Do not claim productivity lift unless the evidence explicitly proves it.";

  if (kind === "baseline") {
    return `${schemaInstruction}

Task: Inspect this repository and identify the next concrete action for the active KRN product goal. Use your usual Codex repo-reading behavior.`;
  }

  return `${schemaInstruction}

Task: Inspect this repository and identify the next concrete action for the active KRN product goal.

Use KRN's project-local operating layer explicitly:
- read AGENTS.md,
- read docs/memory/INDEX.md,
- read docs/goals/goal-006.md,
- read docs/goals/goal-017.md,
- read docs/goals/goal-018.md if it exists,
- read docs/specs/krn-benchmark-report/README.md,
- read docs/plans/canonical/SOURCES.md.

Classify the work phase and preserve the overclaim boundary around benchmark evidence.`;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function runCodexExec(label: "baseline" | "assisted", runDir: string): CodexRunCapture {
  const stdoutPath = resolve(runDir, `${label}.stdout.jsonl`);
  const stderrPath = resolve(runDir, `${label}.stderr.txt`);
  const finalPath = resolve(runDir, `${label}.final.json`);
  const schemaPath = resolve("docs/evals/krn-benchmark-live-pilot/codex-output.schema.json");
  const args = [
    "exec",
    "--json",
    "--ephemeral",
    "--sandbox",
    "read-only",
    "--output-schema",
    schemaPath,
    "--output-last-message",
    finalPath,
    "-C",
    process.cwd(),
    buildPrompt(label),
  ];

  const completed = spawnSync("codex", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 240_000,
  });

  writeText(stdoutPath, completed.stdout ?? "");
  writeText(stderrPath, completed.stderr ?? "");

  let parsed: CodexPilotOutput | null = null;
  let score = scoreOutput({});
  let errorMessage: string | null = null;

  if (completed.error) {
    errorMessage = completed.error.message;
  } else if (!existsSync(finalPath)) {
    errorMessage = "codex exec did not write final JSON output";
  } else {
    try {
      const finalOutput = readPilotOutput(finalPath);
      score = scoreOutput(finalOutput);
      parsed = score.parsed;
      errorMessage = score.parse_error;
    } catch (error: unknown) {
      errorMessage = error instanceof Error ? error.message : "unknown final JSON parse error";
    }
  }

  return {
    label,
    exit_code: completed.status,
    timed_out: completed.error?.message.includes("ETIMEDOUT") ?? false,
    stdout_path: stdoutPath,
    stderr_path: stderrPath,
    final_path: finalPath,
    parsed,
    score,
    error_message: errorMessage,
  };
}

function relativeRuntimePath(path: string): string {
  const root = `${process.cwd()}/`;
  return path.startsWith(root) ? path.slice(root.length) : path;
}

function repairTargets(): KrnBenchmarkReport["repair_targets"] {
  return [
    {
      id: "expand-live-codex-benchmark-suite",
      owner: "krn",
      next_action:
        "Run a larger live_codex_exec benchmark suite with enough tasks before any productivity lift claim is allowed.",
      source_refs: ["docs/goals/goal-006.md", "docs/specs/krn-benchmark-report/README.md"],
      failure_mode: "A one-task live pilot is overclaimed as measured productivity improvement.",
    },
  ];
}

function metricRows(baseline: MetricScores, assisted: MetricScores): KrnBenchmarkReport["tasks"][number]["metrics"] {
  return [
    "phase_routing_score",
    "source_grounding_score",
    "goal_alignment_score",
    "next_action_score",
    "overclaim_boundary_score",
  ].map((metricId) => {
    const baselineScore = baseline[metricId as keyof MetricScores];
    const assistedScore = assisted[metricId as keyof MetricScores];
    return {
      metric_id: metricId,
      baseline_score: baselineScore,
      assisted_score: assistedScore,
      assisted_minus_baseline: roundScore(assistedScore - baselineScore),
      weight: 1,
      source_refs: ["docs/evals/krn-benchmark-live-pilot/cases.json", "docs/goals/goal-018.md"],
      interpretation_caveat: "Metric score is deterministic for one live pilot task only.",
    };
  });
}

function buildLiveBenchmarkReport(runId: string, now: Date, baseline: CodexRunCapture, assisted: CodexRunCapture): KrnBenchmarkReport {
  const taskCompleted =
    baseline.exit_code === 0 &&
    assisted.exit_code === 0 &&
    baseline.parsed !== null &&
    assisted.parsed !== null &&
    !baseline.timed_out &&
    !assisted.timed_out;
  const taskStatus: "completed" | "failed" = taskCompleted ? "completed" : "failed";
  const reportPath = `.krn/benchmarks/krn-benchmark-live-pilot/${runId}/report.json`;
  const taskRepairTargets = taskCompleted ? [] : repairTargets();
  const report = {
    schema_version: "krn-benchmark-report.v1",
    kind: "krn_benchmark_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: process.cwd(),
    benchmark_id: "krn-benchmark-live-pilot",
    suite_id: "one-task-routing-pilot",
    measurement_mode: "live_codex_exec",
    baseline_label: "baseline_codex",
    assisted_label: "krn_assisted_codex",
    minimum_task_count_for_lift_claim: 20,
    productivity_lift_claimed: false,
    lift_status: "no_lift_evidence",
    task_count: 1,
    completed_task_count: taskCompleted ? 1 : 0,
    blocked_task_count: 0,
    failed_task_count: taskCompleted ? 0 : 1,
    baseline_score: baseline.score.score,
    assisted_score: assisted.score.score,
    assisted_minus_baseline: roundScore(assisted.score.score - baseline.score.score),
    tasks: [
      {
        task_id: "goal006-next-action-routing",
        title: "Route the next KRN benchmark action for the active parent goal",
        status: taskStatus,
        task_source_refs: [
          "docs/goals/goal-006.md",
          "docs/goals/goal-017.md",
          "docs/goals/goal-018.md",
          "docs/specs/krn-benchmark-report/README.md",
        ],
        baseline: {
          label: "baseline_codex",
          score: baseline.score.score,
          evidence_refs: [
            relativeRuntimePath(baseline.stdout_path),
            relativeRuntimePath(baseline.stderr_path),
            relativeRuntimePath(baseline.final_path),
          ],
          interpretation_caveat:
            "This is one live Codex baseline run in the current repo; AGENTS.md may still be loaded by Codex, so it is not a pure no-KRN environment.",
        },
        assisted: {
          label: "krn_assisted_codex",
          score: assisted.score.score,
          evidence_refs: [
            relativeRuntimePath(assisted.stdout_path),
            relativeRuntimePath(assisted.stderr_path),
            relativeRuntimePath(assisted.final_path),
          ],
          interpretation_caveat:
            "This is one live Codex run with explicit KRN read-order guidance; it is not a statistically meaningful productivity measurement.",
        },
        assisted_minus_baseline: roundScore(assisted.score.score - baseline.score.score),
        metrics: metricRows(baseline.score.metrics, assisted.score.metrics),
        repair_targets: taskRepairTargets,
        interpretation_caveat: "One live task proves only the runner and scoring path, not productivity lift.",
      },
    ],
    repair_targets: repairTargets(),
    benchmark_report_path: reportPath,
    source_refs: [
      "docs/goals/goal-006.md",
      "docs/goals/goal-018.md",
      "docs/specs/krn-benchmark-report/README.md",
      "docs/evals/krn-benchmark-live-pilot/README.md",
      "docs/evals/STANDARD.md",
    ],
    interpretation_caveat:
      "This live pilot proves one baseline-vs-assisted codex exec scoring path only; it does not prove measured productivity lift, benchmark statistical validity, human review quality, dashboard command readiness, HTTP/API readiness, or ChatGPT connector behavior.",
  } satisfies KrnBenchmarkReport;

  return parseKrnBenchmarkReport(report);
}

function writeBenchmarkReport(report: KrnBenchmarkReport): string {
  const reportPath = resolve(report.benchmark_report_path);
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function runFixtureValidation(cases: EvalCase[]): CaseResult[] {
  const baseline = scoreOutput(readJson(resolve("docs/evals/krn-benchmark-live-pilot/fixtures/baseline-output.example.json")));
  const assisted = scoreOutput(readJson(resolve("docs/evals/krn-benchmark-live-pilot/fixtures/assisted-output.example.json")));
  const bad = scoreOutput(readJson(resolve("docs/evals/krn-benchmark-live-pilot/fixtures/bad-output.example.json")));

  const fixtureCase = caseById(cases, "fixture-scorer-distinguishes-assisted");
  const knownBadCase = caseById(cases, "known-bad-output-fails");

  return [
    result(
      fixtureCase.id,
      baseline.parsed !== null && assisted.parsed !== null && assisted.score > baseline.score,
      ["baseline fixture parses", "assisted fixture parses", "assisted fixture score is higher"],
      fixtureCase.failure_mode,
      `Fixture scores: baseline=${baseline.score}, assisted=${assisted.score}.`,
    ),
    result(
      knownBadCase.id,
      bad.parsed !== null && bad.score < 0.6 && bad.parsed.should_claim_productivity_lift,
      ["known-bad output parses", "known-bad score is below pass threshold", "lift claim is penalized"],
      knownBadCase.failure_mode,
      `Known-bad score: ${bad.score}.`,
    ),
  ];
}

function runValidation(mode: EvalMode): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-benchmark-live-pilot/cases.json")));
  const results: CaseResult[] = [...runFixtureValidation(cases)];
  let generatedBenchmarkReportPath: string | null = null;

  const caveat =
    "This eval proves one live codex exec benchmark pilot path only; it does not prove measured productivity lift, and a one-task pilot remains below the benchmark lift gate.";

  if (mode === "live") {
    const runDir = resolve(".krn/benchmarks/krn-benchmark-live-pilot", runId);
    mkdirSync(runDir, { recursive: true });
    const baseline = runCodexExec("baseline", runDir);
    const assisted = runCodexExec("assisted", runDir);
    const benchmarkReport = buildLiveBenchmarkReport(runId, now, baseline, assisted);
    generatedBenchmarkReportPath = writeBenchmarkReport(benchmarkReport);

    const liveShapeCase = caseById(cases, "live-report-shape");
    const parsedReport = parseKrnBenchmarkReport(readJson(generatedBenchmarkReportPath));
    results.push(
      result(
        liveShapeCase.id,
        existsSync(baseline.stdout_path) &&
          existsSync(assisted.stdout_path) &&
          existsSync(generatedBenchmarkReportPath) &&
          parsedReport.measurement_mode === "live_codex_exec" &&
          !parsedReport.productivity_lift_claimed &&
          parsedReport.repair_targets.length > 0,
        [
          "baseline codex exec run captured",
          "assisted codex exec run captured",
          "generated benchmark report exists",
          "generated benchmark report parses",
          "measurement mode is live_codex_exec",
          "productivity lift remains unclaimed",
          "repair target present",
        ],
        liveShapeCase.failure_mode,
        `Live pilot scores: baseline=${parsedReport.baseline_score}, assisted=${parsedReport.assisted_score}, delta=${parsedReport.assisted_minus_baseline}.`,
      ),
    );

    const boundaryCase = caseById(cases, "live-overclaim-boundary");
    results.push(
      result(
        boundaryCase.id,
        caveat.includes("does not prove measured productivity lift") && caveat.includes("one-task pilot"),
        ["eval report caveat names no productivity lift", "eval report caveat names one-task limitation"],
        boundaryCase.failure_mode,
        "Live pilot caveat preserves the one-task no-lift boundary.",
      ),
    );
  }

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-benchmark-live-pilot-result.v1",
    kind: "krn_benchmark_live_pilot_result",
    run_id: runId,
    created_at: now.toISOString(),
    mode,
    total_cases: totalCases,
    passed_cases: passedCases,
    failed_cases: totalCases - passedCases,
    case_pass_rate: totalCases === 0 ? 0 : passedCases / totalCases,
    total_assertions: totalAssertions,
    passed_assertions: passedAssertions,
    failed_assertions: totalAssertions - passedAssertions,
    assertion_pass_rate: totalAssertions === 0 ? 0 : passedAssertions / totalAssertions,
    cases: results,
    generated_benchmark_report_path: generatedBenchmarkReportPath,
    interpretation_caveat: caveat,
  };
}

export function main(): void {
  const mode = parseMode(process.argv.slice(2));
  const report = runValidation(mode);
  const reportDir = resolve(".krn/evals/krn-benchmark-live-pilot", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`report: ${reportPath}\n`);

  if (report.failed_cases > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
