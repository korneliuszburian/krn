---
id: product-spine
kind: spec
status: active
owner: krn
updated: 2026-06-19
sources:
  - docs/goals/goal-004.md
  - docs/plans/canonical/draft.md
  - docs/plans/canonical/pattern-matrix.md
  - docs/plans/canonical/SOURCES.md
---

# Product Spine

## Purpose

The product spine is the first machine-readable layer for Gas Town.

It turns existing repo artifacts into stable objects that future `krn init`, read-only API/MCP, runtime skills, and dashboard views can consume without re-parsing free-form markdown every time.

This is not a database, API, dashboard, or runtime skill layer. It is the contract those layers must read later.

## Object Set

| Object | Why it exists now | First source artifact |
|---|---|---|
| `MemoryEntry` | Durable source-backed memory with review state and invalidation. | `docs/memory/evals/2026-06-19--operator-skill-impact-first-results.md` |
| `SourceClaim` | Claim ledger row with evidence grade and risk. | `docs/plans/canonical/SOURCES.md` |
| `EvalRun` | Machine-readable eval report summary and caveat. | `.krn/evals/operator-skill-impact/20260619T113614965572Z-546909/report.json` |
| `SkillImpactReport` | Skill decisions from baseline vs skill-assisted comparison. | `operator-skill-impact` reports and memory note |
| `Proposal` | Pending change object for future review queues. | `goal-004` product-spine proposal |
| `Decision` | Approved product/architecture decision with rejected alternatives. | canonical decision log and product principles |
| `CompactCheckpoint` | Continuity checkpoint metadata without treating runtime state as truth. | `.krn/compact/latest-checkpoint.md` |
| `ProjectProfile` | Small product identity and guardrail object. | `AGENTS.md` and product principles memory |

## Contract Rules

- Every object has `schema_version`, `id`, `kind`, `status`, `created_at`, and `source_refs`.
- Runtime reports stay in `.krn/`; durable reviewed lessons move into `docs/memory`.
- Proposal and decision objects must stay separate. A proposal is not approved truth.
- Eval objects must include an interpretation caveat.
- Dashboard-facing objects need owner, action, source, or failure-mode information before they become metrics.
- The validator checks examples and known-bad fixtures locally before any API/MCP/dashboard work starts.

## Commands

Validate schemas, examples, and known-bad fixtures:

```bash
python3 scripts/specs/validate_product_spine.py --mode validate
```

Result reports are written under:

```text
.krn/specs/product-spine/{run_id}/report.json
```

Runtime reports are local artifacts. Reviewed lessons should be promoted to `docs/memory`.

## Next Product Steps

After this spec validates:

1. `krn init --dry-run` can produce a manifest of files and initial product-spine objects.
2. Read-only API/MCP can expose these objects without broad write access.
3. Runtime skills can consume object IDs and schemas instead of hidden chat state.
4. The dashboard can render Memory Core, review queue, eval runs, claims, and decisions from real objects.
