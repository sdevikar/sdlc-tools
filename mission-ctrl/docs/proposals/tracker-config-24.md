# Proposal: Tracker Config File

**ID:** `tracker-config-24`  
**Status:** 🔲 Planned  
**Depends on:** none  

## Why

mission-ctrl's backlog lives in `.mission/backlog.json`. You cannot see it in GitHub, assign it to a teammate, or view it in your team's issue tracker. The backlog is a closed silo — useful only inside Claude Code sessions.

Matt Pocock's skills solve this with a single config file per repo (`docs/agents/issue-tracker.md`). Every skill reads this file at runtime to know where issues live and what labels to use. Skills themselves contain no tracker-specific logic. This proposal brings the same pattern to mission-ctrl.

## What Changes

**New file: `docs/agents/issue-tracker.md`**  
Written once per repo by the setup skill (see below). Contains three things:
- Where issues live: `github` (owner/repo), `linear` (team key), or `local` (`.scratch/issues/`)
- Triage label names: one label string for each of the five canonical states (`untriaged`, `mvp-critical`, `parked`, `in-progress`, `done`)
- Any extra notes the project needs (monorepo paths, milestone defaults, etc.)

Format is free-form markdown. Skills read it as context passed to the AI. No parser needed.

**New skill: `/mission-ctrl:tracker-setup`**  
Runs interactively. Detects the repo's existing tracker by looking for `.github/`, `linear.json`, or similar signals. Proposes values for all three config sections. Waits for user confirmation before writing the file. Does not overwrite an existing file without confirmation.

New `SKILL.md` only — no Python changes.

**Extended `add-idea` SKILL.md**  
After writing the backlog item, check if `docs/agents/issue-tracker.md` exists. If yes, create a corresponding issue in the configured tracker and record the issue URL in the backlog item.

**New field: `BacklogItem.tracker_url: str | None`**  
Stores the external issue URL after sync. Defaults to `None`. Written by `add-idea` when a tracker is configured.

**Extended `status` skill output**  
When `tracker_url` is set on a backlog item, print the URL next to the item title.

## What This Is Not

- Not a full two-way sync — mission-ctrl writes to the tracker; it does not read back status changes from the tracker.
- Not required — if `docs/agents/issue-tracker.md` is absent, `add-idea` behaves exactly as it does today.
- Not blocking `add-idea` — tracker push is best-effort; a failed push still writes the backlog item.

## Impact

- `packages/core/models/backlog.py` — add `tracker_url: str | None = None` to `BacklogItem`
- `packages/pi-package/skills/add_idea.py` — read tracker config, push issue, store URL
- `packages/claude-plugin/skills/add-idea/SKILL.md` — describe tracker sync step
- `packages/claude-plugin/skills/tracker-setup/SKILL.md` — new file
- `packages/claude-plugin/bin/mission-ctrl` — register `tracker-setup` in `_SKILLS`

## Done When

- [ ] `tracker-setup` creates `docs/agents/issue-tracker.md` for GitHub and local-only configurations without overwriting an existing file
- [ ] `BacklogItem.tracker_url` persists after `add-idea` when tracker config exists
- [ ] `/mission-ctrl:status` shows tracker URL next to items that have one
- [ ] `add-idea` still succeeds when tracker push fails or no config is present
- [ ] Existing tests pass; new unit test covers `BacklogItem` round-trip with `tracker_url`
