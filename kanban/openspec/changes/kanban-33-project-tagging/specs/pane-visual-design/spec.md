# Spec Delta

## ADDED Requirements

### Requirement: project-group-headers
When at least one entry has a non-empty `project:` field, the pane SHALL render entries grouped by project. Each group SHALL have a header row showing the project name and a toggle indicator. Entries with no `project:` value SHALL be grouped under an "Other" group rendered at the bottom.

#### Scenario: Pane has entries with project field
- **WHEN** at least one kanban entry has a non-empty `project:` field
- **THEN** entries are grouped by project with a header row per group

#### Scenario: Entry with no project
- **WHEN** an entry has no `project:` field
- **THEN** it appears under an "Other" group at the bottom of the pane

#### Scenario: All entries have the same project
- **WHEN** all entries share one project value
- **THEN** one group header is shown with that project name

#### Scenario: No entries have project field
- **WHEN** no entries have a `project:` field
- **THEN** the pane renders without project group headers (flat list as before)

### Requirement: project-group-collapse
Each project group header SHALL have a collapse/expand toggle. Collapsing a group hides all its entries and shows only the header row. The toggle state is independent per group.

#### Scenario: User collapses a project group
- **WHEN** the user activates the collapse toggle on a project group header
- **THEN** all entries in that group are hidden and only the header row remains visible

#### Scenario: User expands a collapsed project group
- **WHEN** the user activates the toggle on a collapsed project group header
- **THEN** all entries in that group become visible again

#### Scenario: Collapsing one group does not affect others
- **WHEN** the user collapses one project group
- **THEN** entries in other project groups remain visible
