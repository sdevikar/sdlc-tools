## Why

The `/kanban-sync` skill fails in a fresh checkout because the execution path is broken in two ways:

1. **No built output.** `libs/kanban-core/` contains TypeScript source. The `dist/` directory is gitignored and not committed. On a fresh clone, there is nothing to run.
2. **`typescript` missing from devDependencies.** Running `npm install` in `libs/kanban-core/` does not install `tsc`, so `npm run build` also fails.
3. **Skill has no invocation instructions.** The skill says "Run syncFromOpenSpec" but gives no command, no path, and no build step. Executing it requires knowing internal package structure.

Without all three fixed, the skill silently fails and Claude has to improvise.

## What Changes

- Add `typescript` to `devDependencies` in `libs/kanban-core/package.json` (already done as a hotfix; this change makes it canonical).
- Add `src/cli.ts` to `libs/kanban-core/`: a thin wrapper that calls `syncFromOpenSpec` with project-root-relative paths and exits with code 1 on error.
- Add a `"kanban-sync"` bin entry to `libs/kanban-core/package.json` pointing to `dist/src/cli.js`.
- Update the `kanban-sync` skill: include an explicit `npm install && npm run build` guard and invoke the binary by path.

## Capabilities

### Modified Capabilities

- `kanban-core-sync`: sync function now has a runnable CLI entry point

### Modified Capabilities (skill)

- `kanban-automation-hooks`: `/kanban-sync` skill gains explicit build + invoke instructions

## User Stories

| ID | Story |
|----|-------|
| U1 | After a fresh clone, `/kanban-sync` completes without manual build steps. |
| U2 | If the build is already up to date, the skill skips the build and runs the CLI directly. |
| U3 | If the sync fails (e.g. openspec CLI not found), the CLI exits non-zero and the skill reports the error. |

## Impact

- Modifies: `libs/kanban-core/package.json`, `libs/kanban-core/src/cli.ts` (new file)
- Modifies: `.claude/skills/kanban-sync/SKILL.md`
- No changes to the sync logic itself
- Depends on: `libs/kanban-core` build infrastructure
