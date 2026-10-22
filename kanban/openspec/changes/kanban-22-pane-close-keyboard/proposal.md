# Proposal

## Why

The Close button in the kanban-board pane does nothing when the user clicks it. The test session runs the classic renderer, and the classic renderer does not send mouse clicks to Claude Code. The button handler is correct: an engine test shows that a press reaches `ui.close`. The user has no way to press the button.

## What Changes

- Give the Close button a hotkey (`x`), and the Collapse/Expand button a hotkey (`c`). A hotkey works in both renderers when the pane holds focus.
- Open the pane with `focus: true` from `/kanban-view`, so the hotkeys and Escape work at once without `ctrl+x tab`.
- Show the hotkey and the focus chord in the pane header, so the user knows how to close it without a mouse.
- Add `claude plugin test` coverage: a press on Close raises `ui.close` for `kanban-board`.

## Capabilities

### New Capabilities

- `pane-controls`: How the user closes and collapses the kanban-board pane, with or without a mouse.

### Modified Capabilities

*(none)*

## Impact

- Modifies: `mod/kanban-board/hooks/register.tsx`. The dev-mods folder holds a symlink to this folder, so one edit covers both.
- Adds: `mod/kanban-board/hooks/close.test.ts`.
- Overlaps `kanban-20-pane-controls`, which added the Close button and marked it done. This change fixes its scenario `user presses Close` for the classic renderer.

## Evidence

| Observation | Source |
| --- | --- |
| Test session renderer is classic: process `151899`, `TERM=xterm-256color`, no `CLAUDE_CODE_NO_FLICKER`, no `tui` setting | `/proc/151899/environ`, `~/.claude.json`, `~/.claude/settings.json` |
| Session started through `qgenie claude` over SSH; `CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC=1` set, so it does not fetch feature flags | process tree, environ |
| Mouse clicks reach plugins only "where the surface reports clicks (the fullscreen terminal …)" | plugin-authoring `reference.md` |
| Classic renderer: "the terminal handles selection" — fullscreen captures mouse events | [Fullscreen docs](https://code.claude.com/docs/en/fullscreen) |
| `$.ui.mount` + `press({ key: 'Close' })` on CLI 2.1.296 raises `ui.close` with `{ id: 'kanban-board', origin: plugin }` | scratch test in `/tmp/kanban-rca` |
| No error lines for Close in the session transcript after the 18:41 reload | `d30e58a3-….jsonl` |

## Rejected Hypotheses

| Hypothesis | Why rejected |
| --- | --- |
| `onPress` drops the un-awaited `$.ui.close` promise | Engine test passes with the current sync handler. |
| The render hook throws, so the engine draws its own tree without the button | The `$.state.get takes a reference` error came at 18:33, before the 18:36 and 18:41 reloads. No later error. The engine test draws both buttons. |
| A `ui.close` hook refuses the close | No such hook in the mod; validate lists none. |
