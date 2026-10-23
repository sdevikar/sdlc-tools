# Spec Delta

## MODIFIED Requirements

### Requirement: kanban-view skill
The system SHALL provide a `/kanban-view` skill that renders `kanban.yaml` as vertical swim lanes in chat. When the root `kanban.yaml` has a non-empty `boards:` list, the skill SHALL render each board as a separate named section. The skill SHALL accept an optional `board=<name>` argument to filter output to one board.

#### Scenario: Render board
- **WHEN** user runs /kanban-view
- **THEN** a Markdown table with one column per lane is printed, cards sorted by priority

#### Scenario: Render grouped multi-board
- **WHEN** user runs /kanban-view and root kanban.yaml has boards registered
- **THEN** output has one named section per board, each with its own lane columns

#### Scenario: Filter to one board
- **WHEN** user runs /kanban-view board=auth
- **THEN** only the board named auth is rendered

## MODIFIED Requirements

### Requirement: kanban-view programmatic output
The skill SHALL invoke a prebuilt CLI binary to generate the board table. No LLM reasoning over the YAML is performed; the output is code-generated. The CLI SHALL accept an optional `--board <name>` flag to filter output.

#### Scenario: Output is binary-generated
- **WHEN** user runs /kanban-view
- **THEN** the skill runs the `kanban-view` CLI binary and prints its stdout verbatim without modification

#### Scenario: Board filter passed to CLI
- **WHEN** user runs /kanban-view board=auth
- **THEN** the skill invokes the CLI with `--board auth`
