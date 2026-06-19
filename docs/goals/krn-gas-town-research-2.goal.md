# GOAL.md — Research-to-Plan Contract for `krn-gas-town`

<role>
You are Codex CLI acting as a research operator, architecture critic, and documentation surgeon.
You are not a hype writer, not a product marketer, and not an implementation bot for this task.
Your job is to transform `docs/plans/second-approach/draft.md` into a sourced, falsifiable, minimalist product plan.
</role>

<primary_task>
Using `docs/plans/second-approach/draft.md` as the starting point, produce a final evidence-backed plan for `krn-gas-town`: a CLI-first product where `krn init` bootstraps project-level Codex infrastructure and connects Codex bidirectionally to our API through skills, subagents, MCP, hooks, memory, evals, traces, and a future dashboard.

The plan must answer:
1. What are the real paradoxes and absurdities of working with Codex CLI / Codex app / Claude Code-like coding agents?
2. Which problems are worth solving, and which are fake complexity?
3. What real patterns from current docs, papers, tooling, and expert practice provide measurable leverage?
4. What should `krn init` generate in a project?
5. How should our API become a real two-way control/context/eval layer for Codex?
6. Are we building a differentiated system, or just repackaging market slop?
</primary_task>

<non_goals>
- Do not implement the product.
- Do not create code unless a tiny script is required only to validate markdown/source consistency.
- Do not add dependencies.
- Do not redesign unrelated repo files.
- Do not produce a generic AI-agent essay.
- Do not praise the idea unless the evidence supports it.
- Do not invent Codex/Claude/Cursor/Aider/Cline capabilities.
</non_goals>

<inputs>
Read first:
- `docs/plans/second-approach/draft.md`

Seed sources to research and index:
- https://developers.openai.com/codex/changelog
- https://developers.openai.com/codex/app/commands#settings
- https://developers.openai.com/codex
- https://developers.openai.com/codex/skills
- https://developers.openai.com/codex/use-cases/follow-goals
- https://developers.openai.com/codex/use-cases/code-migrations
- https://developers.openai.com/codex/use-cases/iterate-on-difficult-problems
- https://developers.openai.com/codex/guides/agents-md
- https://developers.openai.com/codex/workflows
- https://developers.openai.com/codex/cli/slash-commands#set-or-view-a-task-goal-with-goal
- https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex
- https://developers.openai.com/cookbook/examples/agents_sdk/building_reliable_agents_memory_compaction
- https://developers.openai.com/cookbook/examples/agents_sdk/deployment_manager/readme
- https://developers.openai.com/cookbook/examples/partners/macro_evals_for_agentic_systems/macro_evals_for_agentic_systems
- https://developers.openai.com/cookbook/examples/gpt-5/codex_prompting_guide
- https://developers.openai.com/cookbook/articles/codex_exec_plans
- https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop
- https://developers.openai.com/cookbook/examples/responses_api/responses_example
- https://developers.openai.com/cookbook/examples/codex/codex_mcp_agents_sdk/building_consistent_workflows_codex_cli_agents_sdk
- https://developers.openai.com/cookbook/examples/codex/code_modernization
- https://developers.openai.com/cookbook/examples/structured_outputs_intro
- https://developers.openai.com/cookbook/examples/gpt-5/gpt-5_prompting_guide
- https://developers.openai.com/cookbook/examples/chatgpt/workspace_agents/workspace-agents-api-trigger
- https://developers.openai.com/cookbook/examples/evaluation/moving-from-openai-evals-to-promptfoo
- https://github.com/mattpocock/dictionary-of-ai-coding

Also research current primary/official sources for:
- Claude Code: CLAUDE.md/memory, skills, subagents, hooks, settings, SDK, workflows.
- Cursor: rules/project rules and agent workflows.
- Aider: repo map/context strategy.
- Cline/Roo: MCP and agent workflows.
- LangGraph, OpenAI Agents SDK, AutoGen/CrewAI only where relevant to orchestration/evals/memory.
- Papers or doctoral-level work on software agents, memory, context management, retrieval, evals, program repair, long-horizon agents, and human-in-the-loop systems.
- Public writing/patterns from Matt Pocock, Addy Osmani, Andrej Karpathy, Harrison Chase, Simon Willison, Anton Osika, Swyx, Logan Kilpatrick, and adjacent credible builders. Use these as opinion/pattern sources, not as unquestioned authority.
</inputs>

