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
  - docs/specs/krn-eval-baseline/README.md
  - docs/specs/krn-policy-boundaries/README.md
  - docs/specs/krn-eval/README.md
---

# KRN Init Final-Shaped Bootstrap Contract

## Purpose

`krn init --dry-run` is the safe repo-bootstrap preview for the final KRN operating layer. `krn init --proposal agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries` routes the first reviewed bootstrap target paths. `krn init --apply agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries` is the exact reviewed write boundary for those targets.

It inspects a target project and writes a schema-backed dry-run manifest under `.krn/init/{run_id}/manifest.json`. It must not mutate target project setup files by default. The manifest must expose the final-shaped bootstrap plan without claiming write-mode safety or memory-core readiness.

The proposal mode writes an append-only `KrnControlPlaneProposal` under `.krn/proposals/**/proposal.json`. It uses the generated init manifest as source/evidence lineage and does not write target setup files.

The apply mode requires an existing `init_bootstrap` proposal, an existing `approved_for_promotion` review decision, and an exact init bootstrap payload before writing `AGENTS.md`, `.krn/config.toml`, `.krn/sources/index.json`, `.krn/context/index.json`, `.krn/evals/baseline.json`, `.agents/skills/README.md`, or `.krn/policies/boundaries.json`. It records the write under `.krn/promotions/**/promotion.json` and refuses overwrite of an existing target.

## Command

```bash
pnpm run krn -- init --dry-run --target .
pnpm run krn -- init --proposal agent_instructions --target .
pnpm run krn -- init --proposal local_config --target .
pnpm run krn -- init --proposal source_pointers --target .
pnpm run krn -- init --proposal context_pointers --target .
pnpm run krn -- init --proposal eval_baseline --target .
pnpm run krn -- init --proposal skill_wiring --target .
pnpm run krn -- init --proposal policy_boundaries --target .
pnpm run krn -- init --apply agent_instructions --proposal-path <path> --decision-path <path> --target .
pnpm run krn -- init --apply local_config --proposal-path <path> --decision-path <path> --target .
pnpm run krn -- init --apply source_pointers --proposal-path <path> --decision-path <path> --target .
pnpm run krn -- init --apply context_pointers --proposal-path <path> --decision-path <path> --target .
pnpm run krn -- init --apply eval_baseline --proposal-path <path> --decision-path <path> --target .
pnpm run krn -- init --apply skill_wiring --proposal-path <path> --decision-path <path> --target .
pnpm run krn -- init --apply policy_boundaries --proposal-path <path> --decision-path <path> --target .
```

Accepted shape:

```text
krn init --dry-run [--target <path>]
krn init --proposal agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries [--target <path>]
krn init --apply agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries --proposal-path <path> --decision-path <path> [--target <path>]
```

The command must reject missing `init`, missing mode, unsupported proposal/apply capability, missing apply paths, unknown flags, and empty target values.

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

The exact proposal directory is a filesystem-safe idempotency-key segment. The proposal uses `schema_version: "krn-control-plane-proposal.v1"`, `proposal_kind: "init_bootstrap"`, `status: "proposal_only"`, `target.path: "AGENTS.md"`, `".krn/config.toml"`, `".krn/sources/index.json"`, `".krn/context/index.json"`, `".krn/evals/baseline.json"`, `".agents/skills/README.md"`, or `".krn/policies/boundaries.json"`, and `write_policy.default_effect: "no_mutation"`.

Apply mode also writes:

```text
{target_root}/.krn/promotions/{idempotency_key}/promotion.json
{target_root}/AGENTS.md
{target_root}/.krn/config.toml
{target_root}/.krn/sources/index.json
{target_root}/.krn/context/index.json
{target_root}/.krn/evals/baseline.json
{target_root}/.agents/skills/README.md
{target_root}/.krn/policies/boundaries.json
```

Target setup files are written only from the exact payload already stored on the reviewed proposal. The promotion uses `schema_version: "krn-proposal-promotion.v1"`, `proposal_kind: "init_bootstrap"`, `promotion_scope: "approved_init_bootstrap_only"`, `apply_mode: "apply_exact_target_write"`, and `target_mutated: true`.

## Bootstrap Plan

Every valid manifest must include a `bootstrap_plan` with these capabilities:

- `agent_instructions`: thin `AGENTS.md` selector, not a generated encyclopedia.
- `local_config`: local-first KRN config pointers, not cloud/API sync.
- `source_pointers`: source graph/index pointers, not a copied bibliography.
- `context_pointers`: context packet pointer index, not memory bodies or active context.
- `eval_baseline`: lean core/current eval baseline before explicit lab work.
- `skill_wiring`: repo-local skill seed with owner/trigger/verification/deletion rules, not copied skill bodies or prompt sprawl.
- `policy_boundaries`: local policy/approval boundaries for unsafe writes and source/memory acceptance.

This is a planning contract for a future reviewed write flow. The dry-run command still writes only its runtime manifest.

## Dry-Run Boundary

Allowed writes:

- `.krn/init/{run_id}/manifest.json`
- `.krn/proposals/**/proposal.json` only when `--proposal agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries` is explicit

Forbidden default writes:

- `AGENTS.md`
- `.codex/**`
- `.agents/**`, except `.agents/skills/README.md` in explicit reviewed apply mode
- `docs/memory/**`
- source files outside `.krn/init/**`, except `.krn/sources/index.json`, `.krn/context/index.json`, `.krn/evals/baseline.json`, `.agents/skills/README.md`, or `.krn/policies/boundaries.json` in explicit reviewed apply mode

