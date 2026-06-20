import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { parseKrnBenchmarkReport, type KrnBenchmarkReport } from "@krn/contracts";
import { z } from "zod";

type EvalMode = "validate" | "live-smoke" | "live-full";

const MODULE_ID = "krn-benchmark-expanded-arena";
const MODULE_DIR = `docs/evals/${MODULE_ID}`;
const BENCHMARK_DIR = `.krn/benchmarks/${MODULE_ID}`;
const TASK_REGISTRY_PATH = `${MODULE_DIR}/tasks.json`;
const CASES_PATH = `${MODULE_DIR}/cases.json`;
const CODEX_OUTPUT_SCHEMA_PATH = `${MODULE_DIR}/codex-output.schema.json`;
const BASELINE_SCORING_FIXTURE_PATH = `${MODULE_DIR}/fixtures/baseline-scoring-fixture.json`;
const ASSISTED_SCORING_FIXTURE_PATH = `${MODULE_DIR}/fixtures/assisted-scoring-fixture.json`;
const BAD_REGISTRY_FIXTURE_PATH = `${MODULE_DIR}/fixtures/bad-expanded-arena-tasks.json`;
const BAD_SCORING_FIXTURE_PATH = `${MODULE_DIR}/fixtures/bad-scoring-fixture-overclaims-lift.json`;

type EvalCase = {
  id: string;
  expected_behavior: string;
  assertions: string[];
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

type ArenaSummary = {
  arena_id: string;
  task_count: number;
  minimum_live_task_count_for_lift_claim: number;
  task_family_count: number;
  implementation_heavy_task_count: number;
  quality_metric_count: number;
  live_mode_explicit: boolean;
  next_allowed_action: string;
};

type ScoringSummary = {
  scored_task_count: number;
  baseline_score: number;
  assisted_score: number;
  assisted_minus_baseline: number;
  benchmark_report_path: string;
};

type LiveRunSummary = {
  mode: Exclude<EvalMode, "validate">;
  selected_task_count: number;
  completed_task_count: number;
  failed_task_count: number;
  benchmark_report_path: string;
  progress_log_path: string;
};

type EvalReport = {
  schema_version: "krn-benchmark-expanded-arena-result.v1";
  kind: "krn_benchmark_expanded_arena_result";
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
  validated_task_registry_path: string | null;
  generated_benchmark_report_path: string | null;
  arena_summary: ArenaSummary | null;
  scoring_summary: ScoringSummary | null;
  live_run_summary: LiveRunSummary | null;
  interpretation_caveat: string;
};

const REQUIRED_SOURCE_REFS = [
  "docs/goals/goal-006.md",
  "docs/goals/goal-034.md",
  "docs/goals/goal-033.md",
  "docs/goals/goal-031.md",
  "docs/evals/krn-benchmark-arena-contract/arena-contract.example.json",
  "docs/memory/evals/2026-06-20--coding-quality-rubric.md",
  "docs/memory/product/2026-06-20--krn-benchmark-arena-contract.md",
  "docs/plans/canonical/SOURCES.md",
  "docs/evals/STANDARD.md",
];

const REQUIRED_QUALITY_METRICS = [
  "assumption_clarity_score",
  "simplicity_score",
  "surgical_diff_score",
  "verification_coverage_score",
  "review_burden_score",
  "source_grounding_score",
  "goal_alignment_score",
  "anti_slop_score",
];

const REQUIRED_TASK_FAMILIES = [
  "implementation",
  "debugging",
  "refactor",
  "review",
  "continuity_after_compaction",
  "benchmark_repair",
];

const IMPLEMENTATION_HEAVY_FAMILIES = ["implementation", "debugging", "refactor", "benchmark_repair"];

const ScoreSchema = z.number().min(0).max(1);

const TaskFamilySchema = z.enum([
  "implementation",
  "debugging",
  "refactor",
  "review",
  "continuity_after_compaction",
  "benchmark_repair",
]);

const TaskSchema = z
  .object({
    task_id: z.string().min(1),
    family: TaskFamilySchema,
    title: z.string().min(1),
    prompt: z.string().min(1),
    source_refs: z.array(z.string().min(1)).min(1),
    assisted_guidance: z.array(z.string().min(1)).min(1),
    required_metrics: z.array(z.string().min(1)).min(5),
    acceptance_keywords: z.array(z.string().min(1)).min(1),
    overclaim_keywords: z.array(z.string().min(1)).min(1),
  })
  .strict();

const ScoringFixtureSchema = z
  .object({
    schema_version: z.literal("krn-benchmark-expanded-arena-scoring-fixture.v1"),
    kind: z.literal("krn_benchmark_expanded_arena_scoring_fixture"),
    label: z.enum(["baseline_codex", "krn_assisted_codex"]),
    task_ids: z.array(z.string().min(1)).min(1),
    metric_scores: z.record(z.string().min(1), ScoreSchema),
    evidence_refs: z.array(z.string().min(1)).min(1),
    productivity_lift_claimed: z.literal(false),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

const CodexArenaOutputSchema = z
  .object({
    task_id: z.string().min(1),
    status: z.enum(["completed", "blocked", "failed"]),
    source_refs: z.array(z.string().min(1)).min(1),
    changed_files: z.array(z.string().min(1)),
    verification_commands: z.array(z.string().min(1)),
    assumptions: z.array(z.string().min(1)),
    implementation_summary: z.string().min(1),
    overclaim_boundary: z.string().min(1),
    productivity_lift_claimed: z.boolean(),
  })
  .strict();

const ExpandedArenaRegistrySchema = z
  .object({
    schema_version: z.literal("krn-benchmark-expanded-arena-tasks.v1"),
    kind: z.literal("krn_benchmark_expanded_arena_registry"),
    benchmark_id: z.literal("krn-benchmark-expanded-arena"),
    arena_id: z.literal("krn-expanded-autoresearch-arena"),
    contract_ref: z.literal("docs/evals/krn-benchmark-arena-contract/arena-contract.example.json"),
    parent_goal_ref: z.literal("docs/goals/goal-006.md"),
    current_child_goal_ref: z.literal("docs/goals/goal-034.md"),
    latest_completed_child_goal_ref: z.literal("docs/goals/goal-033.md"),
    minimum_live_task_count_for_lift_claim: z.literal(20),
    initial_task_count: z.literal(20),
    source_refs: z.array(z.string().min(1)).min(REQUIRED_SOURCE_REFS.length),
    measurement_modes: z
      .object({
        default_eval_includes_live: z.literal(false),
        supported_modes: z.array(z.enum(["fixture_contract", "live_codex_exec"])).min(2),
        live_mode_requires_explicit_command: z.literal(true),
        separate_fixture_and_live_stores_required: z.literal(true),
      })
      .strict(),
    live_execution_policy: z
      .object({
        max_concurrent_codex_exec_runs: z.literal(1),
        concurrency_expansion_requires_separate_eval: z.literal(true),
        resume_completed_workers_required: z.literal(true),
        progress_log_required: z.literal(true),
        isolation: z.literal("temporary_git_worktree_per_worker"),
        codex_sandbox: z.literal("workspace-write"),
        per_codex_exec_timeout_ms: z.number().int().min(60_000).max(240_000),
        max_codex_exec_output_buffer_bytes: z.number().int().min(1_048_576).max(64_000_000),
        progress_log_path_pattern: z.literal(".krn/benchmarks/krn-benchmark-expanded-arena/{run_id}/progress.jsonl"),
        sync_foreground_changes_to_worker_worktree: z.literal(true),
        smoke_task_id: z.literal("release-verifier-finding-review"),
        bounded_smoke_input_ref: z.literal(
          "docs/evals/krn-benchmark-expanded-arena/fixtures/live-smoke-release-claim.md",
        ),
      })
      .strict(),
    pipeline_ergonomics: z
      .object({
        progress_log_required: z.literal(true),
        resume_completed_workers_required: z.literal(true),
        quick_smoke_lane_required: z.literal(true),
        full_suite_lane_required: z.literal(true),
        separate_fixture_and_live_evidence_required: z.literal(true),
      })
      .strict(),
    quality_rubric: z
      .object({
        required_metrics: z.array(z.string().min(1)).min(REQUIRED_QUALITY_METRICS.length),
        minimum_metrics_per_task: z.literal(5),
        review_burden_metric_required: z.literal(true),
      })
      .strict(),
    task_mix: z
      .object({
        required_task_families: z.array(z.string().min(1)).min(REQUIRED_TASK_FAMILIES.length),
        minimum_implementation_heavy_tasks: z.number().int().min(8),
        implementation_heavy_families: z.array(z.string().min(1)).min(IMPLEMENTATION_HEAVY_FAMILIES.length),
      })
      .strict(),
    tasks: z.array(TaskSchema).length(20),
  })
  .strict()
  .superRefine((registry, context) => {
    addMissingIssues(context, "source_refs", registry.source_refs, REQUIRED_SOURCE_REFS);
    addMissingIssues(context, "quality_rubric.required_metrics", registry.quality_rubric.required_metrics, REQUIRED_QUALITY_METRICS);
    addMissingIssues(context, "task_mix.required_task_families", registry.task_mix.required_task_families, REQUIRED_TASK_FAMILIES);
    addMissingIssues(
      context,
      "task_mix.implementation_heavy_families",
      registry.task_mix.implementation_heavy_families,
      IMPLEMENTATION_HEAVY_FAMILIES,
    );

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

      addMissingIssues(context, `tasks.${index}.source_refs`, task.source_refs, [registry.parent_goal_ref]);
      addMissingIssues(context, `tasks.${index}.required_metrics`, task.required_metrics, []);

      if (task.required_metrics.length < registry.quality_rubric.minimum_metrics_per_task) {
        context.addIssue({
          code: "custom",
          path: ["tasks", index, "required_metrics"],
          message: `task ${task.task_id} must define at least ${registry.quality_rubric.minimum_metrics_per_task} metrics`,
        });
      }

      for (const metric of task.required_metrics) {
        if (!registry.quality_rubric.required_metrics.includes(metric)) {
          context.addIssue({
            code: "custom",
            path: ["tasks", index, "required_metrics"],
            message: `unsupported metric ${metric}`,
          });
        }
      }
    }
  });

type ExpandedArenaRegistry = z.infer<typeof ExpandedArenaRegistrySchema>;
type ScoringFixture = z.infer<typeof ScoringFixtureSchema>;
type ScoringFixtureLabel = ScoringFixture["label"];
type CodexArenaOutput = z.infer<typeof CodexArenaOutputSchema>;
type ExpandedArenaTask = ExpandedArenaRegistry["tasks"][number];

type MetricScores = Record<string, number>;

type ScoredOutput = {
  parsed: CodexArenaOutput | null;
  score: number;
  metrics: MetricScores;
  parse_error: string | null;
};

type WorkerCapture = {
  task: ExpandedArenaTask;
  label: "baseline" | "assisted";
  exit_code: number | null;
  timed_out: boolean;
  worktree_path: string;
  stdout_path: string;
  stderr_path: string;
  final_path: string;
  status_path: string;
  patch_path: string;
  changed_files: string[];
  parsed: CodexArenaOutput | null;
  score: ScoredOutput;
  error_message: string | null;
};

type LiveScorePair = {
  task: ExpandedArenaTask;
  baseline: ScoredOutput;
  assisted: ScoredOutput;
  baseline_evidence_refs: string[];
  assisted_evidence_refs: string[];
};

function addMissingIssues(context: z.RefinementCtx, path: string, actual: readonly string[], required: readonly string[]): void {
  for (const item of required) {
    if (!actual.includes(item)) {
      context.addIssue({
        code: "custom",
        path: path.split("."),
        message: `${path} must include ${item}`,
      });
    }
  }
}

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
    const assertions = record.assertions;
    const metrics = record.metrics;
    const failureMode = record.failure_mode;

    if (typeof id !== "string" || id.length === 0) {
      throw new Error(`case ${index} missing id`);
    }
    if (typeof expectedBehavior !== "string" || expectedBehavior.length === 0) {
      throw new Error(`case ${id} missing expected_behavior`);
    }
    if (!Array.isArray(assertions) || !assertions.every((assertion) => typeof assertion === "string" && assertion.length > 0)) {
      throw new Error(`case ${id} missing assertions`);
    }
    if (!Array.isArray(metrics) || !metrics.every((metric) => typeof metric === "string" && metric.length > 0)) {
      throw new Error(`case ${id} missing metrics`);
    }
    if (typeof failureMode !== "string" || failureMode.length === 0) {
      throw new Error(`case ${id} missing failure_mode`);
    }

    return { id, expected_behavior: expectedBehavior, assertions, metrics, failure_mode: failureMode };
  });
}

