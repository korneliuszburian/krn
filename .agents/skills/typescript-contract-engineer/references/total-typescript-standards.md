# Total TypeScript Standards For KRN

Use this reference only when implementing or reviewing KRN TypeScript code.

## Source Patterns

- `total-typescript/ts-reset`: make unsafe built-ins safer; `JSON.parse` and `fetch().json()` should be treated as `unknown`, not trusted data.
- Total TypeScript TS Reset docs: safer typings are useful, but global type changes must be deliberate.
- Matt Pocock `tdd`: tests verify behavior through public interfaces, one vertical tracer bullet at a time.
- Matt Pocock `codebase-design`: deep modules expose small interfaces and hide complexity.
- Matt Pocock `to-issues`: vertical slices are complete and independently verifiable.
- Matt Pocock `writing-great-skills`: keep instructions predictable, pruned, and split only when the split earns context load.

## KRN Rules

### Unknown First

Every boundary starts as `unknown`:

- JSON file contents,
- CLI input,
- MCP tool input,
- API request/response bodies,
- model output,
- eval report data,
- dashboard bootstrapped data.

Parse before use. Do not cast first and validate later.

### Runtime Parser

Every exported contract needs a runtime parser. TypeScript types do not validate runtime JSON.

Preferred pattern:

```text
unknown -> parser -> typed object -> serializer/report
```

The parser should be owned by the contract package. CLI, eval, MCP/API, and dashboard code should call it instead of duplicating checks.

### Public Interface Tests

Test through the same interface the caller uses.

Good:

- parse a manifest through the exported parser,
- run the CLI command and inspect the manifest,
- call the eval runner entrypoint and inspect its report.

Bad:

- test private helpers,
- duplicate parser logic in tests,
- assert internal file layout unless layout is the public contract.

### Vertical Slice

Do not build all schemas, then all CLI, then all dashboard. Build one complete path:

```text
contract -> parser -> command/consumer -> behavior test -> known-bad fixture -> docs/eval update
```

### Deep Module

Keep `packages/contracts` deep:

- small exported parse/serialize APIs,
- richer implementation hidden inside,
- no consumer reimplements validation.

Create a seam only when there are at least two real adapters or a testable variation that needs it.

### Typecheck Gate

Before claiming done, run:

```bash
pnpm typecheck
```

Then run the narrow test command for the touched package. Run broad tests only after the narrow loop is green.

### TS Reset Policy

Use `@total-typescript/ts-reset` in app/test entrypoints where global type changes are local to KRN.

Do not add it to a published package boundary unless an ADR explains why consumers should inherit those global type changes.

### Any Policy

Unchecked `any` is not allowed at product boundaries.

Acceptable exceptions must be:

- isolated,
- named,
- justified by a source or dependency limitation,
- followed immediately by parsing or narrowing.

## Failure Modes

- Type cleverness replaces runtime validation.
- A package exposes many shallow helpers instead of one deep parser interface.
- Tests lock implementation details and fail on harmless refactors.
- `ts-reset` leaks into consumer-facing package globals by accident.
- KRN starts dashboard/API work before the dry-run contract validates.
