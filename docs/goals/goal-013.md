# Goal 013: Proposal Review Decision Ledger

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `8c6ccfd feat: add pending review dashboard`. It is not a replacement for `goal-006`; it is the next bounded control-plane object slice.

Current implementation status: phases 0-5 are completed and verified in the semantic commit containing this goal update.

## Current Progress Evidence

[FACT] This goal added the first typed append-only proposal review decision ledger:

- `packages/contracts/src/proposal-review-decision.ts` exports `KrnProposalReviewDecision`, a parser, and JSON Schema.
- `docs/specs/krn-proposal-review-decision/` contains valid and known-bad fixtures.
- `packages/mcp/src/proposal-review-decision-store.ts` stores decisions under `.krn/proposal-reviews`, validates referenced proposals, validates source refs, preserves idempotency, and rejects second terminal decisions for the same proposal.
- `packages/mcp/src/pending-review-view-model.ts` now excludes proposals with one valid terminal review decision and blocks invalid or conflicting review decision records.
- `apps/dashboard/src/PendingReviewDashboard.tsx` renders reviewed and review-error metrics without exposing approve/reject/mutate commands.
- `packages/evals/src/validate-krn-proposal-review-decision.ts` and `docs/evals/krn-proposal-review-decision/` cover the decision ledger.
- `krn eval` includes `krn-proposal-review-decision`.

[FACT] Latest local evidence during this goal:

```text
pnpm test -- packages/mcp/test/pending-review-view-model.test.ts -> 20 test files, 63 tests passed
pnpm run eval:krn-proposal-review-decision -> .krn/evals/krn-proposal-review-decision/20260620T013214Z-2143548/report.json, 8/8 cases, 25/25 assertions
pnpm typecheck -> passed
pnpm test -> 20/20 test files, 63/63 tests passed
pnpm run eval:krn-dashboard-pending-review-ui -> .krn/evals/krn-dashboard-pending-review-ui/20260620T013215Z-2143558/report.json, 5/5 cases, 19/19 assertions
pnpm run eval:krn-eval -> .krn/eval/20260620T013233Z-2144081/report.json, 10/10 modules, 41/41 cases, 120/120 assertions
```

[FACT] This still does not prove promotion correctness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, target mutation safety beyond `.krn/proposal-reviews`, or productivity lift.

## Objective

Add a typed append-only proposal review decision ledger so Pending Review can distinguish open proposals from reviewed proposals without mutating proposal targets or promoting memory/source/goal changes.

The end state is:

```text
.krn/proposals proposal records
  -> typed proposal review decision object
  -> append-only .krn/proposal-reviews ledger
  -> Pending Review excludes valid reviewed proposals
  -> invalid/conflicting review decisions block readiness
  -> deterministic eval covers the close-review boundary
  -> aggregate krn eval coverage
  -> source/memory/goal update
```

This goal does not add dashboard approve/reject buttons, mutate proposal targets, promote memory/source/goal files, add HTTP/API, add ChatGPT bridge behavior, add destructive MCP tools, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-012.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-012.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)
- [docs/specs/krn-control-plane-proposal/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-control-plane-proposal/README.md)
- [docs/specs/krn-pending-review-view-model/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-pending-review-view-model/README.md)

[DECISION] Proposal review decisions are typed records, not in-place proposal mutations.

[DECISION] `approved_for_promotion` means the proposal can move into a later promotion workflow; it does not itself write memory, source ledgers, goals, dashboard events, or target files.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 control-plane object layer, specifically proposal review state consumed by Pending Review.

Selected mechanisms:

- S010 / Goals in Codex, rechecked 2026-06-20: this child goal names outcome, verification surface, constraints, boundaries, iteration policy, and blocked condition.
- S011 / ExecPlans, rechecked 2026-06-20: this goal is a file-backed, restartable execution contract with acceptance evidence.
- S012 / Code modernization, rechecked 2026-06-20: use a bounded vertical slice with contract, design, validation, implementation, and reusable pattern before broad review workflows.
- S007 and S022: MCP/tool surfaces need least-power configuration, explicit approvals, and audited side-effect boundaries.
- C004: MCP/API writes need schemas, approvals, idempotency, and audit.
- C029: proposal persistence is append-only and source-backed, but not approval.
- C033 and C034: Pending Review and the dashboard UI can show proposal records, but they do not yet prove approval workflow quality.
- LOCAL017, LOCAL019, LOCAL020, and LOCAL021: the current local product state has proposal store, proposal tool, Pending Review view model, and Pending Review UI; the missing next boundary is a typed review decision ledger.

Rejected alternatives:

- Mutate the original `proposal.json` review gate in place: rejected because proposal records are append-only input and in-place state changes blur audit history.
- Treat approval as direct promotion into memory/source/goal files: rejected because promotion needs a separate typed workflow and human-quality eval.
- Add dashboard approve/reject buttons first: rejected because the UI would expose commands before the ledger and conflict semantics exist.
- Add another MCP write tool now: rejected because this slice can prove the object/store/view-model behavior first; tool exposure can be a later surface over the same contract.
- Represent review state only in chat or generated dashboard JSON: rejected because dashboard state must come from product objects, not conversation or snapshots.

Required skills used:

- `operator-intake` for phase routing,
- `research-synthesis` for source-to-mechanism mapping,
- `goal-execplan` for this restartable child goal,
- `typescript-contract-engineer` for unknown-first contract and store boundaries,
- `eval-designer` for deterministic eval coverage,
- `release-verifier` before closeout.

