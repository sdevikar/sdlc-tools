# Intent: Adopt the playbook's intent.md and make the session pointer visible
Author: Swapnil Devikar. Status: accepted.

## Problem

devflow used its own charter file, a repo-wide goal that drifted from Anthropic's AI-native SDLC playbook. The playbook starts each piece of work with an intent.md. The session-start handoff pointer is plain text, so the user misses it.

## Proposed outcome

- [ ] `/devflow:intent` writes `intent/<id>/intent.md` in the playbook format, and `triage`, `next`, and the session-start digest read it.
- [ ] devflow has no `charter` skill and no charter conversion step.
- [ ] At session start, a card above the prompt shows the last session, the next step, and the handoff path, in the kanban pane's colors.
- [ ] `/devflow:setup` drafts a `REVIEW.md` in the playbook format when the repo has none, and offers to import it in `CLAUDE.md`.
- [ ] Each playbook step that devflow lacks is an OpenSpec proposal in `devflow/openspec/changes/`.

## Affected users and systems

Developers who use devflow. The devflow skills `intent`, `triage`, `next`, and `setup`, the SessionStart hook, a new devflow mod, and each repo's `REVIEW.md` and `CLAUDE.md`.

## Constraints

- Use Anthropic sources only. Do not use intentspec.org (Pathmode).
- Keep the text pointer that Claude reads at session start.
- Build no playbook-gap proposal in this work.

## Open questions

- None.
