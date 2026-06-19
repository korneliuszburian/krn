# KRN naming and Gas Town codename

Status: decision

Sources:

- Steve Yegge, "Welcome to Gas Town", accessed 2026-06-19: https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04
- Maggie Appleton, "Gas Town's Agent Patterns, Design Bottlenecks, and Vibecoding at Scale", accessed 2026-06-19: https://maggieappleton.com/gastown
- Mad Max Wiki, "Gas Town", accessed 2026-06-19: https://madmax.fandom.com/wiki/Gas_Town
- `CONTEXT.md`
- `docs/product/final-product-plan.md`
- `docs/goals/goal-006.md`

Useful pattern:

Use **KRN** as the product/tool name and `krn` as the CLI. Treat **Gas Town** as the repo/codename only.

The codename should be used knowingly:

- In current AI-coding discourse, "Gas Town" points to Steve Yegge's agent-orchestration/vibe-coding system.
- Yegge says the theming started with Mad Max but is intentionally loose.
- Maggie Appleton treats Gas Town as a provocative agent-orchestration/design-fiction signal, not a sober product template.
- Mad Max's Gas Town is an oil/refinery fortress reference, useful for understanding the name's vibe, not for product design.

KRN implication:

- Public tool name: **KRN**.
- CLI: `krn`.
- Repo/codename: **Gas Town** / `krn-gas-town`.
- Documentation must not imply that this project is Steve Yegge's Gas Town or a clone of it.
- Borrow mechanisms only after source-backed analysis: persistent work objects, externalized state, queues, review/control plane, and context-reset survival.

Failure mode:

- Using "Gas Town" as a public product name creates brand/discourse confusion.
- Copying the vibe without the mechanism turns the project into aesthetic cosplay.
- Overreacting against the meme loses useful patterns around persistent work, orchestration, and externalized state.

Review trigger:

Update if the public product name changes, if `krn` conflicts with another product target, or if the project starts packaging/distributing outside this repo.
