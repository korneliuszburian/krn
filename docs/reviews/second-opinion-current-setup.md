# Second Opinion Prompt: KRN Gas Town Operating Layer

Use this prompt with ChatGPT as an external reviewer/analyzer. The reviewer must assume they cannot access the repository, local filesystem, Codex transcript, or previous context. Everything below is the evidence pack.

```text
You are an external senior reviewer for a Codex-native product/tooling repo.

You do not have repo access. Treat the context below as the only evidence. Do not invent files, implementation, benchmark results, or hidden context. Use these labels:

- [FACT] directly stated in this prompt or source-backed.
- [INFERENCE] reasoned from facts.
- [HYPOTHESIS] plausible but unproven.
- [DECISION] a product choice that follows from evidence.
- [BLOCKED] important but not answerable from this evidence.

Your job is to give a hard second opinion on whether the setup is coherent, what is missing, and what should happen next.

## Current repo state

- Repo name: krn-gas-town.
- Purpose: research workspace for a Codex-native operating memory, eval, and control-plane layer.
- Current status: planning/research/prototype stage, not a product implementation.
- Root `AGENTS.md`: 25-line normative contract with read order, docs hygiene, OpenAI docs-first rule, compact continuity read order, and guardrail that KRN is not a prompt pack or dashboard-first app.
- Repo-local memory index: `docs/memory/INDEX.md`.
- Canonical synthesis:
  - `docs/plans/canonical/draft.md`
  - `docs/plans/canonical/pattern-matrix.md`
  - `docs/plans/canonical/SOURCES.md`
- Source index: 76 original sources before this second-opinion pass, including official OpenAI/Codex docs, OpenAI Cookbook workflows, memory papers, coding-agent benchmarks, Matt Pocock skills, Sandcastle, AGENTS.md guidance, and 12-factor agents.
- Claim ledger: 12 original claims before this pass, including AGENTS.md smallness, skills as focused workflows, hooks as deterministic gates, MCP append-only writes, `codex exec` as worker lane, and memory invalidation.
- Pattern matrix: 43 original pattern rows before this pass.
- Project-local compact hook prototype exists:
  - `.codex/hooks.json`
  - `.codex/hooks/compact_continuity.py`
  - `.krn/compact/README.md`
  - `.krn/compact/.gitignore`
- Manual hook invocation produced:
  - `.krn/compact/latest-checkpoint.md`
  - `.krn/compact/latest-postcompact.md`
  - `.krn/compact/events/compact-events.jsonl`
- Caveat: manual command invocation is proven; live `/compact` behavior should still be tested inside Codex and reviewed through `/hooks` if Codex asks for trust.

## Product thesis

KRN is not a generic agent framework, dashboard-first app, prompt pack, or vector DB wrapper.

The thesis is:

KRN is a source-backed operating memory and control plane for Codex work. Codex work produces trace/source/eval artifacts. KRN turns those into reviewed memory, decisions, gaps, evals, hooks, and dashboard objects. Future Codex work starts from this governed state.

The user wants a future dashboard similar to a "Memory Core" UI:

- left navigation for memory domains, sources, gaps, recent changes,
- central list of entries by type/status/confidence,
- right detail panel for proposed edits, source evidence, linked entries, ownership/access,
- explicit states: draft, AI suggested, needs review, approved, stale, superseded,
- actions: approve, reject, request sources, invalidate, supersede, link entries, graph view.

## Required conceptual split

Review this split as a first-class architectural question:

### Layer A: Operator/build-time skills

These are the skills/pipelines used to build KRN itself. They should resemble Matt Pocock's approach: a normalized execution pipeline, not ten unrelated prompts.

The expected operator pipeline is roughly:

1. router/setup skill,
2. grill/domain clarification,
3. decision mapping,
4. PRD or product brief,
5. ADR when there is a real hard-to-reverse decision,
6. issue slicing into agent-ready work,
7. prototype only when answering one question,
8. TDD/implementation vertical slice,
9. review,
10. handoff/compact boundary,
11. verification and release note.

Important Matt Pocock-inspired patterns observed from full local clone/read of `mattpocock/skills`:

- skills are organized by categories such as engineering, productivity, in-progress, misc, deprecated, personal,
- each skill is an instruction package with a precise role,
- `ask-matt` acts as a router over user-invoked skills,
- `grill-with-docs` comes before ambiguous build work,
- `to-prd` and `to-issues` turn clarified intent into agent-ready implementation slices,
- `handoff` creates a fresh-session artifact; compaction is not a replacement for phase handoff,
- TDD is vertical tracer bullets: one test, one implementation, public behavior first,
- debugging starts by creating a red-capable tight loop,
- ADRs are used only for hard-to-reverse or surprising tradeoffs,
- good skills optimize predictability, information hierarchy, progressive disclosure, and avoid sediment/sprawl/no-op instructions.

### Layer B: Runtime/execution/API skills

These are capabilities KRN eventually gives Codex/ChatGPT/reviewer agents:

- bidirectional skills connected to KRN API/MCP,
- source-backed memory proposal and review,
- subagents with narrow contracts,
- project-local hooks for guardrails and lifecycle capture,
- eval loops and prompt/skill regression tests,
- dashboard event/state publication,
- append-only idempotent writes,
- read-only reviewer tools before write tools.

This layer must not be confused with Layer A. Layer A builds the product. Layer B is part of the product.

## External patterns to compare

Use the following as source-backed reference points:

- OpenAI Codex docs: AGENTS.md, skills, hooks, MCP, subagents, `codex exec`, app-server, SDK.
- OpenAI skills repo: skills are folders of instructions/scripts/resources; Codex uses them for repeatable tasks.
- OpenAI ChatGPT Projects: projects hold chats, files, instructions, and memory for repeated work.
- OpenAI custom GPTs: GPTs can use instructions, knowledge files, capabilities, apps, or actions. Knowledge is reference material; actions connect to external APIs; a GPT can use either apps or actions, not both.
- OpenAI ChatGPT Apps/MCP: ChatGPT can connect to custom MCP apps through HTTPS; local/private MCP servers need Secure MCP Tunnel or a public tunnel; write actions are plan/workspace/permission dependent and require review.
- OpenAI Codex as MCP server: `codex mcp-server` exposes Codex over stdio for other tools/agents. This is not directly a public HTTPS ChatGPT connector; a gateway is needed.
- Matt Pocock skills: normalized operator pipeline and skill craftsmanship.
- Matt Pocock Sandcastle: isolated sandbox/worktree agent orchestration, structured output, logs, branch strategy, one-iteration resume, prompt expansion fail-fast.
- HumanLayer 12-factor agents: own prompts, own context, tools as structured outputs, launch/pause/resume APIs, own control flow, small focused agents, stateless reducer.
- Coding-agent benchmark lessons: local product proof beats leaderboard claims.

## Questions to answer

1. Is the current setup coherent, or is it overbuilt planning without enough executable proof?
2. Is the Layer A / Layer B split correct? If not, redraw it.
3. Which Matt Pocock-style operator skills should be built first, and in what order?
4. Which runtime skills/API/hook/subagent capabilities should be postponed until after baseline proof?
5. What is the minimum useful KRN pipeline for creating code with agents in this repo?
6. What should be measured in a baseline-vs-KRN test?
7. What docs are likely to rot, drift, duplicate, or become useless?
8. What should be added to `AGENTS.md`, and what must stay out of it?
9. What is the safest ChatGPT reviewer/analyzer architecture?
10. What should the dashboard read from first: markdown ledgers, event logs, MCP resources, or a database?
11. What is the top risk that would make this product fail?

## Expected output format

Return:

1. Verdict in 5 bullets.
2. Current maturity score: docs/research/prototype/product, with rationale.
3. Layer A operator pipeline proposal: exact skills, order, entry/exit artifacts.
4. Layer B runtime capability proposal: exact tools/skills/hooks/subagents, grouped by phase.
5. ChatGPT reviewer bridge proposal: static Project/GPT first, MCP gateway later, safety gates.
6. Evidence matrix: pattern -> source -> mechanism -> KRN implication -> failure mode.
7. Risk register: P0/P1/P2 risks.
8. Ten next implementation slices in order.
9. Harsh critique: what is overbuilt, under-specified, unsafe, or unmeasurable.
10. Final recommendation: continue, simplify, or pivot.

Rules:

- Do not rank by GitHub stars.
- Do not propose a generic dashboard.
- Do not propose a recursive agent swarm.
- Do not claim breakthrough without a falsifiable benchmark.
- Cite source names/URLs from this prompt when using them.
- Mark all unsupported claims as [HYPOTHESIS] or [BLOCKED].
```

## Suggested first ChatGPT project setup

Upload or paste these as project sources before running the prompt:

1. `AGENTS.md`
2. `docs/memory/INDEX.md`
3. `docs/goals/goal-001.md`
4. `docs/plans/canonical/draft.md`
5. `docs/plans/canonical/pattern-matrix.md`
6. `docs/plans/canonical/SOURCES.md`
7. `docs/memory/github-research/2026-06-19--mattpocock-skills-operator-pipeline.md`
8. `docs/memory/openai-codex/2026-06-19--chatgpt-reviewer-bridge.md`
9. `docs/memory/openai-codex/2026-06-19--compact-hooks-continuity.md`

Use a fresh chat for each major review so stale project conversation context does not silently dominate the source files.
