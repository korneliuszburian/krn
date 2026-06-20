# Goal 006: KRN Final Product Build

## Status

Active parent execution contract. Slice 1 is complete enough to support product implementation, and Slice 2 typed CLI/runtime commands are implemented and locally verified. The parent goal remains incomplete until Slice 3 control-plane surfaces and measured lift evidence exist.

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
- Slice 2 now has four TypeScript runtime paths:
  - `krn init --dry-run` emits schema-backed manifests under `.krn/init/`.
  - `krn doctor` emits schema-backed readiness reports under `.krn/doctor/`.
  - `krn eval` emits schema-backed aggregate eval reports under `.krn/eval/`.
  - `krn review` emits schema-backed proposal-only review reports under `.krn/review/`.
- Latest Slice 2 local proof:
  - `pnpm typecheck` passed.
  - `pnpm test` passed with 8/8 files and 16/16 tests.
- Latest Slice 3 progress:
  - `packages/mcp` exists as a read-only resource model over typed `.krn` runtime reports.
  - `packages/mcp` now also has a local STDIO MCP server entrypoint over that read-only resource model.
  - `krn://runtime/summary`, `krn://runtime/init/latest`, `krn://runtime/doctor/latest`, `krn://runtime/eval/latest`, and `krn://runtime/review/latest` are the current allowlisted resources.
  - `pnpm run eval:krn-mcp` passed 3/3 cases and 7/7 assertions.
  - The initial `krn-mcp-transport` eval proved the local STDIO resource transport before proposal tools were added; the current transport evidence is listed below.
  - `pnpm run krn -- review` generated `.krn/review/20260619T230302Z-1808550/report.json` with `ready_for_human_review`, 3/3 artifacts present, and 2 proposal-only proposals.
  - The STDIO transport now advertises exactly one proposal-only MCP tool: `krn_store_control_plane_proposal`.
  - `packages/contracts` now exports the standalone `KrnControlPlaneProposal` contract with valid and known-bad fixtures under `docs/specs/krn-control-plane-proposal/`.
  - `pnpm test -- packages/contracts/test/control-plane-proposal.test.ts` passed with the known-bad approved mutation fixture rejected.
  - `packages/contracts` now exports the standalone `KrnDashboardViewModel` contract with valid and known-bad fixtures under `docs/specs/krn-dashboard-view-model/`.
  - `packages/mcp` now exports `buildKrnDashboardViewModel`, which builds the first dashboard input from real read-only MCP/runtime resources and the latest `krn review` report.
  - `pnpm test -- packages/contracts/test/dashboard-view-model.test.ts packages/mcp/test/dashboard-view-model.test.ts packages/mcp/test/read-model.test.ts packages/mcp/test/stdio-server.test.ts` passed with 14/14 files and 33/33 tests.
  - `packages/mcp` now exports `validateProposalSourceRefs` and `storeKrnControlPlaneProposal` for source-backed append-only proposal persistence under `.krn/proposals`.
  - `pnpm run eval:krn-proposal-store` generated `.krn/evals/krn-proposal-store/20260619T231608Z-1828089/report.json` with 4/4 cases and 9/9 assertions passing.
  - `krn eval` now includes `krn-proposal-store` as a deterministic Slice 3 module.
  - `packages/contracts` now exports `KrnMcpProposalToolResult` and `KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL` for the first MCP proposal-only tool result boundary.
  - `packages/mcp` registers exactly one MCP tool, `krn_store_control_plane_proposal`, which parses `KrnControlPlaneProposal`, calls `storeKrnControlPlaneProposal`, and returns `approved: false` / `mutated_target: false`.
  - `pnpm run eval:krn-mcp-transport` generated `.krn/evals/krn-mcp-transport/20260620T000555Z-1943987/report.json` with 3/3 cases and 7/7 assertions after the transport began advertising the proposal-only tool.
  - `pnpm run eval:krn-mcp-proposal-tool` generated `.krn/evals/krn-mcp-proposal-tool/20260620T000445Z-1940364/report.json` with 5/5 cases and 16/16 assertions.
  - `pnpm run krn -- eval` generated `.krn/eval/20260620T000445Z-1940365/report.json` with 7/7 modules, 24/24 cases, and 62/62 assertions, including `krn-mcp-proposal-tool`.
  - `packages/contracts` now exports `KrnPendingReviewViewModel` for dashboard Pending Review over proposal-store records.
  - `packages/mcp` now exports `buildKrnPendingReviewViewModel`, which reads `.krn/proposals`, parses records as `KrnControlPlaneProposal`, revalidates source refs, and surfaces invalid/stale records.
  - `buildKrnDashboardViewModel` now uses proposal-store state for its Pending Review count instead of the latest `krn review` report.
  - `pnpm run eval:krn-pending-review-view-model` generated `.krn/evals/krn-pending-review-view-model/20260620T002555Z-1998197/report.json` with 4/4 cases and 14/14 assertions.
  - `pnpm run krn -- eval` generated `.krn/eval/20260620T002555Z-1998210/report.json` with 8/8 modules, 28/28 cases, and 76/76 assertions, including `krn-pending-review-view-model`.
  - `apps/dashboard` now exists as the first local dashboard surface over generated typed Pending Review data.
  - `apps/dashboard/scripts/write-dashboard-data.ts` writes `krn-dashboard-data.json` from `buildKrnPendingReviewViewModel`; generated dashboard data is ignored by git.
  - `apps/dashboard/src/PendingReviewDashboard.tsx` renders Pending Review rows with owner, source refs, next action, and failure mode, and does not expose approve/reject/mutate commands.
  - `pnpm --filter @krn/dashboard typecheck`, `pnpm --filter @krn/dashboard test`, and `pnpm --filter @krn/dashboard build` passed.
  - `pnpm run eval:krn-dashboard-pending-review-ui` generated `.krn/evals/krn-dashboard-pending-review-ui/20260620T005027Z-2048035/report.json` with 5/5 cases and 19/19 assertions.
  - `pnpm run krn -- eval` generated `.krn/eval/20260620T005117Z-2051988/report.json` with 9/9 modules, 33/33 cases, and 95/95 assertions, including `krn-dashboard-pending-review-ui`.
  - `packages/contracts` now exports `KrnProposalReviewDecision`, the first typed terminal review decision object for proposal-store records.
  - `packages/mcp` now exports `storeKrnProposalReviewDecision` and `listKrnProposalReviewDecisionStoreRecords` for append-only review state under `.krn/proposal-reviews`.
  - `buildKrnPendingReviewViewModel` now reads proposal review decision records, excludes proposals with one valid terminal decision, and blocks readiness for invalid or conflicting decision records.
  - `apps/dashboard/src/PendingReviewDashboard.tsx` now renders reviewed and review-error metrics from the same typed Pending Review view model without adding approve/reject/mutate commands.
  - `pnpm run eval:krn-proposal-review-decision` generated `.krn/evals/krn-proposal-review-decision/20260620T013214Z-2143548/report.json` with 8/8 cases and 25/25 assertions.
  - `pnpm typecheck` passed.
  - `pnpm test -- packages/mcp/test/pending-review-view-model.test.ts` passed with 20/20 test files and 63/63 tests after the manual conflict regression case was added.
  - `pnpm test` passed with 20/20 test files and 63/63 tests.
  - `pnpm run eval:krn-dashboard-pending-review-ui` generated `.krn/evals/krn-dashboard-pending-review-ui/20260620T013215Z-2143558/report.json` with 5/5 cases and 19/19 assertions after the Pending Review contract gained review-decision fields.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T013233Z-2144081/report.json` with 10/10 modules, 41/41 cases, and 120/120 assertions, including `krn-proposal-review-decision`.
  - This still does not prove promotion correctness, human approval quality, dashboard command readiness, complete dashboard coverage, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals` and `.krn/proposal-reviews`, or measured lift.

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

