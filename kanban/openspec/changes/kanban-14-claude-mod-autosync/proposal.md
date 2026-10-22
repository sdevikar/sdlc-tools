## Why

The pane from `kanban-13-claude-mod-pane` opens on demand but does not update when `docs/kanban.yaml` changes. After running `/kanban-sync`, `/opsx-archive`, or any other command that writes to the file, the pane shows stale data until the user closes and reopens it.

This change adds live sync: the mod watches for writes to `kanban.yaml` and re-reads the file automatically. The pane updates without any user action.

## What Changes

- Extend the mod's `hooks/register.tsx` with two additional hooks:
  1. `tool.call` hook — matches `Write` and `Edit` tool calls. Checks whether the file path contains `kanban.yaml`. If yes, re-reads `docs/kanban.yaml` via `$.fs.read`, updates the entries atom, and calls `$.ui.invalidate()` to redraw the pane.
  2. `command.run` hook — matches kanban-related commands: `kanban-sync`, `kanban-render`, `opsx-archive`, `opsx-propose`. After these complete, triggers the same re-read and invalidate.
- The refresh is silent: no toast, no transcript message.
- The pane only redraws if it is open (check `$.state` for pane visibility before invalidating).

## Capabilities

### New Capabilities
- `claude-mod-autosync`: Live pane sync on `kanban.yaml` writes and kanban command runs

### Modified Capabilities
- `claude-mod-pane`: entries atom and invalidate path are used by the new hooks

## User Stories

| ID | Story |
|----|-------|
| U8 | After Claude writes or edits `docs/kanban.yaml`, the pane updates automatically — no user action needed. |
| U9 | After I run `/kanban-sync`, the pane reflects the new board state. |
| U10 | After I run `/opsx-archive` or `/opsx-propose`, the pane updates. |
| U11 | The refresh is silent — no toast, no transcript message. |
| U12 | If the pane is collapsed, the lane headers update too (not just the full card view). |

## Impact

- Depends on: `kanban-13-claude-mod-pane` (entries atom, pane ID, invalidate path)
- Modifies: `hooks/register.tsx` in the mod (adds two hooks, no new files)
- No changes to skills, libs, or packages
