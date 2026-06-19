# mattpocock/sandcastle

Status: inference

Sources:

- GitHub: `mattpocock/sandcastle`, accessed 2026-06-19: https://github.com/mattpocock/sandcastle
- README states it is a TypeScript library for orchestrating AI coding agents in isolated sandboxes with `sandcastle.run()`, branch strategies, commits, and sandbox providers.

## Observation

Sandcastle is a strong example of agent orchestration as engineering infrastructure:

- programmatic `run()` API,
- Docker/Podman/Vercel/no-sandbox providers,
- branch/worktree strategies,
- `maxIterations`,
- completion signals,
- log files and stream events,
- commit collection,
- warm `createSandbox()` for implement-then-review,
- `sandbox.exec()` for harness-owned verification commands,
- session resume/fork support where the provider supports it.

It has visible adoption signal, but the important part is not stars. The important part is the mechanism: agent work happens in isolated worktrees/sandboxes with logs, branch boundaries, explicit iteration limits, and reviewable commits.

## Useful Pattern

For KRN:

`isolated worktree/sandbox -> bounded agent run -> commit/diff/log capture -> harness verification -> review handoff`.

This is stronger than "let the agent edit the active checkout" for AFK or batch tasks.

## KRN Implication

KRN should study Sandcastle during the GitHub-solutions research phase. Potential borrowable concepts:

- sandbox provider interface,
- branch strategy vocabulary,
- iteration caps,
- completion signals,
- warm sandbox for multi-stage implement/review,
- log streaming to future dashboard,
- commit/diff capture as a first-class artifact,
- preservation of dirty worktrees for inspection.

Do not copy its architecture blindly. KRN's differentiator is memory/source/eval/control-plane around Codex, not just sandbox orchestration.

## Failure Mode

Sandcastle-like orchestration can become a local CI/agent runner without a scientific memory layer. It can also hide tool-specific assumptions if KRN tries to support every provider too early.

## Review Trigger

Update after a dedicated GitHub research pass comparing Sandcastle with other starred or technically important projects such as SWE-agent, Aider, Cline/Roo, OpenHands, Claude/agent skill collections, and Codex-oriented wrappers.
