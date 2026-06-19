# Codex Memory Compliance Evals

Status: decision

Sources:

- OpenAI Cookbook: Build an Agent Improvement Loop with Traces, Evals, and Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop
- OpenAI Cookbook: Moving from OpenAI Evals to Promptfoo, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo
- OpenAI Cookbook: Using Goals in Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- Local module: `docs/evals/codex-memory-compliance/`
- Local runner: `scripts/evals/codex_memory_compliance.py`

## Observation

The first useful KRN eval is not "is Codex smart?". It is:

```text
neutral prompt -> current repo-local setup -> does Codex discover and respect memory/canonical/goal state?
```

The prompt must not say "read memory" or "read AGENTS.md". The eval tests whether the existing operating layer routes attention without extra steering.

## Useful Pattern

Each case should map:

```text
neutral prompt -> expected behavior -> source pattern -> deterministic assertions -> metric tags -> failure mode
```

The runner should report both case pass/fail and behavior metrics, because partial failures matter. For example, a response can mention evals while still drifting into dashboard-first product thinking.

## KRN Implication

`codex-memory-compliance` is the first regression guard for the repo setup:

- `memory_routing_score`: did Codex discover repo-local memory/canonical state?
- `source_grounding_score`: did it cite or use source-backed/canonical artifacts rather than generic intuition?
- `goal_alignment_score`: did it preserve the next smallest useful slice and active direction?
- `continuity_score`: did it distinguish proven compact state from unproven hook behavior?
- `anti_slop_score`: did it resist broad vague editing?
- `drift_resistance_score`: did it avoid dashboard-first, prompt-pack, swarm, or rewrite drift?

These metrics are not product-quality claims. They are setup-compliance signals.

## Failure Mode

The eval becomes fake if cases are overfit to current wording, if neutral prompts include the target file names, or if green results are promoted without known-bad fixtures and live reruns.

## Review Trigger

Update when a new operating-layer rule is added to `AGENTS.md`, when memory index read order changes, when compact hooks change, or when the runner moves from local deterministic checks to Promptfoo.
