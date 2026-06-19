---
name: release-verifier
description: Verify KRN slice completion against evidence. Use when claiming a goal, slice, skill, eval, contract, dashboard, or runtime change is done, especially when acceptance evidence or residual risk matters.
---

# Release Verifier

## Overview

Use this skill before closing KRN work. It checks whether the claimed outcome is backed by acceptance evidence, validation commands, source updates, and honest residual risk.

## Workflow

1. Read the active goal, final-product plan, and relevant requirement or issue slice.
2. List required acceptance evidence and validation commands.
3. Compare actual artifacts against the claim.
4. Call out missing evidence, failed checks, stale docs, residual risk, and unsupported productivity claims.
5. Separate completed work from next actions.
6. Recommend complete, refine, repair handoff, or blocked status.

## Input

- Claimed completed KRN work.
- Active goal, slice, requirement, eval report, or runtime artifact.
- Validation command output or report paths.

## Output

- Completion audit with evidence.
- Missing evidence and residual risk.
- Recommendation: complete, refine, repair, or blocked.
- Any required memory, source, or goal update.

## Phase Boundary

This skill ends when the closeout decision is evidence-backed and the remaining work is explicit.

It does not fix the issues it finds; use `repair-handoff` or an implementation skill for that.

## When Not To Use

- Do not use as a substitute for running tests or evals.
- Do not mark productivity lift from one green run.
- Do not hide missing validation behind summaries.
- Do not approve dashboard/API/MCP work that reads mocked state as product proof.

## Eval Case

`release-verifier-contract`: A KRN completion claim must be checked against acceptance evidence, validation commands, residual risk, unsupported productivity claims, and a complete/refine/repair/blocked recommendation.
