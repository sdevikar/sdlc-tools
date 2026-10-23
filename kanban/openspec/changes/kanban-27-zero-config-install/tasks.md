# Tasks

## 1. Setup script scaffolding

- [ ] 1.1 Create `bin/setup.js` as a Node.js script and verify it runs without error via `node bin/setup.js --dry-run` (or just `node bin/setup.js` against a temp directory).
- [ ] 1.2 Add `"postinstall": "node bin/setup.js"` and a `bin` entry to `package.json`, and verify `npm pack` includes `bin/setup.js`.

## 2. Settings.json write

- [ ] 2.1 Implement logic to resolve the consuming project root from `npm_config_local_prefix` with `process.cwd()` fallback, and verify it prints the correct path when run from a test directory.
- [ ] 2.2 Implement JSON merge: read `.claude/settings.json` if present, set `env.CLAUDE_CODE_PLUGIN_DIRS` to the absolute mod path, write back, and verify existing keys are preserved in the output file.
- [ ] 2.3 Verify fresh install case: running the script against a directory with no `.claude/settings.json` creates the file with the correct `env.CLAUDE_CODE_PLUGIN_DIRS` value.

## 3. Skill symlinks

- [ ] 3.1 Implement symlink creation: iterate `skills/`, create `.claude/skills/<name>` symlinks in the consuming project root, and verify each symlink resolves to the correct source directory.
- [ ] 3.2 Verify idempotency: running the script twice does not error and leaves exactly one symlink per skill.
- [ ] 3.3 Verify existing unrelated symlinks in `.claude/skills/` are not removed.

## 4. README update

- [ ] 4.1 Replace the "Auto-load the mod" and "Link project skills" manual steps in `README.md` with a single `npm install` instruction, and verify the setup section reads correctly.

## Workflow follow-up

- Sync the kanban board: run `/kanban-sync` to move this entry to In Progress, then to Done after implementation.
- Archive the change after tests pass: run `openspec archive kanban-27-zero-config-install`.
