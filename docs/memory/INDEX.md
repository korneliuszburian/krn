# KRN Memory Index

This folder is the repo-local pattern bank and audit/export ledger for `krn-gas-town`.

It is not hidden model memory and it is not the final KRN memory core. It is checked-in, reviewable project knowledge that Codex can use through selectors while KRN builds a service/store-backed memory lifecycle.

## Operating Rules

1. Keep root `AGENTS.md` short. It should point here, not absorb every rule.
2. Store durable knowledge in category folders:
   - `openai-codex/` for official Codex/OpenAI operating patterns.
   - `evals/` for evaluation, repair loops, prompt/skill optimization, and quality gates.
   - `github-research/` for inspected GitHub projects and implementation patterns.
   - `product/` for KRN product identity, dashboard/control-plane rules, and roadmap decisions.
   - `reviews/` belongs outside this folder; reviewer prompts are indexed from their own directory when needed.
3. Use this filename pattern:
   - `YYYY-MM-DD--short-kebab-topic.md`
   - Example: `2026-06-19--compact-hooks-continuity.md`
4. Every memory note must include:
   - `Status`: `fact`, `inference`, `hypothesis`, `decision`, or `blocked`.
   - `Sources`: links or local file references.
   - `Useful pattern`: the extracted engineering pattern.
   - `KRN implication`: how the pattern changes this product.
   - `Failure mode`: when the pattern becomes harmful.
   - `Review trigger`: when the note must be updated or invalidated.
5. Do not store secrets, raw private transcripts, API keys, customer data, or unreviewed claims as facts.
6. If a note is based on web research, include direct links and access date.
7. If a note changes a product decision, update the canonical plan or decision log too.
8. If a note only describes the current session state, mark it as `session-state` and give it a short TTL or explicit invalidation condition.

## Required Read Order

Before major planning work:

1. Read this index.
2. If a `/goal` is active, read [docs/goals/INDEX.md](../goals/INDEX.md), then the active read set listed there: [docs/goals/goal-038.md](../goals/goal-038.md) and [docs/plans/canonical/draft.md](../plans/canonical/draft.md). Older goals are indexed evidence or lab history, not default context.
3. Read current final product direction only when product direction is unclear or changing:
   - [docs/plans/canonical/draft.md](../plans/canonical/draft.md)
4. Read current canonical synthesis only for synthesis/source-ledger work:
   - [docs/plans/canonical/draft.md](../plans/canonical/draft.md)
   - [docs/plans/canonical/pattern-matrix.md](../plans/canonical/pattern-matrix.md)
   - [docs/plans/canonical/SOURCES.md](../plans/canonical/SOURCES.md)
5. For product implementation terms, read [CONTEXT.md](../../CONTEXT.md) only when terms are unclear or changing.
6. Read relevant category notes below.

## Index

### OpenAI / Codex

- [AGENTS.md standard and anti-drift rules](./openai-codex/2026-06-19--agents-md-standard.md)
- [Long-running goals and codex exec boundaries](./openai-codex/2026-06-19--long-running-goals-and-codex-exec.md)
- [OpenAI Cookbook to KRN pattern map](./openai-codex/2026-06-19--openai-cookbook-to-krn-pattern-map.md)
- [PreCompact and PostCompact continuity hooks](./openai-codex/2026-06-19--compact-hooks-continuity.md)
- [ChatGPT reviewer bridge](./openai-codex/2026-06-19--chatgpt-reviewer-bridge.md)
- [Token-efficient research synthesis](./openai-codex/2026-06-20--token-efficient-research-synthesis.md)

### Evals

- [Codex memory compliance evals](./evals/2026-06-19--codex-memory-compliance-evals.md)
- [Coding quality rubric for agent work](./evals/2026-06-20--coding-quality-rubric.md)
- [Operator skill impact first results](./evals/2026-06-19--operator-skill-impact-first-results.md)
- [Operator skill impact loop](./evals/2026-06-19--operator-skill-impact-loop.md)
- [Repair loops, Promptfoo, and quality gates](./evals/2026-06-19--repair-loops-promptfoo-quality-gates.md)
- [Lightweight agent lab rule](./evals/2026-06-20--lightweight-agent-lab-rule.md)

### GitHub Research

- [karpathy/autoresearch experiment loop](./github-research/2026-06-19--karpathy-autoresearch-experiment-loop.md)
- [mattpocock/sandcastle sandboxed agent orchestration](./github-research/2026-06-19--mattpocock-sandcastle.md)
- [mattpocock/skills operator pipeline](./github-research/2026-06-19--mattpocock-skills-operator-pipeline.md)

### Product

