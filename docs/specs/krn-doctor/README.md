---
id: krn-doctor-contract
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

# KRN Doctor Contract

## Purpose

`krn doctor` reports local KRN readiness as a schema-backed runtime artifact.

It is the second Slice 2 CLI command after `krn init --dry-run`. Its job is to report whether the target project has the current KRN operating surfaces needed before later runtime commands, API/MCP, or dashboard work.

## Command

```bash
pnpm run krn -- doctor --target .
```

Accepted shape:

```text
krn doctor [--target <path>]
```

## Runtime Output

The command writes:

```text
{target_root}/.krn/doctor/{run_id}/report.json
```

The report uses `schema_version: "krn-doctor-report.v1"` and `kind: "krn_doctor_report"`.

## Required Readiness Surfaces

The report must include checks for:

- `agents`: `AGENTS.md`
- `memory`: `docs/memory/INDEX.md`
- `skills`: `.agents/skills/**/SKILL.md`
- `hooks`: `.codex/hooks.json` plus `.codex/hooks/compact_continuity.py`
- `evals`: `docs/evals/README.md` plus eval module cases
- `runtime`: `.krn/`

## Boundary

Allowed writes:

- `.krn/doctor/{run_id}/report.json`

Forbidden default writes:

- `AGENTS.md`
- `.codex/**`
- `.agents/**`
- `docs/memory/**`
- `docs/evals/**`
- source files outside `.krn/doctor/**`

## Interpretation

A green doctor report means the local readiness surfaces were detected. It does not prove productivity lift, semantic correctness of hooks, API/MCP readiness, dashboard readiness, or benchmark lift.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/doctor-report.test.ts packages/cli/test/doctor.test.ts
pnpm run eval:krn-doctor
```
