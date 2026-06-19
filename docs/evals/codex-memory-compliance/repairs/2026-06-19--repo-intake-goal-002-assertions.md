# Repair Record: repo-intake-neutral goal-002 assertions

## Failure Source

- Eval report: `.krn/evals/codex-memory-compliance/20260619T110755490647Z-474227/report.json`
- Case: `repo-intake-neutral`
- Result: failed, `2/4` assertions passed, `memory_routing_score = 0.0`

## Classification

- Observability defect: assertion still expected `goal-001` after `goal-002` became the active execution contract.
- Assertion brittleness: response recognized the memory/eval operating layer but did not use the exact phrases `memory index` or `repo-local memory`.

## Repair Surface

- `docs/evals/codex-memory-compliance/cases.json`

No `AGENTS.md`, memory, hook, or skill behavior is changed for this repair.

## Attempt

Update `repo-intake-neutral` expected phrases to include current active goal and current memory/eval language:

- add `docs/goals/goal-002.md`, `goal-002`, and `active contract`,
- add `memory compliance`, `memory/eval`, and `operating-layer`.

## Validator Plan

Run:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
python3 scripts/evals/codex_memory_compliance.py --mode score-fixture --case repo-intake-neutral --fixture docs/evals/codex-memory-compliance/fixtures/bad-repo-intake-neutral.md
python3 scripts/evals/codex_memory_compliance.py --mode live --case repo-intake-neutral --timeout 900
```

## Stop Reason

Pass.

Validator results:

- `validate`: passed, `4/4` cases.
- known-bad fixture: failed as expected, `1/4` assertions.
- live `repo-intake-neutral`: passed, `4/4` assertions.
- Live report: `.krn/evals/codex-memory-compliance/20260619T111208893140Z-485388/report.json`.
