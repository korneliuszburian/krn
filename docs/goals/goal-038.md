# Goal 038: KRN Final Product Endgame

## Status

Active final execution contract.

This goal supersedes `goal-006` and `goal-037` as the default execution contract while preserving them as evidence:

- `goal-006` remains historical parent/product-build evidence.
- `goal-037` remains the engineering-kernel reset evidence.
- This file is the current final-product goal to resume from after compaction.

## Objective

Build KRN to the final polished product state as fast as possible without creating slop.

This is not an MVP, not v0.01, not a demo track, and not a rewrite. It is one final-product goal executed through dependency-ordered vertical slices until the product is complete.

There is no fixed time budget and no fixed token budget for the goal. That increases, not lowers, the quality bar: the goal may continue across context windows, but every continuation must preserve evidence, avoid duplication, and pass the simplify/condense cadence.

KRN's final product identity:

```text
Codex executes.
KRN supplies context, memory, sources, policy, skills, eval expectations,
traceability, review gates, feedback, API sync, and decision surfaces.
```

Target product:

```text
krn init turns any repo into an agent-ready, source-grounded,
memory-aware, eval-driven, reviewable Codex CLI working environment.
```

## Source Of Truth

Before executing or resuming this goal, read only:

1. `AGENTS.md`
2. `docs/plans/canonical/draft.md`
3. `docs/goals/goal-038.md`
4. `.krn/compact/latest-postcompact.md` and `.krn/compact/latest-checkpoint.md` if present
5. `git status -sb`

Load older goals, memory notes, source ledgers, ADRs, or benchmark reports only when a task names them, changed files point to them, or the current slice needs exact evidence.

## Canonical Resume Prompt

Use this prompt when resuming the final-product goal:

```text
Resume docs/goals/goal-038.md.

Use docs/plans/canonical/draft.md as the canonical final-product blueprint.

This is not MVP/v0/prototype work. Execute the final KRN product goal through
dependency-ordered, final-shaped slices until the product is complete.

Newest user message wins. Treat shorthand such as "simplify", "condense",
"senior", "Karpathy-small", "anti-slop", "memory core", "hardcoded truth",
and "final-shaped slice" as operational commands defined in goal-038.md.

Current next slice:
Build or run the pre-edit engineering gate before continuing new non-trivial
implementation work; then continue the next dependency-ordered final-product
slice from this goal.

Constraints:
- docs/memory/** is pattern bank / audit export, not memory core.
- .krn/** is runtime evidence/cache/ledger, not memory core.
- Memory core must be service/store-backed, local-first for now.
- Do not add dashboard, benchmark, broad API/cloud sync, or new passive docs.
- Do not hardcode product truth, memory records, active source lists, or
  repo-specific absolute paths in product code. Put volatile truth behind a
  typed store/config/source graph/test fixture.
- First slice must define a typed MemoryStore boundary, selection,
  application, feedback, and a real CLI/review consumer.
- Selection must return memory IDs/reasons/confidence/source lineage.
- Runtime evidence may store memory IDs and outcomes, not authoritative memory
  bodies.
- Known-bad context dump must fail.
- Selected memory without application guidance must fail.
- Before expanding behavior, run the goal-038 simplify/condense check on the
  touched surface.
- Before non-trivial product edits, produce or run `krn gate --task <text>`
  semantics and make these checks explicit: mechanism, scope boundary,
  consumer, verification, rollback/kill, hardcoded truth, skill routing,
  simplify cadence, and overclaim boundary.
- For non-trivial TypeScript contracts, CLI, eval, MCP/API, or dashboard work,
  use the typescript-contract-engineer skill.
- For eval design, use eval-designer.
- For research synthesis/source-backed patterns, use research-synthesis or
  long-researcher.
- For hard-to-reverse architecture decisions, use adr-writer.
- Before claiming done, use release-verifier reasoning: evidence first,
  overclaim boundary explicit.
- Run focused tests, pnpm typecheck, and git diff --check.
- Commit semantically and push only after verification.
```

