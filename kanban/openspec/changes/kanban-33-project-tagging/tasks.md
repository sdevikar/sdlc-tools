# Tasks

## 1. kanban-core: type and serialization

- [ ] 1.1 Add `project?: string` to the `KanbanEntry` interface in `libs/kanban-core/src/types.ts` and verify TypeScript compilation passes (`npm run build` in `libs/kanban-core/`).
- [ ] 1.2 Update `readKanban` in `libs/kanban-core/src/format.ts` to parse the optional `project:` field from YAML entries; verify that an entry with `project: auth` parses to `project === "auth"` and an entry without the field parses to `project === undefined`.
- [ ] 1.3 Update `writeKanban` in `libs/kanban-core/src/format.ts` to emit `project: <value>` when the field is non-empty and omit the line otherwise; verify round-trip equality (`readKanban(writeKanban(entries))` produces the same `project` values).

## 2. kanban-core: sync logic

- [ ] 2.1 Add a `extractProject(changeId: string): string | undefined` helper in `libs/kanban-core/src/sync.ts` using regex `^(.+?)(?=-\d+-)`. Verify: `extractProject("kanban-28-setup")` returns `"kanban"`, `extractProject("marketplace-plugin-03-icon")` returns `"marketplace-plugin"`, `extractProject("myfeat")` returns `undefined`.
- [ ] 2.2 Update `mergeSync` to call `extractProject` when creating new entries (populate `project` from change ID) and to preserve any existing non-empty `project` value when updating an entry; verify with unit tests for both paths.
- [ ] 2.3 Update the `new-sync` subcommand to include `project:` extracted from the change name on new entries; verify by running `node dist/src/cli.js new-sync` against a test fixture folder and confirming the added entry contains the expected `project` value.
- [ ] 2.4 Rebuild kanban-core (`npm run build` in `libs/kanban-core/`) and verify `npm test` passes.

## 3. Pane: project group headers

- [ ] 3.1 Add `collapsedProjects: string[]` to the pane state type in `mod/kanban-board/types/index.d.ts`; initialize it as `[]` in the pane's initial state.
- [ ] 3.2 Update the pane rendering in `mod/kanban-board/hooks/register.tsx` to group entries by `project:` when at least one entry has a non-empty `project` value; render entries with no `project` in an "Other" group at the bottom; verify the pane renders project group headers in a test board with mixed-project entries.
- [ ] 3.3 Add a collapse/expand toggle to each project group header that adds or removes the project name from `collapsedProjects`; when collapsed, hide all entries in that group; verify collapse and expand work independently per group with `/kanban-view`.
- [ ] 3.4 Verify the pane falls back to flat (no group headers) when no entries have a `project:` field, matching the current behavior.

## 4. Setup skill: opt-in project-area CLAUDE.md generation

- [ ] 4.1 Add a new opt-in step to `skills/kanban-setup/SKILL.md` after the `kanban.yaml` create/sync step: ask the user whether to generate subdirectory CLAUDE.md files for project-area tagging; skip on decline and continue; verify the skill skips the step when the user declines.
- [ ] 4.2 Implement the generation logic in the skill instructions: scan immediate non-hidden, non-`node_modules` subdirectories; for each, generate a `CLAUDE.md` that names the project prefix (`<subdir>`) and the required naming pattern (`<subdir>-NN-<slug>`); show existing content and require user confirmation before overwriting; verify a CLAUDE.md is created correctly in a test subdir when the user accepts.

## 5. Backfill and documentation

- [ ] 5.1 Run `kanban-sync` (or `new-sync`) in this repo to backfill `project:` on all existing entries and verify that every entry in `kanban.yaml` now has `project: kanban`.
- [ ] 5.2 Update `AGENTS.md` Conventions section to document the `<project>-NN-<slug>` naming convention and explain that `project:` is auto-extracted by `mergeSync` and `new-sync`.
- [ ] 5.3 Open `/kanban-view` and verify the pane shows a single "kanban" project group containing all active entries with a working collapse/expand toggle.

## Workflow follow-up

- Archive the change after all tasks pass.
- Update `kanban.yaml` to move this entry to Archived.
