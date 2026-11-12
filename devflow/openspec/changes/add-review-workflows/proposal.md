# Proposal

## Why

Review triage is the user's most frequent workflow, in about 30 of 150 sessions in `genai-plugins-ad-data`. It runs in two forms: a self-review before or after a push, and a response to reviewer comments on a PR. The steps live in CLAUDE.md and in typed prompts, and report locations drifted across four folders. Two skills with one shared loop make the steps repeatable and safe to re-run.

## What Changes

- Add a shared review loop: verify each finding, check it against earlier decisions, write one report table, rate each fix, stop for approval, fix with `atomic-commits`, and update the report.
- Add a `self-review` skill. It picks a target, suggests an effort level, runs the built-in `/code-review`, and feeds the findings into the loop.
- Add an `address-pr-comments` skill. It checks branch sync, fetches all three kinds of PR comments, feeds them into the loop, and drafts thread replies that it posts only after approval.
- Make both skills safe to re-run on the same target: one report per target, no duplicate rows, no duplicate replies.

## Capabilities

### New Capabilities
- `review-triage`: the shared loop, report format, ratings, approval gate, and re-run rules.
- `self-review`: running a review of the user's own change and triaging its findings.
- `pr-comment-response`: triaging reviewer comments on a PR and replying in the threads.

### Modified Capabilities

None.

## Impact

- New files: `references/review-loop.md`, `skills/self-review/SKILL.md`, `skills/address-pr-comments/SKILL.md`. `README.md` gets a section.
- Uses `superpowers:receiving-code-review` (dependency from `add-plugin-scaffold-and-atomic-commits`), the built-in `/code-review`, `gh`, and devflow `atomic-commits`.
- Posts to GitHub only after the user approves each batch of replies.
- After this works, the review sections of CLAUDE.md become one-line pointers to these skills.
