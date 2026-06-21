import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseDoctorReport, parseKrnEvalModuleRegistry, type DoctorCheck, type DoctorReport } from "@krn/contracts";
import { createRunId, pathKind } from "./runtime-utils.js";

type DoctorArgs = {
  target: string;
};

const localSpecPathPatterns = [/\/home\/[^/\s"']+\//, /C:\\Users\\[^\\\s"']+\\/i, /\/mnt\/c\/Users\/[^/\s"']+\//i];
const DOCTOR_CONTRACT_SOURCE_REFS = ["docs/specs/krn-doctor/README.md"] as const;
const AGENTS_SOURCE_REFS = ["AGENTS.md"] as const;
const MEMORY_INDEX_SOURCE_REFS = ["docs/memory/INDEX.md"] as const;
const OPERATOR_SKILLS_SOURCE_REFS = ["docs/skills/operator-pipeline.md"] as const;
const COMPACT_HOOKS_SOURCE_REFS = ["docs/memory/openai-codex/2026-06-19--compact-hooks-continuity.md"] as const;
const EVAL_REGISTRY_SOURCE_REFS = ["docs/evals/registry.json", "docs/specs/krn-eval/README.md", "docs/evals/STANDARD.md"] as const;

type EvalRegistryReadiness = {
  status: "ready" | "warning" | "blocked";
  exists: boolean;
  summary: string;
};

export function parseDoctorArgs(argv: readonly string[]): DoctorArgs {
  if (argv[0] !== "doctor") {
    throw new Error("Expected command: doctor");
  }

  let target = ".";

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --target");
      }
      target = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  return { target };
}

function countSkillContracts(targetRoot: string): number {
  const skillsRoot = resolve(targetRoot, ".agents", "skills");
  if (!existsSync(skillsRoot) || !statSync(skillsRoot).isDirectory()) {
    return 0;
  }

  return readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => {
    if (!entry.isDirectory()) {
      return false;
    }
    return existsSync(resolve(skillsRoot, entry.name, "SKILL.md"));
  }).length;
}

function collectFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      return collectFiles(path);
    }

    if (entry.isFile()) {
      return [path];
    }

    return [];
  });
}

function evalRegistryReadiness(targetRoot: string): EvalRegistryReadiness {
  const registryPath = resolve(targetRoot, "docs", "evals", "registry.json");
  if (!existsSync(registryPath) || !statSync(registryPath).isFile()) {
    return {
      status: "warning",
      exists: false,
      summary: "Eval module registry is missing.",
    };
  }

  try {
    const registry = parseKrnEvalModuleRegistry(JSON.parse(readFileSync(registryPath, "utf8")) as unknown);
    const coreCount = registry.modules.filter((module) => module.lane === "core").length;
    const currentCount = registry.modules.filter((module) => module.lane === "current").length;
    const labCount = registry.modules.filter((module) => module.lane === "lab").length;

    return {
      status: "ready",
      exists: true,
      summary: `Eval registry default lane is ${registry.default_lane}; ${coreCount} core, ${currentCount} current, and ${labCount} lab modules are registered.`,
    };
  } catch (error: unknown) {
    return {
      status: "blocked",
      exists: true,
      summary: `Eval module registry is invalid: ${error instanceof Error ? error.message : "unknown parse error"}.`,
    };
  }
}

function findLocalSpecPathFiles(targetRoot: string): string[] {
  const specsRoot = resolve(targetRoot, "docs", "specs");
  if (!existsSync(specsRoot) || !statSync(specsRoot).isDirectory()) {
    return [];
  }

  return collectFiles(specsRoot)
    .filter((path) => {
      const content = readFileSync(path, "utf8");
      return localSpecPathPatterns.some((pattern) => pattern.test(content));
    })
    .map((path) => relative(targetRoot, path));
}

function doctorStatus(exists: boolean): "ready" | "warning" {
  return exists ? "ready" : "warning";
}

function summarizeChecks(checks: readonly DoctorCheck[]): { ready: number; warning: number; blocked: number } {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { ready: 0, warning: 0, blocked: 0 },
  );
}

function overallStatus(summary: { ready: number; warning: number; blocked: number }): "ready" | "warning" | "blocked" {
  if (summary.blocked > 0) {
    return "blocked";
  }
  if (summary.warning > 0) {
    return "warning";
  }
  return "ready";
}

