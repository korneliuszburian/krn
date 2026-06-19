# Technology Stack Decision

Status: decision

Sources:

- [docs/specs/technology-stack/decision.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/technology-stack/decision.md)
- [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-005.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-005.md)
- `mattpocock/skills`, local clone `/tmp/krn-stack-research/skills`, commit `6eeb81b`
- `mattpocock/dictionary-of-ai-coding`, local clone `/tmp/krn-stack-research/dictionary-of-ai-coding`, commit `276e3e0`
- `mattpocock/sandcastle`, local clone `/tmp/krn-stack-research/sandcastle`, commit `fa13253`
- `mattpocock/evalite`, local clone `/tmp/krn-stack-research/evalite`, commit `e18a793`
- `total-typescript/ts-reset`, local clone `/tmp/krn-stack-research/ts-reset`, commit `81b3b26`
- Total TypeScript TS Reset docs, accessed 2026-06-19: https://www.totaltypescript.com/ts-reset

## Observation

The initial `goal-005` draft proposed Python as a conservative fallback because the repo already had Python validators and no app stack. That was an implementation shortcut, not a product-stack decision.

After inspecting Matt Pocock / Total TypeScript source material, the stronger product direction is TypeScript-first, with Node.js as the initial runtime and packaging lane.

The important pattern is not TypeScript fandom. It is typed, unknown-first, source-backed contracts that can serve CLI, evals, MCP/API, and dashboard from one product language.

## Useful Pattern

Use TypeScript as the product contract layer:

```text
unknown external input -> parser -> typed object -> behavior test -> eval/report -> reviewed memory
```

Adopt Matt-derived standards:

- strict typecheck as a gate,
- no unchecked `any` at boundaries,
- `unknown` before parser,
- public-interface behavior tests,
- vertical tracer-bullet slices,
- deep modules with small interfaces,
- skills as small predictable workflows,
- handoff/spec artifacts over context sprawl.

## KRN Implication

`goal-006` is now the active product execution contract. `goal-005` is preserved as Slice 2 `krn init --dry-run` context.

- no new Python CLI/product code,
- no `scripts/krn.py`,
- TypeScript-first stack decision before runtime implementation,
- Operator Build System before runtime implementation,
- existing Python validators are legacy/local proof artifacts until replaced,
- first runtime slice should be a TypeScript CLI/contracts/eval vertical slice,
- dashboard remains blocked until real object consumers exist.

## Failure Mode

This becomes harmful if KRN turns TypeScript into ceremony:

- huge monorepo before the first vertical slice,
- global `ts-reset` in published packages without ADR,
- type cleverness instead of runtime parsers,
- broad dashboard scaffolding before CLI contracts,
- copying Sandcastle/Evalite architecture instead of borrowing mechanisms.

## Review Trigger

Update after `goal-006` Slice 1 completes, the first TypeScript `krn init --dry-run` Slice 2 work ships, first read-only API/MCP prototype starts, first dashboard implementation starts, or if measured CLI/runtime performance makes Node unsuitable.
