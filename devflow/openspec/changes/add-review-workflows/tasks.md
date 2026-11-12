# Tasks

## 1. Shared loop

- [ ] 1.1 Write `references/review-loop.md` from the `review-triage` spec (verify, earlier decisions, report table and IDs, ratings, Not ready, approval gate, implement, update, quick-glance, re-run rules) and verify every spec requirement maps to a section

## 2. Skills

- [ ] 2.1 Write `skills/self-review/SKILL.md` from the `self-review` spec and verify `claude plugin validate ~/personal/devflow` passes with no warnings
- [ ] 2.2 Write `skills/address-pr-comments/SKILL.md` from the `pr-comment-response` spec and verify `claude plugin validate` still passes
- [ ] 2.3 Add a review section to `README.md` and verify it names both skills and the report paths

## 3. Live checks (after user approval)

- [ ] 3.1 Run `/devflow:self-review` on a small diff in `genai-plugins-ad-data`, and verify the report appears after the background review returns
- [ ] 3.2 Re-run it, and verify the report gains a Round note and no duplicate rows
- [ ] 3.3 Run `/devflow:address-pr-comments` on a PR with comments, and verify the report and the reply drafts appear, each draft is only a `**Fixed**` or `**Rejected**` line in the spec format, and nothing is posted

## Workflow follow-up

- Commit as `feat: add self-review and address-pr-comments skills`.
- Archive after the other two changes.
- After the live checks pass, ask the user to approve one-line pointers in CLAUDE.md in place of the review sections.
