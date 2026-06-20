# KRN dashboard view-model contract

Status: fact

Sources:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-008.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-008.md)
- [docs/specs/krn-dashboard-view-model/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-dashboard-view-model/README.md)
- [packages/contracts/src/dashboard-view-model.ts](/home/krn/coding/krn/active/krn-gastown/packages/contracts/src/dashboard-view-model.ts)
- [packages/mcp/src/index.ts](/home/krn/coding/krn/active/krn-gastown/packages/mcp/src/index.ts)
- [packages/mcp/test/dashboard-view-model.test.ts](/home/krn/coding/krn/active/krn-gastown/packages/mcp/test/dashboard-view-model.test.ts)
- [docs/memory/product/2026-06-20--krn-pending-review-view-model.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-pending-review-view-model.md)
- Local contract and builder evidence: `pnpm test -- packages/contracts/test/dashboard-view-model.test.ts packages/mcp/test/dashboard-view-model.test.ts packages/mcp/test/read-model.test.ts packages/mcp/test/stdio-server.test.ts`
- Local type evidence: `pnpm typecheck`

## Observation

`packages/contracts` now exports `KrnDashboardViewModelSchema`, `parseKrnDashboardViewModel`, and `krnDashboardViewModelJsonSchema`.

`packages/mcp` now exports `buildKrnDashboardViewModel(targetRoot, now)`. The builder uses the existing read-only MCP resource model plus proposal-store Pending Review state from `buildKrnPendingReviewViewModel`. It does not read chat state, create UI, mutate files, or invent dashboard metrics.

The first view model includes:

- resource health,
- latest runtime artifacts,
- pending review count from `.krn/proposals`,
- explicit zero fallback when no proposal records exist,
- next allowed action,
- source refs,
- owner/action/failure mode for each displayed metric,
- `no_mock_state: true`.

## Useful Pattern

Build dashboard input as a typed contract before dashboard UI:

```text
.krn runtime reports + .krn/proposals -> packages/mcp read model -> dashboard view model parser -> future UI
```

This prevents the dashboard from becoming a transcript browser or mock-state demo.

## KRN Implication

Slice 3 now has the first dashboard-facing view model over real local product objects. The next safe step is final source/memory update and then a later UI/app slice only after view-model contracts remain stable.

This does not prove dashboard UI readiness, user experience quality, proposal-tool safety, human approval quality, ChatGPT connector behavior, or productivity lift.

## Failure Mode

This becomes harmful if `KrnDashboardViewModel` is treated as the dashboard itself. It is a typed input contract only. UI work must preserve source refs, owner/action/failure mode, and no-mock-state behavior.

## Review Trigger

Update this note when `apps/dashboard` starts, when new dashboard views are added, when proposal approval/rejection contracts exist, or when dashboard metrics change.
