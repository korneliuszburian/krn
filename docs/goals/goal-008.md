# Goal 008: Overnight Slice 3 Control Plane Transport

## Status

Active eight-hour child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `1339b74 feat: add krn mcp read model`. It is not a replacement for `goal-006`; it is the next overnight Slice 3 execution contract.

Current implementation status: phases 0-4 are completed and verified; phases 5-7 remain pending.

## Objective

Execute the next meaningful Slice 3 vertical path for KRN:

```text
read-only resource model -> real STDIO MCP transport -> transport eval -> proposal-only contract -> first dashboard view model -> reviewed source/memory update
```

The end state is not a dashboard demo and not productivity proof. The end state is a real, allowlisted, schema-backed control-plane path that exposes current `.krn` runtime state without destructive tools, then prepares the next proposal/dashboard surfaces behind explicit contracts.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/specs/technology-stack/decision.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/technology-stack/decision.md)
- [docs/specs/krn-mcp-read-model/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-mcp-read-model/README.md)

[DECISION] Current slice is Slice 3: Control Plane And Measured Lift.

[DECISION] Start with read-only STDIO transport over existing `packages/mcp` parsing before proposal tools or dashboard UI.

## Current Starting State

[FACT] The repo already has:

- `packages/mcp` as a read-only resource model over typed `.krn` runtime reports.
- Allowlisted URIs:
  - `krn://runtime/summary`
  - `krn://runtime/init/latest`
  - `krn://runtime/doctor/latest`
  - `krn://runtime/eval/latest`
  - `krn://runtime/review/latest`
- `packages/contracts/src/control-plane-resource.ts`.
- `docs/specs/krn-mcp-read-model/` valid and known-bad fixtures.
- `docs/evals/krn-mcp-read-model/` deterministic eval module.

[FACT] Latest local evidence before this goal:

```text
.krn/evals/krn-mcp-read-model/20260619T222105Z-1727785/report.json
.krn/eval/20260619T222100Z-1727537/report.json
.krn/review/20260619T222108Z-1727852/report.json
```

[FACT] That evidence proves the read-model contract only. It does not prove deployed MCP transport, proposal-tool safety, dashboard readiness, or productivity lift.

[FACT] Initial missing state at the start of this goal:

- a runnable STDIO MCP server entrypoint,
- a transport-level MCP eval,
- proposal-only control-plane object contracts,
- dashboard view models over the control-plane resources,
- baseline-vs-assisted benchmark evidence.

## Current Progress Evidence

[FACT] Phases 0-3 now have local evidence:

- `packages/mcp/src/server.ts` creates the read-only MCP server from the existing resource model.
- `packages/mcp/src/stdio.ts` is the local STDIO entrypoint.
- `packages/mcp/test/stdio-server.test.ts` exercises the transport through the MCP SDK client.
- `docs/evals/krn-mcp-transport/` and `packages/evals/src/validate-krn-mcp-transport.ts` define the deterministic transport eval.
- `krn eval` now aggregates `krn-mcp-transport` as the fifth deterministic module.

[FACT] Implementation evidence:

```text
pnpm typecheck -> passed
pnpm test -- packages/mcp/test/read-model.test.ts packages/mcp/test/stdio-server.test.ts packages/contracts/test/control-plane-resource.test.ts -> 11 files, 25 tests passed
pnpm run eval:krn-mcp-transport -> .krn/evals/krn-mcp-transport/20260619T224349Z-1769625/report.json, 3/3 cases, 7/7 assertions
pnpm run krn -- eval -> .krn/eval/20260619T224349Z-1769637/report.json, 5/5 modules, 15/15 cases, 37/37 assertions
pnpm run krn -- review -> .krn/review/20260619T225245Z-1783309/report.json, ready_for_human_review
```

[FACT] The server advertises no MCP tools and rejects unknown resource URIs.

[FACT] This does not prove ChatGPT connector behavior, registered Codex MCP config, proposal-tool safety, dashboard readiness, or productivity lift.

