---
name: domain-grill-interviewer
description: Clarify KRN product language and unresolved tradeoffs. Use when a broad KRN product, dashboard, API, skill, or architecture task has ambiguous terms, hidden assumptions, or unclear acceptance standards.
---

# Domain Grill Interviewer

## Overview

Use this skill before large KRN product work when vague language would cause drift. The goal is not to brainstorm endlessly; it is to expose domain terms, acceptance standards, sharp tradeoffs, and decisions that must be locked before implementation.

## Workflow

1. Read `CONTEXT.md`, the active goal, and `docs/product/final-product-plan.md`.
2. Extract unclear domain terms, conflicting names, missing owners, and claims without evidence.
3. Separate discoverable repo facts from user/product preferences.
4. Ask only questions that materially change the spec, acceptance evidence, or slice boundary.
5. Convert resolved answers into glossary updates, product-plan constraints, ADR candidates, or issue-slice inputs.
6. Mark unresolved items as assumptions or blockers; do not hide confusion.

## Input

- Broad KRN product request, goal, review, or architecture decision.
- Current glossary, final-product plan, and relevant memory notes.
- User answers when a preference cannot be inferred from repo state.

## Output

- Locked vocabulary and naming decisions.
- Explicit assumptions, blockers, and sharp tradeoffs.
- Acceptance standards that later requirement work can consume.
- Update targets for `CONTEXT.md`, memory, ADRs, or the active goal.

## Phase Boundary

This skill ends when ambiguous product language is either resolved, converted into a named assumption, or escalated as a blocker.

It does not write the PRD, create issues, implement code, or choose a stack by itself.

## When Not To Use

- Do not use for small implementation tasks with clear contracts.
- Do not use to reopen settled decisions without new evidence.
- Do not use for pure source synthesis; use `research-synthesis`.
- Do not use to ask questions that repo inspection can answer.

## Eval Case

`domain-grill-interviewer-contract`: A broad KRN request with ambiguous naming must identify domain terms, acceptance standards, sharp tradeoffs, assumptions, and whether a glossary/goal/ADR update is required.

