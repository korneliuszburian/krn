# SOURCES.md

## Method

- Access date: 2026-06-19.
- Research scope: Codex CLI-first product architecture for `krn-gas-town` / `krn init`, with comparisons to Claude Code, Cursor, Aider, Cline/Roo, LangGraph/LangSmith, promptfoo, MCP, Agent Skills and current software-agent papers.
- Trust tiers:
  - A: primary official docs, official specs, official repositories, peer-reviewed or arXiv papers.
  - B: credible practitioner writing by named builders or official project blogs.
  - C: market commentary, secondary analysis, community pattern reports.
  - D: weak trend signals only.
- Evidence rule: product decisions in `docs/plans/second-approach/draft.md` should cite `[S###]`, `[LOCAL###]`, or be marked `[HYPOTHESIS]`.
- Known gaps: Codex Desktop `26.616` was not verified locally; several named practitioner perspectives are available mostly as talks, interviews, or secondary posts, so they are treated as pattern signals rather than proof.

## Local evidence

### [LOCAL001] - Current workspace shape

- Evidence: `find . -maxdepth 5` showed only `AGENTS.md`, two goal docs, and two draft docs; `AGENTS.md` is empty; no `.codex/`, `.mcp/`, `SOURCES.md`, package files, or product code were present before this pass.
- Product implication: this task is documentation/research only; `krn init` is a planned product surface, not an existing implementation in this repo.

### [LOCAL002] - Local Codex CLI version

- Evidence: `codex --version` returned `codex-cli 0.141.0`.
- Product implication: the user's assumed Codex CLI version is locally verified.

### [LOCAL003] - App server CLI surface

- Evidence: `codex app-server --help` exposed `daemon`, `proxy`, `generate-ts`, `generate-json-schema`, stdio/unix/ws transports and WebSocket auth flags.
- Product implication: a future KRN dashboard or control plane can be designed around app-server protocol generation, but should treat it as experimental where docs say so.

### [LOCAL004] - Git status unavailable

- Evidence: `git status --short` failed with `fatal: not a git repository`.
- Product implication: this planning checkout has no git metadata; rollback/merge rules in the product plan must not assume git is always available during initialization.

## Source index

### [S001] - OpenAI Codex manual

- URL: https://developers.openai.com/codex/codex-manual.md
- Type: official docs
- Date accessed: 2026-06-19
- Sector: Codex CLI, app, skills, subagents, MCP, hooks, memories, permissions, app-server
- Reliability: high
- Key claims supported: Codex has multiple surfaces; customization layers include `AGENTS.md`, skills, MCP, subagents, hooks, memories, config and app-server; feature maturity varies by surface.
- Notes / caveats: fetched through the `openai-docs` helper; exact product surface can still change after access date.

### [S002] - OpenAI Codex CLI slash commands

- URL: https://developers.openai.com/codex/cli/slash-commands
- Type: official docs
- Date accessed: 2026-06-19
- Sector: Codex CLI, goals, permissions, skills, MCP, hooks, memory, subagents
- Reliability: high
- Key claims supported: CLI commands include `/goal`, `/plan`, `/skills`, `/mcp`, `/hooks`, `/memories`, `/agent`, `/permissions`, `/status`, `/debug-config`, `/diff`, `/review`, `/compact`, `/import`, `/init`.
- Notes / caveats: command availability can vary by session mode and feature flags.

### [S003] - OpenAI Codex customization

- URL: https://developers.openai.com/codex/concepts/customization
- Type: official docs
- Date accessed: 2026-06-19
- Sector: AGENTS.md, skills, MCP, subagents, memory
- Reliability: high
- Key claims supported: OpenAI recommends building customization in layers: `AGENTS.md`, reusable skills, MCP for external systems, then subagents for noisy/specialized delegation.
- Notes / caveats: does not prescribe a third-party product architecture; KRN decisions are derived.

### [S004] - OpenAI Agent Skills for Codex

