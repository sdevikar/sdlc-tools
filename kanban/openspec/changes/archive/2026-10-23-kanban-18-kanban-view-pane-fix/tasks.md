# Tasks

## 1. Fix the pane gate in register.tsx

- [x] 1.1 In `mod/kanban-board/hooks/register.tsx`, replace the `command.run` handler for `kanban-view`: remove the `e.presentation.isFullscreen` check, call `$.ui.open({ id: PANE, title: 'Kanban' })` unconditionally, check `{ isPlaced }` in the return value, and fall back to `renderInline` only when `isPlaced` is false. Verify the change compiles without error (`tsc` or `claude plugin validate`).

## 2. Remove the conflicting skill

- [x] 2.1 Delete `.claude/skills/kanban-view/SKILL.md` and verify the file is gone and no other file in `.claude/skills/kanban-view/` remains.

## 3. Deploy and verify

- [x] 3.1 Copy the updated `mod/kanban-board/hooks/register.tsx` to the deployed mod directory (`~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx`) and verify the file timestamps match.
- [x] 3.2 Reload the mod (restart the Claude Code session or re-invoke the plugin-authoring skill) and verify the mod loads without errors in the transcript.
- [x] 3.3 Run `/kanban-view` in a fullscreen terminal and verify a side pane opens instead of an inline Markdown table.
- [x] 3.4 Run `/kanban-view` in a non-pane context (e.g. `claude -p` or a narrow terminal) and verify an inline Markdown table is printed.

## Workflow follow-up

- Commit the changes to `mod/kanban-board/hooks/register.tsx` and the skill removal.
- Archive the change after tests pass.
