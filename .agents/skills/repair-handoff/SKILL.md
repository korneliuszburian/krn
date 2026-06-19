---
name: repair-handoff
description: Convert eval failures, reviewer findings, trace defects, or broken operating-layer behavior into bounded repair records. Use when a KRN eval fails, a Codex run violates memory/source/goal rules, a hook or skill overclaims behavior, or a change needs a fresh-context handoff before repair.
---

# Repair Handoff

## Overview

Use this skill after a failure is observed. It prevents blind instruction tuning by requiring classification, smallest repair, validator result, metric delta, and stop reason.

## Workflow

1. Identify the failure source: eval report, fixture, live run, trace, reviewer comment, or source conflict.
2. Classify the failure:
   - missing requirement,
   - unreliable instruction following,
   - implementation defect,
   - observability defect,
   - stale or conflicting memory.
3. Pick the smallest repair surface: prompt, skill, memory, canonical docs, hook, MCP schema, eval, or code.
4. Add or preserve a regression case before changing behavior.
5. Run validator or name the blocker.
6. Record metric before/after and stop reason.

## Input

- Failing report or reviewer finding.
- Relevant source pattern, memory note, or canonical decision.
- Existing tests/evals and last known passing evidence.

## Output

- Repair record with failure source, classification, repair surface, validator result, metric delta, and stop reason.
- Bounded next action.
- Handoff note when a fresh context should continue.
- Explicit non-actions when the repair would broaden scope.

## Phase Boundary

This skill ends when a failure has a reviewable repair record and next bounded action. It does not perform broad cleanup, rewrite instructions globally, or implement unrelated improvements.

## When Not To Use

- Do not use before a failure source exists.
- Do not tune `AGENTS.md` or memory from one failure without a regression case.
- Do not continue repair after pass, max attempts, no useful delta, human input need, or scope violation.
- Do not treat an unavailable runner as model failure.

## Eval Case

`repair-handoff-contract`: A repair proposal without failure source, classification, changed surface, validator result, metric delta, and stop reason must fail.