[DECISION] Phase 4 is the proposal-only object contract layer. Do not add MCP proposal tools before a separate tool/persistence contract and deterministic eval exist.

[FACT] Phase 4 now has local evidence:

- `packages/contracts/src/control-plane-proposal.ts` exports `KrnControlPlaneProposalSchema`, `parseKrnControlPlaneProposal`, and `krnControlPlaneProposalJsonSchema`.
- `docs/specs/krn-control-plane-proposal/` contains a valid example and a known-bad approved mutation fixture.
- `packages/contracts/test/control-plane-proposal.test.ts` verifies the parser, known-bad rejection, and JSON Schema export.

```text
pnpm test -- packages/contracts/test/control-plane-proposal.test.ts -> 12 files, 28 tests passed
pnpm typecheck -> passed
```

[FACT] The proposal contract still does not register MCP tools, implement append-only persistence, approve memory/source changes, or publish dashboard events.

[DECISION] The next implementation phase is Phase 5, first dashboard view-model contract over real product objects.

## Eight-Hour Work Plan

### 0. Resume And Safety Gate - 25 minutes - completed

Purpose: prevent stale context, docs drift, or accidental destructive tool exposure.

Work:

- Read `AGENTS.md`, `docs/memory/INDEX.md`, this goal, `goal-006`, `docs/product/final-product-plan.md`, `docs/specs/krn-mcp-read-model/README.md`, `docs/plans/canonical/SOURCES.md`, and `CONTEXT.md`.
- Re-check official OpenAI/Codex MCP docs before changing MCP-specific behavior.
- Run current-state checks:

```bash
git status -sb
pnpm typecheck
pnpm test -- packages/mcp/test/read-model.test.ts packages/contracts/test/control-plane-resource.test.ts
```

Acceptance evidence:

- Current branch and dirty state are known.
- Existing read-model tests still pass before transport work starts.
- No proposal/write/dashboard code starts from chat memory alone.

Disproves completion:

- Work begins without inspecting current files.
- MCP behavior is inferred from memory instead of official docs and local package state.

### 1. STDIO MCP Transport Contract And Package Entry - 75 minutes - completed

Purpose: define the real transport boundary before adding new control-plane behavior.

Work:

- Add a minimal STDIO server entrypoint under `packages/mcp`.
- Reuse `listKrnControlPlaneResources` and `readKrnControlPlaneResource`; do not duplicate runtime report parsing.
- Decide whether to use the official MCP SDK or a smaller local protocol wrapper; if adding a dependency, update `pnpm-lock.yaml`.
- Add package scripts/exports for the server entrypoint.
- Keep tool registration empty in this phase unless a later contract explicitly adds proposal-only tools.
- Document invocation in `docs/specs/krn-mcp-read-model/README.md` or a new transport spec.

Acceptance evidence:

```bash
pnpm typecheck
pnpm test -- packages/mcp/test/read-model.test.ts
```

Disproves completion:

- Transport code re-parses `.krn` artifacts outside `packages/contracts`.
- Transport exposes destructive tools or write-capable handlers.
- The server entrypoint cannot be invoked as a package boundary.

### 2. Resource List/Read Over STDIO - 90 minutes - completed

Purpose: make the server expose the existing allowlisted resources through actual MCP transport behavior.

Work:

- Implement resource listing for the five current URIs.
- Implement resource read for each allowlisted URI.
- Return JSON payloads that match `KrnControlPlaneResourceIndexSchema` and `KrnControlPlaneResourceSchema`.
- Reject unknown resource URIs with a structured error.
- Ensure `read_only: true`, `write_tools_enabled: false`, and `proposal_tools_enabled: false` remain visible in transport responses.
- Add behavior tests that exercise the transport boundary, not only the direct read-model functions.

Acceptance evidence:

```bash
pnpm test -- packages/mcp/test/read-model.test.ts packages/mcp/test/stdio-server.test.ts
pnpm typecheck
```

Disproves completion:

