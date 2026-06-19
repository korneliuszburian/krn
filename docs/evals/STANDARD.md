---
id: krn-eval-standard
kind: standard
status: active
owner: krn
updated: 2026-06-19
sources:
  - https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo
  - https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop
  - https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems
  - https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex
  - https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
  - https://developers.openai.com/cookbook/articles/codex_exec_plans
  - https://developers.openai.com/cookbook/examples/codex/code_modernization
---

# KRN Eval Standard

## Purpose

KRN evals test whether the operating layer changes Codex behavior in a useful, measurable way.

The first eval target is not model intelligence. It is setup compliance:

```text
neutral prompt -> current Codex setup -> evidence that AGENTS/memory/goal/canonical state was respected
```

## Source Pattern

OpenAI's strongest current pattern is an evidence flywheel, not a bigger prompt:

```text
trace/failure -> feedback -> eval definition -> local/CI gate -> repair/handoff -> rerun -> reviewed memory
```

For KRN this becomes:

```text
Codex run -> JSONL/final artifact -> deterministic assertions first -> metrics table -> reviewed repair or memory update
```

## Required Artifacts

Every non-trivial eval module must define these artifacts:

- `cases.json`: neutral prompts, expected behavior, source patterns, assertions, metrics, and failure modes.
- `result.schema.json`: machine-readable result contract.
- `README.md`: command contract and interpretation policy.
- `OPENAI-COOKBOOK-MAPPING.md`: case-to-pattern mapping, so a case is tied to an inspected source mechanism.
- Runtime report: `.krn/evals/{module}/{run_id}/report.json`.
- Runtime trace: JSONL/stdout/final-message artifacts when the runner calls `codex exec`.

Runtime artifacts stay local. Reviewed lessons move into `docs/memory`.

## OpenAI-Derived Contracts

KRN adopts these specific contracts from the OpenAI material:

| Source pattern | KRN contract | Proof surface |
|---|---|---|
| Goals in Codex | Every long-running objective names outcome, verification surface, constraints, boundaries, iteration policy, and blocked stop condition. | Goal file or active goal plus evidence audit. |
| ExecPlans | Complex implementation plans must be self-contained, living, novice-readable, and acceptance-driven. | Plan contains progress, discoveries, decisions, outcomes, exact commands, and observable acceptance. |
| Code modernization | Broad work is split into bounded pilot, overview, design/spec, validation/parity, implementation, and scalable template. | Pilot artifacts exist and validation says how outputs are compared. |
| Repair loops | Repair work records reviewer result, repair attempt, validator result, attempt log, and stop reason. | Attempt log shows pass, max attempts, no useful delta, or human-review stop. |
| Agent improvement loop | Real traces plus human/model feedback become eval definitions and a Codex handoff. | Eval case has source trace or failure source, rubric/assertions, pass/fail examples, and handoff classification. |
| Promptfoo migration | Evals live near code and run locally/CI with portable assertions. | Promptfoo or local runner validates config and emits comparable results. |

## Case Contract

Every eval case must include:

- `id`: stable kebab/snake identifier.
- `prompt`: neutral task prompt. Do not include "read memory" unless that is the behavior under test.
- `expected_behavior`: what should happen if the repo setup works.
- `source_patterns`: source IDs or local docs that justify the expected behavior.
- `assertions`: deterministic checks first.
- `metrics`: the behavior dimensions this case exercises.
- `failure_mode`: what a failure means.

## Assertion Order

1. Deterministic string/path assertions.
2. Structured output schema checks.
3. Trace/tool-use checks from Codex JSONL.
4. Artifact existence and freshness checks.
5. Human review.
6. LLM-as-judge only after calibration with pass/fail examples.

## Required Metrics

The first KRN eval module must report these metrics:

| Metric | Meaning | Minimum useful signal |
|---|---|---|
| `case_pass_rate` | Share of cases whose assertions all passed. | Regression guard only; not product proof. |
| `assertion_pass_rate` | Share of deterministic assertions that passed. | Helps locate partial failures inside a case. |
| `memory_routing_score` | Codex found repo-local memory/canonical/goal state without prompt reminders. | Required for setup compliance. |
| `source_grounding_score` | Codex used source-backed/canonical evidence rather than generic intuition. | Required before changing plans or memory. |
| `goal_alignment_score` | Codex preserved smallest verifiable next step and active goal direction. | Required before implementation slices. |
| `continuity_score` | Codex distinguished proven compact state from unproven hook behavior. | Required before hook claims. |
| `anti_slop_score` | Codex resisted broad vague edits and asked for evidence/scope. | Required before accepting broad repo tasks. |
| `drift_resistance_score` | Codex avoided dashboard-first, prompt-pack, swarm, or rewrite drift. | Required for product identity. |

Scores are deterministic ratios from tagged assertions. They do not replace human review.

## Repair Loop Contract

When an eval fails, create a repair record before changing prompts, `AGENTS.md`, memory, skills, hooks, or code:

```text
failure -> classify -> propose smallest repair -> update or add regression case -> run validate/live -> review -> promote lesson
```

Stop the repair loop when:

- all targeted cases pass,
- max attempts is reached,
- the latest repair creates no meaningful delta,
- the failure requires user or external input,
- the repair would broaden scope beyond the case's source pattern.

Do not tune on the same answer and call it validated. Keep a known-bad fixture or live rerun separate from the repair text.

## Anti-Slop Rules

- Do not create green demos. Cases must fail against a plausible bad answer.
- Do not tune `AGENTS.md` from one failed case without adding a regression case.
- Do not bulk-load docs to make a case pass. The point is to test whether the current setup routes attention correctly.
- Do not treat eval success as permission to skip human review.
- Do not hide uncertainty. If an assertion is weak, mark it weak.
- Do not add a new enforcement layer for a semantic policy until a deterministic check proves it is the right surface.
- Do not promote runtime results into memory until the source pattern and failure mode are clear.

## Runtime Layout

```text
docs/evals/{module}/
  README.md
  cases.json
  result.schema.json
  OPENAI-COOKBOOK-MAPPING.md

scripts/evals/
  {module_runner}.py

.krn/evals/{module}/{run_id}/
  report.json
  case-*.stdout.jsonl
  case-*.final.md
  case-*.stderr.txt
```

Runtime outputs stay local. Only stable lessons and standards move to `docs/memory`.
