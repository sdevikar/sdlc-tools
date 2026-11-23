#!/usr/bin/env python3
"""Find the current handoff for the git branch in the working directory.

The current handoff is the file in <git root>/.devflow/handoffs/ whose
frontmatter `branch` matches the current branch and whose `status` is not
`done`, with the newest modification time. The handoff skill rewrites a
session's file in place, so the name timestamp is the creation time only.

It prints the absolute path. On any error, or when no handoff matches, it
prints nothing and exits 0. scripts/session_start.py reuses `find`.
"""

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
        rank = (os.path.getmtime(path), name)
        if best is None or rank > best[0]:
            best = (rank, path, keys)
    if best is None:
        return None
    return root, best[1], best[2]


def main():
    found = find(os.getcwd())
    if found is not None:
        print(found[1])


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
