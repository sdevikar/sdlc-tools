# Spec Delta

## ADDED Requirements

### Requirement: syncFromOpenSpec walks boards list
When the root `kanban.yaml` contains a `boards:` list, `syncFromOpenSpec` SHALL sync each registered sub-board independently. Each sub-board is synced against the OpenSpec root nearest to its own directory. The root board's own `entries:` SHALL also be synced independently.

#### Scenario: Sub-boards synced in isolation
- **WHEN** the root `kanban.yaml` has two sub-boards and `syncFromOpenSpec` runs
- **THEN** each sub-board's YAML file is updated independently; root entries are not modified

#### Scenario: Sub-board with no openspec root is skipped
- **WHEN** a registered sub-board's directory has no `openspec/` root nearby
- **THEN** that sub-board is skipped with a warning; other boards continue syncing
