import { AlertTriangle, BarChart3, CheckCircle2, CircleDot, FileWarning, ShieldAlert } from "lucide-react";
import React, { type ReactElement } from "react";
import type { EvalRunModule, KrnEvalRunsViewModel } from "@krn/contracts";

const evalStateLabels: Record<KrnEvalRunsViewModel["eval_state"], string> = {
  ready: "Ready",
  empty: "Empty",
  blocked: "Blocked",
};

const moduleStatusLabels: Record<EvalRunModule["status"], string> = {
  passed: "Passed",
  failed: "Failed",
  error: "Error",
};

function stateTone(state: KrnEvalRunsViewModel["eval_state"]): "ready" | "blocked" | "empty" {
  if (state === "ready") {
    return "ready";
  }
  if (state === "blocked") {
    return "blocked";
  }
  return "empty";
}

function moduleTone(status: EvalRunModule["status"]): "ready" | "blocked" {
  return status === "passed" ? "ready" : "blocked";
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

function EvalModuleRow(props: { module: EvalRunModule }): ReactElement {
  const { module } = props;
  const tone = moduleTone(module.status);

  return (
    <article className="proposal-row">
      <div className="row-main">
        <div className="row-icon" aria-hidden="true">
          {module.status === "passed" ? <CheckCircle2 size={18} /> : <FileWarning size={18} />}
        </div>
        <div className="row-copy">
          <div className="row-heading">
            <h2>{module.module_id}</h2>
            <span className={`status-chip status-chip--${tone}`}>{moduleStatusLabels[module.status]}</span>
          </div>
          <p>{module.command.join(" ")}</p>
        </div>
      </div>
      <dl className="row-details">
        <div>
          <dt>Owner</dt>
          <dd>{module.owner}</dd>
        </div>
        <div>
          <dt>Report</dt>
          <dd>{module.report_path ?? "No report"}</dd>
        </div>
        <div>
          <dt>Cases</dt>
          <dd>
            {module.passed_cases}/{module.total_cases}
          </dd>
        </div>
        <div>
          <dt>Assertions</dt>
          <dd>
            {module.passed_assertions}/{module.total_assertions}
          </dd>
        </div>
        <div>
          <dt>Next action</dt>
          <dd>{module.next_action}</dd>
        </div>
        <div>
          <dt>Failure mode</dt>
          <dd>{module.failure_mode}</dd>
        </div>
      </dl>
      <SourceRefs sourceRefs={module.source_refs} />
    </article>
  );
}

export function EvalRunsDashboard(props: { viewModel: KrnEvalRunsViewModel }): ReactElement {
  const { viewModel } = props;
  const queueTone = stateTone(viewModel.eval_state);

  return (
    <section className="dashboard dashboard-section" aria-labelledby="eval-runs-title">
      <div className="dashboard-header">
        <div>
          <p className="eyebrow">{viewModel.source}</p>
          <h1 id="eval-runs-title">Eval Runs</h1>
          <p>{viewModel.next_allowed_action.rationale}</p>
        </div>
        <span className={`queue-state queue-state--${queueTone}`}>
          <CircleDot size={14} strokeWidth={3} aria-hidden="true" />
          {evalStateLabels[viewModel.eval_state]}
        </span>
      </div>

      <section className="metric-grid" aria-label="Eval Runs metrics">
        <MetricTile label="Modules" value={viewModel.total_modules} tone="neutral" icon={<BarChart3 size={18} />} />
        <MetricTile label="Passed" value={viewModel.passed_modules} tone="ready" icon={<CheckCircle2 size={18} />} />
        <MetricTile
          label="Failed"
          value={viewModel.failed_modules}
          tone={viewModel.failed_modules > 0 ? "blocked" : "neutral"}
          icon={<AlertTriangle size={18} />}
        />
        <MetricTile
          label="Lift"
          value={viewModel.benchmark_lift_status.replaceAll("_", " ")}
          tone="empty"
          icon={<ShieldAlert size={18} />}
        />
      </section>

      <section className="action-panel" aria-label="Eval Runs next allowed action">
        <div>
          <p>Next action</p>
          <h2>{viewModel.next_allowed_action.label}</h2>
        </div>
        <p>{viewModel.next_allowed_action.rationale}</p>
      </section>

      {viewModel.modules.length > 0 ? (
        <section className="proposal-list" aria-label="Eval modules">
          {viewModel.modules.map((module) => (
            <EvalModuleRow key={module.module_id} module={module} />
          ))}
        </section>
      ) : (
        <section className="empty-state" aria-label="Empty eval runs">
          <BarChart3 size={22} aria-hidden="true" />
          <h2>No aggregate eval report</h2>
          <p>{viewModel.interpretation_caveat}</p>
        </section>
      )}

      {viewModel.invalid_report ? (
        <section className="invalid-list" aria-label="Invalid eval report">
          <article className="invalid-row">
            <ShieldAlert size={18} aria-hidden="true" />
            <div>
              <h2>{viewModel.invalid_report.report_path}</h2>
              <p>{viewModel.invalid_report.error_summary}</p>
            </div>
          </article>
        </section>
      ) : null}

      <section className="evidence-band" aria-label="Eval Runs evidence">
        <div>
          <p>Run</p>
          <strong>{viewModel.latest_run_id ?? "none"}</strong>
        </div>
        <div>
          <p>Report</p>
          <strong>{viewModel.latest_report_path ?? "none"}</strong>
        </div>
        <div>
          <p>Failure mode</p>
          <strong>{viewModel.failure_mode}</strong>
        </div>
      </section>
    </section>
  );
}
