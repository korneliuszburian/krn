import { existsSync, readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseKrnPromotionReviewViewModel, type KrnPromotionReviewViewModel } from "@krn/contracts";
import { listKrnProposalReviewDecisionStoreRecords } from "./proposal-review-decision-store.js";
import { listKrnProposalPromotionStoreRecords } from "./proposal-promotion-store.js";
import { listKrnProposalStoreRecords, validateSourceRefs } from "./proposal-store.js";

const PROMOTION_REVIEW_SPEC_SOURCE_REFS = [
  "docs/specs/krn-proposal-promotion/README.md",
  "docs/specs/krn-promotion-review-view-model/README.md",
] as const;

type ValidPromotionRecord = ReturnType<typeof listKrnProposalPromotionStoreRecords>["valid_records"][number];

function targetFileState(
  record: ValidPromotionRecord,
  targetRoot: string,
): KrnPromotionReviewViewModel["promotions"][number]["target_file_state"] {
  const targetPath = resolve(targetRoot, record.promotion.target.path);
  const targetExists = existsSync(targetPath);
  const targetMatches = targetExists && readFileSync(targetPath, "utf8") === record.promotion.target.file_content;

  if (record.promotion.apply_mode === "record_only") {
    if (!targetExists) {
      return "not_applied_target_absent";
    }
    return targetMatches ? "not_applied_target_matches" : "not_applied_target_differs";
  }

  if (!targetExists) {
    return "applied_target_missing";
  }
  return targetMatches ? "applied_target_matches" : "applied_target_differs";
}

function referenceStatus(
  record: ValidPromotionRecord,
  proposalRecords: ReturnType<typeof listKrnProposalStoreRecords>,
  reviewRecords: ReturnType<typeof listKrnProposalReviewDecisionStoreRecords>,
): KrnPromotionReviewViewModel["promotions"][number]["reference_status"] {
  const proposalExists = proposalRecords.valid_records.some(
    (proposalRecord) =>
      proposalRecord.proposal.proposal_id === record.promotion.proposal_id &&
      proposalRecord.proposal_path === record.promotion.proposal_path,
  );
  const approvedDecisionExists = reviewRecords.valid_records.some(
    (reviewRecord) =>
      reviewRecord.decision.decision_id === record.promotion.decision_id &&
      reviewRecord.decision_path === record.promotion.decision_path &&
      reviewRecord.decision.proposal_id === record.promotion.proposal_id &&
      reviewRecord.decision.proposal_path === record.promotion.proposal_path &&
      reviewRecord.decision.decision === "approved_for_promotion",
  );

  return proposalExists && approvedDecisionExists ? "validated" : "missing_or_unapproved";
}

function promotionNextAction(
  targetFileStateValue: KrnPromotionReviewViewModel["promotions"][number]["target_file_state"],
  referenceStatusValue: KrnPromotionReviewViewModel["promotions"][number]["reference_status"],
  sourceRefStatusValue: KrnPromotionReviewViewModel["promotions"][number]["source_ref_status"],
): string {
  if (referenceStatusValue === "missing_or_unapproved") {
    return "Repair the promotion's proposal and approved review-decision references before treating it as reviewable.";
  }

  if (sourceRefStatusValue === "stale") {
    return "Repair stale promotion source refs before dashboard review can trust this row.";
  }

  if (targetFileStateValue.endsWith("_differs")) {
    return "Inspect target file drift before any exact apply or promotion audit claim.";
  }

  if (targetFileStateValue === "applied_target_missing") {
    return "Repair the missing applied target file or mark the promotion as invalid before claiming target state.";
  }

  return "Audit this promotion record and target status before adding any dashboard/API command surface.";
}

function promotionReviewNextAction(
  invalidRecords: number,
  missingReferences: number,
  staleSourceRefs: number,
  targetConflicts: number,
  validPromotions: number,
  sourceRefs: readonly string[],
): KrnPromotionReviewViewModel["next_allowed_action"] {
  if (invalidRecords > 0) {
    return {
      action_id: "repair-invalid-promotion-records",
      target_surface: "promotion_store",
      label: "Repair invalid promotion records",
      rationale: "Promotion Review must not present unparseable promotion files as audited promotion state.",
      source_refs: [...sourceRefs],
    };
  }

  if (missingReferences > 0) {
    return {
      action_id: "repair-promotion-references",
      target_surface: "proposal_review_store",
      label: "Repair promotion references",
      rationale: "Promotion records must reference an existing proposal and approved review decision.",
      source_refs: [...sourceRefs],
    };
  }

  if (staleSourceRefs > 0) {
    return {
      action_id: "repair-promotion-source-refs",
      target_surface: "source_refs",
      label: "Repair promotion source refs",
      rationale: "Promotion Review must not trust stale source-backed promotion evidence.",
      source_refs: [...sourceRefs],
    };
  }

  if (targetConflicts > 0) {
    return {
      action_id: "inspect-promotion-target-conflicts",
      target_surface: "target_files",
      label: "Inspect promotion target conflicts",
      rationale: "Promotion targets must match exact reviewed payloads before command readiness is claimed.",
      source_refs: [...sourceRefs],
    };
  }

  if (validPromotions > 0) {
    return {
      action_id: "audit-promotion-records",
      target_surface: "promotion_store",
      label: "Audit promotion records",
      rationale: "Promotion records are available for human audit, but dashboard commands remain blocked.",
      source_refs: [...sourceRefs],
    };
  }

  return {
    action_id: "wait-for-promotion-store-input",
    target_surface: "promotion_store",
    label: "Wait for promotion-store input",
    rationale: "No promotion records exist, so Promotion Review must render explicit zero state.",
    source_refs: [...sourceRefs],
  };
}

