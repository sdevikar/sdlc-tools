## Why

The kanban board must stay in sync with OpenSpec changes. Without automated sync, users must manually update kanban.md every time they propose, refine, or archive a spec. This spec builds on `kanban-01-core-format` to implement the sync logic.

## What Changes

- Implement `syncFromOpenSpec(openspecPath, kanbanPath)` in `kanban-core`
- Read `openspec list --json` to get all changes with their task counts and last-modified dates
- Read `openspec status --change <name> --json` to get artifact statuses per change
- Map OpenSpec artifact state → kanban lane:
  - No proposal → Not Started
  - Proposal exists, tasks blocked → Not Started
  - Design exists, tasks blocked → In Progress
  - Tasks ready → Ready
  - Archived → Archived
- Add missing entries to kanban.md
- Update `status` and `updatedAt` fields for existing entries
- Move entries to Archived when found in `changes/archive/`
- Preserve manual edits (priority, notes, lane moves) — auto-sync only adds/removes/updates status
- Verifiable: given a test OpenSpec project, sync produces correct kanban.md

## Capabilities

### New Capabilities
- `kanban-core-sync`: OpenSpec → kanban.md synchronization logic

### Modified Capabilities
- `kanban-core-format`: extends parsing with sync-aware merge

## Impact

- Depends on: `kanban-01-core-format`
- Modifies: `libs/kanban-core/` (adds sync module)
- No existing code modified