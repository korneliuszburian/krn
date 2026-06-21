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

## Autonomous Continuation Policy

When the operator is away, continue only while the next action is a consumed
final-product slice with a named mechanism, consumer, verification surface,
rollback/kill path, and overclaim boundary.

The autonomous path is:

```text
read active selectors
  -> run pre-edit gate for the exact slice
  -> build bounded context when MemoryStore/source boundaries are relevant
  -> edit one consumed product surface
  -> run focused tests and typecheck
  -> run one core/current verification pass if the slice changes product behavior
  -> run simplify/condense
  -> semantic commit and push
  -> choose the next consumed slice or stop with status
```

Hard stops:

- do not run unbounded `codex exec` loops;
- do not repeat the same eval/check without changing the failing mechanism;
- do not add dashboard, benchmark, broad API/cloud sync, research runtime, or
  passive docs while the next consumed code surface is unclear;
- do not keep editing when the consumer, rollback, or verification cannot be
  named honestly;
- after two consecutive failures with the same root cause, create or update a
  repair handoff instead of trying random fixes;
- do not commit runtime/cache artifacts from `.krn/**` unless the user
  explicitly asks for runtime evidence to be versioned;
- leave unrelated user/other-agent changes uncommitted.

Commit cadence:

- commit after each verified semantic slice;
- prefer one commit per mechanism;
- push after the commit is locally verified;
- never batch unrelated cleanup, product behavior, and docs direction changes
  into one commit unless the active slice explicitly requires all of them.

This policy is meant to accelerate final-product execution, not slow it down.
It blocks only loops that create proof-shaped artifacts without changing a
current product consumer.

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

[FACT] The first dogfood finding became a product fix: `krn context build`
selects `typescript-contract-engineer` from TypeScript target paths even when
the task text omits TypeScript keywords.

[FACT] The same context routing path now selects `eval-designer` from
`packages/evals/**` and `docs/evals/**` target paths even when task text omits
eval keywords.

[FACT] `krn brief` now derives runtime `source_refs` from selected
MemoryStore `source_lineage`; the operating brief parser rejects source refs
that are not backed by selected context lineage.

[FACT] `krn review` now derives memory-specific source refs from selected
MemoryStore `source_lineage`; the review-report parser requires top-level
source refs to include selected memory lineage while allowing stable spec/eval
refs.

[FACT] MemoryStore application guidance no longer names `goal-038` directly in
review questions; runtime guidance refers to active goal evidence instead.

[FACT] The `krn init` static bootstrap target registry now lives in
`packages/cli/src/init-targets.ts`; `packages/cli/src/init.ts` remains the
manifest/proposal/apply runtime module.

