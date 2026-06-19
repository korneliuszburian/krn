# OpenAI Cookbook Mapping

This eval follows the KRN eval standard with deterministic local checks.

| Case | Source pattern | KRN mapping |
|---|---|---|
| `valid-fixture-parses` | Goals and ExecPlans require artifact-backed acceptance evidence. | The canonical review report example must parse through the product contract. |
| `known-bad-fixture-fails` | Repair-loop and eval patterns require plausible bad cases. | Review reports missing caveats must fail to avoid overclaiming human approval or control-plane readiness. |
| `generated-review-report-parses` | Agent improvement loops turn runtime traces into eval definitions. | The CLI-generated review report becomes an eval input and must parse through the same contract. |

Green output is proposal-report contract evidence only. It is not productivity, dashboard, MCP, or human-approval proof.
