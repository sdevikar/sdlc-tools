# kanban-view Specification

## Purpose
Render `kanban.yaml` as a Markdown table with one column per lane, sorted by priority.

## Requirements
### Requirement: kanban-view skill
The system SHALL provide a `/kanban-view` skill that renders `kanban.yaml` as vertical swim lanes in chat.

#### Scenario: Render board
- **WHEN** user runs /kanban-view
- **THEN** a Markdown table with one column per lane is printed, cards sorted by priority

### Requirement: kanban-view programmatic output
The skill SHALL invoke a prebuilt CLI binary to generate the board table. No LLM reasoning over the YAML is performed; the output is code-generated.

#### Scenario: Output is binary-generated
- **WHEN** user runs /kanban-view
- **THEN** the skill runs the `kanban-view` CLI binary and prints its stdout verbatim without modification
