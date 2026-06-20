import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseKrnBenchmarkReport, type KrnBenchmarkReport } from "@krn/contracts";
import { z } from "zod";

const CodexSuiteOutputSchema = z
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

const BenchmarkTaskDefinitionSchema = z
  .object({
    task_id: z.string().min(1),
    title: z.string().min(1),
    prompt: z.string().min(1),
    assisted_guidance: z.array(z.string().min(1)).min(1),
    source_refs: z.array(z.string().min(1)).min(1),
    current_child_goal_ref: z.string().min(1),
    superseded_latest_child_goal_refs: z.array(z.string().min(1)),
    parent_goal_keywords: z.array(z.string().min(1)).min(1),
    latest_child_goal_keywords: z.array(z.string().min(1)).min(1),
    expected_phase_keywords: z.array(z.string().min(1)).min(1),
    required_source_ref_keywords: z.array(z.string().min(1)).min(1),
    next_action_keywords: z.array(z.string().min(1)).min(1),
    overclaim_keywords: z.array(z.string().min(1)).min(1),
    fixture_baseline_path: z.string().min(1),
    fixture_assisted_path: z.string().min(1),
  })
  .strict();

const LiveRunPolicySchema = z
  .object({
    execution_order: z.literal("sequential_task_baseline_then_assisted"),
    max_concurrent_codex_exec_runs: z.literal(1),
    per_codex_exec_timeout_ms: z.number().int().min(60_000).max(240_000),
    max_codex_exec_output_buffer_bytes: z.number().int().min(1_048_576).max(64_000_000),
    baseline_prompt_scope: z.literal("bounded_task_relevant_repo_reading"),
    timeout_result: z.literal("failed_task_no_lift"),
  })
  .strict();

const TaskRegistrySchema = z
  .object({
    schema_version: z.literal("krn-benchmark-live-suite-tasks.v1"),
    benchmark_id: z.literal("krn-benchmark-live-suite"),
    suite_id: z.string().min(1),
    minimum_task_count_for_lift_claim: z.number().int().min(20),
    live_run_policy: LiveRunPolicySchema,
    tasks: z.array(BenchmarkTaskDefinitionSchema).min(3),
  })
  .strict()
  .superRefine((registry, context) => {
    const taskIds = new Set<string>();
    for (const [index, task] of registry.tasks.entries()) {
      if (taskIds.has(task.task_id)) {
        context.addIssue({
          code: "custom",
          path: ["tasks", index, "task_id"],
          message: `duplicate task_id ${task.task_id}`,
        });
      }
      taskIds.add(task.task_id);

      if (!task.source_refs.includes(task.current_child_goal_ref)) {
        context.addIssue({
          code: "custom",
          path: ["tasks", index, "current_child_goal_ref"],
          message: `current_child_goal_ref ${task.current_child_goal_ref} must be included in source_refs`,
        });
      }

      if (!task.required_source_ref_keywords.includes(task.current_child_goal_ref)) {
        context.addIssue({
          code: "custom",
          path: ["tasks", index, "required_source_ref_keywords"],
          message: `required_source_ref_keywords must include ${task.current_child_goal_ref}`,
        });
      }

      if (!task.latest_child_goal_keywords.includes(task.current_child_goal_ref)) {
        context.addIssue({
          code: "custom",
          path: ["tasks", index, "latest_child_goal_keywords"],
          message: `latest_child_goal_keywords must include current child ${task.current_child_goal_ref}`,
        });
      }

      const latestText = task.latest_child_goal_keywords.join("\n");
      const assistedGuidanceText = task.assisted_guidance.join("\n");
      for (const supersededRef of task.superseded_latest_child_goal_refs) {
        if (includesAny(latestText, [supersededRef])) {
          context.addIssue({
            code: "custom",
            path: ["tasks", index, "latest_child_goal_keywords"],
            message: `latest_child_goal_keywords must not include superseded child ${supersededRef}`,
          });
        }
        if (includesAny(assistedGuidanceText, ["latest"]) && includesAny(assistedGuidanceText, [supersededRef])) {
          context.addIssue({
            code: "custom",
            path: ["tasks", index, "assisted_guidance"],
            message: `latest-child guidance must not point at superseded child ${supersededRef}`,
          });
        }
      }
    }
  });

