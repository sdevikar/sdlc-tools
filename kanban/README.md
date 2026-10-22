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

## Claude Code Setup

The mod lives in `mod/kanban-board/`. It registers `/kanban-view` as a programmatic command (no LLM call) and auto-syncs the pane when `kanban.yaml` changes.

### Prerequisites: install openspec

This plugin requires [`@fission-ai/openspec`](https://www.npmjs.com/package/@fission-ai/openspec). Install it at project scope:

```bash
npm install @fission-ai/openspec
```

If you have not initialized openspec in this project yet:

```bash
npx openspec init
```

### 1. Auto-load the mod

Create `.claude/settings.json` in the project root. Use the absolute path to this project's `mod/` directory.

```json
{
  "env": {
    "CLAUDE_CODE_PLUGIN_DIRS": "/absolute/path/to/kanban/mod"
  }
}
```

### 2. Link project skills

Claude Code reads skills from `.claude/skills/`. Link them from the canonical `skills/` directory.

```bash
mkdir -p .claude/skills
for skill in skills/*/; do
  ln -s "../../$skill" ".claude/skills/$(basename $skill)"
done
```

After setup, `/kanban-view` opens the board pane without an LLM call.

> **Renderer note:** The side pane docks beside the transcript only in the fullscreen layout. In the classic terminal, the pane opens above the prompt. Run `/tui fullscreen` or start Claude with `CLAUDE_CODE_NO_FLICKER=1` to get the docked side pane. Skills `/kanban-sync`, `/kanban-render`, and the OpenSpec skills are also available.

### 3. Run Claude Code in fullscreen mode

The board pane needs fullscreen mode. Run `/tui fullscreen` inside Claude Code, or start Claude Code with `CLAUDE_CODE_NO_FLICKER=1`.

Fullscreen mode turns on mouse support. Use the mouse to click the Collapse and Expand buttons. To turn mouse support off, set `CLAUDE_CODE_DISABLE_MOUSE=1`. The buttons then do not respond to clicks.

> `.claude/` is gitignored. Each contributor runs these steps once after cloning.

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