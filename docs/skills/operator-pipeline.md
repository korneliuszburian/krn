---
id: operator-skill-pipeline
kind: standard
status: active
owner: krn
updated: 2026-06-19
sources:
  - docs/goals/goal-002.md
  - docs/goals/goal-003.md
  - docs/goals/goal-006.md
  - docs/memory/github-research/2026-06-19--mattpocock-skills-operator-pipeline.md
  - docs/memory/evals/2026-06-19--operator-skill-impact-loop.md
---

# Operator Skill Pipeline

## Purpose

P1 operator skills are build-time tools for creating KRN. They are not runtime/product skills and not dashboard features.

They exist to make Codex work more predictable, source-grounded, phase-disciplined, and measurable.

## Active Skills

| Skill | Solves | Current gate |
|---|---|---|
| `operator-intake` | Broad task routing and current-truth selection. | Static + impact `keep_observe`. |
| `research-synthesis` | Source links becoming mechanisms, evals, and failure modes. | Static + impact `keep`. |
| `goal-execplan` | Broad objectives becoming verifiable long-running goals. | Static + impact `keep_observe`. |
| `eval-designer` | Eval modules becoming deterministic and source-backed. | Static + impact `keep_observe`. |
| `repair-handoff` | Eval failures becoming bounded repairs instead of prompt churn. | Static + impact `keep_observe`. |
| `typescript-contract-engineer` | TypeScript product slices preserving typed contracts, parsers, behavior tests, and stack boundaries. | Static only; impact eval required before claims. |
| `domain-grill-interviewer` | Product language, assumptions, acceptance standards, and sharp tradeoffs before implementation. | Static only; impact eval required before claims. |
| `product-requirements-writer` | Final-product slice intent becoming compact requirements with success criteria and non-goals. | Static only; impact eval required before claims. |
| `adr-writer` | Hard-to-reverse product or architecture decisions becoming concise ADRs. | Static only; impact eval required before claims. |
| `issue-slice-writer` | Final-product goals becoming dependency-ordered implementation slices. | Static only; impact eval required before claims. |
| `release-verifier` | Completion claims being checked against acceptance evidence and residual risk. | Static only; impact eval required before claims. |

## Matt Pocock Mechanisms Already Adopted

- Router/intake over a larger pipeline.
- Small focused skills instead of one giant prompt.
- Phase boundaries and when-not-to-use sections.
- Handoff/repair thinking instead of endless compaction.
- Source/domain language discipline through memory and canonical docs.
- Static skill-quality eval before trusting the skills.
- TypeScript contract skill added only after a stack decision, not as a generic TS prompt pack.
- Slice 1 planning skills added as normalized operator workflows, not broad prompt packs.

## Missing Matt Pocock Mechanisms

These are intentionally not all implemented yet:

| Missing mechanism | Why missing now | When to add |
|---|---|---|
| Domain glossary / ADR workflow | Adopted for stack phase through `CONTEXT.md` and ADR 0001. | Expand only when implementation introduces new persistent terms or hard-to-reverse tradeoffs. |
| Prototype-as-question | No product UI/API question is ready for prototype yet. | Before dashboard/API architecture experiments. |
| TDD vertical loop | No product code exists yet. | First implementation slice. |
| Diagnosing-bugs tight loop | No product runtime bug exists yet. | First failing runtime/eval bug. |
| Deep module / design-it-twice | Needs real module seams. | After code exists and architecture friction is observable. |
| TypeScript skill impact eval | New stack-specific skill has only static coverage. | Add after first TypeScript implementation fixture exists. |

## Evaluation Policy

Every operator skill has two gates:

1. Static contract gate:
   - valid Codex skill structure,
   - official repo-local path `.agents/skills`,
   - trigger description,
   - input/output,
   - phase boundary,
   - when-not-to-use,
   - eval case.
2. Impact gate:
   - baseline Codex vs skill-assisted Codex,
   - same task fixture,
   - metric comparison,
   - keep/refine/merge/remove decision.

Do not claim the skills improve productivity from one live batch. The first impact gate only proves that the module can measure deltas, that `research-synthesis` improved one fixture, and that the other P1 skills did not regress on first pass.

## Commands

```bash
python3 scripts/evals/operator_skill_contracts.py --mode validate
python3 scripts/evals/codex_memory_compliance.py --mode validate
python3 scripts/evals/operator_skill_impact.py --mode validate
python3 scripts/evals/operator_skill_impact.py --mode live --variant required
```

Use full live impact batches for skill decisions, not as a cheap preflight.
