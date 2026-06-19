---
id: product-spine-mappings
kind: mapping
status: active
owner: krn
updated: 2026-06-19
sources:
  - docs/goals/goal-004.md
  - docs/specs/product-spine/README.md
---

# Product-Spine Mappings

## Direction

Existing repo artifacts remain authoritative. Product-spine examples are normalized views over those artifacts, not replacements.

```text
repo artifact -> product-spine object -> future API/MCP/dashboard/runtime-skill consumer
```

## Artifact Mapping

| Source artifact | Product object | Mapping rule |
|---|---|---|
| `docs/memory/**/*.md` | `MemoryEntry` | Front matter and required memory sections become metadata, claim, evidence refs, failure mode, and review trigger. |
| `docs/plans/canonical/SOURCES.md` source/claim rows | `SourceClaim` | Claim ID, source IDs, evidence grade, risk, and decision usage become structured claim records. |
| `.krn/evals/**/report.json` | `EvalRun` | Module, run id, mode, generated time, summary, metric names, result path, and interpretation caveat become an eval object. |
| `operator-skill-impact` reports | `SkillImpactReport` | Per-skill recommendation and explicit-minus-baseline evidence become skill decision records. |
| Proposed memory/source/eval/schema changes | `Proposal` | Proposed change is reviewable and separate from approved memory or decisions. |
| Canonical decision rows/product principles | `Decision` | Approved decision, rationale, source refs, rejected alternatives, and risk become decision objects. |
| `.krn/compact/latest-checkpoint.md` | `CompactCheckpoint` | Generated time, event, trigger, turn id, key files, and cautions become continuity metadata. |
| `AGENTS.md` and product principles | `ProjectProfile` | Identity, current phase, allowed surfaces, blocked surfaces, and guardrails become a project profile object. |

## Future Consumers

| Consumer | Reads |
|---|---|
| `krn init --dry-run` | `ProjectProfile`, schema files, initial proposal/decision templates |
| Read-only API/MCP | all object types, read-only first |
| Runtime/product skills | object IDs and schema-backed fields |
| Dashboard Memory Core | `MemoryEntry`, `SourceClaim`, `EvalRun`, `Proposal`, `Decision` |
| Dashboard continuity view | `CompactCheckpoint`, `EvalRun`, `ProjectProfile` |

## Anti-Drift Rule

If a future implementation needs a field not present in these contracts, add a source-backed schema change and validator fixture before using the field in API, MCP, runtime skills, or dashboard UI.
