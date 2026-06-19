# KRN Memory Index

This folder is the repo-local memory ledger for `krn-gas-town`.

It is not hidden model memory. It is checked-in, reviewable project knowledge that Codex must read before planning, research synthesis, architecture decisions, or long-running goal work.

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
2. If a `/goal` is active, read that execution contract first. The active parent goal is [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md). The latest completed Slice 3 child goal is [docs/goals/goal-009.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-009.md); use it as context before creating the next child goal. [docs/goals/goal-008.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-008.md) is completed Slice 3 transport/dashboard-contract context. [docs/goals/goal-007.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-007.md) is historical Slice 2 context. Use [docs/goals/goal-005.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-005.md) only as superseded Slice 2 `krn init --dry-run` context.
3. Read current final product direction:
   - [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md)
4. Read current canonical synthesis:
   - [docs/plans/canonical/draft.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/draft.md)
   - [docs/plans/canonical/pattern-matrix.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/pattern-matrix.md)
   - [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)
5. For product implementation terms, read [CONTEXT.md](/home/krn/coding/krn/active/krn-gastown/CONTEXT.md).
6. Read relevant category notes below.

## Index

### OpenAI / Codex

- [AGENTS.md standard and anti-drift rules](./openai-codex/2026-06-19--agents-md-standard.md)
- [Long-running goals and codex exec boundaries](./openai-codex/2026-06-19--long-running-goals-and-codex-exec.md)
- [OpenAI Cookbook to KRN pattern map](./openai-codex/2026-06-19--openai-cookbook-to-krn-pattern-map.md)
- [PreCompact and PostCompact continuity hooks](./openai-codex/2026-06-19--compact-hooks-continuity.md)
- [ChatGPT reviewer bridge](./openai-codex/2026-06-19--chatgpt-reviewer-bridge.md)

### Evals

- [Codex memory compliance evals](./evals/2026-06-19--codex-memory-compliance-evals.md)
- [Operator skill impact first results](./evals/2026-06-19--operator-skill-impact-first-results.md)
- [Operator skill impact loop](./evals/2026-06-19--operator-skill-impact-loop.md)
- [Repair loops, Promptfoo, and quality gates](./evals/2026-06-19--repair-loops-promptfoo-quality-gates.md)

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
- [KRN operating architecture and memory layers](./product/2026-06-20--krn-operating-architecture-and-memory-layers.md)
- [KRN product principles and dashboard control plane](./product/2026-06-19--krn-product-principles.md)

### Reviewer Prompts

- [Second opinion prompt for current setup](../reviews/second-opinion-current-setup.md)

## Maintenance Rule

When adding a new note, update this index in the same change. A memory note that is not linked here should be treated as undiscovered until indexed.
