# ADR 0002: Codex Harness Operating Model

## Status

Accepted on 2026-06-20.

## Context

[FACT] Codex is already a strong coding agent. KRN should not try to replace Codex or make every product step a benchmark.

[FACT] The interrupted expanded-arena `live-full` run showed useful lab evidence but poor product ergonomics: 27 workers started, 26 completed, 17 timeout completions, and refactor/edit-heavy tasks were too noisy for a default development loop.

[INFERENCE] A single large arena mixes at least two different workflows: normal product implementation and meta-research measurement. Treating that arena as the default operating mode slows product progress and hides what each result means.

## Decision

[DECISION] KRN has two separate operating lanes:

1. Product-build fast lane:
   `intake -> grill if ambiguous -> destination artifact -> vertical slice -> implementation -> fast verification -> review/handoff -> reviewed memory promotion`.
2. Meta-research heavy lab lane:
   `baseline -> one bounded intervention -> fixed metric -> keep/discard -> repair/memory update`.

The fast lane is the default. The heavy lab lane is explicit, occasional, and used to test a bounded hypothesis about Codex/KRN behavior.

## Consequences

- `live-full` benchmark runs must not block normal product development.
- Evals are not required at every step. They are used where a deterministic contract, regression, or measurement actually reduces risk.
- Source-backed methodology belongs in `docs/memory/**`, `docs/source-bank/MANIFEST.md`, and the source ledger, not in chat memory.
- Local source clones may live under `.krn/source-bank/repos/`, but only distilled mechanisms become KRN truth.
- KRN must grow a shared dictionary and harness vocabulary before adding more automation.
- Future benchmark work must classify task families instead of mixing review/debug/refactor/meta tasks into one undifferentiated metric.

## Rejected Alternatives

- Default everything through a 20-task live benchmark: too slow, too noisy, and not how strong engineers build normal product code.
- Drop the meta-researcher idea entirely: loses a powerful way to falsify agent-harness hypotheses.
- Keep source links only in chat or canonical prose: causes rereading, drift, and hidden assumptions after compaction.
- Build dashboard/API controls before the operating model is fixed: risks a polished UI over unreviewed state.

## Review Trigger

Revisit when KRN ships a fast lane that completes several real vertical product slices, or when a heavy lab lane produces repeated, clean, useful evidence that changes the product-build workflow.

## References

- [docs/memory/product/2026-06-20--krn-source-bank-and-engineering-patterns.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-source-bank-and-engineering-patterns.md)
- [docs/memory/product/2026-06-20--krn-ai-harness-dictionary.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-20--krn-ai-harness-dictionary.md)
- [docs/source-bank/MANIFEST.md](/home/krn/coding/krn/active/krn-gastown/docs/source-bank/MANIFEST.md)
- [docs/memory/github-research/2026-06-19--mattpocock-skills-operator-pipeline.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/github-research/2026-06-19--mattpocock-skills-operator-pipeline.md)
- [docs/memory/github-research/2026-06-19--karpathy-autoresearch-experiment-loop.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/github-research/2026-06-19--karpathy-autoresearch-experiment-loop.md)

