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