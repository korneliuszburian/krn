# Goal 019: Benchmark Reports Control-Plane Surface

## Status

Completed Slice 3 child goal under [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md).

This goal starts after commit `198280e feat: add live codex benchmark pilot`. It is not a replacement for `goal-006`; it is the next bounded control-plane slice after the live benchmark pilot proved a typed `live_codex_exec` evidence path with no lift evidence.

Current implementation status: contract, MCP read resource, dashboard data/UI, eval evidence, source ledger, memory note/index, parent-goal update, and release verification are complete. Parent `goal-006` remains incomplete because measured productivity lift, broader benchmark evidence, HTTP/API readiness, ChatGPT connector behavior, and remaining dashboard/control-plane surfaces are still outside this child goal.

## Objective

Expose benchmark reports as a read-only KRN control-plane surface so the dashboard and MCP/resource layer can review benchmark evidence, no-lift status, negative deltas, and repair targets without running benchmarks, mutating ledgers, or claiming productivity lift.

The end state is:

```text
.krn/benchmarks/**/report.json
  -> KrnBenchmarkReport parser
  -> KrnBenchmarkReportsViewModel
  -> krn://runtime/benchmark/latest read-only resource
  -> KrnDashboardData.benchmark_reports
  -> apps/dashboard Benchmark Reports surface
  -> deterministic dashboard eval
  -> source/memory/goal update
```

This goal does not run a new live benchmark suite, does not claim measured productivity lift, does not add a `krn benchmark` CLI command, does not add dashboard run/repair/apply buttons, and does not expose destructive MCP/API tools.

## Parent Product Direction

Authoritative parent:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-018.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-018.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/specs/krn-benchmark-report/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-benchmark-report/README.md)
- [docs/evals/STANDARD.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/STANDARD.md)
- [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)

[DECISION] Benchmark reports become a review surface before any benchmark command surface. The product needs visibility into no-lift and negative-delta evidence before it can safely decide whether to expand or repair benchmark suites.

[DECISION] The dashboard may render `productivity_lift_claimed` from a valid `KrnBenchmarkReport`, but this slice must not invent lift state. Current evidence remains one task with baseline score `0.95`, assisted score `0.85`, and delta `-0.1`.

## Research/Plan Checkpoint Applied

Layer changed:

- Slice 3 benchmark/control-plane layer, specifically read-only benchmark report consumption by MCP resources and dashboard view models.

Codex best-practices gate:

- S010 / Using Goals in Codex: this goal states the outcome, verification surface, constraints, boundaries, iteration policy, and blocked stop condition before implementation. Completion is evidence-based, not a "probably done" claim.
- S011 / Codex ExecPlans: this goal is the restartable state file for the slice. It must stay current with progress, decisions, validation output, and next steps so work can resume after compaction without hidden conversation state.
- S012 / Code modernization with Codex: this slice is a bounded vertical modernization-style pilot over one product object, with contract, design/spec, validation/eval, implementation, and reusable dashboard/control-plane pattern before wider command/API expansion.
- S087 / Related resources: this archived page is discovery-only. It may suggest tools or papers, but no pattern from it can be adopted until a primary source is inspected and converted into a mechanism, artifact, eval/falsification path, and failure mode.

This gate is mandatory before closeout. If implementation changes the product shape, validation route, or overclaim boundary, this section and the source ledger must be updated in the same pass.

Selected mechanisms:

- S007 / MCP: expose allowlisted read-only resources first; no destructive tools.
- S010 / Goals in Codex: this child goal names outcome, evidence, constraints, boundaries, iteration policy, and blocked condition.
- S011 / ExecPlans: this file is the restartable state for a multi-step implementation slice.
- S012 / Code modernization: use a bounded vertical slice over one product object before command/API expansion.
- S014-S016 / eval and improvement loops: benchmark evidence becomes deterministic dashboard eval assertions and repair targets, not prose claims.
- C010: dashboard value depends on reviewable operational objects, not charts.
- C023: green aggregate evals do not prove benchmark/product lift.
- C039: benchmark report spine blocks unsupported lift claims.
- C040: one live `codex exec` pilot proves the measurement path only and must not be overclaimed.
- LOCAL027: current live benchmark pilot has delta `-0.1`; the next safe action is reviewable surfacing or larger-suite work, not a lift claim.

Rejected alternatives:

