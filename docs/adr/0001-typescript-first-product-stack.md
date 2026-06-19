# ADR 0001: TypeScript-First Product Stack

## Status

Proposed on 2026-06-19.

## Context

`goal-005` originally drifted toward a Python implementation because this repo already has Python validators and no app stack. The user stopped that direction and asked for an explicit technology-stack decision before implementation.

KRN's product surfaces are typed contracts and object consumers:

- CLI manifests,
- runtime parsers,
- eval reports,
- MCP/API resources,
- dashboard view models,
- operator/runtime skill contracts.

The strongest inspected Matt Pocock / Total TypeScript patterns emphasize strict TypeScript, unknown-first boundaries, public-interface tests, vertical slices, deep modules, and skill discipline.

## Decision

Use TypeScript-first product implementation, with Node.js as the initial runtime and packaging lane.

Do not add new Python product code for `goal-005`.

Existing Python validators remain local proof artifacts until replaced or migrated.

## Consequences

- `krn init --dry-run` should be implemented as a TypeScript contract/CLI/eval vertical slice.
- Runtime JSON must be parsed from `unknown` before use.
- Typecheck is a required completion gate for TypeScript implementation.
- Dashboard/API/MCP remain blocked until the dry-run contract validates.
- Go/Rust can be revisited only if measured runtime or packaging needs justify them.

## Rejected Alternatives

- Python-first product stack: fast for scripts, weak long-term cohesion across CLI/API/dashboard/evals.
- Go/Rust-first CLI: stronger binaries, too heavy before KRN's object model stabilizes.
- Mixed Python CLI plus TypeScript dashboard now: two foundations before one object consumer is proven.

## References

- [docs/specs/technology-stack/decision.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/technology-stack/decision.md)
- [docs/memory/product/2026-06-19--technology-stack-decision.md](/home/krn/coding/krn/active/krn-gastown/docs/memory/product/2026-06-19--technology-stack-decision.md)
- `mattpocock/skills`
- `mattpocock/sandcastle`
- `mattpocock/evalite`
- `total-typescript/ts-reset`
