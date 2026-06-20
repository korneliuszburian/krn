---
id: krn-eval-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-006.md
  - docs/product/final-product-plan.md
  - docs/specs/technology-stack/decision.md
  - docs/evals/STANDARD.md
---

# KRN Eval Contract

## Purpose

`krn eval` runs deterministic local KRN eval modules and writes one schema-backed aggregate report.

It is the third Slice 2 CLI command after `krn init --dry-run` and `krn doctor`. Its job is to prove that runtime eval reports are executable and machine-readable before broader API/MCP/dashboard work expands. It also aggregates the `krn review` contract eval and the first Slice 3 MCP read/transport evals.

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
- `krn-mcp-read-model`
- `krn-mcp-transport`
- `krn-proposal-store`
- `krn-mcp-proposal-tool`
- `krn-pending-review-view-model`
- `krn-dashboard-pending-review-ui`
- `krn-dashboard-promotion-review-ui`
- `krn-dashboard-eval-runs-ui`
- `krn-proposal-review-decision`
- `krn-proposal-promotion`
- `krn-benchmark-spine`
- `krn-dashboard-benchmark-reports-ui`
- `krn-benchmark-live-suite`
- `krn-benchmark-live-stability`
- `krn-benchmark-arena-contract`
- `krn-benchmark-expanded-arena`
- `krn-repair-record`

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
- runtime reports created by evaluated commands under `.krn/init/**`, `.krn/doctor/**`, `.krn/review/**`, read-model eval output under `.krn/evals/krn-mcp-read-model/**`, transport eval output under `.krn/evals/krn-mcp-transport/**`, proposal-store eval output under `.krn/evals/krn-proposal-store/**`, proposal-tool eval output under `.krn/evals/krn-mcp-proposal-tool/**`, Pending Review eval output under `.krn/evals/krn-pending-review-view-model/**`, dashboard UI eval output under `.krn/evals/krn-dashboard-pending-review-ui/**`, Promotion Review dashboard eval output under `.krn/evals/krn-dashboard-promotion-review-ui/**`, Eval Runs dashboard eval output under `.krn/evals/krn-dashboard-eval-runs-ui/**`, proposal review decision eval output under `.krn/evals/krn-proposal-review-decision/**`, proposal promotion eval output under `.krn/evals/krn-proposal-promotion/**`, benchmark-spine eval output under `.krn/evals/krn-benchmark-spine/**`, benchmark-spine report output under `.krn/benchmarks/krn-benchmark-spine/**`, Benchmark Reports dashboard eval output under `.krn/evals/krn-dashboard-benchmark-reports-ui/**`, benchmark live suite validate output under `.krn/evals/krn-benchmark-live-suite/**`, benchmark live suite fixture reports under `.krn/benchmarks/krn-benchmark-live-suite/**`, benchmark live stability eval output under `.krn/evals/krn-benchmark-live-stability/**`, benchmark arena contract eval output under `.krn/evals/krn-benchmark-arena-contract/**`, benchmark expanded arena eval output under `.krn/evals/krn-benchmark-expanded-arena/**`, repair-record eval output under `.krn/evals/krn-repair-record/**`, or repair-record generated artifacts under `.krn/repairs/krn-repair-record/**`

Forbidden default writes:

- `AGENTS.md`
- `.codex/**`
- `.agents/**`
- `docs/memory/**`
- `docs/evals/**`
- source files outside `.krn/**`

## Interpretation

A green `krn eval` report means the selected deterministic local eval modules ran and their reports were aggregated through the KRN eval contract.

It does not prove productivity lift, benchmark lift, hook semantic correctness, API/MCP readiness, complete dashboard readiness, or human review quality.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts
pnpm run eval:krn-eval
```
