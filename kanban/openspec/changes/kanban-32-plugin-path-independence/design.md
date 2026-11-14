# Design

## Context

See proposal.md - Why. The plugin has two kinds of paths:

| Kind | Example | Correct base |
| --- | --- | --- |
| Project data | `kanban.yaml`, `openspec/changes/` | Session working directory |
| Plugin files | `libs/kanban-core/`, skill scripts | `${CLAUDE_PLUGIN_ROOT}` (installed plugin version) |

The skills used the session working directory for plugin files. kanban-30 (`cd4fec6`) already fixed the mod: `register.tsx` uses `$.session.cwd()` only for `kanban.yaml` and `openspec/`. It runs sync inline (`runKanbanSetup`) and exposes it as the tool `kanban_board_setup`.

The Claude Code docs say that `${CLAUDE_PLUGIN_ROOT}` and `${CLAUDE_PLUGIN_DATA}` are substituted in plugin skill content ([skills docs](https://code.claude.com/docs/en/skills)). They are not set in the Bash tool environment ([plugins reference](https://code.claude.com/docs/en/plugins-reference)).

## Goals / Non-Goals

**Goals:**
- Kanban skills work in any project with no build step.
- One sync code path for Claude Code: the mod's inline sync.

**Non-Goals:**
- Remove `libs/kanban-core` or its CLI. Developers in the kanban repo still use them.
- Fix the opencode or QGenie adapters. The `.qgenie-plugin/plugin.json` skill list mismatch is a separate follow-up.
- Change the sync merge rules.

## Decisions

### D1: `/kanban:sync` calls `kanban_board_setup`

The skill tells the agent to call the tool whose name ends in `__kanban_board_setup`. This is the same pattern as `/kanban:setup` step 4. The tool handles `convert-needed` and `error:` the same way.

Alternatives:

| Option | Why not |
| --- | --- |
| Build kanban-core into `${CLAUDE_PLUGIN_DATA}` | Needs `npm` and `tsc` on first use. Adds a second sync code path. |
| Ship prebuilt `dist/` in the plugin | Build output in git. The CLI can drift from the inline sync. |
| Use `${CLAUDE_PLUGIN_ROOT}/libs/kanban-core/dist` | `dist/` is not in the plugin cache, so it still needs a build. |

### D2: Manual fallback when the tool is not available

If the mod is not loaded (for example, in a harness without mods), the agent runs `openspec list --json` and `openspec status`. It then applies the lane table from `/kanban:setup`. To avoid two copies of the rules, `/kanban:sync` points to the setup skill's steps 5–6 instead of copying them.

### D3: Setup does not install npm packages into the consumer project

The old step 1 ran `npm install` on the consumer's `package.json`. That can change an unrelated project. The new step checks `openspec --version`. If that fails, the agent asks the user before it runs `npm install -g @fission-ai/openspec`.

### D4: Specs follow the code

The `archive-sync` and `new-sync` spec requirements still name the CLI. The deltas describe the inline sync. The requirement names stay the same so that the archive step can match them.

## Risks / Trade-offs

- [Users on plugin 0.1.0 keep the old mod with the CLI calls] → Bump the plugin version. The README tells users to run `/plugin update kanban`.
- [The `/kanban:sync` fallback depends on the agent following prose] → It uses the same rules as `/kanban:setup`, which already works this way.
- [The kanban-core CLI and the inline sync can drift] → Out of scope. The inline code has a comment that names its source (`libs/kanban-core/src/sync.ts`).

## Migration Plan

1. Merge the skill and README changes. Bump the version in `plugin.json`, `.claude-plugin/plugin.json`, and `.qgenie-plugin/plugin.json`.
2. In `genai-plugins-ad-data`, run `/plugin update kanban`, then `/kanban:setup` and `/kanban:sync`. Expect no `libs/kanban-core` warning.
3. Rollback: revert the commit. No data migration is needed, because `kanban.yaml` does not change format.
