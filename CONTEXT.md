# KRN Context

This file defines KRN domain language. It is a glossary, not a spec, roadmap, or implementation plan.

## Language

**KRN**:
The product and tool name for the Codex-native operating memory, eval, and control-plane system. The CLI is `krn`.
_Avoid_: Gas Town as the public tool name

**Gas Town**:
The repo/codename for building KRN. It intentionally references Steve Yegge's AI-agent orchestration "Gas Town" discourse, which itself started with loose Mad Max theming. Use it for this workspace's identity, not as the default product/tool name.
_Avoid_: public product name, second product identity

**Product spine**:
The machine-readable object contract layer that normalizes memory, source, eval, proposal, decision, compact, and project-profile artifacts.
_Avoid_: database, API, dashboard state

**Bootstrap workflow**:
The first product path that prepares a target project for KRN. The first bootstrap workflow is `krn init --dry-run`.
_Avoid_: installer, migration, global setup

**Dry-run manifest**:
A machine-readable report of what KRN would create, modify, skip, or propose without mutating the target project.
_Avoid_: generated docs, write plan

**Memory entry**:
A reviewed or proposed durable claim with source refs, failure mode, and review trigger.
_Avoid_: hidden memory, raw transcript

**Source claim**:
A claim-ledger item tying a product claim to source IDs, evidence grade, and risk if wrong.
_Avoid_: bibliography row

**Eval run**:
A local or reviewed report from a deterministic or trace-derived eval, including caveats about what it does and does not prove.
_Avoid_: product proof, productivity proof

**Proposal**:
A pending change object. A proposal is not approved truth until reviewed.
_Avoid_: decision, approved state

**Decision**:
An approved product, architecture, workflow, memory, eval, or security choice with rationale and rejected alternatives.
_Avoid_: preference, note

**Operator skill**:
A repo-local build-time skill used to build KRN itself.
_Avoid_: runtime skill, prompt snippet

**Runtime skill**:
A future product skill exposed by KRN to improve Codex work in target projects.
_Avoid_: operator skill

**Stack decision**:
The architecture choice that KRN product implementation is TypeScript-first, with Node.js as the initial runtime and packaging lane.
_Avoid_: Node-first, Python fallback

**Contract slice**:
A narrow implementation path that includes contract, runtime parser, consumer, behavior test, known-bad fixture, and docs/eval update.
_Avoid_: horizontal schema pass, broad framework setup

## Relationships

- **KRN** is the product/tool; **Gas Town** is the codename/repo label.
- A **Bootstrap workflow** produces a **Dry-run manifest**.
- A **Dry-run manifest** references **Product spine** object kinds.
- A **Product spine** object can represent a **Memory entry**, **Source claim**, **Eval run**, **Proposal**, or **Decision**.
- An **Operator skill** helps build KRN; a **Runtime skill** is a future product surface.
- A **Contract slice** is the preferred implementation unit after a **Stack decision**.

## Flagged Ambiguities

- "Node-first" is resolved as wrong wording. The product direction is **TypeScript-first**; Node.js is only the initial runtime.
- "Gas Town" is resolved as codename/repo identity. The tool is **KRN** and the CLI is `krn`.
- "Memory" must not mean hidden model memory. Use **Memory entry** for reviewed project knowledge.
- "Eval passed" must not mean product quality or productivity proof. Use **Eval run** plus interpretation caveat.
