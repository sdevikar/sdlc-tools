#!/usr/bin/env python3
"""Find the current handoff for the git branch in the working directory.

The current handoff is the file in <git root>/.devflow/handoffs/ whose
frontmatter `branch` matches the current branch and whose `status` is not
`done`, with the newest timestamp in its file name.

Plain mode prints the absolute path. `--hook` mode reads SessionStart JSON on
stdin and prints hook JSON with a one-line pointer. On any error, or when no
handoff matches, the script prints nothing and exits 0.
"""

import json
import os
import re
import subprocess
import sys

NAME_RE = re.compile(r"^handoff_.+_(\d{8}-\d{4})\.md$")


def git(cwd, *args):
    out = subprocess.run(
        ["git", *args], cwd=cwd, capture_output=True, text=True, check=True
    )
    return out.stdout.strip()


def frontmatter(path):
    with open(path, encoding="utf-8") as f:
        if f.readline().strip() != "---":
            return {}
        keys = {}
        for line in f:
            if line.strip() == "---":
                return keys
            key, sep, value = line.partition(":")
            if sep:
                keys[key.strip()] = value.strip()
    return {}


def find(cwd):
    """Return (git root, handoff path, frontmatter), or None."""
    root = git(cwd, "rev-parse", "--show-toplevel")
    branch = git(cwd, "branch", "--show-current")
    folder = os.path.join(root, ".devflow", "handoffs")
    if not branch or not os.path.isdir(folder):
        return None
    best = None
    for name in os.listdir(folder):
        match = NAME_RE.match(name)
        if not match:
            continue
        path = os.path.join(folder, name)
        keys = frontmatter(path)
        if keys.get("branch") != branch or keys.get("status") == "done":
            continue
        rank = (match.group(1), name)
        if best is None or rank > best[0]:
            best = (rank, path, keys)
    if best is None:
        return None
    return root, best[1], best[2]


def hook_output(root, path, keys):
    line = f"Handoff for this branch: {os.path.relpath(path, root)}."
    next_step = keys.get("next", "").rstrip(".")
    if next_step:
        line += f" Next: {next_step}."
    line += " Run /devflow:pickup to continue."
    return {
        "systemMessage": line,
        "hookSpecificOutput": {
            "hookEventName": "SessionStart",
            "additionalContext": line,
        },
    }


def main():
    if "--hook" in sys.argv[1:]:
        cwd = json.load(sys.stdin).get("cwd") or os.getcwd()
    else:
        cwd = os.getcwd()
    found = find(cwd)
    if found is None:
        return
    if "--hook" in sys.argv[1:]:
        print(json.dumps(hook_output(*found)))
    else:
        print(found[1])


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
