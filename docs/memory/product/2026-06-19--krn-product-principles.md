# KRN Product Principles

Status: decision

Sources:

- [docs/goals/goal-001.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-001.md)
- [docs/goals/goal-002.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-002.md)
- OpenAI Codex manual, fetched 2026-06-19.
- OpenAI Cookbook pages listed in [docs/plans/canonical/SOURCES.md](/home/krn/coding/krn/active/krn-gastown/docs/plans/canonical/SOURCES.md)
- User-provided dashboard reference image and product direction.

## Product Identity

KRN is a source-backed operating memory, eval, and control plane for Codex work.

`krn init` is the bootstrap entry point, not the whole product.

The dashboard is a review/control UI for memory, sources, evals, traces, gaps, proposals, ownership, and approvals. It must not become vanity analytics.

## Core Rules

1. Evidence beats narration.
2. Memory is a pointer system with source IDs, TTL, review state, and invalidation.
3. `AGENTS.md` stays small and points to progressive-disclosure docs.
4. Skills are for repeatable workflows, not one-line preferences.
5. Subagents are explicit, bounded, and mostly read-only until proven useful.
6. Hooks capture deterministic events and gates; they do not decide product truth.
7. MCP/API writes are append-only, idempotent, schema-backed, and reviewable.
8. `codex exec` is a worker lane, not the same as a continuous Goal thread.
9. Long-running goals need state checkpoints and evidence-based completion.
10. Dashboard metrics need owner, action, source, and failure mode.

## Breakthrough Test

KRN is interesting only if it measurably reduces repeated Codex failure modes on real KRN tasks:

- fewer instruction violations,
- fewer wrong-file edits,
- better source-backed research,
- better post-compaction continuity,
- better repair-loop convergence,
- lower review burden.

If it only creates nicer docs, more agents, or more charts, it is not the product.

## Review Trigger

Update after the first canonical plan review, first local eval harness, first compact hook prototype, or first dashboard object model.
