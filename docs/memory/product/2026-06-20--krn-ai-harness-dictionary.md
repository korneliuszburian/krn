# KRN AI Harness Dictionary

Status: decision

Sources:

- `docs/memory/github-research/2026-06-19--mattpocock-skills-operator-pipeline.md`
- `docs/memory/github-research/2026-06-19--karpathy-autoresearch-experiment-loop.md`
- `docs/memory/product/2026-06-20--krn-source-bank-and-engineering-patterns.md`
- `docs/product/final-product-plan.md`
- `docs/source-bank/MANIFEST.md`
- Matt Pocock, AI Coding Dictionary: https://github.com/mattpocock/dictionary-of-ai-coding
- Matt Pocock, 5 Agent Skills I Use Every Day: https://www.aihero.dev/5-agent-skills-i-use-every-day
- Matt Pocock, to-issues vertical slices: https://www.aihero.dev/skills-to-issues
- Matt Pocock, TDD vertical slices: https://www.aihero.dev/skill-test-driven-development-claude-code
- Anthropic, Building Effective Agents: https://www.anthropic.com/engineering/building-effective-agents
- Anthropic, Effective Context Engineering for AI Agents: https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents
- SWE-agent paper: https://proceedings.neurips.cc/paper_files/paper/2024/file/5a7c947568c1b1328ccc5230172e1e7c-Paper-Conference.pdf
- Agentless paper: https://arxiv.org/html/2407.01489v1

## Observation

KRN needs shared operating language before more automation. If every agent redefines "goal", "memory", "eval", "harness", "review", or "research", the repo accumulates plausible artifacts instead of better software.

## Useful Pattern

Use a compact dictionary for KRN work. These terms are product contracts, not vibes.

| Term | KRN meaning | Use when | Do not use when |
|---|---|---|---|
| Source bank | Local ignored cache of external repos, papers, transcripts, and docs. | A source must be inspected repeatedly or offline. | As product truth or committed vendor code. |
| Reviewed memory | Condensed, source-backed KRN knowledge under `docs/memory/**`. | A pattern or decision should survive compaction. | For raw logs, raw cloned repos, or unreviewed claims. |
| Shared dictionary | Stable vocabulary that prevents agents from redefining work. | Terms affect planning, routing, or acceptance. | As a glossary dump that does not change behavior. |
| Grill | Short alignment interview before planning ambiguous work. | Terms, success criteria, or tradeoffs are unclear. | Tiny mechanical edits with obvious acceptance. |
| Destination artifact | The artifact that defines where a slice is going: PRD, ADR, issue, contract, or goal. | A task can drift or survive compaction. | When a command/result is the whole task. |
| Vertical slice | Small product path from contract to runtime/review proof. | Building product functionality. | Broad refactors or research-only work. |
| Fast lane | Default product-build loop with short feedback. | Coding, contracts, CLI, MCP, dashboard, memory promotion. | Measuring broad agent behavior or statistical claims. |
| Heavy lab lane | Explicit benchmark/meta-research loop. | Testing a bounded hypothesis about Codex/KRN behavior. | Daily product development or default eval. |
| Meta-researcher | Controlled experiment loop over agent behavior. | There is a fixed metric, budget, baseline, and keep/discard rule. | Open-ended autonomous product building. |
| Anti-slop | Constraints that block plausible but ungrounded output. | Source claims, memory promotion, review, dashboard, benchmark status. | As a generic vibe without a failing case. |
| Review burden | Human cleanup cost created by an agent result. | Measuring skills, benchmarks, and code changes. | Replacing correctness or tests with subjective taste. |
| Overclaim boundary | Explicit statement of what evidence does not prove. | Any eval, benchmark, dashboard, or repair result. | Marketing language or routine code comments. |
| Handoff | Fresh-context artifact that preserves next action and evidence. | A phase changes or compaction/resume risk is high. | As a dump of every file read. |
| Compact selector | Minimal resume pointer to changed files, active goal, and relevant memory. | After compaction or long-running work. | To force rereading all canonical docs. |
| Deep module | Module with narrow interface and hidden internal complexity. | Designing durable code boundaries. | Premature abstraction around one use. |
| Unknown-first parsing | Treat external data as `unknown` before schema parsing. | Runtime reports, MCP/API input, fixtures, dashboard data. | Internal local variables already typed by construction. |
| Red-green loop | Reproduce failure, make the smallest fix, verify. | Bugs, parser contracts, repair loops. | Open-ended design or broad research. |
| Keep/discard decision | Metric-based decision after an experiment attempt. | Meta-researcher or repair lane. | Product code that needs normal design review. |
| Agent-computer interface | Tool and feedback surface designed for an agent, not a human shell. | Codex needs safer navigation, edits, or command feedback. | Replacing Codex with a custom agent. |
| Localization-first repair | Find file/function/edit location before generating patches. | Debugging and bug repair. | Feature work where desired behavior is not localized yet. |
| Evaluator-optimizer | Generator plus critique loop with clear evaluation criteria. | Writing, review, repair, and bounded improvement tasks. | When evaluation criteria are vague or subjective. |
| Context engineering | Curating the actual token set the agent sees, beyond prompt wording. | Memory selection, compact resume, source refs, skill routing. | Dumping all docs into context. |
| Tracer bullet | Thin end-to-end slice that flushes integration risks early. | Planning issues and TDD implementation. | Horizontal layer work that cannot be verified alone. |

## KRN Implication

The default KRN loop is:

```text
intake -> grill if ambiguous -> destination artifact -> vertical slice
  -> implementation -> fast verification -> review/handoff
  -> promote only reviewed memory
```

The benchmark/meta-research loop is:

```text
baseline -> one bounded intervention -> fixed metric -> keep/discard
  -> memory/source update only if it changes future behavior
```

Do not collapse these loops. Heavy benchmarks can discover truth, but they are not how normal product code should be written.

## Skill Condensation Rules

KRN skills should be judged against real engineering patterns:

| Skill family | Source-backed pattern | KRN rule |
|---|---|---|
| `operator-intake` | Routing and context engineering. | Route to one lane and one next artifact; do not load broad history by default. |
| `domain-grill-interviewer` | Pocock grill/design-tree/shared language. | Ask until terms, decisions, and dependencies stop being ambiguous; write dictionary/memory only when durable. |
| `product-requirements-writer` | PRD as destination artifact. | Produce PRD only after alignment; skip for tiny mechanical edits. |
| `issue-slice-writer` | Tracer-bullet vertical slices. | Slice by independently verifiable behavior, not by files/layers. |
| `typescript-contract-engineer` | Unknown-first parsing, public-interface tests, TDD vertical slices. | One behavior/test at a time; no speculative abstractions. |
| `research-synthesis` | Source-to-mechanism extraction. | Promote mechanisms, not bibliography. Every adopted pattern needs failure mode and proof surface. |
| `eval-designer` | Evaluator-optimizer and fixed metrics. | Add evals only for contracts, regressions, or measured claims. |
| `repair-handoff` | Reflexion-style feedback memory plus Agentless localization. | Convert failures into localized repair targets; do not create broad autonomous loops. |
| `release-verifier` | Review burden and overclaim boundary. | Verify evidence against acceptance and name what remains unproven. |

## Lightweight Lab Rule

KRN labs should start Karpathy-small:

```text
one hypothesis
one editable surface
one fixed metric
one run log
one keep/discard decision
```

Only add schemas, registries, dashboards, or multi-worker orchestration after a small lab produces a repeated useful signal.

## Operator Phrases

These phrases are compact instructions. Use them as handles for larger behavior, not as decorative labels.

| Phrase | Expands to | Expected behavior |
|---|---|---|
| `mechanism first` | Source -> mechanism -> tradeoff -> minimal design -> proof -> failure mode. | Do not cite a person, paper, or repo unless the mechanism is extracted. |
| `senior lens` | Mechanism, tradeoff, simplest viable design, boundary, verification, review burden, promotion rule. | Pause before non-trivial work and choose the smallest defensible path. |
| `grill before build` | Resolve terms, dependencies, decisions, and success criteria before implementation. | Ask or inspect until ambiguity is low enough to plan. |
| `dictionary before debate` | Stabilize overloaded terms before arguing architecture. | Add or reuse canonical vocabulary for recurring concepts. |
| `vertical or stop` | Slice behavior end-to-end; avoid horizontal layer work that cannot be verified alone. | Convert broad plans into independently reviewable increments. |
| `one red, one green` | One failing behavior check, one minimal implementation, repeat. | Avoid bulk tests and speculative implementation. |
| `deep module` | Narrow public interface, hidden internal complexity, low review burden. | Prefer cohesive boundaries over scattered helpers. |
| `agent interface` | Design the tool/output surface for the agent's abilities and failure modes. | Give concise feedback, constrained actions, and safe defaults. |
| `context diet` | Select the smallest useful context set. | Use selectors/source refs instead of broad rereads. |
| `lab small` | One hypothesis, one editable surface, one metric, one log, keep/discard. | Do not build framework before signal. |
| `review burden budget` | Count human cleanup and audit cost as a first-class metric. | A solution that passes tests but creates review sludge is not done. |
| `no-lift by default` | Do not claim productivity improvement without clean comparative evidence. | Green evals, fixtures, smoke runs, and anecdotes remain below lift. |
| `promote only truth` | Runtime evidence becomes durable memory only after review. | Do not turn `.krn` artifacts or chat claims into memory automatically. |
| `delete weak skills` | Skills are hypotheses with maintenance cost. | Merge/remove skills that do not change behavior or reduce review burden. |

## Tone Rule

KRN instructions should be direct, compact, and falsifiable. The useful emotional stance is serious engineering pressure: do not perform competence, reduce uncertainty. Avoid hype, apology loops, and motivational prose. Name weak evidence plainly.

## Failure Mode

This dictionary becomes harmful if it turns into jargon theater. Every term must either reduce ambiguity, route work, constrain claims, or select verification.

## Review Trigger

Update when adding a new KRN skill, product layer, source-bank family, or benchmark lane; remove terms that are not used in artifacts or code.
