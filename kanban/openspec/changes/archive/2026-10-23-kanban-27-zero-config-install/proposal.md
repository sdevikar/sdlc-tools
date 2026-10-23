# Proposal

## Why

New contributors must manually write `CLAUDE_CODE_PLUGIN_DIRS` into `~/.claude/settings.json`
and symlink skills into `.claude/skills/` after cloning. Both steps are error-prone and
undiscoverable. Claude Code's native plugin-install system already handles mod loading, skill
registration, and auto-reload — the repo just needs to expose the right plugin artifacts.

## What Changes

- Fix `hooks/hooks.json` at the repo root to use the modules format so the TypeScript mod loads
  on plugin install (currently it is an empty settings-style file that does nothing).
- Fix `.claude-plugin/marketplace.json` to the required `{ plugins: [{ name, source }] }` format
  so `/plugin install kanban --marketplace qcom-all-gh-users/kanban` resolves correctly.
- Add a `skills/setup/SKILL.md` that installs openspec, builds `libs/kanban-core`, and creates or
  syncs `kanban.yaml` — the post-install steps a new contributor needs.
- Replace the "Auto-load the mod" and "Link project skills" manual sections in `README.md` with
  one `/plugin install` command and one `/kanban:setup` invocation.

## Capabilities

### New Capabilities

- `zero-config-install`: After one `/plugin install` command and one `/kanban:setup` invocation,
  Claude Code loads the pane mod, registers all skills, and has a working `kanban.yaml`. No manual
  settings edits or symlinks are needed.

### Modified Capabilities

- `kanban:setup` — new skill that drives the post-install steps.

## Impact

- `hooks/hooks.json` — format change; previously empty.
- `.claude-plugin/marketplace.json` — format fix; previously missing the `plugins` array.
- `skills/setup/SKILL.md` — new file.
- `README.md` — setup section simplified to two commands.
- `package.json` and `bin/` — no changes needed; the Node.js postinstall approach is dropped.
