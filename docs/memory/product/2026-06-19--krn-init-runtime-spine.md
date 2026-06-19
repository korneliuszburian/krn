# KRN init runtime spine

Status: fact

Sources:

- [docs/goals/goal-007.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-007.md)
- [docs/specs/krn-init/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-init/README.md)
- [docs/evals/krn-init-contracts/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-init-contracts/README.md)
- [packages/contracts/src/init-manifest.ts](/home/krn/coding/krn/active/krn-gastown/packages/contracts/src/init-manifest.ts)
- [packages/cli/src/main.ts](/home/krn/coding/krn/active/krn-gastown/packages/cli/src/main.ts)
- [packages/evals/src/validate-krn-init.ts](/home/krn/coding/krn/active/krn-gastown/packages/evals/src/validate-krn-init.ts)
- Local runtime evidence: `.krn/evals/krn-init-contracts/20260619T213123Z-1633039/report.json`

## Observation

The first Slice 2 runtime consumer now exists:

- `packages/contracts` owns `InitManifestSchema` and `parseInitManifest`.
- `packages/cli` implements `krn init --dry-run`.
- `packages/evals` implements `pnpm run eval:krn-init`.
- `docs/specs/krn-init/` contains a command contract, valid fixture, and known-bad fixture.
- `docs/evals/krn-init-contracts/` contains deterministic eval cases, result schema, and interpretation policy.

Current narrow evidence:

```bash
pnpm typecheck
pnpm test -- packages/contracts/test/init-manifest.test.ts packages/cli/test/init-dry-run.test.ts
pnpm run eval:krn-init
```

The latest `krn-init` eval report passed 3/3 cases and 8/8 assertions.

## Useful Pattern

Use the first runtime slice as the product contract template:

```text
unknown input -> contract parser -> CLI runtime artifact -> deterministic eval -> reviewed memory
```

The CLI writes only `.krn/init/{run_id}/manifest.json` by default. It reports setup changes as dry-run planned files or proposals instead of mutating target files.

## KRN Implication

KRN has moved from docs-only product-spine contracts to a typed runtime path. Later Slice 2 work extended the same shape to `krn doctor`, `krn eval`, and `krn review`.

This does not prove productivity lift, write-mode safety, dashboard readiness, or MCP readiness.

## Failure Mode

This becomes harmful if later commands duplicate manifest validation outside `packages/contracts`, treat runtime reports as reviewed memory, or use one green eval as permission to start API/MCP/dashboard work.

## Review Trigger

`krn doctor`, `krn eval`, and `krn review` shipped after this note and are recorded separately:

- [2026-06-19--krn-doctor-runtime-report.md](./2026-06-19--krn-doctor-runtime-report.md)
- [2026-06-19--krn-eval-runtime-report.md](./2026-06-19--krn-eval-runtime-report.md)
- [2026-06-19--krn-review-runtime-report.md](./2026-06-19--krn-review-runtime-report.md)

Update this note again when `InitManifest` changes; when a read-only MCP/API layer consumes `.krn/init`; or if the dry-run command gains any write mode.
