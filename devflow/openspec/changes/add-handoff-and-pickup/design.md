# Design

## Context

See proposal.md for the motivation. A plugin `SessionStart` hook receives JSON on stdin with a `cwd` field. Plain stdout or `hookSpecificOutput.additionalContext` reaches Claude only. A top-level `systemMessage` reaches the user. Output is capped at 10,000 characters. `${CLAUDE_PLUGIN_ROOT}` is substituted in hook arguments and in skill bodies.

## Goals / Non-Goals

**Goals:**
- Zero typed paths to continue work on a branch.
- A hook that never blocks or slows a session start.

**Non-Goals:**
- An index file of handoffs. The file name and frontmatter are enough.
- Loading the handoff body at session start.
- Integration with mission-ctrl.

## Decisions

- **Frontmatter parsed by hand, no YAML library.** The keys are flat `key: value` lines. This keeps the script stdlib-only, so it runs with any `python3`.
- **Time from the file name, no `created` key.** The name already sorts by time. A second time field could disagree with it.
- **Match on the frontmatter `branch`, not the slug.** On `main` the slug is a topic, and `/` becomes `-`, so the slug does not map back to a branch.
- **One script for the hook and the skill.** `--hook` mode reads stdin JSON and prints hook JSON. Plain mode prints the path. The lookup rule lives in one place.
- **Exec form in `hooks.json`** (`command: python3`, `args: [...]`). This avoids shell quoting of `${CLAUDE_PLUGIN_ROOT}`.
- **Skip `compact` in the matcher.** After a compaction the session still holds the work.
- **Pointer, not content.** One line keeps the per-session context cost small. The pickup skill reads the full file on demand.

## Risks / Trade-offs

- [The user does not see `additionalContext`] → Also print `systemMessage`.
- [A handoff with a broken frontmatter gets skipped] → The lookup ignores files without a `branch` key. The skill always writes all keys.
- [The hook fails on a machine without `python3`] → It exits with an error, and Claude Code does not block the session on that. Accepted.

## Migration Plan

1. Install the new plugin version in each project.
2. Remove the link `~/.agents/skills/handoff`. Its target in `agent-skills` stays.
3. Old handoffs in other folders stay where they are. The lookup does not see them.