- URL: https://developers.openai.com/codex/skills
- Type: official docs
- Date accessed: 2026-06-19
- Sector: skills
- Reliability: high
- Key claims supported: skills are available in CLI, IDE extension and app; they use progressive disclosure; initial skill metadata has a context budget; skills can be explicit or implicit; `SKILL.md` needs `name` and `description`; optional scripts/references/assets and `agents/openai.yaml` are supported.
- Notes / caveats: trigger reliability depends heavily on descriptions and installed skill volume.

### [S005] - OpenAI Codex subagents

- URL: https://developers.openai.com/codex/subagents
- Type: official docs
- Date accessed: 2026-06-19
- Sector: subagents
- Reliability: high
- Key claims supported: Codex subagents can run specialized work in parallel, consume more tokens, require explicit spawning, inherit sandbox/approval settings, and can be defined under `.codex/agents/` or `~/.codex/agents/`.
- Notes / caveats: IDE visibility was documented as not yet complete at access date.

### [S006] - OpenAI Codex hooks

- URL: https://developers.openai.com/codex/hooks
- Type: official docs
- Date accessed: 2026-06-19
- Sector: hooks, security, observability
- Reliability: high
- Key claims supported: hooks can run command handlers on lifecycle events; hooks are discovered in user/project config layers; non-managed command hooks require trust review; supported events include `SessionStart`, `PreToolUse`, `PermissionRequest`, `PostToolUse`, `PreCompact`, `PostCompact`, `UserPromptSubmit`, `SubagentStart`, `SubagentStop`, `Stop`.
- Notes / caveats: docs explicitly describe current limitations, including incomplete interception of some shell/tool paths.

### [S007] - OpenAI Codex MCP

- URL: https://developers.openai.com/codex/mcp
- Type: official docs
- Date accessed: 2026-06-19
- Sector: MCP, external tools, config
- Reliability: high
- Key claims supported: Codex supports MCP servers in CLI and IDE; config lives in `config.toml`; MCP servers expose tools/resources/prompts and can use STDIO or streamable HTTP with auth and tool approval policies.
- Notes / caveats: tool safety depends on server trust and approval configuration.

### [S008] - OpenAI Codex App Server

- URL: https://developers.openai.com/codex/app-server
- Type: official docs
- Date accessed: 2026-06-19
- Sector: app server, dashboard, API, traces
- Reliability: high
- Key claims supported: app-server exposes JSON-RPC thread/turn/event primitives, app/connectors, skills, plugins, MCP server status/tool calls, config reads/writes, auth state and token usage; WebSocket transport is experimental and needs auth before remote exposure.
- Notes / caveats: docs recommend Codex SDK rather than app-server for CI automation.

### [S009] - OpenAI Using Goals in Codex

- URL: https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- Type: cookbook
- Date accessed: 2026-06-19
- Sector: goals, execution contracts
- Reliability: high
- Key claims supported: Goals are persistent thread objectives with outcome, verification surface, constraints, boundaries, iteration policy and blocked stop condition; completion should be evidence-based.
- Notes / caveats: cookbook pattern, not a product guarantee for all future Codex builds.

### [S010] - OpenAI memory and compaction cookbook

- URL: https://developers.openai.com/cookbook/examples/agents_sdk/building_reliable_agents_memory_compaction
- Type: cookbook
- Date accessed: 2026-06-19
- Sector: memory, compaction
- Reliability: high
- Key claims supported: reliable long-running agents need explicit state handling, compaction and memory policies rather than unbounded context growth.
- Notes / caveats: Agents SDK examples must be mapped carefully to Codex CLI operations.

### [S011] - OpenAI macro evals for agentic systems

- URL: https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems
- Type: cookbook
- Date accessed: 2026-06-19
- Sector: evals, traces, promptfoo
- Reliability: high
- Key claims supported: agent systems need lower-level and macro-level evals over runs, routing, specialist handoffs, policy correctness and repeated failure patterns.
- Notes / caveats: example domain differs from software engineering, but eval architecture transfers.

### [S012] - OpenAI agent improvement loop

