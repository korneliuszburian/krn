# OpenAI Cookbook Mapping

## Source Patterns

- `S007` / Codex MCP manual: local STDIO MCP servers are a supported Codex integration surface, with tool policy controlled by explicit server capability and configuration.
- `S014` / Promptfoo migration: local deterministic evals should live near code and emit comparable machine-readable results.
- `S015` / Agent improvement loop: real failures should become eval cases before expanding behavior.

## KRN Mapping

- `stdio-server-lists-allowlisted-resources` checks the first real transport boundary without enabling tools.
- `stdio-server-reads-schema-backed-resources` checks that transport responses preserve typed resource contracts and caveats.
- `stdio-server-rejects-unknown-uri` checks the allowlist failure mode before any proposal/write tools exist.

## Non-Claim

This mapping does not prove ChatGPT connector behavior, dashboard readiness, write-tool safety, human approval, or productivity lift.
