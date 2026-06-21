import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseKrnOperatingBrief, type KrnMemoryRecord, type KrnOperatingBrief } from "@krn/contracts";
import { buildBriefMemoryBundle, recordMemoryFeedback } from "./memory-store.js";

export type BriefArgs = {
  target: string;
  task: string;
  path: string | null;
};

export function parseBriefArgs(argv: readonly string[]): BriefArgs {
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

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function requiredSkillsForTask(task: string): Array<{ name: string; reason: string }> {
  const lowerTask = task.toLowerCase();
  const skills: Array<{ name: string; reason: string }> = [
    {
      name: "goal-execplan",
      reason: "The brief is an execution contract for a restartable Codex run.",
    },
  ];

  if (/\b(type|typescript|contract|parser|cli|mcp|api|dashboard|view model)\b/.test(lowerTask)) {
    skills.push({
      name: "typescript-contract-engineer",
      reason: "The task touches TypeScript contracts, parsers, CLI, or package boundaries.",
    });
  }

  if (/\b(eval|fixture|known-bad|metric|assertion|validation)\b/.test(lowerTask)) {
    skills.push({
      name: "eval-designer",
      reason: "The task changes eval behavior, fixtures, metrics, or validation gates.",
    });
  }

  if (/\b(research|source|paper|pattern|adr|decision)\b/.test(lowerTask)) {
    skills.push({
      name: "research-synthesis",
      reason: "The task needs source-backed synthesis or canonical decision updates.",
    });
  }

  return skills;
}

function selectedContextFromRecords(records: readonly KrnMemoryRecord[], memoryIds: readonly string[]): KrnOperatingBrief["selected_context"] {
  const memoryIdSet = new Set(memoryIds);
  return records
    .filter((record) => memoryIdSet.has(record.id))
    .map((record) => ({
      ref: `memory:${record.id}`,
      reason: record.action_rule,
      confidence: record.confidence,
      source_lineage: record.source_lineage,
    }));
}

export function buildKrnOperatingBrief(args: BriefArgs, now = new Date()): KrnOperatingBrief {
  const targetRoot = resolve(args.target);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/briefs/${runId}/brief.json`;
  const memory = buildBriefMemoryBundle(targetRoot, runId, now, args.task);
  const appliedMemoryIds = memory.application.applied_memory_ids;
  const selectedContext = selectedContextFromRecords(memory.selectedRecords, appliedMemoryIds);
  const sourceRefs = unique(selectedContext.flatMap((context) => context.source_lineage));
  const appliedKernelTerms = unique(memory.selectedRecords.flatMap((record) => record.kernel_terms));

  const candidate: unknown = {
    schema_version: "krn-operating-brief.v1",
    kind: "krn_operating_brief",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn brief",
    task_intent: args.task,
    target_path: args.path,
    selected_context: selectedContext,
    rejected_context: [
      ...memory.selection.rejected.map((record) => ({
        ref: `memory:${record.memory_id}`,
        reason: record.reason,
      })),
      ...memory.selection.rejected_context,
    ],
    applied_kernel_terms: appliedKernelTerms,
    required_skills: requiredSkillsForTask(args.task),
    memory_selection: memory.selection,
    memory_application: memory.application,
    memory_feedback: memory.feedback,
    next_action: memory.application.next_action,
    verification: {
      command: "pnpm typecheck && git diff --check",
      artifact: runtimeReportPath,
    },
    runtime_report_path: runtimeReportPath,
    source_refs: sourceRefs,
    overclaim_boundary:
      "This operating brief proves bounded memory selection/application for one local Codex run. It does not prove productivity lift, final memory quality, dashboard readiness, or API/cloud sync.",
    interpretation_caveat:
      "This is runtime evidence for the next action, not authoritative memory core. Memory bodies remain in the MemoryStore adapter, not in .krn.",
  };

  return parseKrnOperatingBrief(candidate);
}

export function writeKrnOperatingBrief(targetInput: string, brief: KrnOperatingBrief): string {
  const targetRoot = resolve(targetInput);
  const briefDir = resolve(targetRoot, ".krn", "briefs", brief.run_id);
  const briefPath = resolve(briefDir, "brief.json");

  mkdirSync(briefDir, { recursive: true });
  writeFileSync(briefPath, `${JSON.stringify(brief, null, 2)}\n`, "utf8");
  recordMemoryFeedback(brief.memory_feedback);

  return briefPath;
}
