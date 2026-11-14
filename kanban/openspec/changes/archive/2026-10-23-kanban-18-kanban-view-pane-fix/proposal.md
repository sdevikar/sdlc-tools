# Proposal

## Why

The `/kanban-view` mod command always renders the board inline as a Markdown table, even in a fullscreen terminal. The handler gates pane opening on `e.presentation.isFullscreen`, but that flag reflects the terminal's alternate-screen mode — a session-start property that can be false even when the user's terminal is maximized. A second issue: `.claude/skills/kanban-view/SKILL.md` exists with the same command name. If the mod is not loaded, the skill handles the command and always renders inline.

## What Changes

- Replace the `e.presentation.isFullscreen` gate in `register.tsx`'s `command.run` hook with a check on `{ isPlaced }` returned by `$.ui.open()`. Call `$.ui.open()` unconditionally; fall back to inline only when `isPlaced` is `false`.
- Remove `.claude/skills/kanban-view/SKILL.md`. The mod owns `/kanban-view` now. The skill is a fallback that masks the bug and conflicts with the registered command.
- Sync `mod/kanban-board/hooks/register.tsx` (repo copy) with the deployed copy under `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx`.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

- `kanban-view`: The command opens a side pane when the surface supports it, and falls back to inline Markdown only when the pane cannot be placed.

## Impact

- Modifies: `mod/kanban-board/hooks/register.tsx` (repo copy and deployed copy)
- Removes: `.claude/skills/kanban-view/SKILL.md`
- No change to output format when a pane cannot be placed
