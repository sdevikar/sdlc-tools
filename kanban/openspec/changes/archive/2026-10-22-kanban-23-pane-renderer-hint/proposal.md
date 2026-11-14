# Proposal

## Why

`/kanban-view` always shows the board as a full-width box above the prompt, not as a right-side pane. The pane code is not at fault: the test session runs the classic renderer, and the engine docks a pane beside the transcript only in the fullscreen renderer. The mod tells the user nothing about this. Its fallback text blames terminal width, which is wrong here.

## What Changes

- When `/kanban-view` runs with `e.presentation.isFullscreen === false`, add one line to the command output: run `/tui fullscreen` (or start with `CLAUDE_CODE_NO_FLICKER=1`) to get the side pane.
- When `$.ui.open` returns `isPlaced: false`, show the engine's `reason` instead of the fixed "Widen your terminal to ≥110 columns" text. The width rule applies only in fullscreen, and the floor is 144 columns for a pane opened unasked.
- Correct the docs. `CLAUDE.md` says non-fullscreen "prints inline to the transcript (no pane)". The code opens an inline pane above the prompt instead (since `kanban-18`).
- No change to the board layout. Lanes stay stacked top to bottom in both placements.

## Capabilities

### New Capabilities

- `pane-placement`: Where the kanban-board pane shows (docked or inline) and what the user is told about it.

### Modified Capabilities

*(none)*

## Impact

- Modifies: `mod/kanban-board/hooks/register.tsx` (the `/kanban-view` `command.run` hook only).
- Modifies: `CLAUDE.md`, section "Pane behavior".
- Supersedes the `inline-fallback-message` delta in `kanban-20-pane-controls` (the "≥110 columns" text).
- Does not change the user's renderer. That is the user's choice (`/tui`).

## Evidence

| Observation | Source |
| --- | --- |
| Test session renderer is classic: no `CLAUDE_CODE_NO_FLICKER`, no saved `tui` setting | `/proc/151899/environ`, `~/.claude.json`, `~/.claude/settings.json` |
| Session does not fetch feature flags (`CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1`) and `fullscreenUpsellSeenCount` is 3; docs table maps this to Classic | environ, `~/.claude.json`, [Fullscreen docs](https://code.claude.com/docs/en/fullscreen#fullscreen-by-default) |
| "the fullscreen layout docks a pane beside the transcript from 110 columns, the main screen places it inline above the prompt at any width" | `CommandPresentation` doc, `claude-code.d.ts` |
| Every `/kanban-view` in the session printed "Kanban board pane opened.", so `isPlaced` was true; the Markdown-table fallback never ran | `d30e58a3-….jsonl`, lines 5, 17, 54 |
| The pane tree stacks lanes in a `flexDirection="column"` Box | `register.tsx:132-158` |

## Assumptions

- "Horizontal" in the report means the inline frame spans the full terminal width above the prompt. It does not mean the Markdown table, which never ran (see Evidence).
- Confirm the renderer with one command in the test session: `/tui` (no argument). It prints the current renderer.

## Rejected Hypotheses

| Hypothesis | Why rejected |
| --- | --- |
| Terminal too narrow, so `isPlaced` is false and the table prints | Output was "pane opened" each time. Width does not matter in classic. |
| A `kanban-view` skill shadows the mod command | `kanban-18` removed it; output text matches the mod. |
| tmux forces classic | The test session (pid 151899) has no `TMUX` variable. Docs list only `tmux -CC` as forced classic. |
