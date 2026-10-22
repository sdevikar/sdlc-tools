## Why

Claude Desktop and other MCP-compatible agents need tool access to the kanban board. The OpenCode plugin provides tools natively, but Claude Desktop requires an MCP server. This spec packages the kanban tools as an MCP server.

## What Changes

- Create `packages/kanban-mcp/` MCP server using `@modelcontextprotocol/sdk`
- Expose 4 tools via MCP:
  - `kanban_list` — read kanban.md, return structured entries
  - `kanban_move` — move a card between lanes
  - `kanban_priority` — set/get priority for a card
  - `kanban_next` — return the next priority item
- Expose 1 resource:
  - `kanban://board` — current kanban.md content
- Server reads/writes the same `kanban.md` file as the OpenCode plugin
- Uses `libs/kanban-core/` for parsing and sync logic
- Verifiable: connect MCP server in Claude Desktop, use `kanban_next` tool, get correct answer

## Capabilities

### New Capabilities
- `claude-mcp-server`: MCP server packaging kanban tools for Claude Desktop and other MCP clients

### Modified Capabilities
- `kanban-core-format`: consumed by MCP server
- `kanban-core-sync`: consumed by MCP server
- `multi-harness-adapters`: MCP server is the Claude adapter's tool layer

## Impact

- Depends on: `kanban-01-core-format`, `kanban-03-opencode-plugin-mvp`, `kanban-07-multi-harness-adapters`
- New package: `packages/kanban-mcp/`
- Consumes: `libs/kanban-core/`