If an artifact already exists, the command reports it as detected and chooses `skip`, `proposal_only`, or `merge_required` instead of overwriting. Direct `modify` actions are invalid in dry-run manifests.

## Reviewed Proposal Boundary

`krn init --proposal agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries` proves only that KRN can route narrow bootstrap targets into the existing append-only proposal/review spine.

Allowed behavior:

- generate the dry-run manifest first;
- use that manifest path as source/evidence lineage;
- create a `proposal_only` record for `AGENTS.md`, `.krn/config.toml`, `.krn/sources/index.json`, `.krn/context/index.json`, `.krn/evals/baseline.json`, `.agents/skills/README.md`, or `.krn/policies/boundaries.json`;
- include an exact init bootstrap payload only when the target is absent and eligible for future apply;
- block target mutation, memory-core writes, source-ledger mutation, dashboard event publish, and broad API/cloud sync.

Forbidden behavior:

- no `AGENTS.md` write;
- no inferred merge into existing instructions;
- no dashboard publish;
- no memory-core creation.

## Reviewed Apply Boundary

`krn init --apply agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries` proves only that absent `AGENTS.md`, `.krn/config.toml`, `.krn/sources/index.json`, `.krn/context/index.json`, `.krn/evals/baseline.json`, `.agents/skills/README.md`, and `.krn/policies/boundaries.json` targets can be written through the existing proposal-review-promotion spine.

Allowed behavior:

- read an existing proposal and review decision from target-local paths;
- require `decision: "approved_for_promotion"`;
- require `proposal_kind: "init_bootstrap"` and an init bootstrap promotion payload;
- write the exact reviewed payload content to the proposal target only in explicit apply mode;
- persist the promotion under `.krn/promotions/**/promotion.json`;
- refuse unsafe paths and existing targets.

Forbidden behavior:

- no write without an approved decision;
- no inferred content from proposal prose;
- no overwrite or merge of existing `AGENTS.md`;
- no broad scaffold writes;
- no dashboard/API/cloud sync;
- no memory-core creation.
- no copied canonical source ledger, active source list, or source freshness claim.
- no active context packet, task intent, memory body, `docs/memory/**` dump, or active-goal/canonical-plan copy in the context pointer seed.
- no live eval report IDs, default lab/all lane, or productivity-lift claim in the eval baseline seed.
- no copied skill bodies, active skill claims, trigger-quality claims, or active-goal/canonical-plan copy in the skill wiring seed.
- no repo-local memory-core allowance, dashboard/API/cloud default, hook/security enforcement claim, or productivity-lift claim in the policy boundary seed.

## Minimum Detection

The command must inspect whether these target artifacts exist:

- `AGENTS.md`
- `.krn/config.toml`
- `.krn/sources/index.json`
- `.krn/context/index.json`
- `.krn/evals/baseline.json`
- `.agents/skills/README.md`
- `.krn/policies/boundaries.json`
- `.codex/`
- `.agents/`
- `docs/memory/INDEX.md`
- `.krn/`

## Manifest Interpretation

A valid manifest proves only that KRN can inspect a target project and express a final-shaped dry-run bootstrap plan through a typed contract. A successful apply proves only exact reviewed writes for the currently supported absent targets: `AGENTS.md`, `.krn/config.toml`, `.krn/sources/index.json`, `.krn/context/index.json`, `.krn/evals/baseline.json`, `.agents/skills/README.md`, and `.krn/policies/boundaries.json`. The source-pointers target is a source graph boundary seed, not a copied bibliography, active source ledger, final source service, or source freshness proof. The context-pointers target is a context packet pointer index, not an active packet, memory body store, task intent, or context quality proof. The eval-baseline target is a lean lane-policy seed, not a live report, eval-quality proof, benchmark result, or productivity-lift proof. The skill-wiring target is a repo-local skill index seed, not active skill generation, copied skill bodies, trigger-quality proof, skill eval proof, or productivity lift. The policy-boundaries target is a local boundary seed, not hook enforcement, prompt-injection safety, broad API permissioning, cloud sync safety, dashboard usefulness, or productivity lift. None proves dashboard readiness, MCP readiness, memory-core quality, broad repo bootstrap, or merge-mode safety.

## Validation

Run:

```bash
pnpm test -- packages/contracts/test/init-manifest.test.ts
pnpm test -- packages/contracts/test/eval-baseline.test.ts
pnpm test -- packages/contracts/test/control-plane-proposal.test.ts
pnpm test -- packages/contracts/test/proposal-promotion.test.ts
pnpm test -- packages/mcp/test/proposal-promotion-store.test.ts
pnpm run krn -- init --dry-run --target .
pnpm run krn -- init --proposal agent_instructions --target .
pnpm run krn -- init --proposal local_config --target .
pnpm run krn -- init --proposal source_pointers --target .
pnpm run krn -- init --proposal context_pointers --target .
pnpm run krn -- init --proposal eval_baseline --target .
pnpm run krn -- init --proposal policy_boundaries --target .
pnpm run krn -- init --apply eval_baseline --proposal-path <path> --decision-path <path> --target .
pnpm run krn -- init --apply policy_boundaries --proposal-path <path> --decision-path <path> --target .
pnpm run eval:krn-init
pnpm run eval:krn-proposal-promotion
```

Runtime reports stay under `.krn/`. Durable lessons move to `docs/memory/` only after review.
