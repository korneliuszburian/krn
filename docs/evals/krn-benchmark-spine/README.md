---
id: krn-benchmark-spine
kind: eval-module
status: active
owner: krn
updated: 2026-06-20
runner: packages/evals/src/validate-krn-benchmark-spine.ts
---

# KRN Benchmark Spine Eval

## Purpose

This eval verifies the first benchmark report spine:

```text
fixture task evidence
  -> KrnBenchmarkReport
  -> .krn/benchmarks/krn-benchmark-spine/{run_id}/report.json
  -> .krn/evals/krn-benchmark-spine/{run_id}/report.json
```

It does not claim measured productivity lift, live Codex benchmark quality, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, repair-loop quality, or human review quality.

## What This Tests

- Valid benchmark report fixtures parse through `@krn/contracts`.
- Known-bad fixture reports that claim productivity lift from fixture data are rejected.
- The runner writes a generated benchmark report under `.krn/benchmarks/krn-benchmark-spine/`.
- Generated benchmark reports preserve no-lift evidence state, repair targets, source refs, and interpretation caveat.

## Command

```bash
pnpm run eval:krn-benchmark-spine
```

## Runtime Output

```text
.krn/benchmarks/krn-benchmark-spine/{run_id}/report.json
.krn/evals/krn-benchmark-spine/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means KRN can represent benchmark-style evidence as a typed report and reject unsupported lift claims.

It does not prove measured productivity lift. A later live benchmark must use `measurement_mode: "live_codex_exec"` and satisfy the `KrnBenchmarkReport` lift gate before any productivity claim is valid.
