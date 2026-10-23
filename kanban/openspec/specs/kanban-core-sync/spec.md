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
- **THEN** `kanban.yaml` in the project root is updated and the process exits 0

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

### Requirement: new-sync subcommand
The CLI SHALL support a `new-sync` subcommand that adds board entries for active change folders that have a `proposal.md` but no existing kanban entry.

#### Scenario: new-sync adds entry for new change
- **WHEN** `node dist/src/cli.js new-sync` runs and a folder in `openspec/changes/` has a `proposal.md` but no kanban entry
- **THEN** a new entry is added with lane `Not Started`, status `proposal written`, priority equal to the `NN` in `kanban-NN-<slug>` (or 99 if no number), summary equal to the first sentence under `## Why` in `proposal.md` truncated to 80 characters, and `createdAt`/`updatedAt` set to the local date

#### Scenario: new-sync does not touch existing entries
- **WHEN** a folder already has a kanban entry
- **THEN** new-sync leaves it unchanged

#### Scenario: new-sync skips folder with no proposal.md
- **WHEN** a change folder has no `proposal.md`
- **THEN** no entry is added for that folder

#### Scenario: new-sync ignores archive subfolder
- **WHEN** `openspec/changes/archive/` exists
- **THEN** new-sync does not add entries for folders inside it

#### Scenario: new-sync exits non-zero on write failure
- **WHEN** writing to `kanban.yaml` in the project root fails
- **THEN** the process writes the error to stderr and exits with code 1

### Requirement: archive-sync subcommand
The CLI SHALL support an `archive-sync` subcommand that moves only gap entries to the Archived lane without calling `openspec status` on any active change.

#### Scenario: archive-sync moves gap entry to Archived lane
- **WHEN** `node dist/src/cli.js archive-sync` runs and an archived change folder has a kanban entry whose lane is not Archived (case-insensitive)
- **THEN** that entry's lane is set to `Archived`, its `archivedAt`, `completedAt`, and `updatedAt` are set to the local date, its `status` is set to `archived`, and all other fields (notes, tags, assignee, githubIssue, priority, summary) are preserved

#### Scenario: archive-sync adds a new entry for a change with no board entry
- **WHEN** `node dist/src/cli.js archive-sync` runs and an archived change folder has no kanban entry
- **THEN** a new entry is added with lane `Archived`, status `archived`, and dates set to the local date

#### Scenario: archive-sync does not touch already-archived entries
- **WHEN** an entry already has lane `Archived` or `archived` (case-insensitive)
- **THEN** archive-sync leaves it unchanged

#### Scenario: archive-sync does not touch active entries
- **WHEN** an entry is not in the archive folder
- **THEN** archive-sync leaves it unchanged

#### Scenario: archive-sync exits non-zero on write failure
- **WHEN** writing to `kanban.yaml` in the project root fails
- **THEN** the process writes the error to stderr and exits with code 1

