# Design

## Context

See proposal.md — Why.

The project has `.claude-plugin/plugin.json` for Claude Code marketplace distribution. QGenie uses a parallel `.qgenie-plugin/plugin.json` manifest at the same repo root. The local QGenie authoring contract (`authoring.yaml`) documents the required fields: `id` (org/handle), `version`, `displayName`, `description`, `preferredHarness`, `capabilities.skills[]`, and `adapters.claude`. All 10 skills are already in `skills/<handle>/SKILL.md` format with correct frontmatter — no skill rewrites are needed.

## Goals / Non-Goals

**Goals:**
- Add `.qgenie-plugin/plugin.json` declaring all 10 skills and the `mod/kanban-board/` Claude Code adapter.
- Update `INSTALL.md` with a QGenie install section.

**Non-Goals:**
- Modifying any skill, mod, library, or hook source files.
- Supporting harnesses other than Claude Code (`--target claude` only for this change).
- Replacing the existing Claude Code marketplace install path.
- Publishing to the registry (that is a human-gated step outside this change).

## Decisions

**One manifest, both distribution paths.** The QGenie manifest (`.qgenie-plugin/`) and the Claude Code manifest (`.claude-plugin/`) coexist at the repo root. Neither replaces the other — a user can install from either source.

**All 10 skills in a single plugin.** The kanban and openspec skills are bundled together in one plugin id. Splitting them into two plugins would complicate installation for no user benefit; users who use OpenSpec also use the kanban board.

**`preferredHarness: claude`.** The user scope for this change is Claude Code only. Other harness adapters (OpenCode, Cursor, Windsurf, etc.) are out of scope — they remain as standalone adapter directories and are not declared in this manifest.

**`mod/kanban-board/` as the Claude Code adapter.** The mod is the existing Claude Code harness adapter; it mounts unchanged. Its path is declared under `adapters.claude.path` in the QGenie manifest.

**Org/handle is a deploy-time decision.** The manifest template uses `<org>/kanban` as a placeholder. The actual org must be confirmed with the QGenie registry before first publish (the id is immutable after that). The manifest can be written and validated locally before the org is finalized by using a placeholder that the publisher replaces.

## Risks / Trade-offs

- **Immutable id:** Choosing the wrong org/handle requires creating a new plugin entry. → Confirm the org before publishing (Step 5, human-gated).
- **Plugin validator parity:** `claude plugin validate .` checks the Claude Code manifest; QGenie may have a separate validator at upload time. → Treat the registry upload step as the authoritative validation gate.
- **`libs/kanban-core/dist/` inclusion:** The compiled library output must be present in the package on upload. → Confirm `dist/` is not excluded by any upload filter; add a build step to the publish checklist if needed.
- **Prerequisites not installed by the manifest:** `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` and `@fission-ai/openspec` cannot be declared as manifest-level dependencies. → Document both prominently in `INSTALL.md` and the registry description.
