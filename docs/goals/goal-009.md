# Goal 009: Source-Backed Proposal Persistence

## Status

Completed eight-hour child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `1b3632c feat: add dashboard view model contract`. It is not a replacement for `goal-006`; it is the next Slice 3 execution contract.

Current implementation status: phases 0-7 are completed and verified in implementation commit `9ba35f8 feat: add source-backed proposal persistence`.

## Objective

Prevent the Slice 3 control plane from drifting into artifact/snapshot slop by turning proposal persistence into a source-backed, append-only, idempotent boundary before any MCP/API proposal tool is registered.

The end state is:

```text
proposal contract
  -> source-ref validation against target files and SOURCES.md
  -> append-only .krn/proposals persistence
  -> idempotency/conflict checks
  -> deterministic eval in krn eval
  -> source/memory/goal update
```

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)
- [docs/specs/krn-control-plane-proposal/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-control-plane-proposal/README.md)

[DECISION] Do not register MCP proposal tools until source-backed proposal persistence and deterministic evals exist.

[DECISION] Source refs are not decorative strings. A proposal may persist only when its `source_refs` resolve to existing target-root files, source IDs, claim IDs, local evidence IDs, or URLs present in `docs/plans/canonical/SOURCES.md`.

## Current Starting State

[FACT] The repo already has:

- `KrnControlPlaneProposal` parser and JSON Schema.
- valid and known-bad approved-mutation fixtures under `docs/specs/krn-control-plane-proposal/`.
- read-only STDIO MCP transport with no tools advertised.
- dashboard view-model contract over real MCP/runtime resources.

[FACT] Missing state before this goal:

- source-ref validation beyond `z.string().min(1)`,
- append-only proposal persistence,
- idempotency conflict checks,
- proposal persistence eval,
- aggregate `krn eval` coverage for proposal persistence.

## Current Progress Evidence

[FACT] Phases 0-4 now have local evidence:

- `packages/mcp/src/proposal-store.ts` exports `validateProposalSourceRefs` and `storeKrnControlPlaneProposal`.
- `storeKrnControlPlaneProposal` writes only under `.krn/proposals/{idempotency-key}/proposal.json`.
- identical idempotency key plus identical content returns `already_stored`.
- identical idempotency key plus conflicting content is rejected.
- unbacked source refs are rejected before persistence.
- target path traversal is rejected before persistence.
- `docs/specs/krn-control-plane-proposal/fixtures/bad-unbacked-source-ref.example.json` parses as a proposal object but fails store validation.
- `docs/evals/krn-proposal-store/` defines deterministic cases, result schema, and OpenAI mapping.
- `krn eval` now includes `krn-proposal-store`.

[FACT] Latest local evidence during this goal:

```text
pnpm typecheck -> passed
pnpm exec vitest run packages/contracts/test/control-plane-proposal.test.ts packages/mcp/test/proposal-store.test.ts packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts -> 4 files, 13 tests passed
pnpm typecheck -> passed
pnpm test -> 15 files, 39 tests passed
pnpm run eval:krn-proposal-store -> .krn/evals/krn-proposal-store/20260619T233420Z-1874053/report.json, 4/4 cases, 9/9 assertions
pnpm run krn -- eval -> .krn/eval/20260619T233426Z-1874184/report.json
pnpm run eval:krn-eval -> .krn/evals/krn-eval-contracts/20260619T233448Z-1874871/report.json, 3/3 cases, 7/7 assertions
python3 scripts/evals/codex_memory_compliance.py --mode validate -> .krn/evals/codex-memory-compliance/20260619T233514031270Z-1875716/report.json, 4/4 cases passed
git diff --check -> passed
```

[FACT] This still does not prove MCP/API proposal tool safety, dashboard UI readiness, human approval quality, ChatGPT connector behavior, or productivity lift.

## Research/Plan Checkpoint Applied

This goal treats patterns as condensed source-backed mechanisms, not generic best-practice labels.

Layer changed:

- Slice 3 control plane proposal persistence.

Selected mechanisms:

- C004 / S007 / S022: MCP/API writes need schemas, approvals, idempotency, and audit before any tool can mutate state.
- C015 / S010-S021 / S086: Cookbook patterns become mechanism, artifact, eval, and failure-mode mappings, not bibliography.
- C007 / S025-S040: durable memory must separate source-backed fact, inference, invalidation, and review trigger.

Rejected alternatives:

- Registering MCP proposal tools first: rejected because tool safety would be claimed before persistence/idempotency/source grounding exist.
- Treating source refs as arbitrary strings: rejected because it preserves the exact artifact/snapshot slop this goal is meant to stop.
- Adding a heavy generic pattern-gate eval now: rejected because the useful product rule is a lightweight research/plan checkpoint before non-trivial slices, not ceremony for every edit.

Required skills used in this goal:

- `operator-intake` for phase routing,
- `research-synthesis` for source-to-mechanism mapping,
- `goal-execplan` for keeping the goal restartable,
- `typescript-contract-engineer` for the unknown-first TypeScript boundary,
- `eval-designer` for the deterministic proposal-store eval.

Falsification path:

- `pnpm run eval:krn-proposal-store` must reject unbacked source refs, path traversal, and idempotency conflicts.
- `pnpm run krn -- eval` must include `krn-proposal-store`.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` must pass after memory/source/goal updates.

Overclaim boundary:

- This goal proves source-backed append-only proposal persistence only. It does not prove MCP/API proposal tool safety, dashboard UI readiness, human approval quality, ChatGPT connector behavior, or productivity lift.

## Eight-Hour Work Plan

### 0. Direction Check - completed

Purpose: answer the artifact/slop risk before adding more surfaces.

Acceptance evidence:

- `AGENTS.md`, `docs/memory/INDEX.md`, `goal-006`, `goal-008`, final product plan, pattern matrix, sources, and context were inspected.
- The implementation target was narrowed to proposal persistence, not dashboard UI.

### 1. Source-Ref Gate - completed

Purpose: make source-backed claims enforceable at the proposal boundary.

Acceptance evidence:

- `validateProposalSourceRefs` accepts existing target-root files.
- It accepts `Sxxx`, `Cxxx`, `LOCALxxx`, and ledger URLs only when present in `docs/plans/canonical/SOURCES.md`.
- It rejects unbacked refs such as `S999` or missing files.

### 2. Append-Only Proposal Store - completed

Purpose: create the persistence target needed before any proposal tool.

Acceptance evidence:

- valid proposal stores under `.krn/proposals`.
- duplicate identical idempotency key returns the existing path.
- conflicting idempotency key content is rejected.
- target path traversal is rejected.

### 3. Deterministic Eval - completed

Purpose: make the anti-slop/source-backed behavior a standard validation surface.

Acceptance evidence:

```bash
pnpm run eval:krn-proposal-store
```

### 4. Aggregate Eval Integration - completed

Purpose: make `krn eval` include the proposal-store boundary.

Acceptance evidence:

```bash
pnpm run eval:krn-eval
pnpm run krn -- eval
```

### 5. Research/Plan Checkpoint And Architecture Correction - completed

Purpose: correct the product direction so KRN is not described as a file-memory trick or artifact generator.

Acceptance evidence:

- `docs/product/final-product-plan.md` now states the target operating architecture.
- `docs/product/final-product-plan.md` now defines Codex paradoxes KRN must resolve.
- `docs/product/final-product-plan.md` now defines layered memory and says no single memory layer is product truth.
- ChatGPT reviewer bridge is deferred and optional, not the current product core.

### 6. Memory, Source, And Goal Update - completed

Purpose: keep the product truth indexed and prevent overclaiming.

Acceptance evidence:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

### 7. Final Audit, Commit, And Push - completed

Purpose: finish this vertical slice without leaving a half-updated checkout.

Acceptance evidence:

```bash
pnpm typecheck
pnpm test
pnpm run eval:krn-proposal-store
pnpm run krn -- eval
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
git status -sb
```

## Boundaries

In scope:

- source-ref validation,
- append-only proposal persistence,
- idempotency conflict checks,
- deterministic eval and aggregate eval integration,
- memory/source/goal updates.

Out of scope for this goal:

- registering MCP proposal tools,
- HTTP/API proposal endpoints,
- dashboard UI,
- human approval workflow,
- benchmark productivity claims.

## Completion Criteria

This goal is complete only when:

- proposal persistence is source-backed and append-only,
- unbacked source refs fail deterministically,
- duplicate/conflicting idempotency behavior is tested,
- `krn eval` includes the proposal-store eval,
- source/memory/goal docs state the exact claim and caveat,
- the final change is committed semantically and pushed.

## Disproves Completion

- A proposal with fake source refs can persist.
- Persistence writes outside `.krn/proposals`.
- Duplicate idempotency keys overwrite silently.
- `krn eval` omits the proposal-store gate.
- Completion is claimed as MCP tool safety, dashboard readiness, or productivity lift.

## Next Command

Resume by creating the next bounded Slice 3 child goal:

```bash
docs/goals/goal-006.md
```

Use this goal as completed context. Do not mark `goal-006` complete.
