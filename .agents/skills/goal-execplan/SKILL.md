---
name: goal-execplan
description: Turn broad KRN objectives into verifiable goals and execution plans. Use when a task is long-running, multi-phase, ambiguous, likely to survive compaction, needs /goal text, needs an ExecPlan-style state file, or risks redefining completion around partial progress.
---

# Goal ExecPlan

## Overview

Use this skill to make broad work restartable and auditable. It applies the OpenAI Goals and ExecPlan pattern: success is evidence-based, not a plausible stopping point.

## Workflow

1. State the objective without narrowing it.
2. Define:
   - outcome,
   - verification surface,
   - constraints,
   - boundaries,
   - iteration policy,
   - blocked stop condition.
3. Split the work into phases with acceptance evidence for each phase.
4. Identify artifacts to update: goal file, canonical docs, memory, evals, plan, or runtime report.
5. Define what would disprove completion.
6. Keep progress and decisions file-backed when the task may span compaction.

## Input

- User objective or draft goal.
- Referenced plan, issue, source, or canonical docs.
- Current evidence of what already exists.

## Output

- Goal or ExecPlan text.
- Phase table with acceptance evidence.
- Completion audit checklist.
- Blocked-condition policy.
- Next concrete command or artifact to produce.

## Phase Boundary

This skill ends when a broad objective has a verifiable plan. It must not perform the implementation unless the user or active goal explicitly asks to continue into execution.

## When Not To Use

- Do not use for small single-file edits.
- Do not mark work complete because tests are green unless tests cover every requirement.
- Do not use budget exhaustion as completion.
- Do not describe `codex exec` as a continuous Goal conversation.

## Eval Case

`goal-execplan-contract`: A broad request must produce outcome, verification, constraints, boundaries, iteration policy, and blocked stop condition. A vague "make it work" plan must fail.
