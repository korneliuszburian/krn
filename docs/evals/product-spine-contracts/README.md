---
id: product-spine-contracts
kind: eval-module
status: active
owner: krn
updated: 2026-06-19
runner: scripts/specs/validate_product_spine.py
---

# Product Spine Contracts Eval

## Purpose

This module validates that the first Gas Town product-spine contracts are concrete enough for future `krn init`, read-only API/MCP, runtime skills, and dashboard work.

It answers:

> Do the object contracts represent real current artifacts, validate examples, reject a known-bad fixture, and avoid dashboard/API/runtime implementation drift?

## What This Tests

- JSON schema files are valid JSON and use the supported contract shape.
- Each product-spine object has a real example.
- Examples validate against their object schemas.
- Known-bad fixtures fail.
- Source references in examples point to current repo files.
- Objects do not contain secret-like or raw-data markers.

The case definitions live in [cases.json](./cases.json), and the runtime report shape is documented in [result.schema.json](./result.schema.json).

## Commands

```bash
python3 scripts/specs/validate_product_spine.py --mode validate
```

## Result Policy

Runtime reports are written under:

```text
.krn/specs/product-spine/{run_id}/report.json
```

Do not commit runtime reports. Promote reviewed lessons into `docs/memory`.

## Known-Bad Fixture

`docs/specs/product-spine/fixtures/bad-eval-run.example.json` intentionally omits the `interpretation_caveat` required by `EvalRun`.

The fixture must fail. If it passes, the validator no longer protects against eval reports being interpreted as broad product proof.
