## Context

Switch storage from Markdown to YAML for structured, type-safe parsing. Update kanban-core to use `yaml` package.

## Goals / Non-Goals

**Goals:** YAML read/write, sync operates on YAML, docs use kanban.yaml.
**Non-Goals:** HTML rendering.

## Decisions

- Use `yaml` package for parsing/serialization.
- Top-level `entries` array mapping directly to `KanbanEntry[]`.

## Risks / Trade-offs

- [Manual edits] → YAML supports comments? `yaml` stringify may drop comments. Acceptable; facts only.

## Migration Plan

Convert existing kanban.md to kanban.yaml.

## Open Questions

None.