import {
  parseKrnMemoryApplication,
  parseKrnMemoryFeedback,
  type KrnMemoryApplication,
  type KrnMemoryFeedback,
  type KrnMemorySelection,
} from "@krn/contracts";

export type MemoryApplicationSurface = KrnMemoryApplication["surface"];

export function createMemoryApplication(
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
      "Can a fresh Codex run continue from selected IDs, evidence refs, and current task evidence without reading old benchmark history?",
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

export function createMemoryFeedback(
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
