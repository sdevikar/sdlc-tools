# Spec Delta

## Purpose

Provides Close and Collapse controls inside the kanban-board pane so the user can dismiss or minimize the board without leaving the keyboard.

## ADDED Requirements

### Requirement: close-button
The pane renders a Close button that dismisses it.

#### Scenario: user presses Close
- **WHEN** the kanban-board pane is open and the user presses the Close button
- **THEN** the pane closes

### Requirement: escape-dismiss
The pane closes when the user presses Escape while the pane holds keyboard focus.

#### Scenario: escape while focused
- **WHEN** the pane holds keyboard focus and the user presses Escape
- **THEN** the pane closes (origin: person)

### Requirement: header-controls-row
Close and Collapse/Expand buttons appear together in a single header row at the top of the pane.

#### Scenario: pane renders
- **WHEN** the pane is open
- **THEN** the first rendered row contains both the Collapse/Expand button and the Close button side by side
