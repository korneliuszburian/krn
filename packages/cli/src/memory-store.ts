import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { z } from "zod";
import {
  KrnMemoryFeedbackSchema,
  KrnMemoryRecordSchema,
  parseKrnMemoryApplication,
  parseKrnMemoryFeedback,
  parseKrnMemorySelection,
  type KrnMemoryApplication,
  type KrnMemoryFeedback,
  type KrnMemoryRecord,
  type KrnMemorySelection,
} from "@krn/contracts";

const STORE_SCHEMA_VERSION = "krn-local-memory-store.v1";
const DEFAULT_MAX_SELECTED = 3;

const LocalMemoryStoreFileSchema = z
  .object({
    schema_version: z.literal(STORE_SCHEMA_VERSION),
    records: z.array(KrnMemoryRecordSchema).min(1),
    feedback: z.array(KrnMemoryFeedbackSchema),
  })
  .strict();

type LocalMemoryStoreFile = z.infer<typeof LocalMemoryStoreFileSchema>;

type MemoryBundle = {
  selection: KrnMemorySelection;
  application: KrnMemoryApplication;
  feedback: KrnMemoryFeedback;
  selectedRecords: KrnMemoryRecord[];
};

type MemoryTaskKind = KrnMemorySelection["task_kind"];
type MemoryApplicationSurface = KrnMemoryApplication["surface"];

function resolveMemoryStorePath(): string {
  const explicitPath = process.env["KRN_MEMORY_STORE_PATH"];
  if (explicitPath && explicitPath.trim().length > 0) {
    return resolve(explicitPath);
  }
  return join(homedir(), ".krn", "memory-store.json");
}

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function loadMemoryStoreFile(storePath: string): LocalMemoryStoreFile {
  if (!existsSync(storePath)) {
    throw new Error(
      `KRN MemoryStore not found at ${storePath}. Set KRN_MEMORY_STORE_PATH to a local store file outside the target repo before running memory-aware review.`,
    );
  }
  return LocalMemoryStoreFileSchema.parse(readJsonFile(storePath));
}

function writeMemoryStoreFile(storePath: string, storeFile: LocalMemoryStoreFile): void {
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, `${JSON.stringify(storeFile, null, 2)}\n`, "utf8");
}

function selectRecords(records: readonly KrnMemoryRecord[], taskKind: MemoryTaskKind): {
  selected: KrnMemoryRecord[];
  rejected: KrnMemoryRecord[];
} {
  const selected = records
    .filter(
      (record) =>
        record.status === "active" &&
        record.freshness !== "stale" &&
        record.selectors.task_kinds.includes(taskKind),
    )
    .slice(0, DEFAULT_MAX_SELECTED);
  const selectedIds = new Set(selected.map((record) => record.id));

  return {
    selected,
    rejected: records.filter((record) => !selectedIds.has(record.id)),
  };
}

function createMemorySelection(
  targetRoot: string,
  runId: string,
  createdAt: string,
  storeRef: string,
  taskIntent: string,
  taskKind: MemoryTaskKind,
  records: readonly KrnMemoryRecord[],
): KrnMemorySelection {
  const { selected, rejected } = selectRecords(records, taskKind);
  if (selected.length === 0) {
    throw new Error(`KRN MemoryStore has no active ${taskKind} records to select.`);
  }
  const candidate: unknown = {
    schema_version: "krn-memory-selection.v1",
    kind: "krn_memory_selection",
    run_id: `${runId}-memory-selection`,
    created_at: createdAt,
    target_root: targetRoot,
    task_intent: taskIntent,
    task_kind: taskKind,
    store_ref: storeRef,
    selected: selected.map((record) => ({
      memory_id: record.id,
      reason: `Selected for ${taskKind} because it targets ${record.selectors.failure_modes.join(", ")}.`,
      confidence: record.confidence,
      source_lineage: record.source_lineage,
      expected_use: record.action_rule,
    })),
    rejected: rejected.map((record) => ({
      memory_id: record.id,
      reason:
        record.status === "active"
          ? "Not selected because the bounded review budget was already filled by higher-priority active records."
          : "Not selected because stale/lab/archive memory is not default context.",
    })),
    rejected_context: [
      {
        ref: "docs/goals/goal-018.md..goal-034.md",
        reason: "Expanded benchmark goals are lab/archive context and are rejected for default product review.",
      },
      {
        ref: "docs/memory/** full scan",
        reason: "Full memory-bank scans are context dumps; this run may use only selected memory IDs.",
      },
      {
        ref: ".krn/** as memory core",
        reason: ".krn is runtime evidence/cache/ledger and must not be treated as authoritative memory.",
      },
    ],
    retrieval_budget: {
      max_selected: DEFAULT_MAX_SELECTED,
      selection_policy: `active ${taskKind} records only; reject stale/lab/archive context and full memory-bank scans`,
    },
    overclaim_boundary:
      "This selection proves bounded local-dev memory selection only; it does not prove final memory quality, productivity lift, or cloud/team sync readiness.",
  };

  return parseKrnMemorySelection(candidate);
}

function selectedRecordsForSelection(
  records: readonly KrnMemoryRecord[],
  selection: KrnMemorySelection,
): KrnMemoryRecord[] {
  const byId = new Map(records.map((record) => [record.id, record]));
  return selection.selected.map((selected) => {
    const record = byId.get(selected.memory_id);
    if (!record) {
      throw new Error(`Selected memory ${selected.memory_id} was not found in MemoryStore records.`);
    }
    return record;
  });
}