type CodexSuiteOutput = z.infer<typeof CodexSuiteOutputSchema>;
type BenchmarkTaskDefinition = z.infer<typeof BenchmarkTaskDefinitionSchema>;
type TaskRegistry = z.infer<typeof TaskRegistrySchema>;
type LiveRunPolicy = z.infer<typeof LiveRunPolicySchema>;
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
  schema_version: "krn-benchmark-live-suite-result.v1";
  kind: "krn_benchmark_live_suite_result";
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
  parsed: CodexSuiteOutput | null;
  score: number;
  metrics: MetricScores;
  parse_error: string | null;
};

type TaskScorePair = {
  task: BenchmarkTaskDefinition;
  baseline: ScoredOutput;
  assisted: ScoredOutput;
  baseline_evidence_refs: string[];
  assisted_evidence_refs: string[];
};

type CodexRunCapture = {
  task: BenchmarkTaskDefinition;
  label: "baseline" | "assisted";
  exit_code: number | null;
  timed_out: boolean;
  stdout_path: string;
  stderr_path: string;
  final_path: string;
  parsed: CodexSuiteOutput | null;
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

function parseTaskRegistry(input: unknown): TaskRegistry {
  return TaskRegistrySchema.parse(input);
}

function firstTask(registry: TaskRegistry): BenchmarkTaskDefinition {
  const task = registry.tasks[0];
  if (!task) {
    throw new Error("task registry must contain at least one task");
  }
  return task;
}

function normalize(value: string): string {
  return value.toLowerCase();
}

function includesAny(value: string, needles: readonly string[]): boolean {
  const lower = normalize(value);
  return needles.some((needle) => lower.includes(normalize(needle)));
}

function keywordHitRate(value: string, keywords: readonly string[]): number {
  if (keywords.length === 0) {
    return 0;
  }

  const lower = normalize(value);
  const hits = keywords.filter((keyword) => lower.includes(normalize(keyword))).length;
  return roundScore(hits / keywords.length);
}

function sourceIncludes(output: CodexSuiteOutput, needle: string): boolean {
  return output.source_refs.some((sourceRef) => normalize(sourceRef).includes(normalize(needle)));
}

function roundScore(value: number): number {
  return Number(value.toFixed(4));
}

function averageScore(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return roundScore(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function zeroScores(): MetricScores {
  return {
    phase_routing_score: 0,
    source_grounding_score: 0,
    goal_alignment_score: 0,
    next_action_score: 0,
    overclaim_boundary_score: 0,
  };
}

function scoreOutput(task: BenchmarkTaskDefinition, input: unknown): ScoredOutput {
  const parsed = CodexSuiteOutputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      parsed: null,
      score: 0,
      metrics: zeroScores(),
      parse_error: parsed.error.message,
    };
  }

  const output = parsed.data;
  const phaseRoutingScore =
    includesAny(output.selected_phase, task.expected_phase_keywords) ||
    includesAny(output.next_action, task.expected_phase_keywords)
      ? 1
      : 0;
  const sourceGroundingScore = roundScore(
    task.required_source_ref_keywords.filter((keyword) => sourceIncludes(output, keyword)).length /
      task.required_source_ref_keywords.length,
  );
  const goalAlignmentScore = roundScore(
    [
      includesAny(output.current_parent_goal, task.parent_goal_keywords),
      includesAny(output.latest_child_goal, task.latest_child_goal_keywords),
      task.parent_goal_keywords.some((keyword) => sourceIncludes(output, keyword)),
      task.latest_child_goal_keywords.some((keyword) => sourceIncludes(output, keyword)),
    ].filter(Boolean).length / 4,
  );
  const nextActionScore = keywordHitRate(output.next_action, task.next_action_keywords);
  const overclaimText = `${output.overclaim_boundary}\n${output.rationale}\n${output.next_action}`;
  const overclaimBoundaryScore = roundScore(
    [
      output.should_claim_productivity_lift === false,
      ...task.overclaim_keywords.map((keyword) => normalize(overclaimText).includes(normalize(keyword))),
    ].filter(Boolean).length /
      (task.overclaim_keywords.length + 1),
  );

  const metrics: MetricScores = {
    phase_routing_score: phaseRoutingScore,
    source_grounding_score: sourceGroundingScore,
    goal_alignment_score: goalAlignmentScore,
    next_action_score: nextActionScore,
    overclaim_boundary_score: overclaimBoundaryScore,
  };
  const score = averageScore(Object.values(metrics));

  return { parsed: output, score, metrics, parse_error: null };
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function writeFallbackFinalOutput(
  path: string,
  task: BenchmarkTaskDefinition,
  label: "baseline" | "assisted",
  error: {
    reason: string;
    exitCode: number | null;
    timedOut: boolean;
    stderrPath: string;
  },
): void {
  writeText(
    path,
    `${JSON.stringify(
      {
        error: error.reason,
        task_id: task.task_id,
        label,
        exit_code: error.exitCode,
        timed_out: error.timedOut,
        stderr_path: relativeRuntimePath(error.stderrPath),
      },
      null,
      2,
    )}\n`,
  );
}

function buildPrompt(task: BenchmarkTaskDefinition, kind: "baseline" | "assisted", policy: LiveRunPolicy): string {
  const schemaInstruction =
    "Return only the JSON object requested by the provided schema. Do not edit files. Do not claim productivity lift unless benchmark evidence explicitly satisfies the lift gate.";
  const boundedWorkerInstruction =
    "Keep this worker run bounded. Inspect only files directly relevant to the task, prefer selector files when the repo points to them, and stop once you have enough source evidence to fill the schema.";

  if (kind === "baseline") {
    return `${schemaInstruction}

Task: ${task.prompt}

Baseline scope: ${policy.baseline_prompt_scope}.

${boundedWorkerInstruction}

Use normal Codex repo-reading judgment. Do not use the task source refs or task-specific KRN assisted guidance unless you independently find those files from the task and repo entry points.`;
  }

  const guidance = task.assisted_guidance.map((item) => `- ${item}`).join("\n");
  const sourceRefs = task.source_refs.map((sourceRef) => `- ${sourceRef}`).join("\n");

  return `${schemaInstruction}

Task: ${task.prompt}

${boundedWorkerInstruction}

Use KRN's project-local operating layer, but keep this worker run bounded. Read only the task source refs below unless one of those files directly points to a required immediate dependency.

Task source refs:
${sourceRefs}

Task-specific guidance:
${guidance}

In the final JSON source_refs field, include only files you actually used from the task source refs or their immediate required dependency.`;
}

function runCodexExec(
  task: BenchmarkTaskDefinition,
  label: "baseline" | "assisted",
  runDir: string,
  policy: LiveRunPolicy,
): CodexRunCapture {
  const stdoutPath = resolve(runDir, `${task.task_id}.${label}.stdout.jsonl`);
  const stderrPath = resolve(runDir, `${task.task_id}.${label}.stderr.txt`);
  const finalPath = resolve(runDir, `${task.task_id}.${label}.final.json`);
  const schemaPath = resolve("docs/evals/krn-benchmark-live-suite/codex-output.schema.json");
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
    buildPrompt(task, label, policy),
  ];

  const completed = spawnSync("codex", args, {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    timeout: policy.per_codex_exec_timeout_ms,
    maxBuffer: policy.max_codex_exec_output_buffer_bytes,
  });

  writeText(stdoutPath, completed.stdout ?? "");
  writeText(stderrPath, completed.stderr ?? "");

  let parsed: CodexSuiteOutput | null = null;
  let score = scoreOutput(task, {});
  let errorMessage: string | null = null;

  if (completed.error) {
    errorMessage = completed.error.message;
    writeFallbackFinalOutput(finalPath, task, label, {
      reason: completed.error.message,
      exitCode: completed.status,
      timedOut: completed.error.message.includes("ETIMEDOUT"),
      stderrPath,
    });
  } else if (!existsSync(finalPath)) {
    errorMessage = "codex exec did not write final JSON output";
    writeFallbackFinalOutput(finalPath, task, label, {
      reason: "missing_codex_final_output",
      exitCode: completed.status,
      timedOut: false,
      stderrPath,
    });
  } else {
    try {
      const finalOutput = readJson(finalPath);
      score = scoreOutput(task, finalOutput);
      parsed = score.parsed;
      errorMessage = score.parse_error;
    } catch (error: unknown) {
      errorMessage = error instanceof Error ? error.message : "unknown final JSON parse error";
    }
  }

  return {
    task,
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
      id: "repeat-clean-live-suite-stability",
      owner: "krn",
      next_action:
        "Repeat the explicit live-suite run under typed policy, then use the live-stability gate to decide suite-expansion review readiness without claiming productivity lift.",
      source_refs: [
        "docs/goals/goal-006.md",
        "docs/goals/goal-028.md",
        "docs/goals/goal-029.md",
        "docs/memory/product/2026-06-20--krn-benchmark-live-stability-readiness-gate.md",
        "docs/memory/product/2026-06-20--krn-benchmark-live-runner-stability-repair.md",
        "docs/memory/product/2026-06-20--krn-operating-architecture-and-memory-layers.md",
        "docs/specs/krn-benchmark-report/README.md",
        "docs/specs/krn-repair-record/README.md",
        "docs/evals/krn-benchmark-live-suite/README.md",
      ],
      failure_mode:
        "The live suite overclaims one clean or repeated clean three-task evidence as productivity lift, or expands before the live-stability gate classifies the current store.",
    },
  ];
}

