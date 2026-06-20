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
InitManifest parser -> krn init --proposal agent_instructions -> KrnControlPlaneProposal -> append-only proposal store -> eval report
Init proposal -> approved review decision -> krn init --apply agent_instructions -> KrnProposalPromotion -> exact AGENTS.md write
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

A green run means the final-shaped bootstrap dry-run contract, first proposal-only bootstrap target, and one reviewed exact `AGENTS.md` apply path are locally checkable. It does not mean KRN improves Codex behavior or that later API/MCP/dashboard/broad bootstrap/merge-mode work is ready to start.
