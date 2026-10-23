# claude-mod-new-change-sync Specification

## Purpose

Keeps the kanban board current by detecting new OpenSpec changes that have a written proposal and adding their board entries automatically, with no user action required.

## Requirements

### Requirement: Mod polls changes folder mtime
The mod SHALL check `openspec/changes/` mtime on the same 5-second timer used by kanban-24.

#### Scenario: Timer fires, changes folder mtime unchanged and no skipped folders pending
- **WHEN** 5 seconds elapse, the changes folder mtime is unchanged, and no folders are in the skipped set
- **THEN** the mod takes no action for new-change-sync

#### Scenario: Timer fires, changes folder mtime changed
- **WHEN** the changes folder mtime differs from the stored baseline
- **THEN** the mod updates the baseline and triggers the missing-change scan

#### Scenario: Timer fires, skipped folders exist
- **WHEN** the skipped set is non-empty (folders awaiting a proposal.md)
- **THEN** the mod checks each skipped folder for a proposal.md even if the changes folder mtime is unchanged

### Requirement: Mod identifies missing board entries
The mod SHALL compare change folders in `openspec/changes/` with `kanban.yaml` at the project root to find changes that have a `proposal.md` but no board entry.

#### Scenario: Change folder with proposal.md and no board entry
- **WHEN** a folder in `openspec/changes/` has a `proposal.md` and has no kanban entry
- **THEN** it is missing and the mod will run new-sync

#### Scenario: Change folder with no proposal.md
- **WHEN** a folder in `openspec/changes/` has no `proposal.md`
- **THEN** it is added to the skipped set and no entry is added on this tick

#### Scenario: Change folder already has board entry
- **WHEN** a folder in `openspec/changes/` already has a kanban entry regardless of lane
- **THEN** it is not missing; new-sync does not add or change it

### Requirement: Mod retries skipped folders each tick
When a folder is in the skipped set, the mod SHALL re-check it on every subsequent tick.

#### Scenario: proposal.md appears after initial skip
- **WHEN** a folder was in the skipped set and `proposal.md` is written before the next tick
- **THEN** the mod adds the board entry on the next tick and removes the folder from the skipped set

### Requirement: Mod runs new-sync CLI on missing changes
When missing changes are found, the mod SHALL run `node libs/kanban-core/dist/src/cli.js new-sync` from the project root.

#### Scenario: Missing changes found
- **WHEN** one or more missing changes are identified
- **THEN** the mod runs new-sync and re-renders the pane if it is open

#### Scenario: new-sync exits non-zero
- **WHEN** new-sync exits with a non-zero exit code
- **THEN** the mod shows one toast with the error message