<context_gathering>
Use bounded deep research:
1. Start broad: identify source clusters and current capability surfaces.
2. Fan out only where a source changes a product decision.
3. Prefer primary docs, official changelogs, papers, and runnable examples.
4. Use secondary blogs only for vocabulary, critique, or market patterns.
5. Stop researching a sector when additional sources no longer change the architecture, eval plan, or risk analysis.
6. Never use an unsourced claim as a product decision.
</context_gathering>

<source_policy>
Create or update `SOURCES.md`.

Use stable source IDs:
- `[S001]`, `[S002]`, etc.

Each source entry must include:
- ID
- Title
- URL or bibliographic reference
- Source type: official docs | changelog | cookbook | paper | repo | expert essay | market/tool docs | secondary analysis
- Date accessed
- Sector: goals | prompting | Codex CLI | skills | subagents | hooks | MCP | AGENTS.md | memory | evals | market | papers | security | dashboard | API
- Key claims supported
- Reliability: high | medium | low
- Notes / caveats

Rules:
- Every strong factual claim in `docs/plans/second-approach/draft.md` must cite at least one `[S###]`.
- Every product decision must map to sources or be explicitly marked as a hypothesis.
- Every market comparison must cite current official docs where available.
- No citation laundering: do not cite a source unless you actually read the relevant section.
- Preserve uncertainty. Mark assumptions clearly.
</source_policy>

<research_matrix>
For each sector below, produce: Problem → Real pattern → Product implication → Eval/verification → Failure mode → Kill criterion.

Required sectors:

1. Codex capability surface
- CLI 0.141.0
- Desktop/app 26.616
- `/goal`
- AGENTS.md
- skills
- subagents
- hooks
- MCP
- permissions/sandboxing
- workflows
- non-interactive mode
- SDK/app server/GitHub Action where relevant
- Record & Replay where relevant

2. Agent failure/paradox map
- Autonomy vs safety
- Deep context vs context rot
- Memory usefulness vs memory rot
- Subagents speed vs token/context pollution
- Skills reuse vs skill bloat/trigger drift
- Hooks power vs invisible automation/security risk
- Long-running goals vs open-ended backlog
- Evals as truth vs eval theatre
- API integration vs hidden state
- Dashboard observability vs vanity metrics
- Minimalism vs over-engineered agent platform
- “Breakthrough” vs repackaged market slop

3. Prompting and instruction architecture
- GPT-5/Codex prompting patterns
- XML-style sections for isolation and testability
- Negative prompting
- Output contracts
- Verification loops
- Goal-driven execution
- ExecPlan-style living documents
- Source-backed decision logs

4. Memory/context architecture
- AGENTS.md as durable project guidance
- Skills as progressive disclosure
- Subagents as bounded context isolation
- External memory through our API
- Compaction checkpoints
- Source-of-truth artifacts
- Context pointers instead of dumping everything into prompt
- Memory decay, invalidation, and audit

5. Skills/subagents/hooks architecture
- What should be a skill
- What should be a subagent
- What should be a hook
- What should be an MCP tool
- What must stay human-reviewed
- How to avoid 50 fake “agents”
- How to test skill trigger behavior
- How to version and distribute skills

6. API/MCP two-way architecture
Design how Codex interacts with our API:
- Read project profile, rules, memories, source index, eval results, task history.
- Write traces, decisions, blockers, source additions, eval outcomes, run summaries.
- Request policy/tooling updates from KRN.
- Use MCP for explicit tool/context surfaces.
- Use hooks for deterministic event capture/gates.
- Use dashboard for observability, not for pretending the system is smarter than it is.

7. `krn init` product architecture
Specify what `krn init` should generate:
- Project-level `.codex/config.toml`
- `AGENTS.md` or update strategy
- `.agents/skills/**/SKILL.md`
- `.codex/agents/*.md`
- `.codex/hooks.json`
- MCP server config for KRN API
- `SOURCES.md`
- `docs/ai/` or equivalent knowledge/eval docs
- eval harness scaffold
- trace/event schema
- `krn doctor`
- `krn eval`
- rollback/uninstall story
- global profile story

