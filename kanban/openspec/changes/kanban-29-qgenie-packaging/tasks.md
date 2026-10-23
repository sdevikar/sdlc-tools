# Tasks

## 1. Create the QGenie plugin manifest

- [x] 1.1 Create `.qgenie-plugin/plugin.json` at the repo root with `id: "<org>/kanban"`, `version: "0.1.1"`, `displayName`, `description`, `preferredHarness: "claude"`, all 10 skill entries under `capabilities.skills` (each with `id` and `path`), and `adapters.claude.path: "./mod/kanban-board/"`; verify every path starts with `./` and resolves inside the repo root
- [x] 1.2 Confirm `libs/kanban-core/dist/` is present and not excluded from the package; run `ls libs/kanban-core/dist/` and verify compiled output exists
- [x] 1.3 Run `claude plugin validate .` and confirm zero errors on the new manifest

## 2. Update install documentation

- [x] 2.1 Add a **QGenie install** section to `INSTALL.md` with the command `qgenie plugins add <org>/kanban --target claude` and both prerequisites (`CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` and `npm install @fission-ai/openspec`); verify `grep -n "qgenie plugins add" INSTALL.md` returns a match
- [x] 2.2 Confirm `.claude-plugin/plugin.json` is unchanged; run `git diff .claude-plugin/plugin.json` and verify empty output

## 3. Validate spec compliance

- [x] 3.1 Run `openspec validate kanban-29-qgenie-packaging --strict` and confirm it passes

## Workflow follow-up

- Confirm org/handle with the QGenie registry team before publishing (id is immutable after first publish).
- **[Human approval gate]** Open the QGenie Plugin Registry, add the plugin, and publish with semver tag `0.1.1`.
- Verify install: `qgenie plugins add <org>/kanban --target claude` in a test project; confirm all 10 skills appear and `/kanban-view` opens the pane.
- Archive the change after publish is verified: `openspec archive kanban-29-qgenie-packaging`.
- Move `kanban-29-qgenie-packaging` to the Archived lane in `kanban.yaml`.
- Push to main.
