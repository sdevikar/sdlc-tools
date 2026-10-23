# Spec Delta

## MODIFIED Requirements

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
