# KRN Benchmark Current-Child Repair Attempt

Status: fact

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-021.md`
- `docs/goals/goal-022.md`
- `docs/evals/krn-benchmark-live-suite/README.md`
- `docs/specs/krn-repair-record/README.md`
- `docs/plans/canonical/SOURCES.md`
- `.krn/evals/krn-benchmark-live-suite/20260620T083211Z-2826332/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T081426Z-2776468/report.json`
- `.krn/evals/krn-benchmark-live-suite/20260620T083233Z-2828288/report.json`
- `.krn/benchmarks/krn-benchmark-live-suite/20260620T083233Z-2828288/report.json`

Useful pattern:

A repair record is not proof of repair. After a no-lift record, KRN must apply one scoped change, rerun deterministic validation, rerun live mode explicitly, and compare metric before/after. Failed or worse deltas stay in memory as routing evidence for the next repair.

KRN implication:

The first current-child repair attempt made benchmark latest-child scoring data-driven and fixed live timeout/error artifact capture. Deterministic validate mode passed. The final live rerun passed shape/evidence capture but worsened the live delta from `-0.0033` to `-0.3444`, with `goal006-next-benchmark-action.assisted` timing out and being represented by fallback final JSON.

Failure mode:

Do not treat a green live shape report as repair success. It means the live run produced parseable benchmark evidence. The metric says this repair attempt failed to improve assisted behavior. The next repair should focus on assisted prompt load, timeout behavior, and first-task action routing before expanding the suite.

Review trigger:

Update this note when a later repair attempt improves the live suite delta, when timeout policy changes, or when the suite reaches the 20-task lift gate.
