# KRN control-plane proposal contract

Status: fact

Sources:

- [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md)
- [docs/goals/goal-008.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-008.md)
- [docs/specs/krn-control-plane-proposal/README.md](/home/krn/coding/krn/active/krn-gastown/docs/specs/krn-control-plane-proposal/README.md)
- [packages/contracts/src/control-plane-proposal.ts](/home/krn/coding/krn/active/krn-gastown/packages/contracts/src/control-plane-proposal.ts)
- [packages/contracts/test/control-plane-proposal.test.ts](/home/krn/coding/krn/active/krn-gastown/packages/contracts/test/control-plane-proposal.test.ts)
- Local contract evidence: `pnpm test -- packages/contracts/test/control-plane-proposal.test.ts`
- Local type evidence: `pnpm typecheck`

## Observation

`packages/contracts` now exports `KrnControlPlaneProposalSchema`, `parseKrnControlPlaneProposal`, and `krnControlPlaneProposalJsonSchema`.

The proposal contract requires:

- `schema_version: "krn-control-plane-proposal.v1"`,
- `kind: "krn_control_plane_proposal"`,
- `status: "proposal_only"`,
- proposal kind,
- target path or resource URI,
- source refs and evidence refs,
- idempotency key,
- append-only persistence policy,
- `default_effect: "no_mutation"`,
- human review gate with `state: "not_reviewed"`,
- interpretation caveat.

The known-bad fixture attempts an approved mutation and is rejected by the public parser.

## Useful Pattern

Represent future control-plane writes as reviewable objects before exposing any write-capable tools:

```text
proposal intent -> parser/schema -> known-bad approved mutation fixture -> tests -> later append-only tool
```

This gives MCP/API/dashboard consumers a typed object before they can mutate memory, source ledgers, eval records, repair logs, or dashboard events.

## KRN Implication

Slice 3 now has the proposal-only object contract required before MCP/API proposal tools. The next safe step is either a deterministic eval for proposal tooling or the first dashboard view-model contract over real product objects.

This does not prove MCP proposal tool safety, append-only persistence implementation, dashboard readiness, human approval quality, ChatGPT connector behavior, or productivity lift.

## Failure Mode

This becomes harmful if the contract is treated as an executed write. `status: "proposal_only"`, `default_effect: "no_mutation"`, and `review_gate.state: "not_reviewed"` must remain visible until a separate reviewed persistence/tool contract exists.

## Review Trigger

Update this note when MCP/API proposal tools are registered, append-only proposal persistence is implemented, dashboard pending-review view models consume proposals, or proposal kinds change.
