# Canonical Sources

Access date: 2026-06-19.

This source index supports the canonical KRN synthesis in the `krn-gas-town` workspace. It intentionally mixes official OpenAI/Codex documentation, OpenAI Cookbook workflows, academic papers/benchmarks, inspected GitHub projects, and practitioner writing. Product decisions should cite source IDs and separate fact, inference, hypothesis, and decision.

## Method

- A-tier: official docs, specs, benchmark pages, primary repos, papers.
- B-tier: reproducible examples, source-backed project documentation, maintained technical docs.
- C-tier: named practitioner essays and workflow posts.
- D-tier: market commentary or social signal only.
- Rule: stars, leaderboard claims, and viral posts are not proof. They are only discovery signals until the mechanism is understood.

## Local Evidence

| ID | Evidence | Product implication |
|---|---|---|
| LOCAL001 | Current checkout contains planning docs and no product implementation. | This pass is architecture/research, not implementation. |
| LOCAL002 | `docs/plans/first-approach/SOURCES.md` and `docs/plans/second-approach/SOURCES.md` are identical. | The canonical plan can reuse the source base without resolving source conflicts. |
| LOCAL003 | The two draft files differ only in the source-index path line. | The canonical plan is a third synthesis, not a simple merge. |
| LOCAL004 | Root `AGENTS.md` was empty before this pass. | It is safe to introduce a small progressive-disclosure entry point. |
| LOCAL005 | `operator-skill-impact` completed a full baseline/explicit live batch; only `research-synthesis` showed positive measured lift on first pass. | Keep the P1 skills, but do not claim productivity improvement without repeated deltas and review-burden evidence. |
| LOCAL006 | `docs/specs/product-spine/` defines eight product-spine object schemas, real examples, one known-bad fixture, and `.krn/specs/product-spine/20260619T124200342866Z-700904/report.json` shows 17/17 checks passing. | API/MCP, runtime skills, and dashboard work can now target validated objects instead of raw markdown. |
| LOCAL007 | `docs/specs/technology-stack/decision.md` documents a proposed TypeScript-first product stack on the Node.js runtime and stops the implicit Python default in `goal-005`. | `krn init --dry-run` should resume only after stack acceptance and should not add new Python product code. |
| LOCAL008 | `docs/product/final-product-plan.md` and `docs/goals/goal-006.md` define one final-product architecture executed through three dependency-ordered slices, and supersede `goal-005` as the active direction. | Future `/goal` runs should start with Slice 1 Operator Build System; `krn init --dry-run` is Slice 2 context, not the whole product plan. |
| LOCAL009 | `packages/cli/src/main.ts`, `packages/evals/src/validate-krn-init.ts`, and `docs/specs/krn-init/` implement the first TypeScript `krn init --dry-run` runtime slice; `.krn/evals/krn-init-contracts/20260619T215145Z-1670128/report.json` shows 3/3 cases and 8/8 assertions passing. | Slice 2 has a typed init CLI/eval path, but this still does not prove write-mode safety or productivity lift. |
| LOCAL010 | `packages/contracts/src/doctor-report.ts`, `packages/cli/src/main.ts`, `packages/evals/src/validate-krn-doctor.ts`, and `docs/specs/krn-doctor/` implement `krn doctor`; `.krn/evals/krn-doctor-contracts/20260619T215147Z-1670172/report.json` shows 3/3 cases and 7/7 assertions passing. | Slice 2 has a schema-backed readiness report for AGENTS, memory, skills, hooks, evals, and runtime surfaces. |
| LOCAL011 | `packages/contracts/src/eval-report.ts`, `packages/cli/src/main.ts`, `packages/evals/src/validate-krn-eval.ts`, and `docs/specs/krn-eval/` implement `krn eval`; `.krn/evals/krn-eval-contracts/20260619T215144Z-1670039/report.json` shows 3/3 cases and 7/7 assertions passing, and `.krn/eval/20260619T215520Z-1674196/report.json` aggregates 3/3 modules, 9/9 cases, and 23/23 assertions. | Slice 2 has a schema-backed eval aggregation report, but green deterministic modules still do not prove productivity lift or unblock dashboard/API/MCP by themselves. |
| LOCAL012 | `packages/contracts/src/review-report.ts`, `packages/cli/src/main.ts`, `packages/evals/src/validate-krn-review.ts`, and `docs/specs/krn-review/` implement `krn review`; `.krn/evals/krn-review-contracts/20260619T215524Z-1674391/report.json` shows 3/3 cases and 8/8 assertions passing, and `.krn/review/20260619T215617Z-1675416/report.json` is `ready_for_human_review` with 3/3 artifacts present and 2 proposal-only proposals. | Slice 2 now has a proposal-only review report over typed runtime evidence; Slice 3 can start only as read-only/proposal-only control-plane work over these reports. |