export function buildDoctorReport(targetInput: string, now = new Date()): DoctorReport {
  const targetRoot = resolve(targetInput);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/doctor/${runId}/report.json`;
  const skillCount = countSkillContracts(targetRoot);
  const evalRegistry = evalRegistryReadiness(targetRoot);
  const hooksJsonExists = pathKind(targetRoot, ".codex/hooks.json") === "file";
  const compactHookExists = pathKind(targetRoot, ".codex/hooks/compact_continuity.py") === "file";
  const hooksReady = hooksJsonExists && compactHookExists;
  const specsExists = pathKind(targetRoot, "docs/specs") === "directory";
  const localSpecPathFiles = findLocalSpecPathFiles(targetRoot);

  const checks: DoctorCheck[] = [
    {
      id: "agents-root-instructions",
      surface: "agents",
      path: "AGENTS.md",
      status: doctorStatus(pathKind(targetRoot, "AGENTS.md") === "file"),
      exists: pathKind(targetRoot, "AGENTS.md") === "file",
      summary:
        pathKind(targetRoot, "AGENTS.md") === "file"
          ? "Root AGENTS.md exists."
          : "Root AGENTS.md is missing.",
      source_refs: [...AGENTS_SOURCE_REFS],
    },
    {
      id: "memory-index",
      surface: "memory",
      path: "docs/memory/INDEX.md",
      status: doctorStatus(pathKind(targetRoot, "docs/memory/INDEX.md") === "file"),
      exists: pathKind(targetRoot, "docs/memory/INDEX.md") === "file",
      summary:
        pathKind(targetRoot, "docs/memory/INDEX.md") === "file"
          ? "Repo-local memory index exists."
          : "Repo-local memory index is missing.",
      source_refs: [...MEMORY_INDEX_SOURCE_REFS],
    },
    {
      id: "operator-skills",
      surface: "skills",
      path: ".agents/skills",
      status: doctorStatus(skillCount > 0),
      exists: skillCount > 0,
      summary:
        skillCount > 0
          ? `${skillCount} operator skill contracts are present.`
          : "No operator skill contracts were found.",
      source_refs: [...OPERATOR_SKILLS_SOURCE_REFS],
    },
    {
      id: "compact-hooks",
      surface: "hooks",
      path: ".codex/hooks.json",
      status: doctorStatus(hooksReady),
      exists: hooksReady,
      summary: hooksReady
        ? "Project-local compact continuity hook files are present."
        : "Compact continuity hook config or script is missing.",
      source_refs: [...COMPACT_HOOKS_SOURCE_REFS],
    },
    {
      id: "eval-modules",
      surface: "evals",
      path: "docs/evals/registry.json",
      status: evalRegistry.status,
      exists: evalRegistry.exists,
      summary: evalRegistry.summary,
      source_refs: [...EVAL_REGISTRY_SOURCE_REFS],
    },
    {
      id: "spec-portability",
      surface: "specs",
      path: "docs/specs",
      status: !specsExists ? "warning" : localSpecPathFiles.length > 0 ? "blocked" : "ready",
      exists: specsExists,
      summary: !specsExists
        ? "KRN spec examples are missing."
        : localSpecPathFiles.length > 0
          ? `KRN spec examples contain user-specific local paths: ${localSpecPathFiles.join(", ")}.`
          : "KRN spec examples do not contain known user-specific local paths.",
      source_refs: [...DOCTOR_CONTRACT_SOURCE_REFS],
    },
    {
      id: "runtime-artifacts",
      surface: "runtime",
      path: ".krn",
      status: doctorStatus(pathKind(targetRoot, ".krn") === "directory"),
      exists: pathKind(targetRoot, ".krn") === "directory",
      summary:
        pathKind(targetRoot, ".krn") === "directory"
          ? "KRN runtime artifact directory exists."
          : "KRN runtime artifact directory is missing and will be created for this report.",
      source_refs: [...DOCTOR_CONTRACT_SOURCE_REFS],
    },
  ];

  const summary = summarizeChecks(checks);
  const candidateReport: unknown = {
    schema_version: "krn-doctor-report.v1",
    kind: "krn_doctor_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn doctor",
    overall_status: overallStatus(summary),
    checks,
    summary,
    runtime_report_path: runtimeReportPath,
    source_refs: [...DOCTOR_CONTRACT_SOURCE_REFS],
    interpretation_caveat:
      "This report proves local readiness surface detection only; it does not prove productivity lift, hook semantic correctness, API/MCP readiness, or dashboard readiness.",
  };

  return parseDoctorReport(candidateReport);
}

export function writeDoctorReport(targetInput: string, report: DoctorReport): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "doctor", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return reportPath;
}
