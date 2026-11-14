## Context

Automation hooks require OpenCode SDK support that is not available in this version. Implement what is feasible: `/kanban-sync` command and skill for manual full sync.

## Goals / Non-Goals

**Goals:** add command markdown and skill.
**Non-Goals:** runtime hooks (SDK limitation).

## Decisions

- Hooks deferred until SDK supports them.
- Manual sync via command + skill.

## Risks / Trade-offs

- Auto-sync not actually automatic.

## Migration Plan

N/A.

## Open Questions

None.