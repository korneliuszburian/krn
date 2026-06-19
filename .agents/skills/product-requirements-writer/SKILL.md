---
name: product-requirements-writer
description: Convert settled KRN product intent into a compact product requirement. Use when a final-product slice needs success criteria, user value, non-goals, interfaces, and acceptance evidence before implementation.
---

# Product Requirements Writer

## Overview

Use this skill after domain terms are clear and before implementation slices become code. It turns KRN intent into a compact product requirement tied to the final-product plan, not an MVP/v1/v2 roadmap.

## Workflow

1. Read the active goal, `docs/product/final-product-plan.md`, `CONTEXT.md`, and relevant memory notes.
2. State the user/job, product value, current problem, and final-product slice being served.
3. Define success criteria, non-goals, public interfaces, data objects, and acceptance evidence.
4. Link each major claim to a source, local artifact, or `[HYPOTHESIS]`.
5. Call out what would disprove completion.
6. Keep the product requirement short enough to guide implementation without duplicating canonical docs.

## Input

- Active KRN goal or proposed slice.
- Clarified domain terms and tradeoffs.
- Source-backed product decisions and constraints.

## Output

- Compact product requirement for one final-product slice.
- Success criteria and non-goals.
- Public interface/data object expectations.
- Acceptance evidence and validation commands.
- Explicit assumptions and unresolved blockers.

## Phase Boundary

This skill ends when the requirement is precise enough for `issue-slice-writer` or `goal-execplan`.

It does not implement the slice, generate broad architecture, or create dashboard/API work before typed objects exist.

## When Not To Use

- Do not use when the user is still deciding product language or naming; use `domain-grill-interviewer`.
- Do not use for a tiny bugfix.
- Do not create PRD theatre for work that can be expressed as one issue.
- Do not introduce MVP/v1/v2 staging.

## Eval Case

`product-requirements-writer-contract`: A KRN slice request must produce a product requirement with final-product plan alignment, success criteria, non-goals, public interfaces, and acceptance evidence.

