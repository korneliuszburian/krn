# ChatGPT Reviewer / Codex Bridge Research

Status: inference

Access date: 2026-06-19.

## Question

Can ChatGPT become the real reviewer/analyzer layer for KRN, with project knowledge or a custom GPT, and later with a bridge/tunnel/gateway to Codex CLI?

## Short Answer

[DECISION] Yes, but in two different phases:

1. Static reviewer: ChatGPT Project or custom GPT with uploaded KRN files and a strict second-opinion prompt.
2. Live reviewer: ChatGPT custom app / MCP connector over HTTPS, backed by a KRN gateway. The gateway can call Codex through controlled local mechanisms such as `codex mcp-server`, the Codex SDK/app-server, or a narrow CLI worker.

[DECISION] Do not model this as ChatGPT directly connecting to local Codex stdio. ChatGPT needs a reachable app/connector endpoint. Local or private MCP needs Secure MCP Tunnel or an equivalent public/private tunnel.

## Official Source Observations

- ChatGPT Projects support grouped chats, reference files, and project-specific instructions for long-running work: https://help.openai.com/en/articles/10169521-projects-in-chatgpt
- Custom GPTs support instructions, uploaded knowledge, capabilities, apps, and actions; uploaded knowledge is reference material, while actions connect to external APIs: https://help.openai.com/en/articles/8554397-creating-and-editing-gpts
- Custom GPT actions call external APIs defined by the builder, but a GPT can use either apps or actions, not both: https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts
- ChatGPT developer mode supports MCP-powered apps/connectors, but full MCP/write support is plan/workspace controlled and still evolving: https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt
- Apps SDK connection requires the MCP server to be reachable over HTTPS; local development should use Secure MCP Tunnel, ngrok, or Cloudflare Tunnel: https://developers.openai.com/apps-sdk/deploy/connect-chatgpt
- Apps SDK testing guidance requires handler tests, MCP Inspector, developer-mode validation, golden prompts, and regression checklists: https://developers.openai.com/apps-sdk/deploy/testing
- Codex can run as an MCP server over stdio for other tools: https://developers.openai.com/codex/cli/reference
- OpenAI's Codex with Agents SDK guide shows `codex mcp-server` exposing `codex()` and `codex-reply()` to a controlling workflow: https://developers.openai.com/codex/guides/agents-sdk

## Architecture

### Phase 1: Static reviewer

```text
ChatGPT Project/custom GPT
  -> project instructions
  -> uploaded KRN docs
  -> second-opinion prompt
  -> reviewer report
  -> human copies conclusions back into KRN memory/decision docs
```

Use this first because it has the smallest blast radius.

Good first sources:

- `AGENTS.md`
- `docs/memory/INDEX.md`
- `docs/goals/goal-001.md`
- `docs/plans/canonical/draft.md`
- `docs/plans/canonical/pattern-matrix.md`
- `docs/plans/canonical/SOURCES.md`
- targeted memory notes

### Phase 2: Read-only MCP reviewer

```text
ChatGPT App / custom MCP connector
  -> HTTPS /mcp endpoint
  -> KRN gateway
  -> read-only tools:
       get_project_profile
       list_sources
       list_claims
       list_memory_entries
       list_eval_results
       get_latest_compact_state
       get_diff_summary
  -> reviewer report
```

This should not write to KRN state. It should prove tool discovery, schemas, auth, and reviewer usefulness.

### Phase 3: Proposal-only write tools

```text
ChatGPT App
  -> KRN gateway
  -> append-only proposal tools:
       propose_memory_entry
       propose_source_update
       propose_eval_fixture
       propose_goal_slice
       propose_dashboard_event
  -> dashboard pending review
  -> human approval
```

No direct approval by the model.

### Phase 4: Codex-controlled execution bridge

```text
ChatGPT App
  -> KRN gateway
  -> explicit human-approved job
  -> Codex SDK/app-server or codex mcp-server/worker
  -> isolated worktree/sandbox
  -> trace/eval/diff artifacts
  -> dashboard review
```

This is later. It should inherit Sandcastle-like isolation, one-iteration resume discipline, and structured output.

## KRN Implication

ChatGPT is best used as an external reviewer/analyzer first, not as a second autonomous implementer.

Initial value:

- critique the operator pipeline,
- find drift between `AGENTS.md`, memory notes, source ledger, and canonical plan,
- verify whether source claims are supported,
- propose missing evals,
- test if the product explanation is clear without hidden repo context.

Later value:

- inspect KRN state through read-only MCP,
- create proposal records,
- trigger reviewed Codex jobs through a gateway.

## Failure Mode

This fails if:

- ChatGPT is given stale project files and treated as current truth,
- the connector exposes write tools before read-only review is useful,
- the gateway allows arbitrary shell/Codex execution,
- uploaded knowledge is confused with behavior rules,
- custom GPT actions are used when MCP/app tooling would give better tool semantics,
- ChatGPT reviewer reports are copied into memory without source labels or human review.

## Review Trigger

Update after:

- first ChatGPT Project review using `docs/reviews/second-opinion-current-setup.md`,
- first MCP Inspector test of a KRN read-only gateway,
- first ChatGPT developer-mode connector test,
- any OpenAI change to ChatGPT apps/actions/developer-mode availability.
