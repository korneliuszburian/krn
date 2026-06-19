# Long-Running Goals and `codex exec` Boundaries

Status: decision

Sources:

- OpenAI Cookbook: Using Goals in Codex, accessed 2026-06-19: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- OpenAI Cookbook: Using PLANS.md for multi-hour problem solving, accessed 2026-06-19: https://developers.openai.com/cookbook/articles/codex_exec_plans
- OpenAI Codex manual, non-interactive mode, fetched 2026-06-19 through `openai-docs`.

## Observation

`/goal` and `codex exec` solve different problems.

`/goal` is an interactive persistent objective attached to a thread. It can keep the objective visible across turns and continue while the thread is idle, subject to budget and blocker rules.

`codex exec` is a non-interactive worker mode. It is strong for CI, scripts, JSONL event streams, final structured output, log triage, patch generation, and deterministic batch steps. It does not behave like a continuously active conversational loop in the same way as an interactive Goal thread.

The practical contract is:

- use `--json` when the run must leave an auditable event stream,
- use `--output-last-message` when the final answer must become a durable artifact,
- use `--output-schema` when downstream tooling or dashboard ingestion needs stable structure,
- prefer read-only/default sandbox for eval/review workers,
- treat non-zero exit, missing output file, or timeout as runner/setup failure, not model behavior.

## Useful Pattern

Use two execution lanes:

1. Interactive Goal lane:
   - use for research, ambiguous debugging, multi-turn synthesis, dashboard planning, and human-supervised strategy.
   - state outcome, verification surface, constraints, boundaries, iteration policy, and blocked stop condition.
2. `codex exec` worker lane:
   - use for bounded review, repair, eval, source extraction, CI, schema-backed reports, and repeatable worker steps.
   - every worker pass must write an artifact: JSONL, final schema output, patch, summary, eval result, or decision candidate.
   - every worker pass must have a stop condition before it starts.

## KRN Implication

KRN must not pretend that `codex exec` is a magical autonomous conversation.

The product architecture should treat `codex exec` as:

- a batch worker,
- an eval runner,
- a repair-pass worker,
- a source extraction worker,
- a CI/automation primitive,
- a way to generate structured artifacts for the dashboard.

The active, long-running reasoning loop remains:

`Goal thread -> checked-in plan/state -> hooks/checkpoints -> eval artifacts -> dashboard review`.

`codex exec` can resume a non-interactive session where supported, but the durable continuity layer must still be artifact-first.

## Failure Mode

The system fails if it describes `codex exec` as continuous agent autonomy. That would create false expectations and hide the need for explicit state transfer, evidence files, stop criteria, and review gates.

## Review Trigger

Update this note if official Codex docs change `codex exec` lifecycle semantics, if Goal behavior changes materially, or if KRN implements a higher-level loop that wraps `codex exec` with its own state machine.
