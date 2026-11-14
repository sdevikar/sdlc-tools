## Context

Builds on kanban-01-core-format. Adds sync logic that reconciles kanban.md with OpenSpec change state. Needs to invoke openspec CLI and merge results without clobbering manual edits.

## Goals / Non-Goals

**Goals:**
- `syncFromOpenSpec(openspecPath, kanbanPath)` CLI-driven sync.
- Pure `mergeSync(existing, active, archived)` for testability.
- Preserve manual fields (priority, notes, lane, tags, assignee, githubIssue).
- Add missing entries, update status/updatedAt, move archived to Archived lane.

**Non-Goals:**
- GitHub issues (change 06).
- Hooks (change 05).

## Decisions

- **Shell out to openspec CLI** rather than reimplement parsing; keeps single source of truth.
- **Pure merge function** exported for unit tests without CLI.
- **Lane preservation**: existing entries keep their lane except archived moves; new entries get mapped lane.
- **Status field**: derived from artifact statuses.

## Risks / Trade-offs

- [CLI availability] → syncFromOpenSpec throws if openspec missing.
- [Manual lane moves] → respected for active entries.

## Migration Plan

N/A.

## Open Questions

None.