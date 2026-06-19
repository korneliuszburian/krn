---
id: krn-eval-contract
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

# KRN Eval Contract

## Purpose

`krn eval` runs deterministic local KRN eval modules and writes one schema-backed aggregate report.

It is the third Slice 2 CLI command after `krn init --dry-run` and `krn doctor`. Its job is to prove that runtime eval reports are executable and machine-readable before API/MCP/dashboard work starts. It also aggregates the `krn review` contract eval.

## Command

```bash
pnpm run krn -- eval
```

Accepted shape:

```text
krn eval [--target <path>] [--module <module-id>]
```

Supported module IDs:

- `krn-init-contracts`
- `krn-doctor-contracts`
- `krn-review-contracts`

If no module is supplied, the command runs all supported modules.

## Runtime Output

The command writes:

```text
{target_root}/.krn/eval/{run_id}/report.json
```

The report uses `schema_version: "krn-eval-report.v1"` and `kind: "krn_eval_report"`.

Module-level eval reports remain under:

```text
{target_root}/.krn/evals/{module_id}/{module_run_id}/report.json
```

## Boundary

Allowed writes:

- `.krn/eval/{run_id}/report.json`
- `.krn/evals/{module_id}/{module_run_id}/report.json`
- runtime reports created by evaluated commands under `.krn/init/**`, `.krn/doctor/**`, or `.krn/review/**`

Forbidden default writes:

- `AGENTS.md`
- `.codex/**`
- `.agents/**`
- `docs/memory/**`
- `docs/evals/**`
- source files outside `.krn/**`

## Interpretation

A green `krn eval` report means the selected deterministic local eval modules ran and their reports were aggregated through the KRN eval contract.

It does not prove productivity lift, benchmark lift, hook semantic correctness, API/MCP readiness, dashboard readiness, or human review quality.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts
pnpm run eval:krn-eval
```
