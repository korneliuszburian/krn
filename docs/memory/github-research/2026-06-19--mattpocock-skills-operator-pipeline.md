# mattpocock/skills Operator Pipeline

Status: inference

Sources:

- GitHub: `mattpocock/skills`, accessed 2026-06-19: https://github.com/mattpocock/skills/tree/main/skills
- Local full clone/read at `/tmp/mattpocock-skills`, commit `6eeb81b`.
- Files inspected included engineering skills (`ask-matt`, `grill-with-docs`, `domain-modeling`, `codebase-design`, `prototype`, `tdd`, `to-prd`, `to-issues`, `implement`, `diagnosing-bugs`, `review`) and productivity skills (`handoff`, `writing-great-skills`).

## Observation

The useful pattern is not "many skills". It is a normalized operator pipeline.

The observed workflow is:

```text
route -> grill/domain -> decision/prototype when needed -> PRD -> issues -> fresh context implementation -> review -> handoff
```

Important mechanics:

- a router skill chooses the right workflow instead of asking the user to remember all skill names,
- ambiguous work is grilled before planning,
- domain docs and ADRs are created lazily, not as ceremony,
- PRDs and issues are phase boundaries,
- issue output is intended to be agent-ready,
- handoff is a fresh-session artifact; compacting a long conversation is not the same thing,
- TDD is vertical and behavioral,
- debugging starts by creating a tight red/green loop,
- good skills optimize predictability, progressive disclosure, information hierarchy, and clear failure modes.

## Useful Pattern

For KRN, create two layers:

1. Operator skills used to build KRN.
2. Runtime/product skills exposed by KRN to improve Codex work.

Layer 1 should be a small, ordered set:

```text
operator-router
setup-repo-operating-layer
grill-domain
decision-map
to-prd
to-adr
to-issues
prototype-question
implement-vertical
review-change
handoff
verify-release
```

These skills should share a stable artifact vocabulary:

- `CONTEXT.md` or product context note,
- ADR only for real tradeoffs,
- PRD only after ambiguity is reduced,
- issue slices with done criteria,
- handoff files for fresh context,
- eval fixtures for repeated failures.

## KRN Implication

KRN should not ship a random skill pack.

The first KRN skills should encode the operator pipeline needed to build KRN itself. Only after that should KRN expose runtime skills/API to other Codex workspaces.

This implies:

- root `AGENTS.md` should point to the pipeline, not contain the whole pipeline,
- `docs/memory` should store evidence and decisions, not raw session summaries,
- every operator skill should specify input, output, phase boundary, and when not to use it,
- skill trigger evals should be added early because routing mistakes are expensive.

## Mechanism Coverage

| Matt mechanism | KRN status | KRN artifact | Missing or next proof |
|---|---|---|---|
| Router over many skills (`ask-matt`) | partially adopted | `operator-intake` | Needs live trigger/routing eval against ambiguous prompts. |
| User-invoked vs model-invoked split | partially adopted | Codex descriptions in `.agents/skills/*/SKILL.md` | Need Codex-specific policy for explicit `$skill` use vs implicit model-facing descriptions. |
| Grill before build | missing | none yet | Add `grill-domain` or fold into `operator-intake` only if eval proves enough. |
| Domain glossary and ADRs | adopted for stack phase | `CONTEXT.md`, `docs/adr/0001-typescript-first-product-stack.md`, `research-synthesis`, canonical docs, memory notes | Needs pruning as product terms stabilize. |
| PRD as phase boundary | missing | none yet | Add later only when implementation slices need user-facing product specs. |
| Issues as agent-ready vertical slices | missing | none yet | Needed before AFK/batch implementation; should include acceptance and blocked-by fields. |
| Prototype answers a question, then delete/absorb | missing | none yet | Needed before dashboard/API design experiments. |
| TDD red-green-refactor vertical loop | missing | none yet | Needed once product code exists; eval should check behavior tests, not implementation tests. |
| Diagnosing-bugs tight loop | missing | none yet | Needed after first real bug/failing eval in code. |
| Handoff to fresh session vs compact | partially adopted | compact hooks, `goal-execplan`, future handoff | Need explicit handoff artifact when moving between phases or sessions. |
| Deep module vocabulary and design-it-twice | missing | none yet | Later code architecture skill; do not add before product code or module seams exist. |
| Skill writing discipline: predictability, information hierarchy, leading words, pruning | partially adopted | P1 skill contracts | Need skill impact eval and pruning review to prevent sediment/sprawl/no-op rules. |

## Skill Impact Loop

Skills are hypotheses, not trophies. KRN should treat every operator skill as a measurable intervention:

```text
baseline Codex task -> Codex with skill -> trace/report -> metric delta -> keep/refine/remove -> memory update
```

Minimum metrics:

- task completion correctness,
- source-grounding rate,
- verification coverage,
- repeated failure reduction,
- time-to-useful-artifact,
- review burden,
- context/load cost,
- operator intervention count.

If a skill does not improve at least one meaningful metric without increasing review burden or context confusion, remove or merge it.

## Failure Mode

This becomes harmful if:

- every idea becomes a skill,
- skills duplicate `AGENTS.md`,
- PRD/ADR/issue docs become ceremony without execution,
- handoffs preserve stale assumptions,
- review and execution are blended into one vague "do work" skill.

## Review Trigger

Update after the first repo-local `.agents/skills` prototype, after skill impact evals exist, and after a full task moves through the operator pipeline from grill to reviewed implementation.
