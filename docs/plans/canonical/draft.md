# KRN-GAS-TOWN - Canonical Synthesis

## 1. Executive Thesis

[DECISION] KRN should be a Codex-native operating memory, eval, and control plane. Gas Town is the repo/codename for building it. `krn init` is the bootstrap entry point, not the product boundary. The product wins only if it reduces repeated Codex failure modes through source-backed memory, trace-derived evals, deterministic hooks, explicit MCP/API boundaries, and a dashboard for human review.

[HYPOTHESIS] This can become a breakthrough wedge if it proves measurable improvement on real KRN tasks. It is not a proven breakthrough today.

[DECISION] The execution source of truth is now [docs/product/final-product-plan.md](/home/krn/coding/krn/active/krn-gastown/docs/product/final-product-plan.md) plus [docs/goals/goal-006.md](/home/krn/coding/krn/active/krn-gastown/docs/goals/goal-006.md). `goal-005` is no longer the active product direction; it is Slice 2 context for `krn init --dry-run`.

The short version:

```text
Codex work -> trace/source/eval artifacts -> reviewed memory and decisions -> better future Codex work -> dashboard-controlled review loop
```

## 2. What Changed After Merging First and Second Approach

[FACT] The two `SOURCES.md` files are identical. [FACT] The two draft files differ only in the final source-index path line. Therefore, the canonical plan is not a compromise between two competing approaches.

[DECISION] Treat the previous draft as a useful baseline and add the missing layer: OpenAI docs-first constraints, memory-system papers, benchmark evidence, long-running goal mechanics, GitHub project research, and dashboard/control-plane object design.

## 3. Product Identity and Breakthrough Verdict

Primary identity: source-backed operating memory and control plane for Codex work.

Secondary surfaces:

- CLI: `krn init`, `krn doctor`, `krn eval`, `krn sync`.
- Codex layer: `AGENTS.md`, skills, subagents, hooks, MCP, config.
- Memory layer: source-backed entries, review states, temporal validity, invalidation.
- Eval layer: micro/macro/trace-derived evals.
- Dashboard: Memory Core, pending review, gaps, sources, graph view, ownership, approvals.

What KRN is not:

- not a Codex replacement,
- not a dashboard-first productivity product,
- not a generic multi-agent swarm,
- not a vector DB wrapper,
- not a prompt pack.

Breakthrough criterion:

KRN becomes defensible only if baseline Codex vs KRN-scaffolded Codex shows lower repeated failure rate, better source discipline, better post-compaction continuity, and lower review burden.

## 4. Research Method and Evidence Tiers

Every major decision must follow:

```text
source -> observation -> pattern -> mechanism -> KRN implication -> eval/falsification -> failure mode
```

Labels:

- `[FACT]`: verified in source or local files.
- `[INFERENCE]`: reasoned from evidence.
- `[HYPOTHESIS]`: plausible, not yet proven.
- `[DECISION]`: chosen product direction.
- `[BLOCKED]`: important but currently unverifiable.

Stars, social posts, and benchmark rankings are discovery signals, not proof.

## 5. Pattern Synthesis by Application Layer

| Layer | Primary pattern | Fallback | Kill criterion |
|---|---|---|---|
| Product identity | Codex operating memory/eval/control plane | CLI bootstrapper | No measurable workflow lift |
| Codex bootstrap | Minimal AGENTS + generated scaffold + dry-run | Manual docs only | Init output is not explainable |
| Agent-computer interface | Machine-readable CLI/API, JSONL, schemas | Human markdown reports | Agent cannot consume output reliably |
| Long-running goals | `/goal` + ExecPlan + checkpoints | Normal prompt + handoff doc | No evidence-based completion |
| Memory kernel | Source-backed temporal memory entries | File-based docs memory | Memory used as truth without sources |
| Source ledger | Stable source IDs + claim ledger | One SOURCES file | Claims cannot be audited |
| Operator skills | Normalized build pipeline | Ad hoc prompts | Skills become disconnected ceremony |
| Runtime skills | Small tested product skills | AGENTS.md references | Skill trigger drift or bloat |
| Subagents | Narrow read-only research/review | Single-agent pass | Parallelism lowers quality |
| Hooks | Deterministic lifecycle gates | Manual checklist | Hooks hide semantic decisions |
| MCP/API | Small allowlisted append-only bridge | Local files only | Unsafe or untraceable writes |
| Evals | Trace-derived micro/macro evals | Manual review matrix | Green tests do not predict review |
| Dashboard | Review/control UI over memory/source/eval objects | Markdown reports | Metrics have no owner/action |
| Security | Least-power, dry-run, approval-first | Read-only-only MVP | Users bypass guardrails |

## 6. OpenAI / Codex Surface Decisions

[DECISION] Official OpenAI/Codex docs are the source of truth for Codex-specific design.

