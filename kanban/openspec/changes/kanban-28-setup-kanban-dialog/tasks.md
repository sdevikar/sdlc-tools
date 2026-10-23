# Tasks

## 1. Remove the /init observer

- [x] 1.1 Delete the `command.run` hook on `init` from `mod/kanban-board/hooks/register.tsx`; verify `claude plugin validate .` no longer lists a `command.run` hook for `init`
- [x] 1.2 Rename `initMode` to `setupMode` in `mod/kanban-board/types/index.d.ts` and `register.tsx`, and rename `INIT_DIALOG` / `kanban-init-dialog` to `SETUP_DIALOG` / `kanban-setup-dialog`; verify `grep -rn "initMode\|init-dialog" mod/` returns nothing

## 2. Setup tool

- [x] 2.1 Move the Yes `onPress` body into `runKanbanSetup($): Promise<string>`, which returns the result line or `error: <reason>` and no longer calls `$.session.append`; verify the Yes button still writes `kanban.yaml` when the pane is opened by hand
- [x] 2.2 In `session.start`, call `$.tool.register({ name: 'kanban_board_setup', description, inputSchema: { type: 'object' } })` and log the returned full tool name; verify the name appears in `$.tool.list()` output after reload
- [x] 2.3 Add a `tool.call` hook on the registered name that sets `setupMode`, opens the dialog, returns `error: <reason>` if `isPlaced` is false, and otherwise awaits the user's answer and returns `{ result: text }`; verify a test session gets the result text back

## 3. Dialog answers

- [x] 3.1 Wire Yes to resolve the pending call with `runKanbanSetup` output and No to resolve with `declined`; verify each text reaches the model
- [x] 3.2 Add a `ui.close` hook on the dialog id that resolves the pending call with `declined` when `origin.kind` is `person`; verify Esc returns `declined` and writes no file

## 4. Setup skill

- [x] 4.1 Rewrite step 4 of `skills/setup/SKILL.md`: call the kanban setup tool if it is available, otherwise ask in chat and invoke `kanban-init` on yes; update step 5 so the summary reports created, synced, skipped, or failed; verify by running `/kanban:setup` in a project with no `kanban.yaml`

## 5. Docs

- [x] 5.1 In `README.md` and `docs/architecture.md`, remove the `/init` observer text and describe the setup dialog; verify `grep -n "/init observer" README.md docs/` returns nothing

## 6. Validation

- [ ] 6.1 Add a `*.test.ts` in `mod/kanban-board/hooks/` that checks `/init` opens no pane and that No returns `declined`; run `claude plugin test mod/kanban-board` and confirm it passes
- [x] 6.2 Run `claude plugin validate .` and `tsc -p mod/kanban-board`; confirm zero errors
- [x] 6.3 Run `openspec validate kanban-28-setup-kanban-dialog --strict`; confirm it passes

## Workflow follow-up

- Archive the change after implementation is verified.
- Move `kanban-28-setup-kanban-dialog` to the Archived lane in `kanban.yaml`.
- Push to main.