## Non-Negotiable Product Direction

[DECISION] KRN is a Codex Operating Layer / AI Engineering Control Plane.

[DECISION] Repo-local files are not the final memory core.

- `docs/memory/**` is a pattern bank and audit/export layer.
- `.krn/**` is runtime evidence/cache/ledger.
- authoritative memory core is KRN service/store backed, local-first at the beginning and API/team-sync capable later.

[DECISION] A feature is not real until it has a consumer, evidence, and a feedback path.

[DECISION] Every agentic element must have:

- owner,
- state,
- cost,
- rollback,
- eval or verification surface,
- permission boundary,
- audit record,
- kill criteria.

[DECISION] Every non-trivial product edit must pass a pre-edit engineering gate.

The gate is not ceremony. It is the smallest runtime artifact that forces the
agent/operator to name:

- mechanism;
- scope boundary;
- consumer;
- verification;
- rollback or kill path;
- hardcoded-truth boundary;
- required skills;
- simplify/condense trigger;
- overclaim boundary.

If any item is missing, the work must stop in planning/repair mode instead of
editing from momentum.

## Compressed Operator Vocabulary

The user often uses short phrases as compact operational instructions. Interpret them as follows.

| Shorthand | Required behavior |
|---|---|
| `simplify` | Stop expanding surface area. Inspect the touched diff, remove duplication, collapse unnecessary objects, reduce default context, keep only consumed behavior, and name what can be deleted or parked. |
| `condense` | Turn scattered chat/research/code knowledge into the smallest canonical contract that changes future behavior. Do not create a passive note when a contract, test, source map, or deletion decision is the real output. |
| `Karpathy-small` | Prefer one hypothesis, one mechanism, one measurable signal, one consumer, and one falsifier before adding a framework layer. Dumb baseline first; complexity must earn its keep. |
| `senior` | Name the mechanism, tradeoff, simplest viable design, verification surface, owner, rollback/kill path, and overclaim boundary. |
| `anti-slop` | Reject proof-shaped artifacts that do not reduce context waste, review burden, memory rot, task drift, unsafe writes, or duplicate concepts. |
| `final-shaped slice` | Build the smallest dependency-ordered piece of the final architecture, not a throwaway MVP shortcut. It must keep the final ownership boundaries. |
| `hardcoded truth` | Do not embed product direction, memory records, active source lists, user-specific paths, benchmark assumptions, or current-goal state in product code. Use typed config/store/source graph/test fixtures. |
| `gate` / `pre-edit gate` | Before non-trivial edits, produce the engineering gate checklist and use it to block unclear mechanism, missing consumer, missing verification, missing rollback, broad dashboard/benchmark/API expansion, or hardcoded volatile truth. |

Hardcoding schema versions, enum values, stable command names, and explicit test fixtures is allowed. Hardcoding live product truth or memory truth is not.

## Skill Routing Contract

Skills are build-time operating rules for this repo. They are not optional decoration when the work clearly matches their trigger.

| Work type | Required skill |
|---|---|
| TypeScript contracts, parsers, CLI commands, eval runners, MCP/API resources, dashboard view models, package boundaries | `typescript-contract-engineer` |
| New or changed evals, metrics, known-bad fixtures, validation gates | `eval-designer` |
| Source-backed synthesis, paper/practitioner pattern condensation, canonical claim updates | `research-synthesis` or `long-researcher` |
| Broad final-product slicing or restartable execution plans | `goal-execplan` or `issue-slice-writer` |
| Hard-to-reverse architecture/product decision | `adr-writer` |
| Completion claim, release proof, or "is this done?" audit | `release-verifier` |
| Eval failure, reviewer finding, broken operating rule, or failed proof | `repair-handoff` |

## Pre-Edit Engineering Gate

Non-trivial product work must satisfy this gate before implementation:

```text
task intent
  -> mechanism
  -> exact scope boundary
  -> current consumer
  -> verification surface
  -> rollback/kill path
  -> hardcoded-truth boundary
  -> required skills
  -> simplify/condense trigger
  -> overclaim boundary
```

