# Tasks

## 1. Add `applyArchives` to kanban-core

- [x] 1.1 In `libs/kanban-core/src/sync.ts`, export `applyArchives(cwd: string, kanbanPath: string): Promise<void>`. It reads `openspec/changes/archive`, reads `kanban.yaml`, finds gap entries (archived folder name whose kanban entry has lane not equal to `Archived` case-insensitively, or has no entry), sets lane to `Archived`, status to `archived`, `archivedAt`/`completedAt`/`updatedAt` to local date (`new Date().toISOString().slice(0,10)`), and preserves all other fields. Appends new entries for folders with no existing entry. Writes back with `writeKanban`.
- [x] 1.2 In `libs/kanban-core/src/cli.ts`, add subcommand dispatch on `process.argv[2]`: `archive-sync` calls `applyArchives`, anything else calls `syncFromOpenSpec`. Preserve the existing exit-0/exit-1 behavior.
- [x] 1.3 Build: `cd libs/kanban-core && npm run build`. Verify `dist/src/cli.js` and `dist/src/sync.js` are updated and `node dist/src/cli.js archive-sync` exits 0 on the project.

## 2. Update the mod

- [x] 2.1 In `mod/kanban-board/hooks/register.tsx` (project source), remove `opsx-archive` and `opsx-propose` from the `KANBAN_COMMANDS` tuple. Verify: the tuple now contains only `kanban-sync` and `kanban-render`.
- [x] 2.2 Add a module-level `let archiveMtime = 0` variable and an async `checkArchiveFolder($)` function that: stats `openspec/changes/archive` with `$.fs.stat`, returns if `mtimeMs` equals `archiveMtime`, updates `archiveMtime`, runs `node libs/kanban-core/dist/src/cli.js archive-sync` via `$.process.run` with cwd set to `await $.session.cwd()`, shows `$.ui.toast` on non-zero exit, and calls `invalidateIfOpen($)` on success.
- [x] 2.3 In the `session.start` hook, call `$.clock.every(5000, () => checkArchiveFolder($))` and `await checkArchiveFolder($)` after registering the `kanban-view` command. Verify: the timer starts and the initial baseline is set.
- [x] 2.4 Sync the deployed mod: copy `mod/kanban-board/hooks/register.tsx` to `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx`. Verify: file contents match.