- URL: https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop
- Type: cookbook
- Date accessed: 2026-06-19
- Sector: traces, evals, iterative improvement
- Reliability: high
- Key claims supported: traces, evals, feedback and Codex-ready handoffs can form a repeatable agent improvement loop.
- Notes / caveats: product plan should use this as a loop pattern, not as evidence that any specific KRN metric will improve.

### [S013] - OpenAI PLANS.md / execution plans

- URL: https://developers.openai.com/cookbook/articles/codex_exec_plans
- Type: cookbook
- Date accessed: 2026-06-19
- Sector: planning, long-running execution
- Reliability: high
- Key claims supported: explicit plan artifacts help multi-hour problem solving by externalizing state, decisions and verification.
- Notes / caveats: a plan file is only useful if kept synchronized with work.

### [S014] - OpenAI Structured Outputs

- URL: https://developers.openai.com/api/docs/guides/structured-outputs
- Type: official docs
- Date accessed: 2026-06-19
- Sector: API, schemas, evals
- Reliability: high
- Key claims supported: structured outputs enforce JSON Schema adherence and are preferable to JSON mode when schema correctness matters.
- Notes / caveats: structured outputs still require task decomposition and validation for semantic correctness.

### [S015] - Model Context Protocol specification

- URL: https://modelcontextprotocol.io/specification/2025-06-18
- Type: official spec
- Date accessed: 2026-06-19
- Sector: MCP, security, API
- Reliability: high
- Key claims supported: MCP standardizes host/client/server integration; servers expose resources, prompts and tools; security requires user consent, privacy controls and tool-safety review.
- Notes / caveats: MCP itself cannot enforce all safety principles; implementors must.

### [S016] - Agent Skills specification

- URL: https://agentskills.io/specification
- Type: official spec
- Date accessed: 2026-06-19
- Sector: skills
- Reliability: high
- Key claims supported: Agent Skills define a portable directory/metadata pattern for reusable agent capabilities.
- Notes / caveats: individual host products extend the base standard differently.

### [S017] - Claude Code overview

- URL: https://docs.anthropic.com/en/docs/claude-code/overview
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: market, CLI, IDE, app
- Reliability: high
- Key claims supported: Claude Code is an agentic coding tool across terminal, IDE, desktop app and browser that reads, edits and runs commands.
- Notes / caveats: competitor docs are used for comparison, not as KRN target behavior.

### [S018] - Claude Code memory

- URL: https://docs.anthropic.com/en/docs/claude-code/memory
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: memory
- Reliability: high
- Key claims supported: Claude Code uses a project memory directory with `MEMORY.md` as a concise index; only a bounded portion of the index is loaded at session start, and topic files are read on demand.
- Notes / caveats: this is Claude-specific behavior; KRN can borrow the index-plus-topic pattern.

### [S019] - Claude Code skills

- URL: https://docs.anthropic.com/en/docs/claude-code/skills
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: skills
- Reliability: high
- Key claims supported: Claude Code skills follow the open Agent Skills standard and add host-specific invocation/control features.
- Notes / caveats: exact features are not automatically portable to Codex.

### [S020] - Claude Code subagents

- URL: https://docs.anthropic.com/en/docs/claude-code/sub-agents
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: subagents
- Reliability: high
- Key claims supported: Claude subagents have distinct context behavior, optional preloaded skills, and resumability constraints.
- Notes / caveats: comparison helps expose subagent context risks.

### [S021] - Claude Code hooks guide/reference

- URL: https://docs.anthropic.com/en/docs/claude-code/hooks-guide
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: hooks
- Reliability: high
- Key claims supported: hooks provide deterministic lifecycle automation for formatting, blocking commands, reinjecting context and notifications; judgment-heavy decisions may need prompt/model hooks.
- Notes / caveats: Claude hook events and Codex hook events differ.

### [S022] - Claude Code settings and plugins

- URL: https://docs.anthropic.com/en/docs/claude-code/settings
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: settings, plugins, subagents
- Reliability: high
- Key claims supported: Claude Code supports user/project/local/managed settings and plugins bundling skills, agents, hooks and MCP servers.
- Notes / caveats: useful as a market pattern, not a Codex implementation guide.