Codex surfaces and KRN use:

- `AGENTS.md`: minimal always-loaded operating contract and pointers to progressive docs. It must not become a knowledge base, source index, stale path map, or collection of one-off hotfix rules.
- Skills: reusable workflow packages with trigger tests.
- Subagents: explicit, narrow, bounded parallel work.
- Hooks: deterministic capture/gates, including future compaction checkpoints.
- MCP: explicit resource/tool bridge to KRN state.
- Memories: helpful local recall, not project truth.
- `codex exec`: worker lane for CI, evals, repair passes, and structured reports.
- `/goal`: interactive long-running objective lane.
- App server/SDK: later integration surfaces for dashboard/control, not MVP dependency.

Important constraint:

`codex exec` does not replace a continuous interactive Goal loop. It can run a bounded worker pass, stream JSONL, produce structured output, and sometimes resume a session, but KRN continuity must live in checked-in artifacts and run ledgers.

## 7. Long-Running Goal Mechanism

Use three layers:

1. Goal contract:
   - outcome,
   - verification surface,
   - constraints,
   - boundaries,
   - iteration policy,
   - blocked stop condition.
2. ExecPlan/state file:
   - self-contained plan,
   - current progress,
   - decisions,
   - surprises,
   - validation status,
   - next step.
3. Compact continuity:
   - `PreCompact` writes latest checkpoint,
   - `PostCompact` forces state reload,
   - dashboard later shows "continuity health".
Early hook test:

```text
PreCompact(auto/manual)
  -> write checkpoint with active goal, files, decisions, blockers, next action
  -> block only if checkpoint cannot be written

PostCompact(auto/manual)
  -> require reading docs/memory/INDEX.md, active goal, latest checkpoint
  -> continue only after state is restated from files
```

[HYPOTHESIS] This will materially improve post-compaction continuity. It must be tested with real hooks before being presented as proven.

[DECISION] Do not solve context rot by loading more context. Solve it by ranking context: current user instruction, compact checkpoint, memory index, then selected canonical docs.

## 8. Memory Kernel Architecture

Memory entry schema should include:

- `id`
- `type`: `fact`, `decision`, `pattern`, `failure`, `preference`, `source_note`, `checkpoint`
- `status`: `draft`, `ai_suggested`, `needs_review`, `approved`, `stale`, `superseded`, `rejected`
- `claim`
- `evidence_refs`
- `source_ids`
- `created_at`
- `valid_from`
- `expires_at`
- `invalidates_when`
- `confidence`
- `owner`
- `access`
- `linked_entries`
- `eval_refs`
- `review_notes`

The first implementation can be markdown files under `docs/memory`. Later it can become a proper store/API, but the schema must stay source-backed.

Best extracted patterns:

- Mem0/Zep: memory is extraction/consolidation/retrieval over time, not dumping all context.
- LongMemEval: test temporal updates and abstention, not only recall.
- A-MEM: link memories dynamically but avoid unreviewed graph noise.
- Hindsight: separate facts, experiences, entity summaries, and beliefs.
- MemPalace critique: local verbatim storage can be powerful, but spatial metaphor is not automatically the cause of retrieval quality.

## 9. Source and Claim Ledger

`SOURCES.md` is not bibliography decoration. It is the input to the claim ledger.

Required source workflow:

1. Add source candidate.
2. Extract observation.
3. Mark tier and caveat.
4. Create or update claim.
5. Map claim to decision.
6. Define failure if claim is wrong.

Unsupported claims must be marked `[HYPOTHESIS]` or removed.

## 10. Skills, Subagents, Hooks, MCP Architecture

KRN has two skill layers. They must not be mixed.

Layer A: operator/build-time skills. These are the skills used to build KRN itself. They should behave like a normalized senior-engineering pipeline:

```text
operator-router -> setup-operating-layer -> grill-domain -> decision-map -> to-prd -> to-adr when needed -> to-issues -> prototype-question when needed -> implement-vertical -> review-change -> handoff -> verify-release
```

This borrows the mechanism from `mattpocock/skills`: clarify ambiguity before building, use PRD/issues as phase boundaries, create ADRs only for meaningful tradeoffs, keep TDD vertical, and use handoff files when a fresh context is better than compaction.

For the current Codex repo, P1 operator skills live under `.agents/skills`, not `.codex/skills`. The first gate is static contract quality: trigger, input, output, phase boundary, when-not-to-use, and eval binding. The second gate is impact: baseline Codex vs skill-assisted Codex on the same task fixture. Do not claim productivity lift until the impact gate exists.

Layer B: runtime/product skills. These are skills and tool workflows exposed by KRN to improve future Codex work:

- `research-synthesis`
- `source-ledger`
- `goal-execplan`
- `memory-entry-review`
- `eval-designer`
- `dashboard-object-model`
- `github-solution-research`

