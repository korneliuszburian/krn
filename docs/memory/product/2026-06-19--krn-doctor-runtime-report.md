# KRN doctor runtime report

Status: fact

Sources:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/specs/krn-doctor/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-doctor/README.md)
- [docs/evals/krn-doctor-contracts/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-doctor-contracts/README.md)
- [packages/contracts/src/doctor-report.ts](/home/krn/coding/krn/active/krn-gastown/packages/contracts/src/doctor-report.ts)
- [packages/cli/src/main.ts](/home/krn/coding/krn/active/krn-gastown/packages/cli/src/main.ts)
- [packages/evals/src/validate-krn-doctor.ts](/home/krn/coding/krn/active/krn-gastown/packages/evals/src/validate-krn-doctor.ts)
- Local runtime evidence: `.krn/evals/krn-doctor-contracts/20260619T215147Z-1670172/report.json`

## Observation

`krn doctor` now exists as the second Slice 2 runtime command.

It writes `.krn/doctor/{run_id}/report.json` and reports readiness for these required surfaces:

- `agents`: `AGENTS.md`
- `memory`: `docs/memory/INDEX.md`
- `skills`: `.agents/skills/**/SKILL.md`
- `hooks`: `.codex/hooks.json` and `.codex/hooks/compact_continuity.py`
- `evals`: `docs/evals/**/cases.json`
- `runtime`: `.krn/`

Current narrow evidence:

```bash
pnpm typecheck
pnpm test -- packages/contracts/test/doctor-report.test.ts packages/cli/test/doctor.test.ts
pnpm run eval:krn-doctor
```

The latest `krn-doctor` eval report passed 3/3 cases and 7/7 assertions.

## Useful Pattern

Use readiness reports as typed runtime evidence, not as product truth:

```text
surface detection -> DoctorReport parser -> .krn/doctor report -> deterministic eval -> reviewed memory
```

The doctor command detects local surfaces and reports missing pieces as warnings. It does not modify setup files.

## KRN Implication

Slice 2 now has four typed CLI/runtime paths: `krn init --dry-run`, `krn doctor`, `krn eval`, and `krn review`.

This does not prove hook semantic correctness, productivity lift, dashboard readiness, or MCP readiness.

## Failure Mode

This becomes harmful if a `ready` doctor report is treated as proof that hooks cannot be bypassed, that memory content is correct, or that the control plane is ready. It only proves readiness-surface detection.

## Review Trigger

`krn eval` now aggregates the `krn-doctor-contracts` eval module, and `krn review` now consumes the latest doctor report as one proposal artifact. Update this note again when doctor checks add new surfaces, when hook trust semantics change, or when a read-only API/MCP layer exposes doctor state.
