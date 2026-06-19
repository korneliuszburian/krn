# Goal 001: KRN-GAS-TOWN — breakthrough synthesis plan

## Status

This is a planning goal, not the final product plan.

The next operator must not continue broad implementation work before completing the research protocol below. The task is to behave like a scientist: collect real patterns, separate evidence from inference, choose the best pattern per application layer, and condense everything into one coherent product architecture.

## Mission

Create one canonical, evidence-backed product synthesis for `krn-gas-town`.

The synthesis must merge the useful parts of:

- `docs/plans/first-approach/draft.md`
- `docs/plans/second-approach/draft.md`
- `docs/plans/first-approach/SOURCES.md`
- `docs/plans/second-approach/SOURCES.md`

Then it must extend them with a deeper research pass across:

- official OpenAI/Codex docs and Cookbook patterns,
- academic papers and benchmarks,
- memory-system research and products,
- coding-agent benchmarks,
- practitioner workflows from credible senior engineers,
- the target dashboard/control-plane direction.

The output should answer:

> What is the strongest possible Codex-native product architecture we can justify with evidence, and what patterns should we choose for each layer of the application?

## Core Product Hypothesis

`krn-gas-town` is not just `krn init`.

The stronger hypothesis is:

> KRN is a source-backed operating memory and control plane for Codex work. The CLI ingests and executes, MCP/API connects external state, hooks capture deterministic events, evals test improvement, and a dashboard lets humans review, approve, invalidate, and govern agent-proposed knowledge.

`krn init` is the bootstrap entry point.

The future dashboard is not a vanity metrics screen. It is a memory/review/control UI similar in information architecture to the provided "Bobbin AI / Memory Core" reference:

- left navigation for memory domains, sources, gaps, recent changes,
- central list of entries by type/status/confidence,
- right detail panel for proposed changes, source evidence, linked entries, ownership and access,
- explicit review states: `draft`, `AI suggested`, `needs review`, `approved`, `stale`, `superseded`,
- actions such as approve, reject, review one-by-one, invalidate, link sources, and open graph view.

The product is differentiated only if it reduces real repeated Codex failure modes without hiding uncertainty.

## Hard Rule: OpenAI Docs First

Before planning any OpenAI/Codex-specific surface, the operator must read current official OpenAI documentation.

Use the `openai-docs` skill route:

1. Run the Codex manual helper:

   ```bash
   node /home/krn/.codex/skills/.system/openai-docs/scripts/fetch-codex-manual.mjs
   ```

2. Use the returned `codex-manual.md` and `codex-manual.outline.md`.
3. Read the relevant sections before making OpenAI/Codex design decisions.
4. If a claim is not established by the manual, use official OpenAI Developer docs / Cookbook as the next source.
5. Use non-OpenAI web sources only for papers, benchmarks, competitor docs, or practitioner context.

For this goal file, the current manual helper was run on 2026-06-19 and reported:

- Manual path: `/tmp/openai-docs-cache/codex-manual.md`
- Outline path: `/tmp/openai-docs-cache/codex-manual.outline.md`
- Manual status: local manual was already current

The following official sections were read before writing this goal:

- Prompting, thread model, context and goal mode.
- Slash commands in Codex CLI.
- Agent Skills.
- Custom instructions with `AGENTS.md`.
- Customization: AGENTS, memories, skills, MCP, subagents.
- Model Context Protocol.
- Hooks.
- Memories.
- Permissions.
- Plugins and Record & Replay.
- Noninteractive/programmatic interfaces: app-server, GitHub Action, SDK, `codex exec`, JSONL and structured output.
- Use Codex with Agents SDK.
- Subagents.

Design implications from official docs:

