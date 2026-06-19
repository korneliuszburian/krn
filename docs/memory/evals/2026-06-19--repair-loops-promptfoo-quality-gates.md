# Repair Loops, Promptfoo, and Quality Gates

Status: decision

Sources:

- OpenAI Cookbook: Build iterative repair loops with Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex
- OpenAI Cookbook: Build an Agent Improvement Loop with Traces, Evals, and Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop
- OpenAI Cookbook: Macro Evals for Agentic Systems, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems
- OpenAI Cookbook: Moving from OpenAI Evals to Promptfoo, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo

## Observation

The strongest OpenAI pattern is not "ask a smarter model". It is an evidence loop:

`trace -> review -> repair -> validation -> record -> next pass or stop`.

OpenAI's Promptfoo migration article also matters because it positions Promptfoo as a portable CLI/CI eval workflow when you want eval definitions near application code.

## Useful Pattern

KRN evals should have three levels:

1. Micro evals:
   - skill trigger behavior,
   - output schema shape,
   - forbidden edits,
   - hook behavior,
   - source citation requirements.
2. Workflow evals:
   - research task from source to claim ledger,
   - long-running goal handoff after compaction,
   - repair loop convergence,
   - dashboard proposal review path.
3. Macro evals:
   - repeated real KRN tasks comparing baseline Codex vs Codex with KRN scaffolding,
   - trace-derived failure taxonomy,
   - owner/action mapping for dashboard metrics.

The repair loop itself must be explicit:

```text
failure source -> eval case -> local/CI run -> smallest repair -> rerun -> reviewed lesson
```

A repair record must contain:

- `failure_source`: trace id, fixture, live run, review comment, or source mismatch.
- `classification`: missing requirement, unreliable instruction following, implementation defect, or observability defect.
- `repair_attempt`: exact changed surface: prompt, skill, hook, MCP schema, memory note, docs, or code.
- `validator_result`: command, result path, metric delta, and pass/fail.
- `attempt_log`: chronological attempts with what changed and why.
- `stop_reason`: pass, max attempts, no meaningful delta, human input required, or scope violation.

Eval definitions must include:

- stable `eval_id`,
- source trace or failure source,
- expected behavior,
- deterministic assertions first,
- optional calibrated model-judge rubric,
- pass and fail examples,
- failure mode,
- owner/action when the eval fails.

## KRN Implication

Promptfoo is a good early candidate for local eval definitions because it is CLI/CI friendly. KRN should not depend on a hosted eval dashboard for MVP.

Every KRN improvement proposal must answer:

- Which trace or failure class created this?
- Which fixture should fail before the change?
- Which fixture should pass after the change?
- Is this a prompt, skill, hook, MCP schema, memory policy, or docs change?
- Is the test set separate from the tuning examples?
- What metric moved, and what is the stop reason if it did not?

For early KRN, a local runner is acceptable before Promptfoo. The standard is not the tool; the standard is portable, repeatable, source-backed evaluation that can later become Promptfoo config without changing the semantics.

## Failure Mode

The product fails if evals become green demos. Model-graded assertions need human calibration, known-bad examples, and regression history. A dashboard metric without an owner and action is not an eval signal.

## Review Trigger

Update when KRN chooses a concrete eval runner, adds the first `promptfoo.yaml`, or creates a trace-derived eval dataset.
