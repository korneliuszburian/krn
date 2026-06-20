# Goal 014: Proposal Promotion Workflow

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `10ebe6b feat: add proposal review decision ledger`. It is not a replacement for `goal-006`; it is the next bounded control-plane object slice after review decisions.

Current implementation status: phases 0-4 are completed and verified in the semantic commit containing this goal update.

## Current Progress Evidence

[FACT] This goal added the first typed proposal promotion workflow for exact `memory_update` payloads:

- `KrnControlPlaneProposal` can now carry an optional exact `memory_update` `promotion_payload`.
- `packages/contracts/src/proposal-promotion.ts` exports `KrnProposalPromotion`, a parser, and JSON Schema.
- `docs/specs/krn-proposal-promotion/` contains valid and known-bad fixtures.
- `packages/mcp/src/proposal-promotion-store.ts` stores promotions under `.krn/promotions`, validates referenced proposals, validates approved review decisions, validates exact payload content/hash, validates source refs, preserves idempotency, rejects unsafe paths, and supports explicit exact apply mode for absent memory target files.
- `packages/evals/src/validate-krn-proposal-promotion.ts` and `docs/evals/krn-proposal-promotion/` cover the promotion workflow.
- `krn eval` includes `krn-proposal-promotion`.

[FACT] Latest local evidence during this goal:

```text
pnpm test -- packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-store.test.ts packages/mcp/test/proposal-promotion-store.test.ts -> 22 test files, 73 tests passed
pnpm typecheck -> passed
pnpm run eval:krn-proposal-promotion -> .krn/evals/krn-proposal-promotion/20260620T015701Z-2203468/report.json, 7/7 cases, 22/22 assertions
pnpm run eval:krn-eval -> .krn/eval/20260620T015701Z-2203458/report.json, 11/11 modules, 48/48 cases, 142/142 assertions
```

[FACT] This still does not prove general promotion correctness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, safe overwrite/update semantics for existing target files, or productivity lift.

## Objective

Add the first typed proposal promotion workflow so an `approved_for_promotion` review decision can move into an audited promotion record, and in explicit apply mode write exact reviewed memory content without inferring target content from prose.

The end state is:

```text
.krn/proposals proposal record with machine-applicable memory payload
  -> .krn/proposal-reviews approved_for_promotion decision
  -> KrnProposalPromotion
  -> append-only .krn/promotions ledger
  -> optional explicit exact target write for memory_update only
  -> deterministic eval covers the promotion boundary
  -> aggregate krn eval coverage
  -> source/memory/goal update
```

This goal does not add dashboard promote buttons, HTTP/API write routes, ChatGPT bridge behavior, source/claim/goal mutation, destructive MCP tools, broad promotion for every proposal kind, or productivity lift claims.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-013.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-013.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)
- [docs/specs/krn-control-plane-proposal/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-control-plane-proposal/README.md)
- [docs/specs/krn-proposal-review-decision/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-proposal-review-decision/README.md)

[DECISION] Promotion is a separate typed workflow after review decisions, not an implicit side effect of `approved_for_promotion`.

[DECISION] The first promotion workflow supports `memory_update` proposals only when the proposal contains a machine-applicable exact file-content payload. KRN must not infer target content from `proposed_change` prose.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 control-plane object layer, specifically promotion from reviewed proposal state into an audited promotion ledger and explicit exact memory target write.

Selected mechanisms:

- S010 / Goals in Codex: this child goal names outcome, verification surface, constraints, boundaries, iteration policy, and blocked condition.
- S011 / ExecPlans: this file is the restartable state for a multi-step slice.
- S012 / Code modernization: split the broad promotion workflow into one bounded pilot, `memory_update` with exact payload, before scaling to all proposal kinds or UI/API commands.
- S007 and S022: MCP/API writes need least-power defaults, explicit approval, audit, and side-effect boundaries.
- C004: writes need schemas, approvals, idempotency, and audit.
- C031: non-trivial slices require source-backed mechanism selection before code.
- C035 and LOCAL022: review decisions prove terminal review state only; they explicitly do not prove promotion correctness.

Rejected alternatives:

- Write target files directly from `proposed_change` prose: rejected because it would create unreviewable inferred content.
- Treat `approved_for_promotion` as target mutation permission: rejected because approval and promotion are separate typed states.
- Add dashboard promote buttons first: rejected because UI commands would exist before promotion contract and eval semantics.
- Generalize promotion across memory/source/goal/eval/repair in one pass: rejected because the first pilot must prove exact payload, approval validation, idempotency, and path safety.
- Store promotion only in dashboard generated data: rejected because promotion state must be a durable product object.

Required skills used:

- `operator-intake` for phase routing,
- `research-synthesis` for source-to-mechanism mapping,
- `goal-execplan` for this restartable child goal,
- `typescript-contract-engineer` for unknown-first contract and store boundaries,
- `eval-designer` for deterministic eval coverage,
- `release-verifier` before closeout.

Contract/runtime surface changed:

