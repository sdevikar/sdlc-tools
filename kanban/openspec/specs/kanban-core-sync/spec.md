# kanban-core-sync Specification

## Purpose
TBD - created by archiving change kanban-02-core-sync. Update Purpose after archive.
## Requirements
### Requirement: syncFromOpenSpec
The system SHALL provide `syncFromOpenSpec(openspecPath, kanbanPath)` that reads OpenSpec state and updates kanban.md.

#### Scenario: Adds missing entries
- **WHEN** an OpenSpec change has no kanban entry
- **THEN** sync adds it with mapped lane and default priority 99

### Requirement: mergeSync pure function
The system SHALL provide `mergeSync(existing, active, archived)` returning updated entries without side effects.

#### Scenario: Preserves manual fields
- **WHEN** an existing entry has priority and notes
- **THEN** sync preserves them while updating status and updatedAt

#### Scenario: Moves archived
- **WHEN** a change appears in archived list
- **THEN** its entry lane becomes Archived and archivedAt set

