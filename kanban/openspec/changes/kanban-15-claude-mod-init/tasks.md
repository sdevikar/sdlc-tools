# Tasks

## 1. State contract

- [ ] 1.1 Add `initMode: 'init' | 'sync' | null` to `types/index.d.ts` in the kanban-board mod and verify `claude plugin validate` reports no contract errors

## 2. Init observer hook

- [ ] 2.1 Add a `command.run` hook for `'init'` in `register.tsx` that calls `next(e)`, checks whether `docs/kanban.yaml` exists (init vs sync mode), sets `$.state` key `initMode`, then opens a `rows: 5` pane with `focus`, `closeOnEscape` as the confirmation dialog; verify the pane opens after `/init` in a test session

## 3. Dialog pane rendering

- [ ] 3.1 Add a `ui.render` hook for `{ component: 'Pane', requestId: INIT_DIALOG }` that reads `initMode` state and renders the correct prompt text with Yes and No buttons; verify the prompt text matches "No kanban board found..." in init mode and "Kanban board found..." in sync mode

- [ ] 3.2 Wire the No button `onPress` to clear `initMode` state and close the pane; verify Esc and No both dismiss the dialog with no file written

## 4. Sync execution

- [ ] 4.1 Inline the `mapLane`, `mapStatus`, and `mergeSync` functions from `libs/kanban-core/src/sync.ts` verbatim into `register.tsx`; verify they produce the same lane/status output as the source functions for a known input

- [ ] 4.2 Implement the Yes button `onPress` handler: call `openspec list --json` via `$.process.run`, call `openspec status --change <name> --json` for each active change, scan the archive directory via `$.fs.list`, run `mergeSync`, serialise to YAML via `$.fs.write`, append a result line to the transcript via `$.session.append`, and close the pane; verify `docs/kanban.yaml` is written and the result line appears after clicking Yes on a project with an openspec directory

- [ ] 4.3 Add error guard: if `openspec list --json` fails, show a toast with the error reason and close the pane; verify the guard fires on a project with no `openspec/` directory

## 5. Validation

- [ ] 5.1 Run `claude plugin validate` on the mod folder and confirm zero errors; run `tsc -p <mod folder>` (with generated tsconfig) and confirm zero type errors

## Workflow follow-up

- Archive the change after implementation is verified.
- Update `docs/kanban.yaml` to move `kanban-15-claude-mod-init` to Archived lane.
- Push to master.
