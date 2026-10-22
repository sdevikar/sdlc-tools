## Context

No application code exists yet. This change establishes the foundational data model and parser for the kanban bridge. Every subsequent change (sync, plugin, render, hooks) depends on `KanbanEntry` and the read/write functions. The format is already specified in the research report (Appendix B); this change implements it as a reusable TypeScript package.

## Goals / Non-Goals

**Goals:**
- Define `KanbanEntry`, `KanbanLane`, and related types
- Implement `readKanban(path)` parsing kanban.md into `KanbanEntry[]`
- Implement `writeKanban(path, items)` serializing entries back to kanban.md
- Preserve manual edits (notes, priority, lane moves) on round-trip
- Round-trip test proving read → write → read equality

**Non-Goals:**
- OpenSpec sync logic (change 02)
- HTML rendering (change 04)
- CLI/agent integration

## Decisions

- **Package location**: `libs/kanban-core/` as a standalone TS package, so other harness adapters can depend on it.
- **Parser**: hand-written line-based parser (no YAML dependency). Entries are `### <id>` + `- **key**: value` lines under `## <Lane>` headers. Keeps dependency count zero.
- **Serialization**: deterministic key order matching the research example (priority, status, spec, summary, created, updated, then optional fields). Omits unset optional fields.
- **Lane type**: union of the five known lanes, but parser accepts any `## ` header as a lane string to stay forward-compatible.
- **Dates**: kept as strings (ISO). No Date parsing, preserving exact input.
- **Title**: derived from `id` if not provided (research example uses id as heading). `title` defaults to id.

## Risks / Trade-offs

- [Malformed input] → parser skips unknown lines and entries without an id; returns best-effort array.
- [Round-trip fidelity] → key ordering and whitespace may change; object equality is the contract, not byte equality.
- [No dependency on YAML] → manual parsing must handle `notes` with colons; split only on first `:`.

## Migration Plan

N/A — greenfield.

## Open Questions

None.