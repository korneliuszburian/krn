import type { KrnMemoryFeedback, KrnMemoryRecord, KrnMemorySelection, MemoryOutcome } from "@krn/contracts";

type MemoryTaskKind = KrnMemorySelection["task_kind"];

const feedbackBlockingOutcomes = new Set<MemoryOutcome>(["harmful", "stale", "blocked_bad_action"]);

export type SelectedMemoryRecords = {
  selected: KrnMemoryRecord[];
  rejected: Array<{ record: KrnMemoryRecord; reason: string }>;
};

function latestOutcomesByMemoryId(feedback: readonly KrnMemoryFeedback[]): Map<string, MemoryOutcome> {
  const outcomes = new Map<string, MemoryOutcome>();
  for (const entry of feedback) {
    for (const memoryOutcome of entry.memory_outcomes) {
      outcomes.set(memoryOutcome.memory_id, memoryOutcome.outcome);
    }
  }
  return outcomes;
}

function recordIsSelectable(
  record: KrnMemoryRecord,
  taskKind: MemoryTaskKind,
  latestOutcomes: ReadonlyMap<string, MemoryOutcome>,
): boolean {
  const latestOutcome = latestOutcomes.get(record.id);
  const blockedByFeedback = latestOutcome ? feedbackBlockingOutcomes.has(latestOutcome) : false;
  return (
    record.status === "active" &&
    record.freshness !== "stale" &&
    record.selectors.task_kinds.includes(taskKind) &&
    !blockedByFeedback
  );
}

function rejectedRecordReason(
  record: KrnMemoryRecord,
  taskKind: MemoryTaskKind,
  latestOutcomes: ReadonlyMap<string, MemoryOutcome>,
): string {
  const latestOutcome = latestOutcomes.get(record.id);
  if (latestOutcome && feedbackBlockingOutcomes.has(latestOutcome)) {
    return `Not selected because latest feedback outcome is ${latestOutcome}.`;
  }
  if (record.status !== "active" || record.freshness === "stale") {
    return "Not selected because stale/lab/archive memory is not default context.";
  }
  if (!record.selectors.task_kinds.includes(taskKind)) {
    return `Not selected because this record does not target ${taskKind} tasks.`;
  }
  return "Not selected because the bounded review budget was already filled by higher-priority active records.";
}

export function selectMemoryRecords(
  records: readonly KrnMemoryRecord[],
  feedback: readonly KrnMemoryFeedback[],
  taskKind: MemoryTaskKind,
  maxSelected: number,
): SelectedMemoryRecords {
  const latestOutcomes = latestOutcomesByMemoryId(feedback);
  const selected = records
    .filter((record) => recordIsSelectable(record, taskKind, latestOutcomes))
    .slice(0, maxSelected);
  const selectedIds = new Set(selected.map((record) => record.id));

  return {
    selected,
    rejected: records
      .filter((record) => !selectedIds.has(record.id))
      .map((record) => ({
        record,
        reason: rejectedRecordReason(record, taskKind, latestOutcomes),
      })),
  };
}
