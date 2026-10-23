# Proposal

## Why

The kanban-board pane opens but has no Close button and the Collapse button is easy to miss at the top. The pane also opens inline (above the prompt) rather than docked when the terminal is narrower than 110 columns, with no feedback explaining why.

## What Changes

- Add a Close button to the pane header. It calls `$.ui.close({ id: 'kanban-board' })`.
- Add `closeOnEscape: true` to the `$.ui.open()` call so Escape dismisses the pane.
- Move Collapse/Expand and Close into a single header row so both controls are visible at a glance.
- When `isPlaced` is false, print an inline message that tells the user to widen the terminal to ≥110 columns.

## Capabilities

### New Capabilities

- `pane-controls`: Close and collapse controls in the kanban-board pane header, with keyboard dismiss via Escape.

### Modified Capabilities

- `kanban-view`: Fallback message when the pane cannot be placed now reports the column requirement.

## Impact

- Modifies: `mod/kanban-board/hooks/register.tsx` (repo copy and deployed copy under `~/.claude/dev-mods/<uuid>/kanban-board/`)
- No schema or data-format changes