8. Evals and improvement loop
Define:
- Micro evals: skill trigger, prompt adherence, output schema, file diff discipline.
- Macro evals: repeated agent-run patterns, routing mistakes, unresolved blockers, tool misuse.
- Regression evals: prompt/skill changes do not worsen outcomes.
- Human review gates.
- Promptfoo/OpenAI eval strategy where appropriate.
- Dashboard metrics that actually matter.

9. Market comparison
Compare against:
- Codex native
- Claude Code native
- Cursor rules/workflows
- Aider repo map
- Cline/Roo MCP style
- LangGraph/Agents SDK frameworks where relevant
- Existing “AI coding workflow” repos/templates/plugins

For each: what they solve, what remains unsolved, and where KRN could be meaningfully different.
</research_matrix>

<architecture_graphs>
`docs/plans/second-approach/draft.md` must include Mermaid diagrams for:

1. Capability graph:
User → Codex CLI/App → AGENTS.md → Skills → Subagents → MCP → Hooks → KRN API → Dashboard/Evals/Memory.

2. `krn init` file graph:
What files are generated, what is global, what is project-local, what is git-tracked, what is secret/local.

3. Runtime sequence:
User prompt → Codex goal → skill selection → subagent delegation → MCP/API calls → hooks/events → eval gates → dashboard trace → source/memory update.

4. Memory graph:
Parametric knowledge vs context vs AGENTS.md vs skills vs subagent memory vs KRN external memory vs SOURCES.md source-of-truth.

5. Eval loop graph:
Traces → human/model feedback → eval definitions → regression runs → ranked fixes → Codex handoff → review → release.

6. Threat/failure graph:
Unsafe command, stale memory, bad source, over-broad skill, runaway subagents, fake eval pass, dashboard metric gaming.
</architecture_graphs>

<output_contract>
Rewrite `docs/plans/second-approach/draft.md` into a polished final planning document in Polish.

Required structure:

# `krn-gas-town` / `krn init` — evidence-backed product plan

## 1. Executive thesis
- One-page verdict.
- What the product is.
- What it is not.
- Why now.
- Breakthrough vs slop verdict with confidence level.

## 2. Product principle
- “Minimal Karpathy-style leverage, not agent cosplay.”
- Every feature must map to a real Codex pain and measurable improvement.

## 3. Mega FAQ
Large FAQ answering practical, architectural, market, safety, eval, API, and workflow questions.
Every answer must cite sources or mark itself as hypothesis.

## 4. Paradoxes of Codex / Claude Code work
Table:
Paradox | Why it happens | Current workaround | KRN opportunity | Evidence | Risk.

## 5. Research map
Sectors, source clusters, and what changed our thinking.

## 6. Codex capability model
Explain `/goal`, AGENTS.md, skills, subagents, hooks, MCP, permissions, workflows, CLI/app split.

## 7. `krn init` architecture
Generated files, config hierarchy, global/project/local split, bootstrap flow, rollback.

## 8. Skills architecture
Which skills exist, why each exists, trigger rules, XML structure, tests, anti-bloat rules.

## 9. Subagent architecture
Which subagents exist, why each is narrow, max parallelism, no context pollution, handoff contracts.

## 10. MCP/API architecture
Bidirectional API design, tool schemas, event model, source/memory/eval endpoints, auth/security.

## 11. Hooks architecture
Allowed hooks, blocked hooks, safety review, deterministic gates, logging, eval triggers.

## 12. Memory/context architecture
Layered memory, compaction, source of truth, invalidation, memory audit, memory rot prevention.

## 13. Evals and improvement loop
Micro evals, macro evals, Promptfoo/OpenAI evals, human gates, trace review, CI/dashboard integration.

## 14. Dashboard plan
What the dashboard shows, what it must not pretend to know, real metrics, anti-vanity metrics.

## 15. Market comparison
Table comparing KRN against native Codex, Claude Code, Cursor, Aider, Cline/Roo, and framework/template approaches.

## 16. Roadmap
MVP → V1 → V2.
Each milestone must include:
- user-visible value
- files/components
- eval gate
- risk
- kill criterion

## 17. Open questions and assumptions
Separate unknowns from decisions.

## 18. Decision log
Decision | Rationale | Sources | Alternatives rejected | Confidence.

## 19. Source coverage checklist
Summarize source counts by sector and gaps.
</output_contract>

<xml_structure_policy>
When proposing skills, subagents, or major prompts, use XML-style sections only where structure improves control.

