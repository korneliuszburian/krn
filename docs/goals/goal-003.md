# Goal 003: Operator Skill Impact Evaluation Loop

## Status

Completed. `goal-004` should become the next active execution contract only after the user starts it with `/goal`.

## Mission

Prove whether KRN operator skills make Codex measurably better than baseline Codex on real KRN work.

The desired loop is:

```text
baseline Codex -> Codex with operator skill -> trace/eval comparison -> memory condensation -> skill repair or pruning -> rerun
```

## Scope

Evaluate the P1 operator skills:

- `operator-intake`
- `research-synthesis`
- `goal-execplan`
- `eval-designer`
- `repair-handoff`

This goal does not build runtime/product skills, API/MCP, or dashboard UI.

## Method

For each task fixture:

1. Run baseline Codex with neutral prompt and current repo instructions.
2. Run Codex with explicit relevant skill invocation.
3. When feasible, run Codex without explicit skill invocation to test model routing.
4. Capture JSONL/final artifacts under `.krn/evals/operator-skill-impact/{run_id}/`.
5. Score both runs with deterministic assertions first.
6. Add human review only for dimensions deterministic checks cannot cover.
7. Condense the result into `docs/memory` only after the failure mode or improvement is clear.

## Metrics

- `task_success_score`: required artifact or answer exists.
- `source_grounding_score`: answer uses correct repo/source evidence.
- `phase_discipline_score`: run stays in the intended phase.
- `verification_score`: run names or executes relevant checks.
- `review_burden_score`: less human correction needed.
- `context_cost_score`: skill does not add avoidable verbosity or confusion.
- `skill_routing_score`: model chooses the right skill when not forced.
- `repeat_failure_reduction_score`: previously observed failures decline.

## Minimum Fixtures

| Fixture | Baseline risk | Target skill |
|---|---|---|
| broad next-step request | dashboard/API drift | `operator-intake` |
| source list from OpenAI/Matt | bibliography instead of mechanisms | `research-synthesis` |
| vague multi-phase objective | weak completion criteria | `goal-execplan` |
| new operating rule | no metric or known-bad case | `eval-designer` |
| failing eval report | blind instruction tuning | `repair-handoff` |

## Acceptance

This goal is complete only when:

- an `operator-skill-impact` eval module exists,
- each fixture has baseline and skill-assisted runs or a documented runner blocker,
- reports compare metric deltas,
- at least one skill is kept/refined/merged/removed based on evidence,
- memory notes are updated with lessons learned,
- no productivity claim is made without report evidence.

## Evidence

- Eval module: [docs/evals/operator-skill-impact/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/operator-skill-impact/README.md)
- Full live report: [.krn/evals/operator-skill-impact/20260619T113614965572Z-546909/report.json](/home/krn/coding/krn/active/krn-gastown/.krn/evals/operator-skill-impact/20260619T113614965572Z-546909/report.json)
- Corrected re-score for `new-operating-rule`: [.krn/evals/operator-skill-impact/20260619T121119667653Z-644421/report.json](/home/krn/coding/krn/active/krn-gastown/.krn/evals/operator-skill-impact/20260619T121119667653Z-644421/report.json)
- Known-bad fixture report: [.krn/evals/operator-skill-impact/20260619T121112232575Z-644141/report.json](/home/krn/coding/krn/active/krn-gastown/.krn/evals/operator-skill-impact/20260619T121112232575Z-644141/report.json)
- Memory condensation: [docs/memory/evals/2026-06-19--operator-skill-impact-first-results.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/evals/2026-06-19--operator-skill-impact-first-results.md)

## Kill Rule

If a skill does not improve a meaningful metric, increases context/routing confusion, or duplicates another skill, merge or remove it. Sexy naming is not evidence.
