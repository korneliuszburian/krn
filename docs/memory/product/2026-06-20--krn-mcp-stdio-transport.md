# KRN MCP STDIO transport

Status: fact

Sources:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-008.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-008.md)
- [docs/specs/krn-mcp-read-model/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-mcp-read-model/README.md)
- [docs/evals/krn-mcp-transport/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-mcp-transport/README.md)
- [docs/evals/krn-mcp-proposal-tool/README.md](/home/krn/coding/krn/active/krn-gastown/docs/evals/krn-mcp-proposal-tool/README.md)
- [packages/mcp/src/server.ts](/home/krn/coding/krn/active/krn-gastown/packages/mcp/src/server.ts)
- [packages/mcp/src/stdio.ts](/home/krn/coding/krn/active/krn-gastown/packages/mcp/src/stdio.ts)
- [packages/evals/src/validate-krn-mcp-transport.ts](/home/krn/coding/krn/active/krn-gastown/packages/evals/src/validate-krn-mcp-transport.ts)
- Official Codex MCP manual fetched 2026-06-20: `/tmp/openai-docs-cache/codex-manual.md`
- Model Context Protocol TypeScript SDK README checked 2026-06-20: https://github.com/modelcontextprotocol/typescript-sdk
- Local transport evidence: `.krn/evals/krn-mcp-transport/20260620T000555Z-1943987/report.json`
- Local proposal-tool evidence: `.krn/evals/krn-mcp-proposal-tool/20260620T000445Z-1940364/report.json`
- Local aggregate evidence: `.krn/eval/20260620T000445Z-1940365/report.json`

## Observation

`packages/mcp` now has a local STDIO MCP server over the existing read-only resource model. The server is built with `@modelcontextprotocol/sdk@1.29.0`, registers the five allowlisted runtime resource URIs, and advertises exactly one separate proposal-only MCP tool: `krn_store_control_plane_proposal`.

The allowlisted resource URIs remain:

- `krn://runtime/summary`
- `krn://runtime/init/latest`
- `krn://runtime/doctor/latest`
- `krn://runtime/eval/latest`
- `krn://runtime/review/latest`

Current narrow evidence:

```bash
pnpm typecheck
pnpm test -- packages/mcp/test/read-model.test.ts packages/mcp/test/stdio-server.test.ts packages/contracts/test/control-plane-resource.test.ts
pnpm run eval:krn-mcp-transport
pnpm run eval:krn-mcp-proposal-tool
pnpm run krn -- eval
```

The transport eval passed 3/3 cases and 7/7 assertions. The proposal-tool eval passed 5/5 cases and 16/16 assertions. The aggregate `krn eval` run passed 7/7 modules, 24/24 cases, and 62/62 assertions.

## Useful Pattern

Keep the MCP transport as a thin shell over the typed read model:

```text
MCP SDK STDIO -> packages/mcp read model -> @krn/contracts parsers -> .krn runtime reports
```

The transport should not parse runtime reports independently, invent state, or gain tools before a separate proposal-only contract and eval exist.

## KRN Implication

Slice 3 now has a real local MCP transport boundary for read-only resources and one proposal-only tool that writes append-only review input through the source-backed proposal store. The next safe step is a dashboard Pending Review surface over stored proposal records or benchmark/control-plane evidence, not destructive tools.

This does not prove ChatGPT connector behavior, HTTP deployment, registered Codex config, human approval, dashboard readiness, target mutation safety beyond `.krn/proposals`, or productivity lift.

## Failure Mode

This becomes harmful if a green local STDIO eval is treated as a deployed connector, human approval workflow, or permission to expose destructive tools. Any future MCP tool must be append-only, idempotent, schema-backed, and covered by known-bad fixtures before registration.

## Review Trigger

Update this note when `packages/mcp` gains any MCP tools, HTTP transport, `.codex/config.toml` registration guidance, ChatGPT connector support, dashboard consumption, or changed resource URIs.
