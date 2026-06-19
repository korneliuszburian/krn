---
id: codex-memory-compliance
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: scripts/evals/codex_memory_compliance.py
---

# Codex Memory Compliance Eval

## Purpose

This module checks whether Codex follows the repo-local operating layer without being reminded in the user prompt.

It answers:

> If the prompt is neutral, does Codex still respect `AGENTS.md`, `docs/memory/INDEX.md`, the active goal, canonical synthesis, compact continuity state, and anti-slop constraints?

## What This Tests

- repo read-order compliance,
- source-backed planning behavior,
- avoiding dashboard-first or prompt-pack drift,
- compact hook status awareness,
- anti-slop behavior before broad edits.

The source-to-case mapping lives in [OPENAI-COOKBOOK-MAPPING.md](./OPENAI-COOKBOOK-MAPPING.md). A case without a source pattern is invalid.

## What This Does Not Test

- final product quality,
- benchmark superiority,
- every future KRN skill,
- live dashboard behavior,
- full Promptfoo parity.

## Commands

Validate case definitions without calling Codex:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
```

Run the live black-box eval through `codex exec`:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode live
```

Run one case:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode live --case repo-intake-neutral
```

Score a known-bad fixture:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode score-fixture --case repo-intake-neutral --fixture docs/evals/codex-memory-compliance/fixtures/bad-repo-intake-neutral.md
```

## Result Policy

Results are written under:

```text
.krn/evals/codex-memory-compliance/{run_id}/
```

Do not commit runtime outputs. Promote only reviewed findings into `docs/memory`.

## Metrics

The runner reports case pass/fail, assertion pass/fail, and tagged behavior scores:

| Metric | What it detects |
|---|---|
| `memory_routing_score` | Codex found repo-local memory/canonical/goal state without prompt reminders. |
| `source_grounding_score` | Codex relied on source-backed/canonical artifacts instead of generic intuition. |
| `goal_alignment_score` | Codex kept the next step narrow, verifiable, and aligned with the active direction. |
| `continuity_score` | Codex separated proven compact artifacts from unproven hook behavior. |
| `anti_slop_score` | Codex resisted vague broad edits and named scope/verification first. |
| `drift_resistance_score` | Codex avoided dashboard-first, prompt-pack, swarm, and rewrite drift. |

`validate` proves only that cases are syntactically sound. `live` is the behavior test because it calls `codex exec` with neutral prompts.
