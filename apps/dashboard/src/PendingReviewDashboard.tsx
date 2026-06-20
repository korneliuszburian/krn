import {
  AlertTriangle,
  CircleDot,
  Database,
  FileCheck2,
  FileWarning,
  ListChecks,
  ShieldAlert,
} from "lucide-react";
import React, { type ReactElement } from "react";
import type {
  KrnPendingReviewViewModel,
  PendingReviewDecisionConflict,
  PendingReviewInvalidRecord,
  PendingReviewInvalidReviewDecisionRecord,
  PendingReviewProposal,
} from "@krn/contracts";

const queueLabels: Record<KrnPendingReviewViewModel["queue_state"], string> = {
  ready: "Ready",
  empty: "Empty",
  blocked: "Blocked",
};

const sourceRefLabels: Record<PendingReviewProposal["source_ref_status"], string> = {
  validated: "Validated",
  stale: "Stale",
};

function formatKind(kind: PendingReviewProposal["proposal_kind"]): string {
  return kind.replaceAll("_", " ");
}

function MetricTile(props: {
  label: string;
  value: string | number;
  tone: "neutral" | "ready" | "blocked" | "empty";
  icon: ReactElement;
}): ReactElement {
  return (
    <section className={`metric-tile metric-tile--${props.tone}`} aria-label={props.label}>
      <div className="metric-icon" aria-hidden="true">
        {props.icon}
      </div>
      <p>{props.label}</p>
      <strong>{props.value}</strong>
    </section>
  );
}

function SourceRefs(props: { sourceRefs: readonly string[] }): ReactElement {
  return (
    <ul className="source-list" aria-label="Source refs">
      {props.sourceRefs.map((sourceRef) => (
        <li key={sourceRef}>{sourceRef}</li>
      ))}
    </ul>
  );
}

function ProposalRow(props: { proposal: PendingReviewProposal }): ReactElement {
  const { proposal } = props;
  const sourceTone = proposal.source_ref_status === "validated" ? "ready" : "blocked";

  return (
    <article className="proposal-row">
      <div className="row-main">
        <div className="row-icon" aria-hidden="true">
          {proposal.source_ref_status === "validated" ? <FileCheck2 size={18} /> : <FileWarning size={18} />}
        </div>
        <div className="row-copy">
          <div className="row-heading">
            <h2>{proposal.title}</h2>
            <span className={`status-chip status-chip--${sourceTone}`}>{sourceRefLabels[proposal.source_ref_status]}</span>
          </div>
          <p>{formatKind(proposal.proposal_kind)}</p>
        </div>
      </div>
      <dl className="row-details">
        <div>
          <dt>Owner</dt>
          <dd>{proposal.owner}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{proposal.target_label}</dd>
        </div>
        <div>
          <dt>Record</dt>
          <dd>{proposal.proposal_path}</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>{proposal.next_action}</dd>
        </div>
        <div>
          <dt>Failure mode</dt>
          <dd>{proposal.failure_mode}</dd>
        </div>
      </dl>
      <SourceRefs sourceRefs={proposal.source_refs} />
    </article>
  );
}

function InvalidRecord(props: { record: PendingReviewInvalidRecord }): ReactElement {
  return (
    <article className="invalid-row">
      <FileWarning size={18} aria-hidden="true" />
      <div>
        <h2>{props.record.proposal_path}</h2>
        <p>{props.record.error_summary}</p>
      </div>
    </article>
  );
}

function InvalidReviewDecision(props: { record: PendingReviewInvalidReviewDecisionRecord }): ReactElement {
  return (
    <article className="invalid-row">
      <ShieldAlert size={18} aria-hidden="true" />
      <div>
        <h2>{props.record.decision_path}</h2>
        <p>{props.record.error_summary}</p>
      </div>
    </article>
  );
}

function ReviewDecisionConflict(props: { conflict: PendingReviewDecisionConflict }): ReactElement {
  return (
    <article className="invalid-row">
      <AlertTriangle size={18} aria-hidden="true" />
      <div>
        <h2>{props.conflict.proposal_id}</h2>
        <p>{props.conflict.error_summary}</p>
        <SourceRefs sourceRefs={props.conflict.decision_paths} />
      </div>
    </article>
  );
}

