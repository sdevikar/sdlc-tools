## Why

Users need to interact with the kanban board from within OpenCode. Without a plugin, the kanban.md file exists but isn't accessible via slash commands or AI-agent tools. This spec creates the OpenCode V2 plugin that registers skills, commands, and tools.

## What Changes

- Create `packages/opencode-plugin/` with OpenCode V2 plugin entry point
- Register 4 AI-agent tools via `ctx.tool.transform`:
  - `kanban-list` — read kanban.md, return structured entries
  - `kanban-move` — move a card between lanes
  - `kanban-priority` — set/get priority for a card
  - `kanban-next` — return the next priority item (active lanes, sorted by priority)
- Register 4 slash commands via `ctx.command.transform`:
  - `/kanban` — show the kanban board
  - `/kanban-add <name> [priority]` — add a spec to the board
  - `/kanban-move <name> <lane>` — move a card manually
  - `/kanban-next` — show the next priority item
- Register core skill via `ctx.skill.transform`:
  - `kanban` — how to read/manage kanban.md, use commands, answer "what's next"
- Plugin uses `ctx.location.directory` to find project root
- Verifiable: install plugin, run `/kanban-next`, get correct answer based on kanban.md

## Capabilities

### New Capabilities
- `opencode-plugin-mvp`: OpenCode V2 plugin with tools, commands, and skills

### Modified Capabilities
- `kanban-core-format`: consumed by plugin for parsing
- `kanban-core-sync`: consumed by plugin for sync

## Impact

- Depends on: `kanban-01-core-format`, `kanban-02-core-sync`
- New package: `packages/opencode-plugin/`
- Consumes: `libs/kanban-core/`