# Lightweight Agent Lab Rule

Status: decision

Sources:

- `docs/memory/github-research/2026-06-19--karpathy-autoresearch-experiment-loop.md`
- `docs/memory/product/2026-06-20--krn-ai-harness-dictionary.md`
- `docs/source-bank/MANIFEST.md`
- OpenAI Codex manual, best practices section fetched 2026-06-20.
- SWE-agent paper: https://proceedings.neurips.cc/paper_files/paper/2024/file/5a7c947568c1b1328ccc5230172e1e7c-Paper-Conference.pdf
- Agentless paper: https://arxiv.org/html/2407.01489v1

## Observation

The expanded-arena lab became too large for its job. It is useful as accumulated evidence, but it is not the right default for future lab design. A lab for agent behavior should not start as a registry, dashboard surface, aggregate eval module, and multi-worker runner.

## Useful Pattern

Start with the smallest useful experiment:

```text
one hypothesis
one editable surface
one fixed metric
one command
one log file
one keep/discard decision
```

Then scale only the parts that repeatedly produce useful signal.

## KRN Implication

Future KRN meta-research work should begin as a small script or single contract before being promoted into `packages/evals`, dashboard surfaces, or control-plane state.

The default proof ladder is:

1. local scratch/lab run under `.krn/labs/**`,
2. memory note with keep/discard result,
3. deterministic contract only if the pattern should be protected,
4. product integration only if the contract changes real KRN behavior.

## Failure Mode

This becomes harmful if "small" means untyped, unreviewed, or overclaimed. Small labs still need a source, metric, stop condition, and no-lift boundary.

## Review Trigger

Update if a small lab repeatedly finds useful improvements and needs promotion into a maintained eval module.

