# mission-ctrl — Claude Code plugin

> **Beta.** This plugin is in beta testing.

Intent layer for coding sessions: backlog, specs, design gate, recaps, and
implementation-intent interception, driven inside Claude Code. Prompts and
wiring only — all logic lives in `mission_ctrl_core` / `mission_ctrl_pi`.

## Layout

- `../../.claude-plugin/plugin.json` — manifest at the project root (namespace
  `mission-ctrl`, so skills invoke as `/mission-ctrl:next`). The project root
  is the plugin root, so an install also copies the Python packages.
- `skills/*/SKILL.md` — one per intent skill, JSON I/O contracts
  mirroring the Pydantic schemas 1:1
- `hooks/hooks.json` — `SessionStart` recap injection
- `bin/mission-ctrl` — runtime wrapper (stdlib only). The root `bin` link
  points here and puts it on the Bash tool PATH.

## Prerequisites

- Python 3.11+ and `uv` on PATH (the wrapper re-execs through `uv` when the
  system python lacks the deps)
- The wrapper locates `packages/core` and `packages/pi-package` relative to
  itself, or via `MISSION_CTRL_ROOT`

## Install

```bash
claude plugin marketplace add qcom-all-gh-users/sdlc-tools
claude plugin install mission-ctrl@sdlc-tools --scope local
```

## Try it locally (no install)

From the mission-ctrl project root:

```bash
claude --plugin-dir .
```

Then `/mission-ctrl:status` (needs a project with `.mission/` — run
`/mission-ctrl:init` first). After edits, `/reload-plugins` picks them
up without a restart. Hook activity is recorded in the debug log
(`claude --debug`).

## Validate

From the mission-ctrl project root:

```bash
claude plugin validate .
```

## Skills

| Skill | Operation |
|---|---|
| `/mission-ctrl:init` | create `.mission/` store |
| `/mission-ctrl:add-idea` | capture untriaged idea |
| `/mission-ctrl:triage` | bucket idea (mvp/later/rejected) |
| `/mission-ctrl:spec-create` | draft spec from triaged idea |
| `/mission-ctrl:spec-status` | move spec (in_progress/done/blocked) |
| `/mission-ctrl:design-propose` | submit design digest |
| `/mission-ctrl:design-approve` | approve/reject design |
| `/mission-ctrl:next` | planner's next suggestion |
| `/mission-ctrl:status` | read-only snapshot |
| `/mission-ctrl:recap` | on-demand recap |
| `/mission-ctrl:log-feedback` | log dogfood observations |

Invocation pattern (also what each SKILL.md instructs):

```bash
mission-ctrl skill <name> --cwd "<project-dir>" <<'EOF'
{<input JSON>}
EOF
```

Errors: stderr `{"code","message"}` + non-zero exit
(`NOT_INITIALIZED`, `NOT_FOUND`, `INVALID_INPUT`, `ILLEGAL_TRANSITION`,
`NOTES_REQUIRED`, `ALREADY_INITIALIZED`, `NOT_IMPLEMENTED`, `INTERNAL`).

## Hooks

- `SessionStart` → gap-tiered recap injected as context; silent when the
  project has no `.mission/`.

## Contract test

`packages/pi-package/tests/test_claude_plugin_contracts.py` validates every
SKILL.md json input block against its Pydantic schema — doc/schema
drift fails the build.
