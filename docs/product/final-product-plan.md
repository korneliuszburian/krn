---
id: krn-final-product-plan
kind: product-plan
status: active
owner: krn
updated: 2026-06-19
supersedes:
  - docs/goals/goal-005.md as the active product direction
sources:
  - AGENTS.md
  - CONTEXT.md
  - docs/memory/INDEX.md
  - docs/memory/product/2026-06-19--krn-naming-and-gas-town-codename.md
  - docs/plans/canonical/draft.md
  - docs/plans/canonical/pattern-matrix.md
  - docs/plans/canonical/SOURCES.md
  - docs/specs/technology-stack/decision.md
  - docs/skills/operator-pipeline.md
  - docs/evals/STANDARD.md
---

# KRN Final Product Plan

Naming rule: **KRN** is the product/tool name and `krn` is the CLI. **Gas Town** is the repo/codename for this build workspace, used knowingly as a reference to the Steve Yegge AI-agent orchestration discourse.

## Product Thesis

[DECISION] KRN is a TypeScript-first Codex operating memory, eval, and control plane. It is not a prompt pack, not a dashboard-first app, and not `krn init` as a tiny product.

The final product loop is:

```text
Codex work
  -> typed traces, source claims, memory proposals, eval reports
  -> human/dashboard review
  -> approved memory, skills, decisions, repair records
  -> better next Codex run
  -> measured baseline-vs-assisted improvement
```

The product is defensible only when it proves measurable reduction in repeated Codex failure modes:

- missed repo instructions,
- context rot after compaction,
- unsourced claims,
- overbroad implementation,
- semantic hook misuse,
- skill/prompt sprawl,
- green evals that do not predict review quality.

## Non-Negotiable Standards

- No PoC/MVP framing. The architecture is final-product shaped from the first implementation slice.
- Slice boundaries are dependency order, not product maturity labels.
- TypeScript-first product code on Node.js runtime.
- Every external input starts as `unknown` and is parsed before use.
- Every durable object has a parser, schema, valid fixture, known-bad fixture, and behavior test.
- Every generated proposal references source IDs or local evidence.
- Runtime artifacts stay under `.krn/`; reviewed knowledge moves into `docs/memory`.
- `AGENTS.md` stays small and routes to indexed docs.
- Skills are normalized workflows with trigger tests, not a bag of prompts.
- Hooks enforce deterministic lifecycle facts only; semantic review belongs in evals, CLI reports, or dashboard review.
- `codex exec` is a worker/eval lane, not a continuous `/goal` conversation.
- Dashboard reads real product objects only. It must never invent state from chat.
- Productivity claims require baseline Codex vs KRN-assisted Codex evidence.

## Product Layers

| Layer | Final responsibility | Primary artifacts | Proof |
|---|---|---|---|
| Operator skills | Build KRN with repeatable senior-engineering workflows. | `.agents/skills/**`, skill evals, impact reports. | Static contract eval plus A/B impact eval. |
| Product contracts | Own typed object model for all product surfaces. | `packages/contracts`, JSON Schemas, fixtures. | Typecheck, parser tests, known-bad failures. |
| CLI/runtime ledger | Produce and validate local project state. | `packages/cli`, `.krn/**`, `krn init/doctor/eval/review`. | No default target mutation, schema-backed reports. |
| Memory/source ledger | Store reviewed facts, claims, decisions, invalidation rules. | `docs/memory/**`, source claims, decisions. | Source-backed entries, stale/superseded states. |
| Eval/repair loop | Convert failures into regression cases and bounded repairs. | `packages/evals`, `docs/evals/**`, repair records. | Deterministic pass/fail plus stop reason. |
| Hooks/continuity | Preserve lifecycle state around compaction and enforce mechanical checks. | `.codex/hooks/**`, compact checkpoint objects. | Manual and auto compact evidence, no semantic hidden policy. |
| MCP/API gateway | Expose read-only and proposal-only product state to Codex/ChatGPT. | `packages/mcp`, typed resources/tools. | Allowlist, idempotency, approval-aware writes. |
| Dashboard | Human review/control plane over memory, sources, evals, goals, skills. | `apps/dashboard`, dashboard view models. | Every metric has owner, source, action, failure mode. |
| Benchmark | Prove or falsify useful lift. | repeatable tasks, baseline runs, assisted runs. | Lower repeated failure rate or explicit no-lift finding. |

## Realization Slices

### Slice 1: Operator Build System

Purpose: create the operating layer that will build the product correctly.

Deliverables:

- Final product goal replaces `goal-005` as active direction.
- Operator pipeline becomes complete enough for product implementation:
  - intake/router,
  - domain/grill interviewer,
  - research synthesis,
  - long-running goal/exec plan,
  - PRD/product requirement writer,
  - ADR writer,
  - issue/slice writer,
  - TypeScript contract engineer,
  - eval designer,
  - repair handoff,
  - reviewer/release verifier.
- Missing skills use the same normalized shape:
  - trigger description,
  - inputs,
  - workflow,
  - outputs,
  - phase boundary,
  - when-not-to-use,
  - eval case.
- Operator evals distinguish static contract quality from impact.
- Product docs stay minimal:
  - this plan,
  - active goal,
  - stack ADR,
  - memory index,
  - eval standard.

Acceptance evidence:

- Existing operator skill contract eval passes.
- New missing operator skills are covered by contract eval cases.
- At least one impact fixture exists for skill-assisted product planning vs baseline Codex.
- `goal-005` is marked superseded as active direction.

Disproves completion:

- New skills are broad prompt dumps.
- New docs duplicate the same product truth in multiple places.
- Product implementation starts before the operator pipeline can evaluate itself.

### Slice 2: Typed Runtime Spine

Purpose: build the final product foundation, not a throwaway bootstrap.

Deliverables:

- pnpm TypeScript workspace:
  - `packages/contracts`,
  - `packages/cli`,
  - `packages/evals`,
  - `packages/mcp` as contract-only or read-model-ready package if full MCP is not wired yet,
  - `apps/dashboard` only after typed dashboard view models exist.
- Product-spine schemas migrate into TypeScript parsers and exported JSON Schema.
- CLI commands:
  - `krn init --dry-run`,
  - `krn doctor`,
  - `krn eval`,
  - `krn review`.
- `krn init --dry-run` becomes the Slice 2 consumer of the old `goal-005` contract.
- Runtime reports are schema-backed and written under `.krn/`.
- Existing Python validators remain historical proof only; no new Python product foundation.
- Compact continuity is either kept as a legacy project hook or replaced by TypeScript tooling only after deterministic parity exists.

Acceptance evidence:

- `pnpm typecheck` passes.
- `pnpm test` passes.
- Valid fixtures pass and known-bad fixtures fail for meaningful reasons.
- `krn init --dry-run` does not mutate target files.
- `krn doctor` reports AGENTS/memory/skills/hooks/eval readiness.
- `krn eval` emits machine-readable reports.

Disproves completion:

- Product contracts exist only as docs.
- CLI output is prose-only.
- Dashboard/API/MCP code invents state instead of reading typed reports.
- Any new product code defaults to Python.

### Slice 3: Control Plane And Measured Lift

Purpose: expose the product loop to humans and other agents, then prove whether it works.

Deliverables:

- Read-only MCP/API gateway over:
  - project profile,
  - memory entries,
  - source claims,
  - decisions,
  - proposals,
  - eval runs,
  - repair attempts,
  - compact checkpoints,
  - skill impact reports.
- Proposal-only write tools:
  - propose memory,
  - propose source claim,
  - record repair attempt,
  - request eval,
  - publish dashboard event.
- Dashboard views:
  - Memory Core,
  - Pending Review,
  - Knowledge Gaps,
  - Source/Claim Ledger,
  - Eval Runs,
  - Skill Impact,
  - Goal/Continuity Health.
- Runtime/product skills operate through typed API/MCP contracts, not ad hoc markdown.
- ChatGPT reviewer bridge starts read-only/static, then uses the gateway only when docs and connector constraints are proven.
- Benchmark harness compares baseline Codex vs KRN-assisted Codex on real KRN tasks.

Acceptance evidence:

- Dashboard renders from generated product objects only.
- Every dashboard metric has owner, source, action, and failure mode.
- MCP/API resources are allowlisted and schema-backed.
- Proposal writes are append-only, idempotent, and reviewable.
- Benchmark report shows either measured lift or an explicit no-lift result with repair targets.

Disproves completion:

- Dashboard becomes a pretty transcript browser.
- MCP exposes destructive tools.
- Runtime skills bypass contracts.
- Improvement claims are made from anecdotes or one green demo.

## Long-Running Goal Policy

Every `/goal` for this product must include:

- outcome,
- verification surface,
- constraints,
- boundaries,
- iteration policy,
- blocked stop condition,
- current slice,
- next concrete evidence artifact,
- what would disprove completion.

A slice is complete only when its acceptance evidence exists. A later slice may start only when it consumes the prior slice's real artifacts.

## Current Direction

[DECISION] The next active execution contract is `docs/goals/goal-006.md`.

[DECISION] `docs/goals/goal-005.md` is no longer the active product direction. Its `krn init --dry-run` work becomes a Slice 2 runtime-spine task.
