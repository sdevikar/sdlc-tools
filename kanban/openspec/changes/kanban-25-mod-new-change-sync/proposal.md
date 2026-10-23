## Why

A new change in `openspec/changes/` does not show on the kanban board until someone adds an entry to `docs/kanban.yaml` by hand. The `openspec-propose` skill and `openspec new change` do not write the board. We do not own the skill, so an edit to it is lost on the next OpenSpec update. This is the same gap as `kanban-24-mod-archive-sync`, for the start of a change instead of the end.

## What Changes

- Use the `kanban-24` timer to also `stat` `openspec/changes/`.
- When that folder's `mtimeMs` changes, the mod compares the active change names with `docs/kanban.yaml`. A **missing** change is a folder with a `proposal.md` and no board entry.
- For each missing change, run `node libs/kanban-core/dist/src/cli.js new-sync`. It adds an entry to `Not Started` and leaves all other entries as they are.
- New entry fields:

| Field | Value |
| --- | --- |
| `id`, `title` | Folder name |
| `lane` | `Not Started` |
| `priority` | The `NN` in `kanban-NN-<slug>`; `99` if the name has no number |
| `specPath` | `openspec/changes/<name>/` |
| `summary` | First sentence under `## Why` in `proposal.md`, cut to 80 characters |
| `status` | `proposal written` |
| `createdAt`, `updatedAt` | Local date |

- The mod re-renders the pane if it is open.

## Decisions

### Wait for `proposal.md`

`openspec new change` makes a folder with only `.openspec.yaml`. The propose skill writes `proposal.md` some seconds later. A card with no summary helps no one. The mod skips folders with no `proposal.md`. The next timer tick after `proposal.md` appears adds the card. Writing `proposal.md` does not change the `mtimeMs` of `openspec/changes/`, so the mod also keeps a list of skipped folders and checks them on each tick.

### Never remove or move entries

This change only adds. A folder that disappears is either archived (handled by `kanban-24`) or deleted by the person. The mod does not guess which.

## Priority

Do this after `kanban-24`. Set board priority 25.

| Reason | Detail |
| --- | --- |
| Depends on `kanban-24` | Reuses its timer, gap-scan shape, kanban-core subcommand pattern, and toast-on-error. |
| Lower harm when missing | A missing card is visible as missing. You notice and add it. A stale card in the wrong lane looks correct and misleads. |
| More decisions needed | Priority and summary defaults need sign-off. `kanban-24` needs none. |
| Less frequent by hand | The archive step happens after every change and is easy to forget. New proposals usually happen in a Claude turn, where Claude can add the entry by `AGENTS.md`'s sync rule. |

## Capabilities

### New Capabilities

- `claude-mod-new-change-sync`: The mod adds board entries for new changes that have a proposal.

### Modified Capabilities

- `kanban-core-sync`: Adds a targeted `new-sync` command that only adds entries.

## User Stories

| ID | Story |
| --- | --- |
| U1 | After a proposal is written, through Claude or a terminal, its card shows in Not Started within 5 s. |
| U2 | The card's priority matches the change number. |
| U3 | A change folder with no `proposal.md` gets no card. |
| U4 | The auto write does not change existing entries. |

## Impact

- Depends on: `kanban-16-kanban-core-cli`, `kanban-24-mod-archive-sync`.
- Modifies: `libs/kanban-core/src/sync.ts` (new `applyNewChanges` function), `libs/kanban-core/src/cli.ts` (new `new-sync` subcommand).
- Modifies: `mod/kanban-board/hooks/register.tsx` (second `stat`, missing-change scan).
- Modifies: `AGENTS.md` "Sync rule" (the add step becomes automatic in Claude Code).
- Same automatic-write implications as `kanban-24` (no prompt, not in `/rewind`, whole-file re-serialize).

## Assumptions

- Change folders follow `kanban-NN-<slug>`.
- The first sentence under `## Why` is a usable summary. You can edit it on the board after.
