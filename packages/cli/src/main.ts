import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseKrnResearchPack,
  type KrnResearchPack,
  type SourceBudgetMode,
} from "@krn/contracts";
import { buildKrnOperatingBrief, writeKrnOperatingBrief, type BriefArgs } from "./brief.js";
import { buildKrnContextPacket, parseContextBuildArgs, writeKrnContextPacket } from "./context.js";
import { buildDoctorReport, parseDoctorArgs, writeDoctorReport } from "./doctor.js";
import { buildKrnEvalReport, parseEvalArgs, writeKrnEvalReport } from "./eval.js";
import { buildKrnEngineeringGate, parseKrnGateArgs, writeKrnEngineeringGate } from "./gate.js";
import { initProposalCapabilityUsage, runKrnInit } from "./init.js";
import { buildKrnReviewReport, writeKrnReviewReport } from "./review.js";
import { createRunId } from "./runtime-utils.js";
import { buildKrnSourceCheck, parseSourceCheckArgs, writeKrnSourceCheck } from "./source-graph.js";

type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

type ReviewArgs = {
  target: string;
};

type ResearchPackArgs = {
  target: string;
  question: string;
  decision: string;
  budget: SourceBudgetMode;
};

function usage(): string {
  const initCapabilities = initProposalCapabilityUsage();
  return `Usage: krn <command>

Commands:
  init --dry-run [--target <path>]
  init --proposal ${initCapabilities} [--target <path>]
  init --apply ${initCapabilities} --proposal-path <path> --decision-path <path> [--target <path>]
  doctor [--target <path>]
  eval [--target <path>] [--lane core|current|lab|all] [--module <module-id>]
  review [--target <path>]
  brief --task <text> [--path <path>] [--target <path>]
  context build --task <text> [--path <path>] [--target <path>]
  sources check --context <path> --graph <path> [--target <path>]
  gate --task <text> [--path <path>] [--target <path>]
  research-pack --question <text> --decision <text> [--budget quick|standard|deep] [--target <path>]
`;
}

function parseReviewArgs(argv: readonly string[]): ReviewArgs {
  if (argv[0] !== "review") {
    throw new Error("Expected command: review");
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

function parseBriefArgs(argv: readonly string[]): BriefArgs {
  if (argv[0] !== "brief") {
    throw new Error("Expected command: brief");
  }

  let target = ".";
  let task: string | null = null;
  let path: string | null = null;

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

    if (arg === "--task") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --task");
      }
      task = value;
      index += 1;
      continue;
    }

    if (arg === "--path") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --path");
      }
      path = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (!task) {
    throw new Error("Missing required --task");
  }

  return { target, task, path };
}

function parseResearchPackArgs(argv: readonly string[]): ResearchPackArgs {
  if (argv[0] !== "research-pack") {
    throw new Error("Expected command: research-pack");
  }

  let target = ".";
  let question: string | null = null;
  let decision: string | null = null;
  let budget: SourceBudgetMode = "standard";

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

    if (arg === "--question") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --question");
      }
      question = value;
      index += 1;
      continue;
    }

    if (arg === "--decision") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --decision");
      }
      decision = value;
      index += 1;
      continue;
    }

    if (arg === "--budget") {
      const value = argv[index + 1];
      if (value !== "quick" && value !== "standard" && value !== "deep") {
        throw new Error("Missing or invalid value for --budget");
      }
      budget = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (!question) {
    throw new Error("Missing required --question");
  }

  if (!decision) {
    throw new Error("Missing required --decision");
  }

  return { target, question, decision, budget };
}

function sourceBudgetRange(mode: SourceBudgetMode): { min: number; max: number | null } {
  switch (mode) {
    case "quick":
      return { min: 5, max: 8 };
    case "standard":
      return { min: 10, max: 20 };
    case "deep":
      return { min: 20, max: null };
  }
}

