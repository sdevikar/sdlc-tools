# Proposal: intent:launch — Conversational Onboarding Wrapper

## Why

`intent:init` is a structured write operation that expects a mission string
and a project name. It does not help a user produce those values. In practice,
users arrive at an empty store with no guidance on how to populate mission,
MVP, or constraints — the three fields the entire system's alignment logic
depends on. Without a guided intake, users either skip these fields or write
placeholder text that makes every downstream skill useless.

`intent:launch` closes this gap by doing the intake conversationally before
calling `intent:init`. It is a SKILL.md-only change: no new code, no new
store logic, no new data model. All reasoning stays in Claude's context;
the only write happens through `intent:init` at the end.

## Prerequisites

- `direct-wire-09` applied (plugin must be runnable end-to-end)
- `mutation-skills-10` applied (so the user can correct mission/MVP/constraints
  after launch without hand-editing JSON)

## What Changes

- One new SKILL.md: `packages/claude-plugin/skills/intent-launch/SKILL.md`.
- The skill instructs Claude to:
  1. Check whether `.mission/` already exists (via `intent:status`); if yes,
     surface existing state and stop — do not re-initialize.
  2. Ask three questions in sequence, one at a time:
     - "What are you building and why does it matter?"  → `mission.statement`
     - "What's the minimum that has to work for this to be considered done?"
       → one or more `mvp.items[]`
     - "What are the hard constraints — things you won't do or lines you won't
       cross?" → zero or more `constraints[]` (user may say "none for now")
  3. Read back a one-paragraph summary of what was heard.
  4. On user confirmation, call `intent:init` with the assembled JSON.
  5. Call `intent:status` and surface the output.
- SKILL.md `use-when` trigger covers: "start a new project", "set up intent
  tracking", "initialize mission-ctrl", and `NOT_INITIALIZED` error from any
  other skill.
- No new Pi skills, no changes to `mission_ctrl_pi` or `mission_ctrl_core`.

## Non-goals

- `intent:init` is not modified — it remains the low-level write contract.
- No auto-population from README, git history, or any existing files.
- No multi-session intake (one conversation, one confirmation, one write).
- No Claude Code plugin equivalent of `on_before_send` for launch — the
  `NOT_INITIALIZED` error path handles the intercept.

## Impact

- Additive: one new SKILL.md file only.
- `claude plugin validate` must still pass.

**Done when:** opening a fresh project and typing "set up intent tracking"
walks through the three questions, reads back a summary, calls `intent:init`
on confirmation, and surfaces `intent:status` — all without the user writing
any JSON.
