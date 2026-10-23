# Spec Delta

## ADDED Requirements

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
- **WHEN** writing to `docs/kanban.yaml` fails
- **THEN** the process writes the error to stderr and exits with code 1
