# Goal 002: Memory Operating Layer Development and Test

## Status

This is the next execution goal after the canonical synthesis.

It turns the research workspace into a tested project-local operating layer for Codex work. It does not build the full dashboard yet.

## Mission

Build and verify the first useful KRN loop:

```text
neutral Codex work -> repo-local memory/canonical/goal awareness -> eval report -> repair or memory update -> reviewed next slice
```

The goal is to prove that `AGENTS.md`, `docs/memory`, canonical docs, compact continuity, and evals can measurably steer Codex behavior before we invest in API or dashboard surfaces.

## Current Source Of Truth

Read in this order:

1. newest user message,
2. `AGENTS.md`,
3. `docs/memory/INDEX.md`,
4. this file,
5. `docs/plans/canonical/draft.md`,
6. `docs/plans/canonical/pattern-matrix.md`,
7. `docs/plans/canonical/SOURCES.md`,
8. `.krn/compact/latest-checkpoint.md` and `.krn/compact/latest-postcompact.md` when they exist.

Historical drafts under `docs/plans/first-approach/` and `docs/plans/second-approach/` are superseded by `docs/plans/canonical/`.

## Hard Rules

- Use official OpenAI/Codex docs and Cookbook patterns first for Codex-specific behavior.
- Keep project truth repo-local. Do not move this into global Codex config.
- Do not add prompt hooks or semantic reviewer hooks. Current hook scope is compact continuity only.
- Do not store raw private transcripts, secrets, or unreviewed claims as memory facts.
- Every durable memory note needs status, sources, useful pattern, KRN implication, failure mode, and review trigger.
- Every new operating rule needs an eval or a stated falsification path.
- `codex exec` is a worker/eval lane, not a continuous Goal conversation.
- Dashboard work starts only after memory/eval objects are stable enough to read.

## Phase Plan

| Phase | Outcome | Acceptance |
|---|---|---|
| P0 Memory standard | `docs/memory` has indexed, source-backed notes for OpenAI/Codex, evals, GitHub research, and product principles. | `docs/memory/INDEX.md` links every durable note; no unindexed note is required for current truth. |
| P1 Operator skills | Repo-local operator skill specs exist for building KRN itself. | Skills live in `.agents/skills` and define trigger, input, output, phase boundary, when-not-to-use, and eval case. Static contract eval passes. |
| P2 Memory compliance eval | `codex-memory-compliance` validates neutral Codex behavior. | `validate`, known-bad fixture, and at least one live `codex exec` case produce reports. |
| P3 Repair loop | Failed evals produce repair records before instruction changes. | A repair record names failure source, classification, changed surface, validator result, metric delta, and stop reason. |
| P4 `krn init` scaffold spec | Bootstrap surface is specified before implementation. | Dry-run manifest, file ownership rules, rollback metadata, and no-touch constraints are documented. |
| P5 API/MCP object contract | Read-only project objects are defined. | Schemas exist for memory entry, source claim, eval run, compact state, and proposed change. |
| P6 Runtime skills | Product/runtime skills are designed only against stable objects. | Each skill has trigger tests and uses API/object contracts rather than free-form memory guessing. |
| P7 Dashboard object model | Dashboard reads real ledgers, not invented state. | Memory Core list/detail objects map to memory/source/eval/proposal schemas. |
| P8 Baseline benchmark | Baseline Codex vs KRN-scaffolded Codex is measured. | At least 20 real KRN tasks compare repeated failures, source discipline, completion verification, and review burden. |

## P1 Operator Skill Pipeline

Create operator/build-time skills before the API is ready. These skills are used to build KRN, not exposed as product features.

Minimum operator skills:

| Skill | Purpose | First eval |
|---|---|---|
| `operator-intake` | Load read order, classify task, identify current source of truth, and choose next phase. | Neutral prompt should mention memory index/current goal/canonical docs without being told. |
| `research-synthesis` | Convert sources into observation, mechanism, KRN implication, eval, and failure mode. | Bad answer that stores links only must fail. |
| `goal-execplan` | Turn broad work into outcome, verification, constraints, boundaries, iteration policy, and stop condition. | Vague goal must be rejected or narrowed. |
| `eval-designer` | Create deterministic cases, metrics, known-bad fixture, and report schema. | Case without source pattern or metric must fail validation. |
| `repair-handoff` | Convert eval failure into repair record and next bounded action. | Repair without stop reason must fail. |

