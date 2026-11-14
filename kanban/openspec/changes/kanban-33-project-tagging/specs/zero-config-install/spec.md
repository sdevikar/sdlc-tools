# Spec Delta

## ADDED Requirements

### Requirement: Setup skill offers opt-in project-area CLAUDE.md generation
The `/kanban:setup` skill SHALL offer an opt-in step that scans the repo's major subdirectories and generates a lightweight `CLAUDE.md` in each one. Each generated file SHALL instruct the AI to use the subdirectory's name as the project prefix in change names (e.g., `<subdir>-NN-<slug>`). The step is skipped if the user declines.

#### Scenario: User accepts project-area generation
- **WHEN** `/kanban:setup` runs and the user accepts the project-area setup prompt
- **THEN** for each major subdirectory, a `CLAUDE.md` is created or updated that specifies the project prefix to use for change names in that directory

#### Scenario: User declines project-area generation
- **WHEN** `/kanban:setup` runs and the user declines the project-area setup prompt
- **THEN** no CLAUDE.md files are created or modified and setup continues normally

#### Scenario: Existing CLAUDE.md is not overwritten without review
- **WHEN** a subdirectory already has a `CLAUDE.md`
- **THEN** the setup skill shows the existing content and asks the user before modifying it
