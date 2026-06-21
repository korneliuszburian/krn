import { resolve } from "node:path";
import { parseKrnPendingReviewViewModel, type KrnPendingReviewViewModel } from "@krn/contracts";
import { listKrnProposalReviewDecisionStoreRecords } from "./proposal-review-decision-store.js";
import { listKrnProposalStoreRecords, validateProposalSourceRefs, validateSourceRefs } from "./proposal-store.js";

const PENDING_REVIEW_SPEC_SOURCE_REFS = [
  "docs/specs/krn-pending-review-view-model/README.md",
  "docs/specs/krn-control-plane-proposal/README.md",
  "docs/specs/krn-proposal-review-decision/README.md",
] as const;

type ValidProposalRecord = ReturnType<typeof listKrnProposalStoreRecords>["valid_records"][number];
type ValidReviewDecisionRecord = ReturnType<typeof listKrnProposalReviewDecisionStoreRecords>["valid_records"][number];
type InvalidReviewDecisionRecord = KrnPendingReviewViewModel["invalid_review_decisions"][number];
type ReviewDecisionConflict = KrnPendingReviewViewModel["review_decision_conflicts"][number];

function targetLabel(record: ReturnType<typeof listKrnProposalStoreRecords>["valid_records"][number]): string {
  const target = record.proposal.target;
  return target.target_type === "path" ? target.path : target.uri;
}

function proposalRecordKey(record: ValidProposalRecord): string {
  return `${record.proposal.proposal_id}\u0000${record.proposal_path}`;
}

function reviewDecisionReferenceKey(record: ValidReviewDecisionRecord): string {
  return `${record.decision.proposal_id}\u0000${record.decision.proposal_path}`;
}

function semanticReviewDecisionRecords(
  proposalRecords: readonly ValidProposalRecord[],
  reviewRecords: ReturnType<typeof listKrnProposalReviewDecisionStoreRecords>,
  targetRoot: string,
): {
  valid_records: ValidReviewDecisionRecord[];
  invalid_records: InvalidReviewDecisionRecord[];
} {
  const proposalKeys = new Set(proposalRecords.map(proposalRecordKey));
  const validRecords: ValidReviewDecisionRecord[] = [];
  const invalidRecords: InvalidReviewDecisionRecord[] = reviewRecords.invalid_records.map((record) => ({
    decision_path: record.decision_path,
    error_summary: record.error_summary,
  }));

  for (const record of reviewRecords.valid_records) {
    const sourceValidation = validateSourceRefs(record.decision.source_refs, targetRoot);
    if (!proposalKeys.has(reviewDecisionReferenceKey(record))) {
      invalidRecords.push({
        decision_path: record.decision_path,
        error_summary: `Review decision references missing proposal: ${record.decision.proposal_id} at ${record.decision.proposal_path}`,
      });
      continue;
    }

    if (!sourceValidation.valid) {
      invalidRecords.push({
        decision_path: record.decision_path,
        error_summary: `Review decision source_refs are stale or unbacked: ${sourceValidation.rejected.join(", ")}`,
      });
      continue;
    }

    validRecords.push(record);
  }

  return { valid_records: validRecords, invalid_records: invalidRecords };
}

function reviewDecisionConflicts(validReviewRecords: readonly ValidReviewDecisionRecord[]): ReviewDecisionConflict[] {
  const byProposalId = new Map<string, ValidReviewDecisionRecord[]>();

  for (const record of validReviewRecords) {
    const existing = byProposalId.get(record.decision.proposal_id) ?? [];
    existing.push(record);
    byProposalId.set(record.decision.proposal_id, existing);
  }

  return [...byProposalId.entries()]
    .filter(([, records]) => records.length > 1)
    .map(([proposalId, records]) => ({
      proposal_id: proposalId,
      decision_paths: records.map((record) => record.decision_path).sort(),
      error_summary: "Multiple terminal review decisions exist for the same proposal.",
    }))
    .sort((left, right) => left.proposal_id.localeCompare(right.proposal_id));
}

