---
id: technology-stack-decision
kind: architecture-decision
status: proposed
owner: krn
updated: 2026-06-19
sources:
  - CONTEXT.md
  - docs/adr/0001-typescript-first-product-stack.md
  - docs/product/final-product-plan.md
  - docs/goals/goal-006.md
  - docs/goals/goal-005.md
  - docs/plans/canonical/draft.md
  - docs/plans/canonical/pattern-matrix.md
  - docs/plans/canonical/SOURCES.md
  - docs/memory/github-research/2026-06-19--mattpocock-skills-operator-pipeline.md
  - docs/memory/github-research/2026-06-19--mattpocock-sandcastle.md
  - https://github.com/mattpocock/skills
  - https://github.com/mattpocock/dictionary-of-ai-coding
  - https://github.com/mattpocock/sandcastle
  - https://github.com/mattpocock/evalite
  - https://github.com/total-typescript/ts-reset
  - https://www.totaltypescript.com/ts-reset
---

# Technology Stack Decision

## Decision

[DECISION] KRN should be TypeScript-first for product code, with Node.js as the initial runtime and packaging lane.

This applies to the first real product implementation surfaces:

- `krn` CLI,
- product-spine contracts and runtime validation,
- future API/MCP gateway,
- future dashboard,
- future eval harness integration,
- future product/runtime skills that need typed tool contracts.

[DECISION] Do not continue `goal-005` implementation in Python. Existing Python validators are historical/local proof artifacts from the research phase. They can stay until replaced, but no new product foundation should be added in Python.

[DECISION] Do not treat `krn init --dry-run` as the whole next product direction. The next active execution contract is `goal-006`, and its first slice is the Operator Build System. `krn init --dry-run` moves into Slice 2 as the first runtime consumer of the TypeScript contracts.

This is not a "Node over TypeScript" decision. TypeScript is the product standard because KRN's core risk is contract correctness. Node.js is the practical runtime for the first CLI/API/dashboard path.

## Why TypeScript

KRN is not a numeric compute system. Its hardest problem is making agent-facing state safe, inspectable, and hard to misinterpret.

The dominant product objects are:

- JSON manifests,
- schemas,
- proposals,
- memory entries,
- source claims,
- eval runs,
- MCP resources/tools,
- dashboard view models,
- CLI reports.

Those objects must be consumed by both humans and agents. TypeScript is a better default than Python for this because the same typed contracts can drive the CLI, API/MCP layer, dashboard, tests, and evals.

The mechanism borrowed from Matt Pocock / Total TypeScript is not "use TypeScript because it is trendy". It is:

```text
runtime object -> strict type -> runtime validation -> behavior test -> eval/report -> reviewed decision
```

## Evidence

| Source | Observation | KRN implication |
|---|---|---|
| `mattpocock/skills` at `6eeb81b` | The useful unit is a normalized engineering pipeline, not a random skill pack. It has setup, issue tracker, domain docs, PRD/issues, TDD, codebase design, handoff, and invocation discipline. | KRN should encode stack work as a repeatable operator pipeline, not ad hoc prompts. |
| `mattpocock/dictionary-of-ai-coding` at `276e3e0` | The repo uses TypeScript tooling to generate a plain-English AI coding dictionary from source markdown. It emphasizes context, harnesses, progressive disclosure, specs, handoffs, and primary sources. | KRN should separate source artifacts from generated artifacts, keep vocabulary precise, and avoid context rot by design. |
| `mattpocock/sandcastle` at `fa13253` | TypeScript library/CLI with strict TS, NodeNext modules, Vitest tests, Zod, Effect, CLI binary, sandbox provider interfaces, logs, branch strategy, and commit capture. | KRN's later worker/sandbox layer fits naturally as typed interfaces and provider adapters. Do not import orchestration scope yet. |
| `mattpocock/evalite` at `e18a793` | TypeScript-native, local-first eval tool built on Vitest; eval files define datasets, tasks, scorers, variants, traces, and a UI. | KRN evals can later move from deterministic local scripts to `.eval.ts`-style workflows without changing the evidence-loop semantics. |
| `total-typescript/ts-reset` at `81b3b26` | Strict TypeScript package that changes unsafe built-ins such as `JSON.parse` and `fetch().json()` from `any` to `unknown`, with type-level tests and export-map checks. | KRN should treat unvalidated JSON as `unknown` until parsed, especially for manifests, tool inputs, MCP payloads, and eval reports. |
| Total TypeScript site, accessed 2026-06-19 | Public docs for TS Reset describe safer typings around JSON, fetch JSON, boolean filtering, and collection helpers. | Use TS Reset as a safety pattern for app/test layers, not automatically for published library boundaries. |

