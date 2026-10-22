# Tasks

## 1. Update pane open call

- [x] 1.1 In `mod/kanban-board/hooks/register.tsx`, add `closeOnEscape: true` to the `$.ui.open({ id: PANE, title: 'Kanban' })` call.
- [x] 1.2 Update the `isPlaced: false` fallback to return `{ text: '> Widen terminal to ≥110 columns for the side pane.\n\n' + renderInline(entries) }`. Read the file inside the fallback branch (same as current code).

## 2. Replace header controls

- [x] 2.1 In the `ui.render` handler, replace the standalone Collapse/Expand `<Box marginBottom={1}><Button>...</Button></Box>` with a `<Box flexDirection="row" justifyContent="space-between" marginBottom={1}>` containing two Buttons: Collapse/Expand (left) and Close (right).
- [x] 2.2 The Close Button's `onPress` calls `await $.ui.close({ id: PANE })`.

## 3. Deploy and verify

- [x] 3.1 Copy updated `register.tsx` to the deployed mod path: `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx`.
- [x] 3.2 Reload the mod (`/reload` or restart Claude Code). Run `/kanban-view` and confirm the header row shows Collapse and Close buttons.
- [x] 3.3 Press Close — confirm the pane closes. Press Escape while the pane holds focus — confirm the pane closes.
- [x] 3.4 Narrow the terminal below 110 columns, run `/kanban-view`, and confirm the inline fallback message includes the column hint.
