import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseKrnResearchPack, type KrnResearchPack, type SourceBudgetMode } from "@krn/contracts";
import { createRunId } from "./runtime-utils.js";

export type ResearchPackArgs = {
  target: string;
  question: string;
  decision: string;
  budget: SourceBudgetMode;
};

export function parseResearchPackArgs(argv: readonly string[]): ResearchPackArgs {
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

export function buildKrnResearchPack(args: ResearchPackArgs, now = new Date()): KrnResearchPack {
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
      "docs/goals/goal-038.md",
      "docs/goals/goal-036.md",
      "docs/plans/canonical/draft.md",
      "docs/source-bank/MANIFEST.md",
      "docs/specs/krn-research-pack/README.md",
    ],
    evidence_refs: [runtimeReportPath],
    interpretation_caveat:
      "This scaffold proves only that KRN can create a typed research-pack target. It does not prove sources were read, mechanisms were extracted, memory should be promoted, or productivity lift exists.",
  };

  return parseKrnResearchPack(candidatePack);
}

export function writeKrnResearchPack(targetInput: string, pack: KrnResearchPack): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "research-packs", pack.run_id);
  const reportPath = resolve(reportDir, "research-pack.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");

  return reportPath;
}