## Source Index

| ID | Tier | Sector | Source | Use / caveat |
|---|---|---|---|---|
| S001 | A | Codex | OpenAI Codex manual, https://developers.openai.com/codex/codex-manual.md | Primary Codex surface map. Product docs can change. |
| S002 | A | Codex CLI | Slash commands, https://developers.openai.com/codex/cli/slash-commands | `/goal`, `/plan`, `/skills`, `/mcp`, `/hooks`, `/memories`, `/agent`, `/status`. |
| S003 | A | Customization | Codex customization, https://developers.openai.com/codex/concepts/customization | Layering of AGENTS, skills, MCP, subagents, memory. |
| S004 | A | Skills | Agent Skills, https://developers.openai.com/codex/skills | Progressive disclosure, trigger descriptions, repo/user/admin/system skill locations. |
| S005 | A | Subagents | Codex subagents, https://developers.openai.com/codex/subagents | Explicit spawn, token cost, depth/thread controls, custom agent schema. |
| S006 | A | Hooks | Codex hooks, https://developers.openai.com/codex/hooks | Hook events, trust review, matcher behavior, PreCompact/PostCompact. |
| S007 | A | MCP | Codex MCP, https://developers.openai.com/codex/mcp | MCP resources/tools/prompts, config, auth, approvals. |
| S008 | A | Dashboard/API | Codex app server, https://developers.openai.com/codex/app-server | Later dashboard/control-plane integration; not MVP dependency. |
| S009 | A | Automation | Codex non-interactive mode, OpenAI manual section | `codex exec --json`, `--output-schema`, CI worker semantics. Not a continuous Goal loop. |
| S010 | A | Goals | Using Goals in Codex, https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex | Goal contract: outcome, evidence, constraints, boundaries, iteration policy, blocked condition. |
| S011 | A | Plans | PLANS.md for multi-hour work, https://developers.openai.com/cookbook/articles/codex_exec_plans | Self-contained living plan pattern. |
| S012 | A | Modernization | Code modernization with Codex, https://developers.openai.com/cookbook/examples/codex/code_modernization | Pilot flow, ExecPlan, overview, design, validation, parity. |
| S013 | A | Repair loops | Iterative repair loops, https://developers.openai.com/cookbook/examples/codex/build_iterative_repair_loops_with_codex | Review/repair/validate records and stop conditions. |
| S014 | A | Evals | OpenAI Evals to Promptfoo, https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo | Portable eval configs in repo/CI. |
| S015 | A | Improvement | Agent improvement loop, https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop | Trace -> feedback -> eval -> Codex implementation handoff. |
| S016 | A | Macro evals | Macro evals for agentic systems, https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems | Evaluate routes, tools, decisions, changing conditions, not only final answer. |
| S017 | A | Context | Reliable agents with memory and compaction, https://developers.openai.com/cookbook/examples/agents_sdk/building_reliable_agents_memory_compaction | Separates compaction from durable memory. |
| S018 | A | Orchestration | Codex CLI with Agents SDK, https://developers.openai.com/cookbook/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk | Codex as MCP server inside harness. Later option. |
| S019 | A | Prompting | Codex prompting guide, https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide | AGENTS.md loading, prompt structure, coding-agent prompting. |
| S020 | A | CI | Codex autofix GitHub Actions, https://developers.openai.com/cookbook/examples/codex/autofix-github-actions | Safe CI patch generation pattern. |
| S021 | A | SDK | Build code review with Codex SDK, https://developers.openai.com/cookbook/examples/codex/build_code_review_with_codex_sdk | Structured review output and downstream action pattern. |
| S022 | A | Protocol | Model Context Protocol, https://modelcontextprotocol.io/ | External context/action protocol. Consent and safety must be product-owned. |
| S023 | A | Memory | MemGPT, https://arxiv.org/abs/2310.08560 | Virtual context and self-managed memory lineage. |
| S024 | A | Memory | Letta, https://github.com/letta-ai/letta | MemGPT lineage in product/runtime form. Inspect before adoption. |
| S025 | A | Memory | Mem0, https://arxiv.org/abs/2504.19413 | Extract/consolidate/retrieve memory, graph variant, latency/token claims. |
| S026 | A | Memory graph | Zep temporal KG, https://arxiv.org/abs/2501.13956 | Temporal graph memory for conversations/business data. |
| S027 | A | Memory graph | Graphiti, https://github.com/getzep/graphiti | Open-source temporal graph engine. |
| S028 | A | Memory benchmark | LongMemEval, https://arxiv.org/abs/2410.10813 | Tests extraction, multi-session reasoning, temporal reasoning, updates, abstention. |
| S029 | A | Agent memory benchmark | LongMemEval-V2, https://arxiv.org/abs/2605.12493 | Environment-experience memory and AgentRunbook-C pattern. |
| S030 | A | Memory | A-MEM, https://arxiv.org/abs/2502.12110 | Zettelkasten-like dynamic indexing/linking/evolution. |
| S031 | A | Memory | Hindsight, https://arxiv.org/abs/2512.12818 | Retain/recall/reflect and separating facts, experiences, entity summaries, beliefs. |
| S032 | A | Memory benchmark | BEAM/LIGHT, https://arxiv.org/abs/2510.27246 | Million-token memory benchmark and episodic/working/scratchpad memory. |
| S033 | B | Memory project | MemPalace, https://github.com/mempalace/mempalace | Local-first, verbatim storage, spatial metaphor; claims need replication. |
| S034 | A | Memory critique | Critical MemPalace analysis, https://arxiv.org/abs/2604.21284 | Separates spatial metaphor from embedding/verbatim mechanics. |
| S035 | A | Memory lineage | Generative Agents, https://arxiv.org/abs/2304.03442 | Observation/reflection/planning memory architecture lineage. |
| S036 | A | Memory benchmark | MemoryAgentBench, https://arxiv.org/abs/2507.05257 | Incremental multi-turn memory-agent evaluation. |
| S037 | A | Memory benchmark | Evo-Memory, https://arxiv.org/abs/2511.20857 | Self-evolving memory under streaming task experience. |
| S038 | A | Memory benchmark | MemoryArena, https://memoryarena.github.io/ | Multi-session agent-memory-environment loop benchmark. |
| S039 | A | Memory policy | AgeMem, https://arxiv.org/abs/2601.01885 | Memory operations as tool-based actions; risky if unmanaged. |
| S040 | A | Survey | Memory in the Age of AI Agents, https://arxiv.org/abs/2512.13564 | Taxonomy for agent memory forms/functions/dynamics. |
| S041 | A | ACI | SWE-agent, https://arxiv.org/abs/2405.15793 | Agent-computer interface matters for coding performance. |
| S042 | A | Benchmark | SWE-bench Verified, https://www.swebench.com/verified.html | Human-validated 500-task subset. |
| S043 | A | Benchmark | SWE-bench leaderboard, https://www.swebench.com/ | Public leaderboard signal; not local product proof. |
| S044 | A | Benchmark | SWE-Bench Pro, https://arxiv.org/abs/2509.16941 | Long-horizon enterprise tasks; current agents still weak. |
| S045 | A | Benchmark | Terminal-Bench, https://arxiv.org/abs/2601.11868 | Hard realistic terminal tasks with verification harness. |
| S046 | A | Benchmark | SWE-Marathon, https://arxiv.org/html/2606.07682v1 | Ultra-long tasks and multi-layer verification; current frontier below 30%. |
| S047 | A | Tool use | ReAct, https://arxiv.org/abs/2210.03629 | Reasoning/action interleaving lineage. |
| S048 | A | Tool use | Toolformer, https://arxiv.org/abs/2302.04761 | Model/tool-use lineage, not direct product template. |
| S049 | A | Self-improvement | Reflexion, https://arxiv.org/abs/2303.11366 | Verbal feedback and episodic reflection buffer. |
| S050 | A | Self-improvement | Self-Refine, https://arxiv.org/abs/2303.17651 | Generate/feedback/refine loop without training. |
| S051 | A | Skills | Voyager, https://arxiv.org/abs/2305.16291 | Skill library, automatic curriculum, execution feedback. |
| S052 | A | Prompt optimization | GEPA, https://arxiv.org/abs/2507.19457 | Reflective prompt evolution from trajectories. Needs held-out evals. |
| S053 | A | Eval tool | Promptfoo, https://www.promptfoo.dev/ | Local/CI eval and red-team framework. |
| S054 | B | Observability | LangSmith, https://docs.smith.langchain.com/ | Trace/eval/observability reference. |
| S055 | C | AGENTS.md | AI Hero AGENTS.md guide, https://www.aihero.dev/a-complete-guide-to-agents-md | Instruction budget and progressive disclosure. Practitioner guidance. |
| S056 | B | Skills | mattpocock/skills, https://github.com/mattpocock/skills | Small real-engineering skills; local clone `/tmp/mattpocock-skills` inspected at commit `6eeb81b`; inspect mechanisms, not stars. |
| S057 | C | Skills | AI Hero 5 agent skills, https://www.aihero.dev/5-agent-skills-i-use-every-day | Grill, TDD, PRD, review workflow patterns. |
| S058 | C | Feedback | AI Hero TypeScript feedback loops, https://www.aihero.dev/essential-ai-coding-feedback-loops-for-type-script-projects | Typecheck/test/pre-commit feedback loops. |
| S059 | B | Sandbox orchestration | mattpocock/sandcastle, https://github.com/mattpocock/sandcastle | Sandboxed agent runs, worktrees, iterations, logs, commits. |
| S060 | C | Practitioner | Simon Willison Agentic Engineering Patterns, https://simonwillison.net/2026/Feb/23/agentic-engineering-patterns/ | Emerging practice catalog. |
| S061 | C | Practitioner | Simon Willison "Writing code is cheap now", https://simonwillison.net/guides/agentic-engineering-patterns/code-is-cheap/ | Parallel agents change tradeoffs; review burden remains. |
| S062 | C | Practitioner | Addy Osmani AI coding workflow, https://addyosmani.com/blog/ai-coding-workflow/ | Plan, chunk, review, test, human accountability. |
| S063 | B | Context engineering | LangChain context engineering, https://www.langchain.com/blog/context-engineering-for-agents | Write/select/compress/isolate context taxonomy. |
| S064 | B | Context engineering | Anthropic context engineering, https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents | Context configuration over prompt wording. |
| S065 | C | AI engineering | Swyx AI Engineer, https://www.latent.space/p/ai-engineer | AI engineering as product/application discipline. |
| S066 | C | Practitioner signal | Karpathy agentic engineering discussion, secondary reports | Use only as cautionary/market vocabulary unless direct source is verified. |
| S067 | A | Competitor | Claude Code memory docs, https://docs.anthropic.com/en/docs/claude-code/memory | Comparator for memory/conventions. |
| S068 | A | Competitor | Claude Code hooks docs, https://docs.anthropic.com/en/docs/claude-code/hooks | Comparator for lifecycle hooks and safety. |
| S069 | A | Competitor | Cursor rules, https://docs.cursor.com/context/rules | Comparator for rule/context system. |
| S070 | A | Competitor | Aider repo map, https://aider.chat/docs/repomap.html | Selective repo context pattern. |
| S071 | A | Competitor | Cline docs, https://docs.cline.bot/ | Comparator for rules, modes, MCP, IDE workflow. |
| S072 | A | Competitor | Roo Code docs, https://docs.roocode.com/ | Comparator for modes/rules/agentic IDE workflow. |
| S073 | A | Open-source agent | OpenHands, https://github.com/All-Hands-AI/OpenHands | Broad agent platform comparator; avoid copying scope. |
| S074 | A | AGENTS.md | AGENTS.md open format, https://agents.md/ | AGENTS.md as predictable README-for-agents; no fixed schema. |
| S075 | C | AGENTS.md | HumanLayer good CLAUDE.md/AGENTS.md, https://www.humanlayer.dev/blog/writing-a-good-claude-md | Less-is-more, universal instructions, progressive disclosure, avoid autogenerated dumps. |
| S076 | B | Agent harness | HumanLayer 12-factor agents, https://github.com/humanlayer/12-factor-agents | Own prompts/context/control flow; useful for KRN harness principles. |
| S077 | B | Skills | OpenAI skills catalog, https://github.com/openai/skills | Confirms Codex skills as folders of instructions/scripts/resources for repeatable tasks. |
| S078 | A | ChatGPT Projects | Projects in ChatGPT, https://help.openai.com/en/articles/10169521-projects-in-chatgpt | Static reviewer workspace with files, instructions, chats, and project memory. |
| S079 | A | GPTs | Creating and editing GPTs, https://help.openai.com/en/articles/8554397-creating-and-editing-gpts | GPT instructions, knowledge files, capabilities, apps, actions, and limits. |
| S080 | A | GPT Actions | Configuring actions in GPTs, https://help.openai.com/en/articles/9442513-configuring-actions-in-gpts | API action path; GPT can use either apps or actions, not both. |
| S081 | A | ChatGPT MCP | Developer mode and MCP apps in ChatGPT, https://help.openai.com/en/articles/12584461-developer-mode-and-mcp-apps-in-chatgpt | Custom MCP apps, plan/workspace controls, read/write action constraints, local-server tunnel caveat. |
| S082 | A | Apps SDK | Connect from ChatGPT, https://developers.openai.com/apps-sdk/deploy/connect-chatgpt | HTTPS `/mcp` connector requirement and local tunnel path. |
| S083 | A | Apps SDK Testing | Test your integration, https://developers.openai.com/apps-sdk/deploy/testing | Tool handler tests, MCP Inspector, golden prompt set, regression checklist. |
| S084 | A | Codex MCP Server | Codex CLI reference, https://developers.openai.com/codex/cli/reference | `codex mcp-server` runs Codex as an MCP server over stdio for other tools. |
| S085 | A | Codex Agents SDK | Use Codex with Agents SDK, https://developers.openai.com/codex/guides/agents-sdk | Codex MCP server inside controlled multi-agent workflow. |
| S086 | A | OpenAI Cookbook | OpenAI Cookbook repository, https://github.com/openai/openai-cookbook | Local source corpus inspected at `/tmp/openai-cookbook`, commit `abd1e28`; use for mechanisms, not bulk memory dumps. |
| S087 | A | OpenAI Cookbook | Related resources, https://developers.openai.com/cookbook/articles/related_resources | Archived discovery index; promote only after primary-source inspection. |
| S088 | B | Experiment loop | karpathy/autoresearch, https://github.com/karpathy/autoresearch | Controlled experiment loop: baseline, one metric, fixed budget, keep/discard. Do not import full autonomy. |
| S089 | B | TypeScript contracts | total-typescript/ts-reset, https://github.com/total-typescript/ts-reset | Unknown-first JSON/fetch typing, strict type-level tests, export-map discipline. Adopt mechanism carefully; global type changes are app/test-layer sensitive. |
| S090 | C | TypeScript education | Total TypeScript TS Reset docs, https://www.totaltypescript.com/ts-reset | Practitioner docs for safer built-in typings. Use as supporting evidence, not sole source. |
| S091 | B | TypeScript evals | mattpocock/evalite, https://github.com/mattpocock/evalite | TypeScript-native local eval files, datasets, tasks, scorers, traces, variants, and UI. Candidate later eval layer. |
| S092 | B | AI coding vocabulary | mattpocock/dictionary-of-ai-coding, https://github.com/mattpocock/dictionary-of-ai-coding | Plain-language vocabulary for harness/context/skills/specs/handoffs. Useful for KRN domain language and anti-jargon docs. |
| S093 | C | Naming / agent discourse | Steve Yegge, Welcome to Gas Town, https://steve-yegge.medium.com/welcome-to-gas-town-4f25ee16dd04 | Origin/reference for Gas Town as AI-agent orchestration discourse; also states the theming started from Mad Max but is loose. |
| S094 | C | Naming / critique | Maggie Appleton, Gas Town's Agent Patterns, https://maggieappleton.com/gastown | Independent synthesis of Gas Town as divisive agent-orchestration/design-fiction signal; useful for not treating the name as a generic brand. |
| S095 | C | Naming / fiction reference | Mad Max Wiki, Gas Town, https://madmax.fandom.com/wiki/Gas_Town | Background for the Mad Max location/theme; not product evidence. |

