# Design

## Context

The kanban-board mod renders its pane via a `ui.render` hook in `mod/kanban-board/hooks/register.tsx`. The current render places a single Collapse/Expand `Button` at the top, then lane headers and entries below. There is no Close button and no `closeOnEscape` on the open call.

The `$.ui.close({ id })` API is available. `PaneOpenArgs` accepts `closeOnEscape: true`.

## Goals / Non-Goals

**Goals:**
- Add a Close button that calls `$.ui.close({ id: PANE })`
- Add `closeOnEscape: true` to the `$.ui.open()` call
- Group Collapse/Expand and Close in one `flexDirection="row"` header Box
- Show a helpful message when `isPlaced` is false

**Non-Goals:**
- Changing pane placement behavior (controlled by the surface, not the mod)
- Styling or colors (that is kanban-21)

## Decisions

**Header row layout**: Replace the current standalone `<Button>Collapse</Button>` Box with a `<Box flexDirection="row" justifyContent="space-between">` containing both buttons. This keeps them visually paired and easy to reach.

**Close implementation**: `$.ui.close({ id: PANE })` inside the Button's `onPress`. This is the canonical API call — no extra state needed.

**Inline fallback**: When `isPlaced` is false, return `{ text: '> Widen your terminal to ≥110 columns to open the kanban side pane.\n\n' + renderInline(entries) }`.

## Risks / Trade-offs

None. All changes are additive to the existing render hook.
