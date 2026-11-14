# qgenie-plugin-packaging Specification

## Purpose
Defines the QGenie registry distribution contract for the kanban plugin, enabling installation via `qgenie plugins add` as an alternative to the Claude Code marketplace sequence.

## Requirements

### Requirement: QGenie plugin manifest exists
The repo SHALL include `.qgenie-plugin/plugin.json` with a valid `id` (`<org>/kanban`), `version`, `preferredHarness: claude`, all 10 skill entries with relative `./` paths, and a Claude Code adapter entry pointing at `./mod/kanban-board/`.

#### Scenario: Manifest declares all skills
- **WHEN** `.qgenie-plugin/plugin.json` is read
- **THEN** it lists all 10 skills: kanban, kanban-init, kanban-render, kanban-sync, setup, openspec-propose, openspec-apply-change, openspec-archive-change, openspec-explore, openspec-sync-specs

#### Scenario: Manifest declares Claude Code adapter
- **WHEN** `.qgenie-plugin/plugin.json` is read
- **THEN** it includes an `adapters.claude` entry with `"path": "./mod/kanban-board/"`

#### Scenario: Manifest paths are in-package
- **WHEN** all paths in `.qgenie-plugin/plugin.json` are checked
- **THEN** every path starts with `./` and resolves inside the repo root

### Requirement: QGenie install path is documented
`INSTALL.md` SHALL include a QGenie install section with the command `qgenie plugins add <org>/kanban --target claude`.

#### Scenario: INSTALL.md contains QGenie section
- **WHEN** `INSTALL.md` is read
- **THEN** it contains a QGenie install section with the `qgenie plugins add` command

### Requirement: Prerequisites are documented in install instructions
`INSTALL.md` SHALL document both prerequisites: the `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS=1` env flag and `npm install @fission-ai/openspec`.

#### Scenario: Both prerequisites listed
- **WHEN** `INSTALL.md` is read
- **THEN** it names `CLAUDE_CODE_ENABLE_FUNCTION_HOOKS` and `@fission-ai/openspec` as required before install

### Requirement: Existing Claude Code install path is preserved
The `.claude-plugin/plugin.json` manifest and the existing Claude Code marketplace install instructions SHALL remain unchanged.

#### Scenario: Claude Code manifest unmodified
- **WHEN** `.claude-plugin/plugin.json` is read after this change
- **THEN** its content is identical to before this change
