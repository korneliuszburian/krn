# KRN Research Pack Runtime Scaffold

Status: decision

Sources:

- `docs/goals/goal-006.md`
- `docs/goals/goal-035.md`
- `docs/goals/goal-036.md`
- `.agents/skills/long-researcher/SKILL.md`
- `docs/source-bank/MANIFEST.md`
- `docs/specs/krn-research-pack/README.md`
- `docs/evals/krn-research-pack/README.md`

## Observation

The `long-researcher` skill is useful only if its output becomes a bounded, reviewable artifact. Otherwise deep research can still collapse into chat prose, shallow link lists, or hidden source assumptions after compaction.

## Useful Pattern

Use a typed research-pack scaffold before running or promoting deep research:

```text
question + KRN decision + source budget
  -> scaffolded KrnResearchPack under .krn/research-packs/
  -> long-researcher fills sources, mechanisms, contradictions, rejected alternatives
  -> parser rejects shallow ready-for-review claims
  -> review promotes only selected pattern-bank, retrieval-rule, ADR, skill, eval, or contract changes
```

`scaffolded` means the destination artifact exists, not that research is complete.

## KRN Implication

KRN now has the first product-shaped bridge between source-bank methodology and future researcher workers. It is not a memory layer by itself.

- `KrnResearchPack` is the durable object shape.
- `krn research-pack` creates the bounded target artifact.
- `krn-research-pack` eval prevents shallow ready packs from passing.
- Future long-running researcher work should fill this pack instead of writing free-form chat or docs first.
- A filled pack still needs a later retrieval/application path before it can count as operational memory.

## Failure Mode

This becomes harmful if:

- scaffolded packs are treated as completed research,
- ready packs are accepted without meeting the source budget,
- future workers bypass the parser and write memory directly,
- source lists replace mechanism extraction,
- research packs become another passive file pile with no retrieval/application proof,
- dashboard/API surfaces render research state before the object is proven useful.

## Review Trigger

Update when a real long-running researcher worker fills a pack, when pack fields are too weak for review, or when dashboard/MCP consumers need research-pack read models.