CLI/runtime contract:

```bash
pnpm run krn -- gate --task "<task>" [--path <path>]
```

The gate writes `.krn/gates/{run_id}/engineering-gate.json`. That file is
runtime evidence only; it is not product truth and it does not replace actual
tests, review, or simplify/condense.

The gate must block or force planning mode when:

- the mechanism is just a label like "best practices";
- no current consumer exists;
- verification is not named;
- rollback/kill criteria are missing;
- volatile product truth would be hardcoded;
- broad dashboard, benchmark, API/cloud sync, or passive docs are proposed
  before a typed consumed behavior exists.

If a relevant skill does not trigger automatically, manually use it and record the missing-trigger as a skill-quality improvement candidate. Do not solve the same class of work from memory if a repo skill exists for it.

## Senior Engineering Preflight

For every non-trivial edit, the agent must do this before touching files:

1. Restate the exact product mechanism being changed in one sentence.
2. Name the current source of truth and the volatile truth that must not be hardcoded.
3. Name the required skill route and load the matching skill instructions.
4. Name the public interface: parser, CLI command, eval runner, MCP/API resource, dashboard view model, or doc-only contract.
5. Name the current consumer. If there is no consumer, stop or reduce scope.
6. Name the verification surface and at least one known-bad path for contract changes.
7. Name the rollback/kill path.
8. Name the simplify trigger for the touched surface.

This preflight is intentionally stronger than "think before coding". It must
force the agent to connect research, code, evals, and product direction before
editing. It is lightweight for small edits, but it is mandatory for TypeScript
contracts, CLI behavior, memory/source/eval surfaces, MCP/API/dashboard work,
and goal/canonical direction changes.

The expected shape is:

```text
mechanism:
source of truth:
volatile truth not to hardcode:
required skill:
public interface:
consumer:
verification:
known-bad:
rollback/kill:
simplify trigger:
overclaim boundary:
```

If this cannot be filled honestly, continue in planning/research mode instead
of editing. Do not patch from momentum.

## Final Completion Definition

This goal is complete only when KRN can be used end-to-end on real repositories and measurably improves Codex work.

Completion requires all of the following:

1. **Repo bootstrap**: `krn init` safely bootstraps or updates a repo with thin agent instructions, project fingerprint, policies, source pointers, eval baseline, skill wiring, and local KRN config.
2. **Context supply chain**: KRN builds bounded context packets for Codex from task intent, active repo state, source graph, memory selection, policies, and required skills.
3. **Memory core**: KRN has a service/store-backed memory lifecycle outside the project repo with TTL, confidence, source lineage, owner, freshness, invalidation, application feedback, and compaction.
4. **Memory application**: selected memory changes a review/action path or blocks a bad action, and usage feedback is recorded.
5. **Source graph**: decisions and patterns are source-grounded with freshness/conflict handling and source-to-decision mapping.
6. **Skills system**: KRN skills are versioned, owned, bounded, triggerable, and evaled; they are not prompt sprawl.
7. **MCP/API boundary**: Codex/KRN exchange typed packets, traces, decisions, memory feedback, and review proposals through least-privilege read/proposal/write boundaries.
8. **Eval system**: evals are split into core/current/lab lanes and protect contracts, regressions, and measured hypotheses without becoming theater.
9. **Trace and replay**: important runs produce enough evidence to replay or diagnose decisions after context loss.
10. **Dashboard decision surface**: dashboard views exist only for decisions they improve: memory feedback, stale sources, eval failures, review burden, risky diffs, approvals, and blocked actions.
11. **Security/governance**: prompt injection, tool permissions, secrets, unsafe writes, cloud sync, conflict handling, and rollback have explicit controls.
12. **Dogfood proof**: at least one real non-trivial repo workflow shows lower repeated failure rate or lower review burden with KRN-assisted Codex than baseline Codex, without overclaiming.
13. **Continuity proof**: after compaction or fresh resume, a new Codex run can continue from this goal, checkpoints, and runtime evidence without rereading broad history or duplicating solutions.
14. **Deletion proof**: stale labs, duplicate contracts, unused skills, dead eval modules, and passive docs are merged, archived, or removed from the default path.

