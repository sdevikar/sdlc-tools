## ADDED Requirements

### Requirement: YAML storage
The system SHALL read and write kanban data as YAML with an `entries` array.

#### Scenario: Round trip
- **WHEN** readKanban then writeKanban then readKanban
- **THEN** arrays are deeply equal