## Claim Ledger

| Claim ID | Claim | Source IDs | Evidence grade | Used for decision? | Risk if wrong |
|---|---|---|---|---|---|
| C001 | `AGENTS.md` should stay small and use progressive disclosure. | S001, S003, S019, S055, S074, S075 | A/C | yes | Root instructions become context poison. |
| C002 | Skills should be narrow reusable workflows, not one-line rules. | S004, S056, S057 | A/B/C | yes | Skill bloat hurts trigger quality. |
| C003 | Hooks are deterministic lifecycle gates, not semantic truth. | S006, S068 | A | yes | False security and hidden product logic. |
| C004 | MCP/API writes need schemas, approvals, idempotency, and audit. | S007, S022 | A | yes | Unsafe state mutation. |
| C005 | `codex exec` is a worker lane, not a continuous Goal conversation. | S009, S010 | A | yes | Bad autonomy claims and broken handoffs. |
| C006 | Long-running goals need outcome, evidence, constraints, boundaries, iteration policy, and blocker rules. | S010, S011 | A | yes | Endless backlog disguised as autonomy. |
| C007 | Memory must separate source-backed facts from inference/belief and support invalidation. | S025-S040 | A | yes | Memory rot and confident stale claims. |
| C008 | Public benchmark/leaderboard results are not local product proof. | S041-S046 | A | yes | KRN optimizes for irrelevant scoreboard. |
| C009 | Sandboxed worktree execution is a serious pattern for AFK/batch agents. | S020, S045, S059 | A/B | yes | Active checkout mutation and poor auditability. |
| C010 | Dashboard value depends on reviewable operational objects, not charts. | S015, S016, S017, LOCAL001 | A | yes | Vanity dashboard. |
| C011 | Repair loops should stop on pass, max attempts, no delta improvement, or human-review need. | S013 | A | yes | Infinite repair loops. |
| C012 | GitHub-star research is useful only after mechanism-level analysis. | S056, S059, S073 | B/C | yes | Hype-driven architecture. |
| C013 | KRN needs a normalized operator skill pipeline separate from runtime/product skills. | S004, S056, S077 | A/B | yes | Skill library becomes a pile of prompts instead of a build system. |
| C014 | ChatGPT can be a reviewer layer, but live integration needs a project/custom GPT or HTTPS MCP/app gateway, not direct local stdio. | S078-S085 | A | yes | Unsafe or impossible bridge design. |
| C015 | Cookbook links must become mechanism/artifact/eval/failure mappings, not bibliography or copied context. | S010-S021, S086-S087 | A | yes | Memory becomes a link list or context dump. |
| C016 | Autoresearch contributes a controlled metric loop only: baseline, fixed budget, one metric, keep/discard, stop reason. | S088 | B | yes | KRN imports endless autonomous research loops. |
| C017 | Operator skills must be evaluated as interventions against baseline Codex, not accepted because they sound senior. | S004, S014-S016, S056 | A/B | yes | KRN ships a sexy skill pack with no measurable lift. |
| C018 | KRN product implementation should be TypeScript-first on the Node.js runtime because its core surfaces are typed CLI/API/MCP/dashboard/eval contracts, not Python scripts. | S056, S059, S089-S092, LOCAL007 | B/C | yes | A Python-first implementation splits product contracts across languages and weakens long-term dashboard/API/eval cohesion. |
| C019 | KRN should be executed through one final-product plan and three dependency-ordered slices, not PoC/MVP/v1/v2 stages. | C006, C013, C017, C018, LOCAL008 | A/B/local | yes | The repo optimizes for a bootstrap demo and postpones the final standards that make the product defensible. |
| C020 | KRN is the product/tool name; Gas Town is only this repo's codename/reference to the Steve Yegge agent-orchestration discourse and loose Mad Max theming. | S093-S095, LOCAL008 | C/local | yes | The repo accidentally borrows another discourse's brand and creates two product identities. |
| C021 | The first `krn init --dry-run` runtime slice proves a typed bootstrap contract path, not product lift or readiness for dashboard/API/MCP. | C018-C019, LOCAL009 | local | yes | A green CLI/eval run is overclaimed as full product readiness. |
| C022 | `krn doctor` readiness reports prove detection of local KRN surfaces, not semantic hook trust, memory correctness, or control-plane readiness. | C018-C019, LOCAL010 | local | yes | A green doctor report is overclaimed as product readiness or safety proof. |
| C023 | `krn eval` aggregate reports prove deterministic local eval execution and aggregation, not productivity lift, benchmark lift, human review quality, or dashboard/API/MCP readiness. | C018-C019, LOCAL011 | local | yes | A green aggregate eval report is overclaimed as product quality or measured improvement. |
| C024 | `krn review` reports propose human review actions from local runtime artifacts; they do not approve memory/source changes, prove productivity lift, or unblock destructive API/MCP/dashboard behavior. | C018-C019, LOCAL012 | local | yes | Proposal-only output is overclaimed as approved truth or tool-safety proof. |

