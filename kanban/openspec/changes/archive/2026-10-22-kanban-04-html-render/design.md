## Context

Kanban entries are structured YAML. A self-contained HTML board renders lanes as columns with cards, supporting drag-and-drop, filtering, and sorting in the browser without external dependencies.

## Goals / Non-Goals

**Goals:**
- `renderKanbanHtml(entries, outputPath)` writes a single HTML file.
- Vanilla JS drag-and-drop between lanes.
- Priority badges, status indicators, filtering, sorting, responsive layout.

**Non-Goals:**
- Persistence of drag-and-drop back to YAML (display-only).
- Server-side rendering or external CSS/JS.

## Decisions

- Generate HTML via template string in `render.ts`; no templating dependency.
- Embed CSS and JS inline for self-containment.
- Use `data-lane` attributes and JS to move cards; no persistence.

## Risks / Trade-offs

- Large boards may produce big HTML; acceptable for now.
- Drag-and-drop is visual only; reloading resets state.

## Migration Plan

Add module; wire `/kanban-render` command markdown and skill.

## Open Questions

None.