Contract/runtime surface changed:

- New `KrnProposalReviewDecision` contract in `packages/contracts`.
- New append-only review decision store in `packages/mcp`.
- Pending Review view model reads proposal records plus review decisions.
- Aggregate `krn eval` includes the new deterministic eval module.

Falsification path:

- A valid decision parses through `packages/contracts`.
- A known-bad decision that claims target mutation or approved truth fails parsing.
- The review decision store rejects decisions for missing proposals.
- Duplicate identical decisions are idempotent.
- Conflicting terminal decisions for one proposal are rejected or block Pending Review.
- Pending Review excludes a valid reviewed proposal from the pending queue.
- Invalid review decision records block readiness instead of being ignored.
- `krn eval` includes the new module.

Overclaim boundary:

- This goal proves append-only proposal review decision state and Pending Review consumption of that state. It does not prove promotion correctness, human review quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposal-reviews`, or measured productivity lift.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-012`, final product plan, stack decision, eval standard, source ledger, context, compact checkpoint, and official Codex MCP/security/non-interactive docs inspected.
- Current worktree clean before edits.

### 1. Contract And Fixtures

Work:

- Add `KrnProposalReviewDecision` parser, exported JSON Schema, and public types.
- Add valid and known-bad fixtures under `docs/specs/krn-proposal-review-decision/`.
- Add contract tests through the public parser.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/proposal-review-decision.test.ts
```

Disproves completion:

- A decision can claim target mutation.
- A decision can omit source refs, idempotency, proposal identity, or interpretation caveat.
- The known-bad approval-like fixture parses.

### 2. Append-Only Review Decision Store

Work:

- Add store/list functions for `.krn/proposal-reviews`.
- Validate referenced proposal exists in `.krn/proposals`.
- Validate decision source refs against the same source ledger/local-file mechanism as proposals.
- Enforce append-only/idempotent writes.
- Reject a second valid terminal decision for the same proposal.

Acceptance evidence:

```bash
pnpm test -- packages/mcp/test/proposal-review-decision-store.test.ts
```

Disproves completion:

- A review decision can be stored for a missing proposal.
- A duplicate conflict overwrites an existing decision.
- Source refs are not checked.
- Store output implies promotion or target mutation.

### 3. Pending Review Integration

Work:

- Extend `KrnPendingReviewViewModel` with reviewed-decision counts and invalid review decision records.
- Exclude proposals with valid terminal decisions from `proposals`.
- Block readiness for invalid review decisions or conflicts.
- Keep approve/reject/mutate commands blocked.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/pending-review-view-model.test.ts packages/mcp/test/pending-review-view-model.test.ts
```

Disproves completion:

- Reviewed proposals still appear as pending.
- Invalid decisions are silently ignored.
- The view model treats approval as memory/source promotion.

### 4. Eval And Aggregate Integration

Work:

- Add `docs/evals/krn-proposal-review-decision/`.
- Add deterministic eval runner for contract/store/view-model behavior.
- Include the module in `krn eval` and update eval examples/tests.

Acceptance evidence:

```bash
pnpm run eval:krn-proposal-review-decision
pnpm run eval:krn-eval
pnpm run krn -- eval
```

Disproves completion:

- Eval only checks parser success.
- Eval does not cover missing proposal, idempotency, conflict, and Pending Review exclusion.
- Aggregate eval omits the new module.

### 5. Memory, Source, Goal, And Release Audit

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

- Docs imply reviewed means promoted.
- Runtime `.krn` output is promoted as approved memory.
- Completion is claimed from tests that do not cover conflict/invalid decision behavior.

### 6. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add proposal review decision ledger"
git push origin main
```

## Boundaries

In scope:

- review decision contract,
- append-only local review decision ledger,
- Pending Review integration,
- deterministic eval and aggregate eval integration,
- source/memory/goal updates.

Out of scope:

- dashboard approve/reject buttons,
- direct promotion into memory/source/goal files,
- HTTP/API server,
- ChatGPT bridge,
- destructive tools,
- benchmark/productivity claims.

## Completion Criteria

This goal is complete only when:

- the review decision contract parses valid records and rejects known-bad approval/mutation records,
- decisions store append-only under `.krn/proposal-reviews`,
- decisions reference existing proposals,
- source refs validate,
- duplicate identical decisions are idempotent,
- conflicting terminal decisions are rejected or block readiness,
- Pending Review excludes valid reviewed proposals,
- invalid review decisions block readiness,
- `pnpm test` and `pnpm typecheck` pass,
- the new eval passes,
- aggregate `krn eval` includes the new module,
- source/memory/goal docs state exact claims and caveats,
- the semantic commit is pushed.

Do not mark the parent `goal-006` complete from this child goal.

## Blocked Stop Condition

Mark this child goal blocked only if one of these repeats after three concrete attempts:

- the existing proposal contract cannot identify proposals strongly enough to reference them safely,
- the review decision contract cannot represent terminal review state without implying target mutation,
- Pending Review cannot distinguish invalid decisions from valid reviewed proposals without breaking existing dashboard contract parsing,
- eval integration cannot run locally enough to produce actionable evidence.

If blocked, write the failed attempts, exact blocker, and two viable alternatives into this file before stopping.
