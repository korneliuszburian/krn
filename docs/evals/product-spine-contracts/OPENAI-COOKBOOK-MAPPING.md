---
id: product-spine-contracts-openai-mapping
kind: eval-source-map
status: active
owner: krn
updated: 2026-06-19
---

# OpenAI Cookbook Mapping

| Source pattern | KRN product-spine contract | Proof surface |
|---|---|---|
| Goals in Codex | `goal-004` defines outcome, boundaries, completion criteria, disproving conditions, and blocker rule. | `docs/goals/goal-004.md` |
| ExecPlan / code modernization | Product work starts with one concrete pilot slice: object contracts and validator, not full dashboard/API. | `docs/specs/product-spine/` |
| Iterative repair loops | Eval/repair records need validator result, metric/caveat, and stop semantics. | `EvalRun`, `SkillImpactReport`, `Proposal` |
| Agent improvement loop | Runtime traces and feedback become eval and memory objects after review. | `EvalRun`, `MemoryEntry`, `Proposal` |
| Promptfoo-style local evals | Validation runs locally and writes a machine-readable report. | `scripts/specs/validate_product_spine.py`, `.krn/specs/product-spine/{run_id}/report.json` |

## Failure Prevented

Without this gate, API/MCP and dashboard work can start over informal markdown and claim product progress without stable object contracts.
