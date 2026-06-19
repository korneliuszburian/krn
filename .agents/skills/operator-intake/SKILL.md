---
name: operator-intake
description: Classify and route KRN operator/build-time work inside this repo. Use when a task is broad, ambiguous, starts or resumes goal work, asks what to do next, asks whether to build skills/evals/API/dashboard, or needs current repo truth before planning or editing.
---

# Operator Intake

## Overview

Use this skill to choose the right operating phase before doing work. It prevents dashboard/API/runtime-skill drift by grounding the task in the active execution contract, memory, canonical docs, and the smallest verifiable next slice.

## Workflow

1. Read the newest user message first.
2. Read `AGENTS.md` and `docs/memory/INDEX.md`.
3. Read the active execution contract named by those files before using historical goals as context.
4. Read canonical docs only when the task touches product direction, sources, or architecture.
5. Classify the task into one phase: P0 memory, P1 operator skills, P2 evals, P3 repair loop, P4 `krn init`, P5 API/MCP objects, P6 runtime skills, P7 dashboard, or P8 benchmark.
6. Name the current source of truth and any stale/superseded docs.
7. Select the next skill or action:
   - `research-synthesis` for source-to-pattern work.
   - `goal-execplan` for broad goals or execution plans.
   - `eval-designer` for new evals or metrics.
   - `repair-handoff` for failures and repair records.
7. Proceed with implementation only when the active goal or user request calls for it.

## Input

- User request or active `/goal` objective.
- Current repo state from files, not memory alone.
- Optional compact checkpoint from `.krn/compact/`.

## Output

- Phase classification.
- Current source-of-truth list.
- Assumptions or missing evidence.
- Smallest useful next action.
- Selected follow-on skill or explicit reason no skill is needed.
- Verification command or artifact for the next action.

## Phase Boundary

This skill ends when the task is routed to one bounded phase with a concrete next verification surface. It should not produce PRDs, eval files, repair records, API schemas, or dashboard designs itself.

## When Not To Use

- Do not use for a tiny self-contained edit with obvious scope.
- Do not use after another operator skill has already established the phase and evidence.
- Do not use to bypass the active execution contract's completion criteria.
- Do not route directly to dashboard/API work before P1/P2 evidence exists.

## Eval Case

`operator-intake-contract`: A neutral prompt asking for the next step must name the active execution contract, choose P1 or P2 before API/dashboard work, and identify the smallest verifiable action.
