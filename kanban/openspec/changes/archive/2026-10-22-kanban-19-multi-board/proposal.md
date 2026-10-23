# Proposal

## Why

The kanban plugin supports one `docs/kanban.yaml` per project. Teams managing parallel work streams — for example, a plugin marketplace with one board per plugin — cannot track sub-boards without switching projects. A multi-board model lets a root `kanban.yaml` register child boards so all kanban commands work across the full tree.

## What Changes

- Add an optional `boards:` field to `kanban.yaml`. Each entry names a sub-board and its relative path to its own `kanban.yaml`.
- Update `/init` to scan subdirectories for `kanban.yaml` files. Propose each discovered file to the user. Write confirmed paths into the root `boards:` list.
- Update `/kanban-sync` to walk the `boards:` list and sync each board independently.
- Update `/kanban-view` to render boards grouped by board name when multiple boards are present. Add an optional `board=<name>` argument to render a single board.
- Sub-board files may use any filename. `kanban.yaml` is the preferred and auto-discovered name.
- Deprioritize `kanban-06-github-issues` in `docs/kanban.yaml` (drop to priority 99).

## Capabilities

### New Capabilities

- `multi-board/registry`: Root `kanban.yaml` supports an optional `boards:` section listing sub-board paths with optional names.
- `multi-board/discovery`: `/init` scans subdirectories for `kanban.yaml` files, confirms each discovered file with the user, and writes approved paths to the root `boards:` list.
- `multi-board/view`: `/kanban-view` renders boards grouped by board name when multiple boards are registered; accepts `board=<name>` to filter to one board.

### Modified Capabilities

- `kanban-core-yaml`: Add optional `boards:` field (`{name: string, path: string}[]`) to the YAML schema.
- `kanban-core-sync`: `syncFromOpenSpec` walks the `boards:` list; each sub-board syncs independently.
- `kanban-view`: Skill renders grouped output across all registered boards and accepts a `board` filter argument.

## Impact

- `docs/kanban.yaml`: Schema gains an optional `boards:` field.
- `libs/kanban-core/src/`: `format.ts`, `sync.ts`, and `yaml.ts` updated to support multi-board traversal.
- `/kanban-sync` and `/kanban-view` skills updated.
- Claude mod `/init` observer extended to discover and register sub-boards.
- Depends on: `kanban-15-claude-mod-init` (init hook base) and `kanban-16-kanban-core-cli` (CLI base).
- `kanban-06-github-issues` deprioritized in `docs/kanban.yaml`.
