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

Current active mode:
Run cleanup/condense on current repo sediment first, then move into the
capability dogfood loop. This means KRN must use the boundaries it already has
on one real KRN capability task before another init proof, eval family,
dashboard surface, benchmark lane, broad API/cloud sync, research runtime, or
passive document is allowed.

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
- Treat the canonical blueprint as the full final target state, not as MVP or
  v0 thinking. Slices are dependency-ordered implementation carriers for that
  final architecture.
- Keep the full ADR/source-backed pattern catalog current when product
  architecture changes. Do not replace it with scattered notes.
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

[DECISION] KRN is built toward the full final-product target state from the
start.

Dependency-ordered slices are not MVPs. They are the fastest safe carriers for
the final architecture. A slice may be tightly scoped, but it must preserve final
ownership boundaries, final memory/source/eval semantics, and the real rollback
or kill path.

[DECISION] The canonical blueprint and eventual ADR are product truth for target
architecture.

If product architecture changes, update the canonical blueprint/source ledger or
ADR-level decision in the same pass. Do not let the final product plan live only
in chat, social-research notes, or local runtime artifacts.

[DECISION] Repo-local files are not the final memory core.

- `docs/memory/**` is a pattern bank and audit/export layer.
- `.krn/**` is runtime evidence/cache/ledger.
- authoritative memory core is KRN service/store backed, local-first at the beginning and API/team-sync capable later.

[DECISION] A feature is not real until it has a consumer, evidence, and a feedback path.

[DECISION] KRN may dogfood KRN only at proven boundaries.

Future self-use is a product direction, not a license to pretend the system is
already self-growing. KRN can use its own MemoryStore, context/source packet,
review, eval, skill, or policy layer only when that layer has a typed boundary,
a current consumer, verification evidence, rollback/kill criteria, and an
overclaim boundary. Until then, use the layer as a local proof input, not as
authoritative automation.

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
| `full target state` | Keep the complete final architecture visible in the canonical blueprint/ADR. Do not narrow the product to MVP/v0 language just because implementation is incremental. |
| `final-shaped slice` | Build the tightest dependency-ordered carrier of the final architecture, not a throwaway MVP shortcut. It must keep the final ownership boundaries. |
| `sprzątanie` / `cleanup` | Inventory stale goals, duplicate docs, unconsumed evals, weak skills, hardcoded local paths, and monolith pressure. Delete, park, merge, or route them out of the default path before adding another surface. |
| `capability dogfood` | Use existing KRN boundaries on one real KRN capability task, then record keep/kill/revisit from focused evidence. This is not a broad live-agent benchmark or self-growing claim. |
| `self-growing KRN` | Future direction only. A KRN layer can help build KRN after it has a typed boundary, consumer, verification, rollback, and overclaim boundary. |
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

## Research-To-Pattern Condensation Contract

Research is a product input only when it changes a decision, contract, eval,
skill, source graph, or implementation boundary.

Paper, repo, practitioner, and social sources enter KRN as **source
candidates**, not product truth. Each retained candidate must be condensed into:

- source ID and trust tier;
- mechanism extracted from the source;
- pattern name and failure mode it addresses;
- KRN layer and current/future consumer;
- decision or claim ID;
- eval, falsifier, or kill criterion;
- freshness/owner/confidence boundary;
- overclaim boundary.

If the output is only a note, it is not enough for product progress. The normal
path is:

```text
source candidate
  -> source ledger
  -> pattern matrix
  -> claim/decision
  -> contract/eval/skill/code consumer
  -> runtime evidence or reviewed rejection
```

Primary docs, papers, and inspected repos outrank social posts. Social posts can
seed vocabulary and mechanisms, but remain hypotheses until primary source,
source graph lineage, or local eval evidence confirms them. Futuristic language
is allowed only after it is decomposed into measurable mechanisms.

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
  -> check canonical blueprint/ADR target state
  -> cleanup/condense stale or duplicate surfaces in the touched path
  -> research/plan checkpoint when non-trivial
  -> tight final-shaped behavior
  -> implementation
  -> focused verification
  -> review/handoff
  -> feedback to memory/source/eval layer when behavior changed
  -> simplify/condense pass on cadence
```

This loop is dependency-ordered, not maturity-labeled. Do not call slices MVP, v0, prototype, or demo unless the user explicitly asks for that framing.

The default next loop after repo-bootstrap composition is:

```text
cleanup inventory
  -> delete/park/merge or route stale surfaces out of default context
  -> choose one real KRN capability task
  -> build context from existing MemoryStore/source boundaries
  -> implement code through the relevant skill and typed consumer
  -> verify with focused tests/evals only
  -> record keep/kill/revisit and overclaim boundary
