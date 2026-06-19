# PreCompact and PostCompact Continuity Hooks

Status: inference

Sources:

- OpenAI Codex manual: hooks, fetched 2026-06-19 through `openai-docs`.
- User-supplied PreCompact/PostCompact event contract, 2026-06-19.
- Local project prototype, 2026-06-19:
  - `.codex/hooks.json`
  - `.codex/hooks/compact_continuity.py`
  - `.krn/compact/README.md`
- Local runtime evidence, 2026-06-19:
  - `.krn/compact/events/compact-events.jsonl`
  - `.krn/compact/checkpoints/20260619T094308Z--019edf43-44c7-7bd1-b8cb-67d962b03933--manual.md`
  - `.krn/compact/resume/20260619T094318Z--019edf43-44c7-7bd1-b8cb-67d962b03933--manual.md`

## Observation

Codex hooks include `PreCompact` and `PostCompact`. Their matcher values are `manual` and `auto`.

The user wants a continuity mechanism for long-running goal tasks:

- before compaction, save a concise summary of the latest work,
- after compaction, force the next context to reread the latest state and resume from evidence rather than memory haze.

## Useful Pattern

Use compaction as a lifecycle event, not as a surprise.

PreCompact should create a checkpoint with:

- active goal or task objective,
- current status,
- files read and files changed,
- decisions made since the previous checkpoint,
- source links gathered,
- unresolved questions,
- blockers,
- exact next action,
- verification already run,
- verification still missing,
- caution list: what not to forget after compaction.

PostCompact should require a state refresh:

- read `docs/memory/INDEX.md`,
- read the latest active goal file,
- read the latest compaction checkpoint,
- inspect the current filesystem state,
- restate the active objective before continuing.

## Project-Local Prototype

This repo now contains a project-local prototype:

- hook config: `.codex/hooks.json`,
- hook script: `.codex/hooks/compact_continuity.py`,
- runtime state: `.krn/compact/`.

Manual script invocation produced:

- `.krn/compact/latest-checkpoint.md`,
- `.krn/compact/latest-postcompact.md`,
- `.krn/compact/events/compact-events.jsonl`.

This proves the local script and storage path.

The event log also contains a non-test manual compact event with a Codex-shaped `turn_id`:

`019edf43-44c7-7bd1-b8cb-67d962b03933`

That is evidence that the project-local hook loader fired for a live manual compact. It does not yet prove all failure modes, blocking behavior, or `continue: false` semantics.

## Storage Policy

Runtime compaction state belongs in:

`.krn/compact/`

Then promote only durable, reviewed conclusions to `docs/memory`.

Generated runtime files under `.krn/compact` are local continuity metadata, not source truth. The repo should track `README.md` and `.gitignore`, while generated checkpoints/events remain local.

## Hook Policy

PreCompact can block compaction only when the checkpoint write fails or the run is in a declared critical section.

PostCompact can block continuation when the required state files are missing or stale.

Hooks must not make semantic product decisions. They only enforce state capture and state reload.

## KRN Implication

KRN should ship a project-local `compact-continuity` hook template. It should be opt-in, reviewable through `/hooks`, and covered by fixtures:

- auto compact with valid checkpoint,
- manual compact with valid checkpoint,
- checkpoint write failure,
- PostCompact missing checkpoint,
- checkpoint contains forbidden secret-like string,
- checkpoint too long.

## Failure Mode

The mechanism fails if checkpoints become raw transcript dumps, contain secrets, or are treated as facts without source IDs. It also fails if PostCompact blindly trusts old state without inspecting the actual files.

## Review Trigger

Update after testing failure paths and proving whether `continue: false` behaves as expected for both `PreCompact` and `PostCompact`.