function metricRows(
  task: BenchmarkTaskDefinition,
  baseline: MetricScores,
  assisted: MetricScores,
): KrnBenchmarkReport["tasks"][number]["metrics"] {
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
      source_refs: ["docs/evals/krn-benchmark-live-suite/tasks.json", ...task.source_refs],
      interpretation_caveat: "Metric score is deterministic for this suite task and does not prove productivity lift.",
    };
  });
}

function buildBenchmarkTasks(scorePairs: readonly TaskScorePair[]): KrnBenchmarkReport["tasks"] {
  return scorePairs.map((pair) => {
    const completed = pair.baseline.parsed !== null && pair.assisted.parsed !== null;
    return {
      task_id: pair.task.task_id,
      title: pair.task.title,
      status: completed ? "completed" : "failed",
      task_source_refs: pair.task.source_refs,
      baseline: {
        label: "baseline_codex",
        score: pair.baseline.score,
        evidence_refs: pair.baseline_evidence_refs,
        interpretation_caveat:
          "Baseline condition uses normal Codex repo-reading behavior; in this repo AGENTS.md may still influence the run.",
      },
      assisted: {
        label: "krn_assisted_codex",
        score: pair.assisted.score,
        evidence_refs: pair.assisted_evidence_refs,
        interpretation_caveat:
          "Assisted condition uses task-owned source refs and source-boundary guidance for the fixed task.",
      },
      assisted_minus_baseline: roundScore(pair.assisted.score - pair.baseline.score),
      metrics: metricRows(pair.task, pair.baseline.metrics, pair.assisted.metrics),
      repair_targets: completed ? [] : repairTargets(),
      interpretation_caveat:
        "This task contributes to suite-level routing and grounding evidence only; it is not standalone productivity proof.",
    };
  });
}

