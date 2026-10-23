## MODIFIED Requirements

### Requirement: Mod runs archive-sync CLI on gaps
When gaps exist, the mod SHALL run its inline sync against the project at the session working directory. The mod SHALL NOT start an external process that needs files under the project's `libs/` directory.

#### Scenario: Gaps exist
- **WHEN** one or more gap entries are found
- **THEN** the mod moves the entries to the Archived lane and re-renders the pane if it is open

#### Scenario: Project has no libs/kanban-core
- **WHEN** gaps exist in a project that has no `libs/kanban-core/` directory
- **THEN** the mod syncs the entries and shows no error toast

#### Scenario: archive-sync exits non-zero
- **WHEN** the inline sync returns an error
- **THEN** the mod shows one toast with the error message and does not retry until the archive folder mtime changes again
