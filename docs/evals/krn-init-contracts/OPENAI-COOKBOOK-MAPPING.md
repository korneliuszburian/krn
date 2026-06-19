# OpenAI Cookbook Mapping

This eval follows the KRN eval standard rather than calling a model judge.

| Case | Source pattern | KRN mapping |
|---|---|---|
| `valid-fixture-parses` | Goals and ExecPlans require acceptance evidence tied to artifacts. | The canonical dry-run manifest example must parse through the product contract. |
| `known-bad-fixture-fails` | Repair-loop and eval patterns require plausible bad cases. | Forbidden write-mode manifests must fail deterministically. |
| `generated-dry-run-manifest-parses` | Agent improvement loops turn runtime traces into eval definitions. | The CLI-generated manifest becomes an eval input and must parse through the same contract. |

Green output is contract evidence only. It is not productivity or quality proof.
