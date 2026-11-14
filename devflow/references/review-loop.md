# Review loop

Shared by `devflow:self-review` and `devflow:address-pr-comments`. The calling
skill gives the loop three inputs:

- **Findings** — from `/code-review` or from PR comments.
- **IDs** — `[c<root comment id>]` for an inline thread, `[v<review id>]` for a
  review body, `[g<comment id>]` for a general PR comment, `[r<n>]` for a
  self-review finding.
- **Report path** — set by the calling skill.

Run the steps in order. Do not skip the approval gate.

---

## 1. Re-run check

If the report path already exists, this is a re-run. Read the report first.

- Skip a finding whose ID already has a row. Exception: an inline thread with
  a reviewer comment newer than the user's last reply in it. Update that row
  instead of adding one.
- For `[r<n>]` findings, match by file and issue, not by line. The same issue
  at a moved line is the same row.
- Do not re-apply a fix whose commit is in history:
  `git merge-base --is-ancestor <sha> HEAD` exits 0.
- At the end of the report, add `## Round <n>` (the next number). In one or
  two sentences, say what is new in this round. If nothing is new, say "No new
  findings or comments." Then add no rows and make no commits.

## 2. Verify each finding

Load `superpowers:receiving-code-review` and follow it. For each finding:

- Read the code it points to. Check the claim against the code and the current
  docs (web search for library or tool behavior).
- If reading cannot settle a claim about runtime behavior, run a test or a
  command. Cite its output in `Validity`.
- If a finding is unclear, ask about it before you rate or fix anything.

## 3. Check earlier decisions

Search for a decision that covers the same choice:

- Handoffs in `.devflow/handoffs/`.
- OpenSpec changes in `openspec/changes/` (`design.md`, specs).
- Commit messages: `git log --oneline --grep=<keyword>` and `git log -S<code>`.

When a decision conflicts with a finding, mark the finding `not valid` and cite
the decision by path or SHA. Keep a list of these findings for the approval
step.

## 4. Write the report table

If `.devflow/reviews/` is missing in the project root, create it. If
`.devflow/.gitignore` is missing, create it with the single line `*`.

Write one table with **exactly** these columns, in this order. Do not add,
rename, or split columns.

| Finding | Context | Validity | Proposed solution | Ready to implement |
|---|---|---|---|---|

- `Finding` — starts with the ID, then the finding in one sentence.
- `Context` — what the finding means, for a reader who never saw the code,
  design, or docs.
- `Validity` — `valid`, `partly valid`, or `not valid`, with the evidence.
- `Proposed solution` — the fix, or "No change" with the reason.
- `Ready to implement` — `yes`, or `no` with the reason.

## 5. Rate each proposed fix

Below the report table, add a ratings table for every row with a fix. Put both
legends above it.

| Score | Meaning |
|---|---|
| 0 | Small, safe, easy to verify |
| 1 | Moderate |
| 2 | Large, risky, or hard to undo |

| Tier | Total | Required action |
|---|---|---|
| Low | 0–3 | Approve the whole batch at once |
| Medium | 4–7 | Review each diff before allowing a push |
| High | 8+ (or any 2 in Blast radius, Reversibility, or Sensitive area) | Discuss the approach before any code is written |

| ID | Impact | Size | Complexity | Blast radius | Reversibility | Confidence | Sensitive area | Total | Tier |
|---|---|---|---|---|---|---|---|---|---|

A higher score always means more risk:

- **Impact** — how much behavior the fix changes.
- **Size** — how many lines and files the fix touches.
- **Complexity** — how hard the fix is to reason about.
- **Blast radius** — how far a mistake spreads. Shared CI, build, or config
  used by other repos is 2.
- **Reversibility** — 0 for a plain revert, 2 for data, schema, or published
  changes.
- **Confidence** — 0 when the fix is verified, 2 when it is a guess.
- **Sensitive area** — 2 for security, auth, secrets, money, or data loss.

Add the seven scores for the total. A 2 in Blast radius, Reversibility, or
Sensitive area forces High, whatever the total.

## 6. List what is not ready

Below the tables, add `## Not ready`. For each row marked `no`, name the
blocker and what would clear it. If a question blocks it, name the question
and who must answer it.

## 7. Approval gate

Stop and ask which items to implement. Group the items by tier, and state each
tier's required action. List the findings marked `not valid` because of an
earlier decision under a separate **Conflicts with earlier decisions** heading,
so the user can override them.

**Do not change code before the user answers, even when every row is ready.**

## 8. Implement and record

Implement only the approved items, through `devflow:atomic-commits`. For a High
item, agree on the approach before the commit plan.

After the commits, add `Status` and `Commit` columns to the end of the report
table. `Status` is `fixed`, `rejected`, `not approved`, or `blocked`. `Commit`
is the short SHA, or empty.

**Do not push unless the user asks.**

## 9. Quick-glance close

End every review response with this table, one line per finding:

| # | Finding | Validity | Status / Ready |
|---|---|---|---|

The `#` column holds the finding ID. Keep each cell short.
