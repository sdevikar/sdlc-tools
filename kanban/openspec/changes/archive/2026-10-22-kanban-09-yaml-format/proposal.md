## Why

Markdown is a poor machine format: parsing is fragile and tests must manipulate text. The kanban source of truth should be structured YAML (`kanban.yaml`), with Markdown/HTML as generated views. This aligns storage with how tools already consume the data.

## What Changes

- Change source of truth from `kanban.md` to `kanban.yaml`
- Implement `readKanban`/`writeKanban` using a YAML parser (no text manipulation)
- Update sync to read/write YAML
- Update research report and agent instructions to state `kanban.yaml` is the format
- Preserve manual edits via structured merge (facts only)

## Capabilities

### New Capabilities
- `kanban-core-yaml`: YAML-based kanban format and sync

### Modified Capabilities
- `kanban-core-format`: storage format becomes YAML
- `kanban-core-sync`: operates on YAML

## Impact

- Modifies: `libs/kanban-core/`
- Adds dependency: `yaml`
- Docs: research report Appendix B, AGENTS.md