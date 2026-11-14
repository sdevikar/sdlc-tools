# Tasks

## 1. Keyboard controls

- [x] 1.1 In `mod/kanban-board/hooks/register.tsx`, add `hotkey="x"` to the Close Button and `hotkey="c"` to the Collapse/Expand Button. Verify: `claude plugin validate mod/kanban-board` passes.
- [x] 1.2 In the `/kanban-view` `command.run` hook, add `focus: true` to the `$.ui.open` call. Verify: run `/kanban-view` in the classic renderer, press `x`, and the pane closes.
- [x] 1.3 Add one dim header line: `x close · c collapse · ctrl+x tab focus`. Verify: the line shows at 80 columns with no wrap.

## 2. Test

- [x] 2.1 Add `mod/kanban-board/hooks/close.test.ts`. Mount the Pane on `terminal`, press `Close`, expect one `ui.close` with `id: 'kanban-board'`. Stub `session.cwd` and `fs.read` with `{ value }`. Verify: `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1 ~/.local/share/qgenie-cli/claude-code/bin/claude plugin test mod/kanban-board` passes.
- [x] 2.2 In the same file, press the `x` hotkey path if the kit supports it; else note in the test that `press` covers click and hotkey alike. Verify: test passes.

## 3. Manual check

- [x] 3.1 Classic renderer (`CLAUDE_CODE_NO_FLICKER=0`): `/kanban-view`, press `x`. Pane closes. Run again, press Escape. Pane closes.
- [x] 3.2 Fullscreen renderer (`CLAUDE_CODE_NO_FLICKER=1`): `/kanban-view`, click Close. Pane closes.

## Workflow follow-up

- Mark `kanban-20-pane-controls` task 3.3 done only after 3.1 passes.
