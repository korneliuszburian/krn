---
id: operator-skill-contracts
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: scripts/evals/operator_skill_contracts.py
---

# Operator Skill Contracts Eval

## Purpose

This module checks whether P1 repo-local operator skills exist in the official Codex repo-skill path and expose the minimum contract required by the active execution goal.

It tests static skill quality, not model behavior.

## What This Tests

- skills live under `.agents/skills`,
- each skill has valid `SKILL.md` frontmatter,
- each description has trigger language,
- each skill defines input, output, phase boundary, when-not-to-use, and eval case,
- each `agents/openai.yaml` default prompt invokes `$skill-name`,
- no TODO placeholders remain.

## Commands

```bash
python3 scripts/evals/operator_skill_contracts.py --mode validate
```

## Result Policy

Results are written under:

```text
.krn/evals/operator-skill-contracts/{run_id}/report.json
```

Runtime reports stay local. Durable lessons move into `docs/memory`.
