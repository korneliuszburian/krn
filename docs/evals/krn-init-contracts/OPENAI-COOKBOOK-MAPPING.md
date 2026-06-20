# OpenAI Cookbook Mapping

This eval follows the KRN eval standard rather than calling a model judge.

| Case | Source pattern | KRN mapping |
|---|---|---|
| `valid-fixture-parses` | Goals and ExecPlans require acceptance evidence tied to artifacts. | The canonical dry-run manifest example must parse through the product contract and include all bootstrap capabilities. |
| `known-bad-fixture-fails` | Repair-loop and eval patterns require plausible bad cases. | Forbidden write-mode manifests must fail deterministically. |
| `known-bad-missing-bootstrap-capability-fails` | Source-grounded planning needs explicit source/context/eval routing, not implied research intent. | A manifest without source pointer capability must fail before it can be treated as final-shaped bootstrap evidence. |
| `generated-dry-run-manifest-parses` | Agent improvement loops turn runtime traces into eval definitions. | The CLI-generated manifest becomes an eval input and must parse through the same contract. |

Green output is contract evidence only. It is not productivity, research automation, memory-core quality, or write-mode proof.