### [S023] - Claude Code MCP

- URL: https://docs.anthropic.com/en/docs/claude-code/mcp
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: MCP, market
- Reliability: high
- Key claims supported: Claude Code connects to external systems through MCP rather than manual copy-paste when tools/data are outside the chat.
- Notes / caveats: tool approval and UX differ from Codex.

### [S024] - Cursor rules

- URL: https://cursor.com/docs/rules
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: rules, market
- Reliability: medium
- Key claims supported: Cursor uses persistent Project, Team and User rules, including `.cursor/rules` and `AGENTS.md` compatibility signals.
- Notes / caveats: page content was available mainly via search-result text; treat details as comparison-level.

### [S025] - Aider repository map

- URL: https://aider.chat/docs/repomap.html
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: context, repo map
- Reliability: high
- Key claims supported: Aider uses concise repository maps with symbols/signatures and graph ranking to fit relevant codebase context into a token budget.
- Notes / caveats: Aider is a different coding agent; KRN should not copy repo-map implementation blindly.

### [S026] - Cline rules

- URL: https://docs.cline.bot/customization/cline-rules
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: rules, market
- Reliability: high
- Key claims supported: Cline rules are persistent Markdown instructions and can recognize `.clinerules`, `.cursorrules`, `.windsurfrules` and `AGENTS.md`.
- Notes / caveats: rule merge semantics are tool-specific.

### [S027] - Roo Code docs

- URL: https://roocodeinc.github.io/Roo-Code/
- Type: market/tool docs
- Date accessed: 2026-06-19
- Sector: market, modes, MCP
- Reliability: medium
- Key claims supported: Roo Code presented modes such as Code, Architect, Ask and Debug, MCP usage and local IDE operation; docs state the extension was shut down on 2026-05-15.
- Notes / caveats: shutdown makes it historical/market-comparison evidence, not a current product dependency.

### [S028] - LangGraph overview and persistence

- URL: https://docs.langchain.com/oss/python/langgraph/overview
- Type: official docs
- Date accessed: 2026-06-19
- Sector: orchestration, memory, persistence
- Reliability: high
- Key claims supported: LangGraph is an orchestration runtime for durable execution, streaming, human-in-the-loop and persistence.
- Notes / caveats: KRN is not proposed as a LangGraph app; these are architecture patterns.

### [S029] - LangGraph interrupts

- URL: https://docs.langchain.com/oss/python/langgraph/interrupts
- Type: official docs
- Date accessed: 2026-06-19
- Sector: human-in-the-loop
- Reliability: high
- Key claims supported: interrupts pause execution, persist state and wait for external input before continuation.
- Notes / caveats: maps to KRN human review gates, not Codex internals.

### [S030] - LangSmith evaluation docs

- URL: https://docs.langchain.com/langsmith/evaluation
- Type: official docs
- Date accessed: 2026-06-19
- Sector: evals, traces
- Reliability: high
- Key claims supported: evaluation workflows use datasets, evaluators, experiments, traces and human/LLM/code-rule scoring.
- Notes / caveats: KRN can implement lighter local equivalents before a dashboard.

### [S031] - promptfoo intro and assertions

- URL: https://www.promptfoo.dev/docs/intro/
- Type: official docs
- Date accessed: 2026-06-19
- Sector: evals, red teaming
- Reliability: high
- Key claims supported: promptfoo is an open-source CLI/library for evaluating and red-teaming LLM apps, with assertions and matrix comparisons.
- Notes / caveats: promptfoo evaluates configured scenarios; it does not guarantee real-world agent quality alone.

### [S032] - promptfoo coding-agent evals

- URL: https://www.promptfoo.dev/docs/guides/evaluate-coding-agents/
- Type: official docs
- Date accessed: 2026-06-19
- Sector: evals, coding agents
- Reliability: high
- Key claims supported: coding agents require different evaluation than one-shot LLM output because they read code, run commands, use tools and iterate.
- Notes / caveats: useful for KRN `krn eval run` design.

