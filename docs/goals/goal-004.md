# Goal 004: Product Spine and Object Contracts

## Status

Completed. Started by the user with `/goal`; product-spine contracts, examples, validator, eval integration, and memory condensation are in place.

## Mission

Turn the current KRN operating-layer research into the first concrete product spine: a minimal, schema-backed object model and validation layer that future `krn init`, API/MCP, runtime skills, and dashboard surfaces can read.

This is the bridge from "we have good memory/eval/skill artifacts" to "the product has real state".

## Current Evidence

- `goal-001` produced the canonical source-backed product architecture.
- `goal-002` produced repo-local memory, compact hooks, operator skills, and static eval contracts.
- `goal-003` produced the first operator-skill impact gate:
  - `research-synthesis` showed positive measured lift on one fixture,
  - other P1 skills are `keep_observe`,
  - no productivity claim is allowed from one live batch.
- The strongest current product rule is: dashboard/API/runtime skills must read real objects, not invented chat state.

## Standards To Preserve

Use the existing memory standards, not a new meta-system:

- `AGENTS.md` stays short and points to indexed knowledge.
- `docs/memory/INDEX.md` is the selector, not a dump.
- Durable claims need status, sources, useful pattern, KRN implication, failure mode, and review trigger.
- OpenAI/Codex behavior requires official docs first.
- Evals use deterministic assertions before model judges.
- Runtime artifacts stay under `.krn/`; reviewed lessons move into `docs/memory`.
- Skills are measured interventions, not productivity proof.
- Dashboard work starts only after stable objects exist.
- MCP/API writes are append-only, idempotent, schema-backed, and reviewable.
- New enforcement layers require deterministic failure mode and eval proof.

## Required Pattern Set

Before designing objects or validators, read the current repo truth in this order:

1. [AGENTS.md](/home/krn/coding/krn/active/krn-gastown/AGENTS.md)
2. [docs/memory/INDEX.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/INDEX.md)
3. [docs/plans/canonical/draft.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/draft.md)
4. [docs/plans/canonical/pattern-matrix.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/pattern-matrix.md)
5. [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)
6. Relevant memory notes selected from [docs/memory/INDEX.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/INDEX.md)

Do not reread all 88 sources by default. Use canonical synthesis and memory notes as the curated source surface; return to primary sources only when a contract depends on current OpenAI/Codex behavior or a claim is ambiguous.

The product-spine design must preserve these selected patterns:

| Pattern family | Source surface | Required consequence in `goal-004` |
|---|---|---|
| OpenAI/Codex official surfaces | S001-S009, S019 | Objects support `AGENTS.md`, repo-local skills, hooks, MCP/API, and `codex exec` worker artifacts without inventing unsupported Codex behavior. |
| OpenAI Cookbook goals/plans/repair/evals | S010-S016, S020-S021, S086-S087 | Contracts are evidence-based, restartable, report-backed, and tied to deterministic validation. |
| Memory systems and benchmarks | S023-S040 | `MemoryEntry` and `SourceClaim` separate facts, decisions, source evidence, temporal validity, review state, invalidation, and abstention risk. |
| Agent-computer interface and benchmarks | S041-S046 | Outputs are machine-readable and validator-friendly, not only prose reports. |
| Self-improvement and prompt/eval loops | S049-S053, S088 | Skill/eval objects support baseline, metric delta, known-bad fixtures, stop reason, and keep/refine/merge/remove decisions. |
| Practitioner/operator skills | S055-S065, S074-S077 | The object model supports a normalized operator pipeline and avoids prompt-pack/ceremony sprawl. |
| Sandcastle-style isolation | S020, S045, S059 | Future worker runs can attach worktree/run/log evidence without mutating current checkout silently. |
| MCP/API and ChatGPT reviewer bridge | S007, S022, S078-S085 | Objects are safe for read-only gateway exposure first; writes become proposals, not approved truth. |
| Product/dashboard control plane | Product memory note, canonical dashboard section | Dashboard reads memory/source/eval/proposal/decision objects with owner/action/failure mode; it does not invent state. |

## Scope

Create the first product-spine specification for these objects:

- `MemoryEntry`
- `SourceClaim`
- `EvalRun`
- `SkillImpactReport`
- `Proposal`
- `Decision`
- `CompactCheckpoint`
- `ProjectProfile`

Define how existing files map into these objects:

- memory notes in `docs/memory/**`,
- source and claim ledger in `docs/plans/canonical/SOURCES.md`,
- eval reports in `.krn/evals/**/report.json`,
- compact artifacts in `.krn/compact/**`,
- operator skill specs in `.agents/skills/**/SKILL.md`.

## Out Of Scope

- Do not build a dashboard UI.
- Do not build runtime/product skills.
- Do not expose a network API or MCP server yet.
- Do not migrate markdown memory into a database.
- Do not create broad automation or agent swarms.
- Do not claim breakthrough/productivity lift.

## Phases

