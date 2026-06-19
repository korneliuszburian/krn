# KRN eval runtime report

Status: fact

Sources:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/specs/krn-eval/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-eval/README.md)
- [docs/evals/krn-eval-contracts/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-eval-contracts/README.md)
- [packages/contracts/src/eval-report.ts](/home/krn/coding/krn/active/krn-gastown/packages/contracts/src/eval-report.ts)
- [packages/cli/src/main.ts](/home/krn/coding/krn/active/krn-gastown/packages/cli/src/main.ts)
- [packages/evals/src/validate-krn-eval.ts](/home/krn/coding/krn/active/krn-gastown/packages/evals/src/validate-krn-eval.ts)
- Local runtime evidence: `.krn/evals/krn-eval-contracts/20260619T213124Z-1633062/report.json`
- Local aggregate report: `.krn/eval/20260619T213124Z-1633062/report.json`

## Observation

`krn eval` now exists as the third Slice 2 runtime command.

It writes `.krn/eval/{run_id}/report.json` and aggregates deterministic local eval modules:

- `krn-init-contracts`
- `krn-doctor-contracts`

The aggregate report is parsed through `parseKrnEvalReport` before it is written.

Current narrow evidence:

```bash
pnpm typecheck
pnpm test -- packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts
pnpm run eval:krn-eval
```

The latest `krn-eval` contract eval passed 3/3 cases and 7/7 assertions. The generated aggregate report shows 2/2 modules passing, with 6/6 module cases and 15/15 module assertions passing.

## Useful Pattern

Use aggregate eval reports as the bridge from module-specific checks to later review/control-plane surfaces:

```text
module eval reports -> KrnEvalReport parser -> .krn/eval aggregate -> deterministic eval -> reviewed memory
```

The aggregate command executes existing eval module commands instead of duplicating their assertions.

## KRN Implication

Slice 2 now has `krn init --dry-run`, `krn doctor`, and `krn eval` as typed CLI/runtime paths.

Next Slice 2 work should implement `krn review` as a schema-backed command before any API/MCP/dashboard work begins.

This does not prove productivity lift, benchmark lift, dashboard readiness, MCP readiness, or human review quality.

## Failure Mode

This becomes harmful if a green aggregate eval report is treated as broad product quality or productivity proof. It only proves that selected deterministic local modules ran and were aggregated through a typed report.

## Review Trigger

Update this note when `krn eval` adds modules, when `krn review` consumes aggregate eval reports, when module result contracts change, or when a read-only API/MCP layer exposes eval state.
