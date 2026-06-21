import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseKrnEvalReport, type EvalLaneSelection, type KrnEvalReport } from "@krn/contracts";
import { DEFAULT_EVAL_LANE_POLICY } from "./eval-lanes.js";
import { runKrnEvalModules } from "./eval-modules.js";
import { createRunId } from "./runtime-utils.js";

export type EvalArgs = {
  target: string;
  modules: string[];
  lane: EvalLaneSelection;
};

function readOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

export function parseEvalArgs(argv: readonly string[]): EvalArgs {
  if (argv[0] !== "eval") {
    throw new Error("Expected command: eval");
  }

  let target = ".";
  const modules: string[] = [];
  let lane: EvalLaneSelection = "current";

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      target = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--module") {
      modules.push(readOptionValue(argv, index, arg));
      index += 1;
      continue;
    }

    if (arg === "--lane") {
      const value = readOptionValue(argv, index, arg);
      if (!["core", "current", "lab", "all"].includes(value)) {
        throw new Error(`Unknown eval lane: ${value}`);
      }
      lane = value as EvalLaneSelection;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (modules.length > 0) {
    return { target, modules, lane: "custom" };
  }

  return { target, modules, lane };
}

export function buildKrnEvalReport(args: EvalArgs, now = new Date()): KrnEvalReport {
  const targetRoot = resolve(args.target);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/eval/${runId}/report.json`;
  const evalRun = runKrnEvalModules(targetRoot, args);

  const candidateReport: unknown = {
    schema_version: "krn-eval-report.v1",
    kind: "krn_eval_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn eval",
    mode: "validate",
    overall_status: evalRun.overallStatus,
    lane_selection: {
      requested_lane: args.lane,
      default_lane: "current",
      included_lanes: evalRun.includedLanes,
      excluded_lanes: evalRun.excludedLanes,
      module_filter: [...args.modules],
      policy: DEFAULT_EVAL_LANE_POLICY,
    },
    modules: evalRun.modules,
    lane_summary: evalRun.laneSummary,
    summary: evalRun.summary,
    runtime_report_path: runtimeReportPath,
    source_refs: evalRun.sourceRefs,
    interpretation_caveat:
      "This report proves local deterministic eval execution and aggregation only; it does not prove productivity lift, benchmark lift, API/MCP readiness, complete dashboard readiness, or human approval quality.",
  };

  return parseKrnEvalReport(candidateReport);
}

export function writeKrnEvalReport(targetInput: string, report: KrnEvalReport): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "eval", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return reportPath;
}
