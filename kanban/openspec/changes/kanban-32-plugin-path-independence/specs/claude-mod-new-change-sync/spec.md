## MODIFIED Requirements

### Requirement: Mod runs new-sync CLI on missing changes
When missing changes are found, the mod SHALL run its inline sync against the project at the session working directory. The mod SHALL NOT start an external process that needs files under the project's `libs/` directory.

#### Scenario: Missing changes found
- **WHEN** one or more missing changes are identified
- **THEN** the mod adds their board entries and re-renders the pane if it is open

#### Scenario: Project has no libs/kanban-core
- **WHEN** missing changes are found in a project that has no `libs/kanban-core/` directory
- **THEN** the mod adds the entries and shows no error toast

#### Scenario: new-sync exits non-zero
- **WHEN** the inline sync returns an error
- **THEN** the mod shows one toast with the error message