```

No broad `codex exec` research loop is allowed in this default path. `codex
exec` remains a worker/eval lane for explicit, bounded dogfood or lab tasks with
a hypothesis, budget, trace, and stop condition.

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

## First Completed Concrete Slice

The first concrete slice after the goal reset was the memory store boundary and
selection/application proof. It is now completed local foundation, not the
active next task.

The boundary was final-shaped but local-first:

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

[FACT] The MemoryStore boundary, memory-aware `krn review`, `krn brief`,
pre-edit `krn gate`, bounded context packet, local source graph check, and eval
lane split now exist as local typed runtime slices.

[FACT] `krn init --dry-run` now emits a final-shaped bootstrap manifest with a
typed `bootstrap_plan` for agent instructions, local config, source pointers,
context pointers, eval baseline, skill wiring, and policy boundaries.

[FACT] `krn init --proposal agent_instructions` now emits the dry-run manifest
first and stores a source-backed append-only `init_bootstrap` proposal for
`AGENTS.md` without mutating the target file.

[FACT] `krn init --apply agent_instructions` now requires an existing
`init_bootstrap` proposal, an approved proposal review decision, and an exact
`init_agent_instructions` payload before writing an absent `AGENTS.md` through
the proposal promotion spine.

[FACT] `krn init --proposal local_config` and `krn init --apply local_config`
reuse the same reviewed promotion spine for the second absent bootstrap target:
`.krn/config.toml`. The exact `init_local_config` payload points to an external
local `KRN_MEMORY_STORE_PATH` and runtime directories, but does not embed memory
bodies, active-goal truth, copied source lists, dashboard state, API sync, or
cloud defaults.

[FACT] `krn init --proposal source_pointers` and `krn init --apply
source_pointers` reuse the same reviewed promotion spine for the third absent
bootstrap target: `.krn/sources/index.json`. The exact `init_source_pointers`
payload seeds a minimal `krn-source-graph.v1` boundary without copying canonical
source ledgers, active source lists, source bodies, dashboard state, API sync, or
memory-core truth.

[FACT] `krn init --proposal context_pointers` and `krn init --apply
context_pointers` reuse the same reviewed promotion spine for the fourth absent
bootstrap target: `.krn/context/index.json`. The exact
`init_context_pointers` payload seeds a minimal `krn-context-pointer-index.v1`
boundary pointing at future context packet runtime locations without storing
memory bodies, active task truth, copied `goal-038` or canonical plan text,
dashboard state, API sync, or memory-core truth.

[FACT] `krn init --proposal eval_baseline` and `krn init --apply
eval_baseline` reuse the same reviewed promotion spine for the fifth absent
bootstrap target: `.krn/evals/baseline.json`. The exact `init_eval_baseline`
payload seeds a minimal `krn-eval-baseline.v1` lane-policy boundary with
core/current checks and explicit lab/all exclusion, without storing live eval
report IDs, active-goal truth, copied canonical plan text, dashboard state, API
sync, memory-core truth, or productivity-lift claims.

[FACT] `krn init --proposal policy_boundaries` and `krn init --apply
policy_boundaries` reuse the same reviewed promotion spine for the sixth absent
bootstrap target: `.krn/policies/boundaries.json`. The exact
`init_policy_boundaries` payload seeds a minimal `krn-policy-boundaries.v1`
local policy boundary requiring approval for target-file mutation, blocking
repo-local memory-core writes, requiring source acceptance handling, warning on
command execution, blocking dashboard/API expansion, and forbidding cloud sync,
benchmark default, dashboard-first, memory-body repo writes, unreviewed target
writes, and productivity-lift claims. It does not prove hook enforcement,
security quality, broad API permissioning, dashboard usefulness, final memory
quality, or productivity lift.

[FACT] `krn init --proposal skill_wiring` and `krn init --apply skill_wiring`
reuse the same reviewed promotion spine for the seventh absent bootstrap
target: `.agents/skills/README.md`. The exact `init_skill_wiring` payload seeds
only a local skill-wiring pointer and forbids copied active skill bodies,
runtime evidence in skill text, durable memory bodies in repo-local skills,
active-goal truth, dashboard/API state, hook/security claims, or productivity
lift claims.

[FACT] The seven reviewed bootstrap targets now compose in one isolated target:
dry-run, proposal, approved review decision, exact apply, and second dry-run
`skip` detection pass together while rejecting repo-local memory core,
dashboard/API state, copied `goal-038`, and copied canonical draft truth.

[FACT] The active default eval path is now:

```text
krn eval
  -> lane_selection: current
  -> included_lanes: core,current
  -> excluded_lanes: lab