[FACT] `docs/specs/technology-stack/decision.md` now names `goal-038` as the
active final-product execution contract and `goal-006` as historical evidence.

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
- [EVIDENCE] The context-skill-routing pre-edit gate passed and wrote `.krn/gates/20260621T023541Z-1104083/engineering-gate.json`.
- [EVIDENCE] Pre-fix dogfood exposed a practical routing weakness: the init-eval refactor context packet selected `eval-designer` but not `typescript-contract-engineer` for a TypeScript file when the task text did not carry the right keyword.
- [FACT] `krn context build` now routes `typescript-contract-engineer` when `--path` ends in `.ts`, `.tsx`, `.mts`, or `.cts`, not only when the task text contains TypeScript-like words.
- [EVIDENCE] Focused test passed: `pnpm exec vitest run packages/cli/test/context.test.ts` passed 1 file / 1 test, with task text omitting TypeScript keywords and target path `packages/contracts/src/context-packet.ts`.
- [EVIDENCE] Post-fix runtime context packet `.krn/context/20260621T023656Z-1107950/context-packet.json` selected `goal-execplan` and `typescript-contract-engineer`, selected memory IDs `mem-goal-038-memory-boundary` / `mem-goal-038-simplify-cadence`, and rejected full memory dumps plus stale lab context.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T023709Z-1108651/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: target-path skill routing, one small path classifier, one public CLI behavior test, and runtime context evidence.
- [SIMPLIFY] Delete/avoid: no skill registry expansion, no new skill text, no broad operator-pipeline rewrite, no passive memory note, and no default context growth.
- [OVERCLAIM] This slice proves one context-routing repair caused by dogfood. It does not prove all skill triggers are correct, final context quality, productivity lift, or autonomous self-growth.
- [NEXT] Continue with another consumer-led dogfood slice only if it exposes a real capability bug or cleanup bottleneck; otherwise run a small repo sediment inventory before choosing the next product layer.
- [EVIDENCE] The eval-target context-routing pre-edit gate passed and wrote `.krn/gates/20260621T023913Z-1111473/engineering-gate.json`.
- [FACT] `krn context build` now routes `eval-designer` from `packages/evals/**` and `docs/evals/**` target paths, not only from task-text keywords.
- [EVIDENCE] Focused test passed: `pnpm exec vitest run packages/cli/test/context.test.ts` passed 1 file / 2 tests, including an eval-target path with task text omitting eval keywords.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T024021Z-1112909/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: target-path routing for eval surfaces, shared public CLI test helper, and no new skill body or registry.
- [SIMPLIFY] Delete/avoid: no broad skill taxonomy, no social/research note, no dashboard/API surface, no new eval module.
- [OVERCLAIM] This proves only deterministic skill routing for eval target paths. It does not prove eval quality, skill quality, broad agent behavior, or productivity lift.
- [NEXT] Run a small sediment inventory before the next product slice; do not keep patching context routing unless another real dogfood miss appears.
- [EVIDENCE] Small sediment inventory selected `packages/cli/src/main.ts` as the next product bottleneck after lab-only benchmark files; it was 1119 lines and still owned eval argument parsing, eval module registry, eval execution, summary aggregation, report writing, and command dispatch.
- [EVIDENCE] The eval CLI extraction pre-edit gate passed and wrote `.krn/gates/20260621T024158Z-1114795/engineering-gate.json`; the context packet wrote `.krn/context/20260621T024211Z-1115064/context-packet.json` and selected the goal-038 memory boundary plus simplify cadence while rejecting broad memory/lab context.
- [FACT] `krn eval` command behavior moved from `packages/cli/src/main.ts` into `packages/cli/src/eval.ts`; `main.ts` now imports `parseEvalArgs`, `buildKrnEvalReport`, and `writeKrnEvalReport` and keeps only command dispatch for eval.
- [FACT] `packages/cli/src/main.ts` dropped from 1119 lines before the extraction to 574 lines after it; `packages/cli/src/eval.ts` is 548 lines and has the public CLI eval path as its consumer.
- [EVIDENCE] Narrow CLI check passed: `pnpm exec tsc --noEmit --pretty false --project packages/cli/tsconfig.json`.
- [EVIDENCE] Focused eval CLI test passed: `pnpm exec vitest run packages/cli/test/eval.test.ts` passed 1 file / 3 tests.
- [EVIDENCE] `pnpm run eval:krn-eval` passed run `.krn/evals/krn-eval-contracts/20260621T025016Z-1127238/report.json` with 5/5 cases and 12/12 assertions passing; generated aggregate report `.krn/eval/20260621T025014Z-1127238/report.json` parsed through the eval contract.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T025106Z-1133495/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one eval command module, unchanged public CLI command, unchanged lane policy, parser-first generated report validation, and the focused CLI/eval contract tests.
- [SIMPLIFY] Delete/avoid: no dashboard/API/benchmark expansion, no new eval family, no `codex exec` loop, no passive doc, no copied memory body, and no duplicate eval registry in `main.ts`.
- [SIMPLIFY] Next candidate: move active eval module descriptors out of product code into a typed registry/config boundary if another slice touches eval routing; the current extraction removed the monolith pressure but did not yet make the registry data-backed.
- [OVERCLAIM] This slice proves maintainability cleanup and public eval CLI parity only. It does not prove better eval quality, productivity lift, final eval registry architecture, dashboard usefulness, API readiness, or final memory quality.
- [EVIDENCE] The eval registry boundary pre-edit gate passed and wrote `.krn/gates/20260621T025317Z-1145043/engineering-gate.json`.
- [FACT] Active `krn eval` module descriptors moved from TypeScript code into `docs/evals/registry.json`, parsed through `KrnEvalModuleRegistry` in `@krn/contracts` before lane selection.
- [FACT] `packages/cli/src/eval.ts` now reads `docs/evals/registry.json` as unknown JSON, parses it through `parseKrnEvalModuleRegistry`, and uses typed descriptors for default, lane, and custom module selection.
- [FACT] `packages/evals/src/validate-krn-eval.ts` and `packages/cli/test/eval.test.ts` now derive expected default/current/lab modules from the typed registry instead of keeping local active-module lists.
- [FACT] `packages/cli/src/eval.ts` dropped from 548 lines after the extraction slice to 362 lines after moving the registry out of code; `packages/cli/src/main.ts` remains 574 lines.
- [EVIDENCE] Focused contract tests passed: `pnpm exec vitest run packages/contracts/test/eval-module-registry.test.ts packages/contracts/test/eval-report.test.ts` passed 2 files / 7 tests.
- [EVIDENCE] Focused CLI eval test passed: `pnpm exec vitest run packages/cli/test/eval.test.ts` passed 1 file / 3 tests through the registry-backed path.
- [EVIDENCE] Narrow no-emit checks passed for `packages/contracts/tsconfig.json` and `packages/cli/tsconfig.json`.
- [EVIDENCE] `pnpm run eval:krn-eval` passed run `.krn/evals/krn-eval-contracts/20260621T030220Z-1160532/report.json` with 6/6 cases and 14/14 assertions passing, including the registry parse plus duplicate-module known-bad case.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T030308Z-1162239/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one typed eval registry, one parser, one CLI consumer, registry-derived eval expectations, and one duplicate-module known-bad fixture.
- [SIMPLIFY] Delete/avoid: no active eval module list in product code, no duplicated module list in the eval validator or README, no dashboard/API/benchmark expansion, no broad registry service, and no productivity-lift claim.
- [OVERCLAIM] This slice proves data-backed eval module routing and parser-backed registry validation only. It does not prove eval quality, final registry UX, source freshness quality, product lift, API readiness, or dashboard usefulness.
- [NEXT] Continue cleanup/condense by selecting the next product bottleneck from current code pressure, not by adding another eval or dashboard surface. Good candidates: `packages/cli/src/init.ts` size/target boundaries, duplicate docs/source truth, or MemoryStore/source graph hardcoded fixtures if a real consumer touches them.
- [EVIDENCE] The doctor extraction pre-edit gate passed and wrote `.krn/gates/20260621T030521Z-1167089/engineering-gate.json`.
- [FACT] `krn doctor` command behavior moved from `packages/cli/src/main.ts` into `packages/cli/src/doctor.ts`; `main.ts` now keeps only doctor command dispatch.
- [FACT] Doctor runtime source refs moved from historical `goal-006` / compatibility product plan to active `goal-038`, `docs/specs/krn-doctor/README.md`, and `docs/plans/canonical/draft.md`.
- [FACT] `packages/cli/src/main.ts` dropped from 574 lines to 378 lines; `packages/cli/src/doctor.ts` is 198 lines and has the public doctor CLI path as its consumer.
- [EVIDENCE] Focused doctor tests passed: `pnpm exec vitest run packages/cli/test/doctor.test.ts packages/contracts/test/doctor-report.test.ts` passed 2 files / 4 tests.
- [EVIDENCE] Narrow CLI no-emit check passed: `pnpm exec tsc --noEmit --pretty false --project packages/cli/tsconfig.json`.
- [EVIDENCE] `pnpm run eval:krn-doctor` passed run `.krn/evals/krn-doctor-contracts/20260621T030756Z-1169414/report.json` with 3/3 cases and 7/7 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T030806Z-1169728/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one doctor module, unchanged public command, active source refs, focused doctor tests/eval, and no new registry.
- [SIMPLIFY] Delete/avoid: no behavior expansion, no readiness-quality claim, no dashboard/API/benchmark surface, no research-pack refactor in the same slice, and no copied goal/canonical text.
- [SIMPLIFY] Resolved later: the remaining stale `goal-006` source refs in `research-pack` scaffold/main path were cleaned by the following research-pack extraction slice; otherwise inspect `packages/cli/src/init.ts` target-boundary pressure only when another init capability is touched.
- [OVERCLAIM] This slice proves doctor command extraction and source-ref freshness only. It does not prove readiness quality, semantic hook correctness, productivity lift, API/MCP readiness, or dashboard usefulness.
- [EVIDENCE] The research-pack cleanup pre-edit gate passed and wrote `.krn/gates/20260621T031145Z-1177187/engineering-gate.json`.
- [FACT] `krn research-pack` scaffold behavior moved from `packages/cli/src/main.ts` into `packages/cli/src/research-pack.ts`; `main.ts` now keeps only research-pack command dispatch.
- [FACT] Research-pack runtime/spec/eval source refs moved from stale `goal-006` to active `goal-038` plus the canonical draft/spec refs while preserving `goal-036` as historical research-pack evidence.
- [FACT] `packages/cli/src/main.ts` dropped from 378 lines to 205 lines; `packages/cli/src/research-pack.ts` is 171 lines and has the public `krn research-pack` CLI path as its consumer.
- [EVIDENCE] Focused research-pack tests passed: `pnpm exec vitest run packages/cli/test/research-pack.test.ts packages/contracts/test/research-pack.test.ts` passed 2 files / 6 tests.
- [EVIDENCE] Narrow CLI no-emit check passed: `pnpm exec tsc --noEmit --pretty false --project packages/cli/tsconfig.json`.
- [EVIDENCE] `pnpm run eval:krn-research-pack` passed run `.krn/evals/krn-research-pack/20260621T031415Z-1191657/report.json` with 3/3 cases and 9/9 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T031431Z-1192192/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one research-pack module, unchanged public command, active source refs, focused research-pack tests/eval, explicit lab-only caveat, and no worker/runtime expansion.
- [SIMPLIFY] Delete/avoid: no long-researcher worker, no dashboard/API/benchmark surface, no new research runtime, no passive research note, no copied memory/source bodies, and no claim that research quality or productivity improved.
- [SIMPLIFY] Next candidate: inspect `packages/cli/src/main.ts` again after the research-pack extraction; if no command helper remains there, shift cleanup pressure to `packages/cli/src/init.ts` or the next consumer-led MemoryStore/review capability rather than inventing another lab surface.
- [OVERCLAIM] This slice proves research-pack scaffold extraction and source-ref freshness only. It does not prove source quality, final research-brain quality, memory promotion correctness, productivity lift, API/MCP readiness, or dashboard usefulness.
- [EVIDENCE] The final main-dispatcher cleanup pre-edit gate passed and wrote `.krn/gates/20260621T031711Z-1197564/engineering-gate.json`.
- [FACT] `parseReviewArgs` moved into `packages/cli/src/review.ts` and `parseBriefArgs` moved into `packages/cli/src/brief.ts`; `packages/cli/src/main.ts` now keeps command usage plus dispatch only.
- [FACT] `packages/cli/src/main.ts` dropped from 205 lines to 123 lines. The diff was ownership-neutral at 84 insertions and 84 deletions across `brief.ts`, `review.ts`, and `main.ts`.
- [EVIDENCE] Focused review/brief tests passed: `pnpm exec vitest run packages/cli/test/brief.test.ts packages/cli/test/review.test.ts packages/contracts/test/operating-brief.test.ts packages/contracts/test/review-report.test.ts` passed 4 files / 9 tests.
- [EVIDENCE] Narrow CLI no-emit check passed: `pnpm exec tsc --noEmit --pretty false --project packages/cli/tsconfig.json`.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T031847Z-1206096/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: parser ownership inside command modules, unchanged public CLI behavior, no shared parser framework, and a thin root dispatcher.
- [SIMPLIFY] Delete/avoid: no new command surface, no common option-parser abstraction for two small parsers, no dashboard/API/benchmark/research runtime work, and no product-truth or memory-truth hardcoding.
- [SIMPLIFY] Next candidate: choose the next slice from real consumer pressure. Good candidates are `packages/cli/src/init.ts` only when touching another init capability, or a MemoryStore/review capability that moves KRN closer to dogfooding its final context/memory loop.
- [OVERCLAIM] This slice proves root dispatcher cleanup and CLI parity only. It does not prove product lift, final memory quality, review-burden reduction, API/MCP readiness, or dashboard usefulness.
- [EVIDENCE] The MemoryStore policy-boundary pre-edit gate passed and wrote `.krn/gates/20260621T032127Z-1218366/engineering-gate.json`.
- [FACT] Local MemoryStore files now parse through exported `KrnLocalMemoryStore` / `parseKrnLocalMemoryStore` contracts instead of a CLI-local zod schema.
- [FACT] Retrieval policy moved out of `packages/cli/src/memory-store.ts` into the typed local store payload: `policy.max_selected`, `policy.selection_policy`, and `policy.rejected_context`.
- [FACT] `krn brief`, `krn context build`, and `krn review` now copy selected/rejected context policy from the local MemoryStore boundary. Runtime reports still store selected IDs, reasons, lineage, rejected context, application guidance, and feedback outcomes, not authoritative memory bodies.
- [FACT] `packages/cli/src/memory-store.ts` dropped from 320 lines before the policy-boundary cleanup to 298 lines; `packages/contracts/src/memory-store.ts` grew from 170 lines to 197 lines because the store parser moved into the contract package.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/memory-store.test.ts packages/cli/test/brief.test.ts packages/cli/test/context.test.ts packages/cli/test/review.test.ts` passed 4 files / 9 tests.
- [EVIDENCE] Narrow no-emit checks passed for `packages/contracts/tsconfig.json` and `packages/cli/tsconfig.json` after rebuilding contracts for updated declaration output.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T032554Z-1228376/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one local MemoryStore policy object, one exported parser, one missing-policy known-bad fixture, existing brief/context/review consumers, and no new memory service abstraction.
- [SIMPLIFY] Delete/avoid: no repo-local memory core, no dashboard/API/cloud sync, no passive memory note, no copied memory bodies in runtime evidence, no hardcoded benchmark goal ranges or `docs/memory/**` rejection policy in CLI code.
- [SIMPLIFY] Next candidate: use this policy-backed MemoryStore boundary in the next real capability dogfood task, or inspect `packages/cli/src/init.ts` only if another reviewed init capability is actually touched.
- [OVERCLAIM] This slice proves local MemoryStore policy parsing and consumption only. It does not prove final memory quality, graph memory, neuroscience-style synthesis, source freshness, review-burden reduction, API/team sync, or productivity lift.
- [EVIDENCE] The operating-brief source-lineage pre-edit gate passed and wrote `.krn/gates/20260621T033010Z-1248837/engineering-gate.json`.
- [FACT] `krn brief` no longer hardcodes active `goal-038`, canonical draft, or source-ledger refs in product code for runtime `source_refs`; it derives them from selected MemoryStore `source_lineage`.
- [FACT] `KrnOperatingBrief` now rejects `source_refs` entries not present in `selected_context.source_lineage` and rejects selected lineage entries missing from top-level `source_refs`.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/operating-brief.test.ts packages/cli/test/brief.test.ts` passed 2 files / 5 tests.
- [EVIDENCE] Narrow no-emit checks passed for `packages/contracts/tsconfig.json` and `packages/cli/tsconfig.json`.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T033228Z-1256262/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one-line brief source-ref derivation, one parser invariant, one public CLI behavior assertion, and the operating-brief example aligned to selected lineage.
- [SIMPLIFY] Delete/avoid: no review/report/dashboard/API cleanup in this slice, no new source service, no passive note, and no copied canonical draft ref in `krn brief` runtime output.
- [SIMPLIFY] Next candidate: inspect `packages/cli/src/review.ts` source-ref constants or `init.ts` target pressure only through a new gate and real consumer; do not broaden this brief cleanup retroactively.
- [OVERCLAIM] This slice proves operating-brief source-ref lineage enforcement only. It does not prove source graph freshness, final memory quality, review-burden reduction, API/team sync, or productivity lift.
- [EVIDENCE] The review source-lineage pre-edit gate passed and wrote `.krn/gates/20260621T033507Z-1259977/engineering-gate.json`.
- [FACT] `krn review` now derives memory-specific finding/proposal source refs and top-level memory refs from selected MemoryStore `source_lineage` instead of hardcoding active goal/canonical source refs for those surfaces.
- [FACT] `KrnReviewReport` now rejects reports whose top-level `source_refs` omit selected memory source lineage while still allowing stable spec/eval refs such as `docs/specs/krn-review/README.md` and `docs/evals/STANDARD.md`.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/review-report.test.ts packages/cli/test/review.test.ts` passed 2 files / 6 tests.
- [EVIDENCE] `pnpm run eval:krn-review` passed run `.krn/evals/krn-review-contracts/20260621T033634Z-1261594/report.json` with 3/3 cases and 9/9 assertions passing.
- [EVIDENCE] Narrow no-emit checks passed for `packages/contracts/tsconfig.json` and `packages/cli/tsconfig.json`.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T033708Z-1262313/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one local `memorySourceRefs` derivation, one parser invariant, public review CLI assertions, stable artifact spec refs, and no new source registry.
- [SIMPLIFY] Delete/avoid: no dashboard/MCP/API/lab cleanup, no broad `goal-006` sweep, no passive source note, and no shared helper abstraction for a one-line local dedupe.
- [SIMPLIFY] Next candidate: inspect hardcoded review artifact/source refs only if the next consumer needs source registry behavior; otherwise move to the next real product bottleneck instead of sweeping all historical fixtures.
- [OVERCLAIM] This slice proves review-report selected-memory lineage enforcement only. It does not prove source freshness, final memory quality, source graph completeness, human review quality, review-burden reduction, API/team sync, or productivity lift.
- [EVIDENCE] The MemoryStore guidance wording pre-edit gate passed and wrote `.krn/gates/20260621T033847Z-1264708/engineering-gate.json`.
- [FACT] Memory application review questions now say `active goal evidence` instead of hardcoding `goal-038` in product guidance.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/memory-store.test.ts packages/cli/test/brief.test.ts packages/cli/test/context.test.ts packages/cli/test/review.test.ts` passed 4 files / 9 tests.
- [EVIDENCE] Narrow no-emit check passed for `packages/cli/tsconfig.json`.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T033938Z-1265878/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one wording change and one runtime-output assertion through `krn brief`.
- [SIMPLIFY] Delete/avoid: no schema change, no new config surface, no broad fixture rewrite, and no claim that the memory application guidance is final-quality.
- [OVERCLAIM] This slice proves removal of one volatile active-goal wording from MemoryStore application guidance only. It does not prove final memory quality, context quality, review quality, or product lift.
- [EVIDENCE] The init target-registry extraction pre-edit gate passed and wrote `.krn/gates/20260621T034133Z-1268080/engineering-gate.json`.
- [FACT] Static init bootstrap target registry and capability parsing moved from `packages/cli/src/init.ts` into `packages/cli/src/init-targets.ts`.
- [FACT] `packages/cli/src/init.ts` dropped from 687 lines before the extraction to 552 lines; `packages/cli/src/init-targets.ts` is 151 lines and has the public `krn init` path as its consumer.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/cli/test/init-dry-run.test.ts packages/contracts/test/init-manifest.test.ts` passed 2 files / 15 tests.
- [EVIDENCE] `pnpm run eval:krn-init` passed run `.krn/evals/krn-init-contracts/20260621T034451Z-1272737/report.json` with 13/13 cases and 62/62 assertions passing.
- [EVIDENCE] Narrow no-emit check passed for `packages/cli/tsconfig.json`.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T034502Z-1273044/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one static target registry module, unchanged public `krn init` behavior, existing proposal/apply boundaries, and no copied product truth.
- [SIMPLIFY] Delete/avoid: no init behavior expansion, no extra abstraction around manifest building, no dashboard/API/MCP work, no broad bootstrap rewrite, and no new eval family.
- [SIMPLIFY] Next candidate: only continue init cleanup if another init capability touches the manifest/apply boundary; otherwise pick the next consumer-led bottleneck.
- [OVERCLAIM] This slice proves init maintainability cleanup and public behavior parity only. It does not prove bootstrap usefulness, fresh-repo adoption, review-burden reduction, memory quality, or product lift.
- [EVIDENCE] The technology-stack status correction pre-edit gate passed and wrote `.krn/gates/20260621T034641Z-1276759/engineering-gate.json`.
- [FACT] `docs/specs/technology-stack/decision.md` now treats `goal-038` as the active final-product execution contract and preserves `goal-006` as historical product-build evidence.
- [EVIDENCE] `rg -n "goal-006|goal-038|active final-product|active execution" docs/specs/technology-stack/decision.md` shows `goal-038` as active and no remaining `goal-006 is active` wording.
- [EVIDENCE] `git diff --check` passed.
- [SIMPLIFY] Keep: TypeScript-first stack decision, historical goal context, and one current active-contract correction.
- [SIMPLIFY] Delete/avoid: no new ADR, no broad source-ledger rewrite, no code changes, no extra skill edits.
- [OVERCLAIM] This slice proves stale stack-decision routing cleanup only. It does not prove TypeScript implementation quality, productivity lift, or final product completion.
- [EVIDENCE] The MCP source-ref freshness pre-edit gate passed and wrote `.krn/gates/20260621T034920Z-1281406/engineering-gate.json`.
- [FACT] MCP read-model and proposal-tool source refs now point at active `goal-038` and `docs/plans/canonical/draft.md` where those surfaces cite current product direction instead of historical `goal-006` / compatibility product-plan refs.
- [FACT] Historical proposal/review fixtures that still validate older proposal payloads were left intact when they remain the source truth for those examples.
- [EVIDENCE] Focused MCP/contract tests passed: `pnpm exec vitest run packages/contracts/test/control-plane-resource.test.ts packages/contracts/test/mcp-proposal-tool.test.ts packages/mcp/test/stdio-server.test.ts packages/mcp/test/proposal-store.test.ts` passed 4 files / 17 tests.
- [EVIDENCE] Narrow MCP no-emit check passed: `pnpm exec tsc --noEmit --pretty false --project packages/mcp/tsconfig.json`.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T035201Z-1286415/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: current source refs on MCP read/proposal metadata, unchanged read-only/proposal-only MCP behavior, and focused parser/server/proposal-store coverage.
- [SIMPLIFY] Delete/avoid: no new MCP/API behavior, no dashboard panel, no benchmark lane, no broad historical fixture rewrite, no passive source note, and no product-truth copy in runtime artifacts.
- [SIMPLIFY] Next candidate: continue cleaning stale source refs only when a touched consumer needs them; otherwise move to the next capability dogfood task instead of doing repo-wide string sweeps.
- [OVERCLAIM] This slice proves MCP metadata source-ref freshness and behavior parity only. It does not prove MCP readiness, security quality, source graph completeness, dashboard usefulness, review-burden reduction, or product lift.
- [EVIDENCE] The spec example portability cleanup pre-edit gate passed and wrote `.krn/gates/20260621T035358Z-1296361/engineering-gate.json`.
- [FACT] User-specific `/home/krn/coding/krn/active/krn-gastown` paths were removed from `docs/specs/**` examples and fixtures and replaced with neutral `/workspace/krn-gastown` example roots.
- [FACT] Runtime behavior was not changed: real KRN runtime reports may still record their actual `target_root`; this cleanup only removes machine-local truth from portable checked-in examples.
- [EVIDENCE] `rg -n '/home/krn/coding/krn/active/krn-gastown' docs/specs packages --glob '!packages/contracts/dist/**'` returned no matches.
- [EVIDENCE] Focused contract suite passed: `pnpm exec vitest run packages/contracts/test` passed 27 files / 126 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T035429Z-1299714/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: neutral portable example roots, existing contract examples/fixtures, and runtime ability to emit actual target roots.
- [SIMPLIFY] Delete/avoid: no parser restriction against real absolute runtime paths, no dashboard/API/benchmark behavior changes, no broad source-ref rewrite, and no new passive documentation.
- [SIMPLIFY] Next candidate: stale `goal-006` refs in dashboard/proposal/benchmark specs should be cleaned only through touched consumers or archived lab/default-lane decisions, not by an unbounded string replacement.
- [OVERCLAIM] This slice proves checked-in example portability only. It does not prove runtime path privacy, source graph correctness, memory quality, dashboard usefulness, review-burden reduction, or product lift.
- [EVIDENCE] The spec portability regression-guard pre-edit gate passed and wrote `.krn/gates/20260621T035601Z-1307490/engineering-gate.json`.
- [FACT] `packages/contracts/test/spec-portability.test.ts` now fails if checked-in `docs/specs/**` content reintroduces user-specific local path prefixes such as `/home/krn/`, `C:\Users\krnij`, or `/mnt/c/Users/krnij`.
- [FACT] The guard protects portable examples and fixtures only; it does not reject legitimate runtime reports that record an actual target root outside checked-in specs.
- [EVIDENCE] Focused guard test passed: `pnpm exec vitest run packages/contracts/test/spec-portability.test.ts` passed 1 file / 1 test.
- [EVIDENCE] Focused contract suite passed: `pnpm exec vitest run packages/contracts/test` passed 28 files / 127 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T035644Z-1309919/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one focused portability guard in the contracts test suite because it protects the spec examples/fixtures just cleaned.
- [SIMPLIFY] Delete/avoid: no new eval module, no parser/product behavior change, no dashboard/API/benchmark work, no broad lint framework, and no runtime path restriction.
- [SIMPLIFY] Next candidate: if another repeated hardcoded-truth class appears, add a focused guard only after a concrete cleanup proves the rule; do not build a general policy engine preemptively.
- [OVERCLAIM] This slice proves regression coverage for local path leakage in checked-in specs only. It does not prove broader secret scanning, path privacy in runtime evidence, source quality, memory quality, or product lift.
- [EVIDENCE] The active proposal/review/promotion source-ref cleanup pre-edit gate passed and wrote `.krn/gates/20260621T035827Z-1316254/engineering-gate.json`.
- [FACT] Active control-plane proposal, proposal-review-decision, and proposal-promotion spec metadata and top-level examples now cite `goal-038` and the canonical draft instead of stale `goal-006` / compatibility product-plan refs.
- [FACT] Embedded `promotion_payload.file_content` historical memory-note text still cites `goal-006` and keeps its existing SHA-256; it was intentionally not rewritten because that payload is fixture content, not the current spec source boundary.
- [FACT] Proposal-store isolated targets now create `docs/goals/goal-038.md` for source-ref validation.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-review-decision.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-store.test.ts` passed 4 files / 37 tests.
- [EVIDENCE] `pnpm run eval:krn-proposal-store` passed run `.krn/evals/krn-proposal-store/20260621T035942Z-1317567/report.json` with 4/4 cases and 9/9 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T035958Z-1317984/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: current source refs at the active spec boundary, historical embedded payload content, proposal-store validation, and focused proposal tests.
- [SIMPLIFY] Delete/avoid: no broad rewrite of historical proposal payloads, no dashboard/API behavior, no benchmark lane, no new registry, and no source graph behavior claim.
- [SIMPLIFY] Next candidate: proposal/dashboard source-ref cleanup should continue only when the touched consumer proves it needs current source metadata; do not rewrite historical lab fixtures by default.
- [OVERCLAIM] This slice proves active control-plane spec source-ref freshness only. It does not prove proposal safety beyond existing validation, final source graph quality, dashboard usefulness, API readiness, review-burden reduction, or product lift.
- [EVIDENCE] The doctor spec-portability check pre-edit gate passed and wrote `.krn/gates/20260621T040133Z-1320155/engineering-gate.json`.
- [FACT] `krn doctor` now includes a `spec-portability` readiness surface: missing `docs/specs` warns, and user-specific local path prefixes in checked-in spec content block the report.
- [FACT] The doctor check protects spec examples/fixtures only. Runtime evidence may still record the actual target root, and this is not a general secret scanner.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/doctor-report.test.ts packages/cli/test/doctor.test.ts` passed 2 files / 5 tests, including a blocked local-path fixture.
- [EVIDENCE] `pnpm run eval:krn-doctor` passed run `.krn/evals/krn-doctor-contracts/20260621T040240Z-1321525/report.json` with 3/3 cases and 7/7 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T040323Z-1322447/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck`, `pnpm exec tsc --noEmit --pretty false --project packages/cli/tsconfig.json`, and `git diff --check` passed.
- [SIMPLIFY] Keep: one doctor check, one contract enum extension, one blocked CLI test, and one updated doctor example.
- [SIMPLIFY] Delete/avoid: no new eval family, no global scanner framework, no runtime path ban, no dashboard/API/benchmark work, and no product-lift claim.
- [SIMPLIFY] Next candidate: if spec portability causes false positives, narrow the checked path set before expanding this into a broader policy engine.
- [OVERCLAIM] This slice proves operator-visible detection of local path leakage in `docs/specs/**` only. It does not prove runtime privacy, secret scanning, source graph quality, memory quality, review-burden reduction, or product lift.
- [EVIDENCE] The doctor eval-registry readiness pre-edit gate passed and wrote `.krn/gates/20260621T040528Z-1324891/engineering-gate.json`.
- [FACT] `krn doctor` now reads `docs/evals/registry.json` through `parseKrnEvalModuleRegistry` and reports default lane plus core/current/lab module counts instead of counting all historical eval case directories.
- [FACT] Invalid eval registry content blocks the doctor report; a missing eval registry warns.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/doctor-report.test.ts packages/cli/test/doctor.test.ts packages/contracts/test/eval-module-registry.test.ts` passed 3 files / 9 tests, including an invalid-registry blocked case.
- [EVIDENCE] `pnpm run eval:krn-doctor` passed run `.krn/evals/krn-doctor-contracts/20260621T040619Z-1326558/report.json` with 3/3 cases and 7/7 assertions passing.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T040635Z-1327881/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one registry-backed doctor readiness check, the existing eval registry parser, focused invalid-registry test, and no change to eval execution behavior.
- [SIMPLIFY] Delete/avoid: no new eval modules, no dashboard/API/benchmark work, no lab-lane execution by doctor, no broad eval redesign, and no productivity-lift claim.
- [SIMPLIFY] Next candidate: if eval count remains misleading in other surfaces, route them to the typed registry instead of duplicating lane lists.
- [OVERCLAIM] This slice proves doctor eval-readiness metadata is registry-backed only. It does not prove eval quality, benchmark validity, dashboard usefulness, review-burden reduction, or product lift.
- [EVIDENCE] The Eval Runs source-lineage cleanup pre-edit gate passed and wrote `.krn/gates/20260621T041136Z-1337446/engineering-gate.json`.
- [FACT] `buildKrnEvalRunsViewModel` no longer hardcodes historical `goal-006` / `goal-016` refs for runtime source refs. Parsed eval reports now carry their own `source_refs`, and the view model only appends its stable spec ref.
- [FACT] Missing or invalid eval-report states now use stable eval/view-model spec refs only, without pretending an active goal or historical goal is their runtime source truth.
- [FACT] The eval-runs view-model contract example was condensed from a stale dashboard-promotion module example to current init/doctor eval evidence and current report-level source lineage.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/mcp/test/eval-runs-view-model.test.ts packages/contracts/test/eval-runs-view-model.test.ts` passed 2 files / 7 tests.
- [EVIDENCE] Focused dashboard test passed: `pnpm --dir apps/dashboard exec vitest run test/eval-runs-dashboard.test.tsx` passed 1 file / 3 tests.
- [EVIDENCE] Narrow MCP no-emit, `pnpm typecheck`, and `git diff --check` passed.
- [SIMPLIFY] Keep: one source-ref derivation helper, one public builder behavior assertion, updated contract example, and no new dashboard/API/eval surface.
- [SIMPLIFY] Delete/avoid: no broad dashboard cleanup, no registry service, no source graph behavior claim, no benchmark execution, no `codex exec`, and no productivity-lift claim.
- [SIMPLIFY] Note: a broad dashboard test run exposed existing pending-review fixture failures for missing `benchmark_reports`; that is parked as a separate touched-consumer issue, not mixed into this Eval Runs source-lineage slice.
- [OVERCLAIM] This slice proves Eval Runs source-ref freshness and data lineage only. It does not prove dashboard usefulness, eval quality, source graph completeness, human review quality, review-burden reduction, or product lift.
- [NEXT] Commit and push this cleanup, then choose the next consumer-led cleanup from live failures or code pressure: either fix the existing Pending Review dashboard fixture/contract drift as a narrow consumer repair, or inspect another hardcoded source-ref surface only when it has a focused test consumer.
- [EVIDENCE] The Pending Review dashboard fixture repair pre-edit gate passed after narrowing around the typed consumer and wrote `.krn/gates/20260621T041744Z-1366002/engineering-gate.json`.
- [FACT] `apps/dashboard/test/pending-review-dashboard.test.tsx` now builds its parsed `KrnDashboardData` fixture with the required `benchmark_reports` sibling object from the existing dashboard-data contract example.
- [FACT] This repairs the existing full dashboard test-suite failure where `parseDashboardData` rejected the Pending Review test fixture because it omitted `benchmark_reports`.
- [EVIDENCE] Focused dashboard test passed: `pnpm --dir apps/dashboard exec vitest run test/pending-review-dashboard.test.tsx` passed 1 file / 4 tests.
- [EVIDENCE] Full dashboard test suite passed: `pnpm --dir apps/dashboard exec vitest run test` passed 4 files / 13 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T041903Z-1367732/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one fixture reader, one existing contract example as the sibling object source, unchanged dashboard component behavior, and no contract/schema changes.
- [SIMPLIFY] Delete/avoid: no new dashboard panel, no benchmark execution, no dashboard command, no source-ref sweep, no memory/API work, and no productivity-lift claim.
- [OVERCLAIM] This slice proves Pending Review test fixture parity with the current dashboard-data contract only. It does not prove dashboard usefulness, benchmark quality, human review quality, source freshness, or product lift.
- [NEXT] Commit and push this consumer repair; then continue with consumer-led cleanup only where a real test, parser, or command exposes drift.
- [EVIDENCE] The Pending Review source-lineage cleanup pre-edit gate passed and wrote `.krn/gates/20260621T042037Z-1369799/engineering-gate.json`.
- [FACT] `buildKrnPendingReviewViewModel` no longer hardcodes historical `goal-006` / `goal-011` / `goal-013` refs for runtime top-level or next-action source refs. It derives source lineage from parsed proposal/review records and appends stable Pending Review / proposal / review-decision spec refs.
- [FACT] Empty or invalid Pending Review states use stable spec refs only, while proposal rows keep the proposal record's own `source_refs`.
- [FACT] Pending Review examples and dashboard render tests now cite the current proposal source lineage instead of the old parent-goal source list.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/mcp/test/pending-review-view-model.test.ts packages/contracts/test/pending-review-view-model.test.ts` passed 2 files / 10 tests.
- [EVIDENCE] Dashboard tests passed: `pnpm --dir apps/dashboard exec vitest run test/pending-review-dashboard.test.tsx` passed 1 file / 4 tests, and `pnpm --dir apps/dashboard exec vitest run test` passed 4 files / 13 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T042243Z-1372239/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one source-ref derivation helper, existing parser/view-model contracts, focused tests, and no new dashboard/API/eval surface.
- [SIMPLIFY] Delete/avoid: no broad dashboard cleanup, no benchmark execution, no source registry service, no memory/API work, and no productivity-lift claim.
- [OVERCLAIM] This slice proves Pending Review source-ref freshness and data lineage only. It does not prove dashboard usefulness, source graph completeness, human review quality, benchmark quality, or product lift.
- [NEXT] Commit and push this source-lineage cleanup; then continue only where a concrete consumer still exposes hardcoded-truth or contract drift.
- [EVIDENCE] The Promotion Review source-lineage cleanup pre-edit gate passed and wrote `.krn/gates/20260621T042408Z-1374240/engineering-gate.json`.
- [FACT] `buildKrnPromotionReviewViewModel` no longer hardcodes historical `goal-006` / `goal-015` refs for runtime top-level or next-action source refs. It derives source lineage from parsed promotion records and appends stable Proposal Promotion / Promotion Review spec refs.
- [FACT] Empty or invalid Promotion Review states use stable spec refs only, while promotion rows keep the promotion record's own `source_refs`.
- [FACT] Promotion Review examples now cite the current promotion record source lineage instead of the old dashboard/source list.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/mcp/test/promotion-review-view-model.test.ts packages/contracts/test/promotion-review-view-model.test.ts` passed 2 files / 7 tests.
- [EVIDENCE] Dashboard tests passed: `pnpm --dir apps/dashboard exec vitest run test/promotion-review-dashboard.test.tsx` passed 1 file / 3 tests, and `pnpm --dir apps/dashboard exec vitest run test` passed 4 files / 13 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T042556Z-1377602/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one source-ref derivation helper, existing parser/view-model contracts, focused tests, and no new dashboard/API/eval surface.
- [SIMPLIFY] Delete/avoid: no broad dashboard cleanup, no benchmark execution, no source registry service, no memory/API work, and no productivity-lift claim.
- [OVERCLAIM] This slice proves Promotion Review source-ref freshness and data lineage only. It does not prove dashboard usefulness, source graph completeness, human review quality, benchmark quality, or product lift.
- [NEXT] Commit and push this source-lineage cleanup; then choose the next cleanup by live consumer pressure, not by broad source-ref string sweeps.
- [EVIDENCE] The dashboard-data aggregate lineage cleanup pre-edit gate passed and wrote `.krn/gates/20260621T043004Z-1389727/engineering-gate.json`.
- [EVIDENCE] The benchmark-reports view-model lineage cleanup pre-edit gate passed and wrote `.krn/gates/20260621T043038Z-1393051/engineering-gate.json`.
- [FACT] `buildKrnBenchmarkReportsViewModel` no longer hardcodes historical `goal-006` / `goal-018` / `goal-019` refs as global top-level or next-action source refs. It derives source lineage from parsed benchmark reports and appends stable Benchmark Report / Benchmark Reports View Model spec refs.
- [FACT] Empty or invalid Benchmark Reports states use stable spec refs only, while benchmark rows keep each parsed benchmark report's own `source_refs`.
- [FACT] `apps/dashboard/scripts/write-dashboard-data.ts` no longer hardcodes historical dashboard source refs. The dashboard data envelope derives aggregate lineage from parsed child view models and appends the stable Dashboard Data spec ref.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/mcp/test/benchmark-reports-view-model.test.ts packages/contracts/test/benchmark-reports-view-model.test.ts packages/contracts/test/dashboard-data.test.ts` passed 3 files / 9 tests.
- [EVIDENCE] `KRN_TARGET_ROOT=/tmp/krn-empty-dashboard-target KRN_DASHBOARD_DATA_OUT=/tmp/krn-dashboard-data.verify.json pnpm --dir apps/dashboard data` generated parsed dashboard data whose aggregate and benchmark empty-state source refs contain spec lineage only, with no historical goal refs.
- [EVIDENCE] Dashboard tests passed: `pnpm --dir apps/dashboard exec vitest run test` passed 4 files / 13 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T043441Z-1404032/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: child-derived source lineage, stable spec refs, one helper per generator/view-model, public parser tests, and no new dashboard/API/benchmark surface.
- [SIMPLIFY] Delete/avoid: no live benchmark run, no dashboard command, no broad stale-goal sweep, no source registry abstraction, and no productivity-lift claim.
- [OVERCLAIM] This slice proves dashboard-data and benchmark-reports aggregate source lineage only. It does not prove benchmark usefulness, dashboard usefulness, source graph completeness, memory quality, human review quality, or product lift.
- [NEXT] Commit and push this cleanup; then continue only with cleanup that has a live typed consumer or with the next capability dogfood task from the canonical blueprint.
- [EVIDENCE] The context-packet broad-context guard cleanup pre-edit gate passed and wrote `.krn/gates/20260621T043644Z-1417043/engineering-gate.json`.
- [FACT] `parseKrnContextPacket` no longer hardcodes the historical `goal-018.md..goal-034.md` range as a product-specific context-dump detector. It now rejects broad selected context by shape: wildcard refs, full-scan refs, or `goal-N..goal-M` range refs.
- [FACT] A new public parser regression rejects `docs/goals/goal-001.md..goal-999.md` with the broad-context-dump failure, proving the guard is not tied to one old benchmark/lab range.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/context-packet.test.ts packages/cli/test/context.test.ts packages/cli/test/source-graph.test.ts` passed 3 files / 9 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T043746Z-1423296/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one parser predicate, public parser regression, existing context/source graph consumers, and no new context/memory/eval surface.
- [SIMPLIFY] Delete/avoid: no historical goal-range hardcode, no dashboard/API/benchmark work, no broad context-policy engine, and no memory-quality claim.
- [OVERCLAIM] This slice proves context-packet hardcode cleanup only. It does not prove final context quality, memory precision, source graph completeness, review burden reduction, or product lift.
- [NEXT] Commit and push this cleanup; then continue with either another consumed hardcoded-truth cleanup or the first capability dogfood task if cleanup pressure is no longer concrete.
- [EVIDENCE] The first capability dogfood context packet for the MemoryStore rejected-context cleanup wrote `.krn/context/20260621T044012Z-1431711/context-packet.json` using an external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [EVIDENCE] The MemoryStore rejected-context cleanup pre-edit gate passed and wrote `.krn/gates/20260621T044056Z-1433195/engineering-gate.json`.
- [FACT] MemoryStore fixtures and examples no longer carry the exact historical `goal-018.md..goal-034.md` range as default rejected context. They now describe the rejected surface as `docs/goals/goal-*.md lab/archive range`.
- [FACT] `parseKrnContextPacket` rejects any wildcard selected-context ref, not only `**`, so wildcard/range context can appear as rejected context but cannot be promoted into selected context.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/context-packet.test.ts packages/contracts/test/memory-store.test.ts packages/contracts/test/operating-brief.test.ts packages/contracts/test/review-report.test.ts packages/cli/test/context.test.ts packages/cli/test/brief.test.ts packages/cli/test/review.test.ts` passed 7 files / 24 tests.
- [EVIDENCE] The post-cleanup dogfood context packet `.krn/context/20260621T044311Z-1435941/context-packet.json` selected `memory:mem-goal-038-memory-boundary` and rejected `docs/goals/goal-*.md lab/archive range`, `docs/memory/** full scan`, and `.krn/** as memory core`.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T044322Z-1436287/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one generic selected-context wildcard guard, existing MemoryStore rejected-context policy, context packet dogfood evidence, and parser examples that do not name a stale benchmark goal range.
- [SIMPLIFY] Delete/avoid: no source registry, no broad memory system rewrite, no dashboard/API/benchmark surface, no repo-local memory core, and no productivity-lift claim.
- [OVERCLAIM] This slice proves KRN can use its existing MemoryStore/context boundary to guide one cleanup and record pending feedback. It does not prove self-growing behavior, final memory quality, review burden reduction, or product lift.
- [NEXT] Commit and push this dogfood cleanup; then continue with the next real capability task or a consumed hardcoded-truth cleanup only if a concrete consumer exposes it.
- [EVIDENCE] The path-aware skill-routing cleanup pre-edit gate passed and wrote `.krn/gates/20260621T044928Z-1447077/engineering-gate.json`.
- [EVIDENCE] The dogfood context packet for the same cleanup wrote `.krn/context/20260621T044943Z-1448687/context-packet.json` using the external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [FACT] `krn gate`, `krn context build`, and `krn brief` now share one CLI skill-routing module instead of keeping separate task-wording regexes in each command.
- [FACT] The shared routing detects `typescript-contract-engineer` and `eval-designer` from target paths, so generic cleanup wording cannot bypass the relevant build-time skill when `--path` points to TypeScript or eval surfaces.
- [FACT] `goal-038` now includes an autonomous continuation policy: continue only through consumed final-product slices, run one verification pass per changed mechanism, commit/push per semantic slice, stop on unclear consumers or repeated failures, and avoid `codex exec` / eval churn.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/cli/test/gate.test.ts packages/cli/test/context.test.ts packages/cli/test/brief.test.ts` passed 3 files / 9 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T045536Z-1473184/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one shared `packages/cli/src/skill-routing.ts` module, public command tests for all changed consumers, and the active-goal autonomous policy.
- [SIMPLIFY] Delete/avoid: local duplicate skill-routing helpers in `brief.ts`, `context.ts`, and `gate.ts`; no new eval family, dashboard panel, benchmark lane, broad API/cloud sync, passive research doc, or committed `.krn/**` runtime evidence.
- [OVERCLAIM] This slice proves build-time skill-routing enforcement and cleanup cadence for these CLI consumers only. It does not prove skill quality, TypeScript code quality across the repo, final memory quality, self-growing behavior, review-burden reduction, or productivity lift.
- [NEXT] Commit and push this cleanup; then continue with the next consumed product bottleneck from code pressure. Prefer cleanup that reduces monolith pressure or duplicate runtime rules; do not add another infrastructure proof unless a real capability task consumes it.
- [EVIDENCE] The path-aware goal/source skill-routing pre-edit gate passed and wrote `.krn/gates/20260621T045812Z-1477273/engineering-gate.json`.
- [EVIDENCE] The dogfood context packet for the same cleanup wrote `.krn/context/20260621T045812Z-1477257/context-packet.json` using the external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [FACT] Shared CLI skill routing now detects `goal-execplan` from `docs/goals/**` and `docs/plans/canonical/draft.md` target paths even when task wording is generic.
- [FACT] Shared CLI skill routing now detects `research-synthesis` from `docs/plans/canonical/SOURCES.md`, `docs/plans/canonical/pattern-matrix.md`, `docs/plans/canonical/draft.md`, and `docs/memory/**` target paths even when task wording is generic.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/cli/test/gate.test.ts` passed 1 file / 7 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T045923Z-1479017/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one shared path-aware skill router and public `krn gate` regressions for TypeScript, eval, goal, and source paths.
- [SIMPLIFY] Delete/avoid: no new docs/source system, no passive research note, no dashboard/API/benchmark work, no new eval module, and no path-specific hardcode in three separate command files.
- [OVERCLAIM] This slice proves pre-edit skill routing for canonical goal/source paths only. It does not prove research quality, source freshness, ADR completeness, skill impact, final memory quality, or productivity lift.
- [NEXT] Commit and push this cleanup; then pick the next slice from real code pressure. If no concrete consumer exposes a bug, inspect monolith pressure around `packages/cli/src/init.ts` before adding behavior.
- [EVIDENCE] The init artifact detection extraction pre-edit gate passed and wrote `.krn/gates/20260621T050156Z-1482726/engineering-gate.json`.
- [EVIDENCE] The dogfood context packet for the same cleanup wrote `.krn/context/20260621T050156Z-1482709/context-packet.json` using the external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [FACT] Init artifact path inventory and reason generation moved from `packages/cli/src/init.ts` into `packages/cli/src/init-artifacts.ts`.
- [FACT] `packages/cli/src/init.ts` now calls `buildInitDetectedArtifacts` and `initArtifactExists`, reducing the init command monolith while preserving dry-run/proposal/apply behavior.
- [EVIDENCE] Focused public-interface test passed: `pnpm exec vitest run packages/cli/test/init-dry-run.test.ts` passed 1 file / 11 tests.
- [EVIDENCE] Focused init eval passed: `pnpm run eval:krn-init` run `.krn/evals/krn-init-contracts/20260621T050428Z-1487541/report.json` passed 13/13 cases and 62/62 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T050429Z-1487565/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one small artifact inventory module, unchanged public `krn init` behavior, public init tests, and init eval coverage.
- [SIMPLIFY] Delete/avoid: the local `DETECTED_PATHS` / `artifactReason` block inside `init.ts`, repeated artifact `find(...).exists` calls, no new init capability, no dashboard/API/benchmark work, and no broad init rewrite.
- [OVERCLAIM] This slice proves init monolith pressure reduction for artifact detection only. It does not prove broader repo bootstrap quality, merge-mode safety, policy enforcement, memory quality, source freshness, or productivity lift.
- [NEXT] Commit and push this cleanup; then continue only with another small consumed cleanup if the next code pressure is obvious. Otherwise stop with status rather than inventing another surface.
- [EVIDENCE] The init argument parser extraction pre-edit gate passed and wrote `.krn/gates/20260621T050627Z-1490752/engineering-gate.json`.
- [EVIDENCE] The dogfood context packet for the same cleanup wrote `.krn/context/20260621T050627Z-1490766/context-packet.json` using the external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [FACT] `parseInitArgs` moved from `packages/cli/src/init.ts` into `packages/cli/src/init-args.ts`, while `init.ts` keeps a compatibility re-export.
- [FACT] `packages/cli/src/init.ts` now focuses on init manifest/proposal/apply orchestration and is reduced to 369 lines after the artifact and argument-parser extractions.
- [EVIDENCE] Focused public-interface test passed: `pnpm exec vitest run packages/cli/test/init-dry-run.test.ts` passed 1 file / 11 tests.
- [EVIDENCE] Focused init eval passed: `pnpm run eval:krn-init` run `.krn/evals/krn-init-contracts/20260621T050857Z-1494563/report.json` passed 13/13 cases and 62/62 assertions.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T050857Z-1494574/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one `init-args.ts` parser module, compatibility re-export from `init.ts`, and public init suite/eval as behavior proof.
- [SIMPLIFY] Delete/avoid: parser branches inside `init.ts`, no broad CLI parser framework, no new command behavior, no dashboard/API/benchmark work, and no runtime artifacts committed.
- [OVERCLAIM] This slice proves init parser extraction only. It does not prove final repo bootstrap quality, merge-mode safety, source/memory quality, policy hook enforcement, or productivity lift.
- [NEXT] Commit and push this cleanup; then stop if no next obvious consumed cleanup exists. Do not invent another surface just to keep running.
- [EVIDENCE] The local MemoryStore adapter extraction pre-edit gate passed and wrote `.krn/gates/20260621T060448Z-1506307/engineering-gate.json`.
- [EVIDENCE] The dogfood context packet for the same cleanup wrote `.krn/context/20260621T060448Z-1506318/context-packet.json` using the external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [FACT] Local JSON store path resolution, `local-dev-json:` refs, read/parse, and write behavior moved from `packages/cli/src/memory-store.ts` into `packages/cli/src/local-memory-store-adapter.ts`.
- [FACT] `packages/cli/src/memory-store.ts` now keeps memory selection, application, and feedback logic while depending on the local adapter for persistence.
- [FACT] The local adapter is a current local-first implementation boundary, not final memory core and not repo-local authoritative memory.
- [EVIDENCE] The first focused test run failed because `parseKrnLocalMemoryStore` was incorrectly removed from `memory-store.ts`; the repair kept the parser in the selection/feedback module because it still builds the next typed store object.
- [EVIDENCE] Focused tests passed after repair: `pnpm exec vitest run packages/cli/test/brief.test.ts packages/cli/test/context.test.ts packages/cli/test/review.test.ts packages/contracts/test/memory-store.test.ts` passed 4 files / 10 tests.
- [EVIDENCE] `pnpm run krn -- eval --lane core` passed run `.krn/eval/20260621T060617Z-1514676/report.json` with 5/5 modules, 25/25 cases, and 93/93 assertions passing.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one explicit local MemoryStore adapter, existing brief/context/review consumers, and contract parser coverage.
- [SIMPLIFY] Delete/avoid: filesystem/path/default-store code inside `memory-store.ts`, no service/cloud memory implementation yet, no repo-local memory-core claim, no dashboard/API/benchmark work, and no committed runtime evidence.
- [OVERCLAIM] This slice proves local MemoryStore adapter separation only. It does not prove final service-backed memory, memory precision, source quality, review-burden reduction, API sync, team memory, or productivity lift.
- [NEXT] Commit and push this cleanup; then stop or continue only if another consumed cleanup is obvious from code pressure.
- [EVIDENCE] The doctor runtime source-ref hygiene cleanup pre-edit gate passed and wrote `.krn/gates/20260621T061119Z-1526354/engineering-gate.json`.
- [EVIDENCE] The dogfood context packet for the same cleanup wrote `.krn/context/20260621T061119Z-1526365/context-packet.json` using the external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [FACT] `krn doctor` runtime reports no longer copy `docs/goals/goal-038.md` or the canonical draft into report `source_refs` as volatile product truth. Doctor report source refs now cite stable contracts or checked local surfaces.
- [FACT] `docs/specs/krn-doctor/examples/doctor-report.example.json` was updated to match the runtime contract, and `packages/cli/test/doctor.test.ts` now rejects `goal-038` leakage in generated doctor reports.
- [EVIDENCE] Focused public-interface tests passed: `pnpm exec vitest run packages/cli/test/doctor.test.ts packages/contracts/test/doctor-report.test.ts` passed 2 files / 6 tests.
- [EVIDENCE] Focused doctor eval passed: `pnpm run eval:krn-doctor` run `.krn/evals/krn-doctor-contracts/20260621T061256Z-1528653/report.json` passed 3/3 cases and 7/7 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one current `krn doctor` CLI consumer, its schema fixture, and one regression assertion against active-goal runtime source-ref leakage.
- [SIMPLIFY] Delete/avoid: no repo-wide source-ref string sweep, no source graph service, no dashboard/API/benchmark work, no committed runtime evidence, and no claim that all runtime reports are now free of volatile source refs.
- [OVERCLAIM] This slice proves doctor runtime source-ref hygiene only. It does not prove source freshness, final source graph quality, memory quality, hook enforcement, review-burden reduction, or product lift.
- [NEXT] Commit and push this cleanup; then continue only with another consumed runtime/source-ref cleanup if a live CLI, contract, eval, MCP, or dashboard consumer exposes it.
- [EVIDENCE] The review artifact lineage cleanup pre-edit gate passed and wrote `.krn/gates/20260621T061433Z-1530455/engineering-gate.json`.
- [EVIDENCE] The dogfood context packet for the same cleanup wrote `.krn/context/20260621T061433Z-1530443/context-packet.json` using the external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [FACT] `krn review` artifact rows no longer hardcode active-goal refs for missing, invalid, or present init/doctor/eval artifacts. Missing/invalid artifact rows cite stable artifact specs; present rows inherit source lineage from the parsed runtime artifact.
- [FACT] `packages/cli/test/review.test.ts` now rejects active-goal leakage from review artifact source refs while preserving selected MemoryStore source lineage in top-level report refs and memory-specific findings/proposals.
- [EVIDENCE] Focused public-interface tests passed: `pnpm exec vitest run packages/cli/test/review.test.ts packages/contracts/test/review-report.test.ts` passed 2 files / 6 tests.
- [EVIDENCE] Focused review eval passed: `pnpm run eval:krn-review` run `.krn/evals/krn-review-contracts/20260621T061536Z-1532410/report.json` passed 3/3 cases and 9/9 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one review CLI consumer, artifact-level stable spec fallback, parsed runtime artifact lineage for present artifacts, and the existing MemoryStore source-lineage contract.
- [SIMPLIFY] Delete/avoid: no review report schema change, no source graph service, no broad MCP/dashboard cleanup, no committed runtime evidence, and no claim that all non-review surfaces are cleaned.
- [OVERCLAIM] This slice proves review artifact source-ref hygiene only. It does not prove source freshness, final source graph quality, memory precision, dashboard trust, human review quality, or productivity lift.
- [NEXT] Commit and push this cleanup; then inspect remaining active-goal hardcodes only if a concrete consumer and focused verification path exist. Do not continue into MCP/dashboard or eval surfaces merely because `rg` finds strings.
- [EVIDENCE] The eval aggregate source-ref cleanup pre-edit gate passed and wrote `.krn/gates/20260621T061636Z-1534256/engineering-gate.json`.
- [EVIDENCE] The dogfood context packet for the same cleanup wrote `.krn/context/20260621T061636Z-1534257/context-packet.json` using the external local MemoryStore at `/tmp/krn-dogfood-memory/memory-store.json`.
- [FACT] `krn eval` aggregate report `source_refs` now derive from the stable eval contract plus selected module descriptor lineage from `docs/evals/registry.json`, instead of hardcoding the active goal or canonical draft into eval runtime output.
- [FACT] The first aggregate eval public test failed because `krn-mcp-proposal-tool` could not store the source-backed proposal fixture: the fixture cited `docs/goals/goal-038.md`, but the isolated MCP target did not provide that source ref. The repair removed the active-goal ref from the portable control-plane proposal fixture and MCP tool result lineage.
- [FACT] `krn_store_control_plane_proposal` tool results now cite stable proposal/tool contracts; stored proposals keep their own validated source lineage separately.
- [EVIDENCE] Focused MCP tests passed: `pnpm exec vitest run packages/mcp/test/stdio-server.test.ts packages/contracts/test/mcp-proposal-tool.test.ts packages/contracts/test/control-plane-proposal.test.ts` passed 3 files / 25 tests.
- [EVIDENCE] Focused MCP proposal-tool eval passed: `pnpm run eval:krn-mcp-proposal-tool` run `.krn/evals/krn-mcp-proposal-tool/20260621T062215Z-1544767/report.json` passed 5/5 cases and 17/17 assertions.
- [EVIDENCE] Focused eval/report tests passed after repair: `pnpm exec vitest run packages/cli/test/eval.test.ts packages/contracts/test/eval-report.test.ts` passed 2 files / 7 tests.
- [EVIDENCE] Focused eval contract passed: `pnpm run eval:krn-eval` run `.krn/evals/krn-eval-contracts/20260621T062349Z-1547694/report.json` passed 6/6 cases and 14/14 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: one aggregate eval source-ref derivation, one portable control-plane proposal fixture, one MCP tool-result regression, and the existing module registry as the selected-module lineage source.
- [SIMPLIFY] Delete/avoid: no eval registry rewrite, no dashboard/MCP read-model cleanup, no lab/default-lane expansion, no source service, no committed runtime evidence, and no productivity-lift claim.
- [OVERCLAIM] This slice proves aggregate eval and MCP proposal-tool source-ref hygiene only. It does not prove eval quality, final source freshness, dashboard trust, MCP API readiness, or review-burden reduction.
- [NEXT] Commit and push this cleanup; then stop unless another default-lane CLI/MCP consumer exposes a concrete failing check or volatile hardcoded-truth bug.
- [EVIDENCE] The MCP read-model source-lineage cleanup pre-edit gate passed and wrote `.krn/gates/20260621T062649Z-1563637/engineering-gate.json`.
- [FACT] `packages/mcp` read-model resource envelopes no longer hardcode `docs/goals/goal-038.md` or `docs/plans/canonical/draft.md` as their own runtime lineage. Runtime report payloads keep their own internal `source_refs`; the MCP envelope now cites stable read-model or report contracts only.
- [FACT] Dashboard view-model aggregate source refs from `packages/mcp/src/index.ts` no longer hardcode active/historical goal refs and now cite the stable dashboard/read-model specs.
- [FACT] `docs/specs/krn-mcp-read-model` examples and contract text now match the stable-envelope boundary, preventing fixture copy-paste from reintroducing active-goal truth.
- [EVIDENCE] Focused tests passed: `pnpm exec vitest run packages/contracts/test/control-plane-resource.test.ts packages/mcp/test/read-model.test.ts packages/mcp/test/dashboard-view-model.test.ts` passed 3 files / 9 tests.
- [EVIDENCE] Focused MCP read-model eval passed: `pnpm run eval:krn-mcp` run `.krn/evals/krn-mcp-read-model/20260621T062954Z-1574588/report.json` passed 3/3 cases and 9/9 assertions.
- [EVIDENCE] `pnpm typecheck` and `git diff --check` passed.
- [SIMPLIFY] Keep: stable MCP envelope lineage, one regression assertion in unit tests, one current read-model eval assertion, and existing read-only MCP consumers.
- [SIMPLIFY] Delete/avoid: no payload history rewrite, no dashboard panel, no benchmark run, no source graph service, no broad API/cloud sync, no committed `.krn/**` runtime evidence, and no productivity-lift claim.
- [OVERCLAIM] This slice proves MCP read-model envelope source-ref hygiene only. It does not prove final source freshness, memory quality, dashboard usefulness, MCP API readiness, human review quality, or product lift.
- [NEXT] Commit and push this cleanup; then inspect remaining hardcoded-truth candidates only if they sit in a current default-lane consumer with focused verification.

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