- Extend `KrnControlPlaneProposal` with optional machine-applicable `promotion_payload` for memory entries.
- Add `KrnProposalPromotion` contract in `packages/contracts`.
- Add append-only promotion store/workflow in `packages/mcp`.
- Add deterministic `krn-proposal-promotion` eval and aggregate `krn eval` integration.

Falsification path:

- A valid promotion parses through `packages/contracts`.
- A known-bad record-only promotion that claims target mutation fails parsing.
- A control-plane proposal can carry exact memory payload content and hash.
- A mismatched payload target fails parsing.
- Record-only promotion stores under `.krn/promotions` without target mutation.
- Explicit apply mode writes exact reviewed payload content only after approved review.
- Rejected review decisions cannot promote proposals.
- Approved proposals without machine-applicable payload cannot promote.
- Duplicate promotions are idempotent.
- Unsafe target paths are rejected before persistence or write.
- `krn eval` includes the new module.

Overclaim boundary:

- This goal proves the first local promotion workflow for exact `memory_update` payloads only. It does not prove general promotion correctness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or productivity lift.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, final product plan, stack decision, eval standard, pattern matrix, source ledger, context, and current worktree inspected.
- Current worktree clean before edits.

### 1. Proposal Payload And Promotion Contract

Work:

- Add `promotion_payload` to `KrnControlPlaneProposal` for exact memory entry content.
- Add `KrnProposalPromotion` parser, exported JSON Schema, public types, valid fixture, and known-bad fixture.
- Add contract tests through public parsers.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts
```

Disproves completion:

- A proposal can carry a payload for a different target path.
- A promotion can claim target mutation in record-only mode.
- Promotion content is only prose or inferred from prose.

### 2. Append-Only Promotion Store

Work:

- Add store/list functions for `.krn/promotions`.
- Validate referenced proposal exists.
- Validate referenced review decision exists and is `approved_for_promotion`.
- Validate promotion target content exactly matches proposal payload and SHA-256 hash.
- Enforce path safety and append-only/idempotent persistence.
- Support explicit `apply_exact_target_write` for absent target files only.

Acceptance evidence:

```bash
pnpm test -- packages/mcp/test/proposal-promotion-store.test.ts
```

Disproves completion:

- Rejected decisions can promote.
- Missing payloads are accepted.
- Target content is inferred from `proposed_change`.
- Unsafe paths or overwrites are allowed.

### 3. Eval And Aggregate Integration

Work:

- Add `docs/evals/krn-proposal-promotion/`.
- Add deterministic eval runner.
- Include the module in `krn eval` and update eval examples/tests.

Acceptance evidence:

```bash
pnpm run eval:krn-proposal-promotion
pnpm run eval:krn-eval
pnpm run krn -- eval
```

Disproves completion:

- Eval only checks parser success.
- Eval omits rejected decision, missing payload, idempotency, explicit apply, or path safety.
- Aggregate eval omits the new module.

### 4. Memory, Source, Goal, And Release Audit

Work:

- Update source ledger with local evidence and claim caveat.
- Add a memory note after eval evidence exists.
- Update memory index.
- Update `goal-006` and this goal with exact evidence.
- Run release verification before commit.

Acceptance evidence:

```bash
pnpm typecheck
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Docs imply promotion is general or dashboard/API ready.
- Runtime `.krn` output is promoted as productivity proof.
- Completion is claimed from tests that do not cover rejected decisions and unsafe paths.

### 5. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add proposal promotion workflow"
git push origin main
```

## Boundaries

In scope:

- exact memory promotion payload,
- promotion contract,
- append-only local promotion ledger,
- explicit exact file-content apply mode,
- deterministic eval and aggregate eval integration,
- source/memory/goal updates.

Out of scope:

- dashboard promote buttons,
- HTTP/API write routes,
- ChatGPT bridge,
- generalized source/goal/eval/repair promotion,
- destructive MCP tools,
- benchmark/productivity claims.

## Completion Criteria

This goal is complete only when:

- proposal payload fixtures parse and reject target mismatches,
- promotion fixtures parse and reject bad mutation claims,
- promotions store append-only under `.krn/promotions`,
- promotions require existing proposal and approved review decision,
- missing payloads and rejected decisions cannot promote,
- explicit apply writes exact target content only,
- unsafe paths are rejected,
- duplicate promotions are idempotent,
- `pnpm test` and `pnpm typecheck` pass,
- the new eval passes,
- aggregate `krn eval` includes the new module,
- source/memory/goal docs state exact claims and caveats,
- the semantic commit is pushed.

Do not mark the parent `goal-006` complete from this child goal.

## Blocked Stop Condition

Mark this child goal blocked only if one of these repeats after three concrete attempts:

- the existing proposal/review contracts cannot reference approved records strongly enough for safe promotion,
- the proposal payload cannot represent exact machine-applicable memory content without breaking existing proposal-store semantics,
- the promotion store cannot safely preserve append-only audit while supporting explicit target writes,
- eval integration cannot run locally enough to produce actionable evidence.

If blocked, write the failed attempts, exact blocker, and two viable alternatives into this file before stopping.
