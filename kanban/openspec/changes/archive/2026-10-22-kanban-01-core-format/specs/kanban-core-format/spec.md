## ADDED Requirements

### Requirement: KanbanEntry data model
The system SHALL define a `KanbanEntry` interface with fields: `id`, `title`, `lane`, `priority`, `specPath`, `summary`, `status`, `createdAt`, `updatedAt`, `completedAt?`, `archivedAt?`, `githubIssue?`, `tags?`, `assignee?`, `notes?`. `KanbanLane` SHALL be a union of `Not Started | In Progress | Ready | Done | Archived`.

#### Scenario: Required fields
- **WHEN** a `KanbanEntry` is constructed
- **THEN** all required fields must be present and typed

### Requirement: readKanban parses kanban.md
The system SHALL provide `readKanban(path)` returning `KanbanEntry[]` parsed from a kanban.md file. It SHALL group entries by their `## <Lane>` header, read `- **key**: value` lines, and coerce `priority` to number and `tags` to string array (comma-separated).

#### Scenario: Parse sample board
- **WHEN** readKanban is called on a valid kanban.md
- **THEN** it returns one entry per `### <id>` block with lane assigned from the enclosing `## ` header

#### Scenario: Missing optional fields
- **WHEN** an entry omits optional fields
- **THEN** they are undefined on the resulting object

### Requirement: writeKanban serializes entries
The system SHALL provide `writeKanban(path, items)` that writes a kanban.md file from `KanbanEntry[]`, grouping entries by lane in the canonical lane order, preserving manual fields including `notes`.

#### Scenario: Round-trip equality
- **WHEN** readKanban is called, then writeKanban, then readKanban again
- **THEN** the two parsed arrays are deeply equal

### Requirement: Default priority
The system SHALL default `priority` to 99 when not specified in the source.

#### Scenario: Missing priority
- **WHEN** an entry has no priority line
- **THEN** its priority is 99