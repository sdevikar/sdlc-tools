# Spec Delta

## Purpose

Lets a new session find the current handoff for the branch without a pasted path, and check the handoff against the git state before work continues.

## ADDED Requirements

### Requirement: Current handoff lookup
The current handoff SHALL be the file in `docs/handoffs/` whose `branch` matches the current branch and whose `status` is not `done`, with the newest timestamp in its file name.

#### Scenario: Two open handoffs and one done
- **WHEN** branch `feat/x` has handoffs at 0900 and 1400 that are `in-progress` and one at 1600 that is `done`
- **THEN** the lookup returns the 1400 file

#### Scenario: Other branch
- **WHEN** no handoff matches the current branch
- **THEN** the lookup returns nothing

### Requirement: Session-start pointer
On session `startup`, `clear`, and `resume`, the plugin SHALL show one line with the handoff path, its `next` value, and the pickup command. It SHALL show it to Claude as context and to the user as a message. It SHALL NOT inject the handoff body.

#### Scenario: Handoff exists
- **WHEN** a session starts on a branch with a current handoff
- **THEN** the user sees one line that names the file and `/devflow:pickup`

#### Scenario: No handoff or no git repo
- **WHEN** a session starts outside a git repo, or no handoff matches
- **THEN** the hook prints nothing and exits with code 0

#### Scenario: Compaction
- **WHEN** the session compacts
- **THEN** the hook does not run

### Requirement: Drift check
The `pickup` skill SHALL compare the handoff frontmatter with git: branch, HEAD, uncommitted changes, and ahead or behind the remote. It SHALL report each difference in a plain sentence.

#### Scenario: New commit since the handoff
- **WHEN** HEAD has one commit that is not in the handoff `head`
- **THEN** pickup reports that HEAD moved by one commit and names it

### Requirement: Confirm before continuing
After the drift check, `pickup` SHALL list the handoff next steps and wait for the user to confirm before it starts any of them.

#### Scenario: Pickup output
- **WHEN** pickup finishes the drift check
- **THEN** it lists the next steps and asks which one to start

### Requirement: Explicit path
When the user passes a handoff path, `pickup` SHALL use that file and skip the lookup.

#### Scenario: Path argument
- **WHEN** the user runs `/devflow:pickup docs/handoffs/handoff_topic_20261101-0900.md`
- **THEN** pickup reads that file, even if a newer handoff exists