function parseRegistry(input: unknown): ExpandedArenaRegistry {
  return ExpandedArenaRegistrySchema.parse(input);
}

function parseScoringFixture(input: unknown): ScoringFixture {
  return ScoringFixtureSchema.parse(input);
}

function parseMode(argv: readonly string[]): EvalMode {
  const modeIndex = argv.indexOf("--mode");
  if (modeIndex === -1) {
    return "validate";
  }

  const mode = argv[modeIndex + 1];
  if (mode !== "validate" && mode !== "live-smoke" && mode !== "live-full") {
    throw new Error(`Unsupported mode: ${mode ?? "<missing>"}`);
  }

  return mode;
}

function parseRunId(argv: readonly string[]): string | null {
  const runIdIndex = argv.indexOf("--run-id");
  if (runIdIndex === -1) {
    return null;
  }

  const runId = argv[runIdIndex + 1];
  if (!runId) {
    throw new Error("--run-id requires a value");
  }
  return runId;
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

function uniqueValues(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function includesAll(values: readonly string[], required: readonly string[]): boolean {
  return required.every((item) => values.includes(item));
}

function exactSet(values: readonly string[], expected: readonly string[]): boolean {
  return values.length === expected.length && includesAll(values, expected);
}

function taskFamilySet(registry: ExpandedArenaRegistry): string[] {
  return uniqueValues(registry.tasks.map((task) => task.family));
}

function taskMetricSet(registry: ExpandedArenaRegistry): string[] {
  return uniqueValues(registry.tasks.flatMap((task) => task.required_metrics));
}

function implementationHeavyTaskCount(registry: ExpandedArenaRegistry): number {
  return registry.tasks.filter((task) => IMPLEMENTATION_HEAVY_FAMILIES.includes(task.family)).length;
}

function taskIdsAreUnique(registry: ExpandedArenaRegistry): boolean {
  return new Set(registry.tasks.map((task) => task.task_id)).size === registry.tasks.length;
}

function liveModeExplicit(registry: ExpandedArenaRegistry): boolean {
  return !registry.measurement_modes.default_eval_includes_live && registry.measurement_modes.live_mode_requires_explicit_command;
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

function zeroMetricScores(task: ExpandedArenaTask): MetricScores {
  return Object.fromEntries(task.required_metrics.map((metricId) => [metricId, 0]));
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

function sourceHitRate(output: CodexArenaOutput, task: ExpandedArenaTask): number {
  return roundScore(
    task.source_refs.filter((sourceRef) =>
      output.source_refs.some((usedSourceRef) => normalize(usedSourceRef).includes(normalize(sourceRef))),
    ).length / task.source_refs.length,
  );
}

function verificationScore(output: CodexArenaOutput): number {
  if (output.verification_commands.length === 0) {
    return 0;
  }

  const verificationText = output.verification_commands.join("\n");
  return includesAny(verificationText, ["pnpm", "test", "typecheck", "eval", "tsc", "vitest"]) ? 1 : 0.5;
}

function simplicityScore(changedFiles: readonly string[]): number {
  if (changedFiles.length === 0) {
    return 0.4;
  }
  if (changedFiles.length <= 2) {
    return 1;
  }
  if (changedFiles.length <= 5) {
    return 0.7;
  }
  return 0.2;
}

function surgicalDiffScore(changedFiles: readonly string[]): number {
  if (changedFiles.length === 0) {
    return 0.3;
  }
  if (changedFiles.length <= 3) {
    return 1;
  }
  if (changedFiles.length <= 6) {
    return 0.6;
  }
  return 0.2;
}

function antiSlopScore(output: CodexArenaOutput, task: ExpandedArenaTask, changedFiles: readonly string[]): number {
  const boundaryText = `${output.overclaim_boundary}\n${output.implementation_summary}`;
  const overclaimHits = task.overclaim_keywords.filter((keyword) => includesAny(boundaryText, [keyword])).length;
  return roundScore(
    [
      output.productivity_lift_claimed === false,
      output.status !== "completed" || changedFiles.length <= 6,
      overclaimHits > 0,
    ].filter(Boolean).length / 3,
  );
}

function scoreLiveOutput(task: ExpandedArenaTask, input: unknown, changedFiles: readonly string[]): ScoredOutput {
  const parsed = CodexArenaOutputSchema.safeParse(input);
  if (!parsed.success) {
    return {
      parsed: null,
      score: 0,
      metrics: zeroMetricScores(task),
      parse_error: parsed.error.message,
    };
  }

  const output = parsed.data;
  const summaryText = `${output.implementation_summary}\n${output.overclaim_boundary}\n${output.verification_commands.join("\n")}`;
  const allMetrics: Record<string, number> = {
    assumption_clarity_score: output.assumptions.length > 0 ? 1 : 0,
    simplicity_score: simplicityScore(changedFiles),
    surgical_diff_score: surgicalDiffScore(changedFiles),
    verification_coverage_score: verificationScore(output),
    review_burden_score: output.status === "completed" && changedFiles.length <= 5 ? 1 : 0.3,
    source_grounding_score: sourceHitRate(output, task),
    goal_alignment_score: roundScore(
      [
        output.task_id === task.task_id,
        output.status === "completed",
        keywordHitRate(summaryText, task.acceptance_keywords) > 0,
        output.productivity_lift_claimed === false,
      ].filter(Boolean).length / 4,
    ),
    anti_slop_score: antiSlopScore(output, task, changedFiles),
  };
  const metrics = Object.fromEntries(task.required_metrics.map((metricId) => [metricId, allMetrics[metricId] ?? 0]));
  const score = averageScore(Object.values(metrics));

  return { parsed: output, score, metrics, parse_error: null };
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function appendProgress(progressLogPath: string, event: Record<string, unknown>): void {
  const line = JSON.stringify({ created_at: new Date().toISOString(), ...event });
  mkdirSync(dirname(progressLogPath), { recursive: true });
  writeFileSync(progressLogPath, `${line}\n`, { encoding: "utf8", flag: "a" });
}

function relativeRuntimePath(path: string): string {
  const root = `${process.cwd()}/`;
  return path.startsWith(root) ? path.slice(root.length) : path;
}

function parseChangedFiles(statusText: string): string[] {
  return statusText
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => {
      const pathText = line.length > 3 ? line.slice(3).trim() : line.trim();
      const renameParts = pathText.split(" -> ");
      return renameParts[renameParts.length - 1] ?? pathText;
    });
}

function packageScripts(): Record<string, string> {
  const packageJson = readJson(resolve("package.json"));
  if (!packageJson || typeof packageJson !== "object") {
    throw new Error("package.json must be an object");
  }

  const scripts = (packageJson as Record<string, unknown>).scripts;
  if (!scripts || typeof scripts !== "object") {
    throw new Error("package.json scripts must be an object");
  }

  return Object.fromEntries(
    Object.entries(scripts as Record<string, unknown>).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function writeFallbackFinalOutput(
  path: string,
  task: ExpandedArenaTask,
  error: {
    reason: string;
    changedFiles: readonly string[];
  },
): void {
  writeText(
    path,
    `${JSON.stringify(
      {
        task_id: task.task_id,
        status: "failed",
        source_refs: ["docs/evals/krn-benchmark-expanded-arena/tasks.json"],
        changed_files: error.changedFiles,
        verification_commands: [],
        assumptions: ["The worker did not produce schema-constrained final output."],
        implementation_summary: error.reason,
        overclaim_boundary: "This failed worker output proves no productivity lift.",
        productivity_lift_claimed: false,
      },
      null,
      2,
    )}\n`,
  );
}

function summarizeArena(registry: ExpandedArenaRegistry): ArenaSummary {
  return {
    arena_id: registry.arena_id,
    task_count: registry.tasks.length,
    minimum_live_task_count_for_lift_claim: registry.minimum_live_task_count_for_lift_claim,
    task_family_count: taskFamilySet(registry).length,
    implementation_heavy_task_count: implementationHeavyTaskCount(registry),
    quality_metric_count: taskMetricSet(registry).length,
    live_mode_explicit: liveModeExplicit(registry),
    next_allowed_action: "run or review explicit live smoke/full runner evidence for this registry without claiming productivity lift",
  };
}

function scoringFixtureIsValid(
  fixture: ScoringFixture,
  registry: ExpandedArenaRegistry,
  expectedLabel: ScoringFixtureLabel,
): boolean {
  const taskIds = registry.tasks.map((task) => task.task_id);

  return (
    fixture.label === expectedLabel &&
    exactSet(fixture.task_ids, taskIds) &&
    includesAll(Object.keys(fixture.metric_scores), registry.quality_rubric.required_metrics) &&
    fixture.productivity_lift_claimed === false
  );
}

function requiredMetricScore(fixture: ScoringFixture, metricId: string): number {
  const score = fixture.metric_scores[metricId];
  if (score === undefined) {
    throw new Error(`scoring fixture ${fixture.label} missing metric ${metricId}`);
  }
  return score;
}

function taskScore(task: ExpandedArenaRegistry["tasks"][number], fixture: ScoringFixture): number {
  return averageScore(task.required_metrics.map((metricId) => requiredMetricScore(fixture, metricId)));
}

function repairTargets(): KrnBenchmarkReport["repair_targets"] {
  return [
    {
      id: "expanded-arena-live-runner",
      owner: "krn",
      next_action:
        "Keep expanded-arena live-smoke/live-full evidence below productivity claims until selected smoke tasks and full runner evidence complete cleanly.",
      source_refs: [
        "docs/goals/goal-006.md",
        "docs/goals/goal-034.md",
        "docs/goals/goal-032.md",
        "docs/goals/goal-033.md",
        "docs/evals/krn-benchmark-expanded-arena/tasks.json",
        "docs/evals/krn-benchmark-expanded-arena/fixtures/live-smoke-release-claim.md",
        "docs/memory/product/2026-06-20--krn-benchmark-expanded-arena-registry.md",
        "docs/plans/canonical/SOURCES.md",
      ],
      failure_mode:
        "A green smoke shape report, fixture delta, or partial live run is overclaimed as live expanded execution or used to justify dashboard/API controls before clean live runner evidence exists.",
    },
  ];
}

function metricRows(
  task: ExpandedArenaRegistry["tasks"][number],
  baseline: ScoringFixture,
  assisted: ScoringFixture,
): KrnBenchmarkReport["tasks"][number]["metrics"] {
  return task.required_metrics.map((metricId) => {
    const baselineScore = requiredMetricScore(baseline, metricId);
    const assistedScore = requiredMetricScore(assisted, metricId);
    return {
      metric_id: metricId,
      baseline_score: baselineScore,
      assisted_score: assistedScore,
      assisted_minus_baseline: roundScore(assistedScore - baselineScore),
      weight: 1,
      source_refs: ["docs/evals/krn-benchmark-expanded-arena/tasks.json", ...task.source_refs],
      interpretation_caveat:
        "Metric score is deterministic fixture scoring for this arena task and does not prove live productivity lift.",
    };
  });
}

function buildBenchmarkTasks(
  registry: ExpandedArenaRegistry,
  baseline: ScoringFixture,
  assisted: ScoringFixture,
): KrnBenchmarkReport["tasks"] {
  return registry.tasks.map((task) => {
    const baselineScore = taskScore(task, baseline);
    const assistedScore = taskScore(task, assisted);

    return {
      task_id: task.task_id,
      title: task.title,
      status: "completed",
      task_source_refs: task.source_refs,
      baseline: {
        label: "baseline_codex",
        score: baselineScore,
        evidence_refs: baseline.evidence_refs,
        interpretation_caveat:
          "Baseline fixture scores represent deterministic benchmark-scorer inputs only, not a live Codex run.",
      },
      assisted: {
        label: "krn_assisted_codex",
        score: assistedScore,
        evidence_refs: assisted.evidence_refs,
        interpretation_caveat:
          "Assisted fixture scores represent deterministic benchmark-scorer inputs only, not a live Codex run.",
      },
      assisted_minus_baseline: roundScore(assistedScore - baselineScore),
      metrics: metricRows(task, baseline, assisted),
      repair_targets: [],
      interpretation_caveat:
        "This task contributes deterministic fixture-scoring evidence only; it is not standalone productivity proof.",
    };
  });
}

function buildBenchmarkReport(
  runId: string,
  now: Date,
  registry: ExpandedArenaRegistry,
  baseline: ScoringFixture,
  assisted: ScoringFixture,
  reportFileName = "report.json",
): KrnBenchmarkReport {
  const tasks = buildBenchmarkTasks(registry, baseline, assisted);
  const reportPath = `${BENCHMARK_DIR}/${runId}/${reportFileName}`;
  const report = {
    schema_version: "krn-benchmark-report.v1",
    kind: "krn_benchmark_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: process.cwd(),
    benchmark_id: registry.benchmark_id,
    suite_id: registry.arena_id,
    measurement_mode: "fixture_contract",
    baseline_label: "baseline_codex",
    assisted_label: "krn_assisted_codex",
    minimum_task_count_for_lift_claim: registry.minimum_live_task_count_for_lift_claim,
    productivity_lift_claimed: false,
    lift_status: "no_lift_evidence",
    task_count: tasks.length,
    completed_task_count: tasks.length,
    blocked_task_count: 0,
    failed_task_count: 0,
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
      "docs/goals/goal-034.md",
      "docs/goals/goal-033.md",
      "docs/goals/goal-031.md",
      "docs/goals/goal-032.md",
      "docs/evals/krn-benchmark-expanded-arena/README.md",
      "docs/evals/krn-benchmark-expanded-arena/tasks.json",
      "docs/evals/krn-benchmark-expanded-arena/fixtures/baseline-scoring-fixture.json",
      "docs/evals/krn-benchmark-expanded-arena/fixtures/assisted-scoring-fixture.json",
      "docs/specs/krn-benchmark-report/README.md",
      "docs/plans/canonical/SOURCES.md",
    ],
    interpretation_caveat:
      "This fixture-contract expanded arena report proves deterministic scoring/report generation only; it does not prove live expanded execution, measured productivity lift, statistical validity, isolated coding-task runner safety, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.",
  } satisfies KrnBenchmarkReport;

  return parseKrnBenchmarkReport(report);
}

function writeBenchmarkReport(report: KrnBenchmarkReport): string {
  const reportPath = resolve(report.benchmark_report_path);
  mkdirSync(dirname(reportPath), { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  return reportPath;
}

function selectedLiveTasks(registry: ExpandedArenaRegistry, mode: Exclude<EvalMode, "validate">): ExpandedArenaTask[] {
  if (mode === "live-full") {
    return registry.tasks;
  }

  const smokeTask = registry.tasks.find((task) => task.task_id === registry.live_execution_policy.smoke_task_id);
  if (!smokeTask) {
    throw new Error(`missing smoke task ${registry.live_execution_policy.smoke_task_id}`);
  }
  return [smokeTask];
}

function buildLivePrompt(task: ExpandedArenaTask, label: "baseline" | "assisted"): string {
  const schemaInstruction =
    "Return only the JSON object requested by the provided schema. Do not commit changes. Do not claim productivity lift.";
  const workerBoundary =
    "You are running inside an isolated temporary Git worktree for benchmark evidence. Use relative paths in this worktree. Keep edits minimal and limited to this worktree. For review-only tasks, do not edit files unless the task explicitly asks for an edit.";
  const sourceRefs = task.source_refs.map((sourceRef) => `- ${sourceRef}`).join("\n");

  if (label === "baseline") {
    return `${schemaInstruction}

${workerBoundary}

Task: ${task.prompt}

Baseline condition:
- Start with the task source refs below; expand only when a listed source directly requires another file.
- Do not use the task-specific assisted guidance below unless you independently discover the same need from repo files.
- If you edit files, keep the diff surgical and run the narrowest useful verification command.

Task source refs:
${sourceRefs}

Final JSON requirements:
- task_id must be "${task.task_id}".
- source_refs should include only files you actually used.
- changed_files should list files you actually changed.
- productivity_lift_claimed must be false.`;
  }

  const guidance = task.assisted_guidance.map((item) => `- ${item}`).join("\n");

  return `${schemaInstruction}

${workerBoundary}

Task: ${task.prompt}

Assisted condition:
- Read only the task source refs below unless one directly points to an immediate dependency required to finish the task.
- Follow the task-specific guidance, but keep the diff minimal.
- If you edit files, run the narrowest useful verification command.

Task source refs:
${sourceRefs}

Task-specific guidance:
${guidance}

Final JSON requirements:
- task_id must be "${task.task_id}".
- source_refs should include only files you actually used.
- changed_files should list files you actually changed.
- productivity_lift_claimed must be false.`;
}

function createWorkerWorktree(runId: string, task: ExpandedArenaTask, label: "baseline" | "assisted"): string {
  const worktreePath = resolve(tmpdir(), "krn-expanded-arena-worktrees", runId, `${task.task_id}.${label}`);
  rmSync(worktreePath, { recursive: true, force: true });
  mkdirSync(dirname(worktreePath), { recursive: true });

  const completed = spawnSync("git", ["worktree", "add", "--detach", worktreePath, "HEAD"], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (completed.status !== 0) {
    throw new Error(completed.stderr || completed.stdout || `git worktree add failed with status ${completed.status}`);
  }

  materializeForegroundState(worktreePath);

  return worktreePath;
}

function foregroundStatusPaths(): Array<{ path: string; deleted: boolean }> {
  const completed = spawnSync("git", ["status", "--porcelain=v1", "--untracked-files=all"], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (completed.status !== 0) {
    throw new Error(completed.stderr || completed.stdout || `git status failed with status ${completed.status}`);
  }

  return completed.stdout
    .split("\n")
    .map((line) => line.trimEnd())
    .filter((line) => line.length > 0)
    .map((line) => {
      const status = line.slice(0, 2);
      const rawPath = line.slice(3);
      const renameParts = rawPath.split(" -> ");
      return {
        path: renameParts[renameParts.length - 1] ?? rawPath,
        deleted: status.includes("D"),
      };
    });
}

function materializeForegroundState(worktreePath: string): void {
  for (const entry of foregroundStatusPaths()) {
    const sourcePath = resolve(entry.path);
    const targetPath = resolve(worktreePath, entry.path);
    if (entry.deleted) {
      rmSync(targetPath, { recursive: true, force: true });
      continue;
    }
    if (!existsSync(sourcePath)) {
      continue;
    }
    mkdirSync(dirname(targetPath), { recursive: true });
    cpSync(sourcePath, targetPath, { recursive: true });
  }

  const add = spawnSync("git", ["add", "-A"], {
    cwd: worktreePath,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (add.status !== 0) {
    throw new Error(add.stderr || add.stdout || `git add failed with status ${add.status}`);
  }

  const hasChanges = spawnSync("git", ["diff", "--cached", "--quiet"], {
    cwd: worktreePath,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (hasChanges.status === 0) {
    return;
  }
  if (hasChanges.status !== 1) {
    throw new Error(hasChanges.stderr || hasChanges.stdout || `git diff --cached failed with status ${hasChanges.status}`);
  }

  const commit = spawnSync(
    "git",
    [
      "-c",
      "user.name=krn-benchmark",
      "-c",
      "user.email=krn-benchmark@example.invalid",
      "commit",
      "-m",
      "benchmark: materialize foreground state",
    ],
    {
      cwd: worktreePath,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  if (commit.status !== 0) {
    throw new Error(commit.stderr || commit.stdout || `git commit failed with status ${commit.status}`);
  }
}

function removeWorkerWorktree(worktreePath: string): void {
  const completed = spawnSync("git", ["worktree", "remove", "--force", worktreePath], {
    cwd: process.cwd(),
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (completed.status !== 0) {
    rmSync(worktreePath, { recursive: true, force: true });
  }
}

function loadExistingWorkerCapture(
  task: ExpandedArenaTask,
  label: "baseline" | "assisted",
  paths: {
    stdoutPath: string;
    stderrPath: string;
    finalPath: string;
    statusPath: string;
    patchPath: string;
  },
): WorkerCapture | null {
  if (
    !existsSync(paths.stdoutPath) ||
    !existsSync(paths.stderrPath) ||
    !existsSync(paths.finalPath) ||
    !existsSync(paths.statusPath) ||
    !existsSync(paths.patchPath)
  ) {
    return null;
  }

  const changedFiles = parseChangedFiles(readFileSync(paths.statusPath, "utf8"));
  const finalOutput = readJson(paths.finalPath);
  const score = scoreLiveOutput(task, finalOutput, changedFiles);
  if (score.parsed?.status !== "completed") {
    return null;
  }

  return {
    task,
    label,
    exit_code: 0,
    timed_out: false,
    worktree_path: "resumed-from-existing-evidence",
    stdout_path: paths.stdoutPath,
    stderr_path: paths.stderrPath,
    final_path: paths.finalPath,
    status_path: paths.statusPath,
    patch_path: paths.patchPath,
    changed_files: changedFiles,
    parsed: score.parsed,
    score,
    error_message: score.parse_error,
  };
}

function runCodexWorker(
  runId: string,
  registry: ExpandedArenaRegistry,
  task: ExpandedArenaTask,
  label: "baseline" | "assisted",
  runDir: string,
  progressLogPath: string,
): WorkerCapture {
  const stdoutPath = resolve(runDir, `${task.task_id}.${label}.stdout.jsonl`);
  const stderrPath = resolve(runDir, `${task.task_id}.${label}.stderr.txt`);
  const finalPath = resolve(runDir, `${task.task_id}.${label}.final.json`);
  const statusPath = resolve(runDir, `${task.task_id}.${label}.status.txt`);
  const patchPath = resolve(runDir, `${task.task_id}.${label}.patch`);
  const existing = loadExistingWorkerCapture(task, label, { stdoutPath, stderrPath, finalPath, statusPath, patchPath });
  if (existing !== null) {
    appendProgress(progressLogPath, { event: "worker_resumed", task_id: task.task_id, label });
    return existing;
  }

  let worktreePath = "";
  let exitCode: number | null = null;
  let timedOut = false;
  let errorMessage: string | null = null;

  try {
    worktreePath = createWorkerWorktree(runId, task, label);
    appendProgress(progressLogPath, { event: "worker_started", task_id: task.task_id, label, worktree_path: worktreePath });

    const schemaPath = resolve(CODEX_OUTPUT_SCHEMA_PATH);
    const args = [
      "exec",
      "--json",
      "--ephemeral",
      "--sandbox",
      registry.live_execution_policy.codex_sandbox,
      "--config",
      'approval_policy="never"',
      "--output-schema",
      schemaPath,
      "--output-last-message",
      finalPath,
      "--add-dir",
      runDir,
      "-C",
      worktreePath,
      buildLivePrompt(task, label),
    ];
    const completed = spawnSync("codex", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      timeout: registry.live_execution_policy.per_codex_exec_timeout_ms,
      maxBuffer: registry.live_execution_policy.max_codex_exec_output_buffer_bytes,
    });

    exitCode = completed.status;
    timedOut = completed.error?.message.includes("ETIMEDOUT") ?? false;
    errorMessage = completed.error?.message ?? null;
    writeText(stdoutPath, completed.stdout ?? "");
    writeText(stderrPath, completed.stderr ?? "");
  } catch (error: unknown) {
    errorMessage = error instanceof Error ? error.message : "unknown worker setup error";
    writeText(stdoutPath, "");
    writeText(stderrPath, errorMessage);
  }

  const status = worktreePath
    ? spawnSync("git", ["status", "--short"], {
        cwd: worktreePath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      })
    : null;
  const diff = worktreePath
    ? spawnSync("git", ["diff", "--binary", "HEAD"], {
        cwd: worktreePath,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        maxBuffer: 32_000_000,
      })
    : null;
  const statusText = status?.stdout ?? "";
  const patchText = diff?.stdout ?? "";
  writeText(statusPath, statusText);
  writeText(patchPath, patchText);

  const changedFiles = parseChangedFiles(statusText);
  if (!existsSync(finalPath)) {
    writeFallbackFinalOutput(finalPath, task, {
      reason: errorMessage ?? "codex exec did not write final JSON output",
      changedFiles,
    });
  }

  let score = scoreLiveOutput(task, {}, changedFiles);
  let parsed: CodexArenaOutput | null = null;
  try {
    score = scoreLiveOutput(task, readJson(finalPath), changedFiles);
    parsed = score.parsed;
    errorMessage = errorMessage ?? score.parse_error;
  } catch (error: unknown) {
    errorMessage = error instanceof Error ? error.message : "unknown final JSON parse error";
  }

  if (worktreePath) {
    removeWorkerWorktree(worktreePath);
  }

  appendProgress(progressLogPath, {
    event: "worker_completed",
    task_id: task.task_id,
    label,
    exit_code: exitCode,
    timed_out: timedOut,
    changed_file_count: changedFiles.length,
    parsed: parsed !== null,
  });

  return {
    task,
    label,
    exit_code: exitCode,
    timed_out: timedOut,
    worktree_path: worktreePath,
    stdout_path: stdoutPath,
    stderr_path: stderrPath,
    final_path: finalPath,
    status_path: statusPath,
    patch_path: patchPath,
    changed_files: changedFiles,
    parsed,
    score,
    error_message: errorMessage,
  };
}

function buildLiveScorePairs(
  runId: string,
  registry: ExpandedArenaRegistry,
  mode: Exclude<EvalMode, "validate">,
  runDir: string,
  progressLogPath: string,
): LiveScorePair[] {
  return selectedLiveTasks(registry, mode).map((task) => {
    const baseline = runCodexWorker(runId, registry, task, "baseline", runDir, progressLogPath);
    const assisted = runCodexWorker(runId, registry, task, "assisted", runDir, progressLogPath);
    return {
      task,
      baseline: baseline.score,
      assisted: assisted.score,
      baseline_evidence_refs: [
        relativeRuntimePath(baseline.stdout_path),
        relativeRuntimePath(baseline.stderr_path),
        relativeRuntimePath(baseline.final_path),
        relativeRuntimePath(baseline.status_path),
        relativeRuntimePath(baseline.patch_path),
      ],
      assisted_evidence_refs: [
        relativeRuntimePath(assisted.stdout_path),
        relativeRuntimePath(assisted.stderr_path),
        relativeRuntimePath(assisted.final_path),
        relativeRuntimePath(assisted.status_path),
        relativeRuntimePath(assisted.patch_path),
      ],
    };
  });
}

function liveMetricRows(task: ExpandedArenaTask, baseline: MetricScores, assisted: MetricScores): KrnBenchmarkReport["tasks"][number]["metrics"] {
  return task.required_metrics.map((metricId) => {
    const baselineScore = baseline[metricId] ?? 0;
    const assistedScore = assisted[metricId] ?? 0;
    return {
      metric_id: metricId,
      baseline_score: baselineScore,
      assisted_score: assistedScore,
      assisted_minus_baseline: roundScore(assistedScore - baselineScore),
      weight: 1,
      source_refs: ["docs/evals/krn-benchmark-expanded-arena/tasks.json", ...task.source_refs],
      interpretation_caveat:
        "Metric score is deterministic live-runner scoring over captured worker output and patch/status evidence; it does not prove productivity lift.",
    };
  });
}

function buildLiveBenchmarkTasks(scorePairs: readonly LiveScorePair[]): KrnBenchmarkReport["tasks"] {
  return scorePairs.map((pair) => {
    const completed = pair.baseline.parsed?.status === "completed" && pair.assisted.parsed?.status === "completed";
    const blocked = pair.baseline.parsed?.status === "blocked" || pair.assisted.parsed?.status === "blocked";
    return {
      task_id: pair.task.task_id,
      title: pair.task.title,
      status: completed ? "completed" : blocked ? "blocked" : "failed",
      task_source_refs: pair.task.source_refs,
      baseline: {
        label: "baseline_codex",
        score: pair.baseline.score,
        evidence_refs: pair.baseline_evidence_refs,
        interpretation_caveat:
          "Baseline live worker uses normal Codex repo-reading behavior inside an isolated temporary worktree.",
      },
      assisted: {
        label: "krn_assisted_codex",
        score: pair.assisted.score,
        evidence_refs: pair.assisted_evidence_refs,
        interpretation_caveat:
          "Assisted live worker uses task-owned source refs and guidance inside an isolated temporary worktree.",
      },
      assisted_minus_baseline: roundScore(pair.assisted.score - pair.baseline.score),
      metrics: liveMetricRows(pair.task, pair.baseline.metrics, pair.assisted.metrics),
      repair_targets: completed ? [] : repairTargets(),
      interpretation_caveat:
        "This task contributes isolated live worker evidence only; it is not standalone productivity proof.",
    };
  });
}

function buildLiveBenchmarkReport(
  runId: string,
  now: Date,
  mode: Exclude<EvalMode, "validate">,
  registry: ExpandedArenaRegistry,
  scorePairs: readonly LiveScorePair[],
): KrnBenchmarkReport {
  const tasks = buildLiveBenchmarkTasks(scorePairs);
  const reportPath = `${BENCHMARK_DIR}/${runId}/report.json`;
  const report = {
    schema_version: "krn-benchmark-report.v1",
    kind: "krn_benchmark_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: process.cwd(),
    benchmark_id: registry.benchmark_id,
    suite_id: registry.arena_id,
    measurement_mode: "live_codex_exec",
    baseline_label: "baseline_codex",
    assisted_label: "krn_assisted_codex",
    minimum_task_count_for_lift_claim: registry.minimum_live_task_count_for_lift_claim,
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
      "docs/goals/goal-034.md",
      "docs/goals/goal-032.md",
      "docs/goals/goal-033.md",
      "docs/evals/krn-benchmark-expanded-arena/README.md",
      "docs/evals/krn-benchmark-expanded-arena/tasks.json",
      "docs/evals/krn-benchmark-expanded-arena/codex-output.schema.json",
      "docs/specs/krn-benchmark-report/README.md",
      "docs/plans/canonical/SOURCES.md",
    ],
    interpretation_caveat:
      mode === "live-smoke"
        ? "This expanded-arena live smoke report proves only the isolated live runner path for one selected task; it does not prove all 20 tasks ran, measured productivity lift, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality."
        : "This expanded-arena live full report can support future lift review only if all 20 tasks complete cleanly with positive delta; this report itself keeps productivity_lift_claimed false until reviewed.",
  } satisfies KrnBenchmarkReport;

  return parseKrnBenchmarkReport(report);
}

function runValidation(mode: EvalMode, runIdOverride: string | null = null): EvalReport {
  const now = new Date();
  const runId = runIdOverride ?? createRunId(now);
  const cases = parseCases(readJson(resolve(CASES_PATH)));
  const registryPath = TASK_REGISTRY_PATH;
  const results: CaseResult[] = [];
  let registry: ExpandedArenaRegistry | null = null;
  let arenaSummary: ArenaSummary | null = null;
  let generatedBenchmarkReportPath: string | null = null;
  let scoringSummary: ScoringSummary | null = null;
  let liveRunSummary: LiveRunSummary | null = null;

  const parseCase = caseById(cases, "expanded-arena-registry-parses");
  try {
    registry = parseRegistry(readJson(resolve(registryPath)));
    arenaSummary = summarizeArena(registry);
    results.push(
      result(
        parseCase.id,
        registry.contract_ref === "docs/evals/krn-benchmark-arena-contract/arena-contract.example.json" &&
          registry.parent_goal_ref === "docs/goals/goal-006.md" &&
          registry.current_child_goal_ref === "docs/goals/goal-034.md" &&
          registry.latest_completed_child_goal_ref === "docs/goals/goal-033.md" &&
          registry.source_refs.includes(registry.contract_ref),
        parseCase.assertions,
        parseCase.failure_mode,
        "Expanded arena registry parsed and preserved goal/contract anchors.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        parseCase.id,
        false,
        ["registry parses"],
        parseCase.failure_mode,
        error instanceof Error ? error.message : "unknown parse error",
      ),
    );
  }

  const gateCase = caseById(cases, "twenty-task-lift-gate");
  results.push(
    result(
      gateCase.id,
      registry !== null &&
        registry.tasks.length === 20 &&
        registry.initial_task_count === registry.tasks.length &&
        registry.minimum_live_task_count_for_lift_claim === 20 &&
        taskIdsAreUnique(registry),
      gateCase.assertions,
      gateCase.failure_mode,
      "Expanded arena registry contains 20 unique tasks and preserves the lift gate.",
    ),
  );

  const mixCase = caseById(cases, "task-mix-covers-coding-work");
  const families = registry === null ? [] : taskFamilySet(registry);
  results.push(
    result(
      mixCase.id,
      registry !== null &&
        includesAll(families, REQUIRED_TASK_FAMILIES) &&
        implementationHeavyTaskCount(registry) >= registry.task_mix.minimum_implementation_heavy_tasks &&
        registry.tasks.every((task) => REQUIRED_TASK_FAMILIES.includes(task.family)),
      mixCase.assertions,
      mixCase.failure_mode,
      "Expanded arena registry covers required coding task families.",
    ),
  );

  const rubricCase = caseById(cases, "quality-rubric-per-task");
  const metrics = registry === null ? [] : taskMetricSet(registry);
  results.push(
    result(
      rubricCase.id,
      registry !== null &&
        includesAll(metrics, REQUIRED_QUALITY_METRICS) &&
        registry.tasks.every((task) => task.required_metrics.length >= registry.quality_rubric.minimum_metrics_per_task) &&
        registry.tasks.every((task) => task.required_metrics.includes("review_burden_score")),
      rubricCase.assertions,
      rubricCase.failure_mode,
      "Expanded arena registry covers coding-quality and review-burden metrics.",
    ),
  );

  const pipelineCase = caseById(cases, "pipeline-and-live-boundary-preserved");
  results.push(
    result(
      pipelineCase.id,
      registry !== null &&
        !registry.measurement_modes.default_eval_includes_live &&
        registry.measurement_modes.live_mode_requires_explicit_command &&
        registry.measurement_modes.separate_fixture_and_live_stores_required &&
        registry.pipeline_ergonomics.progress_log_required &&
        registry.pipeline_ergonomics.resume_completed_workers_required &&
        registry.pipeline_ergonomics.quick_smoke_lane_required &&
        registry.pipeline_ergonomics.full_suite_lane_required &&
        registry.live_execution_policy.max_concurrent_codex_exec_runs === 1,
      pipelineCase.assertions,
      pipelineCase.failure_mode,
      "Expanded arena registry preserves explicit live boundary and resumable pipeline ergonomics.",
    ),
  );

  const modeCase = caseById(cases, "explicit-live-runner-modes-available");
  try {
    const scripts = packageScripts();
    results.push(
      result(
        modeCase.id,
        scripts["eval:krn-benchmark-expanded-arena"]?.includes("--mode validate") === true &&
          scripts["eval:krn-benchmark-expanded-arena:live-smoke"]?.includes("--mode live-smoke") === true &&
          scripts["eval:krn-benchmark-expanded-arena:live-full"]?.includes("--mode live-full") === true &&
          scripts["eval:krn-eval"]?.includes("validate-krn-eval.ts --mode validate") === true &&
          scripts["eval:krn-eval"]?.includes("live-smoke") !== true &&
          scripts["eval:krn-eval"]?.includes("live-full") !== true,
        modeCase.assertions,
        modeCase.failure_mode,
        "Expanded arena live-smoke/live-full scripts are explicit and default aggregate eval remains validate-only.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        modeCase.id,
        false,
        ["live runner scripts parse"],
        modeCase.failure_mode,
        error instanceof Error ? error.message : "unknown package script parse error",
      ),
    );
  }

  const isolationCase = caseById(cases, "isolated-live-runner-policy-preserved");
  results.push(
    result(
      isolationCase.id,
      registry !== null &&
        registry.live_execution_policy.isolation === "temporary_git_worktree_per_worker" &&
        registry.live_execution_policy.codex_sandbox === "workspace-write" &&
        registry.live_execution_policy.per_codex_exec_timeout_ms > 0 &&
        registry.live_execution_policy.max_codex_exec_output_buffer_bytes >= 1_048_576 &&
        registry.live_execution_policy.progress_log_path_pattern.includes("{run_id}") &&
        registry.live_execution_policy.sync_foreground_changes_to_worker_worktree &&
        registry.live_execution_policy.resume_completed_workers_required &&
        registry.live_execution_policy.max_concurrent_codex_exec_runs === 1,
      isolationCase.assertions,
      isolationCase.failure_mode,
      registry === null
        ? "Expanded arena registry did not parse."
        : `Live policy: isolation=${registry.live_execution_policy.isolation}, sandbox=${registry.live_execution_policy.codex_sandbox}, timeout_ms=${registry.live_execution_policy.per_codex_exec_timeout_ms}.`,
    ),
  );

  const boundedSmokeCase = caseById(cases, "bounded-live-smoke-review-input-preserved");
  const smokeTask =
    registry === null
      ? null
      : registry.tasks.find((task) => task.task_id === registry.live_execution_policy.smoke_task_id) ?? null;
  results.push(
    result(
      boundedSmokeCase.id,
      registry !== null &&
        smokeTask !== null &&
        registry.live_execution_policy.smoke_task_id === "release-verifier-finding-review" &&
        registry.live_execution_policy.bounded_smoke_input_ref ===
          "docs/evals/krn-benchmark-expanded-arena/fixtures/live-smoke-release-claim.md" &&
        existsSync(resolve(registry.live_execution_policy.bounded_smoke_input_ref)) &&
        smokeTask.prompt.includes(registry.live_execution_policy.bounded_smoke_input_ref) &&
        smokeTask.source_refs.includes(registry.live_execution_policy.bounded_smoke_input_ref) &&
        smokeTask.source_refs.includes(registry.current_child_goal_ref),
      boundedSmokeCase.assertions,
      boundedSmokeCase.failure_mode,
      registry === null || smokeTask === null
        ? "Expanded arena registry or smoke task did not parse."
        : `Smoke task ${smokeTask.task_id} uses bounded input ${registry.live_execution_policy.bounded_smoke_input_ref}.`,
    ),
  );

  const knownBadCase = caseById(cases, "known-bad-registry-fails");
  try {
    parseRegistry(readJson(resolve(BAD_REGISTRY_FIXTURE_PATH)));
    results.push(
      result(
        knownBadCase.id,
        false,
        knownBadCase.assertions,
        knownBadCase.failure_mode,
        "Known-bad expanded arena registry unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        knownBadCase.assertions,
        knownBadCase.failure_mode,
        "Known-bad small planning-only default-live registry failed as expected.",
      ),
    );
  }

  const scoringCase = caseById(cases, "fixture-scoring-builds-benchmark-report");
  try {
    const baselineFixturePath = BASELINE_SCORING_FIXTURE_PATH;
    const assistedFixturePath = ASSISTED_SCORING_FIXTURE_PATH;
    const baselineFixture = parseScoringFixture(readJson(resolve(baselineFixturePath)));
    const assistedFixture = parseScoringFixture(readJson(resolve(assistedFixturePath)));

    if (registry === null) {
      throw new Error("expanded arena registry did not parse");
    }

    const fixturesAreValid =
      scoringFixtureIsValid(baselineFixture, registry, "baseline_codex") &&
      scoringFixtureIsValid(assistedFixture, registry, "krn_assisted_codex");
    const fixtureReportFileName = mode === "validate" ? "report.json" : "fixture-report.json";
    const benchmarkReport = buildBenchmarkReport(runId, now, registry, baselineFixture, assistedFixture, fixtureReportFileName);
    const fixtureBenchmarkReportPath = writeBenchmarkReport(benchmarkReport);
    if (mode === "validate") {
      generatedBenchmarkReportPath = fixtureBenchmarkReportPath;
    }
    const parsedReport = parseKrnBenchmarkReport(readJson(fixtureBenchmarkReportPath));
    scoringSummary = {
      scored_task_count: parsedReport.task_count,
      baseline_score: parsedReport.baseline_score,
      assisted_score: parsedReport.assisted_score,
      assisted_minus_baseline: parsedReport.assisted_minus_baseline,
      benchmark_report_path: parsedReport.benchmark_report_path,
    };

    results.push(
      result(
        scoringCase.id,
        fixturesAreValid &&
          parsedReport.measurement_mode === "fixture_contract" &&
          parsedReport.task_count === 20 &&
          parsedReport.completed_task_count === 20 &&
          parsedReport.assisted_score > parsedReport.baseline_score &&
          parsedReport.productivity_lift_claimed === false &&
          parsedReport.lift_status === "no_lift_evidence" &&
          parsedReport.repair_targets.length > 0,
        [
          "baseline scoring fixture parses",
          "assisted scoring fixture parses",
          "scoring fixtures cover all twenty tasks",
          "generated benchmark report exists",
          "generated benchmark report parses",
          "measurement mode is fixture_contract",
          "task count is twenty",
          "completed task count is twenty",
          "assisted fixture score is higher",
          "productivity lift remains unclaimed",
          "repair target present",
        ],
        scoringCase.failure_mode,
        `Fixture benchmark report: tasks=${parsedReport.task_count}, baseline=${parsedReport.baseline_score}, assisted=${parsedReport.assisted_score}, delta=${parsedReport.assisted_minus_baseline}.`,
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        scoringCase.id,
        false,
        ["fixture scoring report builds"],
        scoringCase.failure_mode,
        error instanceof Error ? error.message : "unknown fixture scoring error",
      ),
    );
  }

  const badScoringCase = caseById(cases, "known-bad-scoring-fixture-fails");
  try {
    const badFixture = parseScoringFixture(
      readJson(resolve(BAD_SCORING_FIXTURE_PATH)),
    );
    results.push(
      result(
        badScoringCase.id,
        registry !== null && !scoringFixtureIsValid(badFixture, registry, "krn_assisted_codex"),
        ["known-bad scoring fixture rejected", "lift claim is blocked"],
        badScoringCase.failure_mode,
        "Known-bad scoring fixture parsed but failed registry coverage or no-lift validation.",
      ),
    );
  } catch {
    results.push(
      result(
        badScoringCase.id,
        true,
        ["known-bad scoring fixture rejected", "lift claim is blocked"],
        badScoringCase.failure_mode,
        "Known-bad scoring fixture failed as expected.",
      ),
    );
  }

  if (mode !== "validate") {
    const liveCase = caseById(cases, "live-runner-builds-smoke-report");
    try {
      if (registry === null) {
        throw new Error("expanded arena registry did not parse");
      }

      const runDir = resolve(BENCHMARK_DIR, runId);
      const progressLogPath = resolve(runDir, "progress.jsonl");
      mkdirSync(runDir, { recursive: true });
      appendProgress(progressLogPath, {
        event: "live_run_started",
        mode,
        selected_task_count: selectedLiveTasks(registry, mode).length,
      });
      const livePairs = buildLiveScorePairs(runId, registry, mode, runDir, progressLogPath);
      const benchmarkReport = buildLiveBenchmarkReport(runId, now, mode, registry, livePairs);
      generatedBenchmarkReportPath = writeBenchmarkReport(benchmarkReport);
      const parsedReport = parseKrnBenchmarkReport(readJson(generatedBenchmarkReportPath));
      liveRunSummary = {
        mode,
        selected_task_count: parsedReport.task_count,
        completed_task_count: parsedReport.completed_task_count,
        failed_task_count: parsedReport.failed_task_count,
        benchmark_report_path: parsedReport.benchmark_report_path,
        progress_log_path: relativeRuntimePath(progressLogPath),
      };
      appendProgress(progressLogPath, {
        event: "live_run_completed",
        mode,
        completed_task_count: parsedReport.completed_task_count,
        failed_task_count: parsedReport.failed_task_count,
      });

      const allEvidenceFilesExist = parsedReport.tasks.every((task) =>
        [...task.baseline.evidence_refs, ...task.assisted.evidence_refs].every((evidenceRef) =>
          existsSync(resolve(evidenceRef)),
        ),
      );
      results.push(
        result(
          liveCase.id,
          parsedReport.tasks.every((task) => task.baseline.evidence_refs.length >= 5) &&
            parsedReport.tasks.every((task) => task.assisted.evidence_refs.length >= 5) &&
            parsedReport.tasks.every((task) => task.baseline.evidence_refs.some((ref) => ref.endsWith(".status.txt"))) &&
            parsedReport.tasks.every((task) => task.assisted.evidence_refs.some((ref) => ref.endsWith(".patch"))) &&
            existsSync(progressLogPath) &&
            allEvidenceFilesExist &&
            existsSync(generatedBenchmarkReportPath) &&
            parsedReport.measurement_mode === "live_codex_exec" &&
            parsedReport.productivity_lift_claimed === false &&
            parsedReport.lift_status === "no_lift_evidence" &&
            parsedReport.repair_targets.length > 0,
          liveCase.assertions,
          liveCase.failure_mode,
          `Live ${mode} report: tasks=${parsedReport.task_count}, completed=${parsedReport.completed_task_count}, failed=${parsedReport.failed_task_count}, baseline=${parsedReport.baseline_score}, assisted=${parsedReport.assisted_score}, delta=${parsedReport.assisted_minus_baseline}.`,
        ),
      );
      if (mode === "live-smoke") {
        const completionCase = caseById(cases, "live-smoke-completes-bounded-review-task");
        results.push(
          result(
            completionCase.id,
            parsedReport.task_count === 1 &&
              parsedReport.completed_task_count === 1 &&
              parsedReport.failed_task_count === 0 &&
              parsedReport.tasks.every((task) => task.status === "completed") &&
              parsedReport.productivity_lift_claimed === false &&
              parsedReport.lift_status === "no_lift_evidence",
            completionCase.assertions,
            completionCase.failure_mode,
            `Live smoke completion: tasks=${parsedReport.task_count}, completed=${parsedReport.completed_task_count}, failed=${parsedReport.failed_task_count}, lift=${parsedReport.lift_status}.`,
          ),
        );
      }
    } catch (error: unknown) {
      results.push(
        result(
          liveCase.id,
          false,
          ["live runner report builds"],
          liveCase.failure_mode,
          error instanceof Error ? error.message : "unknown live runner error",
        ),
      );
      if (mode === "live-smoke") {
        const completionCase = caseById(cases, "live-smoke-completes-bounded-review-task");
        results.push(
          result(
            completionCase.id,
            false,
            ["live smoke completes selected bounded review task"],
            completionCase.failure_mode,
            error instanceof Error ? error.message : "unknown live smoke completion error",
          ),
        );
      }
    }
  }

  const caveat =
    mode === "validate"
      ? "This validates the expanded arena task registry and fixture scoring only: it proves no productivity lift and no live expanded run has executed."
      : "This validates an explicit isolated expanded-arena live runner path only: it proves no productivity lift and does not prove a full clean 20-task live run.";
  const caveatCase = caseById(cases, "eval-report-preserves-registry-only-boundary");
  results.push(
    result(
      caveatCase.id,
      (mode === "validate" ? caveat.includes("fixture scoring only") : caveat.includes("live runner path only")) &&
        caveat.includes("no productivity lift") &&
        (mode === "validate" ? caveat.includes("no live expanded run") : caveat.includes("20-task live run")),
      caveatCase.assertions,
      caveatCase.failure_mode,
      "Eval caveat preserves registry-only boundary.",
    ),
  );

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-benchmark-expanded-arena-result.v1",
    kind: "krn_benchmark_expanded_arena_result",
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
    validated_task_registry_path: registry === null ? null : registryPath,
    generated_benchmark_report_path: generatedBenchmarkReportPath,
    arena_summary: arenaSummary,
    scoring_summary: scoringSummary,
    live_run_summary: liveRunSummary,
    interpretation_caveat: caveat,
  };
}

export function main(): void {
  const argv = process.argv.slice(2);
  const report = runValidation(parseMode(argv), parseRunId(argv));
  const reportDir = resolve(".krn/evals", MODULE_ID, report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(dirname(reportPath), { recursive: true });
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
