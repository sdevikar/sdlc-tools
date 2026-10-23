# Install

Copy the appropriate adapter directory to your harness config location. See AGENTS.md for rules.

## Claude Code plugin

### Prerequisites

Function hooks are early-access in Claude Code. Enable them in `~/.claude/settings.json`:

```json
{
  "env": {
    "CLAUDE_CODE_ENABLE_FUNCTION_HOOKS": "1"
  }
}
```

Without this flag, the plugin's hooks module does not load. Skills still load, but the `kanban_board_setup` tool and all `tool.call` / `session.start` hooks are absent.

### Steps

```
/plugin marketplace add qcom-all-gh-users/kanban
/plugin install kanban@kanban
```

Run both commands once after cloning, from your project directory. The first command adds the marketplace (user-scoped, one-time). The second installs the plugin at project scope and writes an `enabledPlugins` entry to `.claude/settings.json`.

After install, `/kanban-view` opens the board pane and `/kanban:setup` creates or syncs `kanban.yaml`.