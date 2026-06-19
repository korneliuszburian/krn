---
id: operator-skill-impact
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: scripts/evals/operator_skill_impact.py
---

# Operator Skill Impact Eval

## Purpose

This module tests whether repo-local P1 operator skills measurably improve Codex behavior on KRN work.

It compares:

```text
neutral baseline prompt -> final answer
explicit $skill prompt  -> final answer
delta report            -> keep/refine/merge/remove decision
```

Baseline means "no explicit `$skill` invocation." It does not mean repo-local skills are physically disabled; `.agents/skills` are part of the current Codex setup.

## What This Tests

- whether explicit operator skills improve task completion,
- whether skills reduce dashboard/API drift,
- whether answers cite current repo truth and goal-006,
- whether skills produce verification surfaces and repair/eval thinking,
- whether the added skill context creates avoidable verbosity.

## What This Does Not Test

- final product quality,
- runtime/API/dashboard behavior,
- true disabled-skill Codex behavior,
- model superiority,
- human time saved without review evidence.

## Commands

Validate case definitions without calling Codex:

```bash
python3 scripts/evals/operator_skill_impact.py --mode validate
```

Run the required impact pair for every fixture:

```bash
python3 scripts/evals/operator_skill_impact.py --mode live --variant required
```

Run one case:

```bash
python3 scripts/evals/operator_skill_impact.py --mode live --case broad-next-step --variant required
```

Run the optional routing probe:

```bash
python3 scripts/evals/operator_skill_impact.py --mode live --case broad-next-step --variant routing
```

Score a saved answer fixture:

```bash
python3 scripts/evals/operator_skill_impact.py --mode score-fixture --case new-operating-rule --variant explicit --fixture docs/evals/operator-skill-impact/fixtures/bad-skill-as-proof.md
```

Score the premature-completion known-bad fixture:

```bash
python3 scripts/evals/operator_skill_impact.py --mode score-fixture --case premature-completion-claim --variant explicit --fixture docs/evals/operator-skill-impact/fixtures/bad-premature-completion-claim.md --fail-on-explicit-fail
```

Re-score an existing baseline/explicit pair after assertion changes:

```bash
python3 scripts/evals/operator_skill_impact.py --mode score-artifacts --case new-operating-rule --variant required \
  --baseline-fixture .krn/evals/operator-skill-impact/{run_id}/new-operating-rule--baseline.final.md \
  --explicit-fixture .krn/evals/operator-skill-impact/{run_id}/new-operating-rule--explicit.final.md
```

## Result Policy

Runtime outputs are written under:

```text
.krn/evals/operator-skill-impact/{run_id}/
```

Each live report includes per-case variant results, explicit-minus-baseline metric deltas, and a recommendation:

- `keep`: explicit skill improves or preserves a high score.
- `keep_observe`: both baseline and explicit are already strong; keep but gather more traces.
- `refine`: explicit skill is incomplete but not worse than baseline.
- `refine_or_merge`: explicit skill underperforms baseline or duplicates another skill.
- `runner_blocked`: Codex runner did not produce a comparable artifact.
- `fixture_failed`: saved fixture failed deterministic assertions as expected when `--fail-on-explicit-fail` is used.

Do not promote "skills improve productivity" into product claims until reports show repeated positive deltas and human review confirms lower correction burden.
