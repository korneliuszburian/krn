# Goal: KRN-GAS-TOWN — Codex-first research, architecture and anti-slop product plan

## Mission

Improve the existing `docs/plans/first-approach/draft.md` into a source-backed, graph-heavy, brutally practical product plan for KRN-GAS-TOWN.

KRN-GAS-TOWN is a Codex-first infrastructure layer for improving real software work through:

- Codex CLI as the main executor.
- Codex Desktop/IDE as compatible surfaces, not the core.
- `krn init` as the simple project bootstrap.
- Skills, subagents, MCP, hooks, config, evals, memory/context strategy and dashboard.
- A two-way KRN API that lets Codex read/write structured project intelligence safely.

The final document must answer:

> Are we building a real leverage layer for Codex, or just another AI coding slop wrapper?

Do not write marketing fluff. Do not produce a generic AI agent essay. Produce a plan that could guide implementation.

---

## Current user intent

The original user prompt is too broad, but valuable.

Condense it into a clearer product/research plan that forces Codex to:

1. Identify the real paradoxes and absurdities of working with Codex CLI, Claude Code and similar coding agents.
2. Research current official docs, market patterns, papers and practitioner workflows.
3. Convert research into architecture decisions.
4. Design a practical product around `krn init`, skills, subagents, MCP, hooks, memory, evals and dashboard.
5. Store evidence in `SOURCES.md`.
6. Update `docs/plans/first-approach/draft.md` with the final plan.

---

## Non-negotiables

- Main executor: OpenAI Codex CLI.
- Current assumed versions from the user: Codex CLI `0.141.0`, Codex Desktop `26.616`.
- Verify versions through local commands and official changelog where possible.
- Main artifact to edit: `docs/plans/first-approach/draft.md`.
- Source index to create or update: `SOURCES.md`.
- Write final docs in Polish.
- Keep command names, file names, API names, YAML keys, XML tags and technical identifiers in English.
- Do not implement the actual product unless the repo already has supporting scripts required for documentation validation.
- Do not overwrite user changes.
- If something cannot be verified, mark it as `[HYPOTHESIS]` or document it in `SOURCES.md`.

---

## First actions

