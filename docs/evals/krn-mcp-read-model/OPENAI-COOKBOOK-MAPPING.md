# OpenAI Cookbook Mapping

This eval follows the KRN eval standard with deterministic local checks and the current Codex MCP guidance.

| Case | Source pattern | KRN mapping |
|---|---|---|
| `valid-fixtures-parse` | MCP/API surfaces need explicit schema-backed resources. | Canonical read-model examples must parse before a server transport can expose them. |
| `known-bad-fixture-fails` | Least-power surfaces must prove read-only boundaries. | A resource missing `read_only: true` must fail before it can be treated as a control-plane object. |
| `generated-read-model-parses` | Agent improvement loops turn local runtime artifacts into reviewable evidence. | The read model must expose current `.krn` reports through allowlisted resources without write tools. |

Green output is read-model contract evidence only. It is not productivity, dashboard, deployed MCP transport, or write-tool safety proof.
