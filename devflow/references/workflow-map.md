# devflow workflow map

devflow prints this map at each session start. The map says when to use each skill. The skills say how.

## Files

Keep working files in `<worktree_root>/.devflow/`, not in `docs/`. Git tracks only `kanban.yaml` there. Intents live in `intent/<id>/intent.md` at the project root, tracked by git. If a subfolder is missing, create it. If the project's `CLAUDE.md` names another location for a kind of file, use that location.

| Kind | Folder |
|---|---|
| Handoffs | `.devflow/handoffs/` |
| Plans and design specs, including superpowers plans and specs (not `docs/superpowers/`) | `.devflow/plans/` |
| Review reports | `.devflow/reviews/` |
| Research notes | `.devflow/research/` |
| Analysis and root-cause notes | `.devflow/analysis/` |
| PDFs, diagrams, images, and other binary files | `.devflow/artifacts/` |

## When to use what

| Moment | Use |
|---|---|
| The user brings a new idea or feature request | `devflow:triage`, before any design work |
| The user asks what to do next, or an item is done | `devflow:next` |
| Design a feature or a change in behavior | `superpowers:brainstorming`, then `superpowers:writing-plans` |
| `openspec/` exists, or `CLAUDE.md` names OpenSpec | `/opsx:propose`, `/opsx:apply`, `/opsx:archive`, then `kanban:kanban-sync` |
| Write code | `devflow:atomic-commits`, with `ponytail` for the smallest change |
| A bug, a test failure, or unexpected behavior | `superpowers:systematic-debugging` |
| Before a push | `devflow:self-review` |
| Reviewer comments on a PR | `devflow:address-pr-comments` |
| A devflow checkpoint asks, or the user stops | `devflow:handoff` |
| The session starts with a handoff pointer | `devflow:pickup` |
| A new goal, or an intent's outcome or constraint must change | `devflow:intent` |
| An intent is accepted | `/opsx:propose <id>` or `superpowers:brainstorming`, reading `intent/<id>/intent.md` |

## Rules

- Follow `CLAUDE.md` and the Constraints of each accepted intent.
- Never block the user over scope. Triage and next recommend; the user decides.
- Never commit or push without the user's approval.
