# Spec Delta

## Purpose

Allows a root `kanban.yaml` to register child boards at relative paths, enabling multi-level board hierarchies within a single project tree.

## ADDED Requirements

### Requirement: boards field in root kanban.yaml
The root `kanban.yaml` SHALL support an optional `boards:` array. Each element SHALL have a `name` (string) and a `path` (relative path to a sub-board YAML file).

#### Scenario: Valid boards field is parsed
- **WHEN** `kanban.yaml` contains a `boards:` array with name/path entries
- **THEN** the system reads each entry as a registered sub-board

#### Scenario: Missing boards field is allowed
- **WHEN** `kanban.yaml` has no `boards:` field
- **THEN** the system treats the file as a single-board root with no sub-boards

#### Scenario: Sub-board file name is not restricted
- **WHEN** a `boards:` entry has a path pointing to a file not named `kanban.yaml`
- **THEN** the system reads it as a valid sub-board

### Requirement: boards entries are isolated
Each registered sub-board's `entries:` array SHALL be independent. Reads and writes to a sub-board SHALL not modify the root `kanban.yaml` entries or any sibling board.

#### Scenario: Sub-board write is scoped
- **WHEN** `/kanban-sync` updates a sub-board entry
- **THEN** only the sub-board's own YAML file is written; the root file is unchanged

#### Scenario: Root entries and sub-board entries coexist
- **WHEN** the root `kanban.yaml` has both `entries:` and `boards:` populated
- **THEN** root entries and each sub-board's entries are kept and rendered separately
