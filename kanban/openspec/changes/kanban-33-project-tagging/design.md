# Design

## Context

See proposal.md — Why. The board is a flat YAML list today. All sync logic lives in `libs/kanban-core/`. The pane is a TSX mod in `mod/kanban-board/hooks/register.tsx`.

## Goals / Non-Goals

**Goals:**
- Add `project?` to `KanbanEntry` with zero breaking change.
- Auto-populate `project:` when creating new entries from change names.
- Group entries by project in the pane with per-group collapse/expand.
- Provide an opt-in setup step that generates subdirectory CLAUDE.md files.

**Non-Goals:**
- Changing OpenSpec CLI or `.openspec.yaml` format.
- Enforcing the naming convention on existing change names (extraction degrades gracefully: no match → undefined).
- Multi-board or cross-repo grouping.

## Decisions

### D1 — Extract project from change name, not from metadata

**Decision**: Use regex `^(.+?)(?=-\d+-)` on the change ID.

**Why**: The change name is already stored in `kanban.yaml` as `id`. No additional metadata file or LLM inference is needed. The extraction is deterministic and works offline.

**Alternative considered**: Extending `.openspec.yaml` with a `project:` field. Rejected because the openspec CLI owns that file; adding unknown fields is fragile across CLI versions.

**Alternative considered**: LLM classification of title/summary. Rejected: non-deterministic, drifts across model versions.

**Edge cases**: A change named `my-feature` (no digit segment) yields no match → `project` stays `undefined` and the entry goes into "Other". This is safe.

### D2 — Preserve user-set `project:` in mergeSync

**Decision**: `mergeSync` treats `project` like `priority` and `notes` — if the existing entry already has a non-empty value, keep it; only set it on new entries.

**Why**: Users may want to override the inferred project (e.g., rename a group, or manually assign entries from ambiguous change names). The auto-inferred value is a default, not a constraint.

### D3 — Subdirectory CLAUDE.md at setup time, opt-in

**Decision**: The setup skill offers a prompt. On acceptance it scans immediate subdirectories that contain code (skip dot-dirs, `node_modules`, etc.) and generates a minimal CLAUDE.md per subdir.

**Why**: This teaches the AI the naming convention so future proposals pick the right prefix automatically. Making it opt-in avoids modifying repos that don't want extra CLAUDE.md files.

**Content of generated CLAUDE.md** (example for `plugins/kanban-board/`):
```markdown
# Project Context

When proposing OpenSpec changes in this directory, use the change name prefix `kanban-board` (e.g., `kanban-board-01-my-feature`). This sets the `project:` tag on the kanban board entry.
```

### D4 — Pane groups entries by project within the existing lane layout

**Decision**: Render project group headers inside each lane section. Within a lane, entries are sub-grouped by project. Each project sub-group has its own header + collapse toggle. The lane structure is unchanged.

**Alternative considered**: Replace lane grouping with project grouping (projects as top-level, lanes as sub-headers). Rejected: the primary axis of the board is workflow state (lane), not project. Projects are a secondary filter.

**Collapsed state**: stored in `$.state` under `collapsedProjects: Set<string>` (per-pane session state, not persisted to disk). Default: all expanded.

## Risks / Trade-offs

- **Regex edge case** → a change named `foo-bar` (no digit segment) gets `project = undefined`. Goes to "Other" group. Acceptable; the naming convention doc covers this.
- **Many projects** → pane can become long if a board has 10+ projects. Not addressed now; a future change can add a master collapse-all button.
- **Generated CLAUDE.md files** → they may conflict with project-level CLAUDE.md if subdirs already have one. Mitigated by the "show and confirm" requirement before overwriting.

## Migration Plan

1. `KanbanEntry` type change is additive (`project?` is optional) — no migration needed.
2. Existing `kanban.yaml` entries without `project:` work as-is; they render in the "Other" group until `kanban-sync` or `new-sync` is run, at which point `project:` is backfilled from the change name.
3. The pane falls back to flat rendering if no entry has a `project:` field — unchanged behavior for existing boards.
