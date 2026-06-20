---
id: krn-repair-record
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-repair-record.ts
---

# KRN Repair Record Eval

## Purpose

This eval verifies the first typed repair handoff path:

```text
KrnBenchmarkReport no_lift_evidence
  -> KrnRepairRecord parser
  -> generated local repair record
```

It does not repair prompts, skills, memory, benchmark tasks, dashboard behavior, MCP/API behavior, or product outcomes.

## What This Tests

- The valid `KrnRepairRecord` fixture parses through `@krn/contracts`.
- The known-bad fixture that claims validated repair without validator evidence fails.
- A benchmark no-lift report fixture generates a parseable proposed repair record under `.krn/repairs/krn-repair-record/{run_id}/repair-record.json`.
- The generated repair record keeps `classification: "benchmark_no_lift"` and blocks `productivity_lift_claim`.

## Command

```bash
pnpm run eval:krn-repair-record
```

## Runtime Output

```text
.krn/repairs/krn-repair-record/{run_id}/repair-record.json
.krn/evals/krn-repair-record/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means KRN can turn no-lift benchmark evidence into a typed proposed repair record. It does not prove repair quality, productivity lift, prompt improvement, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
