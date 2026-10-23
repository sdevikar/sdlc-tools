# Spec Delta

## MODIFIED Requirements

### Requirement: Mod identifies archive gaps
The mod SHALL compare archive folder contents with entries in `kanban.yaml` at the project root to find gaps.

#### Scenario: Entry already in Archived lane
- **WHEN** an archived change has a kanban entry whose lane is `Archived` or `archived` (case-insensitive)
- **THEN** it is not a gap

#### Scenario: Entry in wrong lane
- **WHEN** an archived change has a kanban entry whose lane is not `Archived` (case-insensitive)
- **THEN** it is a gap

#### Scenario: No entry exists
- **WHEN** an archived change has no kanban entry at all
- **THEN** it is a gap

#### Scenario: No gaps found
- **WHEN** all archived changes already have entries in the Archived lane
- **THEN** the mod does not run archive-sync