function createMemoryApplication(
  targetRoot: string,
  runId: string,
  createdAt: string,
  surface: MemoryApplicationSurface,
  selection: KrnMemorySelection,
): KrnMemoryApplication {
  const selectedIds = selection.selected.map((record) => record.memory_id);
  const surfaceNameBySurface: Record<MemoryApplicationSurface, string> = {
    krn_brief: "krn brief",
    krn_context: "krn context build",
    krn_review: "krn review",
  };
  const surfaceName = surfaceNameBySurface[surface];
  const candidate: unknown = {
    schema_version: "krn-memory-application.v1",
    kind: "krn_memory_application",
    run_id: `${runId}-memory-application`,
    created_at: createdAt,
    target_root: targetRoot,
    surface,
    selection_run_id: selection.run_id,
    applied_memory_ids: selectedIds,
    blockers: [
      "Do not treat docs/memory/** or .krn/** as final memory core.",
      "Do not add dashboard, benchmark, broad API/cloud sync, or passive docs before this memory path has a consumer.",
    ],
    required_checks: [
      `${surfaceName} output must cite selected memory IDs and rejected context.`,
      `${surfaceName} output must include application guidance before selected memory can count as used.`,
      "Runtime evidence may store memory IDs and outcomes, not authoritative memory bodies.",
    ],
    review_questions: [
      "Did selected memory change the next review/action decision?",
      "Was any selected memory stale, harmful, or ignored?",
      "Can a fresh Codex run continue from selected IDs, evidence refs, and goal-038 without reading old benchmark history?",
    ],
    blocked_bad_actions: [
      "context_dump_from_docs_memory",
      "repo_local_memory_core_claim",
      "selected_memory_without_application_guidance",
    ],
    next_action: `Use this application guidance in ${surfaceName}, then record pending feedback to the MemoryStore adapter.`,
    overclaim_boundary:
      "This application proves operating guidance wiring only; it does not prove memory precision lift or review burden reduction.",
  };

  return parseKrnMemoryApplication(candidate);
}

function createMemoryFeedback(
  targetRoot: string,
  runId: string,
  createdAt: string,
  storeRef: string,
  selection: KrnMemorySelection,
  application: KrnMemoryApplication,
): KrnMemoryFeedback {
  const candidate: unknown = {
    schema_version: "krn-memory-feedback.v1",
    kind: "krn_memory_feedback",
    run_id: `${runId}-memory-feedback`,
    created_at: createdAt,
    target_root: targetRoot,
    selection_run_id: selection.run_id,
    application_run_id: application.run_id,
    feedback_sink_ref: storeRef,
    overall_outcome: "pending_review",
    memory_outcomes: selection.selected.map((record) => ({
      memory_id: record.memory_id,
      outcome: "pending_review",
      reason: "KRN applied this memory to operating guidance; human/metric outcome is pending.",
    })),
    notes:
      "Feedback is stored in the local MemoryStore adapter as usage evidence. It is not a productivity-lift claim.",
  };

  return parseKrnMemoryFeedback(candidate);
}

function buildMemoryBundle(input: {
  targetRoot: string;
  runId: string;
  now: Date;
  taskIntent: string;
  taskKind: MemoryTaskKind;
  surface: MemoryApplicationSurface;
}): MemoryBundle {
  const storePath = resolveMemoryStorePath();
  const storeRef = `local-dev-json:${storePath}`;
  const storeFile = loadMemoryStoreFile(storePath);
  const createdAt = input.now.toISOString();
  const selection = createMemorySelection(
    input.targetRoot,
    input.runId,
    createdAt,
    storeRef,
    input.taskIntent,
    input.taskKind,
    storeFile.records,
  );
  const application = createMemoryApplication(input.targetRoot, input.runId, createdAt, input.surface, selection);
  const feedback = createMemoryFeedback(input.targetRoot, input.runId, createdAt, storeRef, selection, application);
  const selectedRecords = selectedRecordsForSelection(storeFile.records, selection);

  return { selection, application, feedback, selectedRecords };
}

export function buildBriefMemoryBundle(targetRoot: string, runId: string, now: Date, taskIntent: string): MemoryBundle {
  return buildMemoryBundle({
    targetRoot,
    runId,
    now,
    taskIntent,
    taskKind: "planning",
    surface: "krn_brief",
  });
}

export function buildContextMemoryBundle(targetRoot: string, runId: string, now: Date, taskIntent: string): MemoryBundle {
  return buildMemoryBundle({
    targetRoot,
    runId,
    now,
    taskIntent,
    taskKind: "planning",
    surface: "krn_context",
  });
}

export function buildReviewMemoryBundle(targetRoot: string, runId: string, now: Date): MemoryBundle {
  return buildMemoryBundle({
    targetRoot,
    runId,
    now,
    taskIntent: "Review current KRN runtime evidence against the active final-product goal.",
    taskKind: "review",
    surface: "krn_review",
  });
}

export function recordMemoryFeedback(feedback: KrnMemoryFeedback): void {
  const storePath = resolveMemoryStorePath();
  const storeFile = loadMemoryStoreFile(storePath);
  const selectedMemoryIds = new Set(feedback.memory_outcomes.map((outcome) => outcome.memory_id));
  const nextStoreFile = LocalMemoryStoreFileSchema.parse({
    schema_version: STORE_SCHEMA_VERSION,
    records: storeFile.records.map((record) =>
      selectedMemoryIds.has(record.id)
        ? KrnMemoryRecordSchema.parse({
            ...record,
            last_used_at: feedback.created_at,
          })
        : record,
    ),
    feedback: [...storeFile.feedback, feedback],
  });

  writeMemoryStoreFile(storePath, nextStoreFile);
}
