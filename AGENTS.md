# KRN / krn-gas-town

This repo is the Gas Town workspace for building KRN: a Codex-native operating memory, eval, and control-plane layer.

## Read Order

1. The newest user message wins over every repo file.
2. Read [docs/memory/INDEX.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/INDEX.md).
3. If a `/goal` is active, read that execution contract first. The active parent goal is [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md). The latest completed Slice 3 child goal is [docs/goals/goal-035.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-035.md); [docs/goals/goal-034.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-034.md) is the immediately previous expanded-arena smoke-worker gate. Load older child goals only when the active goal, changed files, compact selector, or source ledger points to them.
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
- Use the senior engineering lens for every non-trivial decision: name the mechanism, tradeoff, simplest viable design, verification surface, and overclaim boundary. Details live in [KRN senior engineering lens](docs/memory/product/2026-06-20--krn-senior-engineering-lens.md).

## Global Coding Guidelines

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

Tradeoff: these guidelines bias toward caution over speed. For trivial tasks, use judgment.

### 1. Think Before Coding

Do not assume. Do not hide confusion. Surface tradeoffs.

Before implementing:

- State assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them; do not pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what is confusing. Ask.

### 2. Simplicity First

Minimum code that solves the problem. Nothing speculative.

- No features beyond what was asked.
- No abstractions for single-use code.
- No flexibility or configurability that was not requested.
- No error handling for impossible scenarios.
- If 200 lines could be 50, rewrite it.

Ask: would a senior engineer say this is overcomplicated? If yes, simplify.

### 3. Surgical Changes

Touch only what you must. Clean up only your own mess.

When editing existing code:

- Do not improve adjacent code, comments, or formatting.
- Do not refactor things that are not broken.
- Match existing style, even if you would do it differently.
- If you notice unrelated dead code, mention it; do not delete it.

When your changes create orphans:

- Remove imports, variables, and functions that your changes made unused.
- Do not remove pre-existing dead code unless asked.

The test: every changed line should trace directly to the user's request.

### 4. Goal-Driven Execution

Define success criteria. Loop until verified.

Transform tasks into verifiable goals:

- "Add validation" -> "Write tests for invalid inputs, then make them pass"
- "Fix the bug" -> "Write a test that reproduces it, then make it pass"
- "Refactor X" -> "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```text
1. [Step] -> verify: [check]
2. [Step] -> verify: [check]
3. [Step] -> verify: [check]
```

Strong success criteria let you loop independently. Weak criteria like "make it work" require clarification.

These guidelines are working if there are fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions happen before implementation rather than after mistakes.

## Ideal KRN Pipeline

Every non-trivial KRN product slice should move through this fast lane:

```text
intake
  -> grill/alignment if ambiguous
  -> destination artifact
  -> vertical slice
  -> implementation
  -> narrow verification
  -> review/handoff
  -> reviewed memory promotion only when durable truth changed
```

Quality bar:

- Prefer source-backed mechanisms over vibe-based architecture.
- Use deterministic evals only when they protect a contract, regression, or measured claim.
- Heavy benchmark/meta-research lanes are explicit lab work, not the default product-building loop.
- Every green report needs an interpretation caveat naming what it does not prove.
- Positive fixture deltas are not live lift. Green evals are not product quality by themselves.
- Dashboard/API/MCP surfaces must consume real typed objects; they must not invent product state.
- If a change cannot be falsified by a test, eval, known-bad fixture, or reviewable artifact, it is probably not ready to be product truth.
- Keep labs Karpathy-small by default: one hypothesis, one editable surface, one metric, one log, and a keep/discard decision before adding framework.

## Current Product Guardrail

KRN is not a prompt pack, PoC, MVP ladder, or dashboard-first app. It is only useful if source-backed memory, evals, hooks, MCP/API, and a review dashboard measurably reduce repeated Codex failure modes.
