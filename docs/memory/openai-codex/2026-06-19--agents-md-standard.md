# AGENTS.md Standard and Anti-Drift Rules

Status: decision

Sources:

- AGENTS.md open format, accessed 2026-06-19: https://agents.md/
- OpenAI Codex AGENTS.md docs, accessed 2026-06-19: https://developers.openai.com/codex/guides/agents-md
- AI Hero AGENTS.md guide, accessed 2026-06-19: https://www.aihero.dev/a-complete-guide-to-agents-md
- HumanLayer writing a good CLAUDE.md / AGENTS.md, accessed 2026-06-19: https://www.humanlayer.dev/blog/writing-a-good-claude-md
- HumanLayer 12-factor agents, accessed 2026-06-19: https://github.com/humanlayer/12-factor-agents

## Observation

AGENTS.md is a predictable instruction file for coding agents, but it is loaded into every session. OpenAI documents that Codex reads `AGENTS.md` before work, layers global/project/nested files, and stops once the project instruction byte limit is reached. The open AGENTS.md standard recommends project overview, build/test commands, code style, testing instructions, and security considerations, but does not require a fixed schema.

Practitioner guidance converges on the same risk: a large AGENTS.md becomes an attention-budget problem. It should contain only universally applicable instructions and point to more detailed guidance through progressive disclosure.

## Useful Pattern

Root `AGENTS.md` should be:

- short,
- stable,
- universal to every task in the repo,
- explicit about read order,
- explicit about anti-rot rules,
- full of pointers rather than copied knowledge.

It should not be:

- a product spec,
- a source index,
- a changelog,
- a codebase map with stale paths,
- a collection of hotfix rules after every agent mistake,
- an auto-generated dump.

## KRN Implication

KRN should use a three-layer documentation contract:

1. `AGENTS.md`: tiny always-loaded operating contract.
2. `docs/memory/INDEX.md`: repo-local progressive-disclosure index.
3. Category notes and canonical plans: durable evidence, decisions, source ledgers, and product synthesis.

This lets Codex see the important invariants without flooding every session with details.

## Anti-Docs-Rot Rules

1. Do not cite exact paths unless verified in the current pass.
2. Do not duplicate source conclusions in multiple docs without a canonical source of truth.
3. If two docs conflict, mark the conflict and update the canonical doc; do not silently merge.
4. If a claim depends on current external state, refresh it or mark it stale.
5. A memory note must have a status, sources, useful pattern, KRN implication, failure mode, and review trigger.
6. A new memory note must be linked from `docs/memory/INDEX.md` in the same pass.
7. A dashboard/control-plane claim must map to an object, owner, action, and failure mode.
8. A rule that is not universal belongs outside root `AGENTS.md`.

## Failure Mode

The failure mode is a slow-growing instruction landfill: every past mistake becomes another rule, agents load stale paths on every task, and the repo appears well documented while actually becoming less reliable.

## Review Trigger

Review this standard whenever root `AGENTS.md` exceeds roughly 80 lines, a category note is not indexed, or a canonical product decision appears in more than one place with conflicting wording.
