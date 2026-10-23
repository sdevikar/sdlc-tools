# Design

## Context

Each project has one `docs/kanban.yaml` with a flat `entries:` array. `libs/kanban-core` provides `readKanban`/`writeKanban` (yaml.ts), `syncFromOpenSpec` (sync.ts), and the `KanbanEntry` type (format.ts). The `/kanban-view` skill calls a compiled CLI binary. The `/kanban-sync` skill calls `syncFromOpenSpec`. The Claude mod `/init` hook scans OpenSpec changes and writes entries to `kanban.yaml`. None of these components know about sibling boards.

## Goals / Non-Goals

**Goals:**
- Root `kanban.yaml` can list sub-boards by path. All kanban commands walk that list.
- `/init` discovers `kanban.yaml` files in subdirectories and offers to register them.
- `/kanban-view` renders boards grouped by name; supports `--board <name>` to filter.
- Each sub-board syncs against its own nearest OpenSpec root.
- Single-board projects are unaffected.

**Non-Goals:**
- Sub-boards cannot have their own `boards:` (no recursive nesting).
- `/init` does not scan for non-`kanban.yaml` filenames (user registers those manually).
- No cross-board entry linking or rollup metrics.

## Decisions

### Schema: extend kanban.yaml in-place, no separate registry file
Add `boards?: { name: string; path: string }[]` to the root `kanban.yaml`. Keeping the registry in the root board file means one fewer file to maintain and keeps the YAML self-describing.

Alternative considered: a separate `.kanban-registry.yaml`. Rejected because it adds indirection and splits the source of truth.

### Discovery: scan by filename only (`kanban.yaml`)
`/init` walks the directory tree looking for files named exactly `kanban.yaml`. Non-standard filenames (e.g. `tasks.yaml`) are not auto-discovered; the user adds them manually to `boards:`.

Alternative considered: scanning for any YAML with an `entries:` key. Rejected — too broad, would match unrelated files.

### Board name derivation: parent directory name
When `/init` registers a discovered file, the default name comes from the file's immediate parent directory. For `plugins/auth/kanban.yaml` the default is `auth`. Users can override in the confirmation prompt.

### Sync: each sub-board uses its own OpenSpec root
`syncFromOpenSpec` resolves the OpenSpec root relative to each sub-board's directory (nearest `openspec/` ancestor). Sub-boards with no OpenSpec root nearby are skipped with a warning — they may be plain task boards not tied to a spec workflow.

### View: grouped output, board flag passed to CLI
The `/kanban-view` skill reads `boards:` from the root, calls the CLI once per board, and wraps each output in a `### <board-name>` section header. The CLI gains a `--board <name>` flag so it can be called in single-board mode. When `boards:` is empty or absent, behavior is unchanged (no headers added).

## Risks / Trade-offs

- **Stale paths** — if a sub-board directory is renamed, its `boards:` path entry breaks silently.
  → Mitigation: `/kanban-sync` warns when a registered path does not resolve.

- **Circular reference** — a sub-board's `boards:` field is ignored (non-recursive), so loops cannot occur.

- **Init in a sub-board directory** — running `/init` inside `plugins/auth/` could discover `kanban.yaml` files relative to that directory. To avoid double-registration, the mod checks whether the root `kanban.yaml` (the project root) is the same file being initialized.

## Migration Plan

Existing single-board projects: no action needed. The `boards:` field is optional; absence is equivalent to an empty list.

New sub-board setup: user runs `/init` from the project root after creating sub-board directories. Alternatively, the user edits `boards:` manually.
