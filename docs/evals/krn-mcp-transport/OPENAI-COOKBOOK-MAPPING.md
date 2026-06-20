# OpenAI Cookbook Mapping

## Source Patterns

- `S007` / Codex MCP manual: local STDIO MCP servers are a supported Codex integration surface, with tool policy controlled by explicit server capability and configuration.
- `S014` / Promptfoo migration: local deterministic evals should live near code and emit comparable machine-readable results.
- `S015` / Agent improvement loop: real failures should become eval cases before expanding behavior.

## KRN Mapping

- `stdio-server-lists-allowlisted-resources` checks the first real transport boundary and verifies that the separate proposal-only tool is the only advertised tool.
- `stdio-server-reads-schema-backed-resources` checks that transport responses preserve typed resource contracts and caveats.
- `stdio-server-rejects-unknown-uri` checks the resource allowlist failure mode separately from proposal-tool behavior.

## Non-Claim

This mapping does not prove ChatGPT connector behavior, dashboard readiness, proposal-tool behavior, human approval, or productivity lift.
