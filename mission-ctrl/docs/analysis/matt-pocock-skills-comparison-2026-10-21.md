# Comparison: mission-ctrl vs. Matt Pocock's Skills Repo

**Date:** 2026-10-21  
**Question answered:** Can mission-ctrl benefit from Matt Pocock's skills setup? How well do their goals align? What does each do better?

---

## What each project is

**mission-ctrl** is a Claude Code plugin built for this repo (and other projects). It keeps AI-assisted coding sessions on-track by enforcing three rules: work from a backlog, get design approved before writing code, and resume with a recap after time away. It uses two mechanisms: slash commands (skills) you call manually, and hooks that run automatically in the background.

**Matt Pocock's skills repo** is a collection of slash commands for Claude Code (and other AI coding tools). It provides a structured workflow for planning a feature before any code is written. You answer questions about your idea (grilling), produce a written spec (to-spec), break it into tickets (to-tickets), and then implement. The `wayfinder` skill handles large, multi-session efforts by building a decision map on an issue tracker.

**Definitions used in this report:**
- **Skill / slash command**: A named command (e.g., `/to-spec`) that tells the AI to follow a specific workflow.
- **Hook**: Code that runs automatically at fixed moments, such as when a session starts or when you submit a message. You do not have to call it manually.
- **Backlog**: A prioritized list of ideas not currently being worked on.
- **Spec**: A written plan that describes what a feature does and how to build it. Code cannot be written until the spec is approved.
- **Vertical slice**: A small unit of work that is complete end-to-end — it touches every layer of the system (database, logic, UI) and can be demonstrated on its own.

---

## How their goals compare

Both projects share one belief: AI assistants go off-course without structure. But they target different moments in the development process.

Matt's skills focus on the **planning phase**. You use them before you write a single line of code. They help you settle questions, produce a spec, and create tickets. The AI acts as a facilitator that asks you hard questions and writes things down.

mission-ctrl focuses on the **in-session phase**. You use it during active development. It enforces the rules your past self already agreed to (backlog, design gates, constraints) and prevents the AI from drifting into unplanned work mid-session.

The two systems are not competitors. They address adjacent problems. Matt's system answers "what should we build and how?" mission-ctrl answers "are we still building what we said we would?"

---

## What Matt's system does better

**1. Issue tracker integration**  
Matt's skills write tickets directly to GitHub, Linear, or a local folder. A single config file (`docs/agents/issue-tracker.md`) tells every skill where issues live and what labels to use. No skill contains hard-coded tracker logic. mission-ctrl has an internal backlog stored in `.mission/backlog.json`, but it has no way to sync with an external issue tracker.

**2. Vertical slice ticket sizing**  
The `to-tickets` skill enforces a discipline: each ticket must be independently demoable, correctly sequenced by dependency, and small enough to finish in one session. mission-ctrl creates specs but does not slice them into tickets with this level of rigor.

**3. Structured Q&A before design**  
The `grilling` skill maps every decision as a branching tree and asks all open questions in one round. It distinguishes between facts the AI can look up itself and decisions only the human can make. This surfaces hidden assumptions before any design is committed. mission-ctrl's `design-propose` skill does not have an equivalent structured interview step.

**4. Spec template**  
`to-spec` produces a spec in a fixed format: problem statement, solution, user stories, implementation decisions, testing decisions, out-of-scope. mission-ctrl's specs do not follow a required template.

---

## What mission-ctrl does better

**1. Automatic enforcement via hooks**  
Matt's skills are opt-in. You call them when you remember to. mission-ctrl uses hooks that fire without user action. When you open a session, it injects a recap automatically. When you type a message that looks like scope creep, it intercepts it before the AI acts. Matt's system has no equivalent to this.

**2. Persistent constraints**  
mission-ctrl tracks hard constraints (e.g., "No Node.js in the runtime path") in a file committed to git. These constraints are injected into every session automatically. If a plan would break a constraint, the system flags it. Matt's system has no concept of project-level constraints.

**3. MVP-first priority enforcement**  
mission-ctrl tracks which backlog items are MVP-critical and which are parked. The `/next` skill always recommends MVP-critical work first. Matt's system creates and tracks tickets but does not enforce a priority ordering at the AI-prompt level.

**4. Lives entirely inside Claude Code**  
mission-ctrl requires nothing outside Claude Code. No external service, no separate app, no CI step. Matt's system is designed to write tickets to an external tracker, which is more powerful but also requires that tracker to exist and be configured.

---

## Where the systems are different in a way that matters

Matt's system assumes you are starting from an idea and want to arrive at a plan. mission-ctrl assumes you already have a plan and want to stay on it. This difference in starting point means the two systems are complementary, not redundant.

A developer could use Matt's `grilling` + `to-spec` + `to-tickets` to produce a high-quality spec and ticket list, then use mission-ctrl to enforce that plan during implementation.

---

## Concrete things mission-ctrl can borrow

**High value:**

1. **Issue tracker config file pattern** — Create a `docs/agents/issue-tracker.md` file that mission-ctrl reads to know where to push backlog items. This lets the internal `.mission/backlog.json` sync with GitHub or Linear without changing skill code. Each project configures its own tracker; the skills stay generic.

2. **Spec template** — Adopt Matt's spec template format for mission-ctrl's `design-propose` output. Specifically: problem statement, solution, user stories, implementation decisions, testing decisions, out-of-scope. This makes specs more complete and easier to review.

3. **Structured design Q&A** — Before `design-propose` writes a spec, add a grilling-style step: the AI asks all open questions (one round, all at once), the user answers, then the spec is written. This replaces the current free-form "propose a design" step with a more rigorous one.

**Medium value:**

4. **Vertical slice ticket sizing** — When a spec moves from `design_approved` to `in_progress`, add a step that breaks the spec into vertical slices before implementation begins. This is similar to Matt's `to-tickets` step and would prevent large specs from becoming one massive untracked blob of work.

**Low priority (not a fit):**

5. **Wayfinder** — Wayfinder is for large, multi-session efforts that are still foggy. mission-ctrl's users already have a backlog and active spec. Wayfinder targets a phase earlier than where mission-ctrl operates.

---

## Summary table

| Capability | Matt's skills | mission-ctrl |
|---|---|---|
| Plan a feature from scratch | ✅ Strong (grilling → spec → tickets) | ❌ Not in scope |
| Enforce a plan during coding | ❌ Not present | ✅ Strong (hooks + backlog-first) |
| Issue tracker integration | ✅ GitHub, Linear, local | ❌ Internal only |
| Constraint tracking | ❌ Not present | ✅ `.mission/constraints.json` |
| MVP-first priority | ❌ Not present | ✅ Enforced by `/next` |
| Spec template | ✅ Fixed format | ❌ Free-form |
| Session recap | ❌ Manual `handoff` only | ✅ Automatic on session start |
| Automatic interception | ❌ All skills are opt-in | ✅ `on_before_send` hook |
| External dependencies | Requires issue tracker | None beyond Claude Code |
