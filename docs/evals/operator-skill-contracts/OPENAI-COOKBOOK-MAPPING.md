---
id: operator-skill-contracts-openai-mapping
kind: eval-mapping
status: active
owner: krn
updated: 2026-06-20
---

# OpenAI Cookbook Mapping

| Case | Behavior under test | Source pattern | Metrics | Failure means |
|---|---|---|---|---|
| `operator-intake` | Repo-local routing skill names current truth and phase boundaries. | Codex skills progressive disclosure; Goals in Codex; Matt Pocock operator pipeline. | `skill_contract_score`, `trigger_clarity_score`, `phase_boundary_score`, `eval_binding_score` | Work can drift into API/dashboard without P1/P2 evidence. |
| `research-synthesis` | Source work becomes mechanism/eval/failure-mode knowledge. | OpenAI Cookbook pattern mapping; Agent Improvement Loop. | `skill_contract_score`, `trigger_clarity_score`, `phase_boundary_score`, `eval_binding_score` | Sources become bibliography or hype summaries. |
| `long-researcher` | Deep source work declares a source universe, source budget, contradictions, and KRN transfer before promotion. | Codex skills progressive disclosure; source-backed synthesis; agent context-engineering research packs. | `skill_contract_score`, `trigger_clarity_score`, `phase_boundary_score`, `eval_binding_score` | Deep research becomes a shallow link list or endless browsing. |
| `goal-execplan` | Broad work becomes verifiable goal/ExecPlan. | Goals in Codex; ExecPlans; Code modernization pilot slicing. | `skill_contract_score`, `trigger_clarity_score`, `phase_boundary_score`, `eval_binding_score` | Long-running work ends on plausible progress instead of evidence. |
| `eval-designer` | Evals define deterministic cases, metrics, fixtures, schemas, and local commands. | Promptfoo migration; repair loops; Agent Improvement Loop. | `skill_contract_score`, `trigger_clarity_score`, `phase_boundary_score`, `eval_binding_score` | Eval layer becomes green demos. |
| `repair-handoff` | Failures become bounded repair records with stop reasons. | Iterative repair loops with Codex. | `skill_contract_score`, `trigger_clarity_score`, `phase_boundary_score`, `eval_binding_score` | Failed evals cause blind prompt/memory churn. |

## Rule

This eval only proves static P1 skill contracts. Live trigger behavior must be tested later with `codex exec` or a dedicated skill-trigger eval.
