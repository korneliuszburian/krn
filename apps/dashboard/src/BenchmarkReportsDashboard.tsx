import { BarChart3, CircleDot, FileWarning, ShieldAlert, TrendingDown } from "lucide-react";
import React, { type ReactElement } from "react";
import type { BenchmarkReportRow, KrnBenchmarkReportsViewModel } from "@krn/contracts";

const benchmarkStateLabels: Record<KrnBenchmarkReportsViewModel["queue_state"], string> = {
  ready: "Ready",
  empty: "Empty",
  blocked: "Blocked",
};

function stateTone(state: KrnBenchmarkReportsViewModel["queue_state"]): "ready" | "blocked" | "empty" {
  if (state === "ready") {
    return "ready";
  }
  if (state === "blocked") {
    return "blocked";
  }
  return "empty";
}

function reportTone(report: BenchmarkReportRow): "ready" | "blocked" | "empty" {
  if (report.assisted_minus_baseline < 0 || report.failed_task_count > 0 || report.blocked_task_count > 0) {
    return "blocked";
  }
  if (report.lift_status === "positive_lift" && report.productivity_lift_claimed) {
    return "ready";
  }
  return "empty";
}

function formatDelta(delta: number): string {
  return delta > 0 ? `+${delta}` : String(delta);
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

function BenchmarkReportRow(props: { report: BenchmarkReportRow }): ReactElement {
  const { report } = props;
  const tone = reportTone(report);
  const firstRepairTarget = report.repair_targets[0];

  return (
    <article className="proposal-row">
      <div className="row-main">
        <div className="row-icon" aria-hidden="true">
          {tone === "blocked" ? <TrendingDown size={18} /> : <BarChart3 size={18} />}
        </div>
        <div className="row-copy">
          <div className="row-heading">
            <h2>{report.benchmark_id}</h2>
            <span className={`status-chip status-chip--${tone}`}>
              {report.lift_status.replaceAll("_", " ")}
            </span>
          </div>
          <p>{report.report_path}</p>
        </div>
      </div>
      <dl className="row-details">
        <div>
          <dt>Mode</dt>
          <dd>{report.measurement_mode.replaceAll("_", " ")}</dd>
        </div>
        <div>
          <dt>Suite</dt>
          <dd>{report.suite_id}</dd>
        </div>
        <div>
          <dt>Tasks</dt>
          <dd>
            {report.completed_task_count}/{report.task_count}
          </dd>
        </div>
        <div>
          <dt>Delta</dt>
          <dd>{formatDelta(report.assisted_minus_baseline)}</dd>
        </div>
        <div>
          <dt>Lift claimed</dt>
          <dd>{report.productivity_lift_claimed ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>{report.next_action}</dd>
        </div>
        <div>
          <dt>Repair target</dt>
          <dd>{firstRepairTarget ? firstRepairTarget.next_action : "No repair target"}</dd>
        </div>
        <div>
          <dt>Failure mode</dt>
          <dd>{report.failure_mode}</dd>
        </div>
      </dl>
      <SourceRefs sourceRefs={report.source_refs} />
    </article>
  );
}

export function BenchmarkReportsDashboard(props: { viewModel: KrnBenchmarkReportsViewModel }): ReactElement {
  const { viewModel } = props;
  const queueTone = stateTone(viewModel.queue_state);

  return (
    <section className="dashboard dashboard-section" aria-labelledby="benchmark-reports-title">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">{viewModel.source}</p>
          <h1 id="benchmark-reports-title">Benchmark Reports</h1>
          <p>{viewModel.next_allowed_action.rationale}</p>
        </div>
        <span className={`queue-state queue-state--${queueTone}`}>
          <CircleDot size={14} strokeWidth={3} aria-hidden="true" />
          {benchmarkStateLabels[viewModel.queue_state]}
        </span>
      </div>

      <section className="metric-grid" aria-label="Benchmark Reports metrics">
        <MetricTile label="Reports" value={viewModel.valid_reports} tone="neutral" icon={<BarChart3 size={18} />} />
        <MetricTile
          label="Live"
          value={viewModel.live_codex_exec_reports}
          tone={viewModel.live_codex_exec_reports > 0 ? "ready" : "empty"}
          icon={<CircleDot size={18} />}
        />
        <MetricTile
          label="No Lift"
          value={viewModel.no_lift_reports}
          tone={viewModel.no_lift_reports > 0 ? "empty" : "neutral"}
          icon={<ShieldAlert size={18} />}
        />
        <MetricTile
          label="Negative"
          value={viewModel.negative_delta_reports}
          tone={viewModel.negative_delta_reports > 0 ? "blocked" : "neutral"}
          icon={<TrendingDown size={18} />}
        />
      </section>

      <section className="action-panel" aria-label="Benchmark Reports next allowed action">
        <div>
          <p>Next action</p>
          <h2>{viewModel.next_allowed_action.label}</h2>
        </div>
        <p>{viewModel.next_allowed_action.rationale}</p>
      </section>

      {viewModel.reports.length > 0 ? (
        <section className="proposal-list" aria-label="Benchmark report rows">
          {viewModel.reports.map((report) => (
            <BenchmarkReportRow key={report.report_path} report={report} />
          ))}
        </section>
      ) : (
        <section className="empty-state" aria-label="Empty benchmark reports">
          <BarChart3 size={22} aria-hidden="true" />
          <h2>No benchmark reports</h2>
          <p>{viewModel.interpretation_caveat}</p>
        </section>
      )}

      {viewModel.invalid_records.length > 0 ? (
        <section className="invalid-list" aria-label="Invalid benchmark reports">
          {viewModel.invalid_records.map((invalidRecord) => (
            <article className="invalid-row" key={invalidRecord.report_path}>
              <FileWarning size={18} aria-hidden="true" />
              <div>
                <h2>{invalidRecord.report_path}</h2>
                <p>{invalidRecord.error_summary}</p>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <section className="evidence-band" aria-label="Benchmark Reports evidence">
        <div>
          <p>Latest</p>
          <strong>{viewModel.latest_report_path ?? "none"}</strong>
        </div>
        <div>
          <p>Lift claims</p>
          <strong>{viewModel.productivity_lift_claimed_reports}</strong>
        </div>
        <div>
          <p>Failure mode</p>
          <strong>{viewModel.failure_mode}</strong>
        </div>
      </section>
    </section>
  );
}
