---
id: krn-final-product-plan
kind: product-plan
status: active
owner: krn
updated: 2026-06-20
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
  - docs/goals/goal-009.md
  - docs/goals/goal-010.md
  - docs/goals/goal-011.md
  - docs/goals/goal-012.md
  - docs/goals/goal-013.md
  - docs/goals/goal-014.md
  - docs/goals/goal-015.md
  - docs/goals/goal-016.md
  - docs/goals/goal-017.md
  - docs/goals/goal-018.md
  - docs/goals/goal-019.md
  - docs/goals/goal-020.md
  - docs/goals/goal-021.md
  - docs/goals/goal-022.md
  - docs/goals/goal-023.md
  - docs/goals/goal-024.md
  - docs/goals/goal-025.md
  - docs/goals/goal-026.md
  - docs/goals/goal-027.md
  - docs/goals/goal-028.md
  - docs/goals/goal-029.md
  - docs/goals/goal-030.md
  - docs/goals/goal-031.md
  - docs/goals/goal-032.md
  - docs/goals/goal-033.md
  - docs/memory/evals/2026-06-20--coding-quality-rubric.md
  - docs/memory/product/2026-06-20--krn-benchmark-arena-contract.md
  - docs/memory/product/2026-06-20--krn-benchmark-expanded-arena-registry.md
  - docs/memory/product/2026-06-20--krn-benchmark-expanded-arena-fixture-scoring.md
  - docs/memory/product/2026-06-20--krn-benchmark-expanded-arena-live-runner.md
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
| MCP/API gateway | Expose read-only and proposal-only product state to Codex and local review tools first. | `packages/mcp`, typed resources/tools. | Allowlist, idempotency, approval-aware writes. |
| Dashboard | Human review/control plane over memory, sources, evals, goals, skills. | `apps/dashboard`, dashboard view models. | Every metric has owner, source, action, failure mode. |
| Benchmark | Prove or falsify useful lift. | repeatable tasks, baseline runs, assisted runs, `KrnBenchmarkReport`. | Lower repeated failure rate or explicit no-lift finding from a suite above the lift gate. |

## Target Operating Architecture

[DECISION] KRN's core architecture is a local Codex operating loop. ChatGPT or external reviewer bridges are optional later review channels, not the current product core.

The intended wiring is:

```text
repo + task
  -> AGENTS.md + docs/memory/INDEX.md select current truth
  -> operator skills choose workflow and required research/plan checkpoint
  -> krn CLI creates typed local runtime reports under .krn/
  -> contracts parse every external object before use
  -> evals test behavior and failure modes
  -> MCP proposal tool records source-backed append-only review input in the proposal store
  -> Pending Review view model renders proposal-store records for human review
  -> apps/dashboard renders the Pending Review queue from generated typed dashboard data
  -> proposal review decision ledger records terminal review state
  -> proposal promotion workflow records and can explicitly apply exact approved memory payloads
  -> Promotion Review dashboard renders promotion-store audit state without command writes
  -> Eval Runs dashboard renders aggregate eval health without lift or command claims
  -> Benchmark report spine records no-lift-gated benchmark evidence
  -> live benchmark pilot records one baseline-vs-assisted codex exec task below the lift gate
  -> Benchmark Reports dashboard renders parsed benchmark reports without run/repair/write commands
  -> expanded benchmark suite validates fixed multi-task baseline-vs-assisted tasks and keeps live mode explicit
  -> no-lift benchmark evidence becomes a typed repair record before tuning prompts, skills, memory, or suite tasks
  -> first repair attempt measures before/after delta and records worse/no-lift outcomes without claiming lift
  -> assisted prompt-load repair uses task-owned source refs and records stabilized/no-lift outcomes without claiming lift
  -> memory-layer next-action repair preserves source-backed memory/control/eval routing while exposing baseline timeout instability
  -> benchmark lift-status gate rejects dirty positive live deltas before suite expansion
  -> live-suite registry policy gate exposes current child context and sequential timeout policy as typed validation data
  -> live stability readiness gate blocks suite expansion while live evidence is dirty or only one-off clean
  -> live-runner stability repair makes the latest explicit three-task live report clean but still below repeated-clean expansion and lift gates
  -> repeat-clean live stability unlocks suite-expansion review without claiming lift
  -> benchmark arena contract fixes the 20-task lift gate, explicit live boundary, pipeline ergonomics, task mix, and coding-quality rubric before expansion implementation
  -> expanded benchmark arena registry stores 20 source-backed coding-agent tasks with explicit live boundary and rubric coverage
  -> expanded benchmark arena fixture scoring emits a no-lift `KrnBenchmarkReport` for all 20 tasks
  -> later expanded benchmark runner measures coding quality: assumptions, simplicity, surgical diffs, verification, and review burden
  -> later broader promotion writes source/decision/repair records
  -> next Codex run consumes reviewed repo truth
  -> benchmark compares baseline vs KRN-assisted behavior
```