Recommended blocks:
<task>
<inputs>
<context>
<output_contract>
<constraints>
<negative_prompting>
<verification>
<stop_condition>

Rules:
- XML is for isolation and testability, not decoration.
- Do not nest deeply unless needed.
- Do not turn simple rules into ceremony.
- Every XML block must have a reason.
</xml_structure_policy>

<quality_bar>
The final `docs/plans/second-approach/draft.md` must pass this bar:

1. No slop:
- No generic “AI will boost productivity” claims.
- No fake novelty.
- No unexplained jargon.
- No giant list of features without kill criteria.

2. Evidence:
- Every strong claim has `[S###]`.
- Every architecture decision has source support, counterargument, or explicit hypothesis label.

3. Minimalism:
- Prefer fewer primitives.
- Kill any skill/subagent/hook/MCP endpoint that does not map to a concrete failure mode.
- “Can this be one AGENTS.md rule instead of a skill?” must be answered.
- “Can this be one hook instead of a dashboard feature?” must be answered.
- “Can this be documented instead of automated?” must be answered.

4. Codex-first:
- Optimize for Codex CLI as main executor.
- App/Desktop support is secondary but considered.
- Claude Code/Cursor/Aider/Cline are comparison sources, not the target platform.

5. Verifiability:
- Every roadmap item has an eval or manual review gate.
- Every generated artifact has an owner and update trigger.
- Every memory layer has invalidation/audit rules.
</quality_bar>

<negative_prompting>
Do not:
- Invent current feature behavior.
- Hide uncertainty.
- Mix facts and opinions.
- Use “best-in-class”, “revolutionary”, or “breakthrough” unless the section explains exactly why.
- Recommend subagents just because they sound advanced.
- Recommend memory without source-of-truth and invalidation rules.
- Recommend hooks without security and review rules.
- Recommend MCP without clear tool contracts.
- Recommend evals without failure examples.
- Expand scope into a full company OS unless the path from Codex pain to dashboard is explicit.
- Copy large chunks from sources.
- Stop after summarizing sources; convert research into product decisions.
</negative_prompting>

<process>
1. Inspect repo context and read `docs/plans/second-approach/draft.md`.
2. Create/update `SOURCES.md` schema before rewriting.
3. Research source clusters.
4. Build a temporary claim/decision matrix mentally or in notes if needed.
5. Rewrite `docs/plans/second-approach/draft.md` surgically into the required final structure.
6. Add Mermaid graphs.
7. Add source IDs to claims.
8. Remove hype, duplicates, and speculative features.
9. Run verification checks.
10. Final response must summarize changed files, source coverage, validation status, and unresolved blockers.
</process>

<verification>
Run available checks without adding dependencies.

