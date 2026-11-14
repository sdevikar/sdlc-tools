## MODIFIED Requirements

### Requirement: Setup skill handles post-install steps

The `/kanban:setup` skill SHALL check that openspec is available, initialize openspec
if needed, and create or sync `kanban.yaml` — in one invocation, with no manual shell commands
from the user. The skill SHALL NOT build `libs/kanban-core` and SHALL NOT run `npm install`
on the consumer project.

#### Scenario: Fresh clone with nothing built

- **WHEN** a user invokes `/kanban:setup` in a project with openspec on `PATH`, no
  `openspec/config.yaml`, and no `kanban.yaml`
- **THEN** the skill runs `openspec init`, creates `kanban.yaml`, and prints a success summary

#### Scenario: Project has no libs/kanban-core

- **WHEN** a user invokes `/kanban:setup` in a project that has no `libs/kanban-core/` directory
- **THEN** the skill completes without a warning or error about `libs/kanban-core`

#### Scenario: openspec is not installed

- **WHEN** a user invokes `/kanban:setup` and `openspec` is not on `PATH`
- **THEN** the skill asks the user before it installs openspec, and it does not change the
  project's `package.json`

#### Scenario: Re-run is idempotent

- **WHEN** `/kanban:setup` is run again after a successful setup
- **THEN** it skips already-complete steps and prints the same summary without error

## ADDED Requirements

### Requirement: Plugin files resolve independent of session directory

Plugin skills and the mod SHALL NOT find plugin files through the session working directory.
The session working directory SHALL be used only for project data: `kanban.yaml` and `openspec/`.

#### Scenario: Plugin used in a project other than the kanban repo

- **WHEN** the plugin is installed in project `P`, and `P` is not the kanban source repo
- **THEN** every kanban skill and mod action reads and writes only `P/kanban.yaml` and
  `P/openspec/`, and no action needs a file under `P/libs/`
