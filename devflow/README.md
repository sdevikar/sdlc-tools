# devflow

A Claude Code plugin that wires your commit, handoff, and review workflows into every project where you install it.

## The workflow

Without devflow, an AI coding session has no memory of previous sessions, no rules about how commits are structured, and no process for handling review feedback. You type the same instructions into every prompt.

devflow changes that by composing three loops that run automatically:

**Commit loop** — before any code is written, `/atomic-commits` proposes a commit plan and waits for approval. It enforces merge rules (config and the code that reads it belong together; a refactor and a bug fix do not), runs a volume check, and offers a combine pass before a push. Each commit is reviewed before the next one starts.

**Session loop** — at the start of every session, a hook prints a one-line pointer to the latest handoff. `/handoff` saves the session state; `/pickup` restores it. No context is lost across compactions or restarts.

**Review loop** — `/self-review` runs the built-in code review, verifies each finding against the code, checks earlier decisions in handoffs and commit history, rates each proposed fix by blast radius and reversibility, and waits for your approval tier by tier before changing anything. `/address-pr-comments` does the same for GitHub review threads.

The three loops compose: a task starts with a commit plan, produces handoffs as it progresses, and ends with a review before the branch is pushed.

## What makes this stick

The value is not any single skill — it is the encoded process rules. The merge test, the approval gates, the report format, the rating rubric, the decision that an earlier handoff overrides a reviewer's finding — these are specific, tested rules that live in the skills, not in a prompt you retype each session. Install devflow once per project and the rules travel with the repo.

The plugin brings `superpowers` and `ponytail` as dependencies. `superpowers` provides the receiving-code-review and executing-plans contexts the review loop calls. `ponytail` enforces simplicity discipline on code the commit loop produces.

## Install

Run `/setup` in a Claude Code session inside the project. It checks for conflicts, registers the marketplace, and installs the plugin.

Or manually:

```bash
# One time — register the marketplace
claude plugin marketplace add qcom-all-gh-users/devflow

# Per project
claude plugin install devflow@devflow --scope local
```

If you already have `superpowers` or `ponytail` installed from a **different** marketplace, uninstall them first. `/setup` checks this for you.

## Skills

| Skill | Loop | What it does |
|---|---|---|
| `setup` | — | Conflict check, marketplace registration, install |
| `atomic-commits` | Commit | Plan → approve → commit → review, one unit at a time |
| `handoff` | Session | Save session state to a dated file |
| `pickup` | Session | Restore from the latest handoff |
| `self-review` | Review | Run, verify, rate, and gate-approve fixes from a code review |
| `address-pr-comments` | Review | Fetch, verify, rate, and gate-approve fixes from PR review threads |

> `self-review` and `address-pr-comments` ship in the next release.

## Handoff and pickup

`/handoff` writes the session state to `docs/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md` in the project root. On a feature branch, `<slug>` is the branch name with `/` changed to `-`. On `main`, it is a short topic. The file starts with frontmatter (`branch`, `head`, `base`, `pr`, `status`, `next`), so tools can find it without a pasted path.

When a session starts, clears, or resumes, a hook prints one line. The line names the newest handoff for the current branch whose `status` is not `done`, and its `next` step. Run `/devflow:pickup` to read that handoff, check it against git, and choose the next step. Pass a path to pick up a specific file: `/devflow:pickup docs/handoffs/<file>.md`.

Keep `docs/` in `.gitignore`. `/handoff` warns you if git does not ignore the path. The hook needs `python3` on `PATH`.

## Rollback

```bash
claude plugin uninstall devflow@devflow --scope local
```
