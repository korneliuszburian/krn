---
name: typescript-contract-engineer
description: Guide KRN TypeScript implementation work. Use when adding or reviewing TypeScript contracts, parsers, CLI commands, eval runners, MCP/API resources, dashboard view models, package boundaries, or type-safety gates after the stack decision.
---

# TypeScript Contract Engineer

## Overview

Use this skill when KRN work touches TypeScript product code. It applies the local stack decision and the Matt Pocock / Total TypeScript standards without turning them into ceremony.

The default stance is: typed contracts first, runtime parsers at every boundary, behavior tests through public interfaces, and one vertical slice at a time.

For detailed rules, read [references/total-typescript-standards.md](references/total-typescript-standards.md) when the task needs implementation or review detail.

## Workflow

1. Read the active goal and [docs/specs/technology-stack/decision.md](../../../docs/specs/technology-stack/decision.md).
2. Identify the public interface being changed: contract parser, CLI command, eval runner, MCP/API resource, or dashboard view model.
3. Treat external input as `unknown` until parsed: file JSON, CLI args, MCP tool input, model output, eval reports, and network responses.
4. Build one vertical slice: contract, parser, command or consumer, behavior test, known-bad case, and docs/eval update.
5. Run typecheck and the narrowest relevant test before broad tests.
6. Reject unchecked `any`, broad casts, duplicated schema logic, and implementation-detail tests.
7. Record any hard-to-reverse tradeoff as an ADR or stack-decision update, not as scattered comments.

## Input

- Active KRN goal or issue.
- Existing contract/spec files.
- TypeScript package, CLI, eval, MCP/API, or dashboard code.
- Relevant memory note or stack decision.

## Output

- TypeScript implementation or review plan tied to one public interface.
- Runtime parser or validation path for every external input touched.
- Behavior test and known-bad fixture when the change affects contracts.
- Typecheck/test command evidence.
- Explicit non-actions when dashboard/API/runtime scope would exceed the active goal.

## Phase Boundary

This skill ends when the TypeScript slice has a typed public interface, runtime parser, behavior verification path, and clear next action.

It does not design the whole app, introduce broad frameworks, migrate all Python validators at once, or build dashboard/API/MCP surfaces outside the active goal.

## When Not To Use

- Do not use for docs-only research unless TypeScript stack rules are being changed.
- Do not use before the stack decision is accepted.
- Do not use to justify clever type machinery without runtime validation.
- Do not use for Python legacy validators except to plan a bounded migration.
- Do not use for dashboard UI until a real object consumer exists.

## Eval Case

`typescript-contract-engineer-contract`: A TypeScript slice proposal must name the public interface, unknown-first boundary, runtime parser, behavior test or known-bad fixture, typecheck command, and out-of-scope surfaces.