## Operating Loop

Each vertical slice follows this loop:

```text
intake
  -> choose final-product layer
  -> research/plan checkpoint when non-trivial
  -> smallest production-shaped behavior
  -> implementation
  -> focused verification
  -> review/handoff
  -> feedback to memory/source/eval layer when behavior changed
  -> simplify/condense pass on cadence
```

This loop is dependency-ordered, not maturity-labeled. Do not call slices MVP, v0, prototype, or demo unless the user explicitly asks for that framing.

## Code Quality And Monolith Rule

Before adding durable behavior to a large file, ask whether the file is already a dumping ground. If yes, prefer extracting the touched behavior into a cohesive module with a small public interface instead of adding more branches to the monolith.

This is a surgical rule, not permission for broad rewrites:

- extract only the behavior needed by the current slice;
- preserve existing command behavior through public-interface tests;
- do not refactor unrelated code;
- keep dispatch in the old file if that is the smallest stable boundary;
- delete old duplicate helpers after extraction;
- run a focused test through the public command or parser, not private helpers.

For TypeScript:

- external JSON, CLI input, MCP input, API input, model output, eval reports, and file contents start as `unknown`;
- parsing belongs in `packages/contracts` or the package that owns the boundary;
- product code must not duplicate schema logic from contracts;
- avoid unchecked `any`;
- prefer small deep modules over many shallow helpers;
- every changed exported contract needs valid and known-bad coverage.

## Simplify And Quality Condensation Cadence

To avoid the "failure loop" where the repo accumulates reports, duplicate contracts, and old ideas, simplification is mandatory.

Run a **Simplify/Condense Pass** after:

- every 3 completed implementation slices,
- every major layer completion,
- any slice that adds more than one new durable object,
- any slice that adds a dashboard/API/MCP surface,
- any slice that increases default context/read set,
- any failed eval/benchmark repair loop that creates a new artifact family,
- any compaction where the active plan becomes ambiguous.

Also run a lightweight simplify checkpoint before continuing when:

- the same file is being patched for the third time in a slice;
- a file grows by more than roughly 200 lines in one slice;
- a new abstraction appears before two real consumers exist;
- a test fixture starts carrying product truth;
- a CLI command starts reading from docs as if docs were the product store;
- the next step would add another report, dashboard row, benchmark lane, or passive doc.

The pass must check:

- Which files, commands, evals, skills, or docs are now duplicate?
- Which concept has two sources of truth?
- Which typed object has no consumer?
- Which eval no longer guards a current contract/regression?
- Which docs are passive history and should move out of the default read path?
- Which code can be deleted, merged, or simplified?
- Which next context can be reduced?
- Which review burden increased?

Acceptance evidence for the pass:

- `git diff --stat` reviewed for unnecessary surface growth.
- `rg` checks for duplicate names/concepts when relevant.
- unused exports/imports removed from the touched scope.
- default read set remains small.
- no passive doc is counted as product progress.
- any kept artifact has a named consumer.

The pass output must be explicit:

```text
keep:
- ...

delete/merge/park:
- ...

next simplification candidate:
- ...

overclaim boundary:
- ...
```

## Anti-Slop Guardrails

Stop or repair the slice if any of these occur:

- memory is described as "files in repo";
- a passive document is presented as the main deliverable;
- a dashboard is added before the object it reviews changes behavior;
- a benchmark/eval is added without a protected contract, known regression, or measured hypothesis;
- a typed object is added without a consumer in the same or next immediate slice;
- a skill is added without trigger, owner, forbidden behavior, verification, and lifecycle state;
- a source is cited without supporting a decision, pattern, risk, or rejection;
- Codex rereads broad historical goals by default;
- implementation duplicates an existing pattern instead of reusing it;
- a green fixture is described as quality or productivity lift;
- cloud/API sync is proposed without idempotency, conflict handling, privacy boundary, and audit log;
- product code contains repo-local absolute paths or source/memory truth that should be in a typed store/config/source graph;
- runtime evidence stores full authoritative memory bodies instead of memory IDs, source lineage, outcomes, and feedback;
- a `docs/**` document is used as the authoritative runtime database for memory, source, eval, or policy state.

## Metrics

Use these metrics to decide whether work is improving the product.

| Metric | Target direction | Why it matters |
|---|---|---|
| Context waste | down | less irrelevant context per run |
| Memory precision | up | selected memory is used or explicitly rejected |
| Harmful/stale memory rate | down | prevents memory poisoning |
| Review burden | down | product helps humans trust work faster |
| Time to trusted merge | down | end-to-end value |
| Duplicate concept count | down | prevents architecture sediment |
| Default read set size | stable/down | protects compaction/resume |
| Core eval stability | stable/up | protects contract behavior |
| Current-slice eval relevance | high | prevents eval theater |
| Lab lane influence | bounded | lab informs product only through keep/discard decisions |
| Resume success | up | compaction/fresh-run continuity |
| Unsafe write attempts | down | tool boundary quality |

Metric values must be attached to concrete evidence when used for a completion claim.

## Required Artifact Classes

The final product may create these artifacts, but only with consumers:

- typed contracts in `packages/contracts`;
- CLI surfaces in `packages/cli`;
- memory/source service modules;
- MCP/API resources and proposal/write boundaries;
- focused evals and known-bad fixtures;
- runtime evidence under `.krn/**`;
- ADRs for hard-to-reverse decisions;
- dashboard view models and UI views that support decisions;
- skill definitions with lifecycle and eval coverage.

Avoid creating:

- standalone reports with no consumer;
- dashboard panels with no decision;
- new child goals for tiny edits;
- research notes that do not feed a decision;
- default benchmark modules for lab-only work;
- repo-local memory core.

## Continuity Rules

This goal must survive context loss.

After every meaningful slice:

1. Update this goal's **Progress Ledger** or the active compact checkpoint with:
   - completed behavior,
   - changed files,
   - evidence commands,
   - open risks,
   - next action,
   - overclaim boundary.
2. Keep the next action concrete enough that a fresh Codex run can continue without reading old conversation history.
3. If the next action depends on a prior decision, link the exact file and section, not chat memory.
4. If a slice creates a new product object, name its consumer and verification.
5. If a slice removes or parks a layer, name what now owns that responsibility.

Do not rely on hidden chat memory as the source of truth.

## Implementation Tracks

These tracks are final-product dependencies, not release versions.

| Track | Outcome | Start when | Done when |
|---|---|---|---|
| Direction lock | canonical direction and goal are unambiguous | now | default read set points to this goal and product plan |
| Memory store boundary | memory is not repo files | direction lock complete | selector/applicator consumes store interface and writes usage evidence |
| Context packet | Codex gets bounded, reasoned context | memory selection exists | packet drives a real CLI/review workflow |
| Source graph | source claims drive decisions | context packet exists | source freshness/conflicts can block or warn |
| Eval split | core/current/lab are separated | current eval registry blocks progress | default eval stops accumulating lab history |
| `krn init` | repo bootstrap is safe and useful | memory/context contracts stable | fresh repo dogfood works |
| API/MCP sync | KRN and Codex exchange typed state | local proof stable | read/proposal/write boundaries audited |
| Dashboard | human review gets faster | typed decisions exist | views have owners/actions/thresholds |
| Security/governance | unsafe autonomy is bounded | API/MCP writes expand | threat model and gates protect real workflows |
| Dogfood/lift | product improves real work | core loop usable | repeated failure/review-burden metric improves |

## First Concrete Slice

Build the memory store boundary and selection/application proof.

