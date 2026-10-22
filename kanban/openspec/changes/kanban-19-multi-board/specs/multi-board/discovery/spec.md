# Spec Delta

## Purpose

Enables `/init` to find `kanban.yaml` files in subdirectories, confirm each one with the user, and write approved paths to the root `boards:` list — so sub-boards are registered without manual edits.

## ADDED Requirements

### Requirement: /init scans subdirectories for kanban.yaml files
When `/init` runs and a root `kanban.yaml` exists, the system SHALL scan immediate and nested subdirectories for files named `kanban.yaml`. Files already registered in the root `boards:` list SHALL be excluded from the scan results.

#### Scenario: New sub-board found
- **WHEN** `/init` runs and a subdirectory contains `kanban.yaml` not yet in `boards:`
- **THEN** the system presents that file to the user as a discovered sub-board candidate

#### Scenario: Already registered file is skipped
- **WHEN** a subdirectory's `kanban.yaml` path already appears in the root `boards:` list
- **THEN** `/init` does not re-propose it

#### Scenario: No sub-boards found
- **WHEN** no unregistered `kanban.yaml` files exist in subdirectories
- **THEN** `/init` completes without prompting for sub-board registration

### Requirement: /init confirms each discovered sub-board with the user
For each discovered sub-board, the system SHALL present an inline Yes/No prompt naming the file path. If the user confirms, the path is added to `boards:`. If the user declines, the path is skipped and not written.

#### Scenario: User confirms a sub-board
- **WHEN** the user selects Yes for a discovered sub-board
- **THEN** `boards:` in the root `kanban.yaml` gains an entry with a derived name and the confirmed path

#### Scenario: User declines a sub-board
- **WHEN** the user selects No for a discovered sub-board
- **THEN** no entry is added to `boards:` and the sub-board file is not modified

### Requirement: board name derived from directory
When adding a confirmed sub-board to `boards:`, the system SHALL derive the `name` from the immediate parent directory of the discovered file (e.g. `plugins/auth/kanban.yaml` → name `auth`). The user SHALL be able to override the derived name in the confirmation prompt.

#### Scenario: Name derived automatically
- **WHEN** user confirms a sub-board at `plugins/auth/kanban.yaml`
- **THEN** the registered name defaults to `auth`

#### Scenario: User overrides derived name
- **WHEN** user enters a custom name in the confirmation prompt
- **THEN** that custom name is used in the `boards:` entry
