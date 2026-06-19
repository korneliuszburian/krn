---
id: product-spine-current-state-audit
kind: audit
status: active
owner: krn
updated: 2026-06-19
sources:
  - docs/goals/goal-004.md
  - docs/memory/INDEX.md
  - docs/plans/canonical/SOURCES.md
  - .krn/evals/operator-skill-impact/20260619T113614965572Z-546909/report.json
  - .krn/compact/latest-checkpoint.md
---

# Current-State Audit

## Summary

The repo has enough real artifacts to create product-spine examples without inventing future state.

| Artifact class | Current source | Has schema before goal-004? | Product-spine object |
|---|---|---:|---|
| Memory note | `docs/memory/evals/2026-06-19--operator-skill-impact-first-results.md` | no | `MemoryEntry` |
| Source claim | `docs/plans/canonical/SOURCES.md` claim ledger | no | `SourceClaim` |
| Eval report | `.krn/evals/operator-skill-impact/*/report.json` | partial module-local schemas | `EvalRun` |
| Skill impact decision | operator-skill-impact live report plus memory condensation | no shared product object | `SkillImpactReport` |
| Proposal | future review queue item | no | `Proposal` |
| Decision | canonical decision log/product memory | no | `Decision` |
| Compact checkpoint | `.krn/compact/latest-checkpoint.md` | no product schema | `CompactCheckpoint` |
| Project identity | `AGENTS.md`, product principles memory | no | `ProjectProfile` |

## Gaps

- Existing eval modules have local report schemas, but no cross-product `EvalRun` object.
- Memory notes are indexed markdown, not machine-readable objects.
- Compact checkpoints are runtime continuity metadata and must not become truth without source refs.
- Proposal and decision states are not yet separated as objects.
- Dashboard object needs are known, but no dashboard should be built until these contracts validate.

## Decision

Create minimal object contracts and examples first. Defer API/MCP, runtime skills, database storage, and dashboard UI.
