# Spec Delta

## MODIFIED Requirements

### Requirement: mergeSync pure function
The system SHALL provide `mergeSync(existing, active, archived)` returning updated entries without side effects. When creating a new entry from an active change, `mergeSync` SHALL extract `project:` from the change name using the pattern `^(.+?)(?=-\d+-)` (all characters before the first `-digits-` segment). When updating an existing entry that already has a non-empty `project:` value, `mergeSync` SHALL preserve it unchanged.

#### Scenario: Preserves manual fields
- **WHEN** an existing entry has priority and notes
- **THEN** sync preserves them while updating status and updatedAt

#### Scenario: Moves archived
- **WHEN** a change appears in archived list
- **THEN** its entry lane becomes Archived and archivedAt set

#### Scenario: Extracts project from change name on new entry
- **WHEN** mergeSync creates an entry for a change named `kanban-05-my-feature`
- **THEN** the new entry has `project === "kanban"`

#### Scenario: Extracts multi-word project from change name
- **WHEN** mergeSync creates an entry for a change named `marketplace-plugin-02-icon`
- **THEN** the new entry has `project === "marketplace-plugin"`

#### Scenario: Preserves user-set project on existing entry
- **WHEN** an existing entry has `project: "custom"` and mergeSync updates its status
- **THEN** the updated entry still has `project === "custom"`

### Requirement: new-sync subcommand
The CLI SHALL support a `new-sync` subcommand that adds board entries for active change folders that have a `proposal.md` but no existing kanban entry. New entries SHALL include a `project:` field extracted from the change name using the pattern `^(.+?)(?=-\d+-)`.

#### Scenario: new-sync adds entry for new change
- **WHEN** `node dist/src/cli.js new-sync` runs and a folder in `openspec/changes/` has a `proposal.md` but no kanban entry
- **THEN** a new entry is added with lane `Not Started`, status `proposal written`, priority equal to the `NN` in `kanban-NN-<slug>` (or 99 if no number), summary equal to the first sentence under `## Why` in `proposal.md` truncated to 80 characters, `project` extracted from the change name, and `createdAt`/`updatedAt` set to the local date

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
