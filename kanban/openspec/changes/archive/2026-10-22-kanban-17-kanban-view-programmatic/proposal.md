# Proposal

## Why

The `/kanban-view` skill renders `kanban.yaml` via LLM instructions. Every invocation costs an LLM turn: Claude reads the file and builds the table itself. The output is non-deterministic and the work is pure data transformation — no reasoning needed.

## What Changes

- Add `renderKanbanMarkdown(entries: KanbanEntry[]): string` to `libs/kanban-core/src/render.ts`. The function groups entries by lane, sorts each group by priority ascending, and returns a Markdown table with one column per lane.
- Add `libs/kanban-core/src/cli-view.ts`: a thin CLI that reads `docs/kanban.yaml`, calls `renderKanbanMarkdown`, and prints to stdout.
- Add a `"kanban-view"` bin entry to `libs/kanban-core/package.json` pointing to `dist/cli-view.js`.
- Replace the LLM instructions in `.claude/skills/kanban-view/SKILL.md` with a build-guard and `node <path>/cli-view.js` invocation. Print stdout verbatim.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

- `kanban-view`: Add a requirement that the skill invokes a prebuilt CLI binary and prints its stdout verbatim — no LLM reasoning over the YAML.

## Impact

- Modifies: `libs/kanban-core/src/render.ts`, `libs/kanban-core/src/cli-view.ts` (new), `libs/kanban-core/package.json`, `.claude/skills/kanban-view/SKILL.md`
- Depends on: `libs/kanban-core` build infrastructure (same pattern as kanban-16)
- No change to user-visible output format
