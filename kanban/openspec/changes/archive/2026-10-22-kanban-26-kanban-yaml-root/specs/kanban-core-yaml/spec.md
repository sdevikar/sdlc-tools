# Spec Delta

## ADDED Requirements

### Requirement: Board file location
Every kanban component SHALL read and write the board at `kanban.yaml` in the project root. No component SHALL read, write, or move `docs/kanban.yaml`.

#### Scenario: Board at project root
- **WHEN** a kanban component needs the board for a project at `<root>`
- **THEN** it uses `<root>/kanban.yaml`

#### Scenario: Only legacy file exists
- **WHEN** `<root>/docs/kanban.yaml` exists and `<root>/kanban.yaml` does not exist
- **THEN** the component behaves as if no board exists and does not read, move, or delete `docs/kanban.yaml`
