# OpenAI Cookbook Mapping

## Source Patterns

- `S010` / Goals in Codex: the slice has a bounded outcome, verification surface, constraints, and overclaim boundary.
- `S011` / ExecPlans: the child goal is restartable and evidence-driven.
- `S014` / Promptfoo migration: deterministic local evals live near code and produce comparable machine-readable results.
- `S015` / Agent improvement loop: review/control-plane failures become eval cases before adding more UI behavior.
- `S016` / Macro evals: the view-model eval checks route/tool/data readiness, not only final text output.

## KRN Mapping

- `proposal-store-records-render-pending-review` checks the real proposal-store to dashboard input path.
- `empty-proposal-store-explicit-zero` prevents invented dashboard state.
- `invalid-proposal-record-blocks-readiness` checks invalid artifact handling before UI.
- `stale-source-ref-blocks-readiness` preserves source-grounding inside Pending Review.

## Non-Claim

This mapping does not prove dashboard UI readiness, approval workflow quality, HTTP/API readiness, ChatGPT connector behavior, or productivity lift.