Every skill in both layers needs trigger tests, input/output contract, phase boundary, and a "when not to use" section.

Subagents:

- use for bounded research, source verification, security review, eval design, or dashboard object critique,
- default to read-only,
- return structured handoff only,
- never spawn recursively unless explicitly approved.

Current hook surface:

- `compact-continuity`: project-local PreCompact/PostCompact checkpointing and resume hints.

Non-hook policies:

- source-claim checks,
- memory-write review,
- anti-slop constraints,
- eval-after-change rules,
- dangerous-action review.

These start as eval/CLI/docs contracts. They become hooks only if a deterministic event boundary, clear failure mode, and trusted local enforcement path are proven. Do not add prompt hooks or semantic reviewer hooks as the default solution.

MCP/API:

- resources: project profile, source index, memory pointers, eval results, latest run state,
- tools: propose memory, append source, write trace, record decision, request eval, publish dashboard event,
- writes: append-only, idempotent, schema-versioned, approval-aware.

ChatGPT reviewer bridge:

- deferred optional reviewer channel after the local Codex/KRN loop proves useful,
- possible later first step: ChatGPT Project/custom GPT as a static reviewer over uploaded KRN docs,
- possible later live step: read-only HTTPS MCP gateway for sources, claims, memory entries, eval results and compact state,
- only after that, if still useful, add proposal-only writes visible in the dashboard,
- never describe the bridge as direct ChatGPT-to-local-Codex stdio; Codex can run as an MCP server over stdio for another local tool, while ChatGPT connectors need a reachable app/gateway endpoint.

## 11. Evals and Improvement Loop

KRN eval ladder:

1. Micro evals:
   - skill trigger,
   - schema compliance,
   - source citation,
   - hook behavior,
   - memory proposal validity.
2. Workflow evals:
   - research synthesis,
   - long-running goal continuation,
   - repair loop,
   - dashboard proposal review.
3. Macro evals:
   - baseline Codex vs KRN Codex on repeated local tasks.

Improvement loop:

```text
real trace -> human/model feedback -> known-bad fixture -> proposed change -> train/validation split -> review -> release -> regression monitor
```

Promptfoo is a strong early runner candidate because it keeps eval configs near code and works in CLI/CI. OpenAI eval dashboards can inform patterns but should not become MVP dependency.

Early KRN metrics:

- `memory_routing_score`
- `source_grounding_score`
- `goal_alignment_score`
- `continuity_score`
- `anti_slop_score`
- `drift_resistance_score`

These are setup-compliance metrics, not breakthrough proof. Breakthrough proof still needs baseline Codex vs KRN-scaffolded Codex on real tasks.

## 12. Dashboard / Control Plane Architecture

The dashboard should look closer to the provided Memory Core UI than to a metrics homepage.

Objects:

- Memory Core: entries with type, state, confidence, owner, source count.
- Pending review: AI-proposed memory/source/eval/skill changes.
- Knowledge gaps: missing evidence, stale claims, failed recalls.
- Recently changed: changed entries and source freshness.
- Domains: Product, Processes, Roles, Decisions, Policies, Customers, Engineering.
- Sources: Notion/GitHub/Slack/Linear/Google Drive/local docs later.
- Detail panel: proposed edits, source evidence, linked entries, access, owner.
- Graph view: entities, claims, decisions, sources, evals.

Actions:

- approve,
- reject,
- request more sources,
- mark stale,
- supersede,
- link entries,
- inspect source/trace,
- promote failure pattern into eval,
- approve skill/prompt/hook proposal.

Dashboard rule:

Every metric must have an owner, action, source, and failure mode.

## 13. Security and Governance

Default posture:

- dry-run before writes,
- local-first,
- no secrets in memory,
- no raw transcript dumps in checked-in docs,
- hooks require trust review,
- MCP tools are allowlisted,
- destructive actions need explicit approval,
- dashboard writes create proposals, not silent mutations.

Early roles:

- owner: can approve memory and MCP write policies,
- reviewer: can approve/reject proposals,
- agent: can propose but not approve,
- viewer: can inspect approved state.

## 14. Market and Practitioner Comparison

Best practitioner patterns to keep:

- Matt Pocock / AI Hero: small skills inside a normalized operator pipeline, grill before ambiguous work, PRD/issues as phase boundaries, ADR only for real decisions, TDD/feedback loops, handoff over accidental context sprawl.
- Simon Willison: agentic engineering is emerging practice; cheap code increases need for review and taste.
- Addy Osmani: plan, chunk, review, run, test; human engineer remains accountable.
- LangChain / context engineering: write, select, compress, isolate context.
- Sandcastle: sandboxed worktree orchestration with iterations, logs, commits, warm environment, completion signal.

