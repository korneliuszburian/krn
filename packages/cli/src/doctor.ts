import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseDoctorReport, type DoctorCheck, type DoctorReport } from "@krn/contracts";
import { createRunId, pathKind } from "./runtime-utils.js";

type DoctorArgs = {
  target: string;
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

function countEvalCases(targetRoot: string): number {
  const evalsRoot = resolve(targetRoot, "docs", "evals");
  if (!existsSync(evalsRoot) || !statSync(evalsRoot).isDirectory()) {
    return 0;
  }

  return readdirSync(evalsRoot, { withFileTypes: true }).filter((entry) => {
    if (!entry.isDirectory()) {
      return false;
    }
    return existsSync(resolve(evalsRoot, entry.name, "cases.json"));
  }).length;
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
  const evalCount = countEvalCases(targetRoot);
  const hooksJsonExists = pathKind(targetRoot, ".codex/hooks.json") === "file";
  const compactHookExists = pathKind(targetRoot, ".codex/hooks/compact_continuity.py") === "file";
  const hooksReady = hooksJsonExists && compactHookExists;

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
      source_refs: ["AGENTS.md", "docs/goals/goal-038.md"],
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
      source_refs: ["docs/memory/INDEX.md", "docs/goals/goal-038.md"],
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
      source_refs: ["docs/skills/operator-pipeline.md", "docs/goals/goal-038.md"],
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
      source_refs: ["docs/memory/openai-codex/2026-06-19--compact-hooks-continuity.md", "docs/goals/goal-038.md"],
    },
    {
      id: "eval-modules",
      surface: "evals",
      path: "docs/evals",
      status: doctorStatus(evalCount > 0),
      exists: evalCount > 0,
      summary: evalCount > 0 ? `${evalCount} eval modules with cases are present.` : "No eval module cases were found.",
      source_refs: ["docs/evals/README.md", "docs/evals/STANDARD.md"],
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
      source_refs: ["docs/goals/goal-038.md", "docs/specs/krn-doctor/README.md"],
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
    source_refs: ["docs/goals/goal-038.md", "docs/specs/krn-doctor/README.md", "docs/plans/canonical/draft.md"],
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