- `AGENTS.md` is for small durable project guidance, not a dumping ground.
- Skills are progressive-disclosure reusable workflows and must have precise trigger descriptions.
- MCP is the explicit integration surface for external tools/context/actions.
- Hooks are deterministic lifecycle automation and require trust review; they are not a semantic authority.
- Codex memories are helpful local recall, off by default in some regions, and must not replace checked-in truth.
- Subagents are explicit, token-expensive, and should be narrow.
- `codex exec --json` and `--output-schema` are important for machine-readable traces/eval pipelines.
- App-server/SDK are later integration surfaces; CI/automation should prefer the narrowest official path.

## Hard Rule: AGENTS.md and Docs Hygiene

The operator must treat root `AGENTS.md` as an always-loaded operating contract, not a knowledge base.

Before changing root `AGENTS.md`, read:

- `docs/memory/INDEX.md`
- `docs/memory/openai-codex/2026-06-19--agents-md-standard.md`

Root `AGENTS.md` must stay:

- short,
- universal to every task in this repo,
- pointer-heavy,
- free of duplicated product decisions,
- free of stale path maps,
- free of one-off behavioral hotfixes.

Detailed rules, source analysis, current research, and evolving product conclusions belong in:

```text
docs/memory/{category}/YYYY-MM-DD--short-kebab-topic.md
```

Then the note must be indexed in:

```text
docs/memory/INDEX.md
```

Anti-rot requirements:

1. Verify exact local paths before citing them.
2. Do not duplicate canonical decisions across docs without a clear source of truth.
3. If docs conflict, mark the conflict and update the canonical doc instead of silently reconciling.
4. If a claim depends on current external state, refresh it or mark it stale.
5. Every durable memory note must include status, sources, useful pattern, KRN implication, failure mode and review trigger.
6. Do not let `AGENTS.md`, `docs/memory`, or canonical plans become a dumping ground for unreviewed session summaries.

## Non-Goals

- Do not implement the product while executing this goal.
- Do not create a dashboard UI yet.
- Do not claim benchmark superiority without reproducing or citing the benchmark.
- Do not treat MemPalace, Mem0, Zep, Hindsight or any memory product as "best" because of marketing.
- Do not use social posts as proof; use them only as pattern or market signals.
- Do not create a giant agent swarm as a product strategy.
- Do not turn the dashboard into productivity theater.
- Do not let memory become a source of truth without source IDs, TTL and invalidation.

## Required Output

The later synthesis pass should produce one canonical plan directory:

```text
docs/plans/canonical/
  draft.md
  SOURCES.md
  pattern-matrix.md
```

If the operator decides to use another path, they must record why in the final answer and in the new source index.

`docs/plans/canonical/draft.md` must be in Polish, with technical identifiers in English.

## Scientific Method

Use this chain for every major claim:

```text
source -> observation -> extracted pattern -> mechanism -> KRN implication -> eval/falsification -> failure mode
```

Use these labels consistently:

- `[FACT]` verified directly from source or local evidence.
- `[INFERENCE]` reasoned from verified facts.
- `[HYPOTHESIS]` plausible but not yet verified.
- `[DECISION]` product choice made from evidence and tradeoffs.
- `[BLOCKED]` important but not yet verifiable.

Every chosen pattern must answer:

1. What problem does it solve?
2. What mechanism makes it work?
3. What evidence supports it?
4. What are the failure modes?
5. What would make us reject it?
6. Where does it live in KRN: CLI, AGENTS.md, skill, subagent, hook, MCP/API, eval, memory, dashboard, or docs?

## Evidence Tiers

Use evidence in this order:

1. A-tier: official docs, specs, changelogs, source repos, benchmark pages, papers.
2. B-tier: reproducible examples, benchmark artifacts, public technical repos.
3. C-tier: credible practitioner essays or workflow repos.
4. D-tier: market articles, newsletters, social posts.

Rules:

- A design decision needs A/B evidence or must be marked `[HYPOTHESIS]`.
- A market claim needs current source evidence.
- A "best pattern" claim must include a counterexample or rejected alternative.
- A dashboard claim must map to an actual operational object, not generic analytics.

