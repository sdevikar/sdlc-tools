# Spec Delta

## REMOVED Requirements

### Requirement: Init observer runs after `/init`
**Reason**: `/init` is a built-in Claude Code command and must stay unchanged. The dialog runs from `/kanban:setup` instead.
**Migration**: Run `/kanban:setup`. See the `zero-config-install` requirement "Setup asks before it creates or syncs kanban.yaml".

### Requirement: User confirms kanban creation or sync
**Reason**: Moved to the setup flow.
**Migration**: See the `zero-config-install` requirement "Setup writes kanban.yaml only on Yes".

### Requirement: Openspec unavailable is handled gracefully
**Reason**: Moved to the setup flow.
**Migration**: See the `zero-config-install` requirement "Setup handles openspec failure in the dialog".
