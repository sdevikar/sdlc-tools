## Why

The board has too many swim lanes. `Done` is unused by sync and `Ready` can fold into `In Progress` without losing meaning.

## What Changes

- Remove `Done` and `Ready` lanes; collapse them into `In Progress` (Ready) and `Archived` (Done).
- Update `KanbanLane` type, `LANES`, sync mapping, renderer columns, and kanban-view skill.
- Update tests and docs.

## Capabilities

### New Capabilities
- None

### Modified Capabilities
- `kanban-core-format`: lane set reduced
- `kanban-core-sync`: mapLane updated
- `kanban-html-render`: fewer columns
- `kanban-view`: fewer columns

## Impact

- Modifies: `libs/kanban-core/`, skills, docs.