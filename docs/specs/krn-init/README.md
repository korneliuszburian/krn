---
id: krn-init-contract
kind: command-contract
status: active
owner: krn
updated: 2026-06-21
sources:
  - docs/goals/goal-038.md
  - docs/plans/canonical/draft.md
  - docs/specs/technology-stack/decision.md
  - docs/specs/krn-context-packet/README.md
  - docs/specs/krn-source-graph/README.md
  - docs/specs/krn-eval/README.md
---

# KRN Init Final-Shaped Bootstrap Contract

## Purpose

`krn init --dry-run` is the safe repo-bootstrap preview for the final KRN operating layer. `krn init --proposal agent_instructions` is the first reviewed bootstrap target path.

It inspects a target project and writes a schema-backed dry-run manifest under `.krn/init/{run_id}/manifest.json`. It must not mutate target project setup files by default. The manifest must expose the final-shaped bootstrap plan without claiming write-mode safety or memory-core readiness.

The proposal mode writes an append-only `KrnControlPlaneProposal` under `.krn/proposals/**/proposal.json`. It uses the generated init manifest as source/evidence lineage and does not write `AGENTS.md`.

## Command

```bash
pnpm run krn -- init --dry-run --target .
pnpm run krn -- init --proposal agent_instructions --target .
```

Accepted shape:

```text
krn init --dry-run [--target <path>]
krn init --proposal agent_instructions [--target <path>]
```

The command must reject missing `init`, missing mode, unsupported proposal capability, unknown flags, and empty target values.

## Runtime Output

The command writes:

```text
{target_root}/.krn/init/{run_id}/manifest.json
```

The manifest uses `schema_version: "krn-init-manifest.v1"` and `kind: "krn_init_manifest"`.

Proposal mode also writes:

```text
{target_root}/.krn/proposals/{idempotency_key}/proposal.json
```

The exact proposal directory is a filesystem-safe idempotency-key segment. The proposal uses `schema_version: "krn-control-plane-proposal.v1"`, `proposal_kind: "init_bootstrap"`, `status: "proposal_only"`, `target.path: "AGENTS.md"`, and `write_policy.default_effect: "no_mutation"`.

## Bootstrap Plan

Every valid manifest must include a `bootstrap_plan` with these capabilities:

- `agent_instructions`: thin `AGENTS.md` selector, not a generated encyclopedia.
- `local_config`: local-first KRN config pointers, not cloud/API sync.
- `source_pointers`: source graph/index pointers, not a copied bibliography.
- `context_pointers`: bounded context packet runtime pointers, not memory bodies.
- `eval_baseline`: lean core/current eval baseline before explicit lab work.
- `skill_wiring`: owned, bounded, verified skills, not prompt sprawl.
- `policy_boundaries`: local policy/approval boundaries for unsafe writes and source/memory acceptance.

This is a planning contract for a future reviewed write flow. The dry-run command still writes only its runtime manifest.

## Dry-Run Boundary

Allowed writes:

- `.krn/init/{run_id}/manifest.json`
- `.krn/proposals/**/proposal.json` only when `--proposal agent_instructions` is explicit

Forbidden default writes:

- `AGENTS.md`
- `.codex/**`
- `.agents/**`
- `docs/memory/**`
- source files outside `.krn/init/**`

If an artifact already exists, the command reports it as detected and chooses `skip`, `proposal_only`, or `merge_required` instead of overwriting. Direct `modify` actions are invalid in dry-run manifests.

## Reviewed Proposal Boundary

`krn init --proposal agent_instructions` proves only that KRN can route one bootstrap target into the existing append-only proposal/review spine.

Allowed behavior:

- generate the dry-run manifest first;
- use that manifest path as source/evidence lineage;
- create a `proposal_only` record for `AGENTS.md`;
- block target mutation, memory-core writes, source-ledger mutation, dashboard event publish, and broad API/cloud sync.

Forbidden behavior:

- no `AGENTS.md` write;
- no apply mode;
- no inferred merge into existing instructions;
- no dashboard publish;
- no memory-core creation.

## Minimum Detection

The command must inspect whether these target artifacts exist:

- `AGENTS.md`
- `.codex/`
- `.agents/`
- `docs/memory/INDEX.md`
- `.krn/`

## Manifest Interpretation

A valid manifest proves only that KRN can inspect a target project and express a final-shaped dry-run bootstrap plan through a typed contract. It does not prove productivity lift, dashboard readiness, MCP readiness, memory-core quality, or write-mode safety.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/init-manifest.test.ts
pnpm test -- packages/contracts/test/control-plane-proposal.test.ts
pnpm run krn -- init --dry-run --target .
pnpm run krn -- init --proposal agent_instructions --target .
pnpm run eval:krn-init
```

Runtime reports stay under `.krn/`. Durable lessons move to `docs/memory/` only after review.
