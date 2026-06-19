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
    "CONTEXT.md",
    "docs/memory/INDEX.md",
    "docs/product/final-product-plan.md",
    "docs/goals/goal-006.md",
    "docs/goals/goal-005.md",
    "docs/specs/technology-stack/decision.md",
    "docs/adr/0001-typescript-first-product-stack.md",
    "docs/goals/goal-004.md",
    "docs/goals/goal-003.md",
    "docs/goals/goal-002.md",
    "docs/goals/goal-001.md",
    "docs/plans/canonical/draft.md",
    "docs/plans/canonical/pattern-matrix.md",
    "docs/plans/canonical/SOURCES.md",
    "docs/plans/canonical/link-index.md",
    "docs/plans/canonical/pattern-coverage.md",
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


def checkpoint_markdown(event: str, trigger: str, turn_id: str, generated_at: str, state: list[dict[str, Any]]) -> str:
    existing_files = [item for item in state if item.get("exists")]
    missing_files = [item["path"] for item in state if not item.get("exists")]
    lines = [
        "# KRN Compact Checkpoint",
        "",
        f"- Generated: `{generated_at}`",
        f"- Event: `{event}`",
        f"- Trigger: `{trigger}`",
        f"- Turn ID: `{turn_id}`",
        f"- Project: `{ROOT}`",
        "",
        "## Resume Rule",
        "",
        "After compaction, do not rely on the compacted conversation alone.",
        "Read the latest user message, then read these repo-local files before continuing:",
        "",
        "1. `AGENTS.md`",
        "2. `docs/memory/INDEX.md`",
        "3. Active `/goal` contract if one exists; otherwise `docs/goals/goal-006.md` as the next queued goal",
        "4. `docs/product/final-product-plan.md` for product direction",
        "5. `docs/specs/technology-stack/decision.md` and `CONTEXT.md` for product implementation work",
        "6. `docs/plans/canonical/draft.md`",
        "7. `.krn/compact/latest-postcompact.md` if it exists",
        "",
        "## Key File State",
        "",
    ]
    for item in existing_files:
        lines.append(
            f"- `{item['path']}`: {item['bytes']} bytes, mtime `{item['mtime']}`, sha256 `{item['sha256'][:16]}...`"
        )
    if missing_files:
        lines.extend(["", "## Missing Optional Files", ""])
        lines.extend(f"- `{path}`" for path in missing_files)
    lines.extend(
        [
            "",
            "## Cautions",
            "",
            "- This checkpoint is continuity metadata, not source truth.",
            "- Do not treat undocumented memory as fact.",
            "- Verify the filesystem state before making implementation claims.",
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
            "1. Read `.krn/compact/latest-checkpoint.md`.",
            "2. Read `AGENTS.md`.",
            "3. Read `docs/memory/INDEX.md`.",
            "4. Re-read the newest user message in the active thread.",
            "5. Inspect current repo files before claiming state or continuing edits.",
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
    record = {
        "event": event,
        "trigger": trigger,
        "turn_id": turn_id,
        "generated_at": generated_at,
        "project_root": str(ROOT),
        "session_cwd": session_cwd,
        "key_files": state,
    }

    if event == "PreCompact":
        checkpoint_name = f"{generated_at.replace(':', '').replace('-', '')}--{short_id(turn_id)}--{short_id(trigger)}.md"
        checkpoint_path = CHECKPOINT_DIR / checkpoint_name
        markdown = checkpoint_markdown(event, trigger, turn_id, generated_at, state)
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
