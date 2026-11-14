## Why

The kanban plugin should work across multiple AI coding agents, not just OpenCode. Following Ponytail's multi-harness model, the shared core (skills, commands, kanban-core library) should be wrapped in thin adapters for each harness. This spec creates the cross-harness support.

## What Changes

- Create `AGENTS.md` at project root — compact rules version that works in any agent
- Create `INSTALL.md` with per-harness install instructions
- Create harness-specific adapter directories:
  - `.claude-plugin/` — Claude Code plugin (skills + commands + MCP server ref)
  - `.cursor/rules/` — Cursor rules-only adapter (copies AGENTS.md)
  - `.windsurf/rules/` — Windsurf rules-only adapter
  - `.clinerules/` — Cline rules-only adapter
  - `.codex-plugin/` — Codex plugin adapter
  - `.kiro/steering/` — Kiro steering adapter
  - `gemini-extension.json` — Gemini extension adapter
- Create `hooks/` directory with shared lifecycle scripts:
  - `on-propose.sh`, `on-archive.sh`, `on-task-complete.sh`, `on-kanban-change.sh`
- Create `plugin.json` and `plugin.yaml` generic manifests
- Create `opencode.json` OpenCode-specific config
- Create automated adapter generation script (copy shared core → harness dirs)
- Verifiable: copy adapter to Cursor, agent follows kanban rules; copy to Claude Code, slash commands work

## Capabilities

### New Capabilities
- `multi-harness-adapters`: Cross-harness support via thin adapters (Ponytail model)

### Modified Capabilities
- `opencode-plugin-mvp`: adapter wraps the plugin
- `kanban-core-format`: consumed by all adapters

## Impact

- Depends on: `kanban-03-opencode-plugin-mvp`, `kanban-04-html-render`
- New files: AGENTS.md, INSTALL.md, adapter directories, hooks/, manifests
- No existing code modified (additive only)