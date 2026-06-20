---
name: long-researcher
description: Run bounded long-form KRN research over external sources, local source-bank repos, papers, practitioner workflows, and existing memory when a question needs more than a quick source lookup. Use when the user asks for best engineering patterns, agent harness methodology, senior workflow synthesis, paper-backed decisions, or a deep comparison before changing KRN skills, memory, architecture, or labs.
---

# Long Researcher

## Overview

Use this skill when quick browsing is not enough. The output is a research pack that can later become memory, ADRs, skill changes, or product slices. Do not turn a few links into a conclusion.

## Workflow

1. State the research question and the KRN decision it should inform.
2. Define the source universe:
   - local source bank under `.krn/source-bank/repos/**`,
   - `docs/source-bank/MANIFEST.md`,
   - indexed `docs/memory/**`,
   - primary papers/repos/docs,
   - practitioner material only after mechanism extraction.
3. Set a source budget before researching:
   - quick: 5-8 sources,
   - standard: 10-20 sources,
   - deep: 20+ sources or multiple passes.
4. Extract mechanisms, not opinions:
   - pattern,
   - where it works,
   - where it fails,
   - evidence strength,
   - KRN transfer,
   - verification surface.
5. Compare contradictions and rejected alternatives.
6. Produce a research pack using `references/research-pack-template.md`.
7. Promote to `docs/memory/**`, `docs/plans/canonical/SOURCES.md`, an ADR, or skill changes only after the pack names a durable KRN implication.

## Guardrails

- No hype-only sources as proof.
- No stars/rankings as evidence without mechanism.
- No raw transcript or source dump in memory.
- No product claims without verification path.
- No heavy lab unless the research question has one hypothesis, one metric, and a keep/discard rule.

## Input

Require either:

- a concrete research question plus the KRN decision it should inform, or
- a broad user concern that can be restated into one concrete research question before source work begins.

Before researching, name the selected source budget (`quick`, `standard`, or `deep`), the stop condition, and any source classes that are intentionally out of scope.

## Output

- Research pack path or concise pack content.
- Source list with tier and access date.
- Mechanism matrix.
- KRN decisions, rejected alternatives, and next slice.
- Promotion targets and stop condition.

## Phase Boundary

This skill ends at a research pack or promoted memory/decision. It does not implement product code unless a separate implementation skill/goal is selected after synthesis.

## When Not To Use

- Do not use for tiny code edits.
- Do not use when one official doc lookup answers the question.
- Do not use to browse indefinitely.
- Do not use as a substitute for a product slice after the decision is already clear.

## Eval Case

`long-researcher-contract`: Given a broad request such as "find the best agent harness patterns for KRN", the skill must restate the decision, define a source universe and source budget, extract mechanisms with contradictions and KRN transfer, name rejected alternatives, and stop with either a research pack or promoted memory/decision targets.
