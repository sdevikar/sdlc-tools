## MODIFIED Requirements

### Requirement: Manual sync command
The system SHALL provide `/kanban-sync` to run full sync. The skill SHALL work in any project without a build step. It SHALL call the mod tool `kanban_board_setup` when that tool is available. Otherwise, it SHALL scan openspec and merge `kanban.yaml` with the same rules as `/kanban:setup`.

#### Scenario: Run sync
- **WHEN** user runs /kanban-sync
- **THEN** kanban board is synced with OpenSpec

#### Scenario: Run sync after fresh clone
- **WHEN** user runs /kanban-sync in a project that has no `libs/kanban-core/` directory
- **THEN** the skill syncs the board without a build step and without an error about `libs/kanban-core`

#### Scenario: Mod tool not available
- **WHEN** user runs /kanban-sync and the `kanban_board_setup` tool is not available
- **THEN** the agent scans openspec, merges `kanban.yaml` by the setup skill's lane rules, and reports the result
