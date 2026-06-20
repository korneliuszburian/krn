# OpenAI Cookbook Mapping

| Case | Source pattern | Mechanism tested | Failure mode guarded |
|---|---|---|---|
| `promotion-contract-valid-and-known-bad` | Goals/ExecPlans require explicit boundaries and evidence; evals should reject plausible bad artifacts. | Promotion contract distinguishes plan-only from apply-mode mutation claims. | Approval-looking records bypass contract semantics. |
| `record-only-promotion-store` | MCP/API writes need schemas, audit, idempotency, and least-power defaults. | Promotion persists under `.krn/promotions` without target mutation by default. | Promotion approval mutates target files implicitly. |
| `apply-exact-memory-promotion` | Code modernization patterns require validation/parity before scaling broad changes. | Explicit apply writes exact payload content after approved review only. | KRN infers file content from prose or skips approval validation. |
| `rejected-decision-promotion-rejected` | Review/repair loops need clear terminal states. | Rejected decisions cannot enter promotion workflow. | Rejected proposal state is ignored by write workflow. |
| `missing-payload-promotion-rejected` | Typed contracts should parse unknown inputs before use. | Promotion requires machine-applicable payload rather than prose. | Prose descriptions become unreviewable target writes. |
| `duplicate-promotion-idempotent` | Repair/eval loops need repeatable artifacts and stop conditions. | Duplicate promotion input returns existing record. | Promotion duplicates records and confuses audit history. |
| `unsafe-target-path-rejected` | Least-power local tooling and approval-before-write boundaries. | Unsafe target paths fail before promotion persistence or writes. | Review approval weakens path safety. |
