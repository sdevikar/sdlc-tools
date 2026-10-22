# Tasks

## 1. Implement autosync hooks

- [x] 1.1 Add `tool.call` hooks for `Write` and `Edit` in `mod/kanban-board/hooks/register.tsx`: after `next(e)`, check `e.file_path.includes('kanban.yaml')` and call `$.ui.invalidate('ui.render')` if the pane is open. Verify: run `/kanban-view` to open the pane, let Claude write `docs/kanban.yaml`, observe the pane updates without user action.
- [x] 1.2 Add `command.run` hooks for `kanban-sync`, `kanban-render`, `opsx-archive`, and `opsx-propose` in the same file: after `next(e)`, call `$.ui.invalidate('ui.render')` if the pane is open. Verify: run `/kanban-view` then `/kanban-sync`; observe the pane updates.
- [x] 1.3 Sync the deployed mod at `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx` to match the project source. Verify: file contents match between project source and deployed path.

## Workflow follow-up

- Reload the mod in Claude Code and smoke-test the golden path: open pane, write kanban.yaml, confirm pane updates silently.
- Archive the change after verification.
