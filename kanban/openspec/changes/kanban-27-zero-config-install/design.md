# Design

## Context

See proposal.md — Why. The current setup requires two manual steps that depend on absolute paths the user must discover themselves. The package is installed via `npm install` into a consuming project's `node_modules/`, so the installed path is known at postinstall time via `__dirname` or `npm_config_local_prefix`.

## Goals / Non-Goals

**Goals:**
- Run setup automatically on `npm install` with no user action.
- Write `CLAUDE_CODE_PLUGIN_DIRS` into `.claude/settings.json` of the consuming project.
- Symlink all `skills/` entries into `.claude/skills/` of the consuming project.
- Be idempotent: safe to run multiple times.

**Non-Goals:**
- Uninstall / cleanup on `npm uninstall` (postuninstall hook adds complexity; out of scope).
- Support for non-npm package managers in this change.
- Modifying global `~/.claude/settings.json`.

## Decisions

### Decision: Node.js script over bash
A Node.js setup script (`bin/setup.js`) rather than a bash script. Reason: the global CLAUDE.md bans bash scripts. Node is already required for `@fission-ai/openspec`.

### Decision: Consuming project root via `npm_config_local_prefix`
npm sets `npm_config_local_prefix` to the consuming project root during postinstall. This is the correct target for `.claude/` writes. Fallback: `process.cwd()` if the env var is absent (covers `npx` runs and direct invocations).

### Decision: JSON merge, not overwrite
Read `.claude/settings.json` if it exists, parse it, set `env.CLAUDE_CODE_PLUGIN_DIRS`, and write back. Preserves all other user settings.

### Decision: Symlinks, not copies
Skills are symlinked so they stay in sync when the package is updated without re-running setup. Copies would silently go stale.

### Decision: `postinstall` in package.json
`"postinstall": "node bin/setup.js"` runs automatically after `npm install`. No extra command for the user.

## Risks / Trade-offs

- **Risk**: User's project root is a monorepo and `npm_config_local_prefix` points to the workspace root, not the subpackage. → Mitigation: document the edge case; the user can run `node node_modules/kanban-board/bin/setup.js` manually from the right directory.
- **Risk**: `.claude/` is gitignored in the consuming project, so symlinks are per-clone. → This is expected behavior (same as before); document it.
- **Risk**: Absolute symlink paths break if `node_modules/` moves. → Use absolute paths resolved at postinstall time; the user re-runs `npm install` to fix after a move.