## Stack Recommendation

### Runtime and language

- TypeScript-first.
- Node.js LTS as the initial runtime.
- ESM by default.
- Strict TypeScript.
- No `any` at product boundaries.
- Treat all file, network, MCP, model, and CLI inputs as `unknown` until parsed.

### Package manager and repo shape

Use pnpm workspaces if/when product code starts.

Proposed shape:

```text
packages/
  contracts/       # product-spine types, schemas, parsers
  cli/             # krn CLI
  evals/           # deterministic eval runners, later Evalite-compatible cases
  mcp/             # future read-only MCP/API bridge

apps/
  dashboard/       # future dashboard after typed view models exist

.agents/
  skills/          # operator/build-time skills

docs/
  specs/
  goals/
  memory/
```

This keeps the first implementation small while leaving a clean path to dashboard/API/MCP.

### Contract validation

Use a single-source typed contract strategy:

```text
TypeScript type + runtime parser -> JSON Schema/exported manifest -> tests/evals
```

Candidate parser library: Zod.

Reason:

- TypeScript alone does not validate runtime JSON.
- Agents and external tools need machine-readable schema.
- The dashboard and MCP layer should read the same contract as the CLI.

Acceptance rule:

- every external object starts as `unknown`,
- every external object is parsed before use,
- every parser has a valid example and a known-bad fixture,
- every report includes an interpretation caveat where green output could be overclaimed.

### Testing

Use the Matt-style testing standard:

- behavior tests through public interfaces,
- vertical tracer-bullet slices,
- typecheck as a first-class gate,
- no broad horizontal test dumps,
- tests must catch the failure mode they claim to protect.

Candidate tools:

- `tsc --noEmit` for typecheck,
- Vitest for behavior tests,
- type-level tests for contract edge cases,
- deterministic local eval runner first,
- Evalite later for TypeScript-native LLM evals and trace UI if it proves useful.

### Formatting and release discipline

Use lightweight defaults:

- Prettier,
- package export-map checks when publishing packages,
- Changesets only after the repo has publishable packages.

Do not add heavy release machinery before there is a package boundary.

### Dashboard

Dashboard stays later, but the stack decision should not make it harder.

Preferred later dashboard stack:

- React + Vite or equivalent TypeScript-first app stack,
- typed view models from `packages/contracts`,
- no dashboard state invented from chat,
- all rows/cards sourced from product-spine objects or runtime reports.

This is intentionally a stack decision for the final product. `goal-005` is superseded as the active direction and remains only as Slice 2 `krn init --dry-run` context.

## Python Assessment

Python was useful for fast local validators during research.

It is a weak long-term product foundation for KRN because:

- CLI, dashboard, MCP/API, and eval UI would split across languages quickly.
- Runtime JSON safety would depend more on convention than shared typed contracts.
- It is easier for small scripts to become unowned one-off glue.
- It does not line up with the strongest inspected Matt/Total TypeScript patterns.

Python remains acceptable for:

- temporary migration scripts,
- one-off research tooling,
- existing validators until replaced,
- cases where a Python ecosystem dependency is clearly dominant.

Python should not be used for new product-spine consumers after this decision unless an ADR overrides it.

## Go / Rust Assessment

Go and Rust are stronger for raw CLI binary performance and deployment simplicity.

They are weaker fits right now because:

- KRN's highest-risk layer is contract correctness and agent-facing workflow design, not CPU performance.
- The future dashboard/API/MCP/eval surface would still need TypeScript.
- They increase the distance between product objects and UI/runtime eval code.
- They slow down early iteration while the object model is still moving.

Revisit Go/Rust only if:

- startup/runtime performance becomes measured pain,
- packaging a single native binary becomes a hard requirement,
- a sandbox/worker runtime needs stronger isolation/performance than Node can provide.

## Matt / Total TypeScript Standards To Adopt

### 1. Typed unknown-first boundaries

`ts-reset` changes unsafe built-ins so unknown data is actually `unknown`.

KRN rule:

- `JSON.parse`, `fetch().json()`, CLI file reads, MCP tool input, eval report loading, and model outputs are untrusted.
- Parse before use.
- No unchecked casts at boundaries.

Use `@total-typescript/ts-reset` only in app/test entrypoints unless a package-level ADR proves that global typing changes are safe for consumers.

### 2. Strict typecheck is a product gate

KRN rule:

- typecheck must run before claiming an implementation slice complete,
- `strict`, `noUncheckedIndexedAccess`, `noEmitOnError`, and export-map checks are preferred for product packages,
- type-level regressions get tests, not comments.

