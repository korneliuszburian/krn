# KRN Policy Boundaries

`KrnPolicyBoundaries` is the reviewed local policy seed used by `krn init --proposal/apply policy_boundaries`.

It is not hook enforcement, a security product, broad API/cloud sync, or a dashboard permission model. It defines stable local boundary IDs that later hooks, skills, init review, and source/memory gates can consume.

## Contract

The seed must include:

- `schema_version: "krn-policy-boundaries.v1"`,
- `kind: "krn_policy_boundaries"`,
- local-first reviewed seed mode,
- at least one boundary for target-file mutation,
- a block for repo-local memory-core writes,
- source acceptance, command execution, and dashboard/API expansion handling,
- forbidden defaults for unreviewed writes, repo-local memory bodies, dashboard-first work, benchmark defaulting, cloud-sync defaulting, and productivity-lift claims,
- source refs and an overclaim boundary.

## Bootstrap Target

`krn init --apply policy_boundaries` may create `{target_root}/.krn/policies/boundaries.json` only after an approved review decision and exact `init_policy_boundaries` payload promotion.

That file is a local policy boundary seed. It does not prove hook enforcement, prompt-injection safety, broad API permissioning, cloud sync safety, dashboard usefulness, or productivity lift.

## Verification

```bash
pnpm exec vitest run packages/contracts/test/policy-boundaries.test.ts
pnpm run eval:krn-init
pnpm run eval:krn-proposal-promotion
```
