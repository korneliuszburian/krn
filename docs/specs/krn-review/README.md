---
id: krn-review-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-19
sources:
  - docs/goals/goal-038.md
  - docs/plans/canonical/draft.md
  - docs/plans/canonical/SOURCES.md
  - docs/specs/technology-stack/decision.md
  - docs/evals/STANDARD.md
---

# KRN Review Contract

## Purpose

`krn review` inspects the latest local runtime artifacts, applies selected MemoryStore guidance, and writes one proposal-only review report.

Its job is to convert typed runtime evidence and selected memory IDs into human-review proposals before any MCP/API/dashboard work consumes that evidence.

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

It also requires a local MemoryStore adapter file outside the target repo:

```text
KRN_MEMORY_STORE_PATH=/path/to/memory-store.json
```

The report stores selected memory IDs, source lineage, application guidance, and feedback outcome. It must not store authoritative memory bodies in `.krn/**`.

## Boundary

Allowed writes:

- `.krn/review/{run_id}/report.json`
- the external MemoryStore adapter feedback sink configured by `KRN_MEMORY_STORE_PATH`

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

It does not make `.krn/**` or `docs/memory/**` the memory core, approve memory/source changes, prove productivity lift, prove human review quality, or unblock destructive API/MCP/dashboard behavior by itself.

## Validation

Run:

```bash
pnpm exec vitest run packages/contracts/test/review-report.test.ts packages/cli/test/review.test.ts
pnpm run eval:krn-review
```