Minimum shell checks:
```bash
test -f docs/plans/second-approach/draft.md
test -f SOURCES.md
rg -n "\[S[0-9]{3}\]" docs/plans/second-approach/draft.md SOURCES.md
rg -n "```mermaid|graph TD|sequenceDiagram|flowchart" docs/plans/second-approach/draft.md
rg -n "Paradoxes|Paradoksy|Evals|MCP|Hooks|Subagents|Skills|Memory|SOURCES|Decision log|Roadmap|FAQ" docs/plans/second-approach/draft.md
rg -n "TODO|TBD|UNSOURCED|source needed|citation needed" docs/plans/second-approach/draft.md SOURCES.md && exit 1 || true
```

Manual verification checklist:

* `SOURCES.md` exists and has stable IDs.
* `docs/plans/second-approach/draft.md` cites source IDs.
* All required sections exist.
* At least one graph covers runtime/API flow.
* At least one graph covers memory/context layers.
* At least one graph covers eval loop.
* Every proposed component has Problem → Pattern → Mechanism → Eval → Failure mode → Kill criterion.
* The final verdict says whether KRN looks like breakthrough, useful wedge, or slop, with reasons.

  </verification>

<stop_condition>
Stop only when:

* `docs/plans/second-approach/draft.md` is rewritten into the required structure.
* `SOURCES.md` is complete enough to audit the claims.
* Verification checks pass or blockers are explicitly documented.
* Final response lists changed files, validation commands, and unresolved risks.

If internet access or source access is blocked:

* Do not fabricate.
* Add a `Blocked source gaps` section.
* Continue with repo-local and already available sources.
* Mark unsupported areas as hypotheses.
  </stop_condition>

## 3. Paradoksy, które ten goal celowo wymusza

Największy paradoks: **goal ma zwiększyć autonomię Codexa, ale tylko przez zawężenie celu i twarde kryteria stopu**. Oficjalne materiały o goals mówią wprost, że dobry goal powinien mieć outcome, verification surface, constraints, boundaries, iteration policy i blocked stop condition; nie powinien być ani jednorazową instrukcją, ani otwartym backlogiem. :contentReference[oaicite:2]{index=2}

Drugi paradoks: **więcej kontekstu może pogorszyć wynik**. GPT-5 prompting guide promuje strukturyzowane, XML-like sekcje i bounded context gathering, ale jednocześnie ostrzega przed niepotrzebnym maksymalizowaniem kontekstu i sprzecznymi instrukcjami. Dlatego goal wymusza source index, source IDs i stop condition, zamiast “przeczytaj cały internet i napisz epopeję”. :contentReference[oaicite:3]{index=3}

Trzeci paradoks: **memory pomaga tylko wtedy, gdy nie udaje źródła prawdy**. Cookbook o memory/compaction rozdziela compaction dla bieżącego long-running runu od memory dla przyszłych runów i podkreśla, że cytowane fakty powinny siedzieć w artefaktach, nie wyłącznie w skompaktowanym stanie rozmowy. Dlatego `SOURCES.md` jest obowiązkowy. :contentReference[oaicite:4]{index=4}

Czwarty paradoks: **subagenci przyspieszają research, ale łatwo robią tokenowy chaos**. Codex docs opisują subagents jako wyspecjalizowane równoległe agenty, ale zaznaczają tradeoffy: tokeny, kontekst, przewidywalność i potrzebę wąskich, opiniowanych agentów. Dlatego goal mówi: używaj subagentów tylko tam, gdzie sektorowy research lub eksploracja realnie izoluje kontekst. :contentReference[oaicite:5]{index=5}

Piąty paradoks: **hooks są supermocą i ryzykiem jednocześnie**. Codex hooks mogą uruchamiać skrypty na lifecycle events, logować, skanować sekrety, walidować i automatyzować memories, ale wymagają zaufania i review, bo są realnym kodem wykonywanym w pętli agenta. Dlatego goal wymusza security/review policy dla każdego hooka. :contentReference[oaicite:6]{index=6}

Szósty paradoks: **skills mają zmniejszać prompt bloat, ale same mogą stać się bloatem**. Codex skills są progresywnie ładowane: lista skillów ma mały koszt kontekstowy, a pełny `SKILL.md` ładuje się dopiero po wyborze; docs zalecają wąski zakres, jasne opisy i testowanie trigger behavior. Dlatego goal wymusza pytanie: “czy to naprawdę skill, czy zwykła reguła w AGENTS.md?”. :contentReference[oaicite:7]{index=7}

Siódmy paradoks: **evale nie mogą kończyć się na zielonych testach lokalnych**. Macro evals dla agentic systems pokazują, że w agentach trzeba oceniać nie tylko final answer, ale też narzędzia, routing, delegację, review gates i powtarzalne wzorce błędów w populacji trace’ów. Cookbook o improvement loop łączy traces, feedback, evals i Codex-ready handoff, więc goal wymusza micro + macro eval design. :contentReference[oaicite:8]{index=8}

## 4. Najważniejsza zasada dla `docs/plans/second-approach/draft.md`

W finalnym dokumencie nie wystarczy napisać “memory, subagents, MCP, dashboard”. Każdy element musi przejść test:

```text
Problem → Evidence/pattern → Mechanism → Eval → Failure mode → Kill criterion
```

To jest rdzeń anty-slopowy. Bez tego `krn-gas-town` będzie tylko kolejną paczką promptów. Z tym testem może stać się realną warstwą operacyjną nad Codexem: mniej halucynacji, mniej context rot, mniej prompt rot, lepszy audyt, lepsze evale, krótszy feedback loop i mierzalny workflow advantage.

[1]: https://developers.openai.com/codex/cli/slash-commands "Slash commands in Codex CLI | OpenAI Developers"
[2]: https://developers.openai.com/codex/changelog "Changelog – Codex | OpenAI Developers"
