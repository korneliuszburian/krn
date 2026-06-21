import { execFileSync } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseKrnEvalReport,
  type EvalLane,
  type EvalLaneSelection,
  type EvalModuleResult,
  type KrnEvalReport,
} from "@krn/contracts";
import { createRunId } from "./runtime-utils.js";

export type EvalArgs = {
  target: string;
  modules: string[];
  lane: EvalLaneSelection;
};

type EvalModuleDescriptor = {
  moduleId: string;
  lane: EvalLane;
  command: readonly string[];
  sourceRefs: readonly string[];
};

type ModuleReportSummary = {
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  case_pass_rate: number;
  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;
  assertion_pass_rate: number;
  interpretation_caveat: string;
};

const EVAL_MODULES: EvalModuleDescriptor[] = [
  {
    moduleId: "krn-init-contracts",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-init"],
    sourceRefs: ["docs/evals/krn-init-contracts/README.md", "docs/specs/krn-init/README.md"],
  },
  {
    moduleId: "krn-doctor-contracts",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-doctor"],
    sourceRefs: ["docs/evals/krn-doctor-contracts/README.md", "docs/specs/krn-doctor/README.md"],
  },
  {
    moduleId: "krn-review-contracts",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-review"],
    sourceRefs: ["docs/evals/krn-review-contracts/README.md", "docs/specs/krn-review/README.md"],
  },
  {
    moduleId: "krn-mcp-read-model",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-mcp"],
    sourceRefs: ["docs/evals/krn-mcp-read-model/README.md", "docs/specs/krn-mcp-read-model/README.md"],
  },
  {
    moduleId: "krn-mcp-transport",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-mcp-transport"],
    sourceRefs: ["docs/evals/krn-mcp-transport/README.md", "docs/specs/krn-mcp-read-model/README.md"],
  },
  {
    moduleId: "krn-proposal-store",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-proposal-store"],
    sourceRefs: ["docs/evals/krn-proposal-store/README.md", "docs/specs/krn-control-plane-proposal/README.md"],
  },
  {
    moduleId: "krn-mcp-proposal-tool",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-mcp-proposal-tool"],
    sourceRefs: ["docs/evals/krn-mcp-proposal-tool/README.md", "docs/specs/krn-mcp-proposal-tool/README.md"],
  },
  {
    moduleId: "krn-pending-review-view-model",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-pending-review-view-model"],
    sourceRefs: [
      "docs/evals/krn-pending-review-view-model/README.md",
      "docs/specs/krn-pending-review-view-model/README.md",
    ],
  },
  {
    moduleId: "krn-dashboard-pending-review-ui",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-dashboard-pending-review-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-pending-review-ui/README.md",
      "docs/goals/goal-012.md",
      "apps/dashboard/package.json",
    ],
  },
  {
    moduleId: "krn-dashboard-promotion-review-ui",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-dashboard-promotion-review-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-promotion-review-ui/README.md",
      "docs/specs/krn-promotion-review-view-model/README.md",
      "docs/goals/goal-015.md",
    ],
  },
  {
    moduleId: "krn-dashboard-eval-runs-ui",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-dashboard-eval-runs-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-eval-runs-ui/README.md",
      "docs/specs/krn-eval-runs-view-model/README.md",
      "docs/goals/goal-016.md",
    ],
  },
  {
    moduleId: "krn-proposal-review-decision",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-proposal-review-decision"],
    sourceRefs: [
      "docs/evals/krn-proposal-review-decision/README.md",
      "docs/specs/krn-proposal-review-decision/README.md",
      "docs/goals/goal-013.md",
    ],
  },
  {
    moduleId: "krn-proposal-promotion",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-proposal-promotion"],
    sourceRefs: [
      "docs/evals/krn-proposal-promotion/README.md",
      "docs/specs/krn-proposal-promotion/README.md",
      "docs/goals/goal-014.md",
    ],
  },
  {
    moduleId: "krn-benchmark-spine",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-spine"],
    sourceRefs: [
      "docs/evals/krn-benchmark-spine/README.md",
      "docs/specs/krn-benchmark-report/README.md",
      "docs/goals/goal-017.md",
    ],
  },
  {
    moduleId: "krn-dashboard-benchmark-reports-ui",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-dashboard-benchmark-reports-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-benchmark-reports-ui/README.md",
      "docs/specs/krn-benchmark-reports-view-model/README.md",
      "docs/goals/goal-019.md",
    ],
  },
  {
    moduleId: "krn-benchmark-live-suite",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-live-suite"],
    sourceRefs: [
      "docs/evals/krn-benchmark-live-suite/README.md",
      "docs/evals/krn-benchmark-live-suite/tasks.json",
      "docs/goals/goal-020.md",
    ],
  },
  {
    moduleId: "krn-benchmark-live-stability",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-live-stability"],
    sourceRefs: [
      "docs/evals/krn-benchmark-live-stability/README.md",
      "docs/evals/krn-benchmark-live-stability/cases.json",
      "docs/goals/goal-027.md",
    ],
  },
  {
    moduleId: "krn-benchmark-arena-contract",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-arena-contract"],
    sourceRefs: [
      "docs/evals/krn-benchmark-arena-contract/README.md",
      "docs/evals/krn-benchmark-arena-contract/arena-contract.example.json",
      "docs/goals/goal-030.md",
    ],
  },
  {
    moduleId: "krn-benchmark-expanded-arena",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-expanded-arena"],
    sourceRefs: [
      "docs/evals/krn-benchmark-expanded-arena/README.md",
      "docs/evals/krn-benchmark-expanded-arena/tasks.json",
      "docs/evals/krn-benchmark-expanded-arena/cases.json",
      "docs/evals/krn-benchmark-expanded-arena/fixtures/live-smoke-release-claim.md",
      "docs/goals/goal-034.md",
      "docs/goals/goal-033.md",
      "docs/goals/goal-032.md",
      "docs/goals/goal-031.md",
    ],
  },
  {
    moduleId: "krn-repair-record",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-repair-record"],
    sourceRefs: [
      "docs/evals/krn-repair-record/README.md",
      "docs/specs/krn-repair-record/README.md",
      "docs/goals/goal-021.md",
    ],
  },
  {
    moduleId: "krn-research-pack",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-research-pack"],
    sourceRefs: [
      "docs/evals/krn-research-pack/README.md",
      "docs/specs/krn-research-pack/README.md",
      "docs/goals/goal-036.md",
    ],
  },
];

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

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

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Module report missing string field: ${key}`);
  }
  return value;
}

function numberField(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Module report missing numeric field: ${key}`);
  }
  return value;
}

