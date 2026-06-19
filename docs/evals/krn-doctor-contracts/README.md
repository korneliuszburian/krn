---
id: krn-doctor-contracts
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: packages/evals/src/validate-krn-doctor.ts
---

# KRN Doctor Contracts Eval

## Purpose

This eval verifies the second Slice 2 runtime path:

```text
DoctorReport parser -> krn doctor -> runtime readiness report -> eval report
```

It does not claim productivity lift, hook semantic correctness, API/MCP readiness, dashboard readiness, or benchmark lift.

## What This Tests

- The valid `krn-doctor` fixture parses through `@krn/contracts`.
- The known-bad fixture fails deterministically.
- The CLI-generated doctor report exists, parses through `@krn/contracts`, and covers AGENTS, memory, skills, hooks, evals, and runtime readiness surfaces.
- The eval writes a machine-readable report under `.krn/evals/krn-doctor-contracts/{run_id}/report.json`.

## Command

```bash
pnpm run eval:krn-doctor
```

## Runtime Output

```text
.krn/evals/krn-doctor-contracts/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means the doctor readiness report is locally checkable. It does not mean the reported hooks are semantically trustworthy, and it does not unblock API/MCP/dashboard work by itself.
