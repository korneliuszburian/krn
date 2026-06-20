import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { parseKrnBenchmarkReport, type KrnBenchmarkReport } from "@krn/contracts";
import { z } from "zod";

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

type EvalReport = {
  schema_version: "krn-benchmark-expanded-arena-result.v1";
  kind: "krn_benchmark_expanded_arena_result";
  run_id: string;
  created_at: string;
  mode: "validate";
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
  interpretation_caveat: string;
};

const REQUIRED_SOURCE_REFS = [
  "docs/goals/goal-006.md",
  "docs/goals/goal-031.md",
  "docs/goals/goal-030.md",
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

const ExpandedArenaRegistrySchema = z
  .object({
    schema_version: z.literal("krn-benchmark-expanded-arena-tasks.v1"),
    kind: z.literal("krn_benchmark_expanded_arena_registry"),
    benchmark_id: z.literal("krn-benchmark-expanded-arena"),
    arena_id: z.literal("krn-expanded-autoresearch-arena"),
    contract_ref: z.literal("docs/evals/krn-benchmark-arena-contract/arena-contract.example.json"),
    parent_goal_ref: z.literal("docs/goals/goal-006.md"),
    current_child_goal_ref: z.literal("docs/goals/goal-031.md"),
    latest_completed_child_goal_ref: z.literal("docs/goals/goal-030.md"),
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

      addMissingIssues(context, `tasks.${index}.source_refs`, task.source_refs, [
        registry.parent_goal_ref,
        registry.current_child_goal_ref,
      ]);
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

function summarizeArena(registry: ExpandedArenaRegistry): ArenaSummary {
  return {
    arena_id: registry.arena_id,
    task_count: registry.tasks.length,
    minimum_live_task_count_for_lift_claim: registry.minimum_live_task_count_for_lift_claim,
    task_family_count: taskFamilySet(registry).length,
    implementation_heavy_task_count: implementationHeavyTaskCount(registry),
    quality_metric_count: taskMetricSet(registry).length,
    live_mode_explicit: liveModeExplicit(registry),
    next_allowed_action: "add explicit live smoke/full runner for this registry without claiming productivity lift",
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
        "Add isolated explicit live smoke/full runner modes over docs/evals/krn-benchmark-expanded-arena/tasks.json before any dashboard/API run controls or productivity claims.",
      source_refs: [
        "docs/goals/goal-006.md",
        "docs/goals/goal-032.md",
        "docs/evals/krn-benchmark-expanded-arena/tasks.json",
        "docs/memory/product/2026-06-20--krn-benchmark-expanded-arena-registry.md",
        "docs/plans/canonical/SOURCES.md",
      ],
      failure_mode:
        "Fixture scoring is overclaimed as live expanded execution or a dashboard/control surface is added before isolated live runner evidence exists.",
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
): KrnBenchmarkReport {
  const tasks = buildBenchmarkTasks(registry, baseline, assisted);
  const reportPath = `.krn/benchmarks/krn-benchmark-expanded-arena/${runId}/report.json`;
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

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-benchmark-expanded-arena/cases.json")));
  const registryPath = "docs/evals/krn-benchmark-expanded-arena/tasks.json";
  const results: CaseResult[] = [];
  let registry: ExpandedArenaRegistry | null = null;
  let arenaSummary: ArenaSummary | null = null;
  let generatedBenchmarkReportPath: string | null = null;
  let scoringSummary: ScoringSummary | null = null;

  const parseCase = caseById(cases, "expanded-arena-registry-parses");
  try {
    registry = parseRegistry(readJson(resolve(registryPath)));
    arenaSummary = summarizeArena(registry);
    results.push(
      result(
        parseCase.id,
        registry.contract_ref === "docs/evals/krn-benchmark-arena-contract/arena-contract.example.json" &&
          registry.parent_goal_ref === "docs/goals/goal-006.md" &&
          registry.current_child_goal_ref === "docs/goals/goal-031.md" &&
          registry.latest_completed_child_goal_ref === "docs/goals/goal-030.md" &&
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

  const knownBadCase = caseById(cases, "known-bad-registry-fails");
  try {
    parseRegistry(readJson(resolve("docs/evals/krn-benchmark-expanded-arena/fixtures/bad-expanded-arena-tasks.json")));
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
    const baselineFixturePath = "docs/evals/krn-benchmark-expanded-arena/fixtures/baseline-scoring-fixture.json";
    const assistedFixturePath = "docs/evals/krn-benchmark-expanded-arena/fixtures/assisted-scoring-fixture.json";
    const baselineFixture = parseScoringFixture(readJson(resolve(baselineFixturePath)));
    const assistedFixture = parseScoringFixture(readJson(resolve(assistedFixturePath)));

    if (registry === null) {
      throw new Error("expanded arena registry did not parse");
    }

    const fixturesAreValid =
      scoringFixtureIsValid(baselineFixture, registry, "baseline_codex") &&
      scoringFixtureIsValid(assistedFixture, registry, "krn_assisted_codex");
    const benchmarkReport = buildBenchmarkReport(runId, now, registry, baselineFixture, assistedFixture);
    generatedBenchmarkReportPath = writeBenchmarkReport(benchmarkReport);
    const parsedReport = parseKrnBenchmarkReport(readJson(generatedBenchmarkReportPath));
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
      readJson(resolve("docs/evals/krn-benchmark-expanded-arena/fixtures/bad-scoring-fixture-overclaims-lift.json")),
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

  const caveat =
    "This validates the expanded arena task registry and fixture scoring only: it proves no productivity lift and no live expanded run has executed.";
  const caveatCase = caseById(cases, "eval-report-preserves-registry-only-boundary");
  results.push(
    result(
      caveatCase.id,
      caveat.includes("fixture scoring only") &&
        caveat.includes("no productivity lift") &&
        caveat.includes("no live expanded run"),
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
    mode: "validate",
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
    interpretation_caveat: caveat,
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-benchmark-expanded-arena", report.run_id);
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