function buildKrnResearchPack(args: ResearchPackArgs, now = new Date()): KrnResearchPack {
  const targetRoot = resolve(args.target);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/research-packs/${runId}/research-pack.json`;
  const budgetRange = sourceBudgetRange(args.budget);

  const candidatePack: unknown = {
    schema_version: "krn-research-pack.v1",
    kind: "krn_research_pack",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn research-pack",
    status: "scaffolded",
    research_question: args.question,
    krn_decision: args.decision,
    source_budget: {
      mode: args.budget,
      min_sources: budgetRange.min,
      max_sources: budgetRange.max,
      stop_condition:
        "Stop when the source budget is met, mechanisms and contradictions are extracted, and KRN promotion targets are explicit.",
    },
    source_universe: [
      {
        kind: "local_source_bank",
        ref: ".krn/source-bank/repos",
        inclusion_reason: "Prefer locally pinned source repositories before repeating broad web lookup.",
      },
      {
        kind: "repo_memory",
        ref: "docs/memory/INDEX.md",
        inclusion_reason: "Use reviewed KRN memory as selector context, not as unverified source truth.",
      },
      {
        kind: "canonical_docs",
        ref: "docs/source-bank/MANIFEST.md",
        inclusion_reason: "Use the source manifest to choose source families and promotion targets.",
      },
      {
        kind: "primary_papers",
        ref: "source-budget-dependent primary papers and official docs",
        inclusion_reason: "Promote mechanisms only after primary-source or reproducible-source inspection.",
      },
    ],
    sources: [],
    mechanism_matrix: [],
    contradictions: [],
    rejected_alternatives: [],
    decision_candidates: [],
    promotion_targets: [],
    next_action:
      "Run the long-researcher skill against this scaffold, fill sources and mechanisms, then parse the completed pack before promoting memory or ADR changes.",
    runtime_report_path: runtimeReportPath,
    source_refs: [
      ".agents/skills/long-researcher/SKILL.md",
      ".agents/skills/long-researcher/references/research-pack-template.md",
      "docs/goals/goal-006.md",
      "docs/goals/goal-036.md",
      "docs/source-bank/MANIFEST.md",
      "docs/specs/krn-research-pack/README.md",
    ],
    evidence_refs: [runtimeReportPath],
    interpretation_caveat:
      "This scaffold proves only that KRN can create a typed research-pack target. It does not prove sources were read, mechanisms were extracted, memory should be promoted, or productivity lift exists.",
  };

  return parseKrnResearchPack(candidatePack);
}

function writeKrnResearchPack(targetInput: string, pack: KrnResearchPack): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "research-packs", pack.run_id);
  const reportPath = resolve(reportDir, "research-pack.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");

  return reportPath;
}

export function runKrnCli(argv: readonly string[] = process.argv.slice(2)): CliResult {
  const normalizedArgv = argv[0] === "--" ? argv.slice(1) : argv;

  if (normalizedArgv.length === 0 || normalizedArgv.includes("--help")) {
    return { exitCode: 0, stdout: usage(), stderr: "" };
  }

  try {
    if (normalizedArgv[0] === "init") {
      return runKrnInit(normalizedArgv);
    }

    if (normalizedArgv[0] === "doctor") {
      const args = parseDoctorArgs(normalizedArgv);
      const report = buildDoctorReport(args.target);
      const reportPath = writeDoctorReport(args.target, report);
      return { exitCode: 0, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "eval") {
      const args = parseEvalArgs(normalizedArgv);
      const report = buildKrnEvalReport(args);
      const reportPath = writeKrnEvalReport(args.target, report);
      const exitCode = report.overall_status === "passed" ? 0 : 1;
      return { exitCode, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "review") {
      const args = parseReviewArgs(normalizedArgv);
      const report = buildKrnReviewReport(args.target);
      const reportPath = writeKrnReviewReport(args.target, report);
      return { exitCode: 0, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "brief") {
      const args = parseBriefArgs(normalizedArgv);
      const brief = buildKrnOperatingBrief(args);
      const briefPath = writeKrnOperatingBrief(args.target, brief);
      return { exitCode: 0, stdout: `${briefPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "context") {
      const args = parseContextBuildArgs(normalizedArgv);
      const packet = buildKrnContextPacket(args);
      const packetPath = writeKrnContextPacket(args.target, packet);
      return { exitCode: 0, stdout: `${packetPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "sources") {
      const args = parseSourceCheckArgs(normalizedArgv);
      const report = buildKrnSourceCheck(args);
      const reportPath = writeKrnSourceCheck(args.target, report);
      const exitCode = report.decision === "block" ? 1 : 0;
      return { exitCode, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "gate") {
      const args = parseKrnGateArgs(normalizedArgv);
      const gate = buildKrnEngineeringGate(args);
      const gatePath = writeKrnEngineeringGate(args.target, gate);
      const exitCode = gate.gate_status === "blocked" ? 1 : 0;
      return { exitCode, stdout: `${gatePath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "research-pack") {
      const args = parseResearchPackArgs(normalizedArgv);
      const pack = buildKrnResearchPack(args);
      const packPath = writeKrnResearchPack(args.target, pack);
      return { exitCode: 0, stdout: `${packPath}\n`, stderr: "" };
    }

    throw new Error(`Unknown command: ${normalizedArgv[0] ?? "<empty>"}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown CLI error";
    return { exitCode: 1, stdout: "", stderr: `${message}\n${usage()}` };
  }
}

export function main(argv: readonly string[] = process.argv.slice(2)): void {
  const result = runKrnCli(argv);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
