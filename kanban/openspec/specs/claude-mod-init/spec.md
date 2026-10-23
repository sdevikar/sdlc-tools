# Spec: claude-mod-init

## Purpose

Adds a `/init` observer to the kanban-board mod that offers to create or sync `kanban.yaml` after init completes.

## Requirements

### Requirement: Init observer runs after `/init`
The mod SHALL hook the built-in `init` command. After the command completes, the mod SHALL check whether `kanban.yaml` exists and open an inline confirmation dialog.

#### Scenario: kanban.yaml does not exist
- **WHEN** `/init` completes and `kanban.yaml` does not exist
- **THEN** the mod opens an inline dialog: "No kanban board found. Create one for this project? [Yes] [No]"

#### Scenario: kanban.yaml exists
- **WHEN** `/init` completes and `kanban.yaml` already exists
- **THEN** the mod opens an inline dialog: "Kanban board found. Sync it with current openspec state? [Yes] [No]"

### Requirement: User confirms kanban creation or sync
The mod SHALL perform the kanban operation only after the user clicks Yes.

#### Scenario: User clicks Yes in init mode
- **WHEN** the dialog shows in init mode and the user clicks Yes
- **THEN** the mod scans `openspec/changes/` and `openspec/changes/archive/`, builds entries, writes `kanban.yaml`, prints "Kanban init: N entries created", and closes the dialog

#### Scenario: User clicks Yes in sync mode
- **WHEN** the dialog shows in sync mode and the user clicks Yes
- **THEN** the mod scans openspec changes, merges with existing entries (preserving `priority`, `notes`, `tags`, `assignee`, `githubIssue`, and user-moved lanes), writes `kanban.yaml`, prints "Kanban sync: N updated, M unchanged", and closes the dialog

#### Scenario: User clicks No or presses Esc
- **WHEN** the user clicks No or presses Esc on the dialog
- **THEN** the mod closes the dialog silently with no file I/O

### Requirement: Openspec unavailable is handled gracefully
The mod SHALL handle the case where `openspec` is not on PATH or the project has no `openspec/` directory.

#### Scenario: openspec command fails
- **WHEN** the user clicks Yes and the `openspec list --json` call fails
- **THEN** the mod closes the dialog and shows a toast with the error reason; no file is written