### [S033] - SWE-bench

- URL: https://arxiv.org/abs/2310.06770
- Type: paper
- Date accessed: 2026-06-19
- Sector: papers, evals, software agents
- Reliability: high
- Key claims supported: SWE-bench evaluates issue-resolution patches on real GitHub problems.
- Notes / caveats: public benchmarks can drift or be contaminated; should not be the only internal eval.

### [S034] - SWE-agent: Agent-Computer Interfaces Enable Automated Software Engineering

- URL: https://arxiv.org/abs/2405.15793
- Type: paper
- Date accessed: 2026-06-19
- Sector: papers, agent-computer interfaces
- Reliability: high
- Key claims supported: agent performance depends on the interface/tools exposed to the model, not only model capability.
- Notes / caveats: KRN should treat CLI/API/tooling shape as a product surface.

### [S035] - SWE-Bench Pro

- URL: https://arxiv.org/abs/2509.16941
- Type: paper
- Date accessed: 2026-06-19
- Sector: papers, long-horizon software agents
- Reliability: high
- Key claims supported: more realistic long-horizon SWE tasks remain challenging and require substantial repository-level reasoning.
- Notes / caveats: external benchmark; not a replacement for KRN task traces.

### [S036] - Context Management for Long-Horizon SWE-Agents

- URL: https://arxiv.org/html/2512.22087v1
- Type: paper
- Date accessed: 2026-06-19
- Sector: context, memory, long-horizon agents
- Reliability: high
- Key claims supported: structured context workspaces with stable task semantics, condensed memory and high-fidelity recent interactions can help long-horizon SWE agents.
- Notes / caveats: paper claims require independent validation before becoming product promises.

### [S037] - Reflexion: Language Agents with Verbal Reinforcement Learning

- URL: https://arxiv.org/abs/2303.11366
- Type: paper
- Date accessed: 2026-06-19
- Sector: memory, feedback loops
- Reliability: high
- Key claims supported: verbal reflection stored as episodic memory can improve later decision-making in agent tasks.
- Notes / caveats: useful pattern for retrospectives, but memory can rot without invalidation.

### [S038] - MCP Workflow Engine

- URL: https://arxiv.org/abs/2605.00827
- Type: paper
- Date accessed: 2026-06-19
- Sector: MCP, workflows, token efficiency
- Reliability: medium
- Key claims supported: separating intelligence from deterministic MCP workflow execution can reduce repeated tool-call reasoning cost.
- Notes / caveats: recent preprint; product plan should treat it as a hypothesis-generating pattern.

### [S039] - Simon Willison: How coding agents work

- URL: https://simonwillison.net/guides/agentic-engineering-patterns/how-coding-agents-work/
- Type: expert essay
- Date accessed: 2026-06-19
- Sector: practitioner-pattern, coding agents
- Reliability: medium
- Key claims supported: coding agents are LLM harnesses with tools, hidden prompts and execution capability; understanding harness mechanics helps use them responsibly.
- Notes / caveats: expert pattern source, not controlled evidence.

### [S040] - Simon Willison: Agentic Engineering Patterns

- URL: https://simonwillison.net/guides/agentic-engineering-patterns/
- Type: expert essay
- Date accessed: 2026-06-19
- Sector: practitioner-pattern
- Reliability: medium
- Key claims supported: practical coding-agent work depends on patterns around examples, verification, task framing and tool use.
- Notes / caveats: used as pattern vocabulary.

### [S041] - Addy Osmani: My LLM coding workflow going into 2026

- URL: https://addyosmani.com/blog/ai-coding-workflow/
- Type: expert essay
- Date accessed: 2026-06-19
- Sector: practitioner-pattern, review, workflow
- Reliability: medium
- Key claims supported: disciplined AI-assisted engineering keeps humans accountable for architecture, quality and review.
- Notes / caveats: practitioner view, not a benchmark.

### [S042] - Addy Osmani: The future of agentic coding

