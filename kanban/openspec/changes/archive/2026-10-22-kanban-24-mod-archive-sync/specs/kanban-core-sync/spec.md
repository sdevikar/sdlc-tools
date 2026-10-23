# Spec Delta

## ADDED Requirements

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
- **WHEN** writing to `docs/kanban.yaml` fails
- **THEN** the process writes the error to stderr and exits with code 1
