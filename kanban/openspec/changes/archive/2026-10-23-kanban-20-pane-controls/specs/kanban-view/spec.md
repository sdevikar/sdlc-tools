# Spec Delta

## MODIFIED Requirements

### Requirement: inline-fallback-message
When the pane cannot be placed, the inline fallback message tells the user what to do.

#### Scenario: terminal too narrow
- **WHEN** `/kanban-view` runs and `$.ui.open()` returns `isPlaced: false`
- **THEN** the inline output includes a message stating the terminal must be ≥110 columns wide for the side pane, and prints the board table as a fallback
