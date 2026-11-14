## Why

Make this repository installable as a Claude Code plugin/marketplace by following the documented plugin layout.

## What Changes

- Add `.claude-plugin/plugin.json` manifest with name, description, version.
- Move/copy skills into `skills/` at plugin root.
- Add `hooks/hooks.json` if needed.
- Add `.mcp.json` placeholder.
- Add `marketplace.json` for marketplace listing.
- Validate with `claude plugin validate`.

## Capabilities

### New Capabilities
- `claude-marketplace`: Claude Code plugin packaging

### Modified Capabilities
- `multi-harness-adapters`: Claude adapter aligned to plugin layout

## Impact

- New files under `.claude-plugin/`, `skills/`, `hooks/`, `.mcp.json`.
- Depends on: `kanban-07-multi-harness-adapters`.