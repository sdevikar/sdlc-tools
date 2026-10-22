# Tasks

## 1. Add renderKanbanMarkdown to kanban-core

- [ ] 1.1 Add `renderKanbanMarkdown(entries: KanbanEntry[]): string` to `libs/kanban-core/src/render.ts` — groups by lane, sorts by priority ascending, returns a Markdown table with one column per lane, one row per card (id + summary), blank cells for shorter columns. Verify by importing and calling it in a test or REPL.
- [ ] 1.2 Add a unit test for `renderKanbanMarkdown` in `libs/kanban-core/test/` that covers: correct lane columns, priority sort within a lane, and blank-cell padding for uneven lanes. Verify `npm test` passes.
- [ ] 1.3 Export `renderKanbanMarkdown` from `libs/kanban-core/src/index.ts`. Verify it appears in `dist/index.d.ts` after build.

## 2. Add CLI entry point

- [ ] 2.1 Create `libs/kanban-core/src/cli-view.ts`: reads `docs/kanban.yaml` relative to CWD, calls `renderKanbanMarkdown`, prints to stdout, exits 1 with a message on read error. Verify `node dist/cli-view.js` from the project root prints the board table.
- [ ] 2.2 Add `"kanban-view": "dist/cli-view.js"` to the `bin` field in `libs/kanban-core/package.json`. Verify `npm run build` produces `dist/cli-view.js`.

## 3. Update kanban-view skill

- [ ] 3.1 Replace the LLM instruction body in `.claude/skills/kanban-view/SKILL.md` with: build guard (`npm install && npm run build` in `libs/kanban-core/` if `dist/cli-view.js` is absent), then `node <abs-path>/dist/cli-view.js`, print stdout verbatim. Verify `/kanban-view` prints the board without Claude reading the YAML.

## Workflow follow-up

- Update `docs/kanban.yaml`: set `kanban-17-kanban-view-programmatic` lane to `In Progress` when implementation starts, then `Archived` after archive.
- Archive the change after tests pass and the skill is verified: `openspec archive kanban-17-kanban-view-programmatic`.
