# Operator Skill Impact Loop

Status: decision

Sources:

- OpenAI Cookbook: Build an Agent Improvement Loop with Traces, Evals, and Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop
- OpenAI Cookbook: Moving from OpenAI Evals to Promptfoo, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo
- OpenAI Cookbook: Macro Evals for Agentic Systems, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems
- Matt Pocock skills repo, local clone `/tmp/mattpocock-skills`, commit `6eeb81b`, inspected 2026-06-19: https://github.com/mattpocock/skills
- KRN local operator skill prototype: `.agents/skills/`

## Observation

Creating skills does not prove the operating layer works. A skill is an intervention. It must be compared against a baseline and either improve measurable behavior or be removed/merged.

Matt's strongest pattern is a pipeline of small skills with phase boundaries. OpenAI's strongest eval pattern is trace-derived improvement: real trace, feedback, eval definition, repair, rerun.

## Useful Pattern

Evaluate every operator skill through this loop:

```text
task fixture -> baseline Codex -> Codex with relevant skill -> compare report -> repair or prune skill -> rerun
```

The comparison must measure behavior, not aesthetics.

Minimum metric set:

- `task_success_score`: did the run produce the required artifact or answer?
- `source_grounding_score`: did it use the right repo/source evidence?
- `phase_discipline_score`: did it stay in the right phase and avoid API/dashboard/runtime drift?
- `verification_score`: did it name or run a relevant check?
- `review_burden_score`: how much human correction remained?
- `context_cost_score`: did the skill add avoidable verbosity or confusion?
- `skill_routing_score`: did the agent choose the right skill when not explicitly forced?

## KRN Implication

P1 has two gates:

1. Static contract gate: skills live in `.agents/skills`, have trigger descriptions, inputs, outputs, phase boundaries, when-not-to-use, and eval bindings.
2. Impact gate: real or fixture tasks show a measurable lift compared with baseline Codex.

Only the first gate is required before API/MCP design. The second gate is required before calling the skill layer a product advantage.

## Current Slice 1 Coverage

As of `goal-006`, `operator-skill-impact` covers 10 fixtures:

- the original five operator skills,
- `domain-grill-interviewer`,
- `product-requirements-writer`,
- `adr-writer`,
- `issue-slice-writer`,
- `release-verifier`.

The module also includes `fixtures/bad-premature-completion-claim.md`, a known-bad answer that must fail the `premature-completion-claim` case. This guards against claiming Slice 1 is complete from nice docs or static skill checks alone.

This is still not productivity proof. Live baseline-vs-explicit runs and human review burden evidence remain required before claiming KRN-assisted Codex is better.

## Failure Mode

The product becomes "sexy slop" if it ships skills because they sound senior, while never proving they reduce repeated Codex failure modes. A skill that increases context load, causes routing confusion, or hides stale decisions should be pruned.

## Review Trigger

Update when `operator-skill-impact` gains live A/B evidence for the new Slice 1 skills, when Promptfoo is introduced, or when any operator skill is removed/merged after impact testing.

## First Result

See [Operator Skill Impact First Results](./2026-06-19--operator-skill-impact-first-results.md).
