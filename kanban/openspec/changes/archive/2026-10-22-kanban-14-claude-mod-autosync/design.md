# Design

## Context

See proposal.md for motivation. The mod (`hooks/register.tsx`) has a `ui.render` hook that already reads `docs/kanban.yaml` on every render. What it lacks is a trigger to re-render when the file changes.

## Goals / Non-Goals

**Goals:**
- Re-render the pane after `Write`/`Edit` to `kanban.yaml`
- Re-render the pane after kanban commands complete
- Guard: skip invalidate when the pane is not open

**Non-Goals:**
- File watching at OS level (no `fs.watch`)
- Storing parsed entries in state between renders
- Refreshing the inline (non-pane) render path

## Decisions

### Hook events: `tool.call` (post) + `command.run` (post)

After `next(e)` runs the tool or command, check the condition and call `$.ui.invalidate("ui.render")`.

Alternatives considered:
- `classic.PostToolUse` — works but `tool.call` with `next(e)` is the native mod pattern
- Storing parsed entries in an atom and reading from state in `ui.render` — adds complexity; the existing render already reads the file, so no benefit

### Pane visibility guard: `$.ui.panes()`

Call `await $.ui.panes()` and check `panes.some(p => p.id === PANE)` before invalidating. This avoids a no-op invalidate when the pane is closed.

Alternative considered: add a `paneOpen` atom — unnecessary since `$.ui.panes()` already tracks it.

### No toast / no transcript output

The refresh happens inside `tool.call` and `command.run` post-hooks. Returning `result` from `next(e)` unchanged means the engine sees an unmodified result — no side-channel output.

## Risks / Trade-offs

- `$.ui.panes()` call adds one async round-trip per Write/Edit. Cost is negligible (pane list is small).
- `tool.call` hooks fire on every Write/Edit in the session. The `file_path.includes('kanban.yaml')` check is cheap and short-circuits for non-kanban files.