Before any non-trivial implementation slice, run a lightweight research/plan checkpoint using the OpenAI Cookbook patterns already indexed in `docs/plans/canonical/SOURCES.md`:

- S010 Goals in Codex: state outcome, verification surface, constraints, boundaries, iteration policy, and blocked stop condition.
- S011 Codex ExecPlans: keep multi-hour work self-contained, restartable, and evidence-driven.
- S012 Code modernization: split broad changes into bounded pilot, overview/design, validation/parity, implementation, and reusable template when the slice is broad enough.
- S087 Related resources: use as discovery only; promote a pattern only after primary-source inspection and mechanism extraction.

The checkpoint must name the product layer, selected source-backed mechanism, rejected alternatives, required skills, validation or falsification path, and overclaim boundary. Tiny mechanical edits can skip the checkpoint, but architecture, memory, eval, MCP/API, dashboard, runtime-skill, benchmark, and long-running-goal work cannot.

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
- `krn review` emits proposal-only review reports over typed local runtime artifacts.
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
- Keep ChatGPT reviewer bridge deferred and optional. It may become a static/read-only external reviewer only after the local Codex/KRN loop proves useful.
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

Continue Slice 3 by creating the next bounded child goal from the latest completed child goal:

```bash
docs/goals/goal-012.md
```

Next child-goal candidates are a typed proposal promotion workflow after review decisions, additional dashboard views over existing typed objects, HTTP/API read model hardening, or benchmark/control-plane evidence. Run the research/plan checkpoint first. Do not expose destructive MCP/API tools, mocked dashboard state, direct approval mutation, or productivity claims without benchmark evidence.