function buildBenchmarkReport(
  runId: string,
  now: Date,
  mode: EvalMode,
  registry: TaskRegistry,
  scorePairs: readonly TaskScorePair[],
): KrnBenchmarkReport {
  const tasks = buildBenchmarkTasks(scorePairs);
  const reportPath = `.krn/benchmarks/krn-benchmark-live-suite/${runId}/report.json`;
  const measurementMode = mode === "live" ? "live_codex_exec" : "fixture_contract";
  const report = {
    schema_version: "krn-benchmark-report.v1",
    kind: "krn_benchmark_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: process.cwd(),
    benchmark_id: registry.benchmark_id,
    suite_id: registry.suite_id,
    measurement_mode: measurementMode,
    baseline_label: "baseline_codex",
    assisted_label: "krn_assisted_codex",
    minimum_task_count_for_lift_claim: registry.minimum_task_count_for_lift_claim,
    productivity_lift_claimed: false,
    lift_status: "no_lift_evidence",
    task_count: tasks.length,
    completed_task_count: tasks.filter((task) => task.status === "completed").length,
    blocked_task_count: tasks.filter((task) => task.status === "blocked").length,
    failed_task_count: tasks.filter((task) => task.status === "failed").length,
    baseline_score: averageScore(tasks.map((task) => task.baseline.score)),
    assisted_score: averageScore(tasks.map((task) => task.assisted.score)),
    assisted_minus_baseline: roundScore(
      averageScore(tasks.map((task) => task.assisted.score)) - averageScore(tasks.map((task) => task.baseline.score)),
    ),
    tasks,
    repair_targets: repairTargets(),
    benchmark_report_path: reportPath,
    source_refs: [
      "docs/goals/goal-006.md",
      "docs/goals/goal-020.md",
      "docs/goals/goal-021.md",
      "docs/goals/goal-022.md",
      "docs/goals/goal-023.md",
      "docs/goals/goal-024.md",
      "docs/goals/goal-025.md",
      "docs/goals/goal-026.md",
      "docs/goals/goal-027.md",
      "docs/goals/goal-028.md",
      "docs/goals/goal-029.md",
      "docs/memory/product/2026-06-20--krn-benchmark-current-child-repair-attempt.md",
      "docs/memory/product/2026-06-20--krn-benchmark-assisted-prompt-load-repair.md",
      "docs/memory/product/2026-06-20--krn-benchmark-lift-status-stability-gate.md",
      "docs/memory/product/2026-06-20--krn-benchmark-live-stability-readiness-gate.md",
      "docs/memory/product/2026-06-20--krn-benchmark-live-runner-stability-repair.md",
      "docs/memory/product/2026-06-20--krn-operating-architecture-and-memory-layers.md",
      "docs/specs/krn-benchmark-report/README.md",
      "docs/specs/krn-repair-record/README.md",
      "docs/evals/krn-benchmark-live-suite/README.md",
      "docs/evals/krn-benchmark-live-suite/tasks.json",
      "docs/evals/STANDARD.md",
      "docs/plans/canonical/SOURCES.md",
    ],
    interpretation_caveat:
      mode === "live"
        ? "This live suite proves only a multi-task codex exec benchmark path and live-suite registry/policy measurement; three tasks remain below the 20-task lift gate and do not prove measured productivity lift, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality."
        : "This fixture-contract suite proves only deterministic parser/scorer/report behavior for the live-suite registry/policy benchmark suite; fixture data and three tasks do not prove measured productivity lift, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.",
  } satisfies KrnBenchmarkReport;

  return parseKrnBenchmarkReport(report);
}

