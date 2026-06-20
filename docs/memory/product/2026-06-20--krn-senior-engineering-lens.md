# KRN Senior Engineering Lens

Status: decision

Sources:

- `AGENTS.md`
- `docs/memory/product/2026-06-20--krn-ai-harness-dictionary.md`
- `docs/memory/product/2026-06-20--krn-source-bank-and-engineering-patterns.md`
- `docs/memory/evals/2026-06-20--coding-quality-rubric.md`
- Matt Pocock skills/operator workflow sources listed in `docs/source-bank/MANIFEST.md`
- Karpathy/autoresearch source listed in `docs/source-bank/MANIFEST.md`
- OpenAI Codex manual best-practices section fetched 2026-06-20
- Anthropic effective agents/context-engineering sources listed in `docs/source-bank/MANIFEST.md`
- SWE-agent and Agentless papers listed in `docs/source-bank/MANIFEST.md`

## Observation

KRN needs a global decision lens, not a pile of local reminders. The same senior-engineering questions should apply before adding a skill, eval, memory layer, API, dashboard surface, hook, lab, or TypeScript abstraction.

## Useful Pattern

KRN's compact quality kernel:

```text
mechanism-first
  -> bottleneck-led
  -> production-shaped
  -> context-budgeted
  -> diff-literate
  -> review-minimizing
  -> memory-operative
  -> proof-carrying
  -> deletion-friendly
```

Definitions:

- **Mechanism-first**: name the concrete source, paper, repo, practice, or local failure mechanism being used.
- **Bottleneck-led**: target the current limiting failure in KRN, not the artifact that is easiest to add.
- **Production-shaped**: build the real product path in the smallest viable form; no PoC theater.
- **Context-budgeted**: read selectors first and avoid dumping stable context into every run.
- **Diff-literate**: every changed line should be explainable by the slice objective.
- **Review-minimizing**: optimize for less human cleanup, clearer decisions, and fewer ambiguous states.
- **Memory-operative**: a stored pattern becomes useful only when selected, applied, reviewed, and measured.
- **Proof-carrying**: evidence travels with the change and states what it does not prove.
- **Deletion-friendly**: remove or merge weak layers instead of adding more coordination overhead.

What actually raises quality:

- better problem selection,
- smaller and more production-shaped slices,
- stricter boundaries on inputs and writes,
- public-interface tests for behavior that matters,
- type/runtime parsers at external boundaries,
- review surfaces that expose action, owner, source, and failure mode,
- second-opinion review for architecture and standards,
- fast deletion of weak skills/evals/docs,
- retrieval and application of the right pattern at the right time,
- measured reduction of repeated failure modes.

What usually does not raise quality:

- more files without a consumer,
- more eval modules without a protected contract or known regression,
- broader context reads,
- passive memory notes,
- dashboards over unreviewed state,
- source lists without mechanism extraction,
- positive fixture deltas presented as product lift.

Before a non-trivial decision or implementation, answer this lens briefly:

1. **Mechanism**: what concrete mechanism from source/repo/paper/practice is being used?
2. **Tradeoff**: what gets better, what gets worse, and what is the rejected alternative?
3. **Simplest viable design**: what is the smallest shape that preserves the mechanism?
4. **Boundary**: what is not being built or claimed?
5. **Verification**: what proves this specific slice and what would disprove it?
6. **Review burden**: what will a human have to inspect or clean up?
7. **Promotion rule**: when does this become durable memory/product truth?

Short form for agents:

```text
kernel -> vertical or stop -> narrow proof -> no overclaim
```

This phrase is intentionally compact. It means: apply the quality kernel, cut the work into an independently verifiable slice, prove that slice narrowly, and name what the proof does not establish.

## KRN Implication

This lens overrides artifact-chasing. If the answer points to a tiny code change, do that. If it points to a memory note, write that. If it points to a lab, keep it small. If it points to no action, stop.

Global defaults:

- Prefer vertical slices over horizontal layer work.
- Prefer one behavior test over bulk speculative tests.
- Prefer source-backed mechanism over best-practice labels.
- Prefer local typed contracts only when another surface consumes them.
- Prefer read-only/proposal-only tools before mutation.
- Prefer compact selectors over broad rereads.
- Prefer small labs with one metric before maintained benchmark frameworks.
- Prefer deleting or merging weak skills over expanding a skill catalog.

## Failure Mode

This becomes harmful if it turns into ceremony. The lens should fit in a few lines for most work. If it takes longer than the implementation for a trivial change, skip it.

## Review Trigger

Update after a KRN slice shows that a lens question is missing, unused, or too vague to change agent behavior.
