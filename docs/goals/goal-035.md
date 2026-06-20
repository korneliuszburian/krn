# Goal 035: KRN Operating Model Reset

## Status

Completed reset child goal for `docs/goals/goal-006.md`.

Starts after completed child goal `docs/goals/goal-034.md`.

## Objective

Reset KRN's near-term operating direction away from expanded-arena `live-full` as the default product-building path.

KRN should treat Codex as the strong coding agent and focus on the layer that solves Codex operating paradoxes:

- source-backed memory,
- local source bank,
- senior-engineering skills,
- shared AI/harness dictionary,
- fast vertical product slices,
- lightweight meta-research labs,
- review/control surfaces that consume real product state.

## Mechanism

Adopt two lanes:

1. Product-build fast lane:
   `intake -> grill/alignment -> destination artifact -> vertical slice -> implementation -> narrow verification -> review/handoff -> reviewed memory promotion`.
2. Meta-research heavy lab lane:
   `baseline -> one bounded intervention -> one fixed metric -> one log -> keep/discard`.

The heavy lab lane remains valuable, but only when it is explicit and bounded. It must not become the default way to implement KRN.

## Boundaries

- Do not run or harden expanded-arena `live-full` as this goal's main work.
- Do not claim productivity lift.
- Do not add dashboard/API command surfaces.
- Do not add more benchmark framework code.
- Do not treat source-bank clones as durable product truth.
- Do not replace existing typed product surfaces in this reset.

## Acceptance Evidence

- Root `AGENTS.md` names the senior-engineering lens and fast-lane/lightweight-lab policy.
- `docs/product/final-product-plan.md` separates product-build fast lane from meta-research heavy lab lane.
- `docs/goals/goal-006.md` next action no longer points at `live-full` as the default path.
- `docs/source-bank/MANIFEST.md` defines local raw source-cache rules and canonical source classes.
- `docs/memory/INDEX.md` links new memory notes.
- Memory notes exist for:
  - source bank and engineering patterns,
  - AI harness dictionary,
  - senior engineering lens,
  - lightweight agent lab rule.
- Repo-local `long-researcher` skill exists for bounded deep research packs instead of shallow source lookups.
- ADR records the hard-to-reverse operating-model split.
- JSON docs still parse.
- Markdown and diff checks pass.

## Validation Evidence

- `python3 /home/krn/.codex/skills/.system/skill-creator/scripts/quick_validate.py .agents/skills/long-researcher` -> passed.
- `jq empty docs/evals/operator-skill-contracts/cases.json docs/evals/krn-benchmark-expanded-arena/tasks.json docs/evals/krn-benchmark-expanded-arena/cases.json docs/specs/krn-eval/examples/krn-eval-report.example.json` -> passed.
- `python3 scripts/evals/operator_skill_contracts.py --mode validate` -> 12/12 skills, 267/267 assertions passed.
- `python3 scripts/evals/codex_memory_compliance.py --mode validate` -> 4/4 cases passed.
- `pnpm run eval:krn-eval` -> 3/3 cases, 7/7 assertions passed.
- `git diff --check` -> passed.

## Disproves Completion

- Future read order still directs agents to chase expanded-arena `live-full` by default.
- New docs say "best practices" without mechanisms, failure modes, or KRN implications.
- The reset adds raw source clones to git.
- The reset turns every product slice into an eval/benchmark requirement.
