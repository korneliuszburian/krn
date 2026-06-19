# ChatGPT Reviewer Bridge

Status: inference, deferred

Sources:

- ChatGPT Projects help, accessed 2026-06-19: https://help.openai.com/en/articles/10169521-projects-in-chatgpt
- Creating and editing GPTs, accessed 2026-06-19: https://help.openai.com/en/articles/8554397-creating-and-editing-gpts
- Configuring actions in GPTs, accessed 2026-06-19: https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts
- Developer mode and MCP apps in ChatGPT, accessed 2026-06-19: https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt
- Apps SDK connect from ChatGPT, accessed 2026-06-19: https://developers.openai.com/apps-sdk/deploy/connect-chatgpt
- Apps SDK testing guide, accessed 2026-06-19: https://developers.openai.com/apps-sdk/deploy/testing
- Codex CLI reference, accessed 2026-06-19: https://developers.openai.com/codex/cli/reference
- Codex with Agents SDK, accessed 2026-06-19: https://developers.openai.com/codex/guides/agents-sdk

## Observation

ChatGPT can be a reviewer/analyzer layer in two ways:

1. static context: Project/custom GPT with uploaded KRN docs and strict instructions,
2. live tool context: ChatGPT custom app/MCP connector over HTTPS to a KRN gateway.

The local Codex CLI side is a separate concern. Codex can run as an MCP server over stdio for other tools, but ChatGPT connectors require a reachable HTTPS MCP endpoint. Therefore the architecture needs a gateway or tunnel; it should not be described as direct ChatGPT-to-local-stdio.

## Useful Pattern

Use a staged bridge:

```text
Static Project review
  -> read-only MCP gateway
  -> proposal-only writes
  -> human-approved Codex execution jobs
```

Start read-only:

- project profile,
- source index,
- claim ledger,
- memory entries,
- eval results,
- compact state,
- diff summaries.

Only later add proposal tools:

- propose memory entry,
- propose source update,
- propose eval fixture,
- propose goal slice.

## KRN Implication

As of 2026-06-20, the ChatGPT reviewer bridge is not the current product core. The local Codex/KRN loop, source-backed proposal store, dashboard over real objects, and baseline-vs-assisted benchmark evidence come first.

If this bridge is resumed later, the first ChatGPT integration should not execute code. It should critique KRN's operating layer and catch drift.

The first live MCP version should expose reviewable state, not mutate state. Write tools should only create pending proposals visible in the dashboard.

If Codex execution is added later, it should run through:

- explicit human approval,
- isolated worktree/sandbox,
- structured output,
- trace/eval/diff artifacts,
- dashboard review.

## Failure Mode

This becomes unsafe or noisy if:

- uploaded project knowledge is stale,
- ChatGPT is trusted as current repo truth without reading ledgers,
- write tools bypass human review,
- gateway can run arbitrary shell commands,
- tool schemas are vague,
- connector availability/permissions are assumed instead of tested,
- static reviewer conclusions are copied into `docs/memory` as facts.

## Review Trigger

Update after:

- first ChatGPT Project second-opinion run,
- first KRN read-only MCP gateway design,
- first MCP Inspector test,
- first ChatGPT developer-mode connector test.
