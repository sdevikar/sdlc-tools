# kanban-core-sync Specification

## Purpose
TBD - created by archiving change kanban-02-core-sync. Update Purpose after archive.
## Requirements
### Requirement: syncFromOpenSpec
The system SHALL provide `syncFromOpenSpec(openspecPath, kanbanPath)` that reads OpenSpec state and updates kanban.md. TypeScript SHALL be listed in `devDependencies` so `npm install && npm run build` works without extra steps.

#### Scenario: Adds missing entries
- **WHEN** an OpenSpec change has no kanban entry
- **THEN** sync adds it with mapped lane and default priority 99

### Requirement: kanban-core provides a runnable CLI entry point
The package SHALL expose a `kanban-sync` bin that calls `syncFromOpenSpec` for the current project and exits non-zero on failure.

#### Scenario: Successful sync via CLI
- **WHEN** `node dist/src/cli.js` runs from the project root with a valid `openspec/` directory
- **THEN** `docs/kanban.yaml` is updated and the process exits 0

#### Scenario: CLI exits non-zero on sync error
- **WHEN** the `openspec` CLI is not found or sync throws
- **THEN** the process prints the error to stderr and exits with code 1

### Requirement: mergeSync pure function
The system SHALL provide `mergeSync(existing, active, archived)` returning updated entries without side effects.

#### Scenario: Preserves manual fields
- **WHEN** an existing entry has priority and notes
- **THEN** sync preserves them while updating status and updatedAt

#### Scenario: Moves archived
- **WHEN** a change appears in archived list
- **THEN** its entry lane becomes Archived and archivedAt set