function isTargetConflict(state: KrnPromotionReviewViewModel["promotions"][number]["target_file_state"]): boolean {
  return state === "not_applied_target_differs" || state === "applied_target_missing" || state === "applied_target_differs";
}

function sourceRefsWithPromotionReviewSpec(sourceRefs: readonly string[]): string[] {
  return [...new Set([...sourceRefs, ...PROMOTION_REVIEW_SPEC_SOURCE_REFS])];
}

export function buildKrnPromotionReviewViewModel(targetInput = ".", now = new Date()): KrnPromotionReviewViewModel {
  const targetRoot = resolve(targetInput);
  const records = listKrnProposalPromotionStoreRecords(targetRoot);
  const proposalRecords = listKrnProposalStoreRecords(targetRoot);
  const reviewRecords = listKrnProposalReviewDecisionStoreRecords(targetRoot);

  const rows = records.valid_records
    .map((record) => {
      const sourceValidation = validateSourceRefs(record.promotion.source_refs, targetRoot);
      const sourceRefStatus = sourceValidation.valid ? "validated" : "stale";
      const refStatus = referenceStatus(record, proposalRecords, reviewRecords);
      const fileState = targetFileState(record, targetRoot);

      return {
        owner: "krn" as const,
        source_refs: record.promotion.source_refs,
        next_action: promotionNextAction(fileState, refStatus, sourceRefStatus),
        failure_mode:
          "Promotion Review rows are unsafe if they imply dashboard command readiness, hide missing approvals, or detach target state from exact payload content.",
        promotion_id: record.promotion.promotion_id,
        proposal_id: record.promotion.proposal_id,
        decision_id: record.promotion.decision_id,
        promotion_path: record.promotion_path,
        proposal_path: record.promotion.proposal_path,
        decision_path: record.promotion.decision_path,
        apply_mode: record.promotion.apply_mode,
        promotion_state: record.promotion.promotion_state,
        target_mutated: record.promotion.target_mutated,
        target_path: record.promotion.target.path,
        target_content_sha256: record.promotion.target.content_sha256,
        target_file_state: fileState,
        reference_status: refStatus,
        source_ref_status: sourceRefStatus,
        evidence_refs: record.promotion.evidence_refs,
        created_at: record.promotion.created_at,
        interpretation_caveat:
          "This row audits a local promotion record only; it does not expose a dashboard promote command, HTTP/API write route, ChatGPT connector, or productivity proof.",
      };
    })
    .sort(
      (left, right) =>
        left.created_at.localeCompare(right.created_at) ||
        left.promotion_path.localeCompare(right.promotion_path) ||
        left.promotion_id.localeCompare(right.promotion_id),
    );

  const missingReferences = rows.filter((row) => row.reference_status === "missing_or_unapproved").length;
  const staleSourceRefs = rows.filter((row) => row.source_ref_status === "stale").length;
  const targetConflicts = rows.filter((row) => isTargetConflict(row.target_file_state)).length;
  const queueState =
    records.invalid_records.length > 0 || missingReferences > 0 || staleSourceRefs > 0 || targetConflicts > 0
      ? "blocked"
      : rows.length > 0
        ? "ready"
        : "empty";

  const hasStoreState = rows.length > 0 || records.invalid_records.length > 0;
  const sourceRefs = sourceRefsWithPromotionReviewSpec(rows.flatMap((row) => row.source_refs));

  return parseKrnPromotionReviewViewModel({
    schema_version: "krn-promotion-review-view-model.v1",
    kind: "krn_promotion_review_view_model",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    no_mock_state: true,
    source: hasStoreState ? "promotion_store" : "explicit_zero_no_promotions",
    queue_state: queueState,
    total_records: records.total_records,
    valid_promotions: rows.length,
    invalid_records_count: records.invalid_records.length,
    planned_promotions: rows.filter((row) => row.promotion_state === "planned").length,
    applied_promotions: rows.filter((row) => row.promotion_state === "applied").length,
    missing_or_unapproved_reference_promotions: missingReferences,
    stale_source_ref_promotions: staleSourceRefs,
    target_conflict_promotions: targetConflicts,
    promotions: rows,
    invalid_records: records.invalid_records.map((record) => ({
      promotion_path: record.promotion_path,
      error_summary: record.error_summary,
    })),
    next_allowed_action: promotionReviewNextAction(
      records.invalid_records.length,
      missingReferences,
      staleSourceRefs,
      targetConflicts,
      rows.length,
      sourceRefs,
    ),
    blocked_actions: [
      "dashboard_promote_button",
      "apply_promotion_from_dashboard",
      "http_api_write_route",
      "destructive_mcp_tool",
      "write_memory",
      "overwrite_target",
    ],
    source_refs: sourceRefs,
    failure_mode:
      "Promotion Review becomes harmful if audited promotion records are overclaimed as dashboard command readiness, broad write safety, human review quality, or productivity lift.",
    interpretation_caveat:
      "This view model renders local .krn/promotions records and target-file status only; it does not mutate targets, expose write APIs, register dashboard commands, or prove measured lift.",
  });
}