- Run more live `codex exec` tasks immediately: rejected for this slice because the current negative-delta pilot first needs a reviewable surface and repair/next-action visibility.
- Add dashboard run/repair buttons: rejected because dashboard commands are out of scope until read-only evidence and proposal-only workflows cover benchmark actions.
- Add benchmark data into Eval Runs only: rejected because benchmark reports have different semantics, lift gates, tasks, repair targets, and measurement modes.
- Add a `krn benchmark` CLI command now: rejected because this slice can expose existing `.krn/benchmarks` reports without widening command surface.
- Claim breakthrough from the live pilot: rejected by `goal-018`, C040, and the current negative delta.

Required skills used:

- `operator-intake` for P8/P7 routing,
- `goal-execplan` for this restartable child goal,
- `research-synthesis` for source-to-mechanism mapping,
- `typescript-contract-engineer` for unknown-first parser and view-model work,
- `eval-designer` for deterministic dashboard/MCP eval coverage,
- `release-verifier` before closeout.

Contract/runtime surface to change:

- Add `KrnBenchmarkReportsViewModel` in `packages/contracts`.
- Add a builder in `packages/mcp` over `.krn/benchmarks/**/report.json`.
- Add `krn://runtime/benchmark/latest` as a read-only MCP resource.
- Add `benchmark_reports` to `KrnDashboardData`.
- Add a Benchmark Reports dashboard component.
- Add deterministic eval coverage for dashboard rendering and blocked command boundaries.

Falsification path:

- Valid view-model fixture parses; known-bad command/lift fixture fails.
- Builder handles missing, invalid, no-lift, and negative-delta benchmark reports without inventing state.
- MCP read model exposes the latest benchmark report as read-only and keeps write/proposal tool boundaries unchanged.
- Dashboard data generation includes benchmark reports from real `.krn/benchmarks` objects.
- Dashboard render shows source refs, score delta, lift status, repair target/next action, and failure mode, and does not expose run/repair/apply/write commands.

Overclaim boundary:

- This goal proves only that KRN can review typed benchmark report evidence through MCP/dashboard surfaces. It does not prove measured productivity lift, statistical benchmark validity, benchmark command readiness, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Work Plan

### 0. Resume, Source, And Safety Gate

Acceptance evidence:

- `AGENTS.md`, memory index, `goal-006`, `goal-018`, final product plan, stack decision, eval standard, source ledger, context, compact checkpoint, and current worktree inspected.
- Current worktree clean before edits.

### 1. Benchmark Reports View Model Contract

Work:

- Add contract parser, JSON Schema export, valid example, and known-bad fixture.
- Include missing/invalid/no-lift/negative-delta state in the contract.

Acceptance evidence:

```bash
pnpm test -- packages/contracts/test/benchmark-reports-view-model.test.ts packages/contracts/test/dashboard-data.test.ts packages/contracts/test/control-plane-resource.test.ts
```

Disproves completion:

- The contract can claim lift without a valid benchmark report.
- The view model exposes command state or mutating action labels.
- Invalid benchmark report state is hidden.

### 2. MCP And Dashboard Surface

Work:

- Build the view model from real `.krn/benchmarks/**/report.json` files.
- Add the read-only benchmark resource to the control-plane allowlist.
- Add dashboard boot data and Benchmark Reports UI.

Acceptance evidence:

```bash
pnpm test -- packages/mcp/test/benchmark-reports-view-model.test.ts packages/mcp/test/read-model.test.ts packages/mcp/test/stdio-server.test.ts apps/dashboard/test/benchmark-reports-dashboard.test.tsx
```

Disproves completion:

- Dashboard reads mocks or chat state.
- MCP resource is writable or hidden from the allowlist.
- UI suggests running, repairing, applying, or writing from the dashboard.

### 3. Eval, Memory, Source, Goal, And Release Audit

Work:

- Add `krn-dashboard-benchmark-reports-ui` eval module.
- Add deterministic cases for generated data, report rows, missing state, invalid report, and negative/no-lift boundary.
- Update source ledger, memory index/note, final product plan, parent goal, and this goal.

Acceptance evidence:

```bash
pnpm run eval:krn-dashboard-benchmark-reports-ui
pnpm typecheck
pnpm test
python3 scripts/evals/codex_memory_compliance.py --mode validate
git diff --check
```

Disproves completion:

- Docs imply benchmark report surfacing proves productivity lift.
- Runtime `.krn` output is treated as durable truth without reviewed memory/source updates.
- Completion is claimed without exact report paths and verification output.

### 4. Commit And Push

Acceptance evidence:

```bash
git status -sb
git commit -m "feat: add benchmark reports dashboard surface"
git push origin main
```

## Completion Evidence