Layer responsibilities:

- `AGENTS.md` routes attention only. It must stay small.
- `.agents/skills` contains build-time workflows. Skills do not become truth by themselves; they route work into contracts, evals, proposals, or reviewed docs.
- `packages/contracts` owns durable schemas and parsers. Consumers must not reimplement validation.
- `packages/cli` is the local runtime ledger. Commands emit schema-backed reports and default to no target mutation.
- `packages/evals` turns patterns and failures into deterministic gates before dashboard/API claims.
- `packages/mcp` exposes the control plane: read-only resources first, proposal-only append-only writes second, destructive tools never by default.
- `.krn/` stores runtime artifacts. Reviewed knowledge moves into `docs/memory`, `docs/plans/canonical/SOURCES.md`, ADRs, or goal files.
- `apps/dashboard` comes after view models and proposal records. It renders Pending Review, Promotion Review, and Eval Runs surfaces from generated typed dashboard data and keeps generated data out of durable truth.
- `.krn/proposal-reviews` stores append-only terminal proposal review decisions. These decisions can close the Pending Review queue but do not promote memory/source/goal files by themselves.
- `.krn/promotions` stores append-only promotion records. The first promotion workflow supports exact `memory_update` payloads only and can write target content only in explicit apply mode after an approved review decision.
- `KrnDashboardData` is the multi-view dashboard envelope. It currently contains Pending Review, Promotion Review, Eval Runs, and Benchmark Reports view models, all parsed from real product objects rather than chat or mock state.

## Codex Paradoxes KRN Must Resolve

[DECISION] KRN exists because Codex has useful but conflicting operating forces. The product must resolve these with architecture, not with bigger prompts.

| Codex paradox | KRN resolution | Proof surface |
|---|---|---|
| More context helps, but too much context poisons the run. | Progressive disclosure: `AGENTS.md` routes to memory index, active goal, canonical plan, and only relevant notes. | Memory compliance evals and goal read-order checks. |
| Memory improves continuity, but stale memory creates confident wrongness. | Reviewed memory with source refs, failure mode, and review trigger; runtime artifacts stay under `.krn/` until promoted. | `docs/memory/**`, `docs/plans/canonical/SOURCES.md`, memory compliance eval. |
| Long-running agents need persistence, but autonomy drifts. | Goal files, compact checkpoints, runtime reports, and bounded blocked conditions. | `docs/goals/**`, `.krn/compact/**`, `krn eval`. |
| Tools make agents powerful, but writes are dangerous. | Read-only MCP resources first; proposal-only, append-only, idempotent writes second; destructive tools out by default. | `packages/mcp`, proposal store tests/evals. |
| Green tests are useful, but green tests are not product lift. | Deterministic evals gate contracts; benchmark harness later measures baseline vs assisted behavior. | `.krn/evals/**`, future benchmark report. |
| Skills can improve work, but skill packs become prompt sprawl. | Repo-local operator skills with trigger/phase/eval contracts; impact must be measured before productivity claims. | operator skill contract and impact evals. |
| Dashboards improve review, but dashboards easily become vanity analytics. | Dashboard reads typed product objects only; every metric needs owner, source, action, and failure mode. | dashboard view models and future dashboard evals. |
| Research patterns are valuable, but cargo-culting papers creates slop. | Research/plan checkpoint before non-trivial slices: source-backed mechanism selection, rejected alternatives, falsification path. | active goal, source ledger, eval/repair record. |

## Memory Layers

[DECISION] KRN memory is layered. No single memory layer is allowed to become the whole product truth.

