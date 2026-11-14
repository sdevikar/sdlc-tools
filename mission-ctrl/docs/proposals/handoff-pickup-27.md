# Proposal: Deterministic Handoffs and Session Pickup

**ID:** `handoff-pickup-27`  
**Status:** ❌ Rejected (2026-11-14). devflow ships `/devflow:handoff`, `/devflow:pickup`, and the session-start handoff pointer.  
**Depends on:** none  

## Why

Work on one branch spans many short sessions. Session analysis of `genai-plugins-ad-data` (150 sessions, 2026-10-13 to 2026-11-12) showed a median of 2 typed prompts per session, `/clear` in 91 sessions, and 28 sessions that open with "Start with <handoff>". Handoff docs are the link between sessions, but they land in different folders with free-form names. A new session cannot find the right handoff without the user pasting its path.

## What Changes

**Deterministic handoff location and name**  
`<project_root>/docs/handoffs/handoff_<slug>_<YYYYMMDD-HHMM>.md`. `<slug>` is the branch name with `/` changed to `-`. On `main`, `master`, or a detached HEAD, `<slug>` is a short topic slug. The newest timestamp for a slug is the current handoff.

**Machine-readable frontmatter**  
`branch`, `head` (commit SHA), `base`, `pr` (URL or empty), `status` (`in-progress` or `done`), `next` (one line). The time comes from the file name. A tool can parse these fields without reading the body.

**Pickup at session start**  
A `SessionStart` hook (`startup`, `clear`, `resume`) finds the newest handoff for the current branch whose status is not `done`. It injects only a pointer (path, time, `next`), not the document, to keep context small.

**Pickup skill**  
Reads the handoff, compares the git state with the frontmatter (branch, HEAD, uncommitted changes, ahead or behind the remote), reports any drift, and lists the next steps. Must not be named `resume`, because that clashes with the built-in `/resume`.

## What This Is Not

- Not a dependency for other tools. A separate plugin (`devflow`, in development) implements the same convention without mission-ctrl. mission-ctrl can adopt the convention or replace it with its own recap store.
- Not a handoff index file. The file name and frontmatter are enough.
