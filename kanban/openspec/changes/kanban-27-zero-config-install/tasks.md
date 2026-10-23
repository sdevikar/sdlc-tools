# Tasks

## 1. Fix `hooks/hooks.json`

- [ ] 1.1 Change `hooks/hooks.json` at the repo root from `{ "hooks": {} }` to
  `{ "modules": ["./mod/kanban-board/hooks/register.tsx"] }` and verify that
  `claude plugin validate .` reports no errors for the hooks component.

## 2. Fix `marketplace.json`

- [ ] 2.1 Rewrite `.claude-plugin/marketplace.json` to the required format:
  ```json
  {
    "name": "kanban",
    "owner": { "name": "Swapnil Devikar" },
    "plugins": [{ "name": "kanban", "source": "./" }]
  }
  ```
  and verify that `claude plugin validate .` passes (no `plugins` array error).

## 3. Add setup skill

- [ ] 3.1 Create `skills/setup/SKILL.md`. The skill must:
  1. Check for `package.json` at the project root and run `npm install` if
     `node_modules/@fission-ai/openspec` is absent.
  2. Check for `libs/kanban-core/dist/src/cli.js` and run `npm install && npm run build`
     inside `libs/kanban-core/` if the file is absent.
  3. Check for `openspec/config.yaml` and run `npx openspec init` if absent.
  4. Invoke the `kanban-init` skill to create or sync `kanban.yaml`.
  5. Print one summary line: `Setup complete: openspec ready, kanban-core built, kanban.yaml
     created/synced`.
- [ ] 3.2 Verify that running `/kanban:setup` in a fresh clone (no `node_modules`, no
  `dist`, no `kanban.yaml`) produces the summary line and leaves a valid `kanban.yaml`.

## 4. README update

- [ ] 4.1 In `README.md`, replace the "Auto-load the mod" and "Link project skills" sections
  with:
  ```
  /plugin install kanban --marketplace qcom-all-gh-users/kanban
  /kanban:setup
  ```
  Add a note: each contributor runs both commands once after cloning; project-scope install
  writes an `enabledPlugins` entry to `.claude/settings.json`.
- [ ] 4.2 Verify the updated setup section reads correctly end-to-end.

## Workflow follow-up

- Move the kanban board entry to In Progress: run `/kanban-sync`.
- After tests pass, archive the change: run `openspec archive kanban-27-zero-config-install`.
