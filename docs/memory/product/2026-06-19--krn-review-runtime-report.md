# KRN review runtime report

Status: fact

Sources:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/specs/krn-review/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-review/README.md)
- [docs/evals/krn-review-contracts/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-review-contracts/README.md)
- [packages/contracts/src/review-report.ts](/home/krn/coding/krn/active/krn-gastown/packages/contracts/src/review-report.ts)
- [packages/cli/src/main.ts](/home/krn/coding/krn/active/krn-gastown/packages/cli/src/main.ts)
- [packages/evals/src/validate-krn-review.ts](/home/krn/coding/krn/active/krn-gastown/packages/evals/src/validate-krn-review.ts)
- Local runtime evidence: `.krn/evals/krn-review-contracts/20260619T222104Z-1727694/report.json`
- Local review report: `.krn/review/20260619T222108Z-1727852/report.json`

## Observation

`krn review` now exists as the fourth Slice 2 runtime command.

It writes `.krn/review/{run_id}/report.json` and reads the latest local runtime artifacts:

- `.krn/init/*/manifest.json`
- `.krn/doctor/*/report.json`
- `.krn/eval/*/report.json`

Each artifact is parsed through the relevant `@krn/contracts` parser before the review report marks it as `present`. The latest direct review report has `overall_status: "ready_for_human_review"`, 3/3 artifacts present, 0 invalid artifacts, and 2 proposal-only proposals.

Current narrow evidence:

```bash
pnpm typecheck
pnpm test -- packages/contracts/test/review-report.test.ts packages/cli/test/review.test.ts
pnpm run eval:krn-review
pnpm run krn -- review
```

The latest `krn-review` eval report passed 3/3 cases and 8/8 assertions. The latest direct review report sees the aggregate eval report `.krn/eval/20260619T222100Z-1727537/report.json` with 4/4 modules passing.

## Useful Pattern

Use review reports as the bridge from raw runtime evidence to human-approved durable knowledge:

```text
init/doctor/eval runtime reports -> KrnReviewReport parser -> proposal-only review report -> human review -> memory/source update
```

The command writes only `.krn/review/{run_id}/report.json` by default. It does not modify memory, source ledgers, goals, API/MCP state, or dashboard state.

## KRN Implication

Slice 2 now has all four required typed CLI/runtime commands: `krn init --dry-run`, `krn doctor`, `krn eval`, and `krn review`.

The next implementation slice has started as a read-only Slice 3 control-plane path over these typed reports: [2026-06-19--krn-mcp-read-model.md](./2026-06-19--krn-mcp-read-model.md).

This does not prove productivity lift, benchmark lift, human approval, dashboard readiness, or destructive MCP/API safety.

## Failure Mode

This becomes harmful if proposal-only review output is treated as approved memory, approved source claims, or permission to expose destructive tools. The report is an input to review, not the review decision itself.

## Review Trigger

Update this note when `krn review` proposals gain an approval workflow, when the report consumes new artifact kinds, when the MCP/API layer gains transport or proposal tools, or when dashboard pending-review views render these reports.
