---
id: krn-eval-baseline
kind: data-contract
status: active
owner: krn
updated: 2026-06-21
sources:
  - docs/goals/goal-038.md
  - docs/specs/krn-eval/README.md
  - docs/evals/STANDARD.md
---

# KRN Eval Baseline Contract

## Purpose

`KrnEvalBaseline` is the reviewed `krn init` seed for a lean local eval baseline at `.krn/evals/baseline.json`.

It is not a live eval report, benchmark result, lab selector, all-module selector, or productivity-lift proof. It only records the initial lane policy and commands that a target repo can review before using KRN verification.

## Required Shape

Every baseline includes:

- `schema_version: "krn-eval-baseline.v1"`,
- `kind: "krn_eval_baseline"`,
- report roots for `.krn/eval` and `.krn/evals`,
- `default_lane: "current"`,
- required `core` and `current` lanes,
- forbidden default `lab` and `all` lanes,
- core/current baseline checks,
- policy fields forbidding lab/all defaults and productivity-lift claims,
- source refs,
- overclaim boundary naming what the seed does not prove.

## Boundary

Allowed behavior:

- seed `.krn/evals/baseline.json` only through `krn init --apply eval_baseline` after approved review;
- point to core/current eval commands;
- keep historical lab/benchmark/dashboard checks opt-in.

Forbidden behavior:

- no copied live report IDs;
- no active goal or canonical plan text;
- no default `lab` or `all` lane;
- no productivity-lift, eval-quality, dashboard/API, or broad bootstrap claim.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/eval-baseline.test.ts
pnpm test -- packages/cli/test/init-dry-run.test.ts
pnpm run eval:krn-init
pnpm run eval:krn-proposal-promotion
```
