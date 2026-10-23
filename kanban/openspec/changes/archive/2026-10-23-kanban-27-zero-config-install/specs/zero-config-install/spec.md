# Spec Delta

## Purpose

Enables zero-configuration installation: after one `/plugin install` command and one
`/kanban:setup` invocation, Claude Code loads the pane mod, registers all skills, and has a
working `kanban.yaml`. No manual settings edits or symlinks are needed.

## ADDED Requirements

### Requirement: Plugin install loads the mod and all skills

Running `/plugin install kanban --marketplace qcom-all-gh-users/kanban` SHALL load the
`register.tsx` mod and make all skills available under the `kanban:` namespace, with no manual
`CLAUDE_CODE_PLUGIN_DIRS` edits or symlink creation.

#### Scenario: Fresh install, no prior `.claude/settings.json`

- **WHEN** a contributor runs `/plugin install kanban --marketplace qcom-all-gh-users/kanban`
  at project scope in a freshly cloned repo
- **THEN** Claude Code loads the mod, registers skills under `/kanban:*`, and writes an
  `enabledPlugins` entry to `.claude/settings.json`

#### Scenario: Re-install is idempotent

- **WHEN** the install command is run again on a machine that already has the plugin
- **THEN** Claude Code updates or reuses the existing installation without error

### Requirement: `hooks/hooks.json` uses modules format

The repo-root `hooks/hooks.json` SHALL use `{ "modules": [...] }` format so the TypeScript mod
loads when the plugin is installed.

#### Scenario: Plugin validates without hooks errors

- **WHEN** `claude plugin validate .` runs against the repo root
- **THEN** the command reports no errors for the hooks component

### Requirement: `marketplace.json` is a valid marketplace listing

`.claude-plugin/marketplace.json` SHALL contain the `plugins` array with a `source` entry so
the install command can resolve the plugin.

#### Scenario: Marketplace resolves the plugin

- **WHEN** Claude Code reads `.claude-plugin/marketplace.json`
- **THEN** it finds exactly one entry with `"name": "kanban"` and `"source": "./"` under
  `plugins`

### Requirement: Setup skill handles post-install steps

The `/kanban:setup` skill SHALL install openspec, build `libs/kanban-core`, initialize openspec
if needed, and create or sync `kanban.yaml` — in one invocation, with no manual shell commands
from the user.

#### Scenario: Fresh clone with nothing built

- **WHEN** a contributor invokes `/kanban:setup` in a repo with no `node_modules`, no built
  `dist`, and no `kanban.yaml`
- **THEN** the skill installs openspec, builds kanban-core, runs `npx openspec init` if needed,
  creates `kanban.yaml`, and prints a success summary

#### Scenario: Re-run is idempotent

- **WHEN** `/kanban:setup` is run again after a successful setup
- **THEN** it skips already-complete steps and prints the same summary without error

### Requirement: Setup is non-destructive

The setup skill SHALL NOT overwrite an existing `kanban.yaml` with default content; it SHALL
invoke the sync path instead.

#### Scenario: `kanban.yaml` already exists

- **WHEN** `/kanban:setup` runs and `kanban.yaml` already exists at the project root
- **THEN** the skill invokes the sync path (not the init path) and preserves existing entries

## ADDED Requirements

### Requirement: README setup section uses plugin install

The README setup section SHALL replace the manual "Auto-load the mod" and "Link project skills"
steps with `/plugin install kanban --marketplace qcom-all-gh-users/kanban` and
`/kanban:setup`.

#### Scenario: README setup section contains the two-command install

- **WHEN** a contributor reads the setup section of README.md
- **THEN** they see `/plugin install kanban --marketplace qcom-all-gh-users/kanban` and
  `/kanban:setup` as the install steps, with no manual `CLAUDE_CODE_PLUGIN_DIRS` edits or
  symlink commands
