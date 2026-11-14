## Context

Chat surfaces render Markdown. A `/kanban-view` skill prints the board as vertical swim lanes (one column per lane) from `kanban.yaml`.

## Goals / Non-Goals

**Goals:** Render lanes as columns, cards sorted by priority.
**Non-Goals:** Interactive HTML.

## Decisions

- Output a Markdown table with one column per lane (Not Started, In Progress, Ready, Done, Archived), cards stacked vertically separated by `<br>` or list items.

## Risks / Trade-offs

- Wide tables may wrap; acceptable.

## Migration Plan

N/A.

## Open Questions

None.
