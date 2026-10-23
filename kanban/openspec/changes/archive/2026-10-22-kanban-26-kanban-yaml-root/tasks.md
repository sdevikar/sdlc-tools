## 1. kanban-core

- [x] 1.1 Add `libs/kanban-core/src/paths.ts` that exports `KANBAN_FILE = 'kanban.yaml'`.
- [x] 1.2 In `src/cli.ts`, replace the three `'docs/kanban.yaml'` arguments with `KANBAN_FILE`.
- [x] 1.3 In `src/cli-view.ts`, build `yamlPath` as `join(process.cwd(), KANBAN_FILE)`.
- [x] 1.4 Add a test: run `cli-view` in a temp dir that has only `docs/kanban.yaml`. Expect exit 1 and the error to name `<dir>/kanban.yaml`.
- [x] 1.5 Run `npm run build && npm test` in `libs/kanban-core`. All tests pass.

## 2. Claude mod

- [x] 2.1 In `mod/kanban-board/hooks/register.tsx`, change `kanbanPath()` to return `${cwd}/kanban.yaml`.
- [x] 2.2 In the `/init` observer, replace the two inline `${cwd}/docs/kanban.yaml` strings with `await kanbanPath($)`.
- [x] 2.3 Change the pane error text to `Could not read kanban.yaml`.
- [x] 2.4 Copy `register.tsx` to `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx` and reload the mod.
- [x] 2.5 Manual check: run `/kanban-view` in this repo. The pane shows the board from the root file.

## 3. Move this repo's board

- [x] 3.1 Run `git mv docs/kanban.yaml kanban.yaml`.
- [x] 3.2 Run `node libs/kanban-core/dist/src/cli.js new-sync`. Confirm it updates `kanban.yaml` and does not create `docs/kanban.yaml`.

## 4. Skills and agent rules

- [x] 4.1 Replace `docs/kanban.yaml` with `kanban.yaml` in `skills/kanban`, `skills/kanban-init`, `skills/kanban-render` SKILL.md files.
- [x] 4.2 Do the same in `.opencode/skills/kanban`, `.opencode/skills/kanban-render`, `.opencode/skills/kanban-sync` SKILL.md files.
- [x] 4.3 Do the same in `AGENTS.md`, `CLAUDE.md`, `.kiro/steering/kanban.md`, `.clinerules/kanban.md`, `.cursor/rules/kanban.md`, `.windsurf/rules/kanban.md`.
- [x] 4.4 Add a migration note to `README.md`: "Board moved to `kanban.yaml` at project root. Run `git mv docs/kanban.yaml kanban.yaml`."

## 5. Main spec Purpose text

- [x] 5.1 In `openspec/specs/kanban-view/spec.md`, change Purpose to name `kanban.yaml`.
- [x] 5.2 In `openspec/specs/claude-mod-autosync/spec.md`, change Purpose to name `kanban.yaml`.

## 6. Verify

- [x] 6.1 Run `grep -rn "docs/kanban" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=archive --exclude-dir=plans .`. Expect matches only inside this change folder.
- [x] 6.2 Run `openspec validate kanban-26-kanban-yaml-root --strict`. It passes.

## Archive

- Commit sections 1–5 as one atomic commit (code, file move, and docs together).
- Archive the change and move `kanban-26-kanban-yaml-root` to the Archived lane in `kanban.yaml`.