## Required Research Clusters

### 1. Official OpenAI / Codex

Read and cite current official sources for:

- Codex CLI, app, IDE and cloud surfaces.
- `/goal`, `/plan`, `/skills`, `/mcp`, `/hooks`, `/memories`, `/permissions`, `/status`.
- `AGENTS.md` discovery, precedence and size limits.
- Agent Skills: progressive disclosure, repo/user/admin/system locations, trigger descriptions, plugins.
- MCP config, tool allowlists, approvals and auth.
- Hooks: events, trust review, matcher behavior and limits.
- Memories: enablement, generated memory storage, caveats, external-context settings.
- Subagents: explicit spawning, cost, depth/thread limits, custom agent schema.
- `codex exec`: JSONL events, `--output-schema`, CI patterns.
- App-server / SDK / Agents SDK integration only where it changes product architecture.
- Cookbook patterns:
  - iterative repair loops with Codex,
  - agent improvement loop with traces, evals and Codex,
  - macro evals for agentic systems,
  - memory/compaction,
  - Codex CLI with Agents SDK,
  - structured outputs,
  - migration from OpenAI Evals to Promptfoo.

### 2. Memory and Context Research

Research memory as an engineering layer, not a feature label.

Required candidates:

- MemGPT / Letta: virtual context management and self-editing memory.
- Mem0: scalable memory-centric architecture and LoCoMo results.
- Zep / Graphiti: temporal knowledge graph for agent memory.
- LongMemEval and LongMemEval-V2: long-term memory benchmarks and environment-experience memory.
- A-MEM: agentic memory with dynamic indexing/linking.
- Hindsight and BEAM: temporal/entity-aware memory and long-context benchmark claims.
- MemPalace: spatial/room metaphor and local memory claims.
- Critical MemPalace analysis: separate real retrieval mechanics from marketing.
- MemoryAgentBench / Evo-Memory / MemoryArena if current and relevant.
- Generative Agents if needed for reflection/planning memory lineage.

Extract the best KRN memory pattern:

- source-backed entries,
- evidence packets,
- temporal validity,
- confidence,
- linked entries,
- owner/access,
- review state,
- invalidation/supersession,
- dashboard review workflow,
- evals for recall, abstention, temporal updates and stale-memory prevention.

### 3. Coding-Agent Benchmarks and Agent-Computer Interfaces

Required candidates:

- SWE-bench and SWE-bench Verified.
- SWE-Bench Pro.
- SWE-agent and agent-computer interface design.
- Terminal-Bench.
- Context management for long-horizon SWE agents.
- Any current benchmark that tests repository navigation, tool use, terminal work, CI repair, or long-horizon coding tasks.

Extract the best KRN pattern:

- design the CLI/API/tool surface for agents as first-class users,
- capture traces and command outcomes,
- avoid broad context dumping,
- use local KRN tasks as regression benchmarks,
- do not chase public leaderboard metrics as the product proof.

### 4. Self-Improvement, Evals and Prompt/Skill Optimization

Required candidates:

- OpenAI Cookbook agent improvement loop.
- OpenAI Cookbook macro evals.
- OpenAI Cookbook iterative repair loops with Codex.
- GEPA / reflective prompt evolution.
- Reflexion.
- Self-Refine.
- Voyager: skill library, automatic curriculum and iterative prompting.
- Promptfoo coding-agent evals.
- LangSmith or equivalent trace/eval docs only where they change architecture.

Extract the best KRN improvement pattern:

```text
Codex run -> trace -> human/model feedback -> eval fixture -> proposed skill/prompt/hook/memory update -> train/validation split -> review -> release -> regression monitor
```

No self-evolving update may be auto-applied without review in early versions.

### 5. Senior Engineering / Practitioner Patterns

Research credible patterns from:

- Matt Pocock / AI Hero / `mattpocock/skills`.
- Addy Osmani.
- Simon Willison.
- Andrej Karpathy.
- LangChain / Harrison Chase on context engineering.
- Swyx and adjacent agent engineering sources if useful.
- Logan Kilpatrick only with direct verified sources.
- Anton Osika only with direct verified sources.

Do not cite them as scientific proof. Use them as:

- workflow discipline,
- vocabulary,
- review standards,
- anti-slop heuristics,
- agent UX patterns,
- senior engineering judgment.

Expected extracted patterns:

- small composable skills,
- shared domain language,
- explicit feedback loops,
- typecheck/test/browser verification,
- red-green-refactor where useful,
- grill/interview before ambiguous work,
- handoff/compaction discipline,
- architecture care and deep modules,
- simple direct maintainable code over clever agent ceremony.

## Application Layers and Pattern Selection

For each layer below, choose one primary pattern and one fallback.

### Layer 1: Product Identity

Question:

> Is KRN a bootstrapper, a memory system, a dashboard, an eval harness, or a control plane?

Expected answer format:

- primary identity,
- secondary surfaces,
- what KRN is not,
- kill criterion.

### Layer 2: Codex Bootstrap

Choose best pattern for:

- `krn init`,
- `krn doctor`,
- project `.codex/config.toml`,
- `AGENTS.md`,
- `.agents/skills`,
- `.codex/agents`,
- hooks,
- MCP config,
- rollback manifest.

### Layer 3: Agent-Computer Interface

Choose how the CLI/API should expose work to Codex:

- command naming,
- dry-run output,
- JSON schema,
- machine-readable traces,
- bounded actions,
- safe defaults.

### Layer 4: Memory Kernel

Choose architecture for:

- entry types,
- evidence links,
- temporal validity,
- confidence,
- review state,
- graph links,
- ownership,
- invalidation,
- source provenance,
- local/offline fallback,
- dashboard review.

### Layer 5: Source and Claim Ledger

Choose how KRN records:

- source IDs,
- local evidence IDs,
- claim ledger,
- decision evidence map,
- blocked research,
- unsupported claims,
- source freshness.

### Layer 6: Skills

Choose:

- which workflows become skills,
- skill trigger tests,
- anti-bloat rules,
- when skills must be explicit-only,
- when skills need scripts,
- when skills should be packaged as plugins.

### Layer 7: Subagents

Choose:

- which subagents exist,
- max thread/depth defaults,
- read-only vs write-capable boundaries,
- handoff format,
- when subagents are forbidden.

### Layer 8: Hooks and Permissions

Choose:

- deterministic hook events,
- trust review requirements,
- prompt/source/memory gates,
- command policy,
- secret protection,
- what hooks must never decide.

### Layer 9: MCP/API Bridge

Choose:

- resources,
- tools,
- prompts,
- approval modes,
- auth,
- rate limits,
- idempotency,
- audit trail,
- offline behavior.

### Layer 10: Evals and Improvement Loop

Choose:

- micro evals,
- macro evals,
- trace-derived evals,
- prompt/skill optimization path,
- known-bad fixtures,
- train/validation splits,
- dashboard metrics.

### Layer 11: Dashboard / Control Plane

Map the reference UI into KRN objects:

- Memory Core.
- Pending Review.
- Knowledge Gaps.
- Recently Changed.
- Domains.
- Sources.
- Entry list.
- Detail/review panel.
- Proposed edits.
- Steps.
- Linked entries.
- Access/ownership.
- Graph view.

The dashboard must support reviewable actions, not just viewing:

- approve proposed memory,
- reject proposal,
- request more sources,
- mark stale,
- supersede,
- link entries,
- inspect trace/source,
- promote failure pattern into eval,
- approve skill/prompt/hook change proposal.

### Layer 12: Security and Governance

Choose:

- default trust posture,
- local vs cloud boundaries,
- source privacy,
- memory privacy,
- secret handling,
- destructive action policy,
- dashboard access control,
- review roles.

