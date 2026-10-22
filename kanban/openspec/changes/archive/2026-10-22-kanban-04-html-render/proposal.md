## Why

A visual kanban board helps users see project state at a glance. The structured `KanbanEntry` objects from `kanban-01-core-format` can be rendered to HTML, but no rendering logic exists yet. This spec adds the `/kanban-render` command and HTML template.

## What Changes

- Implement `renderKanbanHtml(entries: KanbanEntry[], outputPath: string)` in `kanban-core`
- Generate a self-contained HTML file (no external dependencies) with:
  - Drag-and-drop between lanes (vanilla JS)
  - Priority badges (P1, P2, ... P10)
  - Status indicators per card
  - Filtering by lane, priority, tags
  - Sorting by priority, date, name
  - Responsive layout
- Register `/kanban-render` command in OpenCode plugin
- Register `kanban-render` skill
- HTML is always regenerated — never hand-edited
- Verifiable: run `/kanban-render`, open kanban.html in browser, see correct board with all entries

## Capabilities

### New Capabilities
- `kanban-html-render`: HTML kanban board generation from structured entries

### Modified Capabilities
- `kanban-core-format`: consumes KanbanEntry interface
- `opencode-plugin-mvp`: adds `/kanban-render` command

## Impact

- Depends on: `kanban-01-core-format`, `kanban-03-opencode-plugin-mvp`
- Modifies: `libs/kanban-core/` (adds render module), `packages/opencode-plugin/` (adds command)