## Decision Evidence Map

| Decision | Source IDs | Local evidence | Confidence | Counterargument | Status |
|---|---|---|---|---|---|
| KRN identity: operating memory/eval/control plane over Codex | S001-S018, S023-S040 | LOCAL001 | medium | Native Codex plus good docs may be enough. | decision |
| `krn init` is bootstrap, not product itself | S003-S007, S010-S012 | LOCAL001 | high | Simpler CLI-only product may be easier. | decision |
| Root `AGENTS.md` must point to memory index | S001, S003, S055, S074, S075 | LOCAL004 | high | Some rules may be missed if not loaded. | decision |
| PreCompact/PostCompact continuity should be tested | S006, S017 | user requirement | medium | Hooks may not be reliable enough yet. | hypothesis |
| `codex exec` should power eval/worker steps | S009, S013-S015, S020-S021 | none | high | Interactive Goal may be better for ambiguous work. | decision |
| Memory kernel must be source-backed and reviewable | S025-S040 | user dashboard target | high | Adds workflow overhead. | decision |
| Dashboard reads ledgers/events, never invents state | S015-S017 | user image | high | Users may expect live chat/productivity UI. | decision |
| Sandcastle-like sandbox phase belongs in later research | S059 | none | medium | KRN may not need sandbox runner if Codex worktrees suffice. | decision |
| Matt Pocock-style operator pipeline belongs before runtime skill sprawl | S056, S077 | local clone/read | high | KRN may overfit to one practitioner's workflow. | decision |
| Operator skills need static contract gate first and impact gate later | S004, S014-S016, S056 | `.agents/skills` prototype, eval module, LOCAL005 | high | Static checks may create false confidence without live A/B evals. | decision |
| ChatGPT reviewer starts static/read-only, then MCP gateway | S078-S085 | official docs | high | ChatGPT app availability and permissions may vary by plan/workspace. | decision |
| OpenAI Cookbook patterns become memory/eval/artifact contracts | S010-S021, S086-S087 | local clone/read | high | Too much ceremony for early repo. | decision |
| Autoresearch-style metric loop belongs only in eval/repair worker lane | S088 | local clone/read | medium | A broader autonomous research loop might be useful later. | decision |
| Product-spine object contracts must precede API/MCP/dashboard implementation | S007, S014-S016, S022, S041-S046, S078-S085 | LOCAL006 | high | Object contracts may overfit early repo artifacts if not revised after first implementation consumer. | decision |
| TypeScript-first product stack on Node.js runtime before `krn init` implementation | S056, S059, S089-S092 | LOCAL007 | medium | Python is faster for scripts and existing validators already work; Go/Rust may produce stronger binaries later. | proposed |
| Final-product execution replaces bootstrap-only `goal-005` | C006, C013, C017-C019 | LOCAL008 | high | A smaller bootstrap goal may feel faster. | decision |
| First `krn init --dry-run` typed runtime path | C018-C019, C021 | LOCAL009 | medium | One CLI/eval path is still too narrow to unblock dashboard/API/MCP. | decision |
| `krn doctor` readiness report before API/MCP/dashboard work | C018-C019, C022 | LOCAL010 | medium | Readiness detection may be mistaken for semantic correctness. | decision |
| `krn eval` aggregate report before API/MCP/dashboard work | C018-C019, C023 | LOCAL011 | medium | Aggregating deterministic modules may be mistaken for measured product lift. | decision |
| `krn review` proposal-only report before Slice 3 control-plane work | C018-C019, C024 | LOCAL012 | medium | Proposal reports can still be mistaken for approval unless Slice 3 keeps read-only/proposal-only boundaries. | decision |

## Blocked / Future Research

| Source/query | Why blocked | Impact |
|---|---|---|
| General Karpathy "agentic engineering" source | Current pass inspected `autoresearch` directly, but not a broader primary Karpathy essay on agentic engineering. | Use `autoresearch` only for the controlled experiment-loop pattern. |
| Deep GitHub landscape ranking | Needs separate pass with repo inspection, not search snippets. | Add P2 research milestone. |
| Real Codex PreCompact/PostCompact hook behavior | Local script invocation is proven, and a non-test manual compact event with a Codex-shaped `turn_id` was recorded; failure/blocking paths still need testing. | Treat compact hook reliability as partially observed, not fully certified. |
| KRN local benchmark baseline | Product not implemented in this checkout. | Breakthrough verdict remains unproven. |
