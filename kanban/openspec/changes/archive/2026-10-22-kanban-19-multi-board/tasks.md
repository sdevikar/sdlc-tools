# Tasks

## 1. Schema and types

- [ ] 1.1 Add `BoardRef` interface (`{name: string; path: string}`) to `libs/kanban-core/src/types.ts` and add optional `boards?: BoardRef[]` to the root data type; verify TypeScript compiles with `npm run build` in `libs/kanban-core/`
- [ ] 1.2 Update `readKanban` in `libs/kanban-core/src/kanban.ts` to parse and return the `boards` field (empty array when absent); verify existing round-trip test still passes
- [ ] 1.3 Update `writeKanban` in `libs/kanban-core/src/kanban.ts` to serialize `boards:` when non-empty; verify a new round-trip test with a `boards` entry produces deeply equal output
- [ ] 1.4 Add a unit test in `libs/kanban-core/test/` covering: read with boards, read without boards, write preserves boards; run `npm test` and confirm all tests pass

## 2. Multi-board sync

- [ ] 2.1 Update `syncFromOpenSpec` in `libs/kanban-core/src/sync.ts` to walk `boards:` entries — resolve each path relative to the root YAML's directory, run sync for each sub-board against the nearest OpenSpec root in that sub-board's directory tree, and skip with a console warning when no OpenSpec root is found
- [ ] 2.2 Add a unit test for the walking logic: two registered boards, one with an openspec root (syncs) and one without (warns and skips); run `npm test` and confirm it passes
- [ ] 2.3 Rebuild: run `npm run build` in `libs/kanban-core/` and verify `dist/` reflects the changes

## 3. CLI view: board flag and grouped output

- [ ] 3.1 Add `--board <name>` flag to `libs/kanban-core/src/cli-view.ts`; when passed, load only the matching board from `boards:` and render it with the existing flat renderer; exit with a non-zero code and list available names when the name is unknown
- [ ] 3.2 Update the default (no `--board` flag) rendering path: when `boards:` is non-empty, render each board as a `### <board-name>` section followed by its swim-lane output; when `boards:` is absent or empty, render unchanged
- [ ] 3.3 Build and run `node dist/src/cli-view.js` against a test `kanban.yaml` with two boards; confirm grouped output appears and `--board` filters correctly

## 4. Skill updates

- [ ] 4.1 Update `skills/kanban-sync/SKILL.md` to state that sync walks all boards in `boards:` when present; verify the description accurately reflects multi-board behavior
- [ ] 4.2 Update `skills/kanban-view/SKILL.md` to document the `board=<name>` argument and the grouped default; verify the updated skill text matches the spec scenarios

## 5. Mod init hook — sub-board discovery

- [ ] 5.1 In `mod/kanban-board/hooks/register.tsx`, extend the `/init` observer to scan subdirectories for unregistered `kanban.yaml` files after the existing init work completes; exclude paths already in `boards:`
- [ ] 5.2 For each discovered file, render a confirmation prompt via `$.ui` with the default name derived from the parent directory; if the user confirms, append the entry to `boards:` in the root `kanban.yaml` and print `Registered sub-board: <name> (<path>)`
- [ ] 5.3 Support name override in the confirmation prompt; verify the overridden name is written to `boards:`
- [ ] 5.4 Guard against running discovery when `/init` is invoked from inside a sub-board directory (i.e. the cwd's `kanban.yaml` is already registered in a parent's `boards:`); skip sub-board scan in that case
- [ ] 5.5 Manually test: create `plugins/auth/kanban.yaml` and `plugins/billing/kanban.yaml`, run `/init` from project root, confirm both appear as prompts, confirm one and decline the other, verify root `kanban.yaml` `boards:` has exactly one new entry

## 6. Deprioritize git issue sync

- [ ] 6.1 In `docs/kanban.yaml`, set `priority: 99` on the `kanban-06-github-issues` entry; verify `openspec status` still runs without error

## 7. Integration verify

- [ ] 7.1 Run `/kanban-sync` and confirm it prints per-board results (root + any registered boards); no errors
- [ ] 7.2 Run `/kanban-view` and confirm grouped output with one section per board; run `/kanban-view board=<name>` and confirm single-board output

## Workflow follow-up

- Archive this change after all tasks pass: `openspec archive kanban-19-multi-board`.
- Update `docs/kanban.yaml`: move `kanban-19-multi-board` to Archived lane and set `completedAt`.
