# Proposal

## Why

New users must manually create `.claude/settings.json` and symlink skills after cloning — two steps that are error-prone and undiscoverable. A package install should configure itself.

## What Changes

- Add a `postinstall` script to `package.json` that runs a setup binary.
- The setup binary writes `CLAUDE_CODE_PLUGIN_DIRS` into the consuming project's `.claude/settings.json`.
- The setup binary symlinks all skills from `skills/` into the consuming project's `.claude/skills/`.
- Remove the manual "Auto-load the mod" and "Link project skills" steps from `README.md` setup instructions.

## Capabilities

### New Capabilities

- `zero-config-install`: A postinstall script that automatically configures the consuming project's `.claude/settings.json` and skill symlinks so no manual setup is needed after `npm install`.

### Modified Capabilities

## Impact

- `package.json` — new `postinstall` script entry and bin definition.
- `libs/kanban-core/` or a new `bin/setup.js` — setup binary implementation.
- `README.md` — setup section simplified to just `npm install`.
- `.claude/` directories in consuming projects — written by the setup binary (gitignored).
