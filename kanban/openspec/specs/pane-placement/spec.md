# pane-placement

## Purpose

Defines where the kanban-board pane shows in each terminal renderer, and what the user is told when it cannot show as a side pane.

## Requirements

### Requirement: renderer-hint
When the session runs the classic renderer, `/kanban-view` tells the user how to get the side pane.

#### Scenario: classic renderer
- **WHEN** the user runs `/kanban-view` and the session is not fullscreen
- **THEN** the pane opens above the prompt, and the command output names `/tui fullscreen` as the way to get a side pane

#### Scenario: fullscreen renderer
- **WHEN** the user runs `/kanban-view` and the session is fullscreen
- **THEN** the command output has no renderer hint

### Requirement: unplaced-reason
When the pane cannot be placed, the output shows the engine's reason.

#### Scenario: pane waits undrawn
- **WHEN** `/kanban-view` runs and the pane is not placed
- **THEN** the output shows the reason the engine gave, followed by the board as a Markdown table

### Requirement: stacked-lanes
The pane stacks lanes top to bottom in every placement.

#### Scenario: inline placement
- **WHEN** the pane shows above the prompt
- **THEN** lanes appear one under the other, as in the docked pane