function reviewedProposalKeys(
  validReviewRecords: readonly ValidReviewDecisionRecord[],
  conflicts: readonly ReviewDecisionConflict[],
): Set<string> {
  const conflictedProposalIds = new Set(conflicts.map((conflict) => conflict.proposal_id));
  return new Set(
    validReviewRecords
      .filter((record) => !conflictedProposalIds.has(record.decision.proposal_id))
      .map(reviewDecisionReferenceKey),
  );
}

function sourceRefsWithPendingReviewSpec(sourceRefs: readonly string[]): string[] {
  return [...new Set([...sourceRefs, ...PENDING_REVIEW_SPEC_SOURCE_REFS])];
}

function pendingReviewNextAction(
  invalidProposalRecords: number,
  invalidReviewDecisionRecords: number,
  conflictingReviewDecisions: number,
  staleSourceRefProposals: number,
  pendingProposals: number,
  sourceRefs: readonly string[],
): KrnPendingReviewViewModel["next_allowed_action"] {
  if (invalidProposalRecords > 0) {
    return {
      action_id: "repair-invalid-proposal-records",
      target_surface: "proposal_store",
      label: "Repair invalid proposal records",
      rationale: "Pending Review must not present unparseable proposal files as reviewable work.",
      source_refs: [...sourceRefs],
    };
  }

  if (invalidReviewDecisionRecords > 0) {
    return {
      action_id: "repair-invalid-review-decisions",
      target_surface: "proposal_review_store",
      label: "Repair invalid review decision records",
      rationale: "Pending Review must not treat invalid proposal review decisions as closed review state.",
      source_refs: [...sourceRefs],
    };
  }

  if (conflictingReviewDecisions > 0) {
    return {
      action_id: "repair-conflicting-review-decisions",
      target_surface: "proposal_review_store",
      label: "Repair conflicting review decisions",
      rationale: "A proposal cannot be safely removed from Pending Review while multiple terminal decisions exist.",
      source_refs: [...sourceRefs],
    };
  }

  if (staleSourceRefProposals > 0) {
    return {
      action_id: "repair-stale-source-refs",
      target_surface: "source_refs",
      label: "Repair stale proposal source refs",
      rationale: "Pending Review must not promote proposals whose source refs no longer resolve.",
      source_refs: [...sourceRefs],
    };
  }

  if (pendingProposals > 0) {
    return {
      action_id: "review-pending-proposals",
      target_surface: "proposal_store",
      label: "Review pending proposal records",
      rationale: "Proposal-store records are available and require human review before promotion.",
      source_refs: [...sourceRefs],
    };
  }

  return {
    action_id: "wait-for-proposal-store-input",
    target_surface: "proposal_store",
    label: "Wait for proposal-store input",
    rationale: "No proposal records exist, so Pending Review must render explicit zero state.",
    source_refs: [...sourceRefs],
  };
}