function parseModuleReportSummary(input: unknown): ModuleReportSummary {
  if (!input || typeof input !== "object") {
    throw new Error("Module report must be an object");
  }

  const record = input as Record<string, unknown>;

  return {
    total_cases: numberField(record, "total_cases"),
    passed_cases: numberField(record, "passed_cases"),
    failed_cases: numberField(record, "failed_cases"),
    case_pass_rate: numberField(record, "case_pass_rate"),
    total_assertions: numberField(record, "total_assertions"),
    passed_assertions: numberField(record, "passed_assertions"),
    failed_assertions: numberField(record, "failed_assertions"),
    assertion_pass_rate: numberField(record, "assertion_pass_rate"),
    interpretation_caveat: stringField(record, "interpretation_caveat"),
  };
}

function extractReportPath(output: string): string {
  const reportLine = output
    .split(/\r?\n/)
    .reverse()
    .find((line) => line.startsWith("report: "));

  if (!reportLine) {
    throw new Error("Eval module output did not include a report path");
  }

  return reportLine.replace(/^report:\s*/, "").trim();
}

function toTargetRelativePath(targetRoot: string, absolutePath: string): string {
  const relativePath = relative(targetRoot, absolutePath).replaceAll("\\", "/");
  if (relativePath.length > 0 && !relativePath.startsWith("..") && !relativePath.startsWith("/")) {
    return relativePath;
  }
  return absolutePath;
}

function uniqueEvalLanes(laneValues: readonly EvalLane[]): EvalLane[] {
  const lanes: EvalLane[] = [];
  for (const lane of laneValues) {
    if (!lanes.includes(lane)) {
      lanes.push(lane);
    }
  }
  return lanes;
}

function includedLanesForSelection(selection: EvalLaneSelection): EvalLane[] {
  if (selection === "core") {
    return ["core"];
  }
  if (selection === "current") {
    return ["core", "current"];
  }
  if (selection === "lab") {
    return ["lab"];
  }
  if (selection === "all") {
    return ["core", "current", "lab"];
  }
  return ["core", "current", "lab"];
}

function excludedLanesForSelection(selection: EvalLaneSelection, includedLanes: readonly EvalLane[]): EvalLane[] {
  if (selection === "custom" || selection === "all") {
    return [];
  }

  return (["core", "current", "lab"] as const).filter((lane) => !includedLanes.includes(lane));
}

function selectEvalModules(args: EvalArgs): EvalModuleDescriptor[] {
  if (args.modules.length > 0) {
    return args.modules.map((moduleId) => {
      const descriptor = EVAL_MODULES.find((module) => module.moduleId === moduleId);
      if (!descriptor) {
        throw new Error(`Unknown eval module: ${moduleId}`);
      }
      return descriptor;
    });
  }

  const includedLanes = includedLanesForSelection(args.lane);
  return EVAL_MODULES.filter((module) => includedLanes.includes(module.lane));
}

