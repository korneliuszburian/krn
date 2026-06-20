import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
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

type EvalReport = {
  schema_version: "krn-benchmark-expanded-arena-result.v1";
  kind: "krn_benchmark_expanded_arena_result";
  run_id: string;
  created_at: string;
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
  arena_summary: ArenaSummary | null;
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

function summarizeArena(registry: ExpandedArenaRegistry): ArenaSummary {
  return {
    arena_id: registry.arena_id,
    task_count: registry.tasks.length,
    minimum_live_task_count_for_lift_claim: registry.minimum_live_task_count_for_lift_claim,
    task_family_count: taskFamilySet(registry).length,
    implementation_heavy_task_count: implementationHeavyTaskCount(registry),
    quality_metric_count: taskMetricSet(registry).length,
    live_mode_explicit: liveModeExplicit(registry),
    next_allowed_action: "add fixture scoring and explicit live smoke/full runner for this registry without claiming productivity lift",
  };
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-benchmark-expanded-arena/cases.json")));
  const registryPath = "docs/evals/krn-benchmark-expanded-arena/tasks.json";
  const results: CaseResult[] = [];
  let registry: ExpandedArenaRegistry | null = null;
  let arenaSummary: ArenaSummary | null = null;

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

  const caveat =
    "This validates the expanded arena task registry only: it proves no productivity lift and no live expanded run has executed.";
  const caveatCase = caseById(cases, "eval-report-preserves-registry-only-boundary");
  results.push(
    result(
      caveatCase.id,
      caveat.includes("registry only") &&
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
    arena_summary: arenaSummary,
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
