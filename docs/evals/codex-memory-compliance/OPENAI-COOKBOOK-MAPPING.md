---
id: codex-memory-compliance-openai-mapping
kind: eval-mapping
status: active
owner: krn
updated: 2026-06-19
---

# OpenAI Cookbook Mapping

This table ties each eval case to an inspected source pattern. It prevents the module from becoming a pile of arbitrary string checks.

| Case | Neutral behavior under test | OpenAI pattern | Metrics | Proof | Failure means |
|---|---|---|---|---|---|
| `repo-intake-neutral` | Codex discovers repo-local memory/canonical state without prompt reminder. | AGENTS.md discovery, Codex Prompting Guide, Goals evidence standard. | `memory_routing_score`, `source_grounding_score`, `drift_resistance_score` | Final answer mentions memory/canonical/goal identity and avoids product drift. | Current setup is not enough to orient a neutral Codex run. |
| `next-slice-neutral` | Codex proposes the smallest evidence-backed next slice. | Code modernization pilot slicing; ExecPlan self-contained work; Goals verification surface. | `goal_alignment_score`, `source_grounding_score`, `drift_resistance_score` | Final answer picks a bounded slice tied to eval/operator pipeline rather than full platform. | Codex jumps to broad build work before proof. |
| `compact-continuity-neutral` | Codex distinguishes proven compact artifacts from unproven hook claims. | Codex hooks manual; memory and compaction separation; Goals evidence-based completion. | `continuity_score`, `source_grounding_score` | Final answer names Pre/PostCompact, `.krn/compact`, and remaining unproven behavior. | Codex overclaims lifecycle enforcement. |
| `anti-slop-neutral` | Codex resists broad vague improvement requests. | Codex Prompting Guide engineering discipline; repair-loop stop conditions; Promptfoo regression guard. | `anti_slop_score`, `goal_alignment_score`, `drift_resistance_score` | Final answer narrows scope, names assumptions/evidence, and refuses rewrite/refactor drift. | Codex turns ambiguity into speculative edits. |

## Result Interpretation

| Signal | Action |
|---|---|
| Case pass, all metric scores `1.0` | Treat as a green setup-compliance snapshot, not product proof. |
| Case pass, a metric below `1.0` | Investigate partial drift before changing instructions. |
| Case fail | Create a repair record and add or adjust a regression fixture before editing `AGENTS.md` or memory. |
| Live run fails to execute | Treat as runner/setup failure, not model behavior. |
| Validate passes only | Case definitions are syntactically sound; no behavior has been proven. |

## Cookbook Rules Applied

- Eval definitions stay near repo code.
- Deterministic assertions run before LLM judges.
- Runtime artifacts stay in `.krn/evals`.
- Reviewed lessons, not raw outputs, move into `docs/memory`.
- Repair changes need rerun evidence.
