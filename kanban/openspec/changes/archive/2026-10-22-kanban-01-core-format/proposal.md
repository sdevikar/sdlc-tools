## Why

The kanban bridge plugin needs a well-defined, machine-parseable format for kanban entries. Without a structured format, there is no reliable way to parse, update, or render kanban boards. This is the foundation — every other spec depends on it.

## What Changes

- Define the `KanbanEntry` TypeScript interface with fields: `id`, `title`, `lane`, `priority`, `specPath`, `summary`, `status`, `createdAt`, `updatedAt`, `completedAt`, `archivedAt`, `githubIssue`, `tags`, `assignee`, `notes`
- Define the `kanban.md` markdown format using YAML-like frontmatter per entry under lane headers
- Define the `kanban.html` rendering contract (structured entries → visual board)
- Create `libs/kanban-core/` package with:
  - `readKanban(path)` — parse kanban.md into `KanbanEntry[]`
  - `writeKanban(path, items)` — serialize `KanbanEntry[]` back to kanban.md
  - Round-trip test: read → write → read produces identical objects

## Capabilities

### New Capabilities
- `kanban-core-format`: Structured kanban entry format, parsing, and serialization

### Modified Capabilities
(none)

## Impact

- New package: `libs/kanban-core/` (TypeScript)
- No existing code modified
- All subsequent specs depend on this format