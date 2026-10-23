# Spec Delta

## Purpose

Defines how the user closes and collapses the kanban-board pane, in the fullscreen renderer and in the classic renderer, with or without a mouse.

## ADDED Requirements

### Requirement: close-by-keyboard
The user can close the pane from the keyboard in either renderer.

#### Scenario: hotkey while pane holds focus
- **WHEN** the pane holds keyboard focus and the user presses `x`
- **THEN** the pane closes

#### Scenario: escape while pane holds focus
- **WHEN** the pane holds keyboard focus and the user presses Escape
- **THEN** the pane closes

### Requirement: focus-on-command
The pane takes keyboard focus when the user opens it with `/kanban-view`.

#### Scenario: open from command
- **WHEN** the user runs `/kanban-view` and the pane is placed
- **THEN** the pane holds keyboard focus, and the close hotkey works with no other key first

### Requirement: collapse-by-keyboard
The user can collapse and expand the pane from the keyboard.

#### Scenario: hotkey toggles collapse
- **WHEN** the pane holds keyboard focus and the user presses `c`
- **THEN** the pane toggles between lane headers only and the full board

### Requirement: control-hints
The pane header tells the user how to close it without a mouse.

#### Scenario: header shows hotkeys
- **WHEN** the pane renders
- **THEN** the header shows the close hotkey and the chord that gives the pane focus (`ctrl+x tab`)

### Requirement: close-by-click
In the fullscreen renderer, a click on Close closes the pane.

#### Scenario: click in fullscreen
- **WHEN** the session runs the fullscreen renderer and the user clicks Close
- **THEN** the pane closes
