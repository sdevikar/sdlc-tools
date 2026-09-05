# Proposal: Direct-Wire bin/mission-ctrl to Python Core

## Why

The Claude plugin (`claude-plugin-08`) is fully scaffolded but `bin/mission-ctrl`
routes through `ts-bridge-07`, which is 0% implemented. Nothing in the plugin
actually executes today. Dogfooding requires a working plugin; waiting for the
bridge means waiting indefinitely on a component that only existed to serve Pi —
which itself cannot load Python extensions. Wiring the bin wrapper directly to
Python removes the only remaining blocker between the plugin and real use.

## Prerequisites

- `claude-plugin-08` applied (plugin manifest, SKILL.md files, hooks.json present)

## What Changes

- `packages/claude-plugin/bin/mission-ctrl` rewritten to call
  `uv run --project <MISSION_CTRL_ROOT> python -m mission_ctrl_pi.cli` directly,
  passing through the operation name and JSON payload on stdin.
- New `mission_ctrl_pi/cli.py` thin dispatch module: reads argv for the operation
  (`skill <name>`, `hook <name>`), reads JSON from stdin, calls the matching
  existing skill function, writes result JSON to stdout, errors to stderr.
  No new logic — pure dispatch over functions that already exist.
- `MISSION_CTRL_ROOT` env var or relative path heuristic locates the repo root
  (same as current wrapper, already implemented).
- `uv` fallback exec behavior already validated in `claude-plugin-08` — reuse
  unchanged.

## Non-goals

- No new skill logic; `cli.py` is dispatch only.
- `ts-bridge-07` is not deleted — it remains planned for a future Pi integration
  if Pi's TS API ever becomes viable. It is removed from the dogfood critical path.
- No changes to SKILL.md contracts, hooks.json, or plugin.json.
- No changes to `mission_ctrl_core` or any store/model code.

## Impact

- Changes: `packages/claude-plugin/bin/mission-ctrl` (rewrite),
  `packages/pi-package/mission_ctrl_pi/cli.py` (new file, ~50 lines).
- All existing skill and hook contracts remain identical.
- `claude plugin validate` must still pass after the change.

**Done when:** `claude --plugin-dir ./packages/claude-plugin` in a temp project
runs the full lifecycle (init → add-idea → triage → spec-create →
design-propose → design-approve → spec-status done) with real `.intent/` files
written to disk and no bridge process involved.
