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
  initial_task_count: number;
  minimum_live_task_count_for_lift_claim: number;
  quality_metric_count: number;
  task_family_count: number;
  live_mode_explicit: boolean;
  next_allowed_action: string;
};

type EvalReport = {
  schema_version: "krn-benchmark-arena-contract-result.v1";
  kind: "krn_benchmark_arena_contract_result";
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
  validated_arena_contract_path: string | null;
  arena_summary: ArenaSummary | null;
  interpretation_caveat: string;
};

const REQUIRED_SOURCE_REFS = [
  "docs/goals/goal-006.md",
  "docs/goals/goal-029.md",
  "docs/memory/product/2026-06-20--krn-benchmark-repeat-clean-live-stability.md",
  "docs/memory/evals/2026-06-20--coding-quality-rubric.md",
  "docs/product/final-product-plan.md",
  "docs/plans/canonical/SOURCES.md",
  "docs/evals/STANDARD.md",
];

const REQUIRED_SOURCE_CLAIMS = ["C031", "C052", "C053", "S088", "LOCAL039", "LOCAL040"];

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

const MeasurementModesSchema = z
  .object({
    default_eval_includes_live: z.literal(false),
    supported_modes: z.array(z.enum(["fixture_contract", "live_codex_exec"])).min(2),
    live_mode_requires_explicit_command: z.literal(true),
    separate_fixture_and_live_stores_required: z.literal(true),
  })
  .strict()
  .superRefine((value, context) => {
    for (const mode of ["fixture_contract", "live_codex_exec"]) {
      if (!value.supported_modes.includes(mode as "fixture_contract" | "live_codex_exec")) {
        context.addIssue({
          code: "custom",
          path: ["supported_modes"],
          message: `supported_modes must include ${mode}`,
        });
      }
    }
  });

const ArenaContractSchema = z
  .object({
    schema_version: z.literal("krn-benchmark-arena-contract.v1"),
    kind: z.literal("krn_benchmark_arena_contract"),
    arena_id: z.string().min(1),
    status: z.literal("review_ready_contract"),
    parent_goal_ref: z.literal("docs/goals/goal-006.md"),
    latest_completed_child_goal_ref: z.literal("docs/goals/goal-029.md"),
    minimum_live_task_count_for_lift_claim: z.literal(20),
    initial_task_count: z.number().int().min(20),
    source_refs: z.array(z.string().min(1)).min(REQUIRED_SOURCE_REFS.length),
    source_claim_refs: z.array(z.string().min(1)).min(REQUIRED_SOURCE_CLAIMS.length),
    measurement_modes: MeasurementModesSchema,
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
        minimum_metrics_per_task: z.number().int().min(5),
        review_burden_metric_required: z.literal(true),
      })
      .strict(),
    task_mix: z
      .object({
        required_task_families: z.array(z.string().min(1)).min(REQUIRED_TASK_FAMILIES.length),
        minimum_implementation_heavy_tasks: z.number().int().min(8),
        implementation_heavy_families: z.array(z.string().min(1)).min(4),
      })
      .strict(),
    claim_policy: z
      .object({
        productivity_lift_claim_allowed: z.literal(false),
        suite_expansion_completion_claim_allowed: z.literal(false),
        next_allowed_action: z.literal("implement expanded suite from this contract without claiming productivity lift"),
        overclaim_boundary: z.string().min(1),
      })
      .strict(),
    review_requirements: z
      .object({
        known_bad_fixture_required: z.literal(true),
        deterministic_validate_mode_required: z.literal(true),
        live_mode_stays_explicit: z.literal(true),
        human_review_burden_must_be_scored: z.literal(true),
      })
      .strict(),
  })
  .strict()
  .superRefine((value, context) => {
    addMissingIssues(context, "source_refs", value.source_refs, REQUIRED_SOURCE_REFS);
    addMissingIssues(context, "source_claim_refs", value.source_claim_refs, REQUIRED_SOURCE_CLAIMS);
    addMissingIssues(context, "quality_rubric.required_metrics", value.quality_rubric.required_metrics, REQUIRED_QUALITY_METRICS);
    addMissingIssues(context, "task_mix.required_task_families", value.task_mix.required_task_families, REQUIRED_TASK_FAMILIES);
    addMissingIssues(context, "task_mix.implementation_heavy_families", value.task_mix.implementation_heavy_families, [
      "implementation",
      "debugging",
      "refactor",
      "benchmark_repair",
    ]);
  });

type ArenaContract = z.infer<typeof ArenaContractSchema>;

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