These follow the Matt Pocock-style lesson: skills are a normalized execution pipeline, not a pile of disconnected prompts.

P1 has two gates:

1. Static contract gate:
   - skills are in `.agents/skills`,
   - `SKILL.md` frontmatter is valid,
   - each skill has input, output, phase boundary, when-not-to-use, and eval case,
   - `operator-skill-contracts` passes.
2. Impact gate:
   - compare baseline Codex vs Codex with relevant operator skill,
   - measure task success, source grounding, phase discipline, verification coverage, review burden, context cost, and skill routing,
   - keep, refine, merge, or remove the skill based on metric delta.

The static gate is enough to continue P1/P2 setup. The impact gate is required before claiming skills improve productivity.

The operator pipeline standard lives in `docs/skills/operator-pipeline.md`.

## Runtime Skills Boundary

Runtime/product skills come later, after P5.

They should use stable KRN objects:

- memory entries,
- source claims,
- eval runs,
- compact state,
- proposed changes,
- dashboard review actions.

Do not create runtime skills that depend on invisible chat context or unreviewed memory.

## Eval Requirements

The first eval module is `docs/evals/codex-memory-compliance/`.

It must report:

- `case_pass_rate`,
- `assertion_pass_rate`,
- `memory_routing_score`,
- `source_grounding_score`,
- `goal_alignment_score`,
- `continuity_score`,
- `anti_slop_score`,
- `drift_resistance_score`.

Required commands:

```bash
python3 scripts/evals/codex_memory_compliance.py --mode validate
python3 scripts/evals/codex_memory_compliance.py --mode score-fixture --case repo-intake-neutral --fixture docs/evals/codex-memory-compliance/fixtures/bad-repo-intake-neutral.md
python3 scripts/evals/codex_memory_compliance.py --mode live --case repo-intake-neutral
python3 scripts/evals/operator_skill_contracts.py --mode validate
```

Known-bad fixture must fail. Live run failure due to auth, timeout, or `codex exec` setup is a runner/setup failure, not model behavior.

## Compact Continuity Scope

Project-local hooks may do only this for now:

- PreCompact writes checkpoint metadata.
- PostCompact writes resume-gate metadata.
- Runtime files stay under `.krn/compact/`.

The hook is continuity metadata, not source truth. It must not enforce semantic product policy.

## Memory Development Rules

Memory grows only through reviewed notes:

```text
source/failure -> extracted pattern -> KRN implication -> eval or falsification -> indexed note
```

Every new note must be linked from `docs/memory/INDEX.md` in the same pass.

If a note changes a product decision, update:

1. canonical draft,
2. pattern matrix,
3. source/claim ledger,
4. memory index.

## Completion Criteria

This goal is complete only when:

- memory notes for current OpenAI/Codex, eval, GitHub research, and product principles are indexed,
- canonical docs name current source count and reject superseded hook/prompt drift,
- `codex-memory-compliance` validates case definitions,
- known-bad fixture fails for the expected reason,
- at least one live `codex exec` neutral case has a report or a documented runner/setup blocker,
- P1 operator skills exist in `.agents/skills` and pass static contract eval,
- `goal-002` is the active execution goal in repo read order,
- the next implementation slice is explicitly chosen from P1/P2, not dashboard/API first.

## Blocked Conditions

Mark blocked only if the same blocker repeats after three attempts and no meaningful progress is possible without external change.

Valid blockers:

- `codex exec` unavailable or unauthenticated,
- official OpenAI docs unreachable when a Codex-specific claim depends on them,
- hook trust state cannot be tested in this environment,
- user changes product direction.

Budget exhaustion, partial docs, or a failed eval are not completion.
