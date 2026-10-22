# Design

## Context

See proposal.md — Why. The `kanban-view` SKILL.md currently contains only LLM instructions; `libs/kanban-core/src/render.ts` has HTML rendering only. The `kanban-sync` skill (kanban-16) establishes the pattern: add a function, add a CLI entry point, update the skill to invoke it.

## Goals / Non-Goals

**Goals:**
- `renderKanbanMarkdown` function in `kanban-core` — pure transformation, no I/O
- `cli-view.ts` — reads `docs/kanban.yaml`, calls the function, prints to stdout
- `kanban-view` bin entry in `package.json`
- SKILL.md updated to: build if stale, then run the binary, print stdout verbatim

**Non-Goals:**
- No change to the table format or column order
- No new runtime dependencies
- No changes to `renderKanbanHtml` or sync logic

## Decisions

**Separate `cli-view.ts` from `cli.ts`** — kanban-16 adds `cli.ts` for `syncFromOpenSpec`. Keeping view and sync in separate entry points avoids argument parsing and keeps each binary single-purpose.

**`renderKanbanMarkdown` in `render.ts`** — co-located with `renderKanbanHtml`. Both are pure entry → string/void transforms; grouping them by output type is cleaner than by command.

**Build guard in SKILL.md** — same pattern as kanban-16's `kanban-sync` skill: `npm install && npm run build` only if `dist/` is absent or stale, then invoke by path.

## Risks / Trade-offs

- `dist/` not built on fresh clone → build guard in SKILL.md mitigates this (same risk as kanban-16).
- `docs/kanban.yaml` path is hardcoded relative to CWD in the CLI — skill must invoke the binary from the project root.
