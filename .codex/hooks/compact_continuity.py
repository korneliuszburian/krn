#!/usr/bin/env python3
"""Project-local Codex compact continuity hook.

The hook writes repo-local checkpoint files around Codex compaction. It does
not call models, external services, global memory, or user-level config.
"""

from __future__ import annotations

import datetime as dt
import hashlib
import json
import os
import subprocess
import sys
import traceback
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[2]
COMPACT_DIR = ROOT / ".krn" / "compact"
CHECKPOINT_DIR = COMPACT_DIR / "checkpoints"
EVENT_DIR = COMPACT_DIR / "events"
RESUME_DIR = COMPACT_DIR / "resume"
LATEST_CHECKPOINT = COMPACT_DIR / "latest-checkpoint.md"
LATEST_POSTCOMPACT = COMPACT_DIR / "latest-postcompact.md"
EVENT_LOG = EVENT_DIR / "compact-events.jsonl"

KEY_FILES = [
    "AGENTS.md",
    "docs/memory/INDEX.md",
    "docs/goals/INDEX.md",
    "docs/goals/goal-038.md",
    "docs/plans/canonical/draft.md",
    "docs/plans/canonical/SOURCES.md",
]

ON_DEMAND_FILES = [
    "CONTEXT.md",
    "docs/specs/technology-stack/decision.md",
    "docs/plans/canonical/draft.md",
    "docs/plans/canonical/pattern-matrix.md",
]


def utc_now() -> str:
    return dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def read_hook_input() -> dict[str, Any]:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        data = json.loads(raw)
    except json.JSONDecodeError:
        return {"_unparsed_stdin_sha256": hashlib.sha256(raw.encode("utf-8", "replace")).hexdigest()}
    return data if isinstance(data, dict) else {"_non_object_input_type": type(data).__name__}


def safe_value(data: dict[str, Any], key: str, default: str = "unknown") -> str:
    value = data.get(key, default)
    if value is None:
        return default
    return str(value)


def short_id(value: str) -> str:
    cleaned = "".join(ch if ch.isalnum() or ch in ("-", "_") else "-" for ch in value)
    cleaned = "-".join(part for part in cleaned.split("-") if part)
    return (cleaned or "unknown")[:80]


def file_summary(relative_path: str) -> dict[str, Any]:
    path = ROOT / relative_path
    if not path.exists():
        return {"path": relative_path, "exists": False}
    if not path.is_file():
        return {"path": relative_path, "exists": True, "type": "not-file"}
    content = path.read_bytes()
    stat = path.stat()
    return {
        "path": relative_path,
        "exists": True,
        "bytes": stat.st_size,
        "mtime": dt.datetime.fromtimestamp(stat.st_mtime, dt.timezone.utc)
        .replace(microsecond=0)
        .isoformat()
        .replace("+00:00", "Z"),
        "sha256": hashlib.sha256(content).hexdigest(),
    }


def run_command(args: list[str]) -> list[str]:
    try:
        result = subprocess.run(
            args,
            cwd=ROOT,
            check=False,
            capture_output=True,
            text=True,
            timeout=5,
        )
    except Exception:
        return []
    if result.returncode != 0:
        return []
    return [line for line in result.stdout.splitlines() if line.strip()]


def git_status_lines() -> list[str]:
    return run_command(["git", "status", "--short"])


def recent_goal_paths(limit: int = 4) -> list[str]:
    goal_dir = ROOT / "docs" / "goals"
    if not goal_dir.exists():
        return []
    paths = sorted(goal_dir.glob("goal-[0-9][0-9][0-9].md"), reverse=True)
    return [str(path.relative_to(ROOT)) for path in paths[:limit]]


def changed_paths(status_lines: list[str], limit: int = 16) -> list[str]:
    paths: list[str] = []
    for line in status_lines:
        candidate = line[3:] if len(line) > 3 else line
        candidate = candidate.split(" -> ")[-1].strip()
        if candidate and candidate not in paths:
            paths.append(candidate)
    return paths[:limit]


