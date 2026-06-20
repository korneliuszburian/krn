# Pattern Matrix

This matrix chooses patterns by mechanism, not by marketing. `Decision` values are: `adopt`, `test`, `defer`, or `reject`.

| Layer | Candidate pattern | Source IDs | Evidence tier | Mechanism | KRN fit | Failure mode | Decision |
|---|---|---|---|---|---|---|---|
| Product Identity | Operating memory/eval/control plane over Codex | S001-S018, S023-S040 | A | Compose native Codex surfaces with source/eval ledgers | Primary identity | Becomes vague company OS | adopt |
| Product Identity | `krn init` as whole product | S003-S007 | A | Bootstrap files and config only | Useful entry point | Too small to be defensible | reject |
| Product Identity | Final-product plan with dependency-ordered slices | C006, C013, C017, C018, LOCAL008 | local/A/B | One final architecture executed through operator, runtime, and control-plane slices | Strong fit | Rebranded MVP ladder or docs-only certainty | adopt |
| Product Identity | Dashboard-first product | S015-S017 | A | UI displays trace/memory/eval objects | Later control plane | Vanity analytics before evidence | reject |
| Product Stack | TypeScript-first product contracts on Node.js runtime | S056, S059, S089-S092 | B/C | One language for CLI contracts, runtime parsers, evals, MCP/API, and dashboard view models | Strong fit | Type cleverness or monorepo ceremony before first vertical slice | adopt |
| Product Stack | Python-first product scripts | LOCAL005-LOCAL007 | local | Fast local validators and scripts | Useful legacy/proof lane | Split product foundation and weak dashboard/API contract reuse | reject |
| Product Stack | Go/Rust-first CLI core | S041-S046 | A | Strong binaries and runtime performance | Possible later fit | Slower iteration before object model stabilizes | defer |
| Codex Bootstrap | Minimal `AGENTS.md` + progressive docs | S001, S003, S055, S074, S075 | A/C | Root prompt stays small, links to indexed knowledge | Strong fit | Important guidance hidden too deep | adopt |
| Codex Bootstrap | Generated giant `AGENTS.md` | S055 | C | Dump many rules into every prompt | Bad fit | Context poison and drift | reject |
| Codex Bootstrap | `krn init --dry-run` manifest | S011, S012, LOCAL001 | A | Shows file changes before write | Strong fit | Users cannot trust generated edits | adopt |
| Agent-Computer Interface | Agent-first CLI with schemas and JSONL | S009, S041, S045 | A | Agents consume machine-readable commands/results | Strong fit | CLI becomes human prose only | adopt |
| Agent-Computer Interface | Sandboxed worktree execution | S020, S045, S059 | A/B | Isolate changes, collect logs/commits | Strong later fit | Adds runner scope too early | test |
| Agent-Computer Interface | Public benchmark chasing | S042-S046 | A | Optimize to leaderboard tasks | Weak fit | Does not prove local workflow lift | reject |
| Agent-Computer Interface | Event-structured TypeScript contracts | S096-S098, S089-S092, C065 | B/C/local | Make possible states, transitions, and outcomes explicit so AI can patch feature logic without touching presentation or the whole codebase | Strong fit for stateful KRN runtime/UI surfaces | Overfitting frontend EDA into every simple CLI/parser task | test |
| Long-Running Goals | Interactive `/goal` contract | S010 | A | Persistent objective, evidence check, stop states | Strong fit | Vague goal never completes | adopt |
| Long-Running Goals | `codex exec` as continuous conversation | S009, S010 | A | Misreads worker mode as active loop | Bad fit | Broken handoff and false autonomy | reject |
| Long-Running Goals | ExecPlan as self-contained state | S011, S012 | A | Plan can restart work without prior context | Strong fit | Plan becomes stale if not updated | adopt |
| Long-Running Goals | PreCompact/PostCompact checkpoint | S006, S017 | A | Lifecycle hooks capture/reload state around compaction | Promising fit | Secret leaks or stale checkpoint trust | test |
| Memory Kernel | Source-backed memory entries | S025-S040 | A | Store claims with evidence, time, confidence, invalidation | Strong fit | Memory treated as truth | adopt |
| Memory Kernel | Temporal knowledge graph | S026, S027, S031 | A | Time-aware entities and relationships | Later fit | Premature graph complexity | test |
| Memory Kernel | Living memory maintenance loop | S023-S040, C064, LOCAL050 | A/local/C | Ingest, distill, project entities/edges, detect gaps/anomalies/duplicates, repair stale knowledge, compact durable structures, and route consensus through review | Strong final-state candidate after selection/application proof | Futurist brain language becomes untested graph/vector/neural infrastructure | test |
| Memory Kernel | Zettelkasten dynamic linking | S030 | A | Notes link/evolve as new evidence arrives | Good fit for docs memory | Agent over-links noise | test |
| Memory Kernel | Verbatim local storage | S033, S034 | A/B | Store raw text and retrieve via embeddings/metadata | Useful for local traces | Raw private data and weak abstraction | test |
| Memory Kernel | Extraction-only memory | S025, S034 | A | Condense into salient facts | Partial fit | Loses evidence and nuance | defer |
| Source Ledger | Claim ledger | S011, S015, S040 | A | Every claim points to evidence and risk | Strong fit | Bureaucracy if overdone | adopt |
| Source Ledger | Source IDs in every decision | S001-S088 | A-D | Trace decisions to sources | Strong fit | IDs become decorative | adopt |
| Source Ledger | Cookbook pattern map | S010-S021, S086-S087 | A | Convert sources into mechanism, artifact, eval, and failure-mode mappings | Strong fit | Link list or copied context dump | adopt |
| Skills | Small workflow skills | S004, S056, S057 | A/B/C | Progressive disclosure and focused instructions | Strong fit | Skill library grows into bloat | adopt |
| Skills | Normalized operator pipeline | S004, S056, S077 | A/B | Route -> grill -> PRD/ADR/issues -> implement -> review -> handoff | Needed before product skills | Becomes ceremony if not tied to execution | adopt |
| Skills | Skill impact A/B evaluation | S004, S014-S016, S056 | A/B | Compare baseline Codex vs skill-assisted Codex on task fixtures | Required before productivity claims | Sexy skill pack with no measurable lift | adopt |
| Skills | Unstructured prompt collection | S056, S077 | B | Many disconnected skills/prompts | Bad fit | Confusion and trigger drift | reject |
| Skills | Skill trigger evals | S004, S014, S053 | A | Test whether skill triggers correctly | Strong fit | Eval theatre if no failures | adopt |
| Skills | Package as plugins early | S004 | A | Distribute reusable bundles | Later fit | Premature distribution | defer |
| Skills | Skill markdown accretion warning | S096, C065, LOCAL050 | C/local | Skill misses should improve trigger tests, examples, evals, ownership, and deletion criteria instead of appending endless bullets | Strong fit | KRN recreates an unmaintainable pile of markdown | adopt |
| Subagents | Narrow read-only research/review agents | S005, S016, S061 | A/C | Isolate context and parallelize review | Strong fit | Token chaos and shallow reports | adopt |
| Subagents | Recursive agent swarm | S005 | A | Deep fan-out | Bad fit | Latency, cost, unpredictability | reject |
| Hooks | Deterministic guard hooks | S006, S068 | A | Block/capture known events | Strong fit | False sense of sandbox | adopt |
| Hooks | Semantic reviewer hook | S006 | A | Hook decides product truth | Bad fit | Hidden model/policy layer | reject |
| Hooks | Compact continuity hooks | S006, S017 | A | Save/load state around compaction | Important hypothesis | Not proven in real Codex run | test |
| MCP/API | Small allowlisted MCP | S007, S022 | A | Resources/tools/prompts with approvals | Strong fit | Unsafe broad API | adopt |
| MCP/API | ChatGPT read-only reviewer gateway | S078-S083 | A | HTTPS MCP connector exposes source/claim/eval/memory state | Later optional fit after local KRN loop proves useful | Plan/workspace availability and stale context | defer |
| MCP/API | Direct ChatGPT-to-local-Codex stdio | S081-S085 | A | Skips gateway/tunnel and permission model | Bad fit | Not the documented connector architecture | reject |
| MCP/API | Append-only idempotent writes | S007, S015, LOCAL017, LOCAL019 | A/local | Traceable proposal mutation with IDs, source-ref validation, and typed non-approval results | Strong fit | Coupling, storage overhead, or proposal output overclaimed as approval | adopt |
| MCP/API | Destructive autonomous tools | S007, S022 | A | Agent writes production state | Bad fit | Unapproved state mutation | reject |
| Evals | Trace-derived micro/macro evals | S013-S016, S053 | A | Convert failures into fixtures and metrics | Strong fit | Green demos not tied to work | adopt |
| Evals | Fixed-budget metric loop | S088 | B | Baseline, one bounded change, fixed eval, metric delta, keep/discard | Strong fit for worker lanes | Endless autonomous loop or overfitting one metric | test |
| Evals | Core/current/lab lane split | C023, C031, C066, LOCAL051 | local | Keep default verification focused on active product contracts while preserving explicit lab/history checks | Strong fit | Historical dashboard/benchmark modules are mistaken for current product progress | adopt |
| Evals | GEPA-style prompt evolution | S052 | A | Reflect over trajectories, propose prompt/skill changes | Later fit | Overfits without validation split | test |
| Evals | Reflexion/Self-Refine repair | S049, S050 | A | Feedback/refine iterations | Good fit | Model self-critique without proof | adopt |
| Evals | Voyager skill-library loop | S051 | A | Store reusable behaviors after successful execution | Good analogy | Game setting overgeneralized | defer |
| Dashboard | Memory Core and Pending Review queues | user image, S015-S017, S025-S040, LOCAL020-LOCAL021 | A/local + user input | Human reviews proposed memory/source/eval changes from typed proposal records and generated dashboard data | Strong fit | Pretty list without action or approval confusion | adopt |
| Dashboard | Knowledge gaps | S015, S016, S028-S029 | A | Show missing evidence, stale claims, failed recalls | Strong fit | Gap spam | adopt |
| Dashboard | Graph view | S026, S027, S030, S031 | A | Entity/source/decision relations | Later fit | Graph novelty without workflow | defer |
| Dashboard | Metric owner/action rule | S016 | A | Each metric maps to owner and fix path | Strong fit | Vanity dashboard | adopt |
| Dashboard | Raw transcript browser | S017, S040 | A | Store/show everything | Weak fit | Privacy and noise | reject |
| Reviewer Layer | Static ChatGPT Project/GPT second opinion | S078-S080 | A | Upload canonical docs and run strict reviewer prompt | Optional later reviewer, not current product core | Uploaded knowledge goes stale | defer |
| Reviewer Layer | ChatGPT write-capable connector first | S081-S083 | A | Exposes write tools before read-only value is proven | Bad early fit | Unsafe mutation and tool confusion | reject |
| Security | Least-power defaults | S006, S007, S009, S020 | A | Read-only/dry-run/approval before writes | Strong fit | Blocks useful automation too long | adopt |
| Security | Hook trust review | S006 | A | Changed hooks must be trusted | Strong fit | Users bypass trust permanently | adopt |
| GitHub Research | Mechanism-first repo research | S056, S059, S073 | B/C | Inspect code/docs/architecture after discovery | Strong fit | Star-count cargo cult | adopt |

## Coverage Checklist

- OpenAI/Codex patterns: S001-S021, S086-S087.
- Memory/context patterns: S023-S040.
- Eval/self-improvement patterns: S013-S016, S049-S053.
- Coding-agent benchmark/interface patterns: S041-S046.
- Practitioner/senior-engineering patterns: S055-S065, S076-S077, S096-S098.
- Deferred ChatGPT reviewer bridge patterns: S078-S085.
- Controlled experiment loop pattern: S088.
- Dashboard/control-plane patterns: rows under Dashboard plus Product Identity.
