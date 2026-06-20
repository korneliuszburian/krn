import {
  AlertTriangle,
  ArchiveRestore,
  CircleDot,
  FileCheck2,
  FileWarning,
  Gauge,
  ShieldAlert,
} from "lucide-react";
import React, { type ReactElement } from "react";
import type {
  KrnPromotionReviewViewModel,
  PromotionReviewInvalidRecord,
  PromotionReviewPromotion,
} from "@krn/contracts";

const queueLabels: Record<KrnPromotionReviewViewModel["queue_state"], string> = {
  ready: "Ready",
  empty: "Empty",
  blocked: "Blocked",
};

const fileStateLabels: Record<PromotionReviewPromotion["target_file_state"], string> = {
  not_applied_target_absent: "Not applied",
  not_applied_target_matches: "Already matches",
  not_applied_target_differs: "Target differs",
  applied_target_matches: "Applied",
  applied_target_missing: "Missing target",
  applied_target_differs: "Target drifted",
};

function stateTone(state: PromotionReviewPromotion["target_file_state"]): "ready" | "blocked" | "empty" {
  if (state === "not_applied_target_absent") {
    return "empty";
  }
  if (state === "not_applied_target_matches" || state === "applied_target_matches") {
    return "ready";
  }
  return "blocked";
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

function PromotionRow(props: { promotion: PromotionReviewPromotion }): ReactElement {
  const { promotion } = props;
  const tone = stateTone(promotion.target_file_state);
  const isBlocked =
    promotion.reference_status === "missing_or_unapproved" ||
    promotion.source_ref_status === "stale" ||
    tone === "blocked";

  return (
    <article className="proposal-row">
      <div className="row-main">
        <div className="row-icon" aria-hidden="true">
          {isBlocked ? <FileWarning size={18} /> : <FileCheck2 size={18} />}
        </div>
        <div className="row-copy">
          <div className="row-heading">
            <h2>{promotion.promotion_id}</h2>
            <span className={`status-chip status-chip--${isBlocked ? "blocked" : tone}`}>
              {fileStateLabels[promotion.target_file_state]}
            </span>
          </div>
          <p>{promotion.apply_mode.replaceAll("_", " ")}</p>
        </div>
      </div>
      <dl className="row-details">
        <div>
          <dt>Owner</dt>
          <dd>{promotion.owner}</dd>
        </div>
        <div>
          <dt>Target</dt>
          <dd>{promotion.target_path}</dd>
        </div>
        <div>
          <dt>Record</dt>
          <dd>{promotion.promotion_path}</dd>
        </div>
        <div>
          <dt>References</dt>
          <dd>{promotion.reference_status}</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>{promotion.next_action}</dd>
        </div>
        <div>
          <dt>Failure mode</dt>
          <dd>{promotion.failure_mode}</dd>
        </div>
      </dl>
      <SourceRefs sourceRefs={promotion.source_refs} />
    </article>
  );
}

function InvalidPromotionRecord(props: { record: PromotionReviewInvalidRecord }): ReactElement {
  return (
    <article className="invalid-row">
      <ShieldAlert size={18} aria-hidden="true" />
      <div>
        <h2>{props.record.promotion_path}</h2>
        <p>{props.record.error_summary}</p>
      </div>
    </article>
  );
}

export function PromotionReviewDashboard(props: { viewModel: KrnPromotionReviewViewModel }): ReactElement {
  const { viewModel } = props;
  const queueTone = viewModel.queue_state === "ready" ? "ready" : viewModel.queue_state === "blocked" ? "blocked" : "empty";

  return (
    <section className="dashboard dashboard-section" aria-labelledby="promotion-review-title">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">{viewModel.source}</p>
          <h1 id="promotion-review-title">Promotion Review</h1>
          <p>{viewModel.next_allowed_action.rationale}</p>
        </div>
        <span className={`queue-state queue-state--${queueTone}`}>
          <CircleDot size={14} strokeWidth={3} aria-hidden="true" />
          {queueLabels[viewModel.queue_state]}
        </span>
      </div>

      <section className="metric-grid" aria-label="Promotion Review metrics">
        <MetricTile label="Promotions" value={viewModel.valid_promotions} tone="neutral" icon={<ArchiveRestore size={18} />} />
        <MetricTile label="Planned" value={viewModel.planned_promotions} tone="empty" icon={<Gauge size={18} />} />
        <MetricTile label="Applied" value={viewModel.applied_promotions} tone="ready" icon={<FileCheck2 size={18} />} />
        <MetricTile
          label="Blocked"
          value={
            viewModel.invalid_records_count +
            viewModel.missing_or_unapproved_reference_promotions +
            viewModel.stale_source_ref_promotions +
            viewModel.target_conflict_promotions
          }
          tone={
            viewModel.invalid_records_count +
              viewModel.missing_or_unapproved_reference_promotions +
              viewModel.stale_source_ref_promotions +
              viewModel.target_conflict_promotions >
            0
              ? "blocked"
              : "neutral"
          }
          icon={<AlertTriangle size={18} />}
        />
      </section>

      <section className="action-panel" aria-label="Promotion Review next allowed action">
        <div>
          <p>Next action</p>
          <h2>{viewModel.next_allowed_action.label}</h2>
        </div>
        <p>{viewModel.next_allowed_action.rationale}</p>
      </section>

      {viewModel.promotions.length > 0 ? (
        <section className="proposal-list" aria-label="Promotion records">
          {viewModel.promotions.map((promotion) => (
            <PromotionRow key={promotion.promotion_id} promotion={promotion} />
          ))}
        </section>
      ) : (
        <section className="empty-state" aria-label="Empty promotion ledger">
          <ArchiveRestore size={22} aria-hidden="true" />
          <h2>No promotion records</h2>
          <p>{viewModel.interpretation_caveat}</p>
        </section>
      )}

      {viewModel.invalid_records.length > 0 ? (
        <section className="invalid-list" aria-label="Invalid promotion records">
          {viewModel.invalid_records.map((record) => (
            <InvalidPromotionRecord key={record.promotion_path} record={record} />
          ))}
        </section>
      ) : null}

      <section className="evidence-band" aria-label="Promotion Review evidence">
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
    </section>
  );
}
