# Spec Delta

## MODIFIED Requirements

### Requirement: Init observer runs after `/init`
The mod SHALL hook the built-in `init` command. After the command completes, the mod SHALL check whether `kanban.yaml` exists at the project root and open an inline confirmation dialog.

#### Scenario: kanban.yaml does not exist
- **WHEN** `/init` completes and `kanban.yaml` does not exist at the project root
- **THEN** the mod opens an inline dialog: "No kanban board found. Create one for this project? [Yes] [No]"

#### Scenario: kanban.yaml exists
- **WHEN** `/init` completes and `kanban.yaml` already exists at the project root
- **THEN** the mod opens an inline dialog: "Kanban board found. Sync it with current openspec state? [Yes] [No]"

#### Scenario: Only docs/kanban.yaml exists
- **WHEN** `/init` completes, `docs/kanban.yaml` exists, and `kanban.yaml` does not exist at the project root
- **THEN** the mod opens the init-mode dialog and ignores `docs/kanban.yaml`

### Requirement: User confirms kanban creation or sync
The mod SHALL perform the kanban operation only after the user clicks Yes.

#### Scenario: User clicks Yes in init mode
- **WHEN** the dialog shows in init mode and the user clicks Yes
- **THEN** the mod scans `openspec/changes/` and `openspec/changes/archive/`, builds entries, writes `kanban.yaml` at the project root, prints "Kanban init: N entries created", and closes the dialog

#### Scenario: User clicks Yes in sync mode
- **WHEN** the dialog shows in sync mode and the user clicks Yes
- **THEN** the mod scans openspec changes, merges with existing entries (preserving `priority`, `notes`, `tags`, `assignee`, `githubIssue`, and user-moved lanes), writes `kanban.yaml` at the project root, prints "Kanban sync: N updated, M unchanged", and closes the dialog

#### Scenario: User clicks No or presses Esc
- **WHEN** the user clicks No or presses Esc on the dialog
- **THEN** the mod closes the dialog silently with no file I/O
