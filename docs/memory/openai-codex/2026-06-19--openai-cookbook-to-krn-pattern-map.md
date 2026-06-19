# OpenAI Cookbook to KRN Pattern Map

Status: decision

Sources:

- OpenAI Codex manual, fetched 2026-06-19 through `openai-docs`: https://developers.openai.com/codex/codex-manual.md
- OpenAI Cookbook: Using Goals in Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- OpenAI Cookbook: Using PLANS.md for multi-hour problem solving, accessed 2026-06-19: https://developers.openai.com/cookbook/articles/codex_exec_plans
- OpenAI Cookbook: Modernizing your Codebase with Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/codex/code_modernization
- OpenAI Cookbook: Codex Prompting Guide, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
- OpenAI Cookbook: Build iterative repair loops with Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex
- OpenAI Cookbook: Build an Agent Improvement Loop with Traces, Evals, and Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop
- OpenAI Cookbook: Moving from OpenAI Evals to Promptfoo, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo
- OpenAI Cookbook: Related resources, accessed 2026-06-19: https://developers.openai.com/cookbook/articles/related_resources
- Local source clone: `/tmp/openai-cookbook`, commit `abd1e28`, inspected 2026-06-19.

## Observation

The useful OpenAI material is not a list of prompts. It is a set of operating patterns:

```text
small repo instruction surface -> self-contained plan -> worker/eval artifacts -> trace-derived feedback -> repair or handoff -> reviewed memory
```

KRN should store the extracted mechanism and failure mode, not copy large pages into memory.

## Useful Pattern

| Source | Extracted mechanism | KRN artifact | Eval or proof | Failure mode |
|---|---|---|---|---|
| Goals in Codex | Thread-scoped objective with outcome, verification surface, constraints, boundaries, iteration policy, and blocked stop condition. | `docs/goals/*.md` and active `/goal` text. | Completion audit checks concrete files, commands, tests, traces, or reports. | Treating budget exhaustion or plausible progress as completion. |
| Codex exec plans | ExecPlan is self-contained, living, novice-readable, and observable-outcome driven. | Future `docs/plans/exec/*.md` template; current canonical docs must preserve decisions and evidence. | Plan can restart work without hidden chat context. | Plan rots while code/docs move. |
| Code modernization | Broad work becomes a bounded pilot with overview, design/spec, validation/parity, implementation, and reusable template. | KRN implementation goal should start with one pilot slice, not full dashboard/platform. | Pilot has acceptance, parity/comparison plan, and real output artifacts. | Big-bang product build with no measurable parity. |
| Codex Prompting Guide | Harness quality depends on autonomy/persistence, codebase exploration, correct tool use, parallel reads, compaction, and eval-tuned behavior. | `AGENTS.md` stays short; detailed workflow lives in memory/evals/skills. | Neutral eval checks if Codex follows repo guidance without being reminded. | Prompt bloat, status-message theater, or instructions that stop rollout early. |
| Iterative repair loops | Reviewer, repair, validator, attempt log, and stop reason are separate. | `krn eval repair` later; now: eval failure record before changing instructions. | Attempt stops on pass, max attempts, no meaningful delta, or human-review need. | Infinite self-repair without new evidence. |
| Agent improvement loop | Real traces plus human/model feedback become eval definitions and a Codex-ready handoff. | `docs/evals/*`, `.krn/evals/*`, future dashboard proposal queue. | Eval has source trace/failure, deterministic assertions, pass/fail examples, and handoff classification. | Treating comments as memory without turning them into tests. |
| Promptfoo migration | Eval definitions should be portable and live near code/CI. | Local runner now; Promptfoo-compatible layout later. | `validate`, `score-fixture`, and `live` produce machine-readable reports. | Green dashboard eval that cannot run locally. |
| Related resources | Archived discovery index for classic prompting/eval tools and papers. | Candidate source list only. | Only promoted after primary-source inspection. | Treating archived resource list as current OpenAI guidance. |

## KRN Implication

KRN's project-local operating layer should use this sequence:

```text
AGENTS.md pointer -> memory index -> goal/ExecPlan -> codex exec worker -> eval report -> reviewed memory update -> dashboard object
```

The key rule is directionality. Runtime traces and eval failures can propose memory, but memory is not automatically true until reviewed and source-backed.

## Required KRN Standards

1. `AGENTS.md` points; it does not store the Cookbook.
2. A long-running task needs a Goal or ExecPlan with explicit evidence and blocked conditions.
3. `codex exec` is a worker lane and must emit JSONL, final message, schema output, patch, or report.
4. Eval cases must include source pattern, expected behavior, deterministic assertions, metrics, and failure mode.
5. Repair loops must log attempted change, validator output, and stop reason.
6. Dashboard objects must read reviewed ledgers and runtime artifacts; they do not invent state.

## Failure Mode

The product fails if this becomes a bibliography. A source is useful only when it changes a concrete artifact, eval, or operating rule.

## Review Trigger

Update this map when a new OpenAI Cookbook/Codex source is added to `docs/plans/canonical/SOURCES.md`, when an eval case is added without a source pattern, or when Promptfoo is introduced as the active runner.
