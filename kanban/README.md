# OpenSpec Kanban Bridge

A plugin that bridges OpenSpec spec-driven development with lightweight kanban task management. It keeps your task board in sync with your specs so you always know what to work on next.

## How It Works

1. You propose an OpenSpec change → the board adds it to "Not Started" automatically.
2. You start working → move the card to "In Progress".
3. You archive the spec → the board moves it to "Archived" automatically.

The board answers one question: **what is the next priority item?**

## Features

- **`kanban.yaml`** at project root — human-editable YAML with priority, status, lane, and metadata per entry.
- **`kanban.html`** — a generated visual board from `/kanban-render`.
- **Skills** — `/kanban-view`, `/kanban-sync`, `/kanban-render`, `/kanban-init`, plus OpenSpec skills (`/openspec-propose`, `/openspec-apply-change`, `/openspec-archive-change`, `/openspec-explore`, `/openspec-sync-specs`).
- **Auto-sync** — the pane refreshes when `kanban.yaml` changes, when new proposals appear, and after kanban commands.
- **`/init` observer** — on project open, detects a missing `kanban.yaml` and offers a create-or-sync dialog.
- **Multi-harness support** — works in OpenCode, Claude Code, Cursor, Windsurf, Kiro, and Codex.

## Claude Code Setup

### Prerequisites

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

### 3. Run Claude Code in fullscreen mode

The side pane docks beside the transcript only in the fullscreen renderer. Run `/tui fullscreen` inside Claude Code, or start Claude Code with `CLAUDE_CODE_NO_FLICKER=1`.

In the classic renderer, `/kanban-view` opens the pane above the prompt instead. The pane still works — use keyboard shortcuts to close or collapse it.

> `.claude/` is gitignored. Each contributor runs these steps once after cloning.

## Pane Controls

| Key | Action |
|-----|--------|
| `x` | Close the pane |
| `c` | Collapse / expand lane cards |
| Esc | Close the pane |

## Lane Colors

| Lane | Color |
|------|-------|
| Not Started | cyan |
| In Progress | yellow |
| Archived | dim gray |

Each entry shows a bold ID, a bracketed priority number, and a dim summary line.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Planned Support

Support for [OpenCode](https://opencode.ai) is planned.

## License

MIT
