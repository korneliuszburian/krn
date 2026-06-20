# OpenAI Cookbook Mapping: KRN MCP Proposal Tool

This eval maps the MCP proposal-tool boundary to the KRN eval standard. The case logic tests the actual STDIO MCP transport rather than direct helper calls.

| Case | Source pattern | KRN mechanism | Failure guarded |
|---|---|---|---|
| `proposal-tool-listed-with-read-resources` | Goals and ExecPlans require explicit boundaries and verification surfaces; MCP tools need allowlisted exposure. | Server exposes the six read-only resources plus exactly one proposal-only tool. | Tool surface grows silently or breaks read resources. |
| `source-backed-proposal-tool-stores` | MCP/API writes need schemas, audit, idempotency, and approvals; evals must test behavior, not claims. | Tool input parses as proposal and stores only under `.krn/proposals`. | Proposal tool mutates targets or implies approval. |
| `duplicate-idempotency-through-tool-stable` | Repair/eval loops need repeatable artifacts and stop conditions. | Duplicate tool call returns the same proposal path with `already_stored`. | Future agents duplicate review records. |
| `unbacked-source-ref-tool-error` | Cookbook links must become mechanism/artifact/eval/failure mappings. | Source-looking refs absent from files/SOURCES.md fail at tool call time. | Unsourced proposal records enter the review queue. |
| `unsafe-target-path-tool-error` | Least-power local tooling and approval-before-write boundaries. | Unsafe target paths fail through the MCP tool before any proposal is persisted. | MCP tool weakens path safety before approval surfaces exist. |
