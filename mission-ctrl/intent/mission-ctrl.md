# Intent: mission-ctrl

**Author:** Swapnil Devikar
**Status:** Superseded on 2026-11-14. The edit guard below is out of scope. mission-ctrl is now the intent layer that judges ideas before they become proposals. See the root `README.md` and `.mission/mission.json` (v3.0). Kept for history: v2 (reset on 2026-10-26, see `docs/reset-2026-10-26.md`)

---

## Problem

Claude Code writes code fast. It also drifts fast. You agree on a plan, and twenty minutes later Claude edits files the plan never named, or adds a feature you did not ask for. You notice only when you read the diff.

The cost is not the bad edit. The cost is that you must watch every step to catch it. And when you come back the next day, you must rebuild the plan in your head before you can judge anything.

## Proposed outcome

A Claude Code plugin that holds the agreed plan for the current piece of work, and checks Claude's edits against it.

1. You and Claude agree on a short design: goal, what is in scope, what is out of scope, which files you expect to change.
2. While Claude works, each `Edit` or `Write` goes to a small, fast model with the design. The model returns `fits`, `drift`, or `unclear`.
3. `fits` passes with no prompt. `drift` stops and asks you, with a one-line reason. You allow it, refuse it, or widen the design.
4. When you come back, a recap tells you the active design and what changed since.

The LLM makes the judgment calls. Python stores the state and checks the data. A thin mod connects the two inside Claude Code.

## Users

Solo developers and small teams who use Claude Code for multi-session work. They already like plans and specs, and they lose time when Claude leaves the plan.

## Systems

- Claude Code (only host): skills, a SessionStart hook, and one mod.
- `.mission/` store in the repo: JSON plus one Markdown file per design.
- `bin/mission-ctrl` (Python): every store write and data check.
- `AGENTS.md`: generated from the store, read by Claude Code.

## Constraints

See `.mission/constraints.json`. In short: Claude Code only; the guard fails open; Python owns every write; every verdict is logged.

## Out of scope for v2

Pi, the TS bridge, the Agent SDK, external trackers, backlog ranking, auto-triage, insights, and any second host.

## Open questions

- Does `$.model.complete` with a small model judge an edit in under 3 s on this machine? Measure this on day 1.
- How much of the edit to send: the full diff, or file path plus the first N lines of the change?
- When a spec has no design, should the guard stay silent or ask once per session?
