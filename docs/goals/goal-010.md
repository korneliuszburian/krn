# Goal 010: Proposal-Only MCP Tool Boundary

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `44df89e docs: mark proposal persistence goal complete`. It is not a replacement for `goal-006`; it is the next bounded control-plane slice.

Current implementation status: phases 0-5 are completed and verified in the semantic commit containing this goal update.

## Objective

Expose the first proposal-only MCP tool only after source-backed proposal persistence exists.

The end state is:

```text
source-backed proposal store
  -> one MCP tool: krn_store_control_plane_proposal
  -> tool input parsed as KrnControlPlaneProposal
  -> append-only .krn/proposals write only
  -> deterministic transport/tool eval
  -> aggregate krn eval coverage
  -> source/memory/goal update
```

This goal does not approve proposals, mutate proposal targets, add destructive tools, build dashboard UI, add HTTP/API, or claim productivity lift.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-009.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-009.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/specs/krn-control-plane-proposal/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-control-plane-proposal/README.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[DECISION] Add exactly one MCP tool before dashboard UI: `krn_store_control_plane_proposal`.

[DECISION] Treat MCP tool annotations as hints only. Safety must come from parser, source-ref validation, append-only persistence, idempotency conflict checks, and deterministic evals.

## Current Progress Evidence

[FACT] This goal added the first proposal-only MCP tool boundary:

- `packages/contracts/src/mcp-proposal-tool.ts` defines the typed non-approval result contract.
- `packages/mcp/src/server.ts` registers exactly one MCP tool, `krn_store_control_plane_proposal`.
- The tool parses input as `KrnControlPlaneProposal`, calls `storeKrnControlPlaneProposal`, and returns `approved: false` / `mutated_target: false`.
- Read-only MCP resources remain available and still report `proposal_tools_enabled: false` inside resource payloads; tool capability is proven through `listTools`.
- `docs/evals/krn-mcp-proposal-tool/` defines deterministic transport-level cases.
- `krn eval` includes `krn-mcp-proposal-tool`.

[FACT] Latest local evidence during this goal:

```text
pnpm typecheck -> passed
pnpm exec vitest run packages/contracts/test/mcp-proposal-tool.test.ts packages/mcp/test/stdio-server.test.ts packages/mcp/test/proposal-store.test.ts packages/cli/test/eval.test.ts packages/contracts/test/eval-report.test.ts -> 5 files, 17 tests passed
pnpm run eval:krn-mcp-transport -> .krn/evals/krn-mcp-transport/20260620T000555Z-1943987/report.json, 3/3 cases, 7/7 assertions
pnpm run eval:krn-mcp-proposal-tool -> .krn/evals/krn-mcp-proposal-tool/20260620T000445Z-1940364/report.json, 5/5 cases, 16/16 assertions
pnpm run eval:krn-eval -> .krn/evals/krn-eval-contracts/20260620T000614Z-1944487/report.json, 3/3 cases, 7/7 assertions
pnpm run krn -- eval -> .krn/eval/20260620T000445Z-1940365/report.json, 7/7 modules, 24/24 cases, 62/62 assertions
python3 scripts/evals/codex_memory_compliance.py --mode validate -> passed, 4/4 cases
git diff --check -> passed
```

[FACT] This still does not prove human approval quality, dashboard UI readiness, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 MCP/API proposal tool boundary.

Selected mechanisms:

- S007 / C004: Codex MCP supports tools and approval modes, but tool safety must be product-owned through schemas, approvals, idempotency, and audit.
- S010 / S011 / C006: keep the child goal self-contained with outcome, verification, constraints, boundaries, iteration policy, and blocked stop condition.
- S012 / C015: implement a bounded pilot tool before adding more proposal tool kinds or dashboard approval flow.
- C029 / LOCAL017: reuse `storeKrnControlPlaneProposal`; do not bypass the source-backed store.

Rejected alternatives:

- Multiple proposal tools now: rejected because one public tool boundary must prove input/output shape, side-effect boundary, eval, and caveat first.
- Dashboard Pending Review now: rejected because the dashboard should consume proposal-store records after a real tool creates them through the intended control-plane path.
- Direct target mutation tool: rejected because proposal targets remain review requests, not approved writes.
- Relying on MCP `annotations` for safety: rejected because annotations are hints and cannot replace parser/store/eval guarantees.

Required skills used:

- `operator-intake` for phase routing,
- `goal-execplan` for this restartable child goal,
- `research-synthesis` for source-to-mechanism mapping,
- `openai-docs` for current Codex MCP documentation,
- `typescript-contract-engineer` for unknown-first TypeScript tool input/output boundaries,
- `eval-designer` for deterministic tool eval cases.

Falsification path:

