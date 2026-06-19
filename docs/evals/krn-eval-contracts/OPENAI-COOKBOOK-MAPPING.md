# OpenAI Cookbook Mapping

`krn-eval-contracts` maps the local Slice 2 `krn eval` runtime path to the KRN eval standard:

| Case | Source pattern | Mechanism |
|---|---|---|
| `valid-fixture-parses` | `docs/evals/STANDARD.md` plus source-backed contract fixtures | Machine-readable eval artifacts must parse before downstream use. |
| `known-bad-fixture-fails` | Repair-loop anti-overclaim rule | Reports without interpretation caveats must fail before they become evidence. |
| `generated-krn-eval-report-parses` | Eval flywheel and local/CI gate pattern | The CLI must emit a schema-backed runtime report, not only human prose. |
