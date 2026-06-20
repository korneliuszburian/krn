---
id: krn-eval-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-20
sources:
  - docs/goals/goal-038.md
  - docs/plans/canonical/draft.md
  - docs/evals/STANDARD.md
---

# KRN Eval Contract

## Purpose

`krn eval` runs deterministic local KRN eval modules and writes one schema-backed aggregate report.

Under `goal-038`, its job is to keep normal verification focused on the active product path. Default reports include only `core` and `current` modules; historical dashboard, benchmark, repair, and research-pack modules stay in the explicit `lab` lane.

## Command

```bash
pnpm run krn -- eval
```

Accepted shape:

```text
krn eval [--target <path>] [--lane core|current|lab|all] [--module <module-id>]
```

Default behavior:

- no `--lane` means `--lane current`;
- `current` includes `core` plus `current` modules;
- `lab` modules are excluded from default runs;
- explicit `--module` bypasses lane filtering and emits `requested_lane: "custom"`.

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
- `krn-research-pack`

If no module or lane is supplied, the command runs only the default current-lane selection. Use `--lane all` for the historical aggregate and `--lane lab` for lab-only checks.

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

Lane policy:

- `core`: stable CLI/report contract modules that protect the foundation.
- `current`: active product-control modules; default includes `core` and `current`.
- `lab`: dashboard, benchmark, research-pack, and repair-history modules that must be explicit so normal verification stays focused.
- `custom`: explicit `--module` selection.

It does not prove productivity lift, benchmark lift, hook semantic correctness, API/MCP readiness, complete dashboard readiness, or human review quality.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts
pnpm run eval:krn-eval
```
