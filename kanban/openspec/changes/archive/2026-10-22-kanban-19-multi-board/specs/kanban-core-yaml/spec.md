# Spec Delta

## ADDED Requirements

### Requirement: boards field in YAML schema
The system SHALL support an optional `boards:` array in the YAML schema. Each element SHALL be an object with a required `name` (string) and a required `path` (string, relative to the file's own directory).

#### Scenario: YAML with boards parses correctly
- **WHEN** a `kanban.yaml` file contains a valid `boards:` array
- **THEN** `readKanban` returns the parsed boards alongside the entries array

#### Scenario: YAML without boards is still valid
- **WHEN** a `kanban.yaml` file has no `boards:` field
- **THEN** `readKanban` returns an empty boards array and the existing entries unchanged

#### Scenario: Round trip preserves boards
- **WHEN** `readKanban` then `writeKanban` then `readKanban`
- **THEN** the `boards:` array is deeply equal before and after
