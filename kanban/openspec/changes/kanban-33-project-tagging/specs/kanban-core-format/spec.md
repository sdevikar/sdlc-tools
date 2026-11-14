# Spec Delta

## MODIFIED Requirements

### Requirement: KanbanEntry data model
The system SHALL define a `KanbanEntry` interface with fields: `id`, `title`, `lane`, `priority`, `specPath`, `summary`, `status`, `createdAt`, `updatedAt`, `completedAt?`, `archivedAt?`, `githubIssue?`, `tags?`, `assignee?`, `notes?`, `project?`. `KanbanLane` SHALL be a union of `Not Started | In Progress | Ready | Done | Archived`.

#### Scenario: Required fields
- **WHEN** a `KanbanEntry` is constructed
- **THEN** all required fields must be present and typed

#### Scenario: project field is optional
- **WHEN** a `KanbanEntry` is constructed without a `project` value
- **THEN** `project` is `undefined` and the entry is valid

## ADDED Requirements

### Requirement: readKanban preserves project field
The system SHALL parse the optional `project:` field from a kanban.yaml entry and include it in the returned `KanbanEntry`. Entries without a `project:` field SHALL have `project` as `undefined`.

#### Scenario: Entry with project field
- **WHEN** a kanban.yaml entry contains `project: auth`
- **THEN** the parsed `KanbanEntry` has `project === "auth"`

#### Scenario: Entry without project field
- **WHEN** a kanban.yaml entry has no `project:` line
- **THEN** the parsed `KanbanEntry` has `project === undefined`

### Requirement: writeKanban serializes project field
The system SHALL include the `project:` field when serializing a `KanbanEntry` to kanban.yaml if the field is non-empty. Entries with `undefined` or empty `project` SHALL NOT emit a `project:` line.

#### Scenario: Round-trip with project
- **WHEN** an entry with `project: "kanban"` is written then read back
- **THEN** the parsed entry has `project === "kanban"`

#### Scenario: Round-trip without project
- **WHEN** an entry with no `project` is written then read back
- **THEN** the parsed entry has `project === undefined`