def ensure_dirs() -> None:
    CHECKPOINT_DIR.mkdir(parents=True, exist_ok=True)
    EVENT_DIR.mkdir(parents=True, exist_ok=True)
    RESUME_DIR.mkdir(parents=True, exist_ok=True)


def write_text_atomic(path: Path, content: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    tmp_path = path.with_name(f".{path.name}.tmp-{os.getpid()}")
    tmp_path.write_text(content, encoding="utf-8")
    os.replace(tmp_path, path)


def append_event(event: dict[str, Any]) -> None:
    with EVENT_LOG.open("a", encoding="utf-8") as handle:
        handle.write(json.dumps(event, ensure_ascii=True, sort_keys=True) + "\n")


def checkpoint_markdown(
    event: str,
    trigger: str,
    turn_id: str,
    generated_at: str,
    state: list[dict[str, Any]],
    status_lines: list[str],
    goal_paths: list[str],
) -> str:
    existing_files = [item for item in state if item.get("exists")]
    changed = changed_paths(status_lines)
    lines = [
        "# KRN Compact Checkpoint",
        "",
        f"- Generated: `{generated_at}`",
        f"- Event: `{event}`",
        f"- Trigger: `{trigger}`",
        f"- Turn ID: `{turn_id}`",
        f"- Project: `{ROOT}`",
        "",
        "## Token-Efficient Resume Selector",
        "",
        "After compaction, do not rely on the compacted conversation alone, but do not reload the whole repo context either.",
        "Default resume budget: load selectors first, then only the files needed for the newest user request.",
        "",
        "1. Re-read the newest user message.",
        "2. Read `.krn/compact/latest-postcompact.md` and this selector.",
        "3. Run `git status -sb` and inspect only changed or task-relevant files.",
        "4. Read `AGENTS.md` for hard repo rules if the resumed context does not already include it.",
        "5. Read `docs/goals/INDEX.md` and `docs/goals/goal-038.md` if continuing KRN final-product work; use older goals only when the selector names them.",
        "6. Use `docs/memory/INDEX.md` only as a selector for relevant notes.",
        "7. Use `docs/plans/canonical/SOURCES.md` through `rg` for specific source/claim IDs; do not load it wholesale by default.",
        "",
        "Load on demand only:",
        "",
        "- `docs/plans/canonical/draft.md` when product direction is unclear or changing.",
        "- `CONTEXT.md` when domain terms are unclear.",
        "- `docs/specs/technology-stack/decision.md` when stack boundaries are changing.",
        "- `docs/plans/canonical/draft.md` or `pattern-matrix.md` only for synthesis/refactor work that names them.",
        "- Older goals only when the active goal, task registry, or changed files reference them.",
        "",
    ]
    if goal_paths:
        lines.extend(["## Recent Goal Candidates", ""])
        lines.extend(f"- `{path}`" for path in goal_paths)
        lines.append("")
    if status_lines:
        lines.extend(["## Git Status At Compact", ""])
        lines.extend(f"- `{line}`" for line in status_lines[:20])
        if len(status_lines) > 20:
            lines.append(f"- ... {len(status_lines) - 20} more entries")
        lines.append("")
    if changed:
        lines.extend(["## Changed Paths To Inspect First", ""])
        lines.extend(f"- `{path}`" for path in changed)
        lines.append("")
    lines.extend(["## Key File Fingerprints", ""])
    for item in existing_files:
        lines.append(
            f"- `{item['path']}`: {item['bytes']} bytes, mtime `{item['mtime']}`, sha256 `{item['sha256'][:16]}...`"
        )
    lines.extend(["", "## On-Demand Heavy Files", ""])
    lines.extend(f"- `{path}`" for path in ON_DEMAND_FILES)
    lines.extend(
        [
            "",
            "## Cautions",
            "",
            "- This checkpoint is continuity metadata, not source truth.",
            "- Do not treat undocumented memory as fact.",
            "- Verify the filesystem state before making implementation claims.",
            "- Do not reread full canonical/source files unless the selector or newest user request requires it.",
            "- Keep hook output free of secrets and raw transcripts.",
            "",
        ]
    )
    return "\n".join(lines)


def postcompact_markdown(trigger: str, turn_id: str, generated_at: str, checkpoint_exists: bool) -> str:
    status = "available" if checkpoint_exists else "missing"
    return "\n".join(
        [
            "# KRN Post-Compact Resume Gate",
            "",
            f"- Generated: `{generated_at}`",
            f"- Trigger: `{trigger}`",
            f"- Turn ID: `{turn_id}`",
            f"- Latest checkpoint: `{status}`",
            "",
            "## Required Resume Steps",
            "",
            "1. Re-read the newest user message in the active thread.",
            "2. Read `.krn/compact/latest-checkpoint.md` as a selector, not as a command to reload all docs.",
            "3. Run `git status -sb`.",
            "4. Inspect changed files and the active child goal before broader docs.",
            "5. Use `docs/memory/INDEX.md` and `docs/plans/canonical/SOURCES.md` only for targeted lookup unless the task is research/synthesis.",
            "",
            "If the latest checkpoint is missing, stop and recreate project state from repo files before continuing.",
            "",
        ]
    )


def emit(should_continue: bool) -> None:
    print(json.dumps({"continue": should_continue}, ensure_ascii=True))


def main() -> int:
    event = sys.argv[1] if len(sys.argv) > 1 else "Unknown"
    data = read_hook_input()
    generated_at = utc_now()
    trigger = safe_value(data, "trigger")
    turn_id = safe_value(data, "turn_id")
    session_cwd = safe_value(data, "cwd", os.getcwd())
    ensure_dirs()

    state = [file_summary(path) for path in KEY_FILES]
    status_lines = git_status_lines()
    goal_paths = recent_goal_paths()
    record = {
        "event": event,
        "trigger": trigger,
        "turn_id": turn_id,
        "generated_at": generated_at,
        "project_root": str(ROOT),
        "session_cwd": session_cwd,
        "key_files": state,
        "git_status": status_lines[:40],
        "recent_goals": goal_paths,
    }

    if event == "PreCompact":
        checkpoint_name = f"{generated_at.replace(':', '').replace('-', '')}--{short_id(turn_id)}--{short_id(trigger)}.md"
        checkpoint_path = CHECKPOINT_DIR / checkpoint_name
        markdown = checkpoint_markdown(event, trigger, turn_id, generated_at, state, status_lines, goal_paths)
        write_text_atomic(checkpoint_path, markdown)
        write_text_atomic(LATEST_CHECKPOINT, markdown)
        record["checkpoint_path"] = str(checkpoint_path.relative_to(ROOT))
        append_event(record)
        emit(True)
        return 0

    if event == "PostCompact":
        checkpoint_exists = LATEST_CHECKPOINT.exists()
        markdown = postcompact_markdown(trigger, turn_id, generated_at, checkpoint_exists)
        resume_path = RESUME_DIR / f"{generated_at.replace(':', '').replace('-', '')}--{short_id(turn_id)}--{short_id(trigger)}.md"
        write_text_atomic(resume_path, markdown)
        write_text_atomic(LATEST_POSTCOMPACT, markdown)
        record["resume_path"] = str(resume_path.relative_to(ROOT))
        record["latest_checkpoint_exists"] = checkpoint_exists
        append_event(record)
        emit(checkpoint_exists)
        return 0

    record["warning"] = "unknown event"
    append_event(record)
    emit(True)
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except Exception as exc:
        try:
            ensure_dirs()
            error_path = COMPACT_DIR / "latest-hook-error.txt"
            write_text_atomic(error_path, f"{utc_now()} {type(exc).__name__}: {exc}\n{traceback.format_exc()}")
        finally:
            print(json.dumps({"continue": False}, ensure_ascii=True))
        raise SystemExit(0)
