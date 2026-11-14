# Tasks

## 1. Command output

- [x] 1.1 In the `/kanban-view` `command.run` hook in `mod/kanban-board/hooks/register.tsx`, when `e.presentation.isFullscreen` is false, append a hint line to `{ text }`: `/tui fullscreen` (relaunches, keeps the conversation) or `CLAUDE_CODE_NO_FLICKER=1`. Verify: `/kanban-view` in a classic session shows the line; in a fullscreen session it does not.
- [x] 1.2 Replace the fixed "Widen your terminal to ≥110 columns" text with the `reason` from `$.ui.open`. Verify: `claude plugin validate mod/kanban-board` passes; the type-check accepts `reason` on the `isPlaced: false` arm.

## 2. Test

- [x] 2.1 Add a test in `mod/kanban-board/hooks/`: raise `command.run` for `kanban-view` with `presentation: { isFullscreen: false, columns: 120 }` and expect the hint in `text`; again with `isFullscreen: true` and expect no hint. Verify: `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 ~/.local/share/qgenie-cli/claude-code/bin/claude plugin test mod/kanban-board` passes.

## 3. Docs

- [x] 3.1 In `CLAUDE.md` "Pane behavior", replace "Non-fullscreen: prints inline to the transcript (no pane)" with: classic renderer opens the pane above the prompt; `/tui fullscreen` gives the side pane. Verify: read the section.
- [x] 3.2 In `README.md`, add a short note on the renderer requirement for the side pane. Verify: read the section.

## Workflow follow-up

- Drop or rewrite the `inline-fallback-message` delta in `kanban-20-pane-controls` before it archives, since this change supersedes it.