### 3. Deep modules and small interfaces

From Matt's `codebase-design` skill:

- module depth is leverage behind a small interface,
- tests should cross the same interface as callers,
- do not create seams until something varies.

KRN rule:

- `packages/contracts` should be a deep module: simple parse/serialize APIs over detailed object validation.
- CLI/dashboard/MCP should not each reimplement schema logic.

### 4. Vertical slices

From `to-issues` and `tdd`:

- slice through behavior end to end,
- one test and one implementation increment at a time,
- avoid horizontal "all schemas then all CLI then all UI" work.

KRN rule:

- realization slices are dependency order, not MVP/v1/v2 stages,
- Slice 1 builds the operator layer that will execute and evaluate product work,
- Slice 2 builds typed runtime contracts and makes `krn init --dry-run` the first CLI consumer,
- Slice 3 exposes MCP/API/dashboard and benchmark lift over real product objects.

### 5. Grilling and domain docs before large build

From `grill-with-docs`, `domain-modeling`, and `CONTEXT.md`:

- resolve vocabulary early,
- write domain terms as glossary, not implementation spec,
- write ADRs only for hard-to-reverse, surprising, real tradeoffs.

KRN rule:

- create KRN `CONTEXT.md` before broad TypeScript implementation,
- create ADR only for the stack decision and future hard-to-reverse choices,
- do not turn every preference into an ADR.

### 6. Skill invocation discipline

From `writing-great-skills` and `docs/invocation.md`:

- user-invoked orchestration skills should not pollute model context,
- model-invoked skills need precise trigger descriptions,
- split only when a leading word or phase boundary earns the load,
- prune no-op rules and sediment.

KRN rule:

- create a TypeScript-specific operator skill only after this stack decision lands,
- make it model-invoked only if Codex should autonomously use it during TypeScript implementation,
- otherwise make it user-invoked or keep it as a checklist in this spec.

## Proposed TypeScript Operator Skill

Added as the first stack-specific operator skill:

```text
.agents/skills/typescript-contract-engineer/
  SKILL.md
  references/
    total-typescript-standards.md
```

Purpose:

```text
Use when implementing or reviewing KRN TypeScript contract, CLI, API/MCP, eval, or dashboard code.
```

It should enforce only Matt/Total TypeScript-derived standards:

- unknown-first boundaries,
- strict typecheck,
- public-interface behavior tests,
- deep modules,
- vertical tracer-bullet implementation,
- no unchecked `any`,
- parser before use,
- app-only `ts-reset` unless ADR says otherwise.

Do not let this skill become a huge TypeScript bible. It must stay short and backed by source notes.

Current gate: static contract only. It needs an impact eval after the first real TypeScript implementation fixture exists.

## P0 Acceptance Gate

Before product implementation starts, the repo must satisfy:

- this decision file exists,
- `goal-006` is the active final-product execution contract,
- `goal-005` is marked superseded as the active direction and preserved as Slice 2 context,
- the final product plan names TypeScript-first on Node.js runtime as the stack,
- existing Python validators are classified as legacy/local proof artifacts,
- a follow-up migration path exists for product-spine validators,
- no dashboard/API/MCP implementation starts before typed product objects exist.

## Follow-Up Implementation Shape

After Slice 1 acceptance, Slice 2 should implement the TypeScript workspace around:

```text
package.json
pnpm-workspace.yaml
tsconfig.base.json
packages/contracts/
packages/cli/
packages/evals/
```

The first vertical slice should be:

```text
contracts: init manifest parser
cli: krn init --dry-run
eval/test: valid example + known-bad fixture
docs: memory note + source/claim update
```

Existing Python validators should not block the first TypeScript slice, but they should not grow further.

## Rejected Alternatives

| Alternative | Why rejected now |
|---|---|
| Python product stack | Good for scripts, weaker for shared CLI/API/dashboard/eval typed contracts and long-term app cohesion. |
| Go product stack | Strong runtime packaging, weaker early iteration and dashboard/eval ecosystem fit. |
| Rust product stack | Strong correctness/performance, too much implementation drag before KRN's object model stabilizes. |
| Dashboard-first TypeScript app | Violates current product rule; dashboard must read real objects after CLI/API contracts exist. |
| Mixed Python CLI + TypeScript dashboard now | Creates two product foundations before the first contract consumer is proven. |

## Review Trigger

Revisit this decision after:

- Slice 1 operator build system passes static and impact eval gates,
- first TypeScript `krn init --dry-run` slice ships,
- first read-only API/MCP prototype starts,
- dashboard implementation begins,
- measured CLI/runtime performance becomes a problem,
- existing Python validators become maintenance drag.
