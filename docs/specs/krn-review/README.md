---
id: krn-review-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-19
sources:
  - docs/goals/goal-006.md
  - docs/product/final-product-plan.md
  - docs/specs/technology-stack/decision.md
  - docs/evals/STANDARD.md
---

# KRN Review Contract

## Purpose

`krn review` inspects the latest local Slice 2 runtime artifacts and writes one proposal-only review report.

It is the fourth Slice 2 CLI command after `krn init --dry-run`, `krn doctor`, and `krn eval`. Its job is to convert typed runtime evidence into human-review proposals before any MCP/API/dashboard work consumes that evidence.

## Command

```bash
pnpm run krn -- review
```

Accepted shape:

```text
krn review [--target <path>]
```

## Runtime Output

The command writes:

```text
{target_root}/.krn/review/{run_id}/report.json
```

The report uses `schema_version: "krn-review-report.v1"` and `kind: "krn_review_report"`.

## Inputs

`krn review` reads the latest available reports from:

- `.krn/init/*/manifest.json`
- `.krn/doctor/*/report.json`
- `.krn/eval/*/report.json`

Each input is parsed through `@krn/contracts` before the review report marks it as `present`.

## Boundary

Allowed writes:

- `.krn/review/{run_id}/report.json`

Forbidden default writes:

- `AGENTS.md`
- `.codex/**`
- `.agents/**`
- `docs/memory/**`
- `docs/evals/**`
- `docs/plans/**`
- source files outside `.krn/**`

## Interpretation

A green `krn review` report means KRN produced a machine-readable proposal layer over local runtime artifacts.

It does not approve memory/source changes, prove productivity lift, prove human review quality, or unblock destructive API/MCP/dashboard behavior by itself.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/review-report.test.ts packages/cli/test/review.test.ts
pnpm run eval:krn-review
```