Do not build the final cloud service yet. Build the smallest final-shaped boundary:

```text
MemoryStore interface
  -> local dev adapter outside project-repo truth
  -> selector returns memory IDs/reasons/confidence/source lineage
  -> application guidance changes `krn review` or nearest review workflow
  -> runtime evidence records memory IDs and feedback
  -> known-bad context dump fails
```

Acceptance:

- `docs/plans/canonical/draft.md` and this goal agree that repo files are not memory core.
- TypeScript contracts are parsed from `unknown`.
- CLI/review path consumes the contracts.
- Focused tests prove selection, rejection, application, and no-context-dump behavior.
- `pnpm typecheck` passes.
- A simplify/condense pass is run if the slice creates more than one durable object.

## Current Dependency Cursor

[FACT] The MemoryStore boundary, memory-aware `krn review`, `krn brief`, and
the pre-edit `krn gate` now exist as local typed runtime slices.

[FACT] The next dependency being closed is the bounded context packet:

```text
task intent
  -> MemoryStore selection
  -> selected memory IDs/reasons/confidence/source lineage
  -> application guidance
  -> runtime context packet
  -> feedback record
```

[NEXT] After the context packet checkpoint is committed, the next product slice
should be source graph freshness/conflict blocking for selected decisions. Do
not add dashboard, benchmark, broad API/cloud sync, or passive docs before that
source graph has a real CLI/review/context consumer.

## Progress Ledger

### 2026-06-20