| Layer | Role | Storage | Promotion rule | Failure mode |
|---|---|---|---|---|
| Attention router | Tells Codex what to read first. | `AGENTS.md`, `docs/memory/INDEX.md` | Keep small; link to deeper docs. | Root prompt bloat. |
| Active execution state | Keeps long-running work restartable. | `docs/goals/*.md`, compact checkpoints | Update when work changes phase or evidence. | Goal drift or stale completion claims. |
| Runtime evidence | Stores generated local facts from commands/evals. | `.krn/**` | Do not treat as durable truth until reviewed. | Snapshot/artifact slop. |
| Source and claim ledger | Connects papers, Cookbook, repos, docs, and claims. | `docs/plans/canonical/SOURCES.md` | Add source IDs and risk before using as decision evidence. | Bibliography without mechanism. |
| Reviewed durable memory | Stores condensed patterns and decisions. | `docs/memory/**`, ADRs | Must include source, useful pattern, implication, failure mode, review trigger. | Stale hidden truth. |
| Typed product memory | Makes memory/evals/proposals consumable by tools. | `packages/contracts`, JSON Schemas, fixtures | Every external object parses before use. | CLI/MCP/dashboard each invents state. |
| Review/control surface | Lets humans approve, reject, repair, or route proposals. | proposal store, future dashboard | Read real objects only; write proposals only. | Pretty UI over unreviewed state. |
| Measured learning | Proves whether KRN actually helps. | benchmark reports, skill impact reports | Claim lift only from baseline-vs-assisted evidence. | Anecdotes sold as breakthrough. |

## Research/Plan Checkpoint

[DECISION] Any non-trivial implementation slice must pass a lightweight research/plan checkpoint before code starts.

The checkpoint must name:

- product layer being changed,
- source IDs, claim IDs, papers, Cookbook entries, inspected repos, or local evidence used,
- selected mechanism, not just a best-practice label,
- rejected alternatives and why,
- required repo-local skills,
- contract or runtime surface being changed,
- eval, test, benchmark, or falsification path,
- failure mode and overclaim boundary.

This is the way KRN uses "best patterns": source-backed mechanism selection first, then a small implementation slice with a falsification path. It should not become a ceremony document for tiny mechanical edits.

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
  - Benchmark Reports,
  - Skill Impact,
  - Goal/Continuity Health.
- Runtime/product skills operate through typed API/MCP contracts, not ad hoc markdown.
- ChatGPT reviewer bridge is deferred and optional. It may become a read-only external reviewer only after the local Codex/KRN loop proves useful.
- Benchmark harness compares baseline Codex vs KRN-assisted Codex on real KRN tasks.
- The current benchmark report spine, live pilot, Benchmark Reports dashboard surface, expanded live suite, lift-status gate, live-suite registry policy gate, live stability readiness gate, live-runner stability repair, repeat-clean stability slice, benchmark arena contract, expanded arena task registry, expanded arena fixture scoring, and expanded arena live-runner contract prove the typed report path, no-lift gate, explicit live `codex exec` measurement path, read-only review of no-lift/negative-delta benchmark evidence, fixed three-task suite harness, deterministic stale-context/runner-policy protection, deterministic classification of dirty versus repeated-clean live evidence, one clean latest explicit live run after typed output-capture/baseline-scope repair, repeated clean small-suite evidence for suite-expansion review, deterministic contract readiness for a larger arena, a source-backed 20-task registry, deterministic fixture scoring/report generation for all 20 tasks, and isolated smoke/full runner mechanics for expanded-arena workers. Measured lift remains future work until the expanded live runner completes useful tasks cleanly and a larger suite satisfies the lift gate with positive live evidence. The next benchmark repair should target worker prompt/budget ergonomics because the first expanded-arena live-smoke produced valid evidence files but completed 0/1 selected tasks.

Acceptance evidence:

- Dashboard renders from generated product objects only.
- Every dashboard metric has owner, source, action, and failure mode.
- MCP/API resources are allowlisted and schema-backed.
- Proposal writes are append-only, idempotent, and reviewable.
- Benchmark report shows either measured lift or an explicit no-lift result with repair targets; one-task pilots and three-task suites remain below the lift gate.

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
