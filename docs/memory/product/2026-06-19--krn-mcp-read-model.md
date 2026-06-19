# KRN MCP read model

Status: fact

Sources:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/specs/krn-mcp-read-model/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-mcp-read-model/README.md)
- [docs/evals/krn-mcp-read-model/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-mcp-read-model/README.md)
- [packages/contracts/src/control-plane-resource.ts](/home/krn/coding/krn/active/krn-gastown/packages/contracts/src/control-plane-resource.ts)
- [packages/mcp/src/index.ts](/home/krn/coding/krn/active/krn-gastown/packages/mcp/src/index.ts)
- [packages/evals/src/validate-krn-mcp.ts](/home/krn/coding/krn/active/krn-gastown/packages/evals/src/validate-krn-mcp.ts)
- Official Codex MCP manual fetched 2026-06-19: `/tmp/openai-docs-cache/codex-manual.md`
- Local runtime evidence: `.krn/evals/krn-mcp-read-model/20260619T222105Z-1727785/report.json`
- Local aggregate evidence: `.krn/eval/20260619T222100Z-1727537/report.json`

## Observation

`packages/mcp` now exists as the first Slice 3 read-only control-plane package.

It exposes this typed public interface:

```ts
listKrnControlPlaneResources(targetRoot)
readKrnControlPlaneResource(uri, targetRoot)
```

The allowlisted resource URIs are:

- `krn://runtime/summary`
- `krn://runtime/init/latest`
- `krn://runtime/doctor/latest`
- `krn://runtime/eval/latest`
- `krn://runtime/review/latest`

Each runtime payload is parsed through the existing `@krn/contracts` parser before exposure. The read-model index reports `write_tools_enabled: false` and `proposal_tools_enabled: false`.

Current narrow evidence:

```bash
pnpm typecheck
pnpm test -- packages/contracts/test/control-plane-resource.test.ts packages/mcp/test/read-model.test.ts
pnpm run eval:krn-mcp
pnpm run krn -- eval
```

The latest `krn-mcp-read-model` eval report passed 3/3 cases and 7/7 assertions. The latest aggregate `krn eval` report passed 4/4 modules, 12/12 cases, and 30/30 assertions.

## Useful Pattern

Start the control plane as read-only resources over typed runtime reports:

```text
.krn runtime reports -> existing report parsers -> control-plane resource parser -> allowlisted read model
```

This keeps MCP/API/dashboard consumers from inventing state or bypassing the runtime contracts.

## KRN Implication

Slice 3 has started with a read-only resource contract over local runtime evidence.

The next control-plane step should wire this resource model to a real MCP/API transport or add proposal-only tool contracts. It must still avoid destructive tools, memory/source mutation, and mocked dashboard state.

This does not prove a deployed MCP server, ChatGPT connector behavior, dashboard readiness, write-tool safety, human approval, or productivity lift.

## Failure Mode

This becomes harmful if a package-level read model is treated as a live Codex MCP integration. The current artifact proves the resource contract and parser behavior only, not transport, auth, tool approval, or connector deployment.

## Review Trigger

Update this note when `packages/mcp` gains a STDIO/HTTP MCP server transport, when proposal-only tools are added, when dashboard view models consume these resources, or when resource URIs change.