function writeBenchmarkReport(report: KrnBenchmarkReport): string {
  const reportPath = resolve(report.benchmark_report_path);
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function buildFixtureScorePairs(registry: TaskRegistry): TaskScorePair[] {
  return registry.tasks.map((task) => ({
    task,
    baseline: scoreOutput(task, readJson(resolve(task.fixture_baseline_path))),
    assisted: scoreOutput(task, readJson(resolve(task.fixture_assisted_path))),
    baseline_evidence_refs: [task.fixture_baseline_path],
    assisted_evidence_refs: [task.fixture_assisted_path],
  }));
}

function buildLiveScorePairs(registry: TaskRegistry, runDir: string): TaskScorePair[] {
  return registry.tasks.map((task) => {
    const baseline = runCodexExec(task, "baseline", runDir, registry.live_run_policy);
    const assisted = runCodexExec(task, "assisted", runDir, registry.live_run_policy);
    return {
      task,
      baseline: baseline.score,
      assisted: assisted.score,
      baseline_evidence_refs: [
        relativeRuntimePath(baseline.stdout_path),
        relativeRuntimePath(baseline.stderr_path),
        relativeRuntimePath(baseline.final_path),
      ],
      assisted_evidence_refs: [
        relativeRuntimePath(assisted.stdout_path),
        relativeRuntimePath(assisted.stderr_path),
        relativeRuntimePath(assisted.final_path),
      ],
    };
  });
}

function runValidation(mode: EvalMode): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-benchmark-live-suite/cases.json")));
  const registry = parseTaskRegistry(readJson(resolve("docs/evals/krn-benchmark-live-suite/tasks.json")));
  const results: CaseResult[] = [];
  let generatedBenchmarkReportPath: string | null = null;

  const registryCase = caseById(cases, "task-registry-parses");
  results.push(
    result(
      registryCase.id,
      registry.tasks.length >= 3 && registry.minimum_task_count_for_lift_claim >= 20,
      ["task registry parses", "task count is at least three", "minimum lift gate is at least twenty"],
      registryCase.failure_mode,
      `Registry ${registry.suite_id} has ${registry.tasks.length} tasks and lift gate ${registry.minimum_task_count_for_lift_claim}.`,
    ),
  );

  const currentContextCase = caseById(cases, "task-registry-current-context-and-run-policy");
  const registryHasCurrentContext = registry.tasks.every(
    (task) =>
      task.source_refs.includes(task.current_child_goal_ref) &&
      task.required_source_ref_keywords.includes(task.current_child_goal_ref) &&
      task.latest_child_goal_keywords.includes(task.current_child_goal_ref) &&
      task.superseded_latest_child_goal_refs.every(
        (supersededRef) =>
          !includesAny(task.latest_child_goal_keywords.join("\n"), [supersededRef]) &&
          !(
            includesAny(task.assisted_guidance.join("\n"), ["latest"]) &&
            includesAny(task.assisted_guidance.join("\n"), [supersededRef])
          ),
      ),
  );
  const policy = registry.live_run_policy;
  results.push(
    result(
      currentContextCase.id,
      registryHasCurrentContext &&
        policy.execution_order === "sequential_task_baseline_then_assisted" &&
        policy.max_concurrent_codex_exec_runs === 1 &&
        policy.per_codex_exec_timeout_ms > 0 &&
        policy.max_codex_exec_output_buffer_bytes >= 1_048_576 &&
        policy.baseline_prompt_scope === "bounded_task_relevant_repo_reading" &&
        policy.timeout_result === "failed_task_no_lift",
      [
        "task registry names current child context",
        "task registry rejects stale latest-child guidance",
        "live runner policy is sequential",
        "live runner concurrency is one",
        "live runner timeout is typed",
        "live runner output buffer is typed",
        "baseline prompt scope is bounded",
        "timeout result preserves no-lift classification",
      ],
      currentContextCase.failure_mode,
      `Registry policy: order=${policy.execution_order}, max_concurrent=${policy.max_concurrent_codex_exec_runs}, timeout_ms=${policy.per_codex_exec_timeout_ms}, max_buffer_bytes=${policy.max_codex_exec_output_buffer_bytes}, baseline_scope=${policy.baseline_prompt_scope}.`,
    ),
  );

  const fixturePairs = buildFixtureScorePairs(registry);
  const fixtureCase = caseById(cases, "fixture-suite-scores-assisted");
  const baselineAverage = averageScore(fixturePairs.map((pair) => pair.baseline.score));
  const assistedAverage = averageScore(fixturePairs.map((pair) => pair.assisted.score));
  results.push(
    result(
      fixtureCase.id,
      fixturePairs.every((pair) => pair.baseline.parsed !== null) &&
        fixturePairs.every((pair) => pair.assisted.parsed !== null) &&
        assistedAverage > baselineAverage &&
        fixturePairs.every((pair) => Object.keys(pair.assisted.metrics).length === 5),
      ["all baseline fixtures parse", "all assisted fixtures parse", "assisted average score is higher", "all task metrics exist"],
      fixtureCase.failure_mode,
      `Fixture scores: baseline=${baselineAverage}, assisted=${assistedAverage}, delta=${roundScore(
        assistedAverage - baselineAverage,
      )}.`,
    ),
  );

  const badCase = caseById(cases, "known-bad-output-fails");
  const bad = scoreOutput(
    firstTask(registry),
    readJson(resolve("docs/evals/krn-benchmark-live-suite/fixtures/bad-output.example.json")),
  );
  results.push(
    result(
      badCase.id,
      bad.parsed !== null && bad.score < 0.6 && bad.parsed.should_claim_productivity_lift,
      ["known-bad output parses", "known-bad score is below pass threshold", "lift claim is penalized"],
      badCase.failure_mode,
      `Known-bad score: ${bad.score}.`,
    ),
  );

  const caveat =
    "This eval proves a multi-task benchmark suite harness only; it does not prove measured productivity lift, and a three-task suite remains below the 20-task benchmark lift gate.";

  if (mode === "validate") {
    const benchmarkReport = buildBenchmarkReport(runId, now, mode, registry, fixturePairs);
    generatedBenchmarkReportPath = writeBenchmarkReport(benchmarkReport);
    const shapeCase = caseById(cases, "validate-report-shape");
    const parsedReport = parseKrnBenchmarkReport(readJson(generatedBenchmarkReportPath));
    results.push(
      result(
        shapeCase.id,
        existsSync(generatedBenchmarkReportPath) &&
          parsedReport.measurement_mode === "fixture_contract" &&
          parsedReport.task_count >= 3 &&
          !parsedReport.productivity_lift_claimed &&
          parsedReport.repair_targets.length > 0,
        [
          "generated benchmark report exists",
          "generated benchmark report parses",
          "measurement mode is fixture_contract",
          "task count is at least three",
          "productivity lift remains unclaimed",
          "repair target present",
        ],
        shapeCase.failure_mode,
        `Validate suite report: tasks=${parsedReport.task_count}, baseline=${parsedReport.baseline_score}, assisted=${parsedReport.assisted_score}, delta=${parsedReport.assisted_minus_baseline}.`,
      ),
    );
  }

  if (mode === "live") {
    const runDir = resolve(".krn/benchmarks/krn-benchmark-live-suite", runId);
    mkdirSync(runDir, { recursive: true });
    const livePairs = buildLiveScorePairs(registry, runDir);
    const benchmarkReport = buildBenchmarkReport(runId, now, mode, registry, livePairs);
    generatedBenchmarkReportPath = writeBenchmarkReport(benchmarkReport);
    const parsedReport = parseKrnBenchmarkReport(readJson(generatedBenchmarkReportPath));

    const liveShapeCase = caseById(cases, "live-report-shape");
    const allEvidenceFilesExist = parsedReport.tasks.every((task) =>
      [...task.baseline.evidence_refs, ...task.assisted.evidence_refs].every((evidenceRef) =>
        existsSync(resolve(evidenceRef)),
      ),
    );
    results.push(
      result(
        liveShapeCase.id,
        parsedReport.tasks.every((task) => task.baseline.evidence_refs.length >= 3) &&
          parsedReport.tasks.every((task) => task.assisted.evidence_refs.length >= 3) &&
          allEvidenceFilesExist &&
          existsSync(generatedBenchmarkReportPath) &&
          parsedReport.measurement_mode === "live_codex_exec" &&
          parsedReport.task_count >= 3 &&
          !parsedReport.productivity_lift_claimed &&
          parsedReport.repair_targets.length > 0,
        [
          "baseline codex exec runs captured",
          "assisted codex exec runs captured",
          "captured evidence files exist",
          "generated benchmark report exists",
          "generated benchmark report parses",
          "measurement mode is live_codex_exec",
          "task count is at least three",
          "productivity lift remains unclaimed",
          "repair target present",
        ],
        liveShapeCase.failure_mode,
        `Live suite report: tasks=${parsedReport.task_count}, baseline=${parsedReport.baseline_score}, assisted=${parsedReport.assisted_score}, delta=${parsedReport.assisted_minus_baseline}.`,
      ),
    );

    const boundaryCase = caseById(cases, "live-overclaim-boundary");
    results.push(
      result(
        boundaryCase.id,
        caveat.includes("does not prove measured productivity lift") &&
          caveat.includes("three-task suite") &&
          caveat.includes("20-task"),
        [
          "eval report caveat names no productivity lift",
          "eval report caveat names the three-task limitation",
          "eval report caveat names the twenty-task gate",
        ],
        boundaryCase.failure_mode,
        "Live suite caveat preserves the three-task no-lift boundary.",
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
    schema_version: "krn-benchmark-live-suite-result.v1",
    kind: "krn_benchmark_live_suite_result",
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
  const reportDir = resolve(".krn/evals/krn-benchmark-live-suite", report.run_id);
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
