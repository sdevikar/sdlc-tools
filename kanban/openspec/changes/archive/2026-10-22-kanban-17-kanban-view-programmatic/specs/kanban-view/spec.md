# Spec Delta

## ADDED Requirements

### Requirement: kanban-view programmatic output
The skill SHALL invoke a prebuilt CLI binary to generate the board table. No LLM reasoning over the YAML is performed; the output is code-generated.

#### Scenario: Output is binary-generated
- **WHEN** user runs /kanban-view
- **THEN** the skill runs the `kanban-view` CLI binary and prints its stdout verbatim without modification
