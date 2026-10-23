# Proposal

## Why

The kanban plugin installs today via a three-step Claude Code marketplace sequence. Packaging it for the QGenie registry reduces installation to a single `qgenie plugins add <org>/kanban --target claude` command and makes the plugin discoverable and versioned in the registry.

## What Changes

- Add `.qgenie-plugin/plugin.json` at the repo root declaring all 10 skills and the Claude Code adapter (`mod/kanban-board/`).
- Update `INSTALL.md` to document the QGenie install path alongside the existing Claude Code marketplace path.
- Update the plugin registry description with the two prerequisites: `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` and `npm install @fission-ai/openspec`.

## Capabilities

### New Capabilities

- `qgenie-plugin-packaging`: The repo includes a QGenie plugin manifest (`.qgenie-plugin/plugin.json`) that declares all skills and the Claude Code adapter, enabling install from the QGenie registry.

### Modified Capabilities

*(None — no existing spec-level behavior changes.)*

## Impact

- **Adds**: `.qgenie-plugin/plugin.json`
- **Modifies**: `INSTALL.md`
- **Does not modify**: any skill SKILL.md, `mod/kanban-board/`, `libs/kanban-core/`, `hooks/`, or `.claude-plugin/plugin.json` (the existing Claude Code manifest stays unchanged)
- **Scope**: Claude Code harness only (`--target claude`); other harness adapters are out of scope for this change
