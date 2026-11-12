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

> `handoff`, `pickup`, `self-review`, and `address-pr-comments` ship in the next two releases.

## Rollback

```bash
claude plugin uninstall devflow@devflow --scope local
```
