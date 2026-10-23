# Spec Delta

## ADDED Requirements

### Requirement: Setup asks before it creates or syncs kanban.yaml
The `/kanban:setup` skill SHALL ask the user to confirm before it writes `kanban.yaml`. When the kanban-board mod is loaded, the confirmation SHALL be an inline dialog pane with Yes and No buttons. The skill SHALL ask after the openspec install and init steps finish.

#### Scenario: kanban.yaml does not exist
- **WHEN** `/kanban:setup` reaches the kanban step and `kanban.yaml` does not exist at the project root
- **THEN** the mod opens an inline dialog: "No kanban board found. Create one for this project? [Yes] [No]"

#### Scenario: kanban.yaml exists
- **WHEN** `/kanban:setup` reaches the kanban step and `kanban.yaml` exists at the project root
- **THEN** the mod opens an inline dialog: "Kanban board found. Sync it with current openspec state? [Yes] [No]"

### Requirement: Setup writes kanban.yaml only on Yes
The setup flow SHALL write `kanban.yaml` only after the user selects Yes. The setup summary SHALL report the outcome.

#### Scenario: User selects Yes in init mode
- **WHEN** the dialog shows in init mode and the user selects Yes
- **THEN** the mod scans `openspec/changes/` and `openspec/changes/archive/`, writes `kanban.yaml` at the project root, closes the dialog, and setup prints "Kanban init: N entries created"

#### Scenario: User selects Yes in sync mode
- **WHEN** the dialog shows in sync mode and the user selects Yes
- **THEN** the mod merges the scan with existing entries (it keeps `priority`, `notes`, `tags`, `assignee`, `githubIssue`, and user-moved lanes), writes `kanban.yaml`, closes the dialog, and setup prints "Kanban sync: N updated, M unchanged"

#### Scenario: User selects No or presses Esc
- **WHEN** the user selects No or presses Esc on the dialog
- **THEN** the dialog closes, no file is written, and the setup summary says the kanban step was skipped

### Requirement: Setup handles openspec failure in the dialog
The setup flow SHALL stop the kanban step without a write when `openspec list --json` fails.

#### Scenario: openspec command fails
- **WHEN** the user selects Yes and `openspec list --json` fails
- **THEN** the dialog closes, a toast shows the error reason, no file is written, and the setup summary reports the failure

### Requirement: Setup works without the mod
When the kanban-board mod is not loaded, the `/kanban:setup` skill SHALL ask the same question in chat. On yes, it SHALL invoke the `kanban-init` skill.

#### Scenario: Harness with no mod
- **WHEN** `/kanban:setup` runs in a harness where the mod's setup tool is not available
- **THEN** the skill asks the user in chat, and on yes it runs the `kanban-init` create or sync path

### Requirement: /init does not open a kanban dialog
The kanban-board mod SHALL NOT change or add to the behavior of the built-in `/init` command.

#### Scenario: User runs /init
- **WHEN** the user runs `/init` with the kanban-board mod loaded
- **THEN** `/init` runs as normal and no kanban dialog opens
