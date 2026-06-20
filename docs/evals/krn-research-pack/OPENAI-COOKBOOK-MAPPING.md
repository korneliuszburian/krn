---
id: krn-research-pack-openai-mapping
kind: eval-mapping
status: active
owner: krn
updated: 2026-06-20
---

# OpenAI Cookbook Mapping

| Case | Behavior under test | Source pattern | Metrics | Failure means |
|---|---|---|---|---|
| `valid-fixture-parses` | Research-pack contract preserves source budget, source tiers, mechanisms, contradictions, and promotion targets. | Codex task decomposition and evidence-backed goals; source-to-mechanism synthesis. | `schema_contract_score`, `research_depth_boundary_score` | The canonical artifact cannot represent bounded deep research. |
| `known-bad-shallow-ready-pack-fails` | Three shallow sources cannot be marked ready for review. | Anti-slop eval and overclaim boundary patterns. | `schema_contract_score`, `anti_slop_score` | Shallow browsing can masquerade as complete research. |
| `generated-scaffold-parses` | CLI creates a typed scaffold without claiming completed research. | Goals in Codex; progressive disclosure; artifact-first workflow. | `runtime_contract_score`, `overclaim_boundary_score` | KRN cannot hand a researcher a bounded artifact without overclaiming. |

## Rule

This eval proves static/runtime research-pack scaffolding only. Live researcher quality needs a separate worker/lab eval with one hypothesis and a keep/discard rule.
