# Agent Portability

The skills in `devflow/skills` and `kanban/plugins/kanban/skills` are the
shared source. Host-specific files are thin adapters that make those skills
available in a given agent.

| Host | Files | Notes |
| --- | --- | --- |
| Claude Code | `.claude-plugin/marketplace.json`, `devflow/.claude-plugin/plugin.json`, `kanban/plugins/kanban/.claude-plugin/plugin.json` | Full plugin install with the marketplace, the `SessionStart` handoff hook, and the kanban board pane. |
| OpenCode | `.opencode/plugins/sdlc-tools.js`, `package.json` | V2 server plugin. Registers the devflow and kanban skills and commands, injects the devflow rule, and shows the handoff pointer once per session. |

## OpenCode adapter

`opencode plugin add git+https://github.com/sdevikar/sdlc-tools` installs the
package, or add the git URL to the `plugins` array in `opencode.json`.

What the adapter does:

- Reads `devflow/skills`, `kanban/.opencode/skills`, and
  `kanban/plugins/kanban/skills` at setup time.
- Prefixes skill ids with the plugin name, so `devflow` and a future plugin
  cannot collide. The kanban skills already start with `kanban`.
- Rewrites `${CLAUDE_PLUGIN_ROOT}` to the installed package root and
  `/devflow:skill` / `/kanban:skill` to the OpenCode command names.
- Registers one command per skill and keeps the existing `kanban-add`,
  `kanban-move`, `kanban-next`, and `opsx-*` command files.
- Skips the Claude Code-only `kanban-view` pane and `kanban-render` HTML
  skills; OpenCode reads `kanban.yaml` directly. It also skips the `openspec-*`
  skills, because `openspec init` adds those to each project.
- Injects the devflow working-files rule into the system prompt every turn and
  the handoff pointer once per session. OpenCode has no `SessionStart` hook, so
  the first turn does that work.

Known limits:

- The kanban live pane and HTML render are Claude Code UI mods. OpenCode gets
  the board file and the commands, not the pane or `kanban.html`.
- mission-ctrl is beta and is being retired, so it is not part of the OpenCode
  adapter.
- `devflow/setup` branches on `OPENCODE=1`: it creates `.devflow/` and skips the
  `claude plugin` marketplace steps and the `.claude/rules` copy.
