# Design

## Context

The engine picks the pane's seat, not the plugin. Fullscreen docks it beside the transcript from 110 columns. Classic places it inline above the prompt at any width. `command.run` carries `e.presentation.isFullscreen` and `e.presentation.columns`. `$.ui.open` returns `{ isPlaced: false, reason }` when the pane waits.

## Goals / Non-Goals

**Goals:**
- The user learns why the board is not a side pane, and the one command that changes it.

**Non-Goals:**
- Switching the renderer from the mod. No API does this, and it is the user's setting.
- A horizontal lane layout for the inline seat. Out of scope; raise a separate change if wanted.

## Decisions

**Read `e.presentation.isFullscreen`, not `isPlaced`, for the hint.** `isPlaced` is true in classic too, so it cannot tell the two seats apart. `kanban-18` moved the open/fallback gate to `isPlaced`; keep that. Use `isFullscreen` only to add the hint line.

**Hint in the command output, not a toast.** The output row stays in the transcript, so the user can read it later. A toast goes away.

**Show the engine's `reason` for `isPlaced: false`.** The engine knows the real floor (110 or 144) and the width now. A fixed string is wrong in some cases.

**Alternative rejected: go back to an inline Markdown table in classic.** `CLAUDE.md` describes this, but the inline pane still updates live and keeps the Collapse/Close controls. The table is static.

## Risks / Trade-offs

- [The hint shows on every `/kanban-view` in classic] → It is one line. Accept.
- [`/tui fullscreen` relaunches the session] → The hint text says it relaunches with the conversation kept, per the docs.
- [qgenie sessions do not fetch feature flags, so they default to classic] → The hint names the env var `CLAUDE_CODE_NO_FLICKER=1` too, for users who start through a wrapper.