GitHub research rule:

Do not rank by stars. For each repo, inspect:

- actual mechanism,
- isolation model,
- state model,
- eval model,
- security posture,
- integration cost,
- what problem it actually solves,
- what KRN should borrow or reject.

## 15. Roadmap

| Phase | Outcome | Eval gate | Kill criterion |
|---|---|---|---|
| P0 | Canonical docs, source index, memory index | Coverage checklist passes | Plan still generic |
| P1 | Operator skill pipeline spec | One task can move from grill to handoff | Skills are disconnected prompts |
| P2 | `krn init --dry-run` scaffold spec | Generated manifest explainable | Generated files confuse operator |
| P3 | GitHub solution research pack | 10 repos inspected by mechanism | Star-count summary only |
| P4 | Compact hook prototype | Real Pre/PostCompact proof | Hook cannot reliably checkpoint |
| P5 | Local eval harness | Known-bad fixtures work | Evals do not catch real failures |
| P6 | Memory proposal schema | Review states and invalidation work | Memory becomes stale truth |
| P7 | Source-backed proposal store | Unbacked proposals fail before persistence | Proposal refs stay decorative |
| P8 | Dashboard prototype | Reads real events/proposals | UI shows vanity metrics |
| P9 | Baseline vs KRN benchmark | 20 real task comparison | No measurable workflow lift |
| P10 | Optional ChatGPT reviewer bridge | Reviewer finds useful drift against stable local truth | Reviewer repeats stale context or distracts from local loop |

## 16. Kill Criteria

Kill or redesign the product if:

- native Codex + small `AGENTS.md` gives same outcome,
- memory increases stale-confidence errors,
- dashboard does not create reviewed actions,
- evals fail to predict human review,
- hooks are bypassed or untrusted in real runs,
- `krn init` generates more overhead than it removes,
- users cannot explain what KRN changed.

## 17. Open Questions

- Should `docs/memory` remain markdown long-term, or become generated from a structured store?
- How aggressive should PreCompact blocking be?
- Should Sandcastle-like sandboxing be a KRN feature or only a reference pattern?
- Which first 20 tasks become the baseline benchmark?
- What is the smallest dashboard object model worth prototyping?

## 18. Decision Log

| Date | Decision | Reason |
|---|---|---|
| 2026-06-19 | Root `AGENTS.md` points to `docs/memory/INDEX.md`. | Keeps root instructions small and progressive. |
| 2026-06-19 | Root `AGENTS.md` upgraded to a normative anti-drift contract. | AGENTS.md is always loaded, so it must stay short, universal, source-aware, and docs-rot resistant. |
| 2026-06-19 | `codex exec` is worker lane, not continuous Goal loop. | Official non-interactive mode differs from `/goal` lifecycle. |
| 2026-06-19 | PreCompact/PostCompact continuity is a testable hypothesis. | Useful mechanism but needs real hook proof. |
| 2026-06-19 | Sandcastle added as GitHub research pattern. | Mechanism-level value: sandbox/worktree/log/commit orchestration. |
| 2026-06-19 | Dashboard is control plane over ledgers, not analytics. | Matches product hypothesis and user reference UI. |
| 2026-06-19 | Separate operator skills from runtime/product skills. | Matt Pocock-style skills are a build pipeline; KRN runtime skills are product capabilities. |
| 2026-06-20 | ChatGPT reviewer bridge is deferred and optional. | The local Codex/KRN operating loop, source-backed proposal store, dashboard, and benchmark lift matter before external reviewer integration. |
| 2026-06-19 | Cookbook links become pattern maps, not bibliography. | OpenAI examples matter when they change artifacts, evals, or stop conditions. |
| 2026-06-19 | `autoresearch` is a bounded metric-loop reference only. | Borrow baseline/metric/budget/keep-discard; do not import endless autonomy. |
| 2026-06-19 | Semantic policies stay out of hooks for now. | User rejected extra hooks, and OpenAI hook guidance fits deterministic lifecycle events better than semantic product truth. |

## 19. Source Coverage Checklist

- Total sources: 88.
- Official OpenAI/Codex/Cookbook sources: S001-S021, S086-S087.
- Papers/benchmarks: S023, S025-S046, S047-S052.
- Memory sources: S023-S040.
- Coding-agent benchmark/interface sources: S041-S046.
- Practitioner/senior sources: S055-S065, S074-S077.
- Competitor/open-source sources: S067-S073.
- Deferred ChatGPT reviewer bridge sources: S078-S085.
- Controlled experiment-loop source: S088.

Final verdict: KRN is not proven breakthrough yet. The strongest path is a disciplined source-backed control plane where Codex work produces reviewable memory, eval, trace, and decision artifacts, and where every future dashboard feature reads those artifacts instead of inventing state.
