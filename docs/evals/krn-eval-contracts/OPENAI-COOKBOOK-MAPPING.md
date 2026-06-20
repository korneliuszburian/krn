# OpenAI Cookbook Mapping

`krn-eval-contracts` maps the lane-aware `krn eval` runtime path to the KRN eval standard:

| Case | Source pattern | Mechanism |
|---|---|---|
| `valid-fixture-parses` | `docs/evals/STANDARD.md` plus source-backed contract fixtures | Machine-readable eval artifacts must parse before downstream use and keep default `core,current` verification separate from explicit `lab` history. |
| `known-bad-fixture-fails` | Repair-loop anti-overclaim rule | Reports without interpretation caveats must fail before they become evidence. |
| `known-bad-excluded-lane-fails` | Eval-lane anti-sediment rule | A report cannot include lab modules when lane metadata says lab is excluded. |
| `generated-krn-eval-report-parses` | Eval flywheel and local/CI gate pattern | The CLI must emit a schema-backed runtime report, not only human prose. |
| `custom-module-report-parses` | Focused explicit verification | A lab module can run through `--module` only as a custom explicit report, not through default eval routing. |
