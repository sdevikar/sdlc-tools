#!/usr/bin/env python3
"""Ask the session agent to update the handoff at a milestone.

`--start` mode (SessionStart) records the session baseline: HEAD and time, in
<git root>/.devflow/.checkpoint/<session_id>.json. It keeps an existing
baseline, so a compaction does not reset it.

Stop mode compares the work against the baseline. The signals are a new HEAD,
a changed file in .devflow/{plans,analysis,research,reviews}, and an OpenSpec
change that was archived or got its last task checked. On a signal, it moves
the baseline forward first, then prints hook JSON that asks the agent once.

It prints nothing when `stop_hook_active` is true, when DEVFLOW_CHECKPOINT=off,
when the session's own handoff is newer than every signal, and on any error.
It always exits 0.
"""

import glob
import json
import os
import re
import subprocess
import sys
import time

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from latest_handoff import frontmatter, git  # noqa: E402

DOC_DIRS = ("plans", "analysis", "research", "reviews")
BOX_RE = re.compile(r"^\s*[-*] \[(.*?)\]", re.MULTILINE)


def head(root):
    try:
        return git(root, "rev-parse", "HEAD")
    except subprocess.CalledProcessError:
        return ""


def all_checked(path):
    with open(path, encoding="utf-8") as f:
        boxes = BOX_RE.findall(f.read())
    return bool(boxes) and all(b.strip().lower() == "x" for b in boxes)


def signals(root, state):
    """Return (time, reason) for each signal newer than the baseline."""
    since = state["time"]
    found = []
    sha = head(root)
    if sha and sha != state["head"]:
        when = float(git(root, "log", "-1", "--format=%ct"))
        found.append((when, f"new commit {sha[:7]}"))
    for kind in DOC_DIRS:
        for folder, _, files in os.walk(os.path.join(root, ".devflow", kind)):
            for name in files:
                path = os.path.join(folder, name)
                when = os.path.getmtime(path)
                if when > since:
                    found.append((when, f"new or changed {os.path.relpath(path, root)}"))
    for base in glob.glob(os.path.join(root, "openspec")) + glob.glob(
        os.path.join(root, "*", "openspec")
    ):
        for path in glob.glob(os.path.join(base, "changes", "archive", "*")):
            when = os.path.getmtime(path)
            if os.path.isdir(path) and when > since:
                found.append((when, f"OpenSpec change archived: {os.path.basename(path)}"))
        for path in glob.glob(os.path.join(base, "changes", "*", "tasks.md")):
            when = os.path.getmtime(path)
            if when > since and all_checked(path):
                name = os.path.basename(os.path.dirname(path))
                found.append((when, f"all tasks checked in OpenSpec change {name}"))
    return found


def session_handoff_time(root, session):
    times = [0.0]
    for path in glob.glob(os.path.join(root, ".devflow", "handoffs", "*.md")):
        if frontmatter(path).get("session") == session:
            times.append(os.path.getmtime(path))
    return max(times)


def request(reasons):
    shown = "; ".join(reasons[:3]) + ("; and more" if len(reasons) > 3 else "")
    return (
        f"devflow checkpoint: {shown}. Decide if the next session needs this in "
        "the handoff. If yes, run /devflow:handoff to update this session's "
        "handoff in place, and report the path in one line. If no, reply with "
        "only: Handoff current."
    )


def main():
    data = json.load(sys.stdin)
    start = "--start" in sys.argv[1:]
    if not start and (
        data.get("stop_hook_active") or os.environ.get("DEVFLOW_CHECKPOINT") == "off"
    ):
        return
    session = data.get("session_id") or ""
    if not re.fullmatch(r"[A-Za-z0-9_-]+", session):
        return
    root = git(data.get("cwd") or os.getcwd(), "rev-parse", "--show-toplevel")
    if not os.path.isdir(os.path.join(root, ".devflow")):
        return
    path = os.path.join(root, ".devflow", ".checkpoint", f"{session}.json")
    now = {"head": head(root), "time": time.time()}
    if not os.path.exists(path):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w") as f:
            json.dump(now, f)
        return
    if start:
        return
    with open(path) as f:
        found = signals(root, json.load(f))
    if not found:
        return
    with open(path, "w") as f:
        json.dump(now, f)
    if session_handoff_time(root, session) >= max(when for when, _ in found):
        return
    print(json.dumps({
        "hookSpecificOutput": {
            "hookEventName": "Stop",
            "additionalContext": request([reason for _, reason in found]),
        }
    }))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        pass
    sys.exit(0)
