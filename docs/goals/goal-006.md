# Goal 006: KRN Final Product Build

## Status

Ready as the next active execution contract. Slice 1 has started with final-product planning, naming, and static operator-skill coverage.

This goal supersedes `goal-005` as the product direction. `goal-005` remains useful as the Slice 2 `krn init --dry-run` contract, but it must not drive the whole repo.

## Current Progress

- `docs/product/final-product-plan.md` exists as the canonical final-product plan.
- KRN is the product/tool name and `krn` is the CLI; Gas Town is the repo/codename only.
- `goal-005` is superseded as the active product direction and retained as Slice 2 context.
- Slice 1 operator skills have static contract coverage:
  - `domain-grill-interviewer`
  - `product-requirements-writer`
  - `adr-writer`
  - `issue-slice-writer`
  - `release-verifier`
- Latest static operator skill contract validation passed for 11/11 skills.
- Operator skill impact validation now covers 10 fixtures, including the five new Slice 1 skills.
- `docs/evals/operator-skill-impact/fixtures/bad-premature-completion-claim.md` is a known-bad fixture for release verification.
- Impact eval validation runs, but live A/B impact and review-burden proof remain future work and must not be treated as productivity proof.

## Objective

Build KRN as the final TypeScript-first Codex operating memory, eval, and control-plane product.

Naming rule: KRN is the product/tool name and `krn` is the CLI. Gas Town is the repo/codename only, used knowingly as a reference to the Steve Yegge AI-agent orchestration discourse.

Do not build a PoC, MVP, demo, or isolated bootstrapper. Build the final architecture in dependency order through three slices:

1. Operator Build System.
2. Typed Runtime Spine.
3. Control Plane And Measured Lift.

## Product Outcome

KRN is complete only when Codex work can flow through this loop:

```text
repo/task intake
  -> operator skill workflow
  -> typed product objects
  -> CLI/runtime reports
  -> eval/repair loop
  -> reviewed memory/source/decision updates
  -> MCP/API/dashboard review surface
  -> baseline-vs-assisted benchmark evidence
```

## Required Read Order

Before executing this goal, read:

1. `AGENTS.md`
2. `docs/memory/INDEX.md`
3. `docs/product/final-product-plan.md`
4. `docs/specs/technology-stack/decision.md`
5. `docs/skills/operator-pipeline.md`
6. `docs/evals/STANDARD.md`
7. `docs/plans/canonical/pattern-matrix.md`
8. `docs/plans/canonical/SOURCES.md`
9. `CONTEXT.md`

Read OpenAI/Codex official docs before changing any Codex-specific surface such as skills, hooks, MCP, subagents, `AGENTS.md`, or `codex exec` workflow.

## Constraints

- Project-local only unless the user explicitly asks for global config.
- TypeScript-first product code on Node.js runtime.
- No new Python product foundation.
- No PoC/MVP/v1/v2 language in execution artifacts.
- No dashboard/API/MCP/runtime-skill work before typed product objects exist.
- No productivity claims without benchmark evidence.
- No semantic reviewer hooks.
- No destructive writes by default.
- No hidden product truth in chat, global memory, or unindexed docs.

## Boundaries

In scope:

- repo-local operator skills,
- TypeScript workspace and product contracts,
- CLI/runtime reports,
- eval/repair loop,
- compact continuity as deterministic project-local mechanism,
- MCP/API read model and proposal tools,
- dashboard over real product objects,
- benchmark harness.

Out of scope unless a later ADR changes it:

- generic multi-agent swarm,
- global Codex setup,
- SaaS auth/billing,
- public plugin distribution before local skill/product contracts are stable,
- vector DB or temporal graph store before file-backed product objects prove the workflow.

## Iteration Policy

Work slice by slice. Within each slice, implement vertical behavior through final standards:

```text
contract -> parser/schema -> fixture -> behavior test/eval -> runtime artifact -> memory/plan update
```

Do not make broad horizontal dumps such as "all docs first", "all schemas first", or "dashboard shell first" unless the slice explicitly needs that artifact to unblock the next verified behavior.

When an eval or review fails:

```text
failure -> repair record -> smallest fix -> rerun -> keep/refine/remove decision
```

Do not tune prompts, skills, or `AGENTS.md` from a single failure without adding a regression case or repair record.

## Blocked Stop Condition

Mark this goal blocked only if one of these repeats after three concrete attempts:

- official Codex docs contradict a required Codex surface and no safe project-local alternative exists,
- TypeScript workspace setup cannot be made runnable in this repo,
- required product object contracts cannot represent the dashboard/API/runtime flow without changing product identity,
- benchmark/eval execution cannot be run or simulated locally enough to produce actionable evidence.

If blocked, write the failed attempts, exact blocker, and two viable alternatives into this goal before stopping.

