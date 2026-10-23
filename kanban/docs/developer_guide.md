# Developer Guide

## Auto-sync Implementation

The Claude Code mod pane uses a three-tier sync strategy:

- **File write hook** — refreshes the pane when `kanban.yaml` is saved.
- **Session timer (every 5 s)** — detects new proposals and auto-adds them to "Not Started"; detects archived folders and auto-moves entries to "Archived".
- **Command hook** — refreshes the pane after `/kanban-sync` and `/kanban-render`.

## Environment Variables

| Variable | Effect |
|---|---|
| `CLAUDE_CODE_NO_FLICKER=1` | Start Claude Code in fullscreen mode — required for the side pane |
| `CLAUDE_CODE_DISABLE_MOUSE=1` | Disable mouse support in fullscreen mode |

## Mod Source

The mod lives in `mod/kanban-board/`. It registers `/kanban-view` as a programmatic command (no LLM call).

Reload the mod by restarting Claude Code. The mod loads from the path set in `CLAUDE_CODE_PLUGIN_DIRS`.

See [architecture.md](architecture.md) for the full directory layout.

## Migration Note

The board file moved from `docs/kanban.yaml` to `kanban.yaml` at project root. If you have an old installation, run:

```bash
git mv docs/kanban.yaml kanban.yaml
```
