---
name: issue-slice-writer
description: Turn KRN final-product work into bounded dependency-ordered slices. Use when a goal or requirement needs implementation issues with acceptance evidence, disproving checks, and no MVP/v1/v2 drift.
---

# Issue Slice Writer

## Overview

Use this skill to convert final-product plans into actionable implementation slices. A slice is not an MVP stage; it is dependency-ordered work that must preserve final standards from the start.

## Workflow

1. Read the active goal, product requirement, and final-product plan.
2. Identify the current slice and the artifact it must produce next.
3. Split work only where each issue has a clear public interface and acceptance evidence.
4. For each issue, define expected output, validation command, dependencies, and disproves completion.
5. Keep implementation order vertical: contract, parser/schema, consumer, behavior test/eval, runtime artifact, memory/plan update.
6. Mark blocked dependencies instead of inventing scope.

## Input

- Active KRN goal or product requirement.
- Current product layer and dependencies.
- Existing tests/evals and validation commands.

## Output

- Agent-ready issue/slice list.
- Acceptance evidence for each slice.
- Dependency order and blocked items.
- Explicit no-go areas such as dashboard/API/MCP before typed objects.

## Phase Boundary

This skill ends when an implementer can execute the next slice without choosing architecture or scope.

It does not implement code, create PRDs, or rewrite the final-product plan.

## When Not To Use

- Do not use before product intent is clear.
- Do not split work by files when behavior boundaries are clearer.
- Do not create MVP/v1/v2 language.
- Do not create issues without validation commands or disproving checks.

## Eval Case

`issue-slice-writer-contract`: A KRN goal must become dependency-ordered slices with acceptance evidence, validation commands, disproves completion, and no MVP/v1/v2 framing.