- Tool list must expose exactly the proposal-only tool while preserving read-only resource behavior.
- Valid source-backed tool input must persist under `.krn/proposals`.
- Duplicate input must return `already_stored`.
- Unbacked source refs must return a tool error and create no proposal.
- Unsafe target path must return a tool error and create no proposal.
- `krn eval` must include the new MCP proposal-tool eval.

Overclaim boundary:

- This goal proves only a local STDIO MCP proposal tool over append-only proposal persistence. It does not prove human approval quality, dashboard UI readiness, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals`, or productivity lift.

## Work Plan

### 0. Resume, Source, And Safety Gate - completed

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-009`, final product plan, stack decision, eval standard, and context inspected.
- Current Codex MCP docs inspected before MCP behavior changes.
- Current worktree clean before edits.

### 1. MCP Tool Contract And Handler - completed

Work:

- Add a typed tool-result contract if needed by the public MCP tool output.
- Register exactly one MCP tool named `krn_store_control_plane_proposal`.
- Tool input must parse as `KrnControlPlaneProposal`.
- Tool output must include the proposal-store result and explicit non-approval caveat.
- Tool annotations may state non-destructive/idempotent hints, but docs/tests must not treat those hints as enforcement.

Acceptance evidence:

```bash
pnpm test -- packages/mcp/test/stdio-server.test.ts packages/mcp/test/proposal-store.test.ts
pnpm typecheck
```

Disproves completion:

- Tool bypasses `storeKrnControlPlaneProposal`.
- Tool mutates proposal target paths.
- Tool output implies approval or dashboard readiness.
- Multiple tools are registered.

### 2. MCP Proposal Tool Eval - completed

Work:

- Add `docs/evals/krn-mcp-proposal-tool/`.
- Add `packages/evals/src/validate-krn-mcp-proposal-tool.ts`.
- Eval must use the MCP STDIO transport, not only direct function calls.
- Eval must cover tool list, valid persist, duplicate idempotency, unbacked source-ref rejection, unsafe target rejection, and read-only resources still available.

Acceptance evidence:

```bash
pnpm run eval:krn-mcp-proposal-tool
```

Disproves completion:

- Eval only calls store functions directly.
- Eval does not prove negative cases create no proposal.
- Eval treats tool existence as approval workflow.

### 3. Aggregate Eval Integration - completed

Work:

- Add the eval script to `package.json`.
- Include `krn-mcp-proposal-tool` in `krn eval`.
- Update aggregate eval docs/fixtures/tests.

Acceptance evidence:

```bash
pnpm run eval:krn-eval
pnpm run krn -- eval
```

Disproves completion:

- `krn eval` omits the tool boundary.
- Aggregate fixture overclaims dashboard/API/productivity readiness.

### 4. Memory, Source, And Goal Update - completed

Work:

- Update `docs/plans/canonical/SOURCES.md` with new LOCAL evidence and claim caveat.
- Add a memory note only after eval evidence exists.
- Update `docs/memory/INDEX.md`.
- Update `goal-006` and this goal with exact evidence.

Acceptance evidence:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Runtime `.krn` artifacts are promoted as reviewed truth.
- Docs say the tool is safe for approved writes or dashboard readiness.

### 5. Final Audit, Commit, And Push - completed

Acceptance evidence:

```bash
pnpm typecheck
pnpm test
pnpm run eval:krn-mcp-proposal-tool
pnpm run krn -- eval
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
git status -sb
git push origin main
```

## Boundaries

In scope:

- one local STDIO MCP proposal tool,
- TypeScript parser/result contract for that tool,
- behavior tests through MCP client,
- deterministic tool eval,
- aggregate eval integration,
- source/memory/goal docs.

Out of scope:

- dashboard UI,
- dashboard Pending Review implementation,
- HTTP/API server,
- ChatGPT bridge,
- proposal approval workflow,
- direct memory/source/goal mutation tools,
- destructive tools,
- productivity benchmark claims.

## Completion Criteria

This goal is complete only when:

- `krn_store_control_plane_proposal` is the only MCP tool registered.
- Valid tool input stores append-only under `.krn/proposals`.
- Duplicate idempotency returns stable `already_stored`.
- Invalid source refs and unsafe target paths return tool errors without creating proposals.
- Existing read-only resources remain available over MCP STDIO.
- `pnpm typecheck` and relevant tests pass.
- `pnpm run eval:krn-mcp-proposal-tool` passes.
- `krn eval` includes the new eval module.
- Source/memory/goal docs state exact claims and caveats.
- Changes are committed semantically and pushed.

## Next Command

Resume parent [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md) with the next bounded Slice 3 child goal. Good candidates are dashboard Pending Review over `.krn/proposals` records or benchmark/control-plane evidence.

Do not mark `goal-006` complete.
