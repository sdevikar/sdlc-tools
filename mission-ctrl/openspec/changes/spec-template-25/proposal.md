# Proposal: Spec Template for Design Propose

## Why

`design-propose` accepts a free-form `digest`. The AI writes whatever it thinks
is relevant. In practice, designs omit testing decisions, skip out-of-scope
boundaries, and vary in structure across specs. A reviewer cannot compare two
specs because they use different layouts.

## Prerequisites

None.

## What Changes

**`design-propose/SKILL.md` — new template requirement:**

The updated SKILL.md instructs the AI to write the `digest` in six required
sections. All six must have at least one sentence before calling `design-propose`.

Sections: **Problem Statement** (what the user experiences today),
**Solution** (what the spec delivers, user perspective), **Implementation
Decisions** (data models, module boundaries, API contracts, failure modes — no
file paths or raw code except where a snippet encodes a decision), **Testing
Decisions** (what to test, how, which existing patterns to follow), **Out of
Scope** (explicit list even if short), **Open Questions** (write "none" if
truly empty).

The SKILL.md instructs the AI to call out any missing section before submitting
— not as a blocker, but as a warning the user must acknowledge.

**No schema changes:** `DesignProposeInput.digest` remains `str`. The template
is enforced through the prompt (SKILL.md), not the data model.

## Non-goals

- Not conflicting with `design-gate-enrichment-22` — that proposal adds
  `key_choices`, `risks`, `open_questions` as separate structured lists. This
  proposal defines the narrative structure of `digest` itself. They are additive.
- Not a migration — existing specs with unstructured digests are not touched.
- Not a schema validator — a digest that does not follow the template still passes
  schema validation.

## Impact

- `packages/claude-plugin/skills/design-propose/SKILL.md` — add template, add
  section-completeness check
- No Python changes

## Done When

- [ ] `design-propose/SKILL.md` contains the six-section template
- [ ] A `design-propose` call on a fresh spec produces a digest with all six sections populated
- [ ] If the AI omits a section, it surfaces a warning and waits for acknowledgment before calling `design-propose`
- [ ] Existing contract tests pass unchanged (schema is unchanged)
