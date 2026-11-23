#!/usr/bin/env python3
"""Print the devflow workflow map, charter digest, and handoff pointer.

Reads SessionStart JSON on stdin. When <git root>/.devflow/ exists, it prints
hook JSON. `additionalContext` holds references/workflow-map.md, the digest of
.devflow/charter.md, and the pointer to the current handoff. `systemMessage`
holds the pointer only. On any error, it prints nothing. It always exits 0.
"""

import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from latest_handoff import find, git  # noqa: E402

MAP = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "references",
    "workflow-map.md",
)
DIGEST = ("Goal", "Done means", "Process", "Out of scope")
MAX_LINES = 8


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


def digest(root):
    path = os.path.join(root, ".devflow", "charter.md")
    if not os.path.exists(path):
        return ("No charter in .devflow/charter.md. When the user starts new "
                "work, offer /devflow:charter once.")
    found = sections(path)
    lines = ["# Charter (.devflow/charter.md)"]
    for name in DIGEST:
        body = found.get(name, [])
        lines += ["", f"{name}:", *body[:MAX_LINES]]
        if len(body) > MAX_LINES:
            lines.append("(more in the file)")
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
