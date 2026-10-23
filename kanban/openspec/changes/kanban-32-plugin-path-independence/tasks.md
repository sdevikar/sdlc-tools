# Tasks

## 1. Skills

- [x] 1.1 Rewrite `skills/kanban-sync/SKILL.md` to call `kanban_board_setup`, with a fallback to `/kanban:setup` steps 5–6. Verify: `grep -n "libs/" skills/kanban-sync/SKILL.md` returns nothing.
- [x] 1.2 In `skills/kanban-setup/SKILL.md`, remove step 2 (build kanban-core). Replace step 1 with an `openspec --version` check that asks the user before a global install. Verify: `grep -n "libs/\|npm install &&" skills/kanban-setup/SKILL.md` returns nothing.
- [x] 1.3 Update the setup skill's `description` and the step 7 summary line so they no longer say "kanban-core built". Verify by reading the frontmatter and step 7.

## 2. Mod check

- [x] 2.1 Confirm that `mod/kanban-board/hooks/register.tsx` uses `$.session.cwd()` only for `kanban.yaml` and `openspec/` paths. Verify: `grep -n "libs/\|cli.js" mod/kanban-board/hooks/register.tsx` matches only the `// Inline sync functions` comment.

## 3. Docs and version

- [x] 3.1 In `README.md`, remove "Build `libs/kanban-core`" from the install steps. Add a note to run `/plugin update kanban` when you upgrade from 0.1.0. Verify: `grep -n "Build \`libs/kanban-core\`" README.md` returns nothing.
- [x] 3.2 Bump the version in `plugin.json`, `.claude-plugin/plugin.json`, and `.qgenie-plugin/plugin.json` to `0.1.2`. Verify: `grep -h '"version"' plugin.json .claude-plugin/plugin.json .qgenie-plugin/plugin.json` shows `0.1.2` three times.

## 4. Integration check

- [x] 4.1 Run `openspec validate kanban-32-plugin-path-independence --strict`. Verify that it passes.
- [ ] 4.2 In a test project with no `libs/` directory (for example, `~/personal/kanban_fresh_test`), install the updated plugin. Run `/kanban:setup`, then `/kanban:sync`. Verify that both report success with no `libs/kanban-core` warning, and that `kanban.yaml` lists the project's changes.

## Workflow follow-up

- File a follow-up for the `.qgenie-plugin/plugin.json` skill list. It names `kanban-init` and `setup`, which do not exist under `skills/`.
- Archive the change after the integration check passes.