export function PendingReviewDashboard(props: { viewModel: KrnPendingReviewViewModel }): ReactElement {
  const { viewModel } = props;
  const queueTone = viewModel.queue_state === "ready" ? "ready" : viewModel.queue_state === "blocked" ? "blocked" : "empty";

  return (
    <main className="dashboard">
      <section className="dashboard-header" aria-labelledby="pending-review-title">
        <div>
          <p className="eyebrow">{viewModel.source}</p>
          <h1 id="pending-review-title">Pending Review</h1>
          <p>{viewModel.next_allowed_action.rationale}</p>
        </div>
        <span className={`queue-state queue-state--${queueTone}`}>
          <CircleDot size={14} strokeWidth={3} aria-hidden="true" />
          {queueLabels[viewModel.queue_state]}
        </span>
      </section>

      <section className="metric-grid" aria-label="Pending Review metrics">
        <MetricTile label="Total records" value={viewModel.total_records} tone="neutral" icon={<Database size={18} />} />
        <MetricTile label="Pending" value={viewModel.pending_proposals} tone="ready" icon={<ListChecks size={18} />} />
        <MetricTile
          label="Invalid"
          value={viewModel.invalid_records_count}
          tone={viewModel.invalid_records_count > 0 ? "blocked" : "neutral"}
          icon={<ShieldAlert size={18} />}
        />
        <MetricTile
          label="Stale refs"
          value={viewModel.stale_source_ref_proposals}
          tone={viewModel.stale_source_ref_proposals > 0 ? "blocked" : "neutral"}
          icon={<AlertTriangle size={18} />}
        />
        <MetricTile label="Reviewed" value={viewModel.reviewed_proposals} tone="empty" icon={<FileCheck2 size={18} />} />
        <MetricTile
          label="Review errors"
          value={viewModel.invalid_review_decisions_count + viewModel.conflicting_review_decisions_count}
          tone={
            viewModel.invalid_review_decisions_count + viewModel.conflicting_review_decisions_count > 0
              ? "blocked"
              : "neutral"
          }
          icon={<ShieldAlert size={18} />}
        />
      </section>

      <section className="action-panel" aria-label="Next allowed action">
        <div>
          <p>Next action</p>
          <h2>{viewModel.next_allowed_action.label}</h2>
        </div>
        <p>{viewModel.next_allowed_action.rationale}</p>
      </section>

      {viewModel.proposals.length > 0 ? (
        <section className="proposal-list" aria-label="Proposal records">
          {viewModel.proposals.map((proposal) => (
            <ProposalRow key={proposal.proposal_id} proposal={proposal} />
          ))}
        </section>
      ) : (
        <section className="empty-state" aria-label="Empty proposal queue">
          <Database size={22} aria-hidden="true" />
          <h2>No proposal records</h2>
          <p>{viewModel.interpretation_caveat}</p>
        </section>
      )}

      {viewModel.invalid_records.length > 0 ? (
        <section className="invalid-list" aria-label="Invalid proposal records">
          {viewModel.invalid_records.map((record) => (
            <InvalidRecord key={record.proposal_path} record={record} />
          ))}
        </section>
      ) : null}

      {viewModel.invalid_review_decisions.length > 0 ? (
        <section className="invalid-list" aria-label="Invalid review decision records">
          {viewModel.invalid_review_decisions.map((record) => (
            <InvalidReviewDecision key={record.decision_path} record={record} />
          ))}
        </section>
      ) : null}

      {viewModel.review_decision_conflicts.length > 0 ? (
        <section className="invalid-list" aria-label="Review decision conflicts">
          {viewModel.review_decision_conflicts.map((conflict) => (
            <ReviewDecisionConflict key={conflict.proposal_id} conflict={conflict} />
          ))}
        </section>
      ) : null}

      <section className="evidence-band" aria-label="Dashboard evidence">
        <div>
          <p>Owner</p>
          <strong>krn</strong>
        </div>
        <div>
          <p>Generated</p>
          <strong>{viewModel.generated_at}</strong>
        </div>
        <div>
          <p>Failure mode</p>
          <strong>{viewModel.failure_mode}</strong>
        </div>
      </section>
    </main>
  );
}
