# Proposal

## Why

All kanban entries share one flat list regardless of which part of the repo they belong to. When a single `openspec/` root contains changes from multiple project areas (e.g., a plugin, its infrastructure, and an unrelated feature), the board gives no way to see or filter by area. Adding a `project:` field and pane grouping makes multi-area work legible.

## What Changes

- Add optional `project?: string` field to the `KanbanEntry` interface.
- Define a naming convention: change names follow `<project>-<NN>-<slug>`. The project identifier is extracted by the regex `^(.+?)(?=-\d+-)` — everything before the first `-digits-` segment.
- `kanban-setup` and `kanban-sync`: when creating a new entry, extract `project:` from the change name. When updating an existing entry, preserve any user-set `project:` (same treatment as `priority` and `notes`).
- `kanban-setup` gains an interactive step (opt-in): scan the repo's major subdirectories and generate or update a lightweight `CLAUDE.md` in each one. Each generated file tells the AI which project prefix to use when proposing changes in that directory. This makes project assignment automatic in multi-area repos.
- The kanban pane groups entries by `project:`. Each project group has a header with its own collapse/expand toggle. Entries with no `project:` render in an "Other" group at the bottom. Within each group, entries sort by priority ascending.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `kanban-core-format`: Add optional `project?: string` to the `KanbanEntry` interface. Update `readKanban` to parse `project:` and `writeKanban` to serialize it.
- `kanban-core-sync`: Extend `mergeSync` to extract `project:` from change name using `^(.+?)(?=-\d+-)` when creating new entries. Preserve user-set `project:` on updates (do not overwrite).
- `zero-config-install`: Extend `/kanban:setup` with an opt-in project-area setup step that generates subdirectory CLAUDE.md files with project prefix instructions.
- `pane-visual-design`: Add project group headers with collapse/expand toggles above lane entries. Each project group renders with a distinct visual separator. Collapsed group shows only the header.

## Impact

- **Modifies**: `libs/kanban-core/src/` (KanbanEntry type, readKanban, writeKanban, mergeSync), `skills/kanban-setup/SKILL.md`, `mod/kanban-board/hooks/register.tsx`.
- **Does not modify**: OpenSpec CLI, the `openspec-propose` skill, `.openspec.yaml` files.
- **Schema change**: `kanban.yaml` entries gain an optional `project:` field. Existing entries without the field are unaffected; the pane treats missing `project:` as "Other".
- **Backwards compatible**: all existing entries and tooling continue to work unchanged.
