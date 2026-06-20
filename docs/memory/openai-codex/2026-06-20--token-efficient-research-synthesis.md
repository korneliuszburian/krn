# Token-Efficient Research Synthesis

Status: decision

Sources:

- OpenAI Codex Memories docs, https://developers.openai.com/codex/memories, accessed 2026-06-20.
- OpenAI Cookbook: Using Goals in Codex, https://developers.openai.com/cookbook/examples/codex/using_goals_in_codex, accessed 2026-06-20.
- OpenAI Cookbook: Using PLANS.md for multi-hour problem solving, https://developers.openai.com/cookbook/articles/codex_exec_plans, accessed 2026-06-20.
- OpenAI Cookbook: Build an Agent Improvement Loop with Traces, Evals, and Codex, https://developers.openai.com/cookbook/examples/agents_sdk/agent_improvement_loop, accessed 2026-06-20.
- MemGPT, https://arxiv.org/abs/2310.08560, accessed 2026-06-20.
- Generative Agents, https://arxiv.org/abs/2304.03442, accessed 2026-06-20.
- `docs/product/final-product-plan.md`
- `docs/plans/canonical/SOURCES.md`
- `docs/memory/INDEX.md`
- `.codex/hooks/compact_continuity.py`
- `.krn/compact/latest-checkpoint.md`

Useful pattern:

Use source-backed condensation instead of repeated full-source loading. Full papers, docs, and repo inspections are required when first adopting or revising a mechanism, but routine resume work should read selector artifacts first: memory index, active goal, source/claim IDs, condensed mechanism notes, and review triggers. Open the full source only when the selected note is stale, contested, high-risk, missing acceptance evidence, or needed for a new mechanism.

KRN implication:

KRN research should flow as:

```text
source/repo/paper inspection
  -> mechanism note with failure mode and review trigger
  -> source/claim ledger ID
  -> eval or falsification path
  -> compact selector for future runs
  -> full-source re-read only on trigger
```

This keeps the best-pattern requirement without burning half the context on every resume. It also prevents source notes from becoming hidden truth because each condensed note must preserve failure mode, review trigger, and a path back to the original source.

For compaction specifically, `.codex/hooks/compact_continuity.py` should emit a selector rather than a broad reload checklist: newest user message, latest compact gate, `git status`, changed paths, recent goal candidates, key fingerprints, and on-demand heavy files. That preserves continuity without turning every resume into a full research replay.

Failure mode:

Condensation becomes harmful when the short note is treated as permanent truth, when source links are copied without mechanism extraction, or when a high-risk architecture change proceeds from a stale summary instead of re-reading the primary source. It is also harmful to optimize token use by skipping source verification for current OpenAI/Codex behavior.

Review trigger:

Update this note when OpenAI changes Codex memory/goal/skill/hook behavior, when KRN adds a dedicated source selector/index contract, when a research slice needs a new paper/repo family such as Karpathy-style harness loops or Matt Pocock workflows, or when a compaction/resume eval shows excessive context loading or missed instructions.
