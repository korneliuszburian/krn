# KRN Source Bank Manifest

Status: active

This manifest lists external engineering-pattern sources that should be available locally for KRN research synthesis. Raw third-party repositories belong in the ignored cache at `.krn/source-bank/repos/`; reviewed KRN knowledge belongs in `docs/memory/**`, `docs/plans/canonical/SOURCES.md`, ADRs, or product docs.

## Rules

- Do not commit cloned third-party source trees.
- Record each local clone with repository URL, pinned commit, access date, and reason.
- Promote only extracted mechanisms into KRN memory. Do not promote hype, stars, or raw transcripts as facts.
- Every promoted pattern must include when to use it, when not to use it, and a KRN proof surface.
- Refresh source clones only when changing a claim, adding a source, or resolving a source conflict.

## Current Source Set

| Source | Local cache target | Role in KRN | Promotion target |
|---|---|---|---|
| `mattpocock/skills` | `.krn/source-bank/repos/github.com/mattpocock/skills` | Operator pipeline, skill design, shared vocabulary, grill/PRD/issues/review flow. | `docs/memory/github-research/`, `docs/memory/product/` |
| `mattpocock/dictionary-of-ai-coding` | `.krn/source-bank/repos/github.com/mattpocock/dictionary-of-ai-coding` | Shared AI coding vocabulary, failure-mode names, handoff/context language. | `docs/memory/product/` |
| `mattpocock/sandcastle` | `.krn/source-bank/repos/github.com/mattpocock/sandcastle` | Sandboxed agent orchestration and isolated execution patterns. | `docs/memory/github-research/` |
| `karpathy/autoresearch` | `.krn/source-bank/repos/github.com/karpathy/autoresearch` | Controlled metric loop for meta-research and repair attempts. | `docs/memory/github-research/`, `docs/memory/evals/` |
| `openai/openai-cookbook` | `.krn/source-bank/repos/github.com/openai/openai-cookbook` | OpenAI/Codex cookbook patterns and examples, verified against official docs when current behavior matters. | `docs/memory/openai-codex/`, `docs/plans/canonical/SOURCES.md` |
| `anthropics/anthropic-cookbook` | `.krn/source-bank/repos/github.com/anthropics/anthropic-cookbook` | Agentic workflow and evaluation examples used as comparative practitioner patterns, not OpenAI product truth. | `docs/memory/evals/`, `docs/memory/product/` |
| `SWE-agent` paper/repo | `.krn/source-bank/repos/github.com/SWE-agent/swe-agent` | Agent-computer interface design: simple commands, concise feedback, guardrails. | `docs/memory/evals/`, `docs/memory/product/` |
| `Agentless` paper/repo | `.krn/source-bank/repos/github.com/OpenAutoCoder/Agentless` | Simpler localization/repair/validation pipeline as a counterweight to complex autonomy. | `docs/memory/evals/`, `docs/memory/product/` |
| `Reflexion` paper/repo | `.krn/source-bank/repos/github.com/noahshinn/reflexion` | Verbal feedback and episodic memory pattern for repair loops. | `docs/memory/evals/` |
| `ReAct` paper/repo | `.krn/source-bank/repos/github.com/ysymyth/ReAct` | Interleaved reason/action trace pattern for tool-using agents. | `docs/memory/evals/` |

## Current Local Pins

Captured 2026-06-20:

| Source | Commit |
|---|---|
| `mattpocock/skills` | `6eeb81b` |
| `mattpocock/dictionary-of-ai-coding` | `276e3e0` |
| `mattpocock/sandcastle` | `2d93226` |
| `karpathy/autoresearch` | `228791f` |
| `openai/openai-cookbook` | `abd1e28` |
| `anthropics/anthropic-cookbook` | `34022c5` |
| `SWE-agent/swe-agent` | `abd7d69` |
| `OpenAutoCoder/Agentless` | `5ce5888` |
| `noahshinn/reflexion` | `218cf0e` |
| `ysymyth/ReAct` | `6bdb3a1` |

## Missing Source Classes

- Matt Pocock course/video transcripts or notes: store only source-backed distilled mechanisms, not raw copied transcripts.
- Karpathy broader agentic-engineering writing beyond `autoresearch`: add after primary-source inspection.
- Academic papers on agent memory, SWE agents, evals, and human-in-the-loop review: add with paper IDs and falsification paths.
- Production engineering references for deep modules, domain modeling, tests, CI, and release gates: add as source-backed mechanisms, not generic best practices.
