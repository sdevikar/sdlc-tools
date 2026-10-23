# Spec Delta

## Purpose

Defines the visual appearance of lanes and entries in the kanban-board pane: color coding, card layout, and priority display.

## ADDED Requirements

### Requirement: lane-colors
Each lane header renders in a distinct color.

#### Scenario: Not Started lane header
- **WHEN** the pane renders
- **THEN** the "Not Started" header text color is cyan

#### Scenario: In Progress lane header
- **WHEN** the pane renders
- **THEN** the "In Progress" header text color is yellow

#### Scenario: Archived lane header
- **WHEN** the pane renders
- **THEN** the "Archived" header text is dimmed (gray)

### Requirement: entry-card
Each entry renders as a card with ID and summary clearly separated.

#### Scenario: entry with summary
- **WHEN** an entry has a non-empty summary
- **THEN** the entry shows the bold ID with a dim priority badge, and the summary below it in dim text

#### Scenario: entry without summary
- **WHEN** an entry has no summary
- **THEN** only the bold ID and priority badge are shown

### Requirement: lane-divider
A visual divider separates the lane header from its entries.

#### Scenario: pane renders any lane
- **WHEN** a lane has at least one entry
- **THEN** a horizontal divider line appears between the lane header and the first entry