function parseArenaContract(input: unknown): ArenaContract {
  return ArenaContractSchema.parse(input);
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

function includesAll(values: readonly string[], required: readonly string[]): boolean {
  return required.every((item) => values.includes(item));
}

function summarizeArena(contract: ArenaContract): ArenaSummary {
  return {
    arena_id: contract.arena_id,
    initial_task_count: contract.initial_task_count,
    minimum_live_task_count_for_lift_claim: contract.minimum_live_task_count_for_lift_claim,
    quality_metric_count: contract.quality_rubric.required_metrics.length,
    task_family_count: contract.task_mix.required_task_families.length,
    live_mode_explicit:
      !contract.measurement_modes.default_eval_includes_live && contract.measurement_modes.live_mode_requires_explicit_command,
    next_allowed_action: contract.claim_policy.next_allowed_action,
  };
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-benchmark-arena-contract/cases.json")));
  const results: CaseResult[] = [];
  const validContractPath = "docs/evals/krn-benchmark-arena-contract/arena-contract.example.json";
  let contract: ArenaContract | null = null;
  let arenaSummary: ArenaSummary | null = null;

  const validCase = caseById(cases, "valid-arena-contract-parses");
  try {
    contract = parseArenaContract(readJson(resolve(validContractPath)));
    arenaSummary = summarizeArena(contract);
    results.push(
      result(
        validCase.id,
        contract.parent_goal_ref === "docs/goals/goal-006.md" &&
          contract.latest_completed_child_goal_ref === "docs/goals/goal-029.md" &&
          includesAll(contract.source_refs, REQUIRED_SOURCE_REFS) &&
          includesAll(contract.source_claim_refs, REQUIRED_SOURCE_CLAIMS),
        validCase.assertions,
        validCase.failure_mode,
        "Valid arena contract parsed with active goal, latest child goal, and required source refs.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        validCase.id,
        false,
        ["valid contract parses"],
        validCase.failure_mode,
        error instanceof Error ? error.message : "unknown parse error",
      ),
    );
  }

  const gateCase = caseById(cases, "minimum-live-task-gate");
  results.push(
    result(
      gateCase.id,
      contract !== null &&
        contract.initial_task_count >= 20 &&
        contract.minimum_live_task_count_for_lift_claim === 20 &&
        !contract.claim_policy.productivity_lift_claim_allowed,
      gateCase.assertions,
      gateCase.failure_mode,
      "Arena contract keeps the 20-task gate and blocks productivity lift claims.",
    ),
  );

  const rubricCase = caseById(cases, "quality-rubric-coverage");
  results.push(
    result(
      rubricCase.id,
      contract !== null &&
        includesAll(contract.quality_rubric.required_metrics, REQUIRED_QUALITY_METRICS) &&
        contract.quality_rubric.review_burden_metric_required,
      rubricCase.assertions,
      rubricCase.failure_mode,
      "Arena contract requires coding-quality and review-burden metrics.",
    ),
  );

  const pipelineCase = caseById(cases, "pipeline-ergonomics-and-live-boundary");
  results.push(
    result(
      pipelineCase.id,
      contract !== null &&
        !contract.measurement_modes.default_eval_includes_live &&
        contract.measurement_modes.live_mode_requires_explicit_command &&
        contract.pipeline_ergonomics.progress_log_required &&
        contract.pipeline_ergonomics.resume_completed_workers_required &&
        contract.pipeline_ergonomics.quick_smoke_lane_required &&
        contract.pipeline_ergonomics.full_suite_lane_required &&
        contract.pipeline_ergonomics.separate_fixture_and_live_evidence_required &&
        contract.live_execution_policy.max_concurrent_codex_exec_runs === 1,
      pipelineCase.assertions,
      pipelineCase.failure_mode,
      "Arena contract keeps live mode explicit and requires resumable pipeline ergonomics.",
    ),
  );

  const taskMixCase = caseById(cases, "task-mix-requires-coding-work");
  results.push(
    result(
      taskMixCase.id,
      contract !== null &&
        includesAll(contract.task_mix.required_task_families, REQUIRED_TASK_FAMILIES) &&
        contract.task_mix.minimum_implementation_heavy_tasks >= 8 &&
        includesAll(contract.task_mix.implementation_heavy_families, [
          "implementation",
          "debugging",
          "refactor",
          "benchmark_repair",
        ]),
      taskMixCase.assertions,
      taskMixCase.failure_mode,
      "Arena contract requires implementation-heavy task families.",
    ),
  );

  const knownBadCase = caseById(cases, "known-bad-overclaim-fixture-fails");
  try {
    parseArenaContract(
      readJson(resolve("docs/evals/krn-benchmark-arena-contract/fixtures/bad-arena-contract-overclaims-lift.json")),
    );
    results.push(
      result(
        knownBadCase.id,
        false,
        knownBadCase.assertions,
        knownBadCase.failure_mode,
        "Known-bad arena contract unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        knownBadCase.assertions,
        knownBadCase.failure_mode,
        "Known-bad small-suite overclaim fixture failed as expected.",
      ),
    );
  }

  const caveat =
    "This contract is an arena-expansion readiness gate only: it proves no productivity lift, does not implement the expanded suite, and keeps live codex exec explicit.";
  const caveatCase = caseById(cases, "eval-report-preserves-review-only-boundary");
  results.push(
    result(
      caveatCase.id,
      caveat.includes("no productivity lift") &&
        caveat.includes("does not implement the expanded suite") &&
        caveat.includes("live codex exec explicit"),
      caveatCase.assertions,
      caveatCase.failure_mode,
      "Eval caveat preserves review-only arena-contract boundary.",
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
    schema_version: "krn-benchmark-arena-contract-result.v1",
    kind: "krn_benchmark_arena_contract_result",
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
    validated_arena_contract_path: contract === null ? null : validContractPath,
    arena_summary: arenaSummary,
    interpretation_caveat: caveat,
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-benchmark-arena-contract", report.run_id);
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
