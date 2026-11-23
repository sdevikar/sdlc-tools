# devflow

A Claude Code plugin that wires your commit, handoff, and review workflows into every project where you install it.

## The workflow

Without devflow, an AI coding session has no memory of previous sessions, no rules about how commits are structured, and no process for handling review feedback. You type the same instructions into every prompt.

devflow changes that by composing three loops that run automatically:

**Commit loop** — before any code is written, `/atomic-commits` proposes a commit plan and waits for approval. It enforces merge rules (config and the code that reads it belong together; a refactor and a bug fix do not), runs a volume check, and offers a combine pass before a push. Each commit is reviewed before the next one starts.

**Session loop** — at the start of every session and after each compaction, a hook prints a short pointer to the latest handoff. `/handoff` saves the session state; `/pickup` restores it. At each milestone, a checkpoint hook asks Claude to keep the handoff current, so you do not need to remember.

**Review loop** — `/self-review` runs the built-in code review, verifies each finding against the code, checks earlier decisions in handoffs and commit history, rates each proposed fix by blast radius and reversibility, and waits for your approval tier by tier before changing anything. `/address-pr-comments` does the same for GitHub review threads.

The three loops compose: a task starts with a commit plan, produces handoffs as it progresses, and ends with a review before the branch is pushed.

## What makes this stick

The value is not any single skill — it is the encoded process rules. The merge test, the approval gates, the report format, the rating rubric, the decision that an earlier handoff overrides a reviewer's finding — these are specific, tested rules that live in the skills, not in a prompt you retype each session. Install devflow once per project and the rules travel with the repo.

The plugin brings `superpowers`, `ponytail`, and `kanban` as dependencies. `kanban` comes from the same `sdlc-tools` marketplace. `superpowers` provides the receiving-code-review and executing-plans contexts the review loop calls. `ponytail` enforces simplicity discipline on code the commit loop produces. `kanban` tracks tasks on a shared board.

## Install

Run `/setup` in a Claude Code session inside the project. It checks for conflicts, registers the marketplaces, and installs the plugin.

Or manually:

```bash
# One time — register the marketplaces
claude plugin marketplace add qcom-all-gh-users/sdlc-tools
claude plugin marketplace add DietrichGebert/ponytail

# Per project
claude plugin install devflow@sdlc-tools --scope local
```

If you already have `superpowers`, `ponytail`, or `kanban` installed from a **different** marketplace, uninstall them first. `/setup` checks this for you.

## Skills

| Skill | Loop | What it does |
|---|---|---|
| `setup` | — | Conflict check, marketplace registration, install, `.devflow/` folder, project rule |
| `atomic-commits` | Commit | Plan → approve → commit → review, one unit at a time |
| `handoff` | Session | Write or update this session's handoff |
| `pickup` | Session | Restore from the latest handoff |
| `self-review` | Review | Run, verify, rate, and gate-approve fixes from a code review |
| `address-pr-comments` | Review | Fetch, verify, rate, and gate-approve fixes from PR review threads |

## Working files

devflow keeps its working files in `.devflow/` at the root of each git worktree, so they never mix with a project's own `docs/`. `/devflow:setup` creates the folder. The skills also create it when it is missing.

| Folder | Contents |
|---|---|
| `.devflow/handoffs/` | Handoffs |
| `.devflow/reviews/` | Review reports |
| `.devflow/plans/` | Plans and design specs, including superpowers plans and specs |
| `.devflow/research/` | Research notes |
| `.devflow/analysis/` | Analysis and root-cause notes |
| `.devflow/artifacts/` | PDFs, diagrams, images, and other binary files |
| `.devflow/kanban.yaml` | Kanban board (created by `/kanban:kanban-setup`) |

`.devflow/.gitignore` holds `*`, so git ignores the whole folder. You do not need to edit your root `.gitignore`.

Setup also copies a rule to `.claude/rules/devflow.md`. Claude Code loads every `.claude/rules/*.md` file next to `CLAUDE.md`, so the rule reaches Claude without any edit to your `CLAUDE.md`. The rule tells Claude where each kind of file goes. If your `CLAUDE.md` names another location, your `CLAUDE.md` wins. Setup asks before it adds the rule file to `.git/info/exclude`. Run setup again after a plugin update to refresh the rule, and once in each new worktree.

```mermaid
flowchart LR
    G["~/.claude/CLAUDE.md<br/>default: docs/"] --> D[".claude/rules/devflow.md<br/>.devflow/&lt;kind&gt;/"] --> P["project CLAUDE.md<br/>wins if it names a location"]
```

## Handoff and pickup

`/handoff` writes the session state to `.devflow/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md` in the project root. On a feature branch, `<slug>` is the branch name with `/` changed to `-`. On `main`, it is a short topic. The file starts with frontmatter (`branch`, `head`, `base`, `pr`, `status`, `session`, `summary`, `next`), so tools can find it without a pasted path.

There is one handoff per session. Each later `/handoff` in the same session rewrites that file in place. The handoff is a snapshot: goal, at most 3 outcomes, decisions, dead ends, open questions, and next steps. It never lists commits or files, because pickup reads those from git.

When a session starts, clears, resumes, or compacts, a hook prints at most 3 lines: the `summary`, the `next` step, and the path of the most recently updated handoff for the current branch whose `status` is not `done`. Run `/devflow:pickup` to read that handoff, check it against git, and choose the next step. Pass a path to pick up a specific file: `/devflow:pickup .devflow/handoffs/<file>.md`.

### Checkpoint

When Claude ends a turn, a `Stop` hook checks for a milestone since the last checkpoint:

| Signal | Example |
|---|---|
| A new commit | Claude commits a fix |
| A new or changed file in `.devflow/plans/`, `analysis/`, `research/`, or `reviews/` | A plan or review report is written |
| An OpenSpec change archived, or with every task checked | The last task of a change is done |

On a signal, the hook asks Claude once to decide if the handoff needs an update. Claude updates it in place and reports the path in one line, or replies "Handoff current." You do not need to answer. The hook never asks twice for the same signal, never asks while Claude is already continuing for it, and stays silent on any error. Uncommitted edits, context use, and elapsed time are not signals.

The hook keeps its state in `.devflow/.checkpoint/`. To turn it off, set `DEVFLOW_CHECKPOINT=off` in the environment. It needs Claude Code 2.1.314 or later.

The hooks need `python3` on `PATH`.

## Review

Both review skills share one loop, in `references/review-loop.md`. It verifies each finding, checks it against earlier decisions, writes one report table, rates each fix, and stops for your approval. Approved fixes go through `atomic-commits`. Nothing is pushed or posted until you say so.

| Skill | Input | Report |
|---|---|---|
| `/devflow:self-review` | The built-in `/code-review` on your PR, unpushed commits, or `<default branch>...HEAD` | `.devflow/reviews/review_<slug>_<YYYYMMDD>.md` |
| `/devflow:address-pr-comments` | Inline threads, review bodies, and general comments on a PR | `.devflow/reviews/review_pr<n>_<YYYYMMDD>.md` |

Both skills are safe to re-run on the same target. A re-run reuses the newest report, adds a `## Round <n>` note, and adds no duplicate rows, commits, or replies. Thread replies state only facts: `**Fixed** in <sha>: <what changed>. <file>:<line>`, or `**Rejected**: <reason>`.

## Rollback

```bash
claude plugin uninstall devflow@sdlc-tools --scope local
```
