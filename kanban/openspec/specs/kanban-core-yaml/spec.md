# kanban-core-yaml Specification

## Purpose
TBD - created by archiving change kanban-09-yaml-format. Update Purpose after archive.
## Requirements
### Requirement: YAML storage
The system SHALL read and write kanban data as YAML with an `entries` array.

#### Scenario: Round trip
- **WHEN** readKanban then writeKanban then readKanban
- **THEN** arrays are deeply equal

