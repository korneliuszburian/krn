# KRN Source Bank and Engineering Pattern Memory

Status: decision

Sources:

- `docs/source-bank/MANIFEST.md`
- `docs/memory/github-research/2026-06-19--mattpocock-skills-operator-pipeline.md`
- `docs/memory/github-research/2026-06-19--karpathy-autoresearch-experiment-loop.md`
- `docs/memory/openai-codex/2026-06-19--openai-cookbook-to-krn-pattern-map.md`
- `docs/memory/openai-codex/2026-06-20--token-efficient-research-synthesis.md`
- `docs/product/final-product-plan.md`
- Interrupted expanded-arena `live-full` progress log: `.krn/benchmarks/krn-benchmark-expanded-arena/20260620T151729Z-3762549/progress.jsonl`

## Observation

KRN needs a local source bank and a reviewed memory bank, but these are different layers.

- `.krn/source-bank/repos/` is a local cache of raw external repositories and source material.
- `docs/source-bank/MANIFEST.md` records which sources matter and why.
- `docs/memory/**` stores condensed KRN-ready mechanisms, decisions, failure modes, and review triggers.

Raw sources are not product truth. Memory notes are not enough unless they change Codex behavior through a workflow, contract, command, skill, review surface, or repair loop.

## Useful Pattern

KRN should treat external engineering wisdom as a source-to-mechanism pipeline:

```text
source repo / paper / practitioner material
  -> local source-bank cache with pinned commit or access date
  -> mechanism extraction
  -> KRN implication and rejected alternatives
  -> memory note / source ledger / ADR
  -> small vertical product slice
  -> fast verification or review
  -> optional heavy benchmark only when measuring a hypothesis
```

This replaces the failed direction where a large live benchmark becomes the default way to build product.

## KRN Implication

KRN's core value is not more evals. KRN resolves Codex paradoxes:

- powerful execution vs drifting autonomy,
- helpful context vs context poisoning,
- memory continuity vs stale false confidence,
- skills as leverage vs prompt sprawl,
- green tests vs overclaimed product lift,
- local artifacts vs reviewed durable truth,
- meta-research loops vs endless research theater.

Therefore the default product-building lane is:

```text
intake -> shared dictionary / grill -> destination artifact -> vertical issue
  -> implementation -> review / QA -> handoff / memory promotion
```

The meta-research lane is separate:

```text
baseline -> one bounded change -> fixed metric -> keep/discard -> repair record
```

`live-full` benchmark runs belong to the second lane only. They must not block normal product development or become the proof that every slice needs a benchmark.

## Current Correction

The interrupted expanded-arena `live-full` run is useful evidence, not a product mode. Before interruption it showed:

- 27 workers started,
- 26 workers completed,
- 17 timeout completions,
- 9 normal completions,
- review/debug tasks completed more reliably than refactor/edit-heavy tasks,
- refactor/edit-heavy workers often started changes and timed out.

This supports a direction change:

- keep heavy benchmark/meta-research as a lab/stress lane,
- build KRN through small vertical product slices,
- add fast feedback gates only where they reduce risk,
- store source-backed methodology in `docs/memory`, not in chat or hidden model memory,
- use local source clones for fast inspection, but promote only distilled mechanisms.
- use `.agents/skills/long-researcher` when a question needs a real research pack instead of a quick source lookup.

## Failure Mode

This becomes harmful if:

- source-bank clones become unreviewed hidden truth,
- `docs/memory` becomes a dumping ground for every source without mechanisms,
- every product slice gets a heavy eval by default,
- benchmark failures are mistaken for product progress,
- practitioner ideology is copied without local falsification,
- KRN optimizes for reports instead of better Codex work.

## Review Trigger

Update after the first source-bank clone refresh, after a Matt Pocock course/video synthesis pass, after an Anthropic Cookbook synthesis pass, or after KRN ships a fast product-build lane that replaces expanded-arena `live-full` as the normal operating mode.
