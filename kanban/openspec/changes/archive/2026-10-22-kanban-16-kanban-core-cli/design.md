# Design

## Context

See proposal.md for motivation. Three things are broken:

1. `dist/` is gitignored — no compiled output in the repo
2. `typescript` not in `devDependencies` — `npm run build` fails on a fresh install
3. The skill has no execution instructions — no command, path, or build step

## Goals / Non-Goals

**Goals:**
- `npm install && npm run build` works in `libs/kanban-core/` without extra steps
- A single node command runs the sync from the project root
- The skill has an explicit, copy-pasteable invocation

**Non-Goals:**
- Changing sync logic
- Publishing to npm or making the bin globally available
- Adding tsx / removing the build step entirely

## Decisions

### Add `src/cli.ts` — thin wrapper, no new logic

```ts
import { syncFromOpenSpec } from './sync.js'
syncFromOpenSpec(process.cwd(), 'docs/kanban.yaml')
  .then(() => process.exit(0))
  .catch(e => { process.stderr.write(e.message + '\n'); process.exit(1) })
```

Alternative considered: ship a shell script. Rejected — shell scripts are banned by project conventions (`no bash scripts` in global CLAUDE.md).

### Skill build guard: check `dist/src/cli.js` before building

```
[ -f libs/kanban-core/dist/src/cli.js ] || (cd libs/kanban-core && npm install && npm run build)
node libs/kanban-core/dist/src/cli.js
```

This keeps the common path (dist already exists) fast. The build runs only on a fresh checkout or after a clean.

Alternative considered: always rebuild. Rejected — `tsc` takes several seconds and the skill runs frequently.

### `typescript` added to `devDependencies` (canonical fix)

The hotfix from the previous session added it. This change makes that the official state.

## Risks / Trade-offs

- `dist/` is still gitignored — contributors must build after clone. The skill handles this automatically; only direct script invocations outside the skill will fail until they build.
- `npm install` in the skill adds ~1s on first run. Acceptable.
