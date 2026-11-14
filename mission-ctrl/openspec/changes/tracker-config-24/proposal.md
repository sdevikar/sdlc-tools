# Proposal: Issue Tracker Config File

## Why

mission-ctrl's backlog lives in `.mission/backlog.json`. You cannot see it in
GitHub, assign it to a teammate, or view it in your team's issue tracker. The
backlog is a closed silo — useful only inside Claude Code sessions. A single
config file per repo that every skill reads at runtime tells the system where
issues live, without embedding tracker-specific logic in any skill.

## Prerequisites

None.

## What Changes

**New file: `docs/agents/issue-tracker.md`**

Written once per repo by the setup skill. Contains:
- Where issues live: `github` (owner/repo), `linear` (team key), or `local`
  (`.scratch/issues/`)
- Triage label names: one label string per canonical state (`untriaged`,
  `mvp-critical`, `parked`, `in-progress`, `done`)
- Optional extra notes (monorepo paths, milestone defaults)

Format is free-form markdown. Skills read it as context; no parser needed.

**New skill: `/mission-ctrl:tracker-setup`**

Runs interactively. Detects the repo's existing tracker by looking for `.github/`,
`linear.json`, or similar signals. Proposes values for all three config sections.
Waits for user confirmation before writing. Does not overwrite an existing file
without confirmation. New `SKILL.md` only — no Python changes.

**Extended `add-idea` SKILL.md:** After writing the backlog item, check if
`docs/agents/issue-tracker.md` exists. If yes, create a corresponding issue in
the configured tracker and record the URL in the backlog item.

**New field: `BacklogItem.tracker_url: str | None`:** Stores the external issue
URL after sync. Defaults to `None`. Written by `add-idea` when a tracker is
configured.

**Extended `status` skill output:** Print `tracker_url` next to items that have one.

## Non-goals

- Not a full two-way sync — mission-ctrl writes to the tracker; it does not read
  back status changes from the tracker.
- Not required — if `docs/agents/issue-tracker.md` is absent, `add-idea` behaves
  exactly as it does today.
- Not blocking `add-idea` — tracker push is best-effort; a failed push still
  writes the backlog item.

## Impact

- `packages/core/models/backlog.py` — add `tracker_url: str | None = None`
- `packages/pi-package/skills/add_idea.py` — read tracker config, push issue, store URL
- `packages/claude-plugin/skills/add-idea/SKILL.md` — describe tracker sync step
- `packages/claude-plugin/skills/tracker-setup/SKILL.md` — new file
- `packages/claude-plugin/bin/mission-ctrl` — register `tracker-setup` in `_SKILLS`

## Done When

- [ ] `tracker-setup` creates `docs/agents/issue-tracker.md` for GitHub and local-only configs without overwriting an existing file
- [ ] `BacklogItem.tracker_url` persists after `add-idea` when tracker config exists
- [ ] `/mission-ctrl:status` shows tracker URL next to items that have one
- [ ] `add-idea` still succeeds when tracker push fails or no config is present
- [ ] Existing tests pass; new unit test covers `BacklogItem` round-trip with `tracker_url`
