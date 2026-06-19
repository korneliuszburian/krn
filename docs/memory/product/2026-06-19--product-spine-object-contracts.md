# Product Spine Object Contracts

Status: decision

Sources:

- [docs/goals/goal-004.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-004.md)
- [docs/specs/product-spine/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/README.md)
- [docs/specs/product-spine/mappings.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/product-spine/mappings.md)
- [docs/evals/product-spine-contracts/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/product-spine-contracts/README.md)
- Passing validator report: [.krn/specs/product-spine/20260619T124200342866Z-700904/report.json](/home/krn/coding/krn/active/krn-gastown/.krn/specs/product-spine/20260619T124200342866Z-700904/report.json)

## Observation

The repo now has a first product-spine contract layer:

- 8 object schemas,
- 8 real examples mapped from current repo artifacts,
- 1 known-bad fixture,
- local validator report with 17/17 checks passing.

The contracts cover `MemoryEntry`, `SourceClaim`, `EvalRun`, `SkillImpactReport`, `Proposal`, `Decision`, `CompactCheckpoint`, and `ProjectProfile`.

## Useful Pattern

Use product-spine objects as the handoff between research/evals and product surfaces:

```text
current artifact -> validated object -> future read-only API/MCP -> future dashboard/runtime skill
```

This prevents later layers from parsing arbitrary markdown or inventing state.

## KRN Implication

The next implementation slice can be `krn init --dry-run` or a read-only API/MCP prototype over validated objects. Dashboard UI should still wait until object consumers exist.

`EvalRun` and `SkillImpactReport` must keep interpretation caveats so green evals do not become productivity claims.

## Failure Mode

The product spine becomes harmful if schemas grow into imaginary future state, if examples stop mapping to real artifacts, or if a dashboard/API layer treats proposals as approved truth.

## Review Trigger

Update when `krn init --dry-run`, read-only API/MCP, runtime skills, or dashboard views consume these objects, or when a new object type is required.