| Phase | Output | Acceptance evidence |
|---|---|---|
| P0 Current-state audit | Short inventory of existing object-like artifacts and gaps. | A file under `docs/specs/` names each artifact source and whether it has a schema. |
| P1 Object contracts | Minimal JSON Schema or equivalent contract for each product-spine object. | Schemas exist and avoid fields with no current source or future consumer. |
| P2 Mapping spec | Existing repo artifacts map to the new objects. | At least one real example is mapped for memory, eval, skill impact, source claim, and compact checkpoint. |
| P3 Validator | Local validation command checks schema shape and sample mappings. | A deterministic script exits non-zero on malformed samples and writes a local report. |
| P4 Eval integration | Existing eval standard knows about object-contract validation. | `docs/evals/README.md` or a new eval module documents the validator and known-bad fixture. |
| P5 Memory condensation | Lessons and decisions are indexed in `docs/memory`. | Memory note says what object contracts unlock and what remains blocked. |

## Suggested File Layout

Prefer this unless repo inspection shows a better existing convention:

```text
docs/specs/product-spine/
  README.md
  objects/
    memory-entry.schema.json
    source-claim.schema.json
    eval-run.schema.json
    skill-impact-report.schema.json
    proposal.schema.json
    decision.schema.json
    compact-checkpoint.schema.json
    project-profile.schema.json
  examples/
    memory-entry.example.json
    source-claim.example.json
    eval-run.example.json
    skill-impact-report.example.json
    proposal.example.json
    decision.example.json
    compact-checkpoint.example.json
    project-profile.example.json
  mappings.md

scripts/specs/
  validate_product_spine.py
```

Runtime reports should stay local:

```text
.krn/specs/product-spine/{run_id}/report.json
```

## Validation Rules

The first validator should check:

- every schema is valid JSON,
- every example validates against its schema,
- required fields are minimal and source-backed,
- every object has `schema_version`, `id`, `kind`, `created_at`, `source_refs`, and `status` where appropriate,
- proposal/decision objects separate proposed changes from approved truth,
- eval objects include module, run id, metrics, result path, and interpretation caveat,
- no object stores raw private transcripts or secrets.

## Design Quality Bar

The product-spine contracts are acceptable only if they make the next product steps simpler:

- `krn init --dry-run` can later say exactly which files and objects it would create.
- read-only API/MCP can later expose the same objects without translating markdown ad hoc.
- runtime/product skills can later consume object IDs and schemas instead of hidden chat context.
- dashboard list/detail views can later render real review states, source counts, confidence, owners, proposals, and eval links.
- evals can compare object validity and workflow impact without manual prose interpretation.

## Completion Criteria

This goal is complete only when:

- `docs/specs/product-spine/` exists with object contracts, examples, and mapping doc,
- a local validator exists and passes on valid examples,
- at least one known-bad example fails validation,
- existing `operator-skill-impact` reports are represented as `EvalRun` or `SkillImpactReport` examples,
- the next-step path to `krn init --dry-run` and read-only API/MCP is explicit,
- memory is updated and indexed,
- no dashboard/API/runtime implementation is started.

## Evidence

- Product-spine spec: [docs/specs/product-spine/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/README.md)
- Object schemas: [docs/specs/product-spine/objects](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/objects)
- Real examples: [docs/specs/product-spine/examples](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/examples)
- Known-bad fixture: [docs/specs/product-spine/fixtures/bad-eval-run.example.json](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/fixtures/bad-eval-run.example.json)
- Mapping spec: [docs/specs/product-spine/mappings.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/mappings.md)
- Validator: [scripts/specs/validate_product_spine.py](/home/krn/coding/krn/active/krn-gastown/scripts/specs/validate_product_spine.py)
- Passing validator report: [.krn/specs/product-spine/20260619T124200342866Z-700904/report.json](/home/krn/coding/krn/active/krn-gastown/.krn/specs/product-spine/20260619T124200342866Z-700904/report.json)
- Eval integration: [docs/evals/product-spine-contracts/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/product-spine-contracts/README.md)
- Memory condensation: [docs/memory/product/2026-06-19--product-spine-object-contracts.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-19--product-spine-object-contracts.md)

## Disproving Completion

Do not mark this complete if:

- schemas describe imaginary future state with no current artifact source,
- examples are toy objects unrelated to real KRN files,
- validator only checks JSON syntax,
- object names duplicate memory docs without creating machine-readable contracts,
- dashboard or API work begins before object contracts validate.

## Blocked Stop Condition

Mark blocked only if the current repo lacks enough real artifacts to create examples for memory, source claim, eval run, skill impact, and compact checkpoint, and this remains true after inspecting `docs/memory`, `docs/plans/canonical/SOURCES.md`, `.krn/evals`, `.krn/compact`, and `.agents/skills`.

## Next Command

When the user starts this goal:

```bash
python3 scripts/evals/operator_skill_impact.py --mode validate
```

Then inspect current artifacts and create `docs/specs/product-spine/`.
