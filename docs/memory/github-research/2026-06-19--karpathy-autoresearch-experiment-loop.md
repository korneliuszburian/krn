# Karpathy Autoresearch Experiment Loop

Status: inference

Sources:

- GitHub: karpathy/autoresearch, accessed and cloned 2026-06-19: https://github.com/karpathy/autoresearch
- Local source clone: `/tmp/karpathy-autoresearch`, commit `228791f`, inspected 2026-06-19.

## Observation

`autoresearch` is useful for KRN as an experiment-loop pattern, not as an application architecture.

The mechanism is narrow:

- one file the agent may edit,
- one fixed evaluation harness the agent must not edit,
- one primary metric,
- a baseline run,
- a fixed time budget,
- a log table,
- keep/discard decisions based on metric movement and simplicity.

Its "loop forever" instruction is intentionally not a KRN default.

## Useful Pattern

KRN should borrow this smaller loop shape for eval workers:

```text
baseline -> one bounded change -> run fixed eval -> record metric -> keep/discard -> next attempt
```

The pattern is strong because every iteration has comparable evidence. It prevents a worker from claiming improvement through prose alone.

## KRN Implication

For `codex exec` worker lanes, use an `experiment.tsv` or JSON report with:

- attempt id,
- changed surface,
- metric before,
- metric after,
- pass/fail/crash status,
- simplicity note,
- keep/discard decision,
- stop reason.

This belongs in eval/repair tooling, not in root `AGENTS.md` and not as a dashboard-first feature.

## Failure Mode

Do not import the full autonomy stance. KRN must not run endless open-ended loops against broad repos. The borrowed part is the controlled metric loop, not "never stop".

## Review Trigger

Update if KRN adds an experiment runner, a repair loop, or a dashboard view over repeated eval attempts.
