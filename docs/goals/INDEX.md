# KRN Goals Index

This file is the selector for `docs/goals/**`.

Goal files are evidence records, not the default context window. Do not read the whole directory on resume.

## Default Read Set

For normal KRN product work, read only:

1. `docs/goals/goal-038.md` - active final-product execution contract.
2. `docs/plans/canonical/draft.md` - canonical product blueprint when product direction or layer ownership is relevant.

Then stop. Load older goals only when the current task names them, changed files reference them, or the source ledger requires exact evidence.

## Current Direction

[DECISION] KRN is executing one final-product goal around the engineering kernel:

```text
mechanism-first
  -> bottleneck-led
  -> production-shaped
  -> context-budgeted
  -> diff-literate
  -> review-minimizing
  -> memory-operative
  -> proof-carrying
  -> deletion-friendly
```

[DECISION] `docs/memory/**` is a pattern bank / audit export, not the final memory system. `.krn/**` is runtime evidence/cache/ledger, not memory core. MemoryStore selection/application, the pre-edit engineering gate, bounded context packet, local source graph check, eval-lane split, final-shaped `krn init --dry-run` bootstrap, first proposal-only `krn init --proposal agent_instructions`, first reviewed `krn init --apply agent_instructions`, and second reviewed `krn init --proposal/apply local_config` target are now the active execution path. The next useful product slice should continue with source/context/eval/skill/policy bootstrap readiness or another narrow reviewed init capability, not add another passive note, dashboard panel, benchmark lane, broad API/cloud sync, research runtime, or broad scaffold writer.

## Buckets

| Bucket | Files | How to treat |
|---|---|---|
| Active final-product contract | `goal-038.md` | Current execution contract. Read for active `/goal` work and resume after compaction. |
| Current product blueprint | `docs/plans/canonical/draft.md` | Canonical product direction and state-ownership boundary. Read when selecting or changing product layers. |
| Product plan pointer | `docs/product/final-product-plan.md` | Compatibility pointer for older docs/tools. Do not duplicate product direction here. |
| Previous product contract | `goal-006.md` | Historical parent scope and evidence. Do not use as default execution contract. |
| Engineering-kernel reset | `goal-037.md` | Historical reset evidence. Its kernel is now folded into `goal-038` and `AGENTS.md`. |
| Product implementation evidence | `goal-003.md` through `goal-017.md`, plus `goal-036.md` | Historical proof for operator skills, product-spine contracts, typed runtime spine, MCP/proposal/dashboard/report surfaces, and bounded research-pack helper. Load only when touching the related code or docs. |
| Meta-research / benchmark lab archive | `goal-018.md` through `goal-034.md` | Evidence from the heavy benchmark/autoresearch lane. Do not use as the default product-building path. Load only for benchmark, eval, repair, or lab work. |
| Operating reset history | `goal-035.md`, `goal-036.md`, `goal-037.md` | Shows the pivot away from expanded-arena churn. `goal-037.md` supersedes `goal-035.md` as the current reset. |
| Superseded early planning | `goal-001.md`, `goal-002.md`, `goal-005.md`, `krn-gas-town-research.goal.md`, `krn-gas-town-research-2.goal.md` | Research/provenance only. Do not use as current direction unless a task explicitly asks for historical comparison. |

## Load Rules

- If a goal file has a stale `Status` header, this index wins for routing.
- Do not move or delete old goal files unless first updating every source, memory, and eval reference that points to them.
- Do not add a new goal file for tiny mechanical edits.
- New child goals must name the bottleneck, mechanism, smallest production-shaped behavior, proof, review burden, and overclaim boundary.
- Do not add new child goals for normal progress under `goal-038`; update `goal-038` progress/checkpoint state instead unless the user asks for a separate goal.
- Benchmark goals must stay in the lab lane unless the user explicitly asks for benchmark work.
- Product goals must end in code, a consumed contract, a review surface, or a deletion/merge decision. Passive documentation alone is not enough.
