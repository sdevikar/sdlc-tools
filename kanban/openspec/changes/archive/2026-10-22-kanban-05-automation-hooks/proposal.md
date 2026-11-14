## Why

Manual kanban updates are error-prone and tedious. When a user proposes a change, the board should update automatically. When a change is archived, it should move to Archived automatically. This spec adds automation hooks so the kanban board stays in sync without manual intervention.

## What Changes

- Register `ctx.session.hook("command.execute.before", ...)` in OpenCode plugin
- Hook intercepts `openspec new change` → calls `/kanban-add` with the change name
- Hook intercepts `openspec archive` → calls `/kanban-move` to Archived
- Subscribe to `ctx.event.subscribe()` to watch for task checkbox changes in `tasks.md`
- When tasks become ready (all `- [x]`), auto-move card to "Ready" lane
- Add `/kanban-sync` command for manual full sync
- Add `kanban-sync` skill
- Auto-sync respects manual overrides (priority, notes, lane moves are preserved)
- Verifiable: propose a change → kanban.md updated automatically; archive a change → moved to Archived

## Capabilities

### New Capabilities
- `kanban-automation-hooks`: Auto-sync kanban on OpenSpec lifecycle events

### Modified Capabilities
- `opencode-plugin-mvp`: adds hooks and `/kanban-sync` command
- `kanban-core-sync`: consumed by hooks for sync logic

## Impact

- Depends on: `kanban-02-core-sync`, `kanban-03-opencode-plugin-mvp`
- Modifies: `packages/opencode-plugin/` (adds hooks, new command)