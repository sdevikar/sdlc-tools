#!/usr/bin/env python3
"""Print the devflow workflow map, intent digest, and handoff pointer.

Reads SessionStart JSON on stdin. When <git root>/.devflow/ exists, it prints
hook JSON. `additionalContext` holds references/workflow-map.md, the digest of
the accepted intents in intent/<id>/intent.md, and the pointer to the current
handoff. `systemMessage` holds the pointer only. On any error, it prints nothing. It always exits 0.
"""

import glob
import json
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from latest_handoff import find, git  # noqa: E402

MAP = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "references",
    "workflow-map.md",
)
DIGEST = ("Proposed outcome", "Constraints")
MAX_LINES = 8
MAX_INTENTS = 3


def sections(path):
    found, name = {}, None
    with open(path, encoding="utf-8") as f:
        for line in f:
            if line.startswith("## "):
                name = line[3:].strip()
                found[name] = []
            elif name and line.strip():
                found[name].append(line.rstrip())
    return found


def head(path):
    """Return the title and the status from the first lines of an intent."""
    with open(path, encoding="utf-8") as f:
        top = [next(f, "") for _ in range(5)]
    title = next((l[len("# Intent:"):].strip() for l in top
                  if l.startswith("# Intent:")), "")
    status = next((m.group(1).lower() for l in top
                   for m in [re.search(r"Status:\s*(\w+)", l, re.I)] if m), "draft")
    return title, status


def digest(root):
    paths = sorted(glob.glob(os.path.join(root, "intent", "*", "intent.md")))
    accepted, drafts = [], []
    for path in paths:
        title, status = head(path)
        rel = os.path.relpath(path, root)
        if status == "accepted":
            accepted.append((title or rel, rel, path))
        elif status not in ("done", "rejected"):
            drafts.append(rel)
    if not accepted and not drafts:
        return ("No accepted intent in intent/. When the user starts new work, "
                "offer /devflow:intent once.")
    lines = ["# Accepted intents (intent/)" if accepted else "# Intents (intent/)"]
    for title, rel, path in accepted[:MAX_INTENTS]:
        found = sections(path)
        lines += ["", f"## {title} ({rel})"]
        for name in DIGEST:
            body = found.get(name, [])
            lines += ["", f"{name}:", *body[:MAX_LINES]]
            if len(body) > MAX_LINES:
                lines.append("(more in the file)")
    if len(accepted) > MAX_INTENTS:
        lines += ["", f"({len(accepted) - MAX_INTENTS} more accepted intents in intent/)"]
    if drafts:
        lines += ["", f"Draft intents waiting for review: {', '.join(drafts)}."]
    return "\n".join(lines)


def pointer(cwd):
    found = find(cwd)
    if found is None:
        return ""
    root, path, keys = found
    lines = []
    for label, key in (("Last session", "summary"), ("Next", "next")):
        value = keys.get(key, "").rstrip(".")
        if value:
            lines.append(f"{label}: {value}.")
    lines.append(
        f"Handoff: {os.path.relpath(path, root)}. Run /devflow:pickup to continue."
    )
    return "\n".join(lines)


def main():
    cwd = json.load(sys.stdin).get("cwd") or os.getcwd()
    root = git(cwd, "rev-parse", "--show-toplevel")
    if not os.path.isdir(os.path.join(root, ".devflow")):
        return
    with open(MAP, encoding="utf-8") as f:
        parts = [f.read().strip(), digest(root)]
    note = pointer(cwd)
    if note:
        parts.append(note)
    out = {
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": "\n\n".join(parts),
        }
    }
    if note:
        out["systemMessage"] = note
    print(json.dumps(out))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
