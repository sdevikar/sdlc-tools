# kanban-html-render Specification

## Purpose
TBD - created by archiving change kanban-04-html-render. Update Purpose after archive.
## Requirements
### Requirement: Render kanban entries to HTML
The system SHALL provide `renderKanbanHtml(entries, outputPath)` that writes a self-contained HTML file.

#### Scenario: File created
- **WHEN** renderKanbanHtml is called with entries
- **THEN** an HTML file is written at outputPath

### Requirement: Self-contained board
The generated HTML SHALL include inline CSS and JS with no external dependencies.

#### Scenario: No external refs
- **WHEN** HTML is inspected
- **THEN** there are no external stylesheet or script URLs

### Requirement: Drag-and-drop between lanes
The board SHALL support dragging cards between lane columns in the browser.

#### Scenario: Move card
- **WHEN** a card is dragged to another lane
- **THEN** it appears in that lane column

### Requirement: Priority badges and status
Each card SHALL display a priority badge and status indicator.

#### Scenario: Card shows P and status
- **WHEN** board renders
- **THEN** each card shows priority badge and status text

### Requirement: Filtering and sorting
The board SHALL support filtering by lane, priority, tags and sorting by priority, date, name.

#### Scenario: Filter by lane
- **WHEN** a lane filter is selected
- **THEN** only cards in that lane are shown