export function buildKrnPendingReviewViewModel(targetInput = ".", now = new Date()): KrnPendingReviewViewModel {
  const targetRoot = resolve(targetInput);
  const records = listKrnProposalStoreRecords(targetRoot);
  const reviewRecords = listKrnProposalReviewDecisionStoreRecords(targetRoot);
  const semanticReviewRecords = semanticReviewDecisionRecords(records.valid_records, reviewRecords, targetRoot);
  const reviewConflicts = reviewDecisionConflicts(semanticReviewRecords.valid_records);
  const reviewedKeys = reviewedProposalKeys(semanticReviewRecords.valid_records, reviewConflicts);
  const proposalRows = records.valid_records
    .filter((record) => !reviewedKeys.has(proposalRecordKey(record)))
    .map((record) => {
      const sourceValidation = validateProposalSourceRefs(record.proposal, targetRoot);
      const sourceRefStatus = sourceValidation.valid ? "validated" : "stale";

      return {
        owner: "krn" as const,
        source_refs: record.proposal.source_refs,
        next_action:
          sourceRefStatus === "validated"
            ? "Review this proposal record before promoting any memory, source, goal, eval, repair, or dashboard change."
            : "Repair this proposal's source refs before human review can promote it.",
        failure_mode:
          "Pending Review rows are unsafe if they imply approval, hide stale source refs, or detach from the proposal-store record.",
        proposal_id: record.proposal.proposal_id,
        proposal_kind: record.proposal.proposal_kind,
        status: record.proposal.status,
        title: record.proposal.title,
        proposal_path: record.proposal_path,
        target_type: record.proposal.target.target_type,
        target_label: targetLabel(record),
        idempotency_key: record.idempotency_key,
        review_gate_state: record.proposal.review_gate.state,
        source_ref_status: sourceRefStatus,
        evidence_refs: record.proposal.evidence_refs,
        created_at: record.proposal.created_at,
        interpretation_caveat:
          "This row is review input only; it does not approve the proposal, mutate its target, or promote memory/source changes.",
      };
    })
    .sort((left, right) => left.created_at.localeCompare(right.created_at) || left.proposal_path.localeCompare(right.proposal_path));

  const staleSourceRefProposals = proposalRows.filter((proposal) => proposal.source_ref_status === "stale").length;
  const queueState =
    records.invalid_records.length > 0 ||
    semanticReviewRecords.invalid_records.length > 0 ||
    reviewConflicts.length > 0 ||
    staleSourceRefProposals > 0
      ? "blocked"
      : proposalRows.length > 0
        ? "ready"
        : "empty";
  const hasStoreState =
    proposalRows.length > 0 ||
    records.invalid_records.length > 0 ||
    reviewRecords.total_records > 0 ||
    semanticReviewRecords.invalid_records.length > 0 ||
    reviewConflicts.length > 0;
  const sourceRefs = sourceRefsWithPendingReviewSpec([
    ...proposalRows.flatMap((proposal) => proposal.source_refs),
    ...semanticReviewRecords.valid_records.flatMap((record) => record.decision.source_refs),
  ]);

  return parseKrnPendingReviewViewModel({
    schema_version: "krn-pending-review-view-model.v1",
    kind: "krn_pending_review_view_model",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    no_mock_state: true,
    source: hasStoreState ? "proposal_store" : "explicit_zero_no_proposals",
    queue_state: queueState,
    total_records: records.total_records,
    total_review_decisions: reviewRecords.total_records,
    pending_proposals: proposalRows.length,
    reviewed_proposals: reviewedKeys.size,
    invalid_records_count: records.invalid_records.length,
    invalid_review_decisions_count: semanticReviewRecords.invalid_records.length,
    conflicting_review_decisions_count: reviewConflicts.length,
    stale_source_ref_proposals: staleSourceRefProposals,
    proposals: proposalRows,
    invalid_records: records.invalid_records,
    invalid_review_decisions: semanticReviewRecords.invalid_records,
    review_decision_conflicts: reviewConflicts,
    next_allowed_action: pendingReviewNextAction(
      records.invalid_records.length,
      semanticReviewRecords.invalid_records.length,
      reviewConflicts.length,
      staleSourceRefProposals,
      proposalRows.length,
      sourceRefs,
    ),
    blocked_actions: [
      "approve_proposal",
      "reject_proposal",
      "record_review_decision_from_dashboard",
      "mutate_target",
      "write_memory",
      "write_source_ledger",
      "publish_dashboard_event",
    ],
    source_refs: sourceRefs,
    failure_mode:
      "Pending Review becomes harmful if proposal or review decision records are treated as approved truth, hidden chat state, or dashboard UI readiness.",
    interpretation_caveat:
      "This view model renders local proposal-store and proposal-review decision records for human review only; it does not promote approved proposals, mutate targets, expose HTTP/API, or prove productivity lift.",
  });
}