1. Run:

   ```bash
   git status --short
````

2. Read `docs/plans/first-approach/draft.md` fully.

3. Inspect the repo for:

   ```text
   AGENTS.md
   .codex/config.toml
   .codex/**
   .agents/skills/**
   .agents/**
   .mcp/**
   SOURCES.md
   README.md
   docs/**
   package.json
   pyproject.toml
   Cargo.toml
   pnpm-lock.yaml
   uv.lock
   ```

4. Identify the current project shape.

5. If `docs/plans/first-approach/draft.md` is missing, stop and report a blocker.

---

## Research standard

Use evidence before architecture.

Prefer sources in this order:

1. Official docs, changelogs, repos, specs.
2. Academic papers, benchmarks, reproducible experiments.
3. Practitioner workflows from credible builders.
4. Competitor docs.
5. Market articles.
6. Social posts only as trend signals, not proof.

For every important claim in `docs/plans/first-approach/draft.md`, use one of:

```text
[S-###]        verified source from SOURCES.md
[LOCAL-###]    local repo evidence
[HYPOTHESIS]   plausible but not verified
```

Do not create fake citations.

---

## Required seed sources

Research the user-provided links first.

### OpenAI / Codex

* [https://developers.openai.com/codex/changelog](https://developers.openai.com/codex/changelog)
* [https://developers.openai.com/codex/app/commands#settings](https://developers.openai.com/codex/app/commands#settings)
* [https://developers.openai.com/codex](https://developers.openai.com/codex)
* [https://developers.openai.com/codex/skills](https://developers.openai.com/codex/skills)
* [https://developers.openai.com/codex/use-cases/follow-goals](https://developers.openai.com/codex/use-cases/follow-goals)
* [https://developers.openai.com/codex/use-cases/code-migrations](https://developers.openai.com/codex/use-cases/code-migrations)
* [https://developers.openai.com/codex/use-cases/iterate-on-difficult-problems](https://developers.openai.com/codex/use-cases/iterate-on-difficult-problems)
* [https://developers.openai.com/codex/guides/agents-md](https://developers.openai.com/codex/guides/agents-md)
* [https://developers.openai.com/codex/workflows](https://developers.openai.com/codex/workflows)
* [https://developers.openai.com/codex/cli/slash-commands#set-or-view-a-task-goal-with-goal](https://developers.openai.com/codex/cli/slash-commands#set-or-view-a-task-goal-with-goal)
* [https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex](https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex)
* [https://developers.openai.com/cookbook/examples/agents_sdk/building_reliable_agents_memory_compaction](https://developers.openai.com/cookbook/examples/agents_sdk/building_reliable_agents_memory_compaction)
* [https://developers.openai.com/cookbook/examples/agents_sdk/deployment_manager/readme](https://developers.openai.com/cookbook/examples/agents_sdk/deployment_manager/readme)
* [https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems](https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems)
* [https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide](https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide)
* [https://developers.openai.com/cookbook/articles/codex_exec_plans](https://developers.openai.com/cookbook/articles/codex_exec_plans)
* [https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop](https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop)
* [https://developers.openai.com/cookbook/examples/responses_api/responses_example](https://developers.openai.com/cookbook/examples/responses_api/responses_example)
* [https://developers.openai.com/cookbook/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk](https://developers.openai.com/cookbook/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk)
* [https://developers.openai.com/cookbook/examples/codex/code_modernization](https://developers.openai.com/cookbook/examples/codex/code_modernization)
* [https://developers.openai.com/cookbook/examples/structured_outputs_intro](https://developers.openai.com/cookbook/examples/structured_outputs_intro)
* [https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide](https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide)
* [https://developers.openai.com/cookbook/examples/chatgpt/workspace_agents/workspace-agents-api-trigger](https://developers.openai.com/cookbook/examples/chatgpt/workspace_agents/workspace-agents-api-trigger)
* [https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo](https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo)
* [https://github.com/openai/codex/releases](https://github.com/openai/codex/releases)

### Skills / Agent Skills

* [https://agentskills.io/specification](https://agentskills.io/specification)
* [https://agentskills.io/skill-creation/best-practices](https://agentskills.io/skill-creation/best-practices)
* [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)
* [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)

### External patterns and market

* [https://github.com/mattpocock/dictionary-of-ai-coding](https://github.com/mattpocock/dictionary-of-ai-coding)
* [https://www.aihero.dev/ai-coding-dictionary](https://www.aihero.dev/ai-coding-dictionary)
* [https://code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview)
* [https://code.claude.com/docs/en/hooks](https://code.claude.com/docs/en/hooks)
* [https://simonwillison.net/guides/agentic-engineering-patterns/how-coding-agents-work/](https://simonwillison.net/guides/agentic-engineering-patterns/how-coding-agents-work/)
* [https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/](https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/)
* [https://addyosmani.com/blog/ai-coding-workflow/](https://addyosmani.com/blog/ai-coding-workflow/)
* [https://addyosmani.com/blog/future-agentic-coding/](https://addyosmani.com/blog/future-agentic-coding/)
* [https://docs.langchain.com/oss/python/langgraph/overview](https://docs.langchain.com/oss/python/langgraph/overview)
* [https://docs.langchain.com/oss/python/langgraph/persistence](https://docs.langchain.com/oss/python/langgraph/persistence)
* [https://docs.langchain.com/oss/python/langchain/human-in-the-loop](https://docs.langchain.com/oss/python/langchain/human-in-the-loop)
* [https://arxiv.org/abs/2603.20847](https://arxiv.org/abs/2603.20847)

Also search for current patterns from:

* Matt Pocock
* Addy Osmani
* Andrej Karpathy
* Harrison Chase / LangChain
* Simon Willison
* Anton Osika
* Swyx
* Logan Kilpatrick

Do not attribute views to them unless verified.

---

## `SOURCES.md` contract

Create or update `SOURCES.md`.

Use this structure:

```markdown
# SOURCES.md

## Method

- Access date:
- Research scope:
- Trust tiers:
- Known gaps:

## Source index

### S-001 — Source title

- URL:
- Accessed:
- Type: official-doc | changelog | repo | paper | benchmark | practitioner-pattern | competitor-doc | market-analysis | local-evidence
- Trust tier: A | B | C | D
- Freshness: current | possibly-stale | historical
- Key claims:
  - C-001:
  - C-002:
- Product implications:
  - I-001:
- Risks / limitations:
  - R-001:
- Used in draft sections:
  - Section name

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

Minimum target:

* 30 sources if web access works.
* At least 15 A-tier or primary sources if available.
* Every major design decision in `docs/plans/first-approach/draft.md` must reference `SOURCES.md`.

---

## `docs/plans/first-approach/draft.md` target structure

Rewrite or reorganize `docs/plans/first-approach/draft.md` into this structure.

Preserve useful existing content, but remove repetition, fluff and unsupported claims.

# KRN-GAS-TOWN — Codex-first infra plan

## 0. Executive thesis

Answer directly:

* Are we building a breakthrough, strong wedge, useful internal tool, commodity wrapper, or slop?
* What is the core wedge?
* What is not unique?
* What must be validated first?
* What would kill the project?

Keep this section sharp.

Every major claim needs `[S-###]`, `[LOCAL-###]` or `[HYPOTHESIS]`.

---

## 1. Big FAQ

Create one large FAQ.

Minimum: 30 questions.

The FAQ must answer questions from four perspectives:

1. Founder / product strategist.
2. Senior engineer.
3. Skeptical user.
4. Codex CLI power user.

Required questions:

* What exactly is KRN-GAS-TOWN?
* Why Codex CLI first?
* Why not just use `AGENTS.md`?
* Why not just install skills?
* Why not just use MCP?
* Why not just use Claude Code?
* Why not just use Cursor?
* Why not just use Cline/Roo?
* Why not just use LangGraph?
* What does `krn init` actually do?
* What does the dashboard show?
* What does the two-way API unlock?
* What should never go into memory?
* How do we prevent memory rot?
* How do we prevent context rot?
* How do we prevent skill bloat?
* How do we prevent subagent token explosion?
* How do we measure improvement?
* What is the shortest MVP?
* What would make this slop?

Answers should be direct. No hype.

---

## 2. Paradox inventory

Identify at least 18 paradoxes of working with Codex, Claude Code and coding agents.

For each paradox include:

* Problem.
* Why it happens.
* CLI manifestation.
* Desktop/IDE manifestation.
* KRN layer that can help.
* What KRN cannot solve.
* Metric or eval to validate improvement.

Required paradoxes:

1. Autonomy vs control.
2. More context vs more noise.
3. Memory helps vs memory lies.
4. Compaction saves context vs loses nuance.
5. Skills scale workflows vs create skill bloat.
6. Subagents isolate context vs create token explosion.
7. MCP gives power vs increases attack surface.
8. Hooks are deterministic vs create false confidence.
9. `AGENTS.md` stabilizes projects vs becomes a junk drawer.
10. Goals enable long work vs may lock in the wrong direction.
11. Evals create confidence vs can be gamed.
12. Dashboard gives visibility vs creates bureaucracy.
13. Negative prompting reduces mistakes vs does not define success.
14. Faster code generation vs slower review/integration.
15. `krn init` simplifies setup vs may hide complexity.
16. Two-way API creates leverage vs creates coupling.
17. Local CLI gives control vs cloud agents give parallelism.
18. Fast-changing Codex versions vs stable product promises.

---

## 3. Market and pattern scan

Compare KRN against real alternatives by problem, not by feature checklist.

Include:

* OpenAI Codex CLI/Desktop/IDE.
* Claude Code.
* Cursor.
* Cline/Roo.
* Aider.
* Devin/Cognition or similar autonomous SWE agents.
* GitHub Copilot coding agent.
* LangGraph/LangSmith.
* promptfoo or equivalent eval tooling.

Use this table:

```markdown
| Problem | Existing solution | Gap | KRN opportunity | Risk of being slop | Evidence |
|---|---|---|---|---|---|
```

Cover:

* Context management.
* Memory.
* Skills.
* Subagents.
* MCP/tools.
* Hooks/guardrails.
* Evals.
* Observability.
* Long-running tasks.
* API integration.
* Dashboard/workflow analytics.
* Security.
* Developer UX.

---

## 4. Product architecture

Design the product as layers.

Required layers:

* KRN CLI.
* `krn init`.
* Codex config generator.
* `AGENTS.md` strategy.
* Skills library.
* Subagent library.
* MCP layer.
* Hooks layer.
* Rules/permissions/sandbox layer.
* Source index layer.
* Memory/context layer.
* Eval layer.
* Trace/observability layer.
* Dashboard.
* KRN API.
* Local cache/event log.
* Sync/auth/security.

For each layer include:

* Purpose.
* Input.
* Output.
* What Codex sees.
* What stays outside context.
* Failure modes.
* Verification/evals.
* MVP version.
* Later version.
* Evidence refs.

---

## 5. Architecture graphs

Add at least 6 Mermaid diagrams.

Required:

1. Product layer graph.
2. Codex CLI runtime graph.
3. Skills/subagents/MCP/hooks interaction graph.
4. Memory/context/source-of-truth graph.
5. Eval/feedback loop.
6. Two-way KRN API graph.

Optional but useful:

7. `krn init` file generation graph.
8. Dashboard telemetry graph.

Each graph needs a short explanation:

* What it shows.
* What decision it supports.
* What risk it hides.

---

## 6. `krn init` specification

Design the expected UX:

```bash
krn init
krn doctor
krn codex
krn goal <template>
krn sources audit
krn eval run
krn dashboard
krn sync
```

Specify:

* How project type is detected.
* What files are generated.
* How existing files are merged, not overwritten.
* How Codex CLI/Desktop are detected.
* How skills are installed.
* How subagents are installed.
* How MCP is configured.
* How hooks are installed.
* How rules/permissions are configured.
* How `SOURCES.md` is created.
* How eval profiles are created.
* How KRN API is connected.
* How rollback works.
* How `krn doctor` diagnoses problems.

Principle:

> `krn init` should make the project understandable, not magical.

---

## 7. Skills architecture

Use Agent Skills / Codex Skills as progressive-disclosure packages.

Important rule:

> `SKILL.md` frontmatter must stay clean YAML. Do not put XML tags or angle-bracket pseudo-instructions in frontmatter. XML-like tags are allowed only inside Markdown body when they improve clarity.

For every skill type define:

* Name.
* Description.
* Trigger.
* When not to use.
* Context budget.
* Required files.
* Optional scripts.
* References.
* Output contract.
* Verification.
* Failure modes.

Skill categories:

* Core project skills.
* Research skills.
* Planning skills.
* Implementation skills.
* Migration/refactor skills.
* Testing/eval skills.
* Review/security skills.
* Source/audit skills.
* API/dashboard skills.

Use this valid skill template:

```markdown
---
name: source-researcher
description: Researches and summarizes sources for architecture decisions. Use when a task requires external evidence, source indexing, claim verification, or updating SOURCES.md.
---

# Source Researcher

## Purpose

Research claims, verify sources and update `SOURCES.md`.

## When to use

Use when the task requires current docs, market research, papers, changelogs or claim verification.

## When not to use

Do not use for implementation-only tasks where all context is already local and verified.

## Workflow

1. Identify claims that need evidence.
2. Search primary sources first.
3. Add source entries to `SOURCES.md`.
4. Link claims to source IDs.
5. Mark unverifiable claims as `[HYPOTHESIS]`.

## Output

Return:

- Sources added.
- Claims verified.
- Claims rejected.
- Open uncertainties.

## Verification

- Each major claim has a source ID or hypothesis tag.
- No fake citations.
- `SOURCES.md` remains valid Markdown.
```

XML may be used in the body only when it adds clear separation, for example:

```markdown
## Output contract

<output_contract>
Return a Markdown table with:
- claim
- source id
- confidence
- implication
- risk
</output_contract>
```

Explain when XML helps and when it is useless ritual.

---

## 8. Subagent architecture

Design subagents only where isolation gives real value.

Minimum subagents:

* `source-researcher`
* `codex-docs-auditor`
* `market-comparison-analyst`
* `memory-context-architect`
* `mcp-api-architect`
* `hooks-guardrails-engineer`
* `evals-engineer`
* `security-reviewer`
* `implementation-planner`
* `slop-detector`

For each:

* Mission.
* Inputs.
* Outputs.
* Allowed tools.
* Skills to preload.
* Stop condition.
* Handoff format.
* Token/cost risk.
* When not to spawn.

Principle:

> A subagent is justified only if it reduces context collision, enables parallel research, or improves review quality.

---

## 9. MCP and two-way KRN API

Design how KRN API should work with Codex.

Required MCP/API tool candidates:

* `krn.sources.search`
* `krn.sources.upsert`
* `krn.claims.link`
* `krn.memory.query`
* `krn.memory.propose`
* `krn.memory.invalidate`
* `krn.traces.ingest`
* `krn.eval.run`
* `krn.eval.result`
* `krn.goal.status`
* `krn.skill.install`
* `krn.skill.audit`
* `krn.dashboard.event`
* `krn.project.snapshot`
* `krn.decision.log`

For each tool define:

* Purpose.
* Input schema outline.
* Output schema outline.
* Idempotency key.
* Auth/permissions.
* Rate limit.
* Data retention.
* Failure mode.
* Recovery behavior.

Architecture requirements:

* Append-only event log.
* Idempotent writes.
* Schema versioning.
* Local-first cache.
* Explicit provenance for memory and source claims.
* Human approval for destructive/external actions.
* Dashboard as a view over events, decisions, evals and sources, not as a magic brain.

---

## 10. Memory and context strategy

Design multi-layer memory.

Layers:

* Thread context.
* Compacted working state.
* Project artifacts.
* Source-of-truth files.
* Decision log.
* Trace/event memory.
* Long-term workflow memory.
* User preferences.
* External source index.

For each layer define:

* What can be stored there.
* What must not be stored there.
* TTL/staleness policy.
* Invalidation policy.
* Retrieval policy.
* Verification policy.
* Risk of context rot or memory rot.

Hard rule:

> Durable project knowledge belongs in reviewable artifacts such as `docs/plans/first-approach/draft.md`, `SOURCES.md` and decision logs, not only in model memory.

---

## 11. Hooks, rules and guardrails

Design hooks as deterministic safety rails.

Cover:

* Pre-tool checks.
* Post-tool checks.
* Stop/session summary.
* Pre/post compaction checks.
* User prompt submission checks.
* Subagent stop checks.
* Secret scanning.
* Source coverage audit.
* Markdown quality checks.
* Dangerous command blocking.
* Diff-size warnings.
* Unsupported claim checks.
* API event ingestion.

For each hook:

* Event.
* Matcher.
* Action.
* What it enforces.
* What it cannot enforce.
* False-positive risk.
* Recovery path.

Principle:

> Hooks reduce predictable mistakes. They do not replace human review.

---

## 12. Evals and observability

Design evals for the whole product.

Include:

* Micro evals for skills.
* Macro evals for workflows.
* Regression evals for prompt/skill changes.
* Trace-based evals from real Codex sessions.
* Human review rubric.
* LLM judge only as secondary signal.
* Deterministic validators where possible.
* promptfoo or similar tooling as an example.
* Dashboard metrics.

Required metrics:

* Task success rate.
* Test pass rate.
* Rework rate.
* Diff precision.
* Unnecessary changes count.
* Token cost per accepted change.
* Time to verified patch.
* Skill trigger precision/recall.
* Source coverage.
* Unsupported claim count.
* Memory staleness rate.
* Hook catch rate.
* MCP success/failure rate.
* Human intervention rate.
* Slop score.

Define `slop score` as a rubric, not an insult.

Example dimensions:

```markdown
| Dimension | 0 | 1 | 2 |
|---|---|---|---|
| Evidence | sourced | partially sourced | unsupported |
| Specificity | actionable | vague | generic |
| Novelty | product-specific | partly generic | commodity |
| Verification | measurable | weak checks | no checks |
| Architecture | failure-aware | partial risks | happy path only |
```

---

## 13. Prompting and goal strategy

Rewrite the original prompt into a better prompting system.

Explain:

* What was too broad.
* What was valuable.
* What belongs in a goal.
* What belongs in a skill.
* What belongs in a subagent.
* What belongs in evals.
* What should be stored in `SOURCES.md`.
* Why negative prompting is not enough.
* How to prompt Codex for long-running tasks.

Create a reusable goal template:

```markdown
# Goal: <name>

## Outcome

What must exist at the end.

## Context

What is known, what files matter, what assumptions exist.

## Scope

What is in scope and out of scope.

## Sources

What must be checked and how claims are cited.

## Execution plan

Steps with verification.

## Output contract

Files/sections/schemas to produce.

## Quality bar

What makes the result good.

## Stop conditions

When to stop and report a blocker.

## Final response

What to summarize at the end.
```

---

## 14. Roadmap

Create a practical roadmap.

Stages:

* 48-hour research/spec sprint.
* 7-day MVP.
* 30-day alpha.
* 60-day beta.
* 90-day defensible product.
* Long-term moat.

For each stage:

* Deliverables.
* Success metric.
* What not to build yet.
* Kill criteria.
* Required evals.
* Risks.

---

## 15. Final verdict

End `docs/plans/first-approach/draft.md` with a direct verdict:

Choose one:

* Breakthrough.
* Strong wedge, not platform yet.
* Useful internal tool.
* Commodity wrapper.
* Slop.

Include:

* Evidence.
* Counterargument.
* What would change the verdict.
* Minimal experiment to validate.

---

## Anti-slop rules

Do not use these unless backed by evidence:

* revolutionary
* industry-leading
* best-in-class
* unlock productivity
* seamless
* leverage AI
* autonomous magic
* 10x
* breakthrough

Do not propose:

* Memory without invalidation.
* MCP without permissions.
* Subagents without stop conditions.
* Skills without triggers.
* Hooks without false-positive analysis.
* Dashboard without metrics.
* Architecture without failure modes.
* Claims without sources.
* Roadmap without kill criteria.

Prefer short, specific writing.

If a section becomes generic, rewrite it.

---

## Success gates

The task is complete only if:

* `docs/plans/first-approach/draft.md` is updated.
* `SOURCES.md` is updated.
* At least 30 sources are indexed, unless research is blocked.
* At least 15 sources are official, primary or A-tier, unless blocked.
* `docs/plans/first-approach/draft.md` contains at least 30 FAQ questions.
* `docs/plans/first-approach/draft.md` contains at least 18 paradoxes.
* `docs/plans/first-approach/draft.md` contains at least 6 Mermaid diagrams.
* `docs/plans/first-approach/draft.md` contains a product architecture by layers.
* `docs/plans/first-approach/draft.md` contains a `krn init` specification.
* `docs/plans/first-approach/draft.md` contains skills architecture with valid `SKILL.md` guidance.
* `docs/plans/first-approach/draft.md` explicitly says XML must not be used in YAML frontmatter.
* `docs/plans/first-approach/draft.md` contains subagent architecture.
* `docs/plans/first-approach/draft.md` contains MCP/API architecture.
* `docs/plans/first-approach/draft.md` contains memory/context strategy.
* `docs/plans/first-approach/draft.md` contains hooks/guardrails strategy.
* `docs/plans/first-approach/draft.md` contains evals and observability framework.
* `docs/plans/first-approach/draft.md` ends with a direct breakthrough/slop verdict.
* Major claims reference `[S-###]`, `[LOCAL-###]` or `[HYPOTHESIS]`.
* Unsupported hype language is removed.

---

## Final response contract

At the end, report only:

1. Files changed.
2. Final verdict in one paragraph.
3. Success gates passed/failed.
4. Top 5 decisions.
5. Top 5 risks.
6. Commands/checks run.
7. Blockers or missing research.

Do not paste the whole document into the final response.