### Layer 13: Roadmap

Choose milestones:

- P0: canonical docs and source index.
- P1: CLI scaffold and event schema.
- P2: memory proposal/review model.
- P3: local eval harness.
- P4: MCP/API read/write bridge.
- P5: dashboard prototype reading real events.
- P6: trace-derived improvement loop.

Every milestone needs:

- user-visible value,
- files/components,
- evidence basis,
- eval gate,
- failure mode,
- kill criterion.

## Pattern Matrix Contract

Create `docs/plans/canonical/pattern-matrix.md` with this table:

| Layer | Candidate pattern | Source IDs | Evidence tier | Mechanism | KRN fit | Failure mode | Decision |
|---|---|---|---|---|---|---|---|

Each row must be short but specific.

The final matrix must include at least:

- 8 OpenAI/Codex patterns,
- 8 memory/context patterns,
- 6 eval/self-improvement patterns,
- 5 coding-agent benchmark/interface patterns,
- 5 practitioner/senior-engineering patterns,
- 5 dashboard/control-plane patterns.

## Source Index Contract

Create `docs/plans/canonical/SOURCES.md`.

Minimum target:

- 60 total sources if web access works.
- At least 25 A-tier or primary sources.
- At least 12 papers/benchmarks.
- At least 10 official OpenAI/Codex/Cookbook sources.
- At least 8 memory-system sources.
- At least 8 competitor/practitioner sources.

Use this structure:

```markdown
# SOURCES.md

## Method

- Access date:
- Research scope:
- Trust tiers:
- Known gaps:

## Source index

### [S001] - Source title

- URL:
- Type:
- Date accessed:
- Sector:
- Reliability:
- Key claims supported:
- Product implications:
- Risks / caveats:

## Claim ledger

| Claim ID | Claim | Source IDs | Evidence grade | Used for decision? | Risk if wrong |
|---|---|---|---|---|---|

## Decision evidence map

| Decision | Source IDs | Local evidence | Confidence | Counterargument | Status |
|---|---|---|---|---|---|

## Blocked research

| Source/query | Why blocked | Impact |
|---|---|---|
```

## Final Draft Contract

Create `docs/plans/canonical/draft.md` with this structure:

1. Executive thesis.
2. What changed after merging first/second approach.
3. Product identity and breakthrough verdict.
4. Research method and evidence tiers.
5. Pattern synthesis by application layer.
6. OpenAI/Codex surface decisions.
7. Memory kernel architecture.
8. Source/claim ledger architecture.
9. Skills/subagents/hooks/MCP architecture.
10. Evals and improvement loop.
11. Dashboard/control-plane architecture.
12. Security/governance.
13. Market/practitioner comparison.
14. Roadmap.
15. Kill criteria.
16. Open questions.
17. Decision log.
18. Source coverage checklist.

The draft must be dense, factual and internally coherent. It must not be a generic AI-agent essay.

## Acceptance Criteria

The goal is complete only when:

- `docs/goals/goal-001.md` exists and defines the research protocol.
- The next synthesis pass has a clear target path and output contract.
- Official OpenAI/Codex docs are required before any OpenAI-specific decision.
- The dashboard target is treated as an operational memory/control plane, not a vanity dashboard.
- The plan requires paper-backed and benchmark-backed pattern selection.
- Every application layer has a required pattern-selection step.
- Unsupported claims are forbidden or marked `[HYPOTHESIS]`.
- There is a clear path from research to product architecture to eval/falsification.

## Stop Conditions

Stop and report a blocker if:

- OpenAI docs cannot be read and the task needs OpenAI-specific planning.
- Web access is unavailable for the paper/benchmark sweep.
- The operator cannot distinguish source-backed facts from inference.
- `first-approach` and `second-approach` cannot be read.
- The task drifts into implementation before the canonical plan is accepted.
