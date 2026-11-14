## Why

Teams use GitHub Issues as their external task tracker. Linking kanban entries to GitHub issues lets stakeholders see planned work outside OpenCode. This spec adds optional GitHub Issues sync.

## What Changes

- Add `githubIssue` field to `KanbanEntry` (already in interface from spec 01)
- Implement GitHub sync via MCP server integration (`@modelcontextprotocol/server-github`) or `gh` CLI fallback:
  - When `/kanban-add` is called, optionally create a GitHub issue with `spec:proposed` label
  - When spec transitions, update issue labels (`spec:refined`, `status:ready`, `status:in-progress`, `status:done`)
  - When archived, comment "Implemented and archived" on the issue
- Add `/kanban-link <name> <issue-number>` command to link existing issue
- Store issue→spec mapping in plugin storage (`ctx.storage`)
- Sync is opt-in (disabled by default, enabled via plugin options)
- Verifiable: enable GitHub sync, propose a change, GitHub issue created with correct label

## Capabilities

### New Capabilities
- `github-issues-sync`: Optional GitHub Issues integration for kanban entries

### Modified Capabilities
- `kanban-core-format`: adds `githubIssue` field usage
- `opencode-plugin-mvp`: adds `/kanban-link` command and sync logic

## Impact

- Depends on: `kanban-03-opencode-plugin-mvp`, `kanban-05-automation-hooks`
- Modifies: `packages/opencode-plugin/`, `libs/kanban-core/` (adds GitHub sync module)