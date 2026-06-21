import { readFileSync } from "node:fs";
import { parseKrnMemoryFeedback, type KrnMemoryFeedback } from "@krn/contracts";
import { localMemoryStorePathFromRef } from "./local-memory-store-adapter.js";
import { recordMemoryFeedback } from "./memory-store.js";

const resolvedOutcomes = ["used", "ignored", "harmful", "missed", "stale", "blocked_bad_action"] as const;

type ResolvedMemoryOutcome = (typeof resolvedOutcomes)[number];

export type MemoryFeedbackArgs = {
  artifact: string;
  outcome: ResolvedMemoryOutcome;
  reason: string;
  memoryIds: string[];
};

function readOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

function parseResolvedOutcome(value: string): ResolvedMemoryOutcome {
  if ((resolvedOutcomes as readonly string[]).includes(value)) {
    return value as ResolvedMemoryOutcome;
  }
  throw new Error(`Invalid --outcome. Expected one of: ${resolvedOutcomes.join(", ")}`);
}

export function parseMemoryFeedbackArgs(argv: readonly string[]): MemoryFeedbackArgs {
  if (argv[0] !== "memory" || argv[1] !== "feedback") {
    throw new Error("Expected command: memory feedback");
  }

  let artifact: string | null = null;
  let outcome: ResolvedMemoryOutcome | null = null;
  let reason: string | null = null;
  const memoryIds: string[] = [];

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--artifact") {
      artifact = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--outcome") {
      outcome = parseResolvedOutcome(readOptionValue(argv, index, arg));
      index += 1;
      continue;
    }

    if (arg === "--reason") {
      reason = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--memory-id") {
      memoryIds.push(readOptionValue(argv, index, arg));
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (!artifact) {
    throw new Error("Missing required --artifact");
  }
  if (!outcome) {
    throw new Error("Missing required --outcome");
  }
  if (!reason) {
    throw new Error("Missing required --reason");
  }

  return { artifact, outcome, reason, memoryIds: [...new Set(memoryIds)] };
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return typeof input === "object" && input !== null && !Array.isArray(input);
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function readMemoryFeedbackArtifact(path: string): KrnMemoryFeedback {
  const artifact = readJson(path);
  if (isRecord(artifact) && "memory_feedback" in artifact) {
    return parseKrnMemoryFeedback(artifact["memory_feedback"]);
  }
  return parseKrnMemoryFeedback(artifact);
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}-memory-feedback`;
}

export function buildResolvedMemoryFeedback(args: MemoryFeedbackArgs, now = new Date()): KrnMemoryFeedback {
  const pendingFeedback = readMemoryFeedbackArtifact(args.artifact);
  if (pendingFeedback.overall_outcome !== "pending_review") {
    throw new Error("KRN memory feedback artifact is already resolved. Use the original pending feedback artifact.");
  }
  const pendingOutcomesById = new Map(pendingFeedback.memory_outcomes.map((outcome) => [outcome.memory_id, outcome]));
  const memoryOutcomes =
    args.memoryIds.length === 0
      ? pendingFeedback.memory_outcomes
      : args.memoryIds.map((memoryId) => {
          const outcome = pendingOutcomesById.get(memoryId);
          if (!outcome) {
            throw new Error(`KRN memory feedback artifact does not include selected memory: ${memoryId}`);
          }
          return outcome;
        });

  const candidate: unknown = {
    schema_version: "krn-memory-feedback.v1",
    kind: "krn_memory_feedback",
    run_id: createRunId(now),
    created_at: now.toISOString(),
    target_root: pendingFeedback.target_root,
    selection_run_id: pendingFeedback.selection_run_id,
    application_run_id: pendingFeedback.application_run_id,
    feedback_sink_ref: pendingFeedback.feedback_sink_ref,
    overall_outcome: args.outcome,
    memory_outcomes: memoryOutcomes.map((memoryOutcome) => ({
      memory_id: memoryOutcome.memory_id,
      outcome: args.outcome,
      reason: args.reason,
    })),
    notes:
      "Resolved operator feedback for selected MemoryStore IDs. This records memory-use outcome only; it does not store authoritative memory bodies or prove productivity lift.",
  };

  return parseKrnMemoryFeedback(candidate);
}

export function recordResolvedMemoryFeedback(args: MemoryFeedbackArgs, now = new Date()): KrnMemoryFeedback {
  const feedback = buildResolvedMemoryFeedback(args, now);
  recordMemoryFeedback(feedback, localMemoryStorePathFromRef(feedback.feedback_sink_ref));
  return feedback;
}
