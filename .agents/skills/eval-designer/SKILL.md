---
name: eval-designer
description: Design deterministic KRN eval modules and regression cases. Use when adding or changing evals, metrics, known-bad fixtures, result schemas, Promptfoo-compatible contracts, codex exec live checks, or validation gates for skills, memory, hooks, repair loops, or operating rules.
---

# Eval Designer

## Overview

Use this skill to turn a desired operating behavior into a runnable eval. Prefer deterministic checks first; model judges only after calibration.

## Workflow

1. Identify the behavior under test and the source pattern that justifies it.
2. Write neutral prompts or static contract cases that do not leak the expected answer.
3. Define deterministic assertions before any model judge.
4. Tag assertions with metrics.
5. Add at least one known-bad fixture when possible.
6. Define result schema and runtime artifact location.
7. Add validate and score commands.
8. Keep live `codex exec` behavior separate from fixture scoring.

## Input

- Failure class, desired behavior, skill contract, hook behavior, or memory rule.
- Source patterns from OpenAI Cookbook, canonical docs, or memory notes.
- Existing eval standard at `docs/evals/STANDARD.md`.

## Output

- `docs/evals/{module}/README.md`.
- `cases.json` with expected behavior, source patterns, assertions, metrics, and failure modes.
- `result.schema.json`.
- `OPENAI-COOKBOOK-MAPPING.md` when OpenAI patterns justify cases.
- Runner or validation command under `scripts/evals/`.
- Known-bad fixture where useful.

## Phase Boundary

This skill ends when the eval can run locally and produce a machine-readable report. It must not tune instructions to pass the case without adding or preserving a regression case.

## When Not To Use

- Do not use for subjective preference checks without calibration.
- Do not create evals that only pass good examples.
- Do not make a runtime dashboard metric without owner/action/failure mode.
- Do not bulk-load docs in the prompt to force a pass.

## Eval Case

`eval-designer-contract`: A proposed eval case missing source pattern, metric tag, failure mode, or known-bad path where applicable must fail validation.
