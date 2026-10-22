## Context

Reduce swim lanes from 5 to 3: Not Started, In Progress, Archived.

## Goals / Non-Goals

**Goals:** update type, sync, renderer, view skill, tests, docs.
**Non-Goals:** migrate existing YAML lanes automatically (manual edits preserve).

## Decisions

- `Ready` → `In Progress`, `Done` → `Archived`.
- `mapLane`: tasks done/ready returns "In Progress"; design done returns "In Progress"; else Not Started.

## Risks / Trade-offs

- Existing entries with `Done`/`Ready` lanes remain until manually edited or synced.

## Migration Plan

N/A.

## Open Questions

None.