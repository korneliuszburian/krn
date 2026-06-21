---
id: krn-init-contracts
kind: eval-module
status: active
owner: krn
updated: 2026-06-21
runner: packages/evals/src/validate-krn-init.ts
---

# KRN Init Contracts Eval

## Purpose

This eval verifies the final-shaped dry-run bootstrap and first proposal-only bootstrap path:

```text
InitManifest parser -> krn init --dry-run -> bootstrap plan -> runtime manifest -> eval report
InitManifest parser -> krn init --proposal agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries -> KrnControlPlaneProposal -> append-only proposal store -> eval report
Init proposal -> approved review decision -> krn init --apply agent_instructions|local_config|source_pointers|context_pointers|eval_baseline|skill_wiring|policy_boundaries -> KrnProposalPromotion -> exact target write
```

It does not claim productivity lift, dashboard readiness, MCP readiness, memory-core quality, paper-research automation, broad repo bootstrap, or merge-mode safety.

## What This Tests

- The valid `krn-init` fixture parses through `@krn/contracts`.
- The known-bad fixture fails deterministically.
- The known-bad missing-bootstrap-capability fixture fails deterministically.
- The CLI-generated dry-run manifest exists and parses through `@krn/contracts`.
- The generated manifest includes agent instructions, local config, source pointers, context pointers, eval baseline, skill wiring, and policy boundaries.
- The CLI-generated `agent_instructions` proposal stores a parseable `init_bootstrap` proposal under `.krn/proposals`.
- The generated proposal cites the dry-run manifest as source/evidence lineage.
- The generated proposal does not write `AGENTS.md`.
- The CLI-generated `agent_instructions` apply path requires an approved review decision.
- The generated apply path writes `AGENTS.md` from the exact reviewed payload and records a promotion.
- The CLI-generated `local_config` apply path requires an approved review decision.
- The generated apply path writes `.krn/config.toml` from the exact reviewed payload, avoids active-goal runtime truth, and records a promotion.
- The CLI-generated `source_pointers` apply path requires an approved review decision.
- The generated apply path writes `.krn/sources/index.json` from the exact reviewed payload, avoids copying active source truth, and records a promotion.
- The CLI-generated `context_pointers` apply path requires an approved review decision.
- The generated apply path writes `.krn/context/index.json` from the exact reviewed payload, avoids memory bodies and active-goal truth, and records a promotion.
- The CLI-generated `eval_baseline` apply path requires an approved review decision.
- The generated apply path writes `.krn/evals/baseline.json` from the exact reviewed payload, avoids lab/all defaults and lift claims, and records a promotion.
- The CLI-generated `skill_wiring` apply path requires an approved review decision.
- The generated apply path writes `.agents/skills/README.md` from the exact reviewed payload, avoids copied skill bodies and active-goal truth, and records a promotion.
- The CLI-generated `policy_boundaries` apply path requires an approved review decision.
- The generated apply path writes `.krn/policies/boundaries.json` from the exact reviewed payload, blocks repo-local memory-core writes, avoids cloud/dashboard defaults and hook/security overclaims, and records a promotion.
- The eval writes a machine-readable report under `.krn/evals/krn-init-contracts/{run_id}/report.json`.

## Command

```bash
pnpm run eval:krn-init
```

## Runtime Output

```text
.krn/evals/krn-init-contracts/{run_id}/report.json
```

Runtime outputs stay local. Reviewed durable lessons move to `docs/memory`.

## Interpretation Policy

A green run means the final-shaped bootstrap dry-run contract, first proposal-only bootstrap targets, and reviewed exact `AGENTS.md` / `.krn/config.toml` / `.krn/sources/index.json` / `.krn/context/index.json` / `.krn/evals/baseline.json` / `.agents/skills/README.md` / `.krn/policies/boundaries.json` apply paths are locally checkable. It does not mean KRN improves Codex behavior, that skills are high quality, or that later API/MCP/dashboard/broad bootstrap/merge-mode work is ready to start.
