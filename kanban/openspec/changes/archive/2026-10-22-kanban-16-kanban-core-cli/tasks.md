# Tasks

## 1. Fix kanban-core build infrastructure

- [x] 1.1 Confirm `typescript` is in `devDependencies` of `libs/kanban-core/package.json` (hotfix from prior session). If absent, add it. Verify: `npm install` in `libs/kanban-core/` installs tsc without extra steps.
- [x] 1.2 Add `libs/kanban-core/src/cli.ts`: calls `syncFromOpenSpec(process.cwd(), 'docs/kanban.yaml')`, exits 0 on success, exits 1 with stderr message on error. Verify: `npm run build` produces `dist/src/cli.js`.
- [x] 1.3 Add `"bin": { "kanban-sync": "dist/src/cli.js" }` to `libs/kanban-core/package.json`. Verify: entry present and points to the correct file.

## 2. Update kanban-sync skill

- [x] 2.1 Rewrite `.claude/skills/kanban-sync/SKILL.md` with explicit invocation: build guard (`[ -f libs/kanban-core/dist/src/cli.js ] || (cd libs/kanban-core && npm install && npm run build)`), then `node libs/kanban-core/dist/src/cli.js`. Report any non-zero exit as an error. Verify: skill text contains the build guard and the node invocation.
- [x] 2.2 Smoke-test: delete `libs/kanban-core/dist/`, run `/kanban-sync`, confirm it rebuilds and syncs without manual steps.

## Workflow follow-up

- Archive this change after smoke-test passes.