## Slice 1: Operator Build System

### Mission

Create the operator layer that will build the product without prompt sprawl or docs rot.

### Required Work

- Mark `goal-005` as superseded active direction and preserve it as Slice 2 context.
- Keep `docs/product/final-product-plan.md` as the canonical product plan.
- Complete the missing operator skills needed for product implementation:
  - domain/grill interviewer,
  - PRD/product requirement writer,
  - ADR writer,
  - issue/slice writer,
  - reviewer/release verifier.
- Update operator skill evals so every operator skill has static contract coverage.
- Add or update at least one impact fixture that compares baseline Codex vs skill-assisted Codex on final-product planning or TypeScript-contract work.
- Keep `AGENTS.md` small and point to the active goal and final product plan.

### Acceptance Evidence

- `python3 scripts/evals/operator_skill_contracts.py --mode validate` passes.
- `python3 scripts/evals/operator_skill_impact.py --mode validate` passes.
- New skill docs use trigger/input/output/phase-boundary/when-not-to-use/eval-case structure.
- `docs/skills/operator-pipeline.md` lists active skills and the remaining measurable gaps.

### Disproves Completion

- A skill is a broad prompt dump.
- Skills are added without eval coverage.
- The product plan is duplicated into several conflicting docs.
- Product runtime implementation starts before this slice can evaluate its own operator layer.

## Slice 2: Typed Runtime Spine

### Mission

Build the final local runtime foundation that produces typed evidence for later MCP/API/dashboard work.

### Required Work

- Create pnpm TypeScript workspace.
- Add strict TypeScript configuration and test/typecheck scripts.
- Create packages:
  - `packages/contracts`,
  - `packages/cli`,
  - `packages/evals`.
- Migrate or wrap existing product-spine objects as TypeScript parsers and exported schemas.
- Implement CLI commands:
  - `krn init --dry-run`,
  - `krn doctor`,
  - `krn eval`,
  - `krn review`.
- Treat all external inputs as `unknown` until parsed.
- Add valid and known-bad fixtures for every durable object.
- Keep runtime outputs under `.krn/`.

### Acceptance Evidence

- `pnpm typecheck` passes.
- `pnpm test` passes.
- valid fixtures pass and known-bad fixtures fail.
- `krn init --dry-run` produces a manifest without mutating target files.
- `krn doctor` reports AGENTS/memory/skills/hooks/eval readiness.
- `krn eval` emits schema-backed reports.
- No new Python product code is introduced.

### Disproves Completion

- CLI output is human prose without machine-readable contracts.
- Product objects are reimplemented separately by CLI/evals/dashboard.
- Any command silently mutates target project files.
- Dashboard/API/MCP code starts before typed reports exist.

## Slice 3: Control Plane And Measured Lift

### Mission

Expose the product loop to humans and other agents, then prove whether it improves Codex work.

### Required Work

- Add `packages/mcp` read-only resource gateway.
- Add proposal-only tools for memory/source/eval/repair/dashboard events.
- Add `apps/dashboard` using typed view models from contracts.
- Build dashboard views:
  - Memory Core,
  - Pending Review,
  - Knowledge Gaps,
  - Source/Claim Ledger,
  - Eval Runs,
  - Skill Impact,
  - Goal/Continuity Health.
- Add runtime/product skills only after they use typed API/MCP contracts.
- Add ChatGPT reviewer bridge as static/read-only first, then gateway-backed if current official docs and local proof support it.
- Add benchmark harness for baseline Codex vs KRN-assisted Codex.

### Acceptance Evidence

- Dashboard renders real generated product objects only.
- Every dashboard metric has source, owner, action, and failure mode.
- MCP/API resources are allowlisted and schema-backed.
- Proposal writes are append-only, idempotent, and reviewable.
- Benchmark report states measured lift or no-lift with repair targets.

### Disproves Completion

- Dashboard reads chat state or mocked product state.
- MCP exposes destructive tools.
- Runtime skills bypass contracts.
- Lift is claimed from anecdotes, screenshots, or one green eval.

## Completion Criteria

This goal is complete only when all three slices pass their acceptance evidence and the final product loop can be demonstrated with generated artifacts from this repo.

Do not mark complete for:

- a nice plan,
- a CLI bootstrap alone,
- a dashboard screenshot,
- passing unit tests without eval/repair evidence,
- a skill pack without impact measurement.

## Next Concrete Action

Start Slice 1 by implementing missing operator skills and their eval coverage, then run:

```bash
python3 scripts/evals/operator_skill_contracts.py --mode validate
python3 scripts/evals/operator_skill_impact.py --mode validate
```

After Slice 1 validation passes, start Slice 2 by creating the TypeScript workspace and the first typed contract/CLI/eval vertical slice.
