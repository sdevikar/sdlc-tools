# Proposal: Spec Template for Design Propose

**ID:** `spec-template-25`  
**Status:** 🔲 Planned  
**Depends on:** none  

## Why

`design-propose` accepts a free-form `digest`. The AI writes whatever it thinks is relevant. In practice, designs omit testing decisions, skip out-of-scope boundaries, and vary in structure across specs. A reviewer cannot compare two specs because they use different layouts.

Matt Pocock's `to-spec` skill produces specs in a fixed six-section template. Every spec written by that skill answers the same questions in the same order. This proposal brings that template to `design-propose`.

## What Changes

**`design-propose/SKILL.md` — new template requirement**  
The updated SKILL.md instructs the AI to write the `digest` in the following six sections. All six are required. The AI must write at least one sentence in each section before calling `design-propose`.

```
## Problem Statement
What the user experiences today that this spec fixes.

## Solution
What the spec delivers. Written from the user's perspective.

## Implementation Decisions
Key technical decisions: data models, module boundaries, API contracts, failure modes.
No file paths or raw code snippets (exception: code that encodes a decision, e.g. a schema).

## Testing Decisions
What to test, how to test it, and which existing test patterns to follow.

## Out of Scope
Explicit list of things this spec does not do. Required even if the list is short.

## Open Questions
Anything not yet settled. Empty list is acceptable; write "none" if truly empty.
```

The SKILL.md also instructs the AI to call out any missing section before submitting — not as a blocker, but as a warning the user must acknowledge.

**No schema changes**  
`DesignProposeInput.digest` remains `str`. The template is enforced through the prompt (SKILL.md), not the data model. This keeps the schema stable and avoids breaking the existing contract test.

## What This Is Not

- Not conflicting with `design-gate-enrichment-22` — that proposal adds `key_choices`, `risks`, and `open_questions` as separate structured lists extracted from the design. This proposal defines the narrative structure of `digest` itself. They are additive.
- Not a migration — existing specs with unstructured digests are not touched. The template applies to new `design-propose` calls.
- Not a schema validator — a digest that does not follow the template still passes schema validation. The enforcement is in the prompt.

## Impact

- `packages/claude-plugin/skills/design-propose/SKILL.md` — add template, add section-completeness check
- No Python changes.

## Done When

- [ ] `design-propose/SKILL.md` contains the six-section template
- [ ] A `design-propose` call on a fresh spec produces a digest with all six sections populated
- [ ] If the AI omits a section, it surfaces a warning and waits for acknowledgment before calling `design-propose`
- [ ] Existing contract tests pass unchanged (schema is unchanged)
