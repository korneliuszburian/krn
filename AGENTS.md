# KRN / krn-gas-town

This repo is the Gas Town workspace for building KRN: a Codex-native operating memory, eval, and control-plane layer.

## Read Order

1. The newest user message wins over every repo file.
2. Read [docs/memory/INDEX.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/INDEX.md).
3. If a `/goal` is active, read that execution contract first. The active parent goal is [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md). The latest completed Slice 3 child goal is [docs/goals/goal-030.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-030.md); [docs/goals/goal-029.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-029.md) is the immediately previous repeat-clean live stability gate. Load older child goals only when the active goal, changed files, compact selector, or source ledger points to them.
4. For product direction changes, read [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md). Do not reload it for every routine resume.
5. For synthesis work, use [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md) with targeted `rg` lookups unless the task explicitly requires broader synthesis. Read [docs/plans/canonical/draft.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/draft.md) and [docs/plans/canonical/pattern-matrix.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/pattern-matrix.md) only on demand.
6. For product implementation terms, read [CONTEXT.md](/home/krn/coding/krn/active/krn-gastown/CONTEXT.md) only when terms are unclear or changing.
7. After any compaction, read [.krn/compact/latest-postcompact.md](/home/krn/coding/krn/active/krn-gastown/.krn/compact/latest-postcompact.md) and [.krn/compact/latest-checkpoint.md](/home/krn/coding/krn/active/krn-gastown/.krn/compact/latest-checkpoint.md) as selectors first. Then run `git status -sb` and inspect changed or active-goal files before opening broad canonical docs.

## Operating Rules

- Keep this file small. If a rule needs examples, sources, or nuance, put it in `docs/memory/{category}/YYYY-MM-DD--short-topic.md` and link it from `docs/memory/INDEX.md`.
- Do not add unsourced product claims. Use `[FACT]`, `[INFERENCE]`, `[HYPOTHESIS]`, `[DECISION]`, or `[BLOCKED]` for important claims.
- When a durable conclusion changes, update the relevant canonical doc, source/claim ledger, and memory index in the same pass.
- Avoid context rot: use `docs/memory/INDEX.md` as the selector, load only relevant notes, and mark conflicts instead of blending old and new claims.
- Prevent docs rot: verify exact paths before citing them, mark stale or uncertain claims explicitly, and supersede old notes instead of silently contradicting them.
- For OpenAI/Codex behavior, read official OpenAI/Codex docs first. Do not infer current Codex capabilities from memory or competitors.
- Treat `codex exec` as a worker/CI/eval lane, not as a continuous conversational Goal loop.
- For long-running work, keep a self-contained goal/plan and use project-local `.codex` hooks for compact checkpoints when possible.
- GitHub stars, rankings, and hype are discovery signals only. Extract the mechanism before using any project as a pattern.

## Current Product Guardrail

KRN is not a prompt pack, PoC, MVP ladder, or dashboard-first app. It is only useful if source-backed memory, evals, hooks, MCP/API, and a review dashboard measurably reduce repeated Codex failure modes.
