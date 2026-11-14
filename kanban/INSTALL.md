# Install

Copy the appropriate adapter directory to your harness config location. See AGENTS.md for rules.

## Claude Code plugin

### Steps

```
/plugin marketplace add qcom-all-gh-users/sdlc-tools
/plugin install kanban@sdlc-tools
```

Run both commands once after cloning, from your project directory. The first command adds the marketplace (user-scoped, one-time). The second installs the plugin at project scope and writes an `enabledPlugins` entry to `.claude/settings.json`.

After install, `/kanban-view` opens the board pane and `/kanban:kanban-setup` creates or syncs `kanban.yaml`.

## QGenie install

### Prerequisites

Install the OpenSpec CLI:

```
npm install @fission-ai/openspec
```

### Steps

```
qgenie plugins add <org>/kanban --target claude
```

Run this command once from your project directory. It installs the plugin at project scope and writes an `enabledPlugins` entry to `.claude/settings.json`.

After install, `/kanban-view` opens the board pane and `/kanban:kanban-setup` creates or syncs `kanban.yaml`.