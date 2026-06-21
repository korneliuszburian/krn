import { existsSync, mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, relative, resolve } from "node:path";
import {
  parseInitManifest,
  parseKrnContextPointerIndex,
  parseKrnControlPlaneProposal,
  parseKrnEvalBaseline,
  parseKrnPolicyBoundaries,
  parseKrnProposalPromotion,
  parseKrnProposalReviewDecision,
  parseKrnSourceGraph,
} from "@krn/contracts";
import { runKrnCli } from "@krn/cli";
import { storeKrnProposalReviewDecision } from "@krn/mcp";

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
  schema_version: "krn-init-contracts-result.v1";
  kind: "krn_init_contracts_result";
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
  generated_manifest_path: string | null;
  interpretation_caveat: string;
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

    return {
      id,
      expected_behavior: expectedBehavior,
      metrics,
      failure_mode: failureMode,
    };
  });
}

function result(id: string, passed: boolean, assertions: string[], failureMode: string, message: string): CaseResult {
  return { id, passed, assertions, failure_mode: failureMode, message };
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

const REQUIRED_BOOTSTRAP_CAPABILITIES = [
  "agent_instructions",
  "local_config",
  "source_pointers",
  "context_pointers",
  "eval_baseline",
  "skill_wiring",
  "policy_boundaries",
] as const;

function hasRequiredBootstrapCapabilities(manifest: ReturnType<typeof parseInitManifest>): boolean {
  const capabilities = new Set(manifest.bootstrap_plan.map((item) => item.capability));
  return REQUIRED_BOOTSTRAP_CAPABILITIES.every((capability) => capabilities.has(capability));
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-init-contracts/cases.json")));
  const results: CaseResult[] = [];
  let generatedManifestPath: string | null = null;

  const caseById = new Map(cases.map((testCase) => [testCase.id, testCase]));

  const validFixtureCase = caseById.get("valid-fixture-parses");
  if (!validFixtureCase) {
    throw new Error("Missing case valid-fixture-parses");
  }
  try {
    const manifest = parseInitManifest(readJson(resolve("docs/specs/krn-init/examples/init-manifest.example.json")));
    results.push(
      result(
        validFixtureCase.id,
        manifest.mode === "dry-run" && manifest.interpretation_caveat.length > 0 && hasRequiredBootstrapCapabilities(manifest),
        ["valid fixture parses", "dry-run mode", "interpretation caveat present", "bootstrap capabilities present"],
        validFixtureCase.failure_mode,
        "Valid fixture parsed through @krn/contracts.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        validFixtureCase.id,
        false,
        ["valid fixture parses"],
        validFixtureCase.failure_mode,
        error instanceof Error ? error.message : "unknown parse error",
      ),
    );
  }

  const knownBadCase = caseById.get("known-bad-fixture-fails");
  if (!knownBadCase) {
    throw new Error("Missing case known-bad-fixture-fails");
  }
  try {
    parseInitManifest(readJson(resolve("docs/specs/krn-init/fixtures/bad-init-manifest.example.json")));
    results.push(
      result(
        knownBadCase.id,
        false,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        knownBadCase.id,
        true,
        ["known-bad fixture rejected"],
        knownBadCase.failure_mode,
        "Known-bad fixture failed as expected.",
      ),
    );
  }

  const missingCapabilityCase = caseById.get("known-bad-missing-bootstrap-capability-fails");
  if (!missingCapabilityCase) {
    throw new Error("Missing case known-bad-missing-bootstrap-capability-fails");
  }
  try {
    parseInitManifest(readJson(resolve("docs/specs/krn-init/fixtures/bad-init-manifest-missing-bootstrap-capability.example.json")));
    results.push(
      result(
        missingCapabilityCase.id,
        false,
        ["known-bad missing bootstrap capability rejected"],
        missingCapabilityCase.failure_mode,
        "Known-bad missing bootstrap capability fixture unexpectedly parsed.",
      ),
    );
  } catch {
    results.push(
      result(
        missingCapabilityCase.id,
        true,
        ["known-bad missing bootstrap capability rejected"],
        missingCapabilityCase.failure_mode,
        "Known-bad missing bootstrap capability fixture failed as expected.",
      ),
    );
  }

  const generatedCase = caseById.get("generated-dry-run-manifest-parses");
  if (!generatedCase) {
    throw new Error("Missing case generated-dry-run-manifest-parses");
  }
  const cliResult = runKrnCli(["init", "--dry-run", "--target", "."]);
  const cliManifestPath = cliResult.stdout.trim();
  generatedManifestPath = cliManifestPath;
  if (cliResult.exitCode !== 0) {
    results.push(
      result(
        generatedCase.id,
        false,
        ["CLI exits zero", "generated manifest parses"],
        generatedCase.failure_mode,
        cliResult.stderr,
      ),
    );
  } else {
    try {
      const manifest = parseInitManifest(readJson(cliManifestPath));
      const onlyAllowedWrite = manifest.planned_files.some((file) => file.path.endsWith("/manifest.json"));
      results.push(
        result(
          generatedCase.id,
          manifest.mode === "dry-run" &&
            existsSync(cliManifestPath) &&
            onlyAllowedWrite &&
            hasRequiredBootstrapCapabilities(manifest),
          ["CLI exits zero", "generated manifest exists", "generated manifest parses", "dry-run mode", "bootstrap capabilities present"],
          generatedCase.failure_mode,
          "Generated dry-run manifest parsed through @krn/contracts.",
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          generatedCase.id,
          false,
          ["generated manifest parses"],
          generatedCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated manifest error",
        ),
      );
    }
  }

  const proposalCase = caseById.get("generated-agent-instructions-proposal-stores");
  if (!proposalCase) {
    throw new Error("Missing case generated-agent-instructions-proposal-stores");
  }

  const applyCase = caseById.get("generated-agent-instructions-apply-writes-reviewed-target");
  if (!applyCase) {
    throw new Error("Missing case generated-agent-instructions-apply-writes-reviewed-target");
  }
  const applyTarget = mkdtempSync(join(tmpdir(), "krn-init-apply-eval-"));
  const applyProposalResult = runKrnCli(["init", "--proposal", "agent_instructions", "--target", applyTarget]);
  const applyProposalPath = applyProposalResult.stdout.trim();
  if (applyProposalResult.exitCode !== 0) {
    results.push(
      result(
        applyCase.id,
        false,
        ["proposal CLI exits zero", "apply CLI exits zero"],
        applyCase.failure_mode,
        applyProposalResult.stderr,
      ),
    );
  } else {
    try {
      const proposal = parseKrnControlPlaneProposal(readJson(applyProposalPath));
      const proposalRelativePath = relative(applyTarget, applyProposalPath).replaceAll("\\", "/");
      const decision = parseKrnProposalReviewDecision({
        schema_version: "krn-proposal-review-decision.v1",
        kind: "krn_proposal_review_decision",
        decision_id: `decision-${proposal.proposal_id}`,
        proposal_id: proposal.proposal_id,
        proposal_path: proposalRelativePath,
        decision: "approved_for_promotion",
        review_scope: "proposal_review_only",
        target_mutated: false,
        promotion_state: "not_promoted",
        reviewer: "krn-init-eval",
        rationale: "The generated AGENTS.md is thin, target is absent, and the exact payload is safe to apply.",
        write_policy: {
          default_effect: "no_target_mutation",
          allowed_persistence: "append_only",
          idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
        },
        evidence_refs: proposal.evidence_refs,
        source_refs: proposal.source_refs,
        blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write"],
        created_at: now.toISOString(),
        created_by: "krn init eval",
        interpretation_caveat:
          "This decision approves promotion input only; exact target write still requires explicit init apply mode.",
      });
      const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: applyTarget, now });
      const applyResult = runKrnCli([
        "init",
        "--apply",
        "agent_instructions",
        "--proposal-path",
        applyProposalPath,
        "--decision-path",
        join(applyTarget, storedDecision.decision_path),
        "--target",
        applyTarget,
      ]);
      const promotionPath = applyResult.stdout.trim();
      const promotion = applyResult.exitCode === 0 ? parseKrnProposalPromotion(readJson(promotionPath)) : null;
      const targetAgentsPath = join(applyTarget, "AGENTS.md");

      results.push(
        result(
          applyCase.id,
          applyResult.exitCode === 0 &&
            promotion?.proposal_kind === "init_bootstrap" &&
            promotion.promotion_scope === "approved_init_bootstrap_only" &&
            promotion.apply_mode === "apply_exact_target_write" &&
            existsSync(promotionPath) &&
            existsSync(targetAgentsPath) &&
            readFileSync(targetAgentsPath, "utf8") === promotion.target.file_content,
          [
            "proposal CLI exits zero",
            "approved review decision stored",
            "apply CLI exits zero",
            "promotion parses",
            "target AGENTS.md matches exact payload",
          ],
          applyCase.failure_mode,
          applyResult.exitCode === 0
            ? "Generated init proposal applied exact reviewed AGENTS.md payload through promotion boundary."
            : applyResult.stderr,
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          applyCase.id,
          false,
          ["generated init apply"],
          applyCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated init apply error",
        ),
      );
    }
  }
  const localConfigApplyCase = caseById.get("generated-local-config-apply-writes-reviewed-target");
  if (!localConfigApplyCase) {
    throw new Error("Missing case generated-local-config-apply-writes-reviewed-target");
  }
  const localConfigTarget = mkdtempSync(join(tmpdir(), "krn-init-local-config-apply-eval-"));
  const localConfigProposalResult = runKrnCli(["init", "--proposal", "local_config", "--target", localConfigTarget]);
  const localConfigProposalPath = localConfigProposalResult.stdout.trim();
  if (localConfigProposalResult.exitCode !== 0) {
    results.push(
      result(
        localConfigApplyCase.id,
        false,
        ["proposal CLI exits zero", "apply CLI exits zero"],
        localConfigApplyCase.failure_mode,
        localConfigProposalResult.stderr,
      ),
    );
  } else {
    try {
      const proposal = parseKrnControlPlaneProposal(readJson(localConfigProposalPath));
      const proposalRelativePath = relative(localConfigTarget, localConfigProposalPath).replaceAll("\\", "/");
      const decision = parseKrnProposalReviewDecision({
        schema_version: "krn-proposal-review-decision.v1",
        kind: "krn_proposal_review_decision",
        decision_id: `decision-${proposal.proposal_id}`,
        proposal_id: proposal.proposal_id,
        proposal_path: proposalRelativePath,
        decision: "approved_for_promotion",
        review_scope: "proposal_review_only",
        target_mutated: false,
        promotion_state: "not_promoted",
        reviewer: "krn-init-eval",
        rationale: "The generated local config is minimal, target is absent, and the exact payload is safe to apply.",
        write_policy: {
          default_effect: "no_target_mutation",
          allowed_persistence: "append_only",
          idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
        },
        evidence_refs: proposal.evidence_refs,
        source_refs: proposal.source_refs,
        blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write"],
        created_at: now.toISOString(),
        created_by: "krn init eval",
        interpretation_caveat:
          "This decision approves promotion input only; exact target write still requires explicit init apply mode.",
      });
      const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: localConfigTarget, now });
      const applyResult = runKrnCli([
        "init",
        "--apply",
        "local_config",
        "--proposal-path",
        localConfigProposalPath,
        "--decision-path",
        join(localConfigTarget, storedDecision.decision_path),
        "--target",
        localConfigTarget,
      ]);
      const promotionPath = applyResult.stdout.trim();
      const promotion = applyResult.exitCode === 0 ? parseKrnProposalPromotion(readJson(promotionPath)) : null;
      const targetConfigPath = join(localConfigTarget, ".krn", "config.toml");
      const configContent = existsSync(targetConfigPath) ? readFileSync(targetConfigPath, "utf8") : "";

      results.push(
        result(
          localConfigApplyCase.id,
          applyResult.exitCode === 0 &&
            promotion?.proposal_kind === "init_bootstrap" &&
            promotion.promotion_scope === "approved_init_bootstrap_only" &&
            promotion.apply_mode === "apply_exact_target_write" &&
            existsSync(promotionPath) &&
            existsSync(targetConfigPath) &&
            configContent === promotion.target.file_content &&
            configContent.includes('memory_store_env = "KRN_MEMORY_STORE_PATH"') &&
            !configContent.includes("goal-038") &&
            !configContent.includes("docs/plans/canonical/draft.md"),
          [
            "proposal CLI exits zero",
            "approved review decision stored",
            "apply CLI exits zero",
            "promotion parses",
            "target .krn/config.toml matches exact payload",
            "config avoids active-goal runtime truth",
          ],
          localConfigApplyCase.failure_mode,
          applyResult.exitCode === 0
            ? "Generated init proposal applied exact reviewed local config payload through promotion boundary."
            : applyResult.stderr,
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          localConfigApplyCase.id,
          false,
          ["generated local config apply"],
          localConfigApplyCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated local config apply error",
        ),
      );
    }
  }
  const sourcePointersApplyCase = caseById.get("generated-source-pointers-apply-writes-reviewed-target");
  if (!sourcePointersApplyCase) {
    throw new Error("Missing case generated-source-pointers-apply-writes-reviewed-target");
  }
  const sourcePointersTarget = mkdtempSync(join(tmpdir(), "krn-init-source-pointers-apply-eval-"));
  const sourcePointersProposalResult = runKrnCli(["init", "--proposal", "source_pointers", "--target", sourcePointersTarget]);
  const sourcePointersProposalPath = sourcePointersProposalResult.stdout.trim();
  if (sourcePointersProposalResult.exitCode !== 0) {
    results.push(
      result(
        sourcePointersApplyCase.id,
        false,
        ["proposal CLI exits zero", "apply CLI exits zero"],
        sourcePointersApplyCase.failure_mode,
        sourcePointersProposalResult.stderr,
      ),
    );
  } else {
    try {
      const proposal = parseKrnControlPlaneProposal(readJson(sourcePointersProposalPath));
      const proposalRelativePath = relative(sourcePointersTarget, sourcePointersProposalPath).replaceAll("\\", "/");
      const decision = parseKrnProposalReviewDecision({
        schema_version: "krn-proposal-review-decision.v1",
        kind: "krn_proposal_review_decision",
        decision_id: `decision-${proposal.proposal_id}`,
        proposal_id: proposal.proposal_id,
        proposal_path: proposalRelativePath,
        decision: "approved_for_promotion",
        review_scope: "proposal_review_only",
        target_mutated: false,
        promotion_state: "not_promoted",
        reviewer: "krn-init-eval",
        rationale: "The generated source graph seed is minimal, target is absent, and the exact payload is safe to apply.",
        write_policy: {
          default_effect: "no_target_mutation",
          allowed_persistence: "append_only",
          idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
        },
        evidence_refs: proposal.evidence_refs,
        source_refs: proposal.source_refs,
        blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "copied_source_truth"],
        created_at: now.toISOString(),
        created_by: "krn init eval",
        interpretation_caveat:
          "This decision approves promotion input only; exact target write still requires explicit init apply mode.",
      });
      const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: sourcePointersTarget, now });
      const applyResult = runKrnCli([
        "init",
        "--apply",
        "source_pointers",
        "--proposal-path",
        sourcePointersProposalPath,
        "--decision-path",
        join(sourcePointersTarget, storedDecision.decision_path),
        "--target",
        sourcePointersTarget,
      ]);
      const promotionPath = applyResult.stdout.trim();
      const promotion = applyResult.exitCode === 0 ? parseKrnProposalPromotion(readJson(promotionPath)) : null;
      const targetSourcePath = join(sourcePointersTarget, ".krn", "sources", "index.json");
      const sourceContent = existsSync(targetSourcePath) ? readFileSync(targetSourcePath, "utf8") : "";
      const sourceGraph = sourceContent.length > 0 ? parseKrnSourceGraph(JSON.parse(sourceContent) as unknown) : null;

      results.push(
        result(
          sourcePointersApplyCase.id,
          applyResult.exitCode === 0 &&
            promotion?.proposal_kind === "init_bootstrap" &&
            promotion.promotion_scope === "approved_init_bootstrap_only" &&
            promotion.apply_mode === "apply_exact_target_write" &&
            existsSync(promotionPath) &&
            existsSync(targetSourcePath) &&
            sourceContent === promotion.target.file_content &&
            sourceGraph?.records.length === 1 &&
            sourceGraph.records[0]?.ref === "krn://source/bootstrap-policy" &&
            sourceGraph.overclaim_boundary.includes("not a copied bibliography") &&
            !sourceContent.includes("docs/plans/canonical/SOURCES.md") &&
            !sourceContent.includes("goal-038"),
          [
            "proposal CLI exits zero",
            "approved review decision stored",
            "apply CLI exits zero",
            "promotion parses",
            "target .krn/sources/index.json matches exact payload",
            "source seed avoids copied source truth",
          ],
          sourcePointersApplyCase.failure_mode,
          applyResult.exitCode === 0
            ? "Generated init proposal applied exact reviewed source graph seed payload through promotion boundary."
            : applyResult.stderr,
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          sourcePointersApplyCase.id,
          false,
          ["generated source pointers apply"],
          sourcePointersApplyCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated source pointers apply error",
        ),
      );
    }
  }
  const contextPointersApplyCase = caseById.get("generated-context-pointers-apply-writes-reviewed-target");
  if (!contextPointersApplyCase) {
    throw new Error("Missing case generated-context-pointers-apply-writes-reviewed-target");
  }
  const contextPointersTarget = mkdtempSync(join(tmpdir(), "krn-init-context-pointers-apply-eval-"));
  const contextPointersProposalResult = runKrnCli(["init", "--proposal", "context_pointers", "--target", contextPointersTarget]);
  const contextPointersProposalPath = contextPointersProposalResult.stdout.trim();
  if (contextPointersProposalResult.exitCode !== 0) {
    results.push(
      result(
        contextPointersApplyCase.id,
        false,
        ["proposal CLI exits zero", "apply CLI exits zero"],
        contextPointersApplyCase.failure_mode,
        contextPointersProposalResult.stderr,
      ),
    );
  } else {
    try {
      const proposal = parseKrnControlPlaneProposal(readJson(contextPointersProposalPath));
      const proposalRelativePath = relative(contextPointersTarget, contextPointersProposalPath).replaceAll("\\", "/");
      const decision = parseKrnProposalReviewDecision({
        schema_version: "krn-proposal-review-decision.v1",
        kind: "krn_proposal_review_decision",
        decision_id: `decision-${proposal.proposal_id}`,
        proposal_id: proposal.proposal_id,
        proposal_path: proposalRelativePath,
        decision: "approved_for_promotion",
        review_scope: "proposal_review_only",
        target_mutated: false,
        promotion_state: "not_promoted",
        reviewer: "krn-init-eval",
        rationale: "The generated context pointer index is minimal, target is absent, and the exact payload is safe to apply.",
        write_policy: {
          default_effect: "no_target_mutation",
          allowed_persistence: "append_only",
          idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
        },
        evidence_refs: proposal.evidence_refs,
        source_refs: proposal.source_refs,
        blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "context_dump"],
        created_at: now.toISOString(),
        created_by: "krn init eval",
        interpretation_caveat:
          "This decision approves promotion input only; exact target write still requires explicit init apply mode.",
      });
      const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: contextPointersTarget, now });
      const applyResult = runKrnCli([
        "init",
        "--apply",
        "context_pointers",
        "--proposal-path",
        contextPointersProposalPath,
        "--decision-path",
        join(contextPointersTarget, storedDecision.decision_path),
        "--target",
        contextPointersTarget,
      ]);
      const promotionPath = applyResult.stdout.trim();
      const promotion = applyResult.exitCode === 0 ? parseKrnProposalPromotion(readJson(promotionPath)) : null;
      const targetContextPath = join(contextPointersTarget, ".krn", "context", "index.json");
      const contextContent = existsSync(targetContextPath) ? readFileSync(targetContextPath, "utf8") : "";
      const contextIndex =
        contextContent.length > 0 ? parseKrnContextPointerIndex(JSON.parse(contextContent) as unknown) : null;

      results.push(
        result(
          contextPointersApplyCase.id,
          applyResult.exitCode === 0 &&
            promotion?.proposal_kind === "init_bootstrap" &&
            promotion.promotion_scope === "approved_init_bootstrap_only" &&
            promotion.apply_mode === "apply_exact_target_write" &&
            existsSync(promotionPath) &&
            existsSync(targetContextPath) &&
            contextContent === promotion.target.file_content &&
            contextIndex?.runtime_root === ".krn/context" &&
            contextIndex.packet_glob === ".krn/context/*/context-packet.json" &&
            contextIndex.memory_policy.store_memory_bodies === false &&
            contextIndex.memory_policy.require_selected_memory_ids === true &&
            contextIndex.memory_policy.require_application_guidance === true &&
            contextIndex.rejected_context_refs.includes("docs/memory/** full scan") &&
            !contextContent.includes("goal-038") &&
            !contextContent.includes("docs/plans/canonical/draft.md"),
          [
            "proposal CLI exits zero",
            "approved review decision stored",
            "apply CLI exits zero",
            "promotion parses",
            "target .krn/context/index.json matches exact payload",
            "context pointer seed avoids memory bodies and active-goal truth",
          ],
          contextPointersApplyCase.failure_mode,
          applyResult.exitCode === 0
            ? "Generated init proposal applied exact reviewed context pointer index payload through promotion boundary."
            : applyResult.stderr,
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          contextPointersApplyCase.id,
          false,
          ["generated context pointers apply"],
          contextPointersApplyCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated context pointers apply error",
        ),
      );
    }
  }
  const evalBaselineApplyCase = caseById.get("generated-eval-baseline-apply-writes-reviewed-target");
  if (!evalBaselineApplyCase) {
    throw new Error("Missing case generated-eval-baseline-apply-writes-reviewed-target");
  }
  const evalBaselineTarget = mkdtempSync(join(tmpdir(), "krn-init-eval-baseline-apply-eval-"));
  const evalBaselineProposalResult = runKrnCli(["init", "--proposal", "eval_baseline", "--target", evalBaselineTarget]);
  const evalBaselineProposalPath = evalBaselineProposalResult.stdout.trim();
  if (evalBaselineProposalResult.exitCode !== 0) {
    results.push(
      result(
        evalBaselineApplyCase.id,
        false,
        ["proposal CLI exits zero", "apply CLI exits zero"],
        evalBaselineApplyCase.failure_mode,
        evalBaselineProposalResult.stderr,
      ),
    );
  } else {
    try {
      const proposal = parseKrnControlPlaneProposal(readJson(evalBaselineProposalPath));
      const proposalRelativePath = relative(evalBaselineTarget, evalBaselineProposalPath).replaceAll("\\", "/");
      const decision = parseKrnProposalReviewDecision({
        schema_version: "krn-proposal-review-decision.v1",
        kind: "krn_proposal_review_decision",
        decision_id: `decision-${proposal.proposal_id}`,
        proposal_id: proposal.proposal_id,
        proposal_path: proposalRelativePath,
        decision: "approved_for_promotion",
        review_scope: "proposal_review_only",
        target_mutated: false,
        promotion_state: "not_promoted",
        reviewer: "krn-init-eval",
        rationale: "The generated eval baseline seed is minimal, target is absent, and the exact payload is safe to apply.",
        write_policy: {
          default_effect: "no_target_mutation",
          allowed_persistence: "append_only",
          idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
        },
        evidence_refs: proposal.evidence_refs,
        source_refs: proposal.source_refs,
        blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "lab_default", "lift_claim"],
        created_at: now.toISOString(),
        created_by: "krn init eval",
        interpretation_caveat:
          "This decision approves promotion input only; exact target write still requires explicit init apply mode.",
      });
      const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: evalBaselineTarget, now });
      const applyResult = runKrnCli([
        "init",
        "--apply",
        "eval_baseline",
        "--proposal-path",
        evalBaselineProposalPath,
        "--decision-path",
        join(evalBaselineTarget, storedDecision.decision_path),
        "--target",
        evalBaselineTarget,
      ]);
      const promotionPath = applyResult.stdout.trim();
      const promotion = applyResult.exitCode === 0 ? parseKrnProposalPromotion(readJson(promotionPath)) : null;
      const targetEvalPath = join(evalBaselineTarget, ".krn", "evals", "baseline.json");
      const evalBaselineContent = existsSync(targetEvalPath) ? readFileSync(targetEvalPath, "utf8") : "";
      const evalBaseline =
        evalBaselineContent.length > 0 ? parseKrnEvalBaseline(JSON.parse(evalBaselineContent) as unknown) : null;

      results.push(
        result(
          evalBaselineApplyCase.id,
          applyResult.exitCode === 0 &&
            promotion?.proposal_kind === "init_bootstrap" &&
            promotion.promotion_scope === "approved_init_bootstrap_only" &&
            promotion.apply_mode === "apply_exact_target_write" &&
            existsSync(promotionPath) &&
            existsSync(targetEvalPath) &&
            evalBaselineContent === promotion.target.file_content &&
            evalBaseline?.default_lane === "current" &&
            evalBaseline.required_lanes.includes("core") &&
            evalBaseline.required_lanes.includes("current") &&
            evalBaseline.forbidden_default_lanes.includes("lab") &&
            evalBaseline.forbidden_default_lanes.includes("all") &&
            evalBaseline.policy.productivity_lift_claimed === false &&
            !evalBaselineContent.includes("goal-038") &&
            !evalBaselineContent.includes("docs/plans/canonical/draft.md"),
          [
            "proposal CLI exits zero",
            "approved review decision stored",
            "apply CLI exits zero",
            "promotion parses",
            "target .krn/evals/baseline.json matches exact payload",
            "eval baseline seed avoids lab/all defaults and lift claims",
          ],
          evalBaselineApplyCase.failure_mode,
          applyResult.exitCode === 0
            ? "Generated init proposal applied exact reviewed eval baseline seed payload through promotion boundary."
            : applyResult.stderr,
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          evalBaselineApplyCase.id,
          false,
          ["generated eval baseline apply"],
          evalBaselineApplyCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated eval baseline apply error",
        ),
      );
    }
  }

  const skillWiringApplyCase = caseById.get("generated-skill-wiring-apply-writes-reviewed-target");
  if (!skillWiringApplyCase) {
    throw new Error("Missing case generated-skill-wiring-apply-writes-reviewed-target");
  }
  const skillWiringTarget = mkdtempSync(join(tmpdir(), "krn-init-skill-wiring-apply-eval-"));
  const skillWiringProposalResult = runKrnCli(["init", "--proposal", "skill_wiring", "--target", skillWiringTarget]);
  const skillWiringProposalPath = skillWiringProposalResult.stdout.trim();
  if (skillWiringProposalResult.exitCode !== 0) {
    results.push(
      result(
        skillWiringApplyCase.id,
        false,
        ["proposal CLI exits zero", "apply CLI exits zero"],
        skillWiringApplyCase.failure_mode,
        skillWiringProposalResult.stderr,
      ),
    );
  } else {
    try {
      const proposal = parseKrnControlPlaneProposal(readJson(skillWiringProposalPath));
      const proposalRelativePath = relative(skillWiringTarget, skillWiringProposalPath).replaceAll("\\", "/");
      const decision = parseKrnProposalReviewDecision({
        schema_version: "krn-proposal-review-decision.v1",
        kind: "krn_proposal_review_decision",
        decision_id: `decision-${proposal.proposal_id}`,
        proposal_id: proposal.proposal_id,
        proposal_path: proposalRelativePath,
        decision: "approved_for_promotion",
        review_scope: "proposal_review_only",
        target_mutated: false,
        promotion_state: "not_promoted",
        reviewer: "krn-init-eval",
        rationale: "The generated skill wiring seed is minimal, target is absent, and the exact payload is safe to apply.",
        write_policy: {
          default_effect: "no_target_mutation",
          allowed_persistence: "append_only",
          idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
        },
        evidence_refs: proposal.evidence_refs,
        source_refs: proposal.source_refs,
        blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "copied_skill_body"],
        created_at: now.toISOString(),
        created_by: "krn init eval",
        interpretation_caveat:
          "This decision approves promotion input only; exact target write still requires explicit init apply mode.",
      });
      const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: skillWiringTarget, now });
      const applyResult = runKrnCli([
        "init",
        "--apply",
        "skill_wiring",
        "--proposal-path",
        skillWiringProposalPath,
        "--decision-path",
        join(skillWiringTarget, storedDecision.decision_path),
        "--target",
        skillWiringTarget,
      ]);
      const promotionPath = applyResult.stdout.trim();
      const promotion = applyResult.exitCode === 0 ? parseKrnProposalPromotion(readJson(promotionPath)) : null;
      const targetSkillWiringPath = join(skillWiringTarget, ".agents", "skills", "README.md");
      const skillWiringContent = existsSync(targetSkillWiringPath) ? readFileSync(targetSkillWiringPath, "utf8") : "";

      results.push(
        result(
          skillWiringApplyCase.id,
          applyResult.exitCode === 0 &&
            promotion?.proposal_kind === "init_bootstrap" &&
            promotion.promotion_scope === "approved_init_bootstrap_only" &&
            promotion.apply_mode === "apply_exact_target_write" &&
            existsSync(promotionPath) &&
            existsSync(targetSkillWiringPath) &&
            skillWiringContent === promotion.target.file_content &&
            skillWiringContent.includes("Do not copy active skill bodies") &&
            skillWiringContent.includes("does not create active skills") &&
            !skillWiringContent.includes("goal-038") &&
            !skillWiringContent.includes("docs/plans/canonical/draft.md"),
          [
            "proposal CLI exits zero",
            "approved review decision stored",
            "apply CLI exits zero",
            "promotion parses",
            "target .agents/skills/README.md matches exact payload",
            "skill wiring seed avoids copied skill bodies and active-goal truth",
          ],
          skillWiringApplyCase.failure_mode,
          applyResult.exitCode === 0
            ? "Generated init proposal applied exact reviewed skill wiring seed payload through promotion boundary."
            : applyResult.stderr,
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          skillWiringApplyCase.id,
          false,
          ["generated skill wiring apply"],
          skillWiringApplyCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated skill wiring apply error",
        ),
      );
    }
  }

  const policyBoundariesApplyCase = caseById.get("generated-policy-boundaries-apply-writes-reviewed-target");
  if (!policyBoundariesApplyCase) {
    throw new Error("Missing case generated-policy-boundaries-apply-writes-reviewed-target");
  }
  const policyBoundariesTarget = mkdtempSync(join(tmpdir(), "krn-init-policy-boundaries-apply-eval-"));
  const policyBoundariesProposalResult = runKrnCli(["init", "--proposal", "policy_boundaries", "--target", policyBoundariesTarget]);
  const policyBoundariesProposalPath = policyBoundariesProposalResult.stdout.trim();
  if (policyBoundariesProposalResult.exitCode !== 0) {
    results.push(
      result(
        policyBoundariesApplyCase.id,
        false,
        ["proposal CLI exits zero", "apply CLI exits zero"],
        policyBoundariesApplyCase.failure_mode,
        policyBoundariesProposalResult.stderr,
      ),
    );
  } else {
    try {
      const proposal = parseKrnControlPlaneProposal(readJson(policyBoundariesProposalPath));
      const proposalRelativePath = relative(policyBoundariesTarget, policyBoundariesProposalPath).replaceAll("\\", "/");
      const decision = parseKrnProposalReviewDecision({
        schema_version: "krn-proposal-review-decision.v1",
        kind: "krn_proposal_review_decision",
        decision_id: `decision-${proposal.proposal_id}`,
        proposal_id: proposal.proposal_id,
        proposal_path: proposalRelativePath,
        decision: "approved_for_promotion",
        review_scope: "proposal_review_only",
        target_mutated: false,
        promotion_state: "not_promoted",
        reviewer: "krn-init-eval",
        rationale: "The generated policy boundary seed is minimal, target is absent, and the exact payload is safe to apply.",
        write_policy: {
          default_effect: "no_target_mutation",
          allowed_persistence: "append_only",
          idempotency_key: `review-decision:${proposal.proposal_id}:approved`,
        },
        evidence_refs: proposal.evidence_refs,
        source_refs: proposal.source_refs,
        blocked_surfaces: ["target_file_mutation_without_promotion", "memory_core_write", "cloud_sync_default"],
        created_at: now.toISOString(),
        created_by: "krn init eval",
        interpretation_caveat:
          "This decision approves promotion input only; exact target write still requires explicit init apply mode.",
      });
      const storedDecision = storeKrnProposalReviewDecision(decision, { targetInput: policyBoundariesTarget, now });
      const applyResult = runKrnCli([
        "init",
        "--apply",
        "policy_boundaries",
        "--proposal-path",
        policyBoundariesProposalPath,
        "--decision-path",
        join(policyBoundariesTarget, storedDecision.decision_path),
        "--target",
        policyBoundariesTarget,
      ]);
      const promotionPath = applyResult.stdout.trim();
      const promotion = applyResult.exitCode === 0 ? parseKrnProposalPromotion(readJson(promotionPath)) : null;
      const targetPolicyPath = join(policyBoundariesTarget, ".krn", "policies", "boundaries.json");
      const policyContent = existsSync(targetPolicyPath) ? readFileSync(targetPolicyPath, "utf8") : "";
      const policy = policyContent.length > 0 ? parseKrnPolicyBoundaries(JSON.parse(policyContent) as unknown) : null;

      results.push(
        result(
          policyBoundariesApplyCase.id,
          applyResult.exitCode === 0 &&
            promotion?.proposal_kind === "init_bootstrap" &&
            promotion.promotion_scope === "approved_init_bootstrap_only" &&
            promotion.apply_mode === "apply_exact_target_write" &&
            existsSync(promotionPath) &&
            existsSync(targetPolicyPath) &&
            policyContent === promotion.target.file_content &&
            policy !== null &&
            policy?.boundaries.find((boundary) => boundary.surface === "memory_core_write")?.enforcement === "block" &&
            policy.boundaries.find((boundary) => boundary.surface === "target_file_mutation")?.enforcement ===
              "require_approval" &&
            policy.forbidden_defaults.includes("cloud_sync_default") &&
            policy.forbidden_defaults.includes("productivity_lift_claim") &&
            policy.overclaim_boundary.includes("does not prove hook enforcement") &&
            !policyContent.includes("goal-038") &&
            !policyContent.includes("docs/plans/canonical/draft.md"),
          [
            "proposal CLI exits zero",
            "approved review decision stored",
            "apply CLI exits zero",
            "promotion parses",
            "target .krn/policies/boundaries.json matches exact payload",
            "policy boundary seed blocks repo-local memory core and avoids hook/security overclaim",
          ],
          policyBoundariesApplyCase.failure_mode,
          applyResult.exitCode === 0
            ? "Generated init proposal applied exact reviewed policy boundary seed payload through promotion boundary."
            : applyResult.stderr,
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          policyBoundariesApplyCase.id,
          false,
          ["generated policy boundaries apply"],
          policyBoundariesApplyCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated policy boundaries apply error",
        ),
      );
    }
  }
  const proposalTarget = mkdtempSync(join(tmpdir(), "krn-init-proposal-eval-"));
  const proposalResult = runKrnCli(["init", "--proposal", "agent_instructions", "--target", proposalTarget]);
  const proposalPath = proposalResult.stdout.trim();
  if (proposalResult.exitCode !== 0) {
    results.push(
      result(
        proposalCase.id,
        false,
        ["CLI exits zero", "proposal parses"],
        proposalCase.failure_mode,
        proposalResult.stderr,
      ),
    );
  } else {
    try {
      const proposal = parseKrnControlPlaneProposal(readJson(proposalPath));
      const targetAgentsPath = join(proposalTarget, "AGENTS.md");
      results.push(
        result(
          proposalCase.id,
          proposal.proposal_kind === "init_bootstrap" &&
            proposal.target.target_type === "path" &&
            proposal.target.path === "AGENTS.md" &&
            proposal.write_policy.default_effect === "no_mutation" &&
            proposal.source_refs.every((sourceRef) => existsSync(join(proposalTarget, sourceRef))) &&
            existsSync(proposalPath) &&
            !existsSync(targetAgentsPath),
          [
            "CLI exits zero",
            "proposal parses",
            "proposal stored under .krn/proposals",
            "proposal source refs resolve to generated init manifest",
            "target AGENTS.md unchanged",
          ],
          proposalCase.failure_mode,
          "Generated agent-instructions proposal parsed and stayed proposal-only in an isolated target.",
        ),
      );
    } catch (error: unknown) {
      results.push(
        result(
          proposalCase.id,
          false,
          ["generated proposal parses"],
          proposalCase.failure_mode,
          error instanceof Error ? error.message : "unknown generated proposal error",
        ),
      );
    }
  }

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-init-contracts-result.v1",
    kind: "krn_init_contracts_result",
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
    generated_manifest_path: generatedManifestPath,
    interpretation_caveat:
      "This eval proves krn-init dry-run, proposal-only, and reviewed exact agent-instructions/local-config/source-pointers/context-pointers/eval-baseline/skill-wiring/policy-boundaries apply paths only; it does not prove productivity lift, dashboard readiness, MCP readiness, memory-core quality, source freshness, context quality, eval quality, skill quality, hook enforcement, broad repo bootstrap, or merge-mode safety.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-init-contracts", report.run_id);
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
