# Decisions

A log of decisions and assumptions for the sdlc-tools marketplace.

## 2026-11-14: Combine three marketplaces into one

| Decision | Reason |
| --- | --- |
| Move devflow, kanban, and mission-ctrl into one repo, one top-level folder each. | The plugins work together. One marketplace gives one install source and lets devflow name `kanban` as a same-marketplace dependency. |
| Import each repo with `git filter-repo --to-subdirectory-filter`, then `git merge --allow-unrelated-histories`. | This keeps every commit. `git log -- <folder>` shows the full history of each plugin. |
| Rename old tags to `<plugin>--v<version>`. | This is the tag form Claude Code uses for plugins in a monorepo. It also stops tag names from clashing. |
| Drop the `openspec` plugin that the old kanban marketplace listed. | Its folder had only a `plugin.json` and no skills. The `/openspec-*` skills come from the OpenSpec CLI: `openspec init` adds them to each project. |
| List the OpenSpec CLI as a kanban prerequisite, not as a plugin dependency. | OpenSpec ships as an npm package, not as a Claude Code plugin. A plugin `dependencies` entry can only name plugins. |
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

## 2026-11-14: One layer per tool; mission-ctrl is the intent layer

The user set this model:

| Layer | Tool | Job |
| --- | --- | --- |
| Intent | mission-ctrl | Decide what to build, when, and what "good" means. A gate before a proposal exists. |
| Execution | devflow | Create proposals, manage docs, plan commits, write handoffs, run reviews. |
| Optimization | ponytail | Keep the code small. It acts after the fact. mission-ctrl acts before. |
| UX | kanban | Show the board. It does not decide priority. |

| Decision | Reason |
| --- | --- |
| Drop the edit guard (Oct 26 reset, `mvp_002`) from mission-ctrl. | A check during edits is execution, not intent. It overlaps ponytail. |
| Remove the `UserPromptSubmit` keyword hook from the Claude Code plugin. Bump mission-ctrl to 0.1.1. | It blocked prompts such as "implement", which devflow's `atomic-commits` expects. The reset found 6 of 6 blocks wrong. A set `version` keeps users on the old copy until it changes. |
| Reject mission-ctrl proposals `handoff-pickup-27` and `session-handoff-23`. | devflow ships handoff, pickup, and the session-start pointer. |
| Reject and delete `semantic-intent-20`. | It classified prompts for the removed hook. |
| Set the mission-ctrl mission and MVP to v3.0 (intent layer). | The v2 mission described the edit guard. |
| mission-ctrl will list devflow as a dependency and reuse OpenSpec and kanban for proposals and status. Not done yet. | One task system. The change waits for the triage spike. |
| Run a triage spike before any more mission-ctrl code. | Strong agents may already judge scope well from a mission statement. The spike checks whether mission-ctrl adds value. |

Assumption: mission-ctrl must remember rejected ideas, or the agent proposes them again. This record, plus mission and MVP, is the only state mission-ctrl needs to own.
