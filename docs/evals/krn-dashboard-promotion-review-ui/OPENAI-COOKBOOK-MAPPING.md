# OpenAI Cookbook Mapping

| Case | Source pattern | Mechanism tested | Failure mode guarded |
|---|---|---|---|
| `dashboard-data-generation-includes-promotion-review` | Goals/ExecPlans require evidence surfaces and current-state verification. | Dashboard data command emits a parsed envelope with Promotion Review from real promotion-store records. | Dashboard data omits promotion state, uses mocks, or mutates target files. |
| `promotion-row-renders-audit-evidence` | Dashboard/control-plane surfaces should expose source, action, owner, and failure mode. | Promotion rows render id, source refs, next action, and failure mode without apply/write commands. | UI implies promotion command readiness or hides audit evidence. |
| `empty-promotion-store-renders-explicit-zero` | Eval cases should reject invented state and preserve explicit zero states. | Empty promotion store renders as empty rather than fabricated review work. | Dashboard invents promotion rows from chat or fixtures. |
| `invalid-promotion-record-renders-blocked` | Repair loops require invalid artifacts to become visible repair targets. | Invalid promotion files block readiness and show their path. | Dashboard hides invalid promotion records. |
| `target-drift-renders-blocked` | Code modernization validation/parity requires comparing outputs before scaling writes. | Promotion target file content is compared to exact payload state before any command readiness claim. | Target drift is presented as safe promotion state. |
