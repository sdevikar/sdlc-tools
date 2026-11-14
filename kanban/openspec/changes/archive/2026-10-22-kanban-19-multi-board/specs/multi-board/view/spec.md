# Spec Delta

## Purpose

Extends `/kanban-view` to render multiple registered boards grouped by board name, and to filter output to a single board when a `board` argument is passed.

## ADDED Requirements

### Requirement: grouped multi-board output
When the root `kanban.yaml` has a non-empty `boards:` list, `/kanban-view` SHALL render each board as a separate named section. Each section SHALL show the board name as a header followed by its swim lanes and entries.

#### Scenario: Multiple boards rendered grouped
- **WHEN** the root `kanban.yaml` has two registered sub-boards and the user runs `/kanban-view`
- **THEN** output contains two sections, each labeled with the board name, each with its own lane columns

#### Scenario: Root entries rendered as own section
- **WHEN** the root `kanban.yaml` has both `entries:` and `boards:` populated
- **THEN** root entries appear as a section labeled with the root board name (defaults to the project name or `root`)

### Requirement: board filter argument
`/kanban-view` SHALL accept an optional `board=<name>` argument. When passed, only the board matching `<name>` SHALL be rendered. All other boards SHALL be omitted from the output.

#### Scenario: Filter to one board
- **WHEN** user runs `/kanban-view board=auth`
- **THEN** only the board named `auth` is rendered; other boards are not shown

#### Scenario: Unknown board name
- **WHEN** user passes a `board=` value that matches no registered board
- **THEN** the system prints an error listing available board names and exits without rendering

### Requirement: single-board output unchanged
When the root `kanban.yaml` has no `boards:` field or an empty `boards:` list, `/kanban-view` SHALL render the same output as before this change — no grouping headers added.

#### Scenario: Single board falls back to flat render
- **WHEN** `kanban.yaml` has no `boards:` field
- **THEN** output is identical to the pre-multi-board format
