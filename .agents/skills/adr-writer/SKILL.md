---
name: adr-writer
description: Record hard-to-reverse KRN architecture and product decisions. Use when implementation would otherwise hide a meaningful tradeoff, rejected alternatives, decision rationale, or review trigger.
---

# ADR Writer

## Overview

Use this skill for decisions that are hard to reverse, surprising, or likely to be rediscovered by future agents. KRN ADRs should be short decision records, not essays or preference dumps.

## Workflow

1. Confirm the decision is durable enough for an ADR; otherwise use memory or the active goal.
2. Read current ADRs, the active goal, final-product plan, and source ledger.
3. State context, decision, consequences, rejected alternatives, and review trigger.
4. Label facts, inferences, hypotheses, and decisions when claims matter.
5. Update the source/claim ledger or memory index if the ADR changes product truth.
6. Avoid duplicating long rationale already present in canonical docs.

## Input

- Proposed architecture/product decision.
- Evidence, alternatives, constraints, and affected product layers.
- Existing ADRs or memory notes.

## Output

- One concise ADR or a recommendation not to create one.
- Decision rationale with rejected alternatives.
- Consequences and review trigger.
- Source or memory update targets when needed.

## Phase Boundary

This skill ends when the decision is recorded or explicitly rejected as not ADR-worthy.

It does not implement the decision, write product requirements, or replace source synthesis.

## When Not To Use

- Do not use for small reversible choices.
- Do not create an ADR for every preference.
- Do not use without evidence or a real tradeoff.
- Do not duplicate `docs/product/final-product-plan.md`.

## Eval Case

`adr-writer-contract`: A hard-to-reverse KRN stack or API choice must produce a decision record with decision, rejected alternatives, consequences, and review trigger.

