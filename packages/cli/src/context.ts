import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseKrnContextPacket, type KrnContextPacket, type KrnMemoryRecord } from "@krn/contracts";
import { buildContextMemoryBundle, recordMemoryFeedback } from "./memory-store.js";

export type ContextBuildArgs = {
  target: string;
  task: string;
  path: string | null;
};
function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}
function readOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}
export function parseContextBuildArgs(argv: readonly string[]): ContextBuildArgs {
  if (argv[0] !== "context" || argv[1] !== "build") {
    throw new Error("Expected command: context build");
  }

  let target = ".";
  let task: string | null = null;
  let path: string | null = null;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      target = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--task") {
      task = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--path") {
      path = readOptionValue(argv, index, arg);
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

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function selectedContextFromRecords(
  records: readonly KrnMemoryRecord[],
  memoryIds: readonly string[],
): KrnContextPacket["selected_context"] {
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

function isTypeScriptTargetPath(path: string | null): boolean {
  return path !== null && /\.(?:ts|tsx|mts|cts)$/.test(path);
}

function requiredSkillsForTask(task: string, targetPath: string | null): KrnContextPacket["required_skills"] {
  const lowerTask = task.toLowerCase();
  const skills: KrnContextPacket["required_skills"] = [
    {
      name: "goal-execplan",
      reason: "Context packets are restartable execution input for Codex work.",
    },
  ];

  if (
    /\b(type|typescript|contract|parser|cli|mcp|api|dashboard|view model|schema)\b/.test(lowerTask) ||
    isTypeScriptTargetPath(targetPath)
  ) {
    skills.push({
      name: "typescript-contract-engineer",
      reason: "The task touches TypeScript contracts, parsers, CLI, target paths, or package boundaries.",
    });
  }

  if (/\b(eval|fixture|known-bad|metric|assertion|validation|gate)\b/.test(lowerTask)) {
    skills.push({
      name: "eval-designer",
      reason: "The task changes eval behavior, fixtures, metrics, or validation gates.",
    });
  }

  return skills;
}

export function buildKrnContextPacket(args: ContextBuildArgs, now = new Date()): KrnContextPacket {
  const targetRoot = resolve(args.target);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/context/${runId}/context-packet.json`;
  const memory = buildContextMemoryBundle(targetRoot, runId, now, args.task);
  const appliedMemoryIds = memory.application.applied_memory_ids;
  const selectedContext = selectedContextFromRecords(memory.selectedRecords, appliedMemoryIds);
  const sourceRefs = unique(memory.selectedRecords.flatMap((record) => record.source_lineage));
  const rejectedContext = [
    ...memory.selection.rejected.map((record) => ({
      ref: `memory:${record.memory_id}`,
      reason: record.reason,
    })),
    ...memory.selection.rejected_context,
  ];

  const candidate: unknown = {
    schema_version: "krn-context-packet.v1",
    kind: "krn_context_packet",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn context build",
    task_intent: args.task,
    target_path: args.path,
    context_budget: {
      max_selected_context: memory.selection.retrieval_budget.max_selected,
      selected_context_count: selectedContext.length,
      rejected_context_count: rejectedContext.length,
      policy: "Use selected memory IDs and source lineage only; reject full docs/memory scans and lab history by default.",
    },
    selected_context: selectedContext,
    rejected_context: rejectedContext,
    context_sections: [
      {
        id: "task",
        refs: [args.path ?? "task:intent"],
        summary: args.task,
      },
      {
        id: "memory",
        refs: selectedContext.map((context) => context.ref),
        summary: "Apply selected memory IDs through guidance; do not copy authoritative memory bodies into runtime evidence.",
      },
      {
        id: "policy",
        refs: sourceRefs,
        summary: `Required kernel terms: ${unique(memory.selectedRecords.flatMap((record) => record.kernel_terms)).join(", ")}.`,
      },
      {
        id: "verification",
        refs: [runtimeReportPath],
        summary: "Verify through context-packet contract tests, CLI behavior tests, typecheck, and git diff checks.",
      },
    ],
    required_skills: requiredSkillsForTask(args.task, args.path),
    blocked_actions: [
      "Do not load docs/memory/** as a context dump.",
      "Do not treat .krn/** as authoritative memory core.",
      "Do not add dashboard, benchmark, or broad API/cloud sync before this context path has review/eval proof.",
    ],
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
      "This context packet proves bounded context selection/application for one local Codex run. It does not prove productivity lift, final context quality, dashboard readiness, or API/cloud sync.",
    interpretation_caveat:
      "This is runtime context evidence for the next action, not authoritative memory core. Memory bodies remain in the MemoryStore adapter, not in .krn.",
  };

  return parseKrnContextPacket(candidate);
}

export function writeKrnContextPacket(targetInput: string, packet: KrnContextPacket): string {
  const targetRoot = resolve(targetInput);
  const packetDir = resolve(targetRoot, ".krn", "context", packet.run_id);
  const packetPath = resolve(packetDir, "context-packet.json");

  mkdirSync(packetDir, { recursive: true });
  writeFileSync(packetPath, `${JSON.stringify(packet, null, 2)}\n`, "utf8");
  recordMemoryFeedback(packet.memory_feedback);

  return packetPath;
}
