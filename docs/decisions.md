# Decisions

A log of decisions and assumptions for the sdlc-tools marketplace.

## 2026-11-14: Combine three marketplaces into one

| Decision | Reason |
| --- | --- |
| Move devflow, kanban, and mission-ctrl into one repo, one top-level folder each. | The plugins work together. One marketplace gives one install source and lets devflow name `kanban` as a same-marketplace dependency. |
| Import each repo with `git filter-repo --to-subdirectory-filter`, then `git merge --allow-unrelated-histories`. | This keeps every commit. `git log -- <folder>` shows the full history of each plugin. |
| Rename old tags to `<plugin>--v<version>`. | This is the tag form Claude Code uses for plugins in a monorepo. It also stops tag names from clashing. |
| Drop the `openspec` plugin that the old kanban marketplace listed. | The kanban plugin already ships the OpenSpec skills. |
| Archive the old repos after a "moved" notice. | Users who open the old repo find the new location. |

## 2026-11-14: mission-ctrl plugin root is the project folder

A GitHub marketplace install copies only the plugin folder into the plugin cache. The old plugin root was `mission-ctrl/packages/claude-plugin/`. Its `bin/mission-ctrl` wrapper needs `packages/core` and `packages/pi-package`, which were outside that folder, so the installed plugin failed.

| Decision | Reason |
| --- | --- |
| Make `mission-ctrl/` the plugin root and move the manifest to `mission-ctrl/.claude-plugin/plugin.json`. | The cache copy then includes the Python packages, `pyproject.toml`, and `uv.lock`. |
| Keep the skills and hooks in `packages/claude-plugin/`. The manifest points to them with `skills` and `hooks` paths. | This keeps the edit small. Open proposals that name those paths stay correct. |
| Add `mission-ctrl/bin` as a relative symlink to `packages/claude-plugin/bin`. | `bin/` must be at the plugin root to go on the Bash PATH. A symlink inside the plugin folder stays a symlink in the cache. |
| Mark mission-ctrl as beta with `displayName`, a "Beta:" description, and a `beta` tag. | The marketplace format has no status field. |

Assumptions:

- `uv` is on PATH for mission-ctrl users. The wrapper re-runs itself through `uv run --project <root>` when the system Python lacks the dependencies.
- Users are on Linux or macOS. Git on Windows can check out the `bin` symlink as a plain text file.
