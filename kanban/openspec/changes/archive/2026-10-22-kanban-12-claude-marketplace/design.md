## Context

Claude Code plugins require `.claude-plugin/plugin.json` and component dirs at plugin root.

## Goals / Non-Goals

**Goals:** create manifest and align layout.
**Non-Goals:** full marketplace publishing.

## Decisions

- Use `.claude-plugin/plugin.json`.
- Skills already under `.opencode/skills`; copy to `skills/`.

## Risks / Trade-offs

- Duplication between harness adapters.

## Migration Plan

N/A.

## Open Questions

None.