import {
  parseKrnLocalMemoryStore,
  parseKrnMemoryRecord,
  parseKrnMemorySelection,
  type KrnMemoryApplication,
  type KrnMemoryFeedback,
  type KrnMemoryRecord,
  type KrnMemoryRetrievalPolicy,
  type KrnMemorySelection,
} from "@krn/contracts";
import {
  loadLocalMemoryStore,
  localMemoryStoreRef,
  resolveLocalMemoryStorePath,
  writeLocalMemoryStore,
} from "./local-memory-store-adapter.js";
import {
  createMemoryApplication,
  createMemoryFeedback,
  type MemoryApplicationSurface,
} from "./memory-application.js";
import { selectMemoryRecords } from "./memory-selection.js";

type MemoryBundle = {
  selection: KrnMemorySelection;
  application: KrnMemoryApplication;
  feedback: KrnMemoryFeedback;
  selectedRecords: KrnMemoryRecord[];
};

type MemoryTaskKind = KrnMemorySelection["task_kind"];

function createMemorySelection(
  targetRoot: string,
  runId: string,
  createdAt: string,
  storeRef: string,
  taskIntent: string,
  taskKind: MemoryTaskKind,
  policy: KrnMemoryRetrievalPolicy,
  records: readonly KrnMemoryRecord[],
  feedback: readonly KrnMemoryFeedback[],
): KrnMemorySelection {
  const { selected, rejected } = selectMemoryRecords(records, feedback, taskKind, policy.max_selected);
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
    rejected: rejected.map(({ record, reason }) => ({
      memory_id: record.id,
      reason,
    })),
    rejected_context: policy.rejected_context,
    retrieval_budget: {
      max_selected: policy.max_selected,
      selection_policy: policy.selection_policy,
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

function buildMemoryBundle(input: {
  targetRoot: string;
  runId: string;
  now: Date;
  taskIntent: string;
  taskKind: MemoryTaskKind;
  surface: MemoryApplicationSurface;
}): MemoryBundle {
  const storePath = resolveLocalMemoryStorePath();
  const storeRef = localMemoryStoreRef(storePath);
  const storeFile = loadLocalMemoryStore(storePath);
  const createdAt = input.now.toISOString();
  const selection = createMemorySelection(
    input.targetRoot,
    input.runId,
    createdAt,
    storeRef,
    input.taskIntent,
    input.taskKind,
    storeFile.policy,
    storeFile.records,
    storeFile.feedback,
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
    taskIntent: "Review current KRN runtime evidence against the review contract and selected memory guidance.",
    taskKind: "review",
    surface: "krn_review",
  });
}

export function recordMemoryFeedback(feedback: KrnMemoryFeedback, storePathInput?: string): void {
  const storePath = storePathInput ?? resolveLocalMemoryStorePath();
  const storeFile = loadLocalMemoryStore(storePath);
  const selectedMemoryIds = new Set(feedback.memory_outcomes.map((outcome) => outcome.memory_id));
  const nextStoreFile = parseKrnLocalMemoryStore({
    schema_version: storeFile.schema_version,
    policy: storeFile.policy,
    records: storeFile.records.map((record) =>
      selectedMemoryIds.has(record.id)
        ? parseKrnMemoryRecord({
            ...record,
            last_used_at: feedback.created_at,
          })
        : record,
    ),
    feedback: [...storeFile.feedback, feedback],
  });

  writeLocalMemoryStore(storePath, nextStoreFile);
}
