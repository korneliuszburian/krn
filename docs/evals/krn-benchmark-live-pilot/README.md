---
id: krn-benchmark-live-pilot
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-benchmark-live-pilot.ts
---

# KRN Benchmark Live Pilot Eval

## Purpose

This eval verifies the first live `codex exec` benchmark pilot:

```text
one benchmark task
  -> baseline codex exec read-only run
  -> KRN-assisted codex exec read-only run
  -> deterministic scorer
  -> KrnBenchmarkReport measurement_mode live_codex_exec
```

It does not claim measured productivity lift. The pilot intentionally uses one task and keeps `productivity_lift_claimed: false`.

## What This Tests

- Validate mode scores fixture outputs without calling Codex.
- Live mode runs two `codex exec` invocations with `--sandbox read-only`.
- Live mode captures JSONL/stdout, stderr, and final JSON messages.
- Live mode writes a `KrnBenchmarkReport` under `.krn/benchmarks/krn-benchmark-live-pilot/{run_id}/report.json`.
- The generated report parses through `@krn/contracts`, uses `measurement_mode: "live_codex_exec"`, and keeps productivity lift unclaimed.

## Commands

```bash
pnpm run eval:krn-benchmark-live-pilot
pnpm run eval:krn-benchmark-live-pilot:live
```

## Runtime Output

```text
.krn/benchmarks/krn-benchmark-live-pilot/{run_id}/
  baseline.stdout.jsonl
  baseline.stderr.txt
  baseline.final.json
  assisted.stdout.jsonl
  assisted.stderr.txt
  assisted.final.json
  report.json

.krn/evals/krn-benchmark-live-pilot/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green validate run means the scorer and schema path work on fixtures.

A green live run means KRN can execute and score one baseline-vs-assisted Codex task through `KrnBenchmarkReport`. It does not prove measured productivity lift, benchmark statistical validity, human review quality, dashboard command readiness, HTTP/API readiness, or ChatGPT connector behavior.
