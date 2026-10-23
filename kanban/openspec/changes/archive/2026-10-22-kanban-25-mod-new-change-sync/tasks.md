# Tasks

## 1. Add `applyNewChanges` to kanban-core

- [x] 1.1 In `libs/kanban-core/src/sync.ts`, export `applyNewChanges(cwd: string, kanbanPath: string): Promise<void>`. It reads `openspec/changes/` (skipping the `archive` entry), reads `kanban.yaml`, finds folders that have a `proposal.md` and no existing kanban entry (match by folder name), extracts priority from `NN` in `kanban-NN-<slug>` (default 99), extracts the first sentence under `## Why` from `proposal.md` (trim to 80 chars), creates the entry with lane `Not Started`, status `proposal written`, `specPath` `openspec/changes/<name>/`, and appends it. Writes back with `writeKanban`.
- [x] 1.2 In `libs/kanban-core/src/cli.ts`, extend the subcommand dispatch to handle `new-sync` by calling `applyNewChanges`. The dispatch order is: `archive-sync` → `applyArchives`, `new-sync` → `applyNewChanges`, else → `syncFromOpenSpec`.
- [x] 1.3 Build: `cd libs/kanban-core && npm run build`. Verify `node dist/src/cli.js new-sync` exits 0 on the project and adds no duplicate entries.

## 2. Update the mod

- [x] 2.1 In `mod/kanban-board/hooks/register.tsx` (project source), add a module-level `let changesMtime = 0` variable and a module-level `const skippedFolders = new Set<string>()`.
- [x] 2.2 Add `checkChangesFolder($)`: stats `openspec/changes/`, returns if mtime unchanged and `skippedFolders` is empty, updates `changesMtime`, lists subfolders excluding `archive`, checks each for `proposal.md` via `$.fs.stat`, adds folders without one to `skippedFolders`, collects folders with `proposal.md` and no kanban entry as missing, removes found folders from `skippedFolders`, runs `node libs/kanban-core/dist/src/cli.js new-sync` if any missing, shows toast on non-zero exit, calls `invalidateIfOpen($)` on success.
- [x] 2.3 In the existing timer callback (from kanban-24), add a call to `checkChangesFolder($)`. Also call `await checkChangesFolder($)` in the `session.start` initial check.
- [x] 2.4 Sync the deployed mod: copy `mod/kanban-board/hooks/register.tsx` to `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx`. Verify: file contents match.
