# OpenSpec Kanban Bridge

A plugin that bridges OpenSpec spec-driven development with lightweight kanban task management. It synchronizes your project's task board with your specs so you always know what to work on next.

## How It Works

1. You propose an OpenSpec change → the kanban board adds it to "Not Started"
2. You refine the spec and start working → the card moves to "In Progress"
3. You finish and archive the spec → the card moves to "Done"

The board answers one question: **what is the next priority item?**

## Features

- **`kanban.md`** as the human-editable source of truth — structured entries with priority, status, and metadata
- **`kanban.html`** as a generated visual board — drag-and-drop, filtering, sorting
- **Standalone `/kanban-*` skills** — `/kanban-next`, `/kanban-priority`, `/kanban-move`, `/kanban-render`
- **Auto-sync** on OpenSpec lifecycle events (propose, archive, task completion)
- **GitHub Issues integration** — link specs to issues with labels
- **Multi-harness support** — works across OpenCode, Claude Code, Codex, Cursor, Windsurf, and more

## Architecture

This project follows the [Ponytail](https://github.com/dietrichgebert/ponytail) multi-harness model: a shared core (skills, commands, parsing library) with thin adapters for each AI coding agent.

```
shared core (skills, commands, libs/kanban-core)
  ├── .opencode/     (OpenCode V2 plugin)
  ├── .claude-plugin/ (Claude Code)
  ├── .cursor/rules/  (Cursor)
  ├── .windsurf/      (Windsurf)
  └── AGENTS.md      (universal fallback)
```

## Proposals

Eight sequenced OpenSpec proposals define the implementation roadmap:

| # | Change | Goal |
|---|---|---|
| 01 | `kanban-01-core-format` | Structured kanban entry format and parsing |
| 02 | `kanban-02-core-sync` | OpenSpec → kanban.md synchronization |
| 03 | `kanban-03-opencode-plugin-mvp` | OpenCode V2 plugin (tools, commands, skills) |
| 04 | `kanban-04-html-render` | Visual kanban.html board generation |
| 05 | `kanban-05-automation-hooks` | Auto-sync on lifecycle events |
| 06 | `kanban-06-github-issues` | GitHub Issues integration |
| 07 | `kanban-07-multi-harness-adapters` | Cross-harness support |
| 08 | `kanban-08-claude-mcp-server` | MCP server for Claude Desktop |

## Research

See [docs/plans/opencode-openspec-kanban-plugin-research.md](docs/plans/opencode-openspec-kanban-plugin-research.md) for the full research report.

## License

MIT