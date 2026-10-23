# Spec Delta

## MODIFIED Requirements

### Requirement: kanban-view command
The system SHALL provide a `/kanban-view` command that opens a pane when the surface supports it, and falls back to an inline Markdown table when it does not.

#### Scenario: Render board as pane
- **WHEN** user runs /kanban-view on a surface that can place a pane
- **THEN** a side pane opens showing swim lanes with entries sorted by priority ascending

#### Scenario: Render board inline
- **WHEN** user runs /kanban-view on a surface that cannot place a pane
- **THEN** a Markdown table with one column per lane is printed, cards sorted by priority

## REMOVED Requirements

### Requirement: kanban-view skill
**Reason**: The mod's native command registration handles `/kanban-view`. The skill is a competing handler that always renders inline and masks the pane bug.
**Migration**: Use `/kanban-view` as before. The mod command handles both pane and inline rendering automatically.