- URL: https://addyosmani.com/blog/future-agentic-coding/
- Type: expert essay
- Date accessed: 2026-06-19
- Sector: market, orchestration
- Reliability: medium
- Key claims supported: agentic coding shifts some engineer work from direct implementation toward orchestration/review.
- Notes / caveats: market framing, not product proof.

### [S043] - Matt Pocock dictionary of AI coding

- URL: https://github.com/mattpocock/dictionary-of-ai-coding
- Type: repo
- Date accessed: 2026-06-19
- Sector: market vocabulary
- Reliability: medium
- Key claims supported: AI coding has emerging vocabulary around context degradation, sandboxing, tool use, and prompt/system surfaces.
- Notes / caveats: vocabulary source, not efficacy evidence.

### [S044] - Matt Pocock Skills for Real Engineers

- URL: https://github.com/mattpocock/skills
- Type: repo
- Date accessed: 2026-06-19
- Sector: skills, practitioner-pattern
- Reliability: medium
- Key claims supported: practitioner skill collections emphasize real engineering control and avoiding process frameworks that obscure bugs.
- Notes / caveats: repo-level pattern signal; not a controlled study.

### [S045] - LangChain: The rise of context engineering

- URL: https://www.langchain.com/blog/the-rise-of-context-engineering
- Type: expert / official project blog
- Date accessed: 2026-06-19
- Sector: context engineering
- Reliability: medium
- Key claims supported: context engineering means dynamically giving the model the right information, tools and format for the task.
- Notes / caveats: conceptual framing from a framework vendor.

### [S046] - Andrej Karpathy: Software Is Changing Again

- URL: https://www.youtube.com/watch?v=LCEmiRjPEtQ
- Type: expert talk
- Date accessed: 2026-06-19
- Sector: market, software 3.0, agentic coding
- Reliability: medium
- Key claims supported: software work is shifting toward natural-language interaction with programmable AI systems.
- Notes / caveats: video/talk source; use only as strategic framing, not exact product evidence.

## Claim ledger

| Claim ID | Claim | Source IDs | Evidence grade | Used for decision? | Risk if wrong |
|---|---|---|---|---|---|
| C001 | Codex CLI has native primitives relevant to `krn init`: `/goal`, `/skills`, `/mcp`, `/hooks`, `/agent`, `/memories`, `/permissions`, `/status`. | S002 | A | Yes | Product duplicates native behavior instead of wiring it. |
| C002 | Skills use progressive disclosure and can be repo-scoped under `.agents/skills`. | S004 | A | Yes | Skill library bloats context or installs in wrong place. |
| C003 | Subagents consume extra tokens and should be explicit/narrow. | S005 | A | Yes | KRN overuses parallelism and becomes expensive/unpredictable. |
| C004 | Hooks are deterministic but incomplete as a security boundary. | S006 | A | Yes | KRN overclaims enforcement. |
| C005 | MCP is the right standard surface for external context/actions, but requires consent and tool safety. | S007, S015 | A | Yes | KRN exposes unsafe API tools. |
| C006 | Goals should have evidence-based completion criteria. | S009 | A | Yes | Long-running tasks become open-ended backlog. |
| C007 | Agent memory/compaction must be explicit and bounded. | S010, S018, S036 | A | Yes | Memory rot corrupts future runs. |
| C008 | Evals for agents must inspect traces, routing, tool use and repeated failure patterns. | S011, S012, S030, S032 | A | Yes | KRN builds eval theatre. |
| C009 | Repository maps and selective context are better than dumping whole repos into prompts. | S025 | A | Yes | Context rot and token waste. |
| C010 | Market tools already provide rules, skills, hooks, MCP, memory or modes. | S017-S027 | A/B | Yes | KRN is just a repackaged wrapper. |
| C011 | Agent-computer interface design affects SWE-agent performance. | S034 | A | Yes | KRN underinvests in CLI/API surface quality. |
| C012 | Public SWE benchmarks are useful but insufficient for internal workflow proof. | S033, S035, S036 | A | Yes | KRN chases leaderboard-shaped quality instead of local outcomes. |
| C013 | Structured outputs help API/event schemas but do not replace semantic validation. | S014 | A | Yes | API writes become invalid or unreviewable. |
| C014 | Dashboard value should come from traces/evals, not vanity metrics. | S011, S012, S030 | A | Yes | Dashboard becomes theater. |
| C015 | Current repo has no product code and no initial source index. | LOCAL001 | A | Yes | Scope accidentally shifts into implementation. |
| C016 | Local Codex CLI version matches `0.141.0`. | LOCAL002 | A | Yes | Version assumptions are wrong. |