- [FACT] Direction corrected toward KRN as Codex Operating Layer / AI Engineering Control Plane.
- [DECISION] `docs/memory/**` and `.krn/**` are not final memory core.
- [DECISION] This goal becomes the single final-product execution contract.
- [FACT] Read order and goal index now point to this goal as the active execution contract.
- [FACT] `docs/plans/canonical/draft.md` is the canonical large product blueprint; `docs/product/final-product-plan.md` is a compatibility pointer.
- [FACT] Goal refreshed with a canonical resume prompt, compressed operator vocabulary, mandatory skill routing, monolith/surgical extraction rule, hardcoded-truth boundary, and explicit simplify/condense output.
- [FACT] MemoryStore proof slice added typed contracts for memory records, selection, application, feedback, and operating briefs.
- [FACT] `krn review` now consumes an external local MemoryStore adapter and records selected memory IDs/application/feedback in runtime evidence.
- [FACT] `krn brief --task <text>` now writes a schema-backed operating brief under `.krn/briefs/{run_id}/brief.json` using selected memory IDs, rejected context, applied kernel terms, required skills, next action, and verification.
- [FACT] The review implementation was extracted from `packages/cli/src/main.ts` into `packages/cli/src/review.ts`; `packages/cli/src/brief.ts` and `packages/cli/src/memory-store.ts` own the new slice behavior.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/memory-store.test.ts packages/contracts/test/operating-brief.test.ts packages/contracts/test/review-report.test.ts packages/cli/test/brief.test.ts packages/cli/test/review.test.ts` passed 5 files / 13 tests.
- [EVIDENCE] `pnpm run eval:krn-review` passed run `20260620T204540Z-331473` with 3/3 cases and 9/9 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: `MemoryStore` contracts, `krn brief`, memory-aware `krn review`, focused fixtures/tests, and the review extraction because each has a current consumer.
- [SIMPLIFY] Park: broad source-ref cleanup for old `goal-006` init/doctor/eval/research-pack paths; it is not part of this MemoryStore slice.
- [SIMPLIFY] Delete/avoid: no dashboard, no benchmark expansion, no cloud/API sync, no repo-local memory core, no full `docs/memory/**` context dump.
- [SIMPLIFY] Next candidate: a global pre-edit engineering gate/hook/skill eval that enforces mechanism, boundary, consumer, verification, rollback/kill, and hardcoded-truth checks before non-trivial edits.
- [OVERCLAIM] This slice proves local MemoryStore selection/application wiring and schema-backed operating briefs, not final memory quality, productivity lift, team sync, or dashboard usefulness.
- [NEXT] Commit and push this checkpoint; then build the global pre-edit engineering gate so the standards are enforced by tooling rather than repeated manual reminders.
- [FACT] Pre-edit engineering gate slice added `KrnEngineeringGate` contract, valid and known-bad fixtures, parser exports, `krn gate --task <text> [--path <path>]`, and runtime evidence under `.krn/gates/{run_id}/engineering-gate.json`.
- [FACT] `krn gate` enforces the non-trivial edit checklist: mechanism, scope boundary, consumer, verification, rollback/kill, hardcoded-truth boundary, skill routing, simplify cadence, and overclaim boundary.
- [FACT] `krn gate` exits blocked for broad dashboard/benchmark/API/cloud-sync work when no typed consumed behavior is named.
- [FACT] `AGENTS.md` now names the pre-edit engineering gate as the global rule for non-trivial product edits.
- [FACT] `.codex/hooks/compact_continuity.py` now fingerprints `docs/goals/goal-038.md` and `docs/plans/canonical/draft.md` instead of defaulting compact continuity to historical `goal-006` / compatibility plan.
- [FACT] Runtime gate output is ignored under `.krn/gates/**` while `.krn/gates/.gitignore` and `.krn/gates/README.md` are tracked.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/engineering-gate.test.ts packages/cli/test/gate.test.ts` passed 2 files / 6 tests.
- [EVIDENCE] `pnpm typecheck` passed.
- [EVIDENCE] Real command: `pnpm run krn -- gate --task "Implement TypeScript contracts and CLI runtime evidence for the goal-038 pre-edit engineering gate" --path packages/contracts/src/engineering-gate.ts` wrote `.krn/gates/20260620T210426Z-375669/engineering-gate.json`.
- [SIMPLIFY] Keep: `KrnEngineeringGate`, `krn gate`, `.krn/gates` runtime boundary, focused fixtures/tests, and the single `AGENTS.md` pointer because each has a current consumer.
- [SIMPLIFY] Delete/avoid: no dashboard, no broad API/cloud sync, no benchmark lane, no passive memory note, no hook enforcement claim before the CLI gate proves useful.
- [SIMPLIFY] Condensed: `gate` argument parsing lives in `packages/cli/src/gate.ts`; `packages/cli/src/main.ts` only dispatches the command so the new slice does not worsen the CLI monolith.
- [SIMPLIFY] Next candidate: extract more command-specific argument parsing from `packages/cli/src/main.ts` only when touching those commands for real behavior.
- [OVERCLAIM] This slice proves a schema-backed pre-edit gate and CLI runtime artifact. It does not prove Codex hook-level enforcement, productivity lift, full skill trigger quality, or that every future agent will obey the gate without running it.
- [NEXT] Commit and push this checkpoint; then continue the next dependency-ordered final-product slice with `krn gate` as the first step for non-trivial edits.
- [FACT] Bounded context packet slice added `KrnContextPacket`, `krn context build --task <text> [--path <path>]`, `.krn/context` runtime evidence, valid/known-bad fixtures, and CLI/contract behavior tests.
- [FACT] `KrnContextPacket` requires selected context to be backed by MemoryStore selection and requires selected memory to have application guidance through `krn_context`.
- [FACT] `krn context build` records selected memory IDs/reasons/confidence/source lineage, rejected context, required skills, blocked actions, memory application, feedback, next action, verification, and overclaim boundary without storing authoritative memory bodies in `.krn`.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/context-packet.test.ts packages/contracts/test/memory-store.test.ts packages/contracts/test/operating-brief.test.ts packages/cli/test/context.test.ts packages/cli/test/brief.test.ts` passed 5 files / 13 tests.
- [EVIDENCE] `pnpm typecheck` passed.
- [EVIDENCE] Real command: `KRN_MEMORY_STORE_PATH=<tmp>/memory-store.json pnpm run krn -- context build --task "Build bounded context packet contract and CLI consumer from goal-038 MemoryStore selection" --path packages/contracts/src/context-packet.ts` wrote `.krn/context/20260620T211740Z-406402/context-packet.json`.
- [SIMPLIFY] Keep: context packet contract, context CLI command, MemoryStore-backed selection/application/feedback, `.krn/context` runtime boundary, and focused tests because each has a current consumer.
- [SIMPLIFY] Delete/avoid: no dashboard, no broad API/cloud sync, no benchmark lane, no passive memory note, no full `docs/memory/**` context dump, and no authoritative memory bodies in runtime packets.
- [SIMPLIFY] Next candidate: after this checkpoint, reconcile `krn brief` and `krn context build` only if their consumers overlap; do not merge prematurely while the context packet is proving the context supply-chain contract.
- [OVERCLAIM] This slice proves local bounded context-packet construction from MemoryStore selection/application. It does not prove final context quality, source graph correctness, productivity lift, dashboard usefulness, or API/team-sync readiness.
- [NEXT] Commit and push this checkpoint; then build source graph freshness/conflict blocking for selected decisions as the next dependency-ordered slice.
- [FACT] Source graph slice added `KrnSourceGraph`, `KrnSourceCheck`, `krn sources check --context <context-packet.json> --graph <source-graph.json>`, `.krn/sources` runtime evidence, valid/blocking/bad-conflict fixtures, and CLI/contract behavior tests.
- [FACT] `krn sources check` verifies the source refs selected by a context packet and blocks missing, stale, superseded, or conflicting refs; unverified/aging/unknown refs warn.
- [FACT] The context-packet example now uses selected memory source lineage instead of stale hardcoded `AGENTS.md` / canonical draft source refs.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/source-graph.test.ts packages/contracts/test/context-packet.test.ts packages/cli/test/source-graph.test.ts packages/cli/test/context.test.ts` passed 4 files / 11 tests.
- [EVIDENCE] `pnpm typecheck` passed.
- [EVIDENCE] Real command pass: `pnpm run krn -- sources check --context docs/specs/krn-context-packet/examples/context-packet.example.json --graph docs/specs/krn-source-graph/examples/source-graph.example.json` wrote `.krn/sources/20260620T212546Z-430656/source-check.json` with `decision: pass`.
- [EVIDENCE] Real command block: `pnpm run krn -- sources check --context docs/specs/krn-context-packet/examples/context-packet.example.json --graph docs/specs/krn-source-graph/fixtures/source-graph-blocking.example.json` wrote `.krn/sources/20260620T212546Z-430680/source-check.json` and exited 1 with `decision: block`.
- [SIMPLIFY] Keep: source graph/check contracts, `krn sources check`, `.krn/sources` runtime boundary, and focused fixtures/tests because the context packet is the current consumer.
- [SIMPLIFY] Delete/avoid: no dashboard, no broad API/cloud sync, no web freshness crawler, no default benchmark lane, and no parsing `docs/plans/canonical/SOURCES.md` as the product source database.
- [SIMPLIFY] Next candidate: split eval modules into core/current/lab lanes so normal verification stops paying for historical dashboard/benchmark/lab modules.
- [OVERCLAIM] This slice proves local typed source-ref pass/warn/block behavior over one context packet and local graph adapter. It does not prove global source freshness, internet source refresh, final source service, productivity lift, or dashboard usefulness.
- [NEXT] Commit and push this checkpoint; then build the eval-lane split as the next dependency-ordered slice.

## Disproves Completion

This goal is not complete if:

- KRN remains primarily a set of docs, reports, eval fixtures, or dashboard panels;
- memory remains repo-local files or unchecked transcript summaries;
- Codex does not consume bounded context/memory/source packets;
- selected memory is not applied to action/review;
- no feedback changes future memory selection;
- old goals and benchmark history remain default context;
- dashboard or API growth outpaces typed behavior;
- real repo dogfood does not improve review burden or repeated failure rate;
- a fresh run cannot continue from repo artifacts after compaction.
