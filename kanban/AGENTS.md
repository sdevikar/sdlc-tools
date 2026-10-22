# AGENTS.md

## Project

OpenSpec spec-driven development project for an OpenCode/Claude kanban bridge plugin. No application code yet.

## Structure

- `openspec/` — OpenSpec root. `config.yaml` sets schema to `spec-driven`.
- `openspec/changes/` — Active change proposals (8 numbered: `kanban-01-*` through `kanban-08-*`). Each has `proposal.md` and `.openspec.yaml`.
- `.opencode/skills/` — OpenSpec skill definitions (propose, apply, archive, sync, explore).
- `.opencode/commands/` — Slash command definitions (opsx-propose, opsx-apply, opsx-archive, opsx-sync, opsx-explore).
- `docs/plans/` — Research report: `opencode-openspec-kanban-plugin-research.md`.

## OpenSpec CLI

- `openspec list --json` — list changes
- `openspec status --change "<name>" --json` — artifact status
- `openspec new change "<name>"` — create change (name must start with a letter)
- `openspec instructions <artifact> --change "<name>" --json` — get artifact template
- `openspec archive <name>` — archive completed change
- No git repo initialized. Working directory is the project root.

## Conventions

- Change names use `kanban-NN-<slug>` prefix (NN = sequence number).
- Proposals are written manually; artifacts (design, specs, tasks) are generated via openspec skills.
- Research report in `docs/plans/` is the source of truth for architecture decisions.

## Way of Working

This project builds the kanban bridge plugin and uses the same kanban/OpenSpec workflow to develop itself.

- **Source of truth for work items**: `docs/kanban.yaml` (human-editable). Lanes: Not Started, In Progress, Ready, Done, Archived.
- **Specs**: OpenSpec changes under `openspec/changes/kanban-NN-<slug>/`. Use `/opsx-propose`, `/opsx-apply`, `/opsx-archive` (or `openspec` CLI) for lifecycle.
- **Sync rule**: after proposing/archiving a change, update `docs/kanban.yaml` (add/move entry; auto-sync only touches status). Manual edits to priority, notes, and lane moves are preserved.
- **Priority**: lower number = higher priority. Default 5. Answer "what's next" by filtering active lanes (Not Started, In Progress, Ready), sorting by priority ascending, and picking the first item that has a proposal.
- **Build order**: implement changes in sequence 01 → 08; each depends on prior ones. Start with `kanban-01-core-format`.
- **Kanban format**: see `docs/plans/opencode-openspec-kanban-plugin-research.md` Appendix B. Source file is `docs/kanban.yaml` (structured YAML).
- **No application code yet**: keep changes additive and follow existing OpenSpec conventions.
- **Implementation rule**: no spec is implemented without an approved proposal; follow its tasks.md.
- **Testing rule**: every implementation must pass its tests before commit.
- **Commit/push rule**: after tests pass, commit and push to `https://github.com/sdevikar/kanban.git`.
- **Archive rule**: after push, archive the change (`openspec archive`) and update `docs/kanban.yaml`.
- **Constitution rule**: documentation states facts only; history and recordkeeping are handled by git commits.
