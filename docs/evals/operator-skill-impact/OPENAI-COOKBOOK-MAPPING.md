---
id: operator-skill-impact-openai-mapping
kind: eval-source-map
status: active
owner: krn
updated: 2026-06-19
---

# OpenAI Cookbook Mapping

| Case | Source pattern | KRN contract | Metrics | Failure prevented |
|---|---|---|---|---|
| `broad-next-step` | Goals in Codex; Codex ExecPlans; Matt Pocock operator pipeline. | Broad repo requests route to the active goal and smallest verifiable operating slice before API/dashboard work. | `source_grounding_score`, `phase_discipline_score`, `verification_score`, `context_cost_score` | Dashboard/API drift from vague "what next" prompts. |
| `source-list-synthesis` | Agent improvement loop; OpenAI eval flywheel; source-backed memory notes. | Source work must extract mechanisms, KRN implications, eval/falsification, and failure modes. | `task_success_score`, `source_grounding_score`, `verification_score`, `review_burden_score` | Link lists, star-count reasoning, or hype without engineering transfer. |
| `vague-multiphase-objective` | Goals in Codex; ExecPlan living-plan discipline. | Vague objectives become evidence-based goals with boundaries and stop conditions. | `task_success_score`, `phase_discipline_score`, `verification_score`, `review_burden_score` | "Make it better" plans that redefine completion around partial progress. |
| `new-operating-rule` | Promptfoo-style local evals; repair loops; agent improvement loop. | A new rule becomes deterministic assertions, metrics, known-bad path, and report surface before instruction tuning. | `verification_score`, `repeat_failure_reduction_score`, `source_grounding_score` | Adding vague policy or enforcement without measurable behavior. |
| `failing-eval-report` | Iterative repair loops with Codex; agent improvement loop handoff. | A failure becomes a bounded repair record with classification, surface, validator, delta, and stop reason. | `source_grounding_score`, `phase_discipline_score`, `verification_score`, `repeat_failure_reduction_score` | Blind prompt churn or broad cleanup after a failed eval. |
| `ambiguous-product-naming` | Matt Pocock grill/domain workflow; Goals in Codex. | Ambiguous product terms become locked naming, acceptance standards, tradeoffs, assumptions, and update targets before implementation. | `task_success_score`, `source_grounding_score`, `phase_discipline_score`, `verification_score` | Starting code with unclear KRN/Gas Town product identity. |
| `final-product-slice-requirement` | Product requirement workflow; ExecPlan acceptance discipline. | A final-product slice becomes compact requirements with user value, success criteria, non-goals, public interfaces, and acceptance evidence. | `task_success_score`, `phase_discipline_score`, `verification_score` | Roadmap or implementation brainstorm instead of a requirement. |
| `hard-to-reverse-storage-choice` | Lightweight ADR practice; source/claim ledger discipline. | Hard-to-reverse choices get decision, rejected alternatives, consequences, and review trigger. | `task_success_score`, `phase_discipline_score`, `review_burden_score` | Durable architecture choices hidden in chat or scattered docs. |
| `goal-006-issue-slices` | Goals in Codex; Matt Pocock issue slicing; eval-first validation. | Final-product goals become dependency-ordered slices with validation commands and disproving checks. | `phase_discipline_score`, `verification_score`, `review_burden_score` | Vague backlog or MVP ladder. |
| `premature-completion-claim` | Release verification; repair loop stop conditions; macro-eval caution. | Completion claims are audited against acceptance evidence, validation commands, residual risk, and unsupported productivity claims. | `verification_score`, `review_burden_score`, `phase_discipline_score` | Marking Slice 1 complete from nice docs or green static tests. |

## Interpretation

The eval does not prove that a skill is universally useful. It only proves whether the explicit skill invocation improves these KRN fixtures compared with the neutral baseline under the current repo setup.
