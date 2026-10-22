# kanban-view Specification

## Purpose
TBD - created by archiving change kanban-10-kanban-view. Update Purpose after archive.
## Requirements
### Requirement: kanban-view skill
The system SHALL provide a `/kanban-view` skill that renders `kanban.yaml` as vertical swim lanes in chat.

#### Scenario: Render board
- **WHEN** user runs /kanban-view
- **THEN** a Markdown table with one column per lane is printed, cards sorted by priority