## Decision evidence map

| Decision | Source IDs | Local evidence | Confidence | Counterargument | Status |
|---|---|---|---|---|---|
| Optimize for Codex CLI, not a new coding agent. | S001, S002, S003 | LOCAL002 | High | A standalone agent might control UX more tightly. | Accepted |
| `krn init` generates project-local Codex infrastructure and mergeable docs, not product code. | S003, S004, S006, S007 | LOCAL001 | High | A binary-only installer could be simpler. | Accepted |
| Use `AGENTS.md` for durable universal rules and skills only for repeatable workflows. | S003, S004 | LOCAL001 | High | Users may prefer one big skills library. | Accepted |
| Keep subagents narrow, read-only by default, and bounded by max threads/depth. | S005, S020 | none | High | Parallel agents can speed research. | Accepted |
| Use MCP for KRN API read/write tools, not ad hoc shell scripts. | S007, S015, S038 | none | Medium-high | CLI commands are simpler for MVP. | Accepted with MVP fallback |
| Use hooks for deterministic capture/gates, not judgment-heavy review. | S006, S021 | none | High | Hooks can call models in other systems. | Accepted |
| Treat memory as indexed pointers plus invalidation, not automatic truth. | S010, S018, S036, S037 | none | High | More memory feels more helpful. | Accepted |
| Start evals with local trace replay and promptfoo-like assertions. | S011, S012, S031, S032 | none | Medium-high | Full LangSmith-style platform is richer. | Accepted |
| Dashboard comes after trace/eval schema. | S008, S011, S012, S030 | none | High | UI could motivate adoption earlier. | Accepted |
| Breakthrough claim remains falsifiable, not assumed. | S033-S036, S039-S045 | LOCAL001 | High | A strong internal workflow can still be valuable without public novelty. | Accepted |

## Blocked research

| Source/query | Why blocked | Impact |
|---|---|---|
| Codex Desktop app version `26.616` | No local command or installed-app metadata confirmed that version in this workspace. | Draft treats Desktop version as user-provided assumption, not verified fact. |
| Direct Logan Kilpatrick coding-agent workflow source | Search results were weak or indirect for this exact topic. | Do not attribute a concrete coding-agent pattern to Logan; use OpenAI docs/cookbooks instead. |
| Direct Anton Osika engineering-workflow source | Available results were mostly interviews/market articles about Lovable and AI builders. | Treat as market/vibe-coding signal, not architecture evidence. |
| Cursor rules full page extraction | Page content was visible through search snippets, but direct `open` returned no lines. | Cursor comparison stays high-level and avoids fine details not captured. |
| Some OpenAI cookbook pages through Docs MCP | MCP did not fetch all cookbook paths; web open worked. | Source entries cite web-accessed official pages. |

## Source coverage checklist

| Sector | Source IDs | Count | Notes |
|---|---:|---:|---|
| Codex capability surface | S001-S009 | 9 | Strong primary coverage. |
| Memory/context | S010, S018, S025, S036, S037, S045 | 6 | Strong enough for architecture decisions. |
| Skills/subagents/hooks/MCP | S004-S007, S015-S023, S026-S027 | 14 | Strong primary and competitor coverage. |
| API/dashboard/evals | S008, S011-S014, S030-S032 | 8 | Strong for MVP schema/eval plan. |
| Market comparison | S017-S027, S039-S046 | 19 | Mixed official docs and practitioner signals. |
| Papers/benchmarks | S033-S038 | 6 | Enough to frame falsifiable risk, not enough to claim benchmark superiority. |
