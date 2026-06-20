import { resolve } from "node:path";
import { parseKrnPendingReviewViewModel, type KrnPendingReviewViewModel } from "@krn/contracts";
import { listKrnProposalStoreRecords, validateProposalSourceRefs } from "./proposal-store.js";

const PENDING_REVIEW_SOURCE_REFS = [
  "docs/goals/goal-006.md",
  "docs/goals/goal-011.md",
  "docs/specs/krn-pending-review-view-model/README.md",
  "docs/specs/krn-control-plane-proposal/README.md",
] as const;

function targetLabel(record: ReturnType<typeof listKrnProposalStoreRecords>["valid_records"][number]): string {
  const target = record.proposal.target;
  return target.target_type === "path" ? target.path : target.uri;
}

function pendingReviewNextAction(
  invalidRecords: number,
  staleSourceRefProposals: number,
  pendingProposals: number,
): KrnPendingReviewViewModel["next_allowed_action"] {
  if (invalidRecords > 0) {
    return {
      action_id: "repair-invalid-proposal-records",
      target_surface: "proposal_store",
      label: "Repair invalid proposal records",
      rationale: "Pending Review must not present unparseable proposal files as reviewable work.",
      source_refs: [...PENDING_REVIEW_SOURCE_REFS],
    };
  }

  if (staleSourceRefProposals > 0) {
    return {
      action_id: "repair-stale-source-refs",
      target_surface: "source_refs",
      label: "Repair stale proposal source refs",
      rationale: "Pending Review must not promote proposals whose source refs no longer resolve.",
      source_refs: [...PENDING_REVIEW_SOURCE_REFS],
    };
  }

  if (pendingProposals > 0) {
    return {
      action_id: "review-pending-proposals",
      target_surface: "proposal_store",
      label: "Review pending proposal records",
      rationale: "Proposal-store records are available and require human review before promotion.",
      source_refs: [...PENDING_REVIEW_SOURCE_REFS],
    };
  }

  return {
    action_id: "wait-for-proposal-store-input",
    target_surface: "proposal_store",
    label: "Wait for proposal-store input",
    rationale: "No proposal records exist, so Pending Review must render explicit zero state.",
    source_refs: [...PENDING_REVIEW_SOURCE_REFS],
  };
}

export function buildKrnPendingReviewViewModel(targetInput = ".", now = new Date()): KrnPendingReviewViewModel {
  const targetRoot = resolve(targetInput);
  const records = listKrnProposalStoreRecords(targetRoot);
  const proposalRows = records.valid_records
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
    records.invalid_records.length > 0 || staleSourceRefProposals > 0
      ? "blocked"
      : proposalRows.length > 0
        ? "ready"
        : "empty";

  return parseKrnPendingReviewViewModel({
    schema_version: "krn-pending-review-view-model.v1",
    kind: "krn_pending_review_view_model",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    no_mock_state: true,
    source: proposalRows.length > 0 || records.invalid_records.length > 0 ? "proposal_store" : "explicit_zero_no_proposals",
    queue_state: queueState,
    total_records: records.total_records,
    pending_proposals: proposalRows.length,
    invalid_records_count: records.invalid_records.length,
    stale_source_ref_proposals: staleSourceRefProposals,
    proposals: proposalRows,
    invalid_records: records.invalid_records,
    next_allowed_action: pendingReviewNextAction(
      records.invalid_records.length,
      staleSourceRefProposals,
      proposalRows.length,
    ),
    blocked_actions: [
      "approve_proposal",
      "reject_proposal",
      "mutate_target",
      "write_memory",
      "write_source_ledger",
      "publish_dashboard_event",
    ],
    source_refs: [...PENDING_REVIEW_SOURCE_REFS],
    failure_mode:
      "Pending Review becomes harmful if proposal records are treated as approved truth, hidden chat state, or dashboard UI readiness.",
    interpretation_caveat:
      "This view model renders local proposal-store records for human review only; it does not approve proposals, mutate targets, expose HTTP/API, or prove productivity lift.",
  });
}
