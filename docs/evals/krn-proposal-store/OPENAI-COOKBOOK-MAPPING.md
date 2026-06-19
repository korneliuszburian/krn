# OpenAI Cookbook Mapping: KRN Proposal Store

This eval maps the proposal-store boundary to the KRN eval standard rather than treating proposal JSON as proof by itself.

| Case | Source pattern | KRN mechanism | Failure guarded |
|---|---|---|---|
| `source-backed-proposal-store` | Eval cases need source patterns and failure modes; control-plane writes need schema/audit/idempotency. | Store accepts a proposal only when `source_refs` resolve to local files or `docs/plans/canonical/SOURCES.md`. | Source-looking strings become fake evidence. |
| `duplicate-idempotency-key-is-stable` | Repair/eval loops need repeatable artifacts and stop conditions. | Same idempotency key plus identical content returns the existing proposal path. | Future proposal tools duplicate or overwrite review inputs. |
| `unbacked-source-ref-rejected` | Cookbook links must become mechanism/artifact/eval/failure mappings. | A schema-valid but unbacked proposal fails before persistence. | Bibliography rows and arbitrary strings masquerade as paper-backed decisions. |
| `unsafe-target-path-rejected` | Least-power local tooling and approval-before-write boundaries. | Target paths must stay inside the target root even though only `.krn/proposals` is written. | Proposal persistence weakens the future write-tool safety model. |