- [KRN naming and Gas Town codename](./product/2026-06-19--krn-naming-and-gas-town-codename.md)
- [Final product plan and three realization slices](./product/2026-06-19--final-product-plan-and-slices.md)
- [Technology stack decision](./product/2026-06-19--technology-stack-decision.md)
- [Product spine object contracts](./product/2026-06-19--product-spine-object-contracts.md)
- [KRN init runtime spine](./product/2026-06-19--krn-init-runtime-spine.md)
- [KRN doctor runtime report](./product/2026-06-19--krn-doctor-runtime-report.md)
- [KRN eval runtime report](./product/2026-06-19--krn-eval-runtime-report.md)
- [KRN review runtime report](./product/2026-06-19--krn-review-runtime-report.md)
- [KRN MCP read model](./product/2026-06-19--krn-mcp-read-model.md)
- [KRN MCP STDIO transport](./product/2026-06-20--krn-mcp-stdio-transport.md)
- [KRN control-plane proposal contract](./product/2026-06-20--krn-control-plane-proposal-contract.md)
- [KRN dashboard view-model contract](./product/2026-06-20--krn-dashboard-view-model-contract.md)
- [KRN source-backed proposal store](./product/2026-06-20--krn-source-backed-proposal-store.md)
- [KRN MCP proposal tool](./product/2026-06-20--krn-mcp-proposal-tool.md)
- [KRN Pending Review view model](./product/2026-06-20--krn-pending-review-view-model.md)
- [KRN Dashboard Pending Review UI](./product/2026-06-20--krn-dashboard-pending-review-ui.md)
- [KRN Proposal Review Decision Ledger](./product/2026-06-20--krn-proposal-review-decision-ledger.md)
- [KRN Proposal Promotion Workflow](./product/2026-06-20--krn-proposal-promotion-workflow.md)
- [KRN Promotion Review Dashboard Surface](./product/2026-06-20--krn-promotion-review-dashboard-surface.md)
- [KRN Eval Runs Dashboard Surface](./product/2026-06-20--krn-eval-runs-dashboard-surface.md)
- [KRN Benchmark Report Spine](./product/2026-06-20--krn-benchmark-report-spine.md)
- [KRN Live Codex Benchmark Pilot](./product/2026-06-20--krn-live-codex-benchmark-pilot.md)
- [KRN Benchmark Reports Control-Plane Surface](./product/2026-06-20--krn-benchmark-reports-control-plane-surface.md)
- [KRN Expanded Live Benchmark Suite](./product/2026-06-20--krn-expanded-live-benchmark-suite.md)
- [KRN Benchmark No-Lift Repair Record](./product/2026-06-20--krn-benchmark-no-lift-repair-record.md)
- [KRN Benchmark Current-Child Repair Attempt](./product/2026-06-20--krn-benchmark-current-child-repair-attempt.md)
- [KRN Benchmark Assisted Prompt Load Repair](./product/2026-06-20--krn-benchmark-assisted-prompt-load-repair.md)
- [KRN Benchmark Memory-Layer Next Action Repair](./product/2026-06-20--krn-benchmark-memory-layer-next-action-repair.md)
- [KRN Benchmark Lift Status Stability Gate](./product/2026-06-20--krn-benchmark-lift-status-stability-gate.md)
- [KRN Benchmark Live-Suite Registry Policy Gate](./product/2026-06-20--krn-benchmark-live-suite-registry-policy-gate.md)
- [KRN Benchmark Live Stability Readiness Gate](./product/2026-06-20--krn-benchmark-live-stability-readiness-gate.md)
- [KRN Benchmark Live Runner Stability Repair](./product/2026-06-20--krn-benchmark-live-runner-stability-repair.md)
- [KRN Benchmark Repeat-Clean Live Stability](./product/2026-06-20--krn-benchmark-repeat-clean-live-stability.md)
- [KRN Benchmark Arena Contract](./product/2026-06-20--krn-benchmark-arena-contract.md)
- [KRN Benchmark Expanded Arena Registry](./product/2026-06-20--krn-benchmark-expanded-arena-registry.md)
- [KRN Benchmark Expanded Arena Fixture Scoring](./product/2026-06-20--krn-benchmark-expanded-arena-fixture-scoring.md)
- [KRN Benchmark Expanded Arena Live Runner](./product/2026-06-20--krn-benchmark-expanded-arena-live-runner.md)
- [KRN Benchmark Expanded Arena Smoke Worker Ergonomics](./product/2026-06-20--krn-benchmark-expanded-arena-smoke-worker-ergonomics.md)
- [KRN operating architecture and memory layers](./product/2026-06-20--krn-operating-architecture-and-memory-layers.md)
- [KRN source bank and engineering pattern memory](./product/2026-06-20--krn-source-bank-and-engineering-patterns.md)
- [KRN AI harness dictionary](./product/2026-06-20--krn-ai-harness-dictionary.md)
- [KRN senior engineering lens](./product/2026-06-20--krn-senior-engineering-lens.md)
- [Practitioner memory brain candidates](./product/2026-06-20--practitioner-memory-brain-candidates.md)
- [KRN research pack runtime scaffold](./product/2026-06-20--krn-research-pack-runtime-scaffold.md)
- [KRN product principles and dashboard control plane](./product/2026-06-19--krn-product-principles.md)

### Reviewer Prompts

- [Second opinion prompt for current setup](../reviews/second-opinion-current-setup.md)

## Maintenance Rule

When adding a new note, update this index in the same change. A memory note that is not linked here should be treated as undiscovered until indexed.
