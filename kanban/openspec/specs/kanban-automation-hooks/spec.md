# kanban-automation-hooks Specification

## Purpose
TBD - created by archiving change kanban-05-automation-hooks. Update Purpose after archive.
## Requirements
### Requirement: Manual sync command
The system SHALL provide `/kanban-sync` to run full sync. The skill SHALL work from a fresh checkout without manual build steps: it builds `libs/kanban-core` if needed, then invokes the CLI entry point.

#### Scenario: Run sync
- **WHEN** user runs /kanban-sync
- **THEN** kanban board is synced with OpenSpec

#### Scenario: Run sync after fresh clone
- **WHEN** user runs /kanban-sync on a machine where `libs/kanban-core/dist/` does not exist
- **THEN** the skill builds the library and syncs the board without user intervention