```

[FACT] The first cleanup/condense code slice extracted reviewed-bootstrap
composition behavior from the init eval runner into a one-consumer helper:
`packages/evals/src/krn-init-reviewed-bootstrap.ts`.

[FACT] The first capability dogfood cleanup used `krn context build` with a
local external MemoryStore to select bounded memory IDs, reject broad memory
dumps, and guide the init-eval refactor before editing.

[NEXT] Continue the capability dogfood loop on one real KRN capability task at a
time, using existing MemoryStore, context/source, review, and eval boundaries.
Keep dashboard, benchmark, broad API/cloud sync, research runtime, and passive
docs out of the default path until the capability task creates a real consumer.

## Progress Ledger

Historical `[NEXT]` entries below record what the next step was at that point in
the sequence. The active next step is always the `Current Dependency Cursor`
above plus the newest `[NEXT]` entry.

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
- [FACT] Eval-lane split slice added lane metadata to `KrnEvalReport`, lane invariants in the parser, `krn eval --lane core|current|lab|all`, and custom explicit `--module` reports.
- [FACT] Default `krn eval` now selects the `current` lane, includes `core` plus `current`, excludes `lab`, and keeps dashboard/benchmark/repair/research-pack history explicit instead of default.
- [FACT] Explicit `--lane lab` remains available for lab verification, and explicit `--module <module-id>` emits `requested_lane: "custom"` so focused module runs still work without reopening the default path.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/eval-report.test.ts packages/cli/test/eval.test.ts` passed 2 files / 7 tests.
- [EVIDENCE] `pnpm run eval:krn-eval` passed run `20260620T220329Z-524319` with 5/5 cases and 12/12 assertions.
- [EVIDENCE] `pnpm run eval:krn-dashboard-eval-runs-ui` passed run `20260620T215329Z-509801` with 5/5 cases and 20/20 assertions after updating its synthetic eval report fixture to the lane-aware contract.
- [EVIDENCE] `pnpm run krn -- eval --lane lab` passed and wrote `.krn/eval/20260620T220452Z-528099/report.json` with 11/11 lab modules passed.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed after final source-ref cleanup.
- [SIMPLIFY] Keep: lane metadata on `KrnEvalReport`, stable lane descriptors on eval modules, default current selection, explicit lab/custom paths, and known-bad excluded-lane fixture because each protects default verification from lab sediment.
- [SIMPLIFY] Delete/avoid: no new dashboard panel, no new benchmark, no new API/cloud sync, no new passive research doc, and no external eval registry until a second consumer needs it.
- [SIMPLIFY] Next candidate: extract eval module descriptors out of `packages/cli/src/main.ts` only when `krn init` or another real consumer needs the registry boundary; do not refactor the CLI monolith from aesthetics alone.
- [OVERCLAIM] This slice proves lane-aware eval routing and parser invariants. It does not prove product quality, productivity lift, lab module quality, or that the eval registry is the final architecture.
- [NEXT] Commit and push this checkpoint; then continue with final-shaped `krn init` repo bootstrap using the MemoryStore/context/source/eval boundaries already proven.
- [FACT] Final-shaped `krn init` bootstrap slice added `bootstrap_plan` to `KrnInitManifest` with seven required capabilities: `agent_instructions`, `local_config`, `source_pointers`, `context_pointers`, `eval_baseline`, `skill_wiring`, and `policy_boundaries`.
- [FACT] `KrnInitManifest` now rejects dry-run manifests that directly modify target files and rejects manifests missing any required bootstrap capability.
- [FACT] `krn init --dry-run` now generates `project_profile.current_phase: "Goal 038 Final Product Bootstrap"`, capability-scoped boundaries, final-product source refs, and an explicit caveat that it does not prove write-mode safety, memory-core quality, MCP readiness, dashboard readiness, paper-research automation, or productivity lift.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/init-manifest.test.ts packages/cli/test/init-dry-run.test.ts` passed 2 files / 5 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `20260620T222158Z-567924` with 4/4 cases and 11/11 assertions.
- [EVIDENCE] Generated manifest `.krn/init/20260620T221447Z-560679/manifest.json` contains the seven bootstrap capabilities and only writes the runtime manifest.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed and wrote `.krn/eval/20260620T222243Z-569502/report.json` with 5/5 modules, 16/16 cases, and 42/42 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: `bootstrap_plan`, the required capability enum, direct-modify dry-run rejection, the missing-capability known-bad fixture, and the focused init eval because each protects final-shaped bootstrap boundaries.
- [SIMPLIFY] Delete/avoid: no write-mode apply path yet, no dashboard, no benchmark expansion, no broad API/cloud sync, no research runtime, no repo-local memory core, and no copied bibliography/source dump in init manifests.
- [SIMPLIFY] Next candidate: extract `krn init` manifest building and command handling out of `packages/cli/src/main.ts` only when adding the first reviewed proposal/write target or otherwise touching init behavior again.
- [OVERCLAIM] This slice proves dry-run bootstrap contract behavior only. It does not prove that bootstrapping a fresh repo improves review burden, that write-mode mutation is safe, or that KRN has a paper-ingestion/research brain.
- [NEXT] Commit and push this checkpoint; then continue with either the first reviewed `krn init` proposal/write target for one bootstrap capability or the surgical init-command extraction required to keep the CLI from becoming a dumping ground.
- [FACT] First reviewed `krn init` proposal-target slice added `proposal_kind: "init_bootstrap"` to `KrnControlPlaneProposal` and `krn init --proposal agent_instructions`.
- [FACT] `krn init --proposal agent_instructions` writes the dry-run manifest first, stores a source-backed proposal under `.krn/proposals/**/proposal.json`, sets `target.path: "AGENTS.md"`, keeps `write_policy.default_effect: "no_mutation"`, and leaves target `AGENTS.md` untouched.
- [FACT] The CLI reuses the existing append-only proposal store instead of creating a parallel init proposal store.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/control-plane-proposal.test.ts packages/cli/test/init-dry-run.test.ts` passed 2 files / 7 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `20260620T224749Z-630583` with 5/5 cases and 16/16 assertions after the init extraction.
- [EVIDENCE] `pnpm typecheck` passed after extraction.
- [EVIDENCE] `pnpm run eval:krn-proposal-store` passed run `20260620T224612Z-622156` with 4/4 cases and 9/9 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `20260620T224836Z-634673` with 5/5 modules, 17/17 cases, and 47/47 assertions.
- [EVIDENCE] `git diff --check` passed.
- [SIMPLIFY] Keep: `init_bootstrap` proposal kind, proposal-only `agent_instructions` path, manifest-backed source/evidence refs, focused init eval case, proposal-store reuse, and `packages/cli/src/init.ts` extraction because each protects the bootstrap write boundary and reduces `main.ts` growth.
- [SIMPLIFY] Delete/avoid: no direct `AGENTS.md` write, no apply mode yet, no dashboard, no benchmark, no broad API/cloud sync, no repo-local memory core, and no second proposal persistence path.
- [SIMPLIFY] Next candidate: extract `krn init` command parsing/build/write helpers from `packages/cli/src/main.ts` before adding apply/write behavior if the touched surface continues growing.
- [OVERCLAIM] This slice proves a proposal-only reviewed bootstrap input path. It does not prove human approval quality, apply-mode correctness, target mutation safety beyond `.krn/proposals`, fresh-repo usefulness, or productivity lift.
- [NEXT] Commit and push this checkpoint; then continue with either the reviewed apply boundary for this exact `agent_instructions` proposal or the surgical init-command extraction required before more init behavior.
- [FACT] First reviewed `krn init` apply-target slice added `krn init --apply agent_instructions --proposal-path <path> --decision-path <path>`.
- [FACT] `krn init --apply agent_instructions` reads an existing `init_bootstrap` proposal and approved review decision, builds a `KrnProposalPromotion` with `promotion_scope: "approved_init_bootstrap_only"`, and writes `AGENTS.md` only from the exact `init_agent_instructions` payload when the target is absent.
- [FACT] `KrnControlPlaneProposal` now supports exact `init_agent_instructions` payloads only for `init_bootstrap` proposals, while `KrnProposalPromotion` supports only `memory_update` and `init_bootstrap` promotion scopes.
- [FACT] `packages/mcp/src/proposal-promotion-store.ts` reuses the existing approved-decision, source-ref, exact-payload, idempotency, safe-path, and no-overwrite promotion boundary for init bootstrap writes.
- [FACT] The CLI apply implementation was extracted into `packages/cli/src/init-bootstrap.ts` so `packages/cli/src/init.ts` remains the init manifest/proposal dispatcher instead of absorbing bootstrap write boundaries.
- [FACT] `krn init` no longer emits `goal-038` or the canonical draft as runtime product truth inside generated manifests; the bootstrap phase label is now generic `KRN Init Bootstrap Planning`.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-promotion-store.test.ts packages/cli/test/init-dry-run.test.ts` passed 4 files / 22 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `20260620T231654Z-699484` with 6/6 cases and 21/21 assertions.
- [EVIDENCE] `pnpm run eval:krn-proposal-promotion` passed run `20260620T231654Z-699473` with 8/8 cases and 26/26 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `20260620T231724Z-700759` with 5/5 modules, 18/18 cases, and 52/52 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: exact `init_agent_instructions` proposal payload, `approved_init_bootstrap_only` promotion scope, `krn init --apply agent_instructions`, safe target-local apply path validation, focused init/promotion eval cases, and `init-bootstrap.ts` extraction because each protects one reviewed bootstrap write boundary.
- [SIMPLIFY] Delete/avoid: no broad scaffold writer, no merge/overwrite mode for existing `AGENTS.md`, no dashboard, no benchmark expansion, no broad API/cloud sync, no memory-core write, no second promotion store, and no inferred target content from proposal prose.
- [SIMPLIFY] Next candidate: choose the next narrow `krn init` capability from local config, source pointers, context pointers, eval baseline, skill wiring, or policy boundaries; run the pre-edit gate before adding any new target mutation.
- [OVERCLAIM] This slice proves one reviewed exact absent-`AGENTS.md` apply boundary. It does not prove broad repo bootstrap usefulness, merge-mode safety, human review quality, dashboard/API readiness, final memory quality, or productivity lift.
- [NEXT] Commit and push this checkpoint; then continue with the next narrow `krn init` bootstrap capability or repo-bootstrap readiness check.
- [FACT] Second reviewed `krn init` apply-target slice added `krn init --proposal local_config` and `krn init --apply local_config --proposal-path <path> --decision-path <path>`.
- [FACT] `krn init --apply local_config` reads an existing `init_bootstrap` proposal and approved review decision, builds a `KrnProposalPromotion` with `promotion_scope: "approved_init_bootstrap_only"`, and writes `.krn/config.toml` only from the exact `init_local_config` payload when the target is absent.
- [FACT] `KrnControlPlaneProposal` now supports exact `init_local_config` payloads only for `init_bootstrap` proposals targeting `.krn/config.toml`, while the shared promotion boundary still rejects target mismatches, unsafe paths, and unapproved decisions.
- [FACT] The init bootstrap apply implementation now lives in `packages/cli/src/init-bootstrap.ts`, which owns the exact bootstrap payload/apply boundary for both `agent_instructions` and `local_config` instead of hardcoding one target-specific file module.
- [FACT] The generated local config keeps memory core external by using `memory_store_env = "KRN_MEMORY_STORE_PATH"` and does not copy authoritative memory bodies, active-goal truth, source lists, dashboard state, API sync, or cloud defaults into `.krn`.
- [EVIDENCE] Pre-edit gate passed: `pnpm run krn -- gate --task "Add reviewed local_config init bootstrap capability without hardcoding live product truth or broad scaffold writes" --path packages/cli/src/init.ts` wrote `.krn/gates/20260620T232156Z-707103/engineering-gate.json`.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-promotion-store.test.ts packages/cli/test/init-dry-run.test.ts` passed 4 files / 27 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `20260620T233553Z-741322` with 7/7 cases and 27/27 assertions.
- [EVIDENCE] `pnpm run eval:krn-proposal-promotion` passed run `20260620T233553Z-741332` with 9/9 cases and 30/30 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `20260620T233553Z-741343` with 5/5 modules, 19/19 cases, and 58/58 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: exact `init_local_config` payload, shared `init_bootstrap` proposal/promotion boundary, no-overwrite `.krn/config.toml` apply path, `KRN_MEMORY_STORE_PATH` pointer, and focused init/promotion eval cases because each protects the repo-bootstrap boundary without making `.krn` memory core.
- [SIMPLIFY] Delete/avoid: no broad scaffold writer, no merge/overwrite mode for existing `.krn/config.toml`, no dashboard, no benchmark expansion, no broad API/cloud sync, no memory bodies in repo config, no active-goal/source-list hardcoding, and no parallel local-config writer outside proposal promotion.
- [SIMPLIFY] Next candidate: source pointers, context pointers, eval baseline, skill wiring, policy boundaries, or repo-bootstrap readiness; each must reuse reviewed payload boundaries before target mutation.
- [OVERCLAIM] This slice proves one reviewed exact absent-`.krn/config.toml` apply boundary. It does not prove broad config consumption, full repo bootstrap usefulness, merge-mode safety, dashboard/API readiness, final memory quality, or productivity lift.
- [NEXT] Commit and push this checkpoint; then continue with the next non-memory-core bootstrap boundary or repo-bootstrap readiness check.
- [FACT] Third reviewed `krn init` apply-target slice added `krn init --proposal source_pointers` and `krn init --apply source_pointers --proposal-path <path> --decision-path <path>`.
- [FACT] `krn init --apply source_pointers` reads an existing `init_bootstrap` proposal and approved review decision, builds a `KrnProposalPromotion` with `promotion_scope: "approved_init_bootstrap_only"`, and writes `.krn/sources/index.json` only from the exact `init_source_pointers` payload when the target is absent.
- [FACT] `KrnControlPlaneProposal` now supports exact `init_source_pointers` payloads only for `init_bootstrap` proposals targeting `.krn/sources/index.json`, while the shared promotion boundary still rejects target mismatches, unsafe paths, existing targets, and unapproved decisions.
- [FACT] The generated source graph seed is a minimal `krn-source-graph.v1` boundary with one unverified bootstrap policy ref and an overclaim boundary. It does not copy `docs/plans/canonical/SOURCES.md`, `goal-038`, active source lists, source bodies, dashboard state, API sync, or memory-core truth.
- [EVIDENCE] Pre-edit gate passed: `pnpm run krn -- gate --task "Add reviewed source_pointers init bootstrap capability without broad scaffold writes or copied source truth" --path packages/cli/src/init.ts` wrote `.krn/gates/20260620T233918Z-745977/engineering-gate.json`.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-promotion-store.test.ts packages/cli/test/init-dry-run.test.ts` passed 4 files / 32 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `20260620T235217Z-781736` with 8/8 cases and 33/33 assertions.
- [EVIDENCE] `pnpm run eval:krn-proposal-promotion` passed run `20260620T234845Z-776982` with 10/10 cases and 34/34 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `20260620T235236Z-782131` with 5/5 modules, 20/20 cases, and 64/64 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: exact `init_source_pointers` payload, shared `init_bootstrap` proposal/promotion boundary, no-overwrite `.krn/sources/index.json` apply path, source graph seed overclaim boundary, and focused init/promotion eval cases because each protects repo bootstrap without copying active source truth.
- [SIMPLIFY] Delete/avoid: no broad scaffold writer, no merge/overwrite mode for existing `.krn/sources/index.json`, no dashboard, no benchmark expansion, no broad API/cloud sync, no source bodies in repo config/runtime seed, no canonical source ledger copy, and no parallel source-pointers writer outside proposal promotion.
- [SIMPLIFY] Next candidate: source graph seed content is repeated in test/eval fixtures for exact payload parity; extract a shared fixture only if another bootstrap target or consumer creates meaningful duplication pressure.
- [OVERCLAIM] This slice proves one reviewed exact absent-`.krn/sources/index.json` apply boundary. It does not prove source freshness, source ingestion, final source service quality, broad repo bootstrap usefulness, merge-mode safety, dashboard/API readiness, final memory quality, or productivity lift.
- [NEXT] Commit and push this checkpoint; then continue with context pointers, eval baseline, skill wiring, policy boundaries, or repo-bootstrap readiness.
- [FACT] Fourth reviewed `krn init` apply-target slice added `krn init --proposal context_pointers` and `krn init --apply context_pointers --proposal-path <path> --decision-path <path>`.
- [FACT] `krn init --apply context_pointers` reads an existing `init_bootstrap` proposal and approved review decision, builds a `KrnProposalPromotion` with `promotion_scope: "approved_init_bootstrap_only"`, and writes `.krn/context/index.json` only from the exact `init_context_pointers` payload when the target is absent.
- [FACT] `KrnControlPlaneProposal` now supports exact `init_context_pointers` payloads only for `init_bootstrap` proposals targeting `.krn/context/index.json`, while the shared promotion boundary still rejects target mismatches, unsafe paths, existing targets, and unapproved decisions.
- [FACT] The generated context pointer seed is a minimal `krn-context-pointer-index.v1` boundary pointing at `.krn/context/*/context-packet.json`. It requires selected memory IDs and application guidance while rejecting broad `docs/memory/**` context dumps; it does not copy memory bodies, active task truth, `goal-038`, canonical draft text, dashboard state, API sync, or memory-core truth.
- [EVIDENCE] Pre-edit gate passed: `pnpm run krn -- gate --task "Add reviewed context_pointers init bootstrap capability without context dumps, memory bodies, active goal truth, or copied canonical docs" --path packages/cli/src/init.ts` wrote `.krn/gates/20260621T000125Z-791550/engineering-gate.json`.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/context-pointer-index.test.ts packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-promotion-store.test.ts packages/cli/test/init-dry-run.test.ts` passed 5 files / 43 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `20260621T001851Z-831579` with 9/9 cases and 39/39 assertions.
- [EVIDENCE] `pnpm run eval:krn-proposal-promotion` passed run `20260621T001902Z-831734` with 11/11 cases and 39/39 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `20260621T001910Z-831930` with 5/5 modules, 21/21 cases, and 70/70 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: exact `init_context_pointers` payload, `KrnContextPointerIndex`, shared `init_bootstrap` proposal/promotion boundary, no-overwrite `.krn/context/index.json` apply path, and focused init/promotion eval cases because each protects context bootstrap without memory bodies or active-goal truth.
- [SIMPLIFY] Delete/avoid: no full `KrnContextPacket` during init, no memory body store, no broad `docs/memory/**` context dump, no copied `goal-038` or canonical draft text, no dashboard/API/cloud sync, and no parallel context writer outside proposal promotion.
- [SIMPLIFY] Next candidate: extract shared init bootstrap seed fixtures or a target registry only if eval baseline, skill wiring, or policy boundaries create meaningful duplication pressure; do not refactor solely for aesthetics.
- [OVERCLAIM] This slice proves one reviewed exact absent-`.krn/context/index.json` apply boundary. It does not prove context packet quality, final context retrieval quality, broad repo bootstrap usefulness, merge-mode safety, dashboard/API readiness, final memory quality, or productivity lift.
- [NEXT] Commit and push this checkpoint; then continue with eval baseline, skill wiring, policy boundaries, or repo-bootstrap readiness.
- [FACT] Fifth reviewed `krn init` apply-target slice added `krn init --proposal eval_baseline` and `krn init --apply eval_baseline --proposal-path <path> --decision-path <path>`.
- [FACT] `krn init --apply eval_baseline` reads an existing `init_bootstrap` proposal and approved review decision, builds a `KrnProposalPromotion` with `promotion_scope: "approved_init_bootstrap_only"`, and writes `.krn/evals/baseline.json` only from the exact `init_eval_baseline` payload when the target is absent.
- [FACT] `KrnControlPlaneProposal` now supports exact `init_eval_baseline` payloads only for `init_bootstrap` proposals targeting `.krn/evals/baseline.json`, while the shared promotion boundary still rejects target mismatches, unsafe paths, existing targets, and unapproved decisions.
- [FACT] The generated eval baseline seed is a minimal `krn-eval-baseline.v1` lane-policy boundary for core/current verification. It forbids lab/all default lanes and productivity-lift claims; it does not copy live eval report IDs, active `goal-038` text, canonical draft text, dashboard state, API sync, or memory-core truth.
- [EVIDENCE] Pre-edit gate passed after rephrasing blocked-surface negations into positive scope: `pnpm run krn -- gate --task "Mechanism: add exact reviewed init eval_baseline payload that seeds .krn/evals/baseline.json with core current eval lane pointers only. Scope: packages contracts eval baseline parser, packages cli init proposal apply target, proposal promotion allowlist, focused tests evals docs. Consumer: typed consumer through krn init proposal apply eval_baseline plus krn init and proposal promotion evals. Verification: focused contract cli mcp tests, init eval, proposal promotion eval, pnpm typecheck, git diff check. Rollback kill: remove eval_baseline payload parser if it duplicates krn eval lane contract or increases review burden without target consumer. Hardcoded truth: no live report ids, active goal text, memory bodies, source lists, lab default, all lane default, or lift claims. Skills: typescript contract engineer and eval designer loaded. Simplify: review diff stat and extract shared target registry only if this fifth target creates meaningful duplication pressure. Overclaim: proves one reviewed eval baseline seed write only, not eval quality or product lift." --path packages/cli/src/init.ts` wrote `.krn/gates/20260621T002543Z-840220/engineering-gate.json`.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/eval-baseline.test.ts packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-promotion-store.test.ts packages/cli/test/init-dry-run.test.ts` passed 5 files / 48 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `20260621T003926Z-867354` with 10/10 cases and 45/45 assertions.
- [EVIDENCE] `pnpm run eval:krn-proposal-promotion` passed run `20260621T003935Z-868414` with 12/12 cases and 44/44 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `20260621T003944Z-869212` with 5/5 modules, 22/22 cases, and 76/76 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: exact `init_eval_baseline` payload, `KrnEvalBaseline`, shared `init_bootstrap` proposal/promotion boundary, no-overwrite `.krn/evals/baseline.json` apply path, focused init/promotion eval cases, and lab/all/lift-claim rejection because each protects repo bootstrap verification without broad lab/default benchmark drift.
- [SIMPLIFY] Delete/avoid: no live eval report IDs in the seed, no default lab/all lane, no productivity-lift claim, no dashboard/benchmark/API/cloud sync, no copied active report/source lists, and no parallel eval-baseline writer outside proposal promotion.
- [SIMPLIFY] Next candidate: extract a shared init bootstrap target registry or exact seed fixture builder if skill wiring or policy boundaries add a sixth target and duplicate payload logic becomes meaningful; separately repair `krn gate` wording so negated phrases like "without dashboard/benchmark" do not false-block a valid narrow task.
- [OVERCLAIM] This slice proves one reviewed exact absent-`.krn/evals/baseline.json` apply boundary. It does not prove eval quality, broad repo bootstrap usefulness, merge-mode safety, dashboard/API readiness, final memory quality, research-brain quality, or productivity lift.
- [NEXT] Commit and push this checkpoint; then continue with skill wiring, policy boundaries, repo-bootstrap readiness, or the narrow gate false-positive repair if it blocks autonomous work.
- [FACT] Sixth reviewed `krn init` apply-target slice added `KrnPolicyBoundaries`, `krn init --proposal policy_boundaries`, and `krn init --apply policy_boundaries --proposal-path <path> --decision-path <path>`.
- [FACT] `krn init --apply policy_boundaries` reads an existing `init_bootstrap` proposal and approved review decision, builds a `KrnProposalPromotion` with `promotion_scope: "approved_init_bootstrap_only"`, and writes `.krn/policies/boundaries.json` only from the exact `init_policy_boundaries` payload when the target is absent.
- [FACT] `KrnControlPlaneProposal` now supports exact `init_policy_boundaries` payloads only for `init_bootstrap` proposals targeting `.krn/policies/boundaries.json`, while the shared promotion boundary still rejects target mismatches, unsafe paths, existing targets, and unapproved decisions.
- [FACT] The generated policy boundary seed is a minimal `krn-policy-boundaries.v1` boundary for local-first reviewed policies. It requires approval for target-file mutation, blocks repo-local memory-core writes, requires source acceptance handling, warns on command execution, blocks dashboard/API expansion, and forbids unreviewed target writes, repo-local memory bodies, dashboard-first work, benchmark defaults, cloud-sync defaults, and productivity-lift claims.
- [EVIDENCE] Pre-edit gate passed: `pnpm run krn -- gate --task "Mechanism: add exact reviewed init policy_boundaries payload that seeds .krn/policies/boundaries.json with local policy boundary IDs and approval rules only. Scope: packages contracts policy boundaries parser, packages cli init proposal apply target, proposal promotion allowlist, focused tests evals docs. Consumer: typed consumer through krn init proposal apply policy_boundaries plus krn init and proposal promotion evals. Verification: focused contract cli mcp tests, init eval, proposal promotion eval, pnpm typecheck, git diff check. Rollback kill: remove policy_boundaries payload parser if it duplicates AGENTS prose or increases review burden without target consumer. Hardcoded truth: no live report ids, active goal text, memory bodies, source lists, cloud sync default, dashboard state, or lift claims. Skills: typescript contract engineer and eval designer loaded. Simplify: review diff stat and extract shared target registry only if this sixth target creates meaningful duplication pressure. Overclaim: proves one reviewed policy boundary seed write only, not hook enforcement security quality or product lift." --path packages/cli/src/init.ts` wrote `.krn/gates/20260621T004953Z-906474/engineering-gate.json`.
- [EVIDENCE] Focused tests: `pnpm exec vitest run packages/contracts/test/policy-boundaries.test.ts packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-promotion-store.test.ts packages/cli/test/init-dry-run.test.ts` passed 5 files / 50 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `20260621T010539Z-940200` with 11/11 cases and 51/51 assertions.
- [EVIDENCE] `pnpm run eval:krn-proposal-promotion` passed run `20260621T010539Z-940190` with 13/13 cases and 49/49 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `20260621T010833Z-948348` with 5/5 modules, 23/23 cases, and 82/82 assertions.
- [EVIDENCE] `pnpm typecheck` passed.
- [SIMPLIFY] Keep: exact `init_policy_boundaries` payload, `KrnPolicyBoundaries`, shared `init_bootstrap` proposal/promotion boundary, no-overwrite `.krn/policies/boundaries.json` apply path, focused init/promotion eval cases, and explicit hook/security/lift overclaim rejection because each protects future policy/hook work from becoming prose-only instructions.
- [SIMPLIFY] Delete/avoid: no live hook enforcement claim, no security-quality claim, no dashboard/API/cloud sync, no repo-local memory-core allowance, no copied active source/memory truth, no broad policy framework, and no parallel policy writer outside proposal promotion.
- [SIMPLIFY] Next candidate: `skill_wiring` or repo-bootstrap readiness; extract a shared init target registry/fixture builder first only if the seventh target would otherwise keep duplicating exact seed logic across CLI/tests/evals.
- [OVERCLAIM] This slice proves one reviewed exact absent-`.krn/policies/boundaries.json` apply boundary. It does not prove hook enforcement, prompt-injection safety, broad API permissioning, dashboard usefulness, final memory quality, broad repo bootstrap usefulness, merge-mode safety, or productivity lift.
- [NEXT] Commit and push this checkpoint; then continue with skill wiring, repo-bootstrap readiness, or a narrow init-target registry simplification.
- [FACT] `krn gate` false-positive repair now distinguishes broad forbidden-surface expansion from explicitly negated hardcoded-truth boundaries such as `no cloud sync`, `no dashboard state`, and `no benchmark default`.
- [FACT] The blocked-surface classifier remains a small local check in `packages/cli/src/gate.ts`; it is not a policy engine, hook enforcement layer, security checker, or semantic reviewer.
- [EVIDENCE] The valid init-target registry simplification gate was incorrectly blocked in `.krn/gates/20260621T011234Z-953702/engineering-gate.json` and `.krn/gates/20260621T011255Z-954027/engineering-gate.json` because forbidden surfaces appeared inside negated boundaries.
- [EVIDENCE] The repair pre-edit gate passed and wrote `.krn/gates/20260621T011343Z-954896/engineering-gate.json`.
- [EVIDENCE] Focused gate regression tests passed after the classifier repair: `pnpm exec vitest run packages/contracts/test/engineering-gate.test.ts packages/cli/test/gate.test.ts` passed 2 files / 7 tests.
- [EVIDENCE] The original init-target registry simplification gate passed with negated forbidden-surface boundaries at `.krn/gates/20260621T011508Z-956403/engineering-gate.json` and again after ledger/spec updates at `.krn/gates/20260621T011930Z-961651/engineering-gate.json`.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T011930Z-961640/report.json` with 5/5 modules, 23/23 cases, and 82/82 assertions passing.
- [EVIDENCE] `pnpm typecheck` passed.
- [SIMPLIFY] Keep: a clause-local negation filter plus one known-good regression test because it preserves goal-038 hardcoded-truth boundaries without weakening the broad-surface block.
- [SIMPLIFY] Delete/avoid: no natural-language policy framework, no dashboard/API/benchmark exception list outside the gate, no hook/security claim, and no broad rewrite of `krn gate`.
- [OVERCLAIM] This repair proves only that negated forbidden-surface boundary text no longer false-blocks a scoped task. It does not prove that unsafe dashboard/API/benchmark expansion is semantically impossible, that hooks enforce policy, or that KRN improved productivity.
- [NEXT] Resume the previously selected init-target registry simplification, or choose `skill_wiring` / repo-bootstrap readiness if the registry duplication is not the current bottleneck.
- [FACT] Init target registry simplification extracted stable bootstrap target metadata in `packages/cli/src/init.ts` and reused it for CLI capability parsing, usage text, manifest `bootstrap_plan`, and proposal title/rationale metadata.
- [FACT] Before the exact skill-wiring slice, `skill_wiring` remained in the dry-run bootstrap plan but stayed out of proposal/apply capability routing until an exact payload boundary existed.
- [FACT] `packages/cli/src/init-bootstrap.ts` keeps explicit exact-payload builders and payload assertions; the registry does not weaken the reviewed promotion boundary.
- [EVIDENCE] Focused init tests passed: `pnpm exec vitest run packages/cli/test/init-dry-run.test.ts` passed 1 file / 10 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `.krn/evals/krn-init-contracts/20260621T012647Z-967649/report.json` with 11/11 cases and 51/51 assertions passing.
- [EVIDENCE] `pnpm run eval:krn-proposal-promotion` passed run `.krn/evals/krn-proposal-promotion/20260621T012647Z-967659/report.json` with 13/13 cases and 49/49 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T012702Z-967930/report.json` with 5/5 modules, 23/23 cases, and 82/82 assertions passing.
- [EVIDENCE] `pnpm typecheck` passed.
- [SIMPLIFY] Keep from the registry slice: one stable init target registry for target metadata and explicit payload builders in `init-bootstrap.ts`.
- [SIMPLIFY] Delete/avoid from the registry slice: no generic scaffold framework, no registry-driven file content generation, no dashboard/API/bootstrap readiness claim from this cleanup, and no `skill_wiring` apply support before its exact payload exists.
- [OVERCLAIM] This slice proves maintainability cleanup and target-routing consistency only. It does not prove a new bootstrap capability, skill quality, repo-bootstrap readiness, merge-mode safety, final memory quality, hook enforcement, security quality, or productivity lift.
- [NEXT] Continue with `skill_wiring` exact payload boundary or repo-bootstrap readiness; do not do another init registry cleanup unless a real consumer creates new duplication.
- [EVIDENCE] The `skill_wiring` pre-edit engineering gate passed and wrote `.krn/gates/20260621T013244Z-972253/engineering-gate.json`.
- [FACT] `skill_wiring` now targets `.agents/skills/README.md` through `init_skill_wiring` promotion payload, `krn init --proposal skill_wiring`, and `krn init --apply skill_wiring`.
- [FACT] The skill-wiring seed is an exact reviewed file payload only. It forbids copied active skill bodies, runtime evidence in skill text, durable memory bodies in repo-local skills, active skill-quality claims, hook/security claims, dashboard/API state, and productivity-lift claims.
- [FACT] `.agents/skills/README.md` is detected by `krn init`, planned as `proposal_only`, collision-checked, and written only through approved proposal review plus exact promotion.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/init-manifest.test.ts packages/mcp/test/proposal-promotion-store.test.ts packages/cli/test/init-dry-run.test.ts` passed 4 files / 45 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `.krn/evals/krn-init-contracts/20260621T014223Z-982474/report.json` with 12/12 cases and 57/57 assertions passing.
- [EVIDENCE] `pnpm run eval:krn-proposal-promotion` passed run `.krn/evals/krn-proposal-promotion/20260621T014223Z-982484/report.json` with 14/14 cases and 54/54 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T014250Z-983143/report.json` with 5/5 modules, 24/24 cases, and 88/88 assertions passing.
- [EVIDENCE] `pnpm typecheck` passed.
- [SIMPLIFY] Keep: one exact skill-wiring seed payload, one target path, one proposal/apply consumer, and tests/evals that reject copied skill bodies or active-goal truth by behavior.
- [SIMPLIFY] Delete/avoid: no generated skill folders, no copied SKILL.md bodies, no generic scaffold engine, no skill registry/dashboard/API expansion, no hook/security/skill-quality claim, and no repo-local memory-core fiction.
- [OVERCLAIM] This slice proves only the reviewed exact `skill_wiring` seed write boundary. It does not prove skill quality, trigger quality, skill eval quality, hook enforcement, security quality, broad repo bootstrap readiness, memory-core quality, dashboard/API readiness, or productivity lift.
- [NEXT] Move to repo-bootstrap readiness: prove the existing reviewed init targets compose into a usable minimal bootstrap workflow in an isolated target without broad scaffolding, hardcoded product truth, repo-local memory-core writes, or another metadata cleanup.
- [EVIDENCE] The repo-bootstrap readiness pre-edit gate passed and wrote `.krn/gates/20260621T014810Z-1003888/engineering-gate.json`.
- [FACT] The reviewed init targets now have an isolated composition proof: `krn init --dry-run`, each `krn init --proposal <capability>`, approved review decisions, each `krn init --apply <capability>`, and a second `krn init --dry-run` that marks the reviewed bootstrap targets as `skip`.
- [FACT] The composition proof parses the generated source graph, context pointer index, eval baseline, and policy boundaries after all target writes, and verifies that the target does not create `docs/memory/**`, `.krn/memory/**`, dashboard/API state, copied `goal-038`, or copied canonical draft truth.
- [EVIDENCE] Focused test passed: `pnpm exec vitest run packages/cli/test/init-dry-run.test.ts` passed 1 file / 11 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `.krn/evals/krn-init-contracts/20260621T015352Z-1016328/report.json` with 13/13 cases and 62/62 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T015415Z-1016808/report.json` with 5/5 modules passing.
- [EVIDENCE] `pnpm typecheck` passed.
- [SIMPLIFY] Keep: one composition readiness case, the existing proposal/review/promotion spine, exact target payloads, and post-apply dry-run `skip` detection because they prove the bootstrap pieces work together without adding a new broad scaffold command.
- [SIMPLIFY] Delete/avoid: no `apply-all`, no direct dry-run mutation, no repo-local memory core, no generated active skills, no dashboard/API state, no copied active goal/canonical draft truth, and no second init registry abstraction.
- [OVERCLAIM] This slice proves isolated local reviewed-bootstrap composition only. It does not prove merge-mode safety for existing files, final skill quality, final memory quality, hook/security enforcement, broad API/dashboard readiness, fresh-repo dogfood success, or productivity lift.
- [NEXT] Move to the capability dogfood loop: prove KRN can take one real repo capability task, build bounded context from existing MemoryStore/source boundaries, run through reviewed bootstrap/task evidence, verify with focused tests/evals, and record keep/kill/revisit without adding another passive init, memory, dashboard, benchmark, or API layer.

### 2026-06-21 Autonomous Direction Reset

- [DECISION] The active goal is full final-product execution, not MVP/v0/prototype framing. Slices remain tightly scoped only as dependency-ordered carriers of the final architecture.
- [DECISION] Before the next product surface, run cleanup/condense on repo sediment: stale goal routing, duplicate source truth, unconsumed eval/lab surfaces, hardcoded local paths, weak skill routing, and monolith pressure.
- [DECISION] KRN-to-build-KRN is a future gated capability. Use KRN's own layers only where the layer already has a typed boundary, consumer, verification, rollback/kill, and overclaim boundary.
- [DECISION] `codex exec` is not the default overnight loop. It may be used only as a bounded worker/eval lane with a hypothesis, trace, budget, and stop condition.
- [FACT] Root routing and memory-index links are being cleaned from repo-specific absolute paths so the repo stays portable and does not encode one operator workspace as product truth.
- [EVIDENCE] The first route-correction pre-edit gate was blocked at `.krn/gates/20260621T020759Z-1032448/engineering-gate.json`; the narrowed route-correction gate passed at `.krn/gates/20260621T020902Z-1033513/engineering-gate.json`.
- [EVIDENCE] Post-correction stale-router check passed: no repo-specific absolute workspace links, stale previous-next markers, or stale source-coverage counters remain in the active router/canonical files.
- [EVIDENCE] Focused test passed after the route correction: `pnpm exec vitest run packages/cli/test/init-dry-run.test.ts` passed 1 file / 11 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `.krn/evals/krn-init-contracts/20260621T021814Z-1065632/report.json` with 13/13 cases and 62/62 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T021929Z-1068166/report.json`.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [NEXT] After committing the repo-bootstrap composition proof and this routing correction, choose the first capability dogfood task that writes code and measures review-burden/diff-risk/context-use evidence instead of adding another report family.
- [EVIDENCE] The eval-monolith cleanup pre-edit gate passed and wrote `.krn/gates/20260621T022113Z-1070199/engineering-gate.json`.
- [FACT] The reviewed-bootstrap composition behavior moved from `packages/evals/src/validate-krn-init.ts` into `packages/evals/src/krn-init-reviewed-bootstrap.ts`, leaving the public eval runner as the consumer and dispatcher.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `.krn/evals/krn-init-contracts/20260621T022551Z-1074652/report.json` with 13/13 cases and 62/62 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T022619Z-1075524/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` passed.
- [SIMPLIFY] Keep: one composition helper, one consumer, unchanged eval case IDs, and the existing exact proposal/review/apply assertions.
- [SIMPLIFY] Delete/avoid: no new eval family, no dashboard/API surface, no broad scaffold command, no memory-core fiction, and no second bootstrap truth source.
- [SIMPLIFY] Next candidate: collapse the repeated individual bootstrap apply case scaffolding only when the next touched capability needs it; do not refactor every init case from momentum.
- [OVERCLAIM] This slice proves maintainability cleanup and public runner parity only. It does not prove product lift, final bootstrap merge safety, memory quality, source quality, skill quality, hook enforcement, dashboard usefulness, or capability dogfood success.
- [NEXT] Start the first capability dogfood task: use the existing MemoryStore/context/source/review/eval boundaries on a real KRN code change, then record keep/kill/revisit with review-burden, diff-risk, context-use, and overclaim evidence.
- [EVIDENCE] `krn context build` dogfood packet wrote `.krn/context/20260621T022824Z-1078782/context-packet.json` for the init-eval refactor, selected `memory:mem-goal-038-memory-boundary` and `memory:mem-goal-038-simplify-cadence`, and rejected `docs/memory/** full scan`, `.krn/** as memory core`, and stale expanded-arena lab context.
- [EVIDENCE] The exact refactor pre-edit gate passed and wrote `.krn/gates/20260621T022843Z-1079128/engineering-gate.json`.
- [FACT] Individual reviewed init bootstrap apply cases now use `applyReviewedBootstrapCapability(...)` from `packages/evals/src/krn-init-reviewed-bootstrap.ts` instead of duplicating proposal, review-decision, promotion, and exact-target plumbing in `packages/evals/src/validate-krn-init.ts`.
- [FACT] `packages/evals/src/validate-krn-init.ts` dropped from 1105 lines before the cleanup helper to 721 lines after the dogfood refactor; the helper is 199 lines and has the public eval runner as its consumer.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `.krn/evals/krn-init-contracts/20260621T023356Z-1097101/report.json` with 13/13 cases and 62/62 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T023409Z-1098238/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one reviewed-bootstrap helper, unchanged eval case IDs, per-capability semantic assertions, context packet evidence, gate evidence, and core eval coverage.
- [SIMPLIFY] Delete/avoid: no new eval family, no broad benchmark run, no dashboard/API surface, no passive research doc, no copied memory body, and no hardcoded active goal/source truth in product code.
- [SIMPLIFY] Next candidate: pick the next real product bottleneck by consumer pressure, not by old init momentum; inspect CLI command monolith or MemoryStore/source boundaries only if the next capability task touches them.
- [OVERCLAIM] This dogfood proves bounded context/gate/useful-code-cleanup wiring on one KRN task. It does not prove self-growing autonomy, final memory quality, productivity lift, source quality, review-burden reduction across users, or final product completion.
- [NEXT] Continue with a consumer-led product slice: either use MemoryStore/context/source/review boundaries on the next real code capability, or stop and simplify another touched monolith only when the next task creates that pressure.

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
