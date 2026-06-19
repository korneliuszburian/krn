# Operator Skill Impact First Results

Status: decision

Sources:

- Eval module: [docs/evals/operator-skill-impact/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/operator-skill-impact/README.md)
- Full live report: [.krn/evals/operator-skill-impact/20260619T113614965572Z-546909/report.json](/home/krn/coding/krn/active/krn-gastown/.krn/evals/operator-skill-impact/20260619T113614965572Z-546909/report.json)
- Corrected artifact re-score: [.krn/evals/operator-skill-impact/20260619T121119667653Z-644421/report.json](/home/krn/coding/krn/active/krn-gastown/.krn/evals/operator-skill-impact/20260619T121119667653Z-644421/report.json)
- Known-bad fixture report: [.krn/evals/operator-skill-impact/20260619T121112232575Z-644141/report.json](/home/krn/coding/krn/active/krn-gastown/.krn/evals/operator-skill-impact/20260619T121112232575Z-644141/report.json)
- Source pattern: [docs/memory/evals/2026-06-19--operator-skill-impact-loop.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/evals/2026-06-19--operator-skill-impact-loop.md)

## Observation

The first `operator-skill-impact` live run completed all five required baseline/explicit pairs with no runner blockers.

Summary:

- full live batch: 5/5 required cases completed, explicit 5/5 passed, 57/58 assertions passed;
- after correcting a brittle enforcement-first assertion, `new-operating-rule` re-scored 14/14 on the existing baseline/explicit artifacts;
- known-bad fixture failed as expected, 1/7 assertions passed;
- only `research-synthesis` produced a positive explicit-minus-baseline delta: `+0.1667`;
- `operator-intake`, `goal-execplan`, `eval-designer`, and `repair-handoff` are `keep_observe`, because baseline was already strong and explicit skill did not improve the measured score.

## Useful Pattern

Treat operator skills as measured interventions:

```text
neutral baseline -> explicit $skill -> same assertions -> metric delta -> keep/refine/merge/remove
```

When assertion wording changes but prompts and final artifacts are still valid, use artifact re-scoring instead of repeating expensive `codex exec` calls.

## KRN Implication

The P1 skills are allowed to stay, but the evidence supports a cautious decision:

| Skill | Current decision | Reason |
|---|---|---|
| `operator-intake` | keep_observe | Passed, but baseline also passed. |
| `research-synthesis` | keep | Explicit skill improved failure-mode coverage over baseline. |
| `goal-execplan` | keep_observe | Passed, but no measured lift over baseline. |
| `eval-designer` | keep_observe | Passed after brittle assertion repair; no measured lift over baseline. |
| `repair-handoff` | keep_observe | Passed, but no measured lift over baseline. |

Do not claim productivity improvement from this run. The defensible claim is narrower: the module can measure skill impact, one skill showed measurable lift on one fixture, and the other four did not regress on first pass.

## Failure Mode

The impact gate becomes eval theatre if:

- success is reported as "skills improve productivity" instead of per-fixture deltas;
- brittle negative string checks fail good answers that discuss rejected behavior;
- full live batches are run too often and become too slow for daily iteration;
- green fixture reports are promoted to product claims without human review burden evidence.

## Review Trigger

Update after:

- another full live batch,
- adding routing-variant measurements,
- adding human review burden scoring,
- changing any P1 operator skill contract,
- introducing runtime/product skills or dashboard-facing metrics.