- Tests only call `listKrnControlPlaneResources` directly.
- Unknown URIs silently fall through.
- Transport responses hide the read-only caveat or source refs.

### 3. MCP Transport Eval - 70 minutes - completed

Purpose: make the new transport a deterministic Slice 3 eval surface, not a manual smoke test.

Work:

- Add `docs/evals/krn-mcp-transport/` with:
  - `README.md`
  - `cases.json`
  - `result.schema.json`
- Add `packages/evals/src/validate-krn-mcp-transport.ts`.
- Eval must cover:
  - transport starts and exits cleanly,
  - resource list contains the five allowlisted URIs,
  - reading summary succeeds,
  - reading latest review succeeds,
  - unknown URI is rejected,
  - no tools are exposed.
- Add `eval:krn-mcp-transport` and include it in `krn eval` only after it is deterministic.

Acceptance evidence:

```bash
pnpm run eval:krn-mcp-transport
pnpm run krn -- eval
```

Disproves completion:

- Eval shells out but does not validate response shape.
- Eval requires external services or non-deterministic network.
- `krn eval` includes a flaky transport module.

### 4. Proposal-Only Control-Plane Contract - 80 minutes - completed

Purpose: prepare safe future write surfaces without exposing write tools yet.

Work:

- Add a typed proposal object contract in `packages/contracts`.
- The proposal object must include:
  - stable schema version,
  - proposal kind,
  - source refs,
  - target path or resource URI,
  - idempotency key,
  - `status: "proposal_only"`,
  - interpretation caveat,
  - no approval state masquerading as truth.
- Add valid and known-bad fixtures under `docs/specs/`.
- Add parser tests and JSON Schema export.
- Do not register an MCP proposal tool in this phase unless the contract, eval, and append-only write target are all ready.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/control-plane-proposal.test.ts
pnpm typecheck
```

Disproves completion:

- Proposal object can represent approved truth.
- Known-bad fixture fails only from JSON syntax.
- Contract enables writes without append-only/idempotency semantics.

### 5. First Dashboard View-Model Contract - 60 minutes - pending

Purpose: start dashboard work from typed product objects, not mocked UI state.

Work:

- Add the smallest dashboard view-model contract needed for Slice 3:
  - resource health,
  - latest runtime artifacts,
  - pending proposal count or explicit zero,
  - source refs,
  - next allowed action,
  - failure mode.
- Keep this as a contract/view-model only. Do not create `apps/dashboard` UI unless the view model has tests and real source objects.
- Add valid and known-bad fixtures.
- Add a behavior test or eval that builds the view model from real `packages/mcp` resources.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/dashboard-view-model.test.ts packages/mcp/test/read-model.test.ts
pnpm typecheck
```

Disproves completion:

- View model contains mocked metrics.
- Any metric lacks source, owner/action, or failure mode.
- UI starts before the view model has real data tests.

### 6. Memory, Source, And Goal Update - 55 minutes - in progress

Purpose: keep project truth indexed and prevent green eval overclaiming.

Work:

- Update `docs/goals/goal-006.md` with exact Slice 3 progress and next action.
- Update this goal with completed phases, commands, and report paths.
- Add or update a `docs/memory/product/` note only after evidence exists.
- Update `docs/memory/INDEX.md`.
- Update `docs/plans/canonical/SOURCES.md` with new LOCAL evidence and claim caveats if a durable product claim changed.
- Keep runtime `.krn` report payloads ignored/uncommitted.

Acceptance evidence:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Runtime reports are treated as reviewed memory.
- Docs cite stale or missing paths.
- A green transport eval is claimed as dashboard readiness or productivity lift.

### 7. Final Audit, Commit, And Push - 25 minutes - pending

Purpose: leave the all-night result reviewable and resumable.

Work:

- Inspect final staged diff.
- Ensure ignored `.krn`, `dist`, `node_modules`, and build info are not committed.
- Run final non-destructive checks.
- Commit with semantic commits only.
- Push to `origin/main` unless explicitly redirected.

Acceptance evidence:

```bash
git status -sb
git diff --cached --check
git log --oneline -5
git push origin main
```

Disproves completion:

- Commit includes generated cache/build/runtime payloads.
- Commit message is not semantic.
- Push is skipped without an exact blocker.

## Time Budget

Total planned work: 480 minutes.

The phases are intentionally 25-90 minutes each. Do not collapse the full-night plan into one broad "MCP done" task. If time runs short, stop after recording exact incomplete phases, latest evidence, and the next command in this goal.

## Constraints

- TypeScript-first product code.
- Node.js runtime.
- No new Python product foundation.
- MCP/API resources must be allowlisted and schema-backed.
- No destructive MCP tools.
- No proposal tools before append-only/idempotent proposal contracts and evals exist.
- No dashboard UI over mocked state.
- Every external JSON/process response is `unknown` until parsed.
- Runtime artifacts stay under `.krn/`.
- Reviewed memory stays under `docs/memory/`.
- No productivity or measured-lift claims.
- Semantic commits only.

## Boundaries

In scope:

- `packages/mcp` STDIO transport,
- `packages/contracts` control-plane proposal/view-model contracts,
- `packages/evals` deterministic transport evals,
- `docs/specs/` for new contracts,
- `docs/evals/` for new eval modules,
- `docs/memory` and source-ledger updates after evidence.

Out of scope:

- destructive MCP/API tools,
- ChatGPT HTTPS connector,
- public plugin distribution,
- full `apps/dashboard` UI before view models,
- baseline-vs-assisted benchmark claims,
- global Codex config,
- database/vector/graph store.

## Iteration Policy

Implement vertically:

```text
transport contract -> parser/schema reuse -> fixture -> transport behavior test -> eval report -> memory/source update
```

For proposal/dashboard work:

```text
contract -> parser/schema -> valid and known-bad fixture -> behavior test -> consumer only after contract passes
```

When a test or eval fails:

```text
failure -> classify -> smallest fix -> rerun -> keep evidence or record stop reason
```

Do not patch `AGENTS.md`, skills, or memory notes to hide a product/runtime failure.

## Blocked Stop Condition

Mark this overnight goal blocked only if the same blocker repeats after three concrete attempts:

- official MCP docs or SDK behavior prevents a safe read-only STDIO transport,
- TypeScript package references cannot include `packages/mcp` transport without changing the stack decision,
- transport tests cannot run deterministically without external services,
- proposal object contracts cannot represent append-only/idempotent reviewable state without changing product identity.

If blocked, write:

- exact command,
- exact error,
- attempted fix,
- next two viable alternatives,
- why the broader `goal-006` remains active.

## Completion Criteria

The overnight goal is complete only when:

- `packages/mcp` has a runnable STDIO resource transport.
- The transport lists and reads the five allowlisted resources.
- Unknown resource URIs fail deterministically.
- No destructive or write-capable tools are exposed.
- `pnpm typecheck` passes.
- `pnpm test` passes for the touched contract/MCP surfaces.
- `pnpm run eval:krn-mcp-transport` passes if the transport eval is added.
- `pnpm run krn -- eval` includes only deterministic passing modules.
- Proposal-only contract work, if started, has parser, fixtures, known-bad case, and tests.
- Dashboard view-model work, if started, reads real product objects only.
- Memory/source docs are updated only for evidence-backed durable claims.
- Final changes are committed with semantic commit messages and pushed.

## Disproves Completion

- Server exists but cannot be exercised through transport behavior.
- Transport exposes write/destructive tools.
- Tests bypass the server entrypoint.
- Resource responses omit source refs or caveats.
- Proposal contracts represent approved truth.
- Dashboard view model uses mocked metrics.
- Completion is claimed from unit tests without transport eval or source/memory update when those surfaces changed.
- Productivity lift is claimed without a baseline-vs-assisted benchmark.

## Next Command

Resume with Phase 5:

```bash
pnpm typecheck
```

Then add the first dashboard view-model contract over real product objects. Do not create dashboard UI before that view model has fixtures and tests.
