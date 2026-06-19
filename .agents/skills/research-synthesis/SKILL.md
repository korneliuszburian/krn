---
name: research-synthesis
description: Convert sources into KRN-ready engineering knowledge. Use when inspecting OpenAI docs, Cookbook examples, papers, GitHub repos, practitioner workflows, or existing plan drafts that must become source-backed patterns, claims, evals, memory notes, or canonical decisions.
---

# Research Synthesis

## Overview

Use this skill to turn source material into durable KRN knowledge. The output is not a summary; it is a mechanism-level mapping that can change memory, evals, plans, or product decisions.

## Workflow

1. Identify source tier: official/spec/paper/repo, reproducible example, practitioner writing, or discovery-only signal.
2. Extract only claims that affect KRN behavior.
3. For each claim, write:
   - observation,
   - extracted mechanism,
   - KRN implication,
   - eval or falsification,
   - failure mode,
   - source IDs or direct links.
4. Separate `[FACT]`, `[INFERENCE]`, `[HYPOTHESIS]`, `[DECISION]`, and `[BLOCKED]`.
5. Update `docs/memory/INDEX.md` when creating a memory note.
6. Update canonical docs when a decision or source ledger changes.

## Input

- Source URLs, local cloned repos, papers, docs, or existing KRN plans.
- Current `docs/plans/canonical/SOURCES.md` when changing source IDs.
- Relevant memory notes from `docs/memory/INDEX.md`.

## Output

- Source-backed memory note, source ledger update, claim ledger update, or canonical decision update.
- Explicit rejected alternatives when choosing a pattern.
- Eval or falsification path for any adopted pattern.
- Review trigger for future invalidation.

## Phase Boundary

This skill ends when source material is transformed into reviewable KRN artifacts. It must not implement product code, runtime skills, API schemas, or dashboard UI.

## When Not To Use

- Do not use to store links without extracting mechanisms.
- Do not use for current Codex behavior without checking official OpenAI docs first.
- Do not use social signal, stars, or rankings as proof.
- Do not promote runtime output into memory without source and failure mode.

## Eval Case

`research-synthesis-contract`: A bad answer that only lists source titles or star counts must fail. A passing answer must include mechanism, KRN implication, eval/falsification, and failure mode.
