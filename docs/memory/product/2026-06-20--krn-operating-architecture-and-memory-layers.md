---
id: krn-operating-architecture-and-memory-layers
status: decision
updated: 2026-06-20
sources:
  - docs/product/final-product-plan.md
  - docs/goals/goal-006.md
  - docs/goals/goal-009.md
  - docs/plans/canonical/SOURCES.md
  - docs/plans/canonical/pattern-matrix.md
  - docs/memory/openai-codex/2026-06-19--openai-cookbook-to-krn-pattern-map.md
  - docs/memory/product/2026-06-19--krn-product-principles.md
---

# KRN Operating Architecture And Memory Layers

## Status

[DECISION] KRN's core is a local Codex operating loop with a multi-layer memory/control system, not file-based memory by itself.

File-backed artifacts are only the first local bootstrap/audit/export substrate because they are auditable, diffable, and easy to review. They are not the target memory architecture and not the breakthrough. The useful product is the control loop that selects relevant knowledge, applies it through skills/contracts/tools, reviews the result, and measures whether the next Codex run improves.

## Useful Pattern

KRN should resolve Codex's operating paradoxes through layered state:

```text
repo/task
  -> attention routing
  -> active goal and research/plan checkpoint
  -> typed runtime evidence
  -> source/claim ledger
  -> proposal-only changes
  -> human/dashboard review
  -> approved memory/decision/repair/skill updates
  -> next Codex run
  -> baseline-vs-assisted measurement
```

Memory layers:

- attention router: `AGENTS.md`, `docs/memory/INDEX.md`;
- active execution state: `docs/goals/*.md`, compact checkpoints;
- runtime evidence: `.krn/**`;
- source and claim ledger: `docs/plans/canonical/SOURCES.md`;
- pattern bank / audit export: `docs/memory/**`, ADRs;
- retrieval and selection layer: planned typed index/API over patterns, sources, active goals, runtime evidence, and invalidation state;
- application layer: `.agents/skills`, `packages/contracts`, `packages/cli`, `packages/mcp`;
- review/control surface: proposal store now, dashboard later;
- feedback layer: skill impact reports, benchmark reports, repair records.

## KRN Implication

- Do not describe KRN as "memory in files".
- Do not promote `.krn` runtime artifacts into durable truth without review.
- Do not treat `docs/memory` as product memory unless a retrieval/selection/application path uses it in real work.
- Do not build dashboard/UI before typed objects and proposal/review surfaces exist.
- Do not claim productivity lift before baseline-vs-assisted benchmark evidence.
- Require a lightweight research/plan checkpoint before non-trivial implementation slices.
- Keep ChatGPT bridge deferred and optional; local Codex/KRN loop is the product core.

## Failure Mode

KRN fails if it becomes:

- a folder of markdown memory notes,
- a pattern bank without retrieval, selection, application, and feedback,
- a snapshot/artifact generator,
- a prompt or skill pack without measured impact,
- a dashboard over mocked or unreviewed state,
- an integration project around ChatGPT before the local loop proves value.

## Review Trigger

Update this note when:

- MCP proposal tools are registered,
- dashboard reads real proposal-store records,
- compact continuity becomes typed runtime state,
- benchmark evidence exists,
- memory moves from file substrate toward graph/retrieval/indexed runtime,
- a retrieval/application eval proves or disproves that selected memory changes Codex behavior.
