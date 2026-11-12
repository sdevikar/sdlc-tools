# Proposal

## Why

Work on one branch spans many short sessions, and handoff documents connect them. In `genai-plugins-ad-data`, 28 of 150 sessions started with "Start with <handoff>". Handoffs landed in different folders with free-form names, so each new session needed the user to paste a path. The old `handoff` skill wrote to the OS temp directory. A fixed name and location, plus a pointer at session start, remove that manual step.

## What Changes

- Replace the `handoff` skill. It writes to `<project_root>/docs/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md`, with machine-readable frontmatter and a fixed set of body sections.
- Add a `pickup` skill. It finds the current handoff, compares it with the git state, reports any drift, and lists the next steps. It is not named `resume`, which is a built-in command.
- Add a `SessionStart` hook for `startup`, `clear`, and `resume`. It prints a one-line pointer to the current handoff, for Claude and for the user.
- Add a stdlib Python script that finds the current handoff, used by the hook and by `pickup`, with a `unittest` test.
- **BREAKING (user setup):** remove the personal skill link `~/.agents/skills/handoff`. The devflow skill replaces it.

## Capabilities

### New Capabilities
- `session-handoff`: where a handoff is written, what it is named, and what it contains.
- `session-pickup`: how a new session finds the current handoff and checks it against git.

### Modified Capabilities

None.

## Impact

- New files: `skills/handoff/SKILL.md`, `skills/pickup/SKILL.md`, `hooks/hooks.json`, `scripts/latest_handoff.py`, `tests/test_latest_handoff.py`. `README.md` gets a section.
- Every session start in a project with devflow runs one short Python process.
- mission-ctrl has the same requirement in `docs/proposals/handoff-pickup-27.md`. devflow does not depend on mission-ctrl.