function runEvalModule(targetRoot: string, descriptor: EvalModuleDescriptor): EvalModuleResult {
  const [command, ...args] = descriptor.command;
  if (!command) {
    throw new Error(`Eval module ${descriptor.moduleId} has no command`);
  }

  try {
    const output = execFileSync(command, args, {
      cwd: targetRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const reportPath = extractReportPath(output);
    const summary = parseModuleReportSummary(readJsonFile(reportPath));
    const status = summary.failed_cases === 0 ? "passed" : "failed";

    return {
      module_id: descriptor.moduleId,
      lane: descriptor.lane,
      command: [...descriptor.command],
      status,
      report_path: toTargetRelativePath(targetRoot, reportPath),
      ...summary,
      source_refs: [...descriptor.sourceRefs],
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown eval module error";

    return {
      module_id: descriptor.moduleId,
      lane: descriptor.lane,
      command: [...descriptor.command],
      status: "error",
      report_path: null,
      total_cases: 0,
      passed_cases: 0,
      failed_cases: 0,
      case_pass_rate: 0,
      total_assertions: 0,
      passed_assertions: 0,
      failed_assertions: 0,
      assertion_pass_rate: 0,
      source_refs: [...descriptor.sourceRefs],
      interpretation_caveat: `The eval module failed before KRN could parse its report: ${message}`,
    };
  }
}

function summarizeEvalLanes(modules: readonly EvalModuleResult[]): KrnEvalReport["lane_summary"] {
  const lanes = uniqueEvalLanes(modules.map((moduleResult) => moduleResult.lane));

  return lanes.map((lane) => {
    const laneModules = modules.filter((moduleResult) => moduleResult.lane === lane);
    return {
      lane,
      total_modules: laneModules.length,
      passed_modules: laneModules.filter((moduleResult) => moduleResult.status === "passed").length,
      failed_modules: laneModules.filter((moduleResult) => moduleResult.status === "failed").length,
      error_modules: laneModules.filter((moduleResult) => moduleResult.status === "error").length,
    };
  });
}

function summarizeEvalModules(modules: readonly EvalModuleResult[]): KrnEvalReport["summary"] {
  return modules.reduce(
    (summary, moduleResult) => {
      summary.total_modules += 1;
      if (moduleResult.status === "passed") {
        summary.passed_modules += 1;
      } else {
        summary.failed_modules += 1;
      }
      summary.total_cases += moduleResult.total_cases;
      summary.passed_cases += moduleResult.passed_cases;
      summary.failed_cases += moduleResult.failed_cases;
      summary.total_assertions += moduleResult.total_assertions;
      summary.passed_assertions += moduleResult.passed_assertions;
      summary.failed_assertions += moduleResult.failed_assertions;
      return summary;
    },
    {
      total_modules: 0,
      passed_modules: 0,
      failed_modules: 0,
      total_cases: 0,
      passed_cases: 0,
      failed_cases: 0,
      total_assertions: 0,
      passed_assertions: 0,
      failed_assertions: 0,
    },
  );
}

function evalOverallStatus(modules: readonly EvalModuleResult[]): "passed" | "failed" | "error" {
  if (modules.some((moduleResult) => moduleResult.status === "error")) {
    return "error";
  }
  if (modules.some((moduleResult) => moduleResult.status === "failed")) {
    return "failed";
  }
  return "passed";
}

export function buildKrnEvalReport(args: EvalArgs, now = new Date()): KrnEvalReport {
  const targetRoot = resolve(args.target);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/eval/${runId}/report.json`;
  const selectedModules = selectEvalModules(args);
  const modules = selectedModules.map((module) => runEvalModule(targetRoot, module));
  const summary = summarizeEvalModules(modules);
  const includedLanes =
    args.lane === "custom" ? uniqueEvalLanes(selectedModules.map((module) => module.lane)) : includedLanesForSelection(args.lane);
  const excludedLanes = excludedLanesForSelection(args.lane, includedLanes);

  const candidateReport: unknown = {
    schema_version: "krn-eval-report.v1",
    kind: "krn_eval_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn eval",
    mode: "validate",
    overall_status: evalOverallStatus(modules),
    lane_selection: {
      requested_lane: args.lane,
      default_lane: "current",
      included_lanes: includedLanes,
      excluded_lanes: excludedLanes,
      module_filter: [...args.modules],
      policy:
        "Default current runs core plus current eval modules. Lab modules require --lane lab, --lane all, or explicit --module selection.",
    },
    modules,
    lane_summary: summarizeEvalLanes(modules),
    summary,
    runtime_report_path: runtimeReportPath,
    source_refs: [
      "docs/goals/goal-038.md",
      "docs/specs/krn-eval/README.md",
      "docs/evals/STANDARD.md",
      "docs/plans/canonical/draft.md",
    ],
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
