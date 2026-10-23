# Design

## Context

See proposal.md — Why. The current setup requires two manual steps that are undiscoverable:
writing `CLAUDE_CODE_PLUGIN_DIRS` into `~/.claude/settings.json` and symlinking skills into
`.claude/skills/`. The npm-postinstall approach in the original plan cannot fix this because
`CLAUDE_CODE_PLUGIN_DIRS` is only read from the process environment or `~/.claude/settings.json`
(user settings) — project-scoped `.claude/settings.json` is silently ignored for this variable.

The correct fix is to make the repo a well-formed Claude Code plugin so `/plugin install` handles
everything automatically.

## Goals / Non-Goals

**Goals:**
- One `/plugin install` command loads the pane mod and all skills with no manual steps.
- One `/kanban:setup` invocation handles the project-specific steps (openspec, kanban-core build,
  kanban.yaml).
- The install command is `/plugin install kanban --marketplace qcom-all-gh-users/kanban`.
- Be idempotent: safe to run multiple times.

**Non-Goals:**
- Support non-Claude Code harnesses in this change.
- Auto-install openspec or build kanban-core without user confirmation.
- Modify `~/.claude/settings.json` programmatically.

## Decisions

### Decision: Native plugin install, not npm postinstall

Claude Code's plugin system handles mod loading, skill registration, and auto-reload natively.
A Node.js `bin/setup.js` would duplicate that work and requires the user to understand npm
conventions. `/plugin install kanban --marketplace qcom-all-gh-users/kanban` is one command
and is the documented install path for Claude Code plugins.

### Decision: `hooks/hooks.json` format change

The TypeScript mod (`mod/kanban-board/hooks/register.tsx`) loads when `hooks/hooks.json` at the
plugin root uses the modules format: `{ "modules": ["./mod/kanban-board/hooks/register.tsx"] }`.
The current file is `{ "hooks": {} }` (settings-style, empty) — it does not load the mod.

Changing the format to modules-style at the repo root is the minimal fix. The settings-style
shell hooks in `hooks/*.sh` are not referenced by the current `hooks.json` and are unaffected.

### Decision: Fix marketplace.json format

The current `.claude-plugin/marketplace.json` is `{ "name": "kanban", ... }` without the required
`plugins` array. The correct format is:
```json
{
  "name": "kanban",
  "owner": { "name": "Swapnil Devikar" },
  "plugins": [{ "name": "kanban", "source": "./" }]
}
```
Without the `plugins` array the `/plugin install` command cannot resolve the plugin.

### Decision: Setup skill, not a setup script

Post-install steps (openspec install, kanban-core build, kanban.yaml creation) belong in a skill
because skills are the documented way to deliver runnable instructions through a Claude Code
plugin. A skill is also idempotent by convention and does not require a separate runtime.

The `kanban-init` skill already handles kanban.yaml creation. The new `setup` skill calls it and
also handles openspec and kanban-core build, so contributors run one command.

## Risks / Trade-offs

- **Risk**: The mod uses `$.session.cwd()` to find `libs/kanban-core/dist/src/cli.js`, so
  `kanban-core` must be built in the project directory. The setup skill covers this, but a
  contributor who skips it sees a pane error. → Mitigation: the setup skill prints a clear message
  if the build is missing; document this in the README.
- **Risk**: Changing `hooks/hooks.json` format breaks any tooling that parses the file as
  settings-style. → Current file is empty (`"hooks": {}`); no active hooks are lost.
- **Risk**: Project-scoped plugin install puts the plugin's `enabledPlugins` entry in
  `.claude/settings.json`, which all contributors see. Each contributor still needs to run
  `/plugin install` once to download the plugin to their machine.
  → Document this in the README (same model as the existing manual setup requirement).