- Contract and view-model coverage:
  - `packages/contracts/src/benchmark-reports-view-model.ts`
  - `docs/specs/krn-benchmark-reports-view-model/`
  - `packages/contracts/test/benchmark-reports-view-model.test.ts`
- MCP/read resource coverage:
  - `packages/mcp/src/benchmark-reports-view-model.ts`
  - `krn://runtime/benchmark/latest` added as a read-only resource.
  - `pnpm run eval:krn-mcp` generated `.krn/evals/krn-mcp-read-model/20260620T063819Z-2568169/report.json` with 3/3 cases and 8/8 assertions.
  - `pnpm run eval:krn-mcp-transport` generated `.krn/evals/krn-mcp-transport/20260620T063820Z-2568151/report.json` with 3/3 cases and 7/7 assertions.
  - `pnpm run eval:krn-mcp-proposal-tool` generated `.krn/evals/krn-mcp-proposal-tool/20260620T063820Z-2568168/report.json` with 5/5 cases and 16/16 assertions.
- Dashboard coverage:
  - `apps/dashboard/src/BenchmarkReportsDashboard.tsx`
  - `apps/dashboard/scripts/write-dashboard-data.ts` includes `benchmark_reports`.
  - `apps/dashboard/test/benchmark-reports-dashboard.test.tsx`
- Deterministic eval coverage:
  - `packages/evals/src/validate-krn-dashboard-benchmark-reports-ui.ts`
  - `docs/evals/krn-dashboard-benchmark-reports-ui/`
  - `pnpm run eval:krn-dashboard-benchmark-reports-ui` generated `.krn/evals/krn-dashboard-benchmark-reports-ui/20260620T063805Z-2567754/report.json` with 5/5 cases and 28/28 assertions.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T063841Z-2568949/report.json` with 15/15 modules, 67/67 cases, and 224/224 assertions.
- Repo validation:
  - `pnpm typecheck` passed.
  - `pnpm test` passed with 30/30 test files and 100/100 tests.
  - `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T064727721071Z-2591855/report.json` with 4/4 cases.
  - `git diff --check` passed with no output.
- Source/memory/product updates:
  - `docs/plans/canonical/SOURCES.md` adds LOCAL028 and C041.
  - `docs/memory/product/2026-06-20--krn-benchmark-reports-control-plane-surface.md` records the durable product lesson.
  - `docs/memory/INDEX.md`, `AGENTS.md`, `docs/product/final-product-plan.md`, and `docs/goals/goal-006.md` now point to `goal-019` as the latest completed Slice 3 child context.
- Release-verifier recommendation: complete for this bounded child goal, with residual risks below. No productivity lift, benchmark statistical validity, command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality is claimed.

## Outcome

[FACT] KRN now has a read-only Benchmark Reports control-plane surface:

```text
.krn/benchmarks/**/report.json
  -> KrnBenchmarkReport parser
  -> KrnBenchmarkReportsViewModel
  -> krn://runtime/benchmark/latest
  -> KrnDashboardData.benchmark_reports
  -> apps/dashboard Benchmark Reports
  -> krn-dashboard-benchmark-reports-ui eval
```

[FACT] The surface preserves missing, invalid, no-lift, and negative-delta benchmark states and renders source refs, score delta, lift status, repair targets, next action, and failure mode without dashboard run/repair/apply/write commands.

[DECISION] Benchmark Reports is a review surface before any benchmark command surface. The next benchmark work should either expand the live suite beyond one task or repair the assisted path, but it must keep `productivity_lift_claimed: false` until a larger suite satisfies the lift gate.

[INFERENCE] This improves product direction because the negative one-task live pilot is now visible as actionable no-lift evidence instead of becoming a hidden `.krn` snapshot or an unsupported "breakthrough" claim.

## Boundaries

In scope:

- benchmark reports view model,
- benchmark read-only MCP resource,
- dashboard Benchmark Reports view,
- deterministic dashboard eval,
- source/memory/goal updates.

Out of scope:

- productivity lift claim,
- larger live benchmark suite,
- `krn benchmark` CLI command,
- dashboard run/repair/apply buttons,
- HTTP/API write routes,
- ChatGPT bridge,
- destructive MCP tools.

## Completion Criteria

This goal is complete only when:

- benchmark report view-model contract validates valid and known-bad examples,
- builder handles missing, invalid, and parsed benchmark report states,
- MCP resource allowlist includes read-only benchmark report state,
- dashboard data and UI render benchmark reports from parsed product objects,
- eval proves no-lift/negative-delta evidence is visible without command claims,
- source ledger, memory index, parent goal, and this goal carry exact evidence,
- semantic commit is pushed.
