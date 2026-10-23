# Proposal

## Why

The plugin assumes that `libs/kanban-core/` is under the session working directory. That is only true inside the kanban source repo. In any other project, such as `genai-plugins-ad-data`, the `/kanban:setup` and `/kanban:sync` skills look for `<project>/libs/kanban-core/` and fail.

Evidence:

| Location | Assumption |
| --- | --- |
| `skills/kanban-setup/SKILL.md` step 2 | Builds `libs/kanban-core/` relative to the project root |
| `skills/kanban-setup/SKILL.md` step 1 | Runs `npm install` on the consumer project's `package.json` |
| `skills/kanban-sync/SKILL.md` | Runs `node libs/kanban-core/dist/src/cli.js` from the project root |
| Plugin cache `0.1.0` `register.tsx:353,407` | Ran `node ${cwd}/libs/kanban-core/dist/src/cli.js` (fixed in `cd4fec6`, kanban-30) |
| Plugin cache `0.1.1` | Ships `libs/kanban-core/src` but no `dist/`, so a build is always needed |

The `register.tsx` part is already fixed: kanban-30 replaced the CLI calls with inline sync (`runKanbanSetup`). The skills and four specs still describe the old design.

## What Changes

- `/kanban:sync` calls the mod tool `kanban_board_setup` instead of the kanban-core CLI. If the tool is not available, the agent does the scan and merge by hand (same rules as `/kanban:setup`).
- `/kanban:setup` removes the "build kanban-core" step.
- `/kanban:setup` stops running `npm install` on the consumer project. It checks that `openspec` is on `PATH` and asks the user before it installs it.
- The setup summary line no longer says "kanban-core built".
- Specs change to match the inline sync that kanban-30 shipped. The mod no longer runs `archive-sync` or `new-sync` CLI commands.
- New rule: plugin components never read plugin files through the session working directory.
- README install steps drop "Build `libs/kanban-core`".

`libs/kanban-core` stays in the repo. Its CLI and tests are still useful for development in the kanban repo.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `zero-config-install`: setup no longer builds kanban-core and no longer runs `npm install` on the consumer project. Adds a rule that plugin files are never resolved through the session working directory.
- `kanban-automation-hooks`: `/kanban-sync` uses the mod tool, not a built CLI.
- `claude-mod-archive-sync`: the mod moves archived entries with inline sync, not the `archive-sync` CLI.
- `claude-mod-new-change-sync`: the mod adds new entries with inline sync, not the `new-sync` CLI.

## Impact

- `skills/kanban-setup/SKILL.md`, `skills/kanban-sync/SKILL.md`
- `README.md` install section
- `mod/kanban-board/hooks/register.tsx`: no code change expected. Verify only.
- `.qgenie-plugin/plugin.json` lists `kanban-init` and `setup` skills that do not exist under `skills/`. This is out of scope, but it is noted here for a follow-up.
- Users on plugin `0.1.0` still have the old `register.tsx`. They need to update to the new version.
