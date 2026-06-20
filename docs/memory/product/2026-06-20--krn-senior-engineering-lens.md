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
mechanism first -> senior lens -> vertical or stop -> narrow proof -> no overclaim
```

This phrase is intentionally compact. It means: identify the source-backed mechanism, apply the seven lens questions, cut the work into an independently verifiable slice, prove that slice narrowly, and name what the proof does not establish.

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
