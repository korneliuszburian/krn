---
id: krn-benchmark-live-stability
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-benchmark-live-stability.ts
---

# KRN Benchmark Live Stability Eval

## Purpose

This eval reads existing live-suite benchmark reports and classifies whether the current evidence is ready for suite expansion or productivity lift claims:

```text
.krn/benchmarks/krn-benchmark-live-suite/**/report.json
  -> parse through KrnBenchmarkReport
  -> filter live_codex_exec reports
  -> classify clean vs dirty completed-task evidence
  -> block expansion until repeated clean live reports exist
  -> block lift until the clean 20-task lift gate is satisfied
```

It does not run live `codex exec`; it is safe for default `krn eval`.

## What This Tests

- Known-bad positive-lift status with failed tasks is rejected by the benchmark report contract.
- Dirty live evidence with failed or blocked tasks is not expansion-ready.
- One clean completed three-task report is recognized as clean evidence but is not repeated stability and not productivity lift.
- Repeated clean completed live reports can make suite expansion review-ready while still staying below the 20-task productivity lift gate.
- The current local live report store is classified without overclaiming.

## Command

```bash
pnpm run eval:krn-benchmark-live-stability
```

## Runtime Output

```text
.krn/evals/krn-benchmark-live-stability/{run_id}/report.json
```

Runtime outputs stay local. Durable conclusions move to `docs/memory`.

## Interpretation Policy

A green run means KRN can classify live-suite benchmark report readiness deterministically.

It does not prove measured productivity lift, clean repeated live execution in the current runtime, statistical benchmark validity, suite expansion completion, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
