import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseKrnEvalModuleRegistry,
  type EvalLane,
  type EvalLaneSelection,
  type EvalModuleDescriptor,
  type EvalModuleResult,
  type KrnEvalReport,
} from "@krn/contracts";

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

export type EvalModuleRunArgs = {
  modules: string[];
  lane: EvalLaneSelection;
};

export type EvalModuleRun = {
  selectedModules: EvalModuleDescriptor[];
  modules: EvalModuleResult[];
  includedLanes: EvalLane[];
  excludedLanes: EvalLane[];
  laneSummary: KrnEvalReport["lane_summary"];
  summary: KrnEvalReport["summary"];
  overallStatus: "passed" | "failed" | "error";
  sourceRefs: string[];
};

const DEFAULT_EVAL_REGISTRY_PATH = "docs/evals/registry.json";
const AGGREGATE_EVAL_SOURCE_REFS = ["docs/specs/krn-eval/README.md", "docs/evals/STANDARD.md"] as const;

export const DEFAULT_EVAL_LANE_POLICY =
  "Default current runs core plus current eval modules. Lab modules require --lane lab, --lane all, or explicit --module selection.";

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
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

function uniqueSourceRefs(sourceRefs: readonly string[]): string[] {
  return [...new Set(sourceRefs)];
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

function readEvalModuleDescriptors(targetRoot: string): EvalModuleDescriptor[] {
  const registryPath = resolve(targetRoot, DEFAULT_EVAL_REGISTRY_PATH);
  return parseKrnEvalModuleRegistry(readJsonFile(registryPath)).modules;
}

function selectEvalModules(args: EvalModuleRunArgs, registryModules: readonly EvalModuleDescriptor[]): EvalModuleDescriptor[] {
  if (args.modules.length > 0) {
    return args.modules.map((moduleId) => {
      const descriptor = registryModules.find((module) => module.module_id === moduleId);
      if (!descriptor) {
        throw new Error(`Unknown eval module: ${moduleId}`);
      }
      return descriptor;
    });
  }

  const includedLanes = includedLanesForSelection(args.lane);
  return registryModules.filter((module) => includedLanes.includes(module.lane));
}

function runEvalModule(targetRoot: string, descriptor: EvalModuleDescriptor): EvalModuleResult {
  const [command, ...args] = descriptor.command;
  if (!command) {
    throw new Error(`Eval module ${descriptor.module_id} has no command`);
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
      module_id: descriptor.module_id,
      lane: descriptor.lane,
      command: [...descriptor.command],
      status,
      report_path: toTargetRelativePath(targetRoot, reportPath),
      ...summary,
      source_refs: [...descriptor.source_refs],
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown eval module error";

    return {
      module_id: descriptor.module_id,
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
      source_refs: [...descriptor.source_refs],
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

export function runKrnEvalModules(targetRoot: string, args: EvalModuleRunArgs): EvalModuleRun {
  const registryModules = readEvalModuleDescriptors(targetRoot);
  const selectedModules = selectEvalModules(args, registryModules);
  const modules = selectedModules.map((module) => runEvalModule(targetRoot, module));
  const includedLanes =
    args.lane === "custom" ? uniqueEvalLanes(selectedModules.map((module) => module.lane)) : includedLanesForSelection(args.lane);
  const excludedLanes = excludedLanesForSelection(args.lane, includedLanes);

  return {
    selectedModules,
    modules,
    includedLanes,
    excludedLanes,
    laneSummary: summarizeEvalLanes(modules),
    summary: summarizeEvalModules(modules),
    overallStatus: evalOverallStatus(modules),
    sourceRefs: uniqueSourceRefs([...AGGREGATE_EVAL_SOURCE_REFS, ...selectedModules.flatMap((module) => module.source_refs)]),
  };
}
