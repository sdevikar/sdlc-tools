# Design

## Context

The `ui.render` hook uses `{ Box, Text, Button }` from `$.ui.resolve(e)`. `Text` accepts `color`, `bold`, and `dimColor` props. The lane name is a string key from `LANES`.

## Goals / Non-Goals

**Goals:**
- Color-code lane headers using a static map keyed by lane name
- Render each entry as a two-row card: ID + priority badge (bold), summary (dimColor)
- Add a `Text dimColor` divider (`─`.repeat(20)) under each lane header

**Non-Goals:**
- Changing entry data or sort order
- Inline-render styling (this change only affects the pane render)

## Decisions

**Lane color map**: Use a constant inside the render function:
```ts
const LANE_COLORS: Record<string, string> = {
  'Not Started': 'cyan',
  'In Progress': 'yellow',
  'Archived': 'gray',
}
```
`'gray'` maps to a dimmed style — combine with `dimColor` prop for Archived.

**Priority badge**: Render as `[${entry.priority}]` in `dimColor` on the same line as the ID using a `Box flexDirection="row"` with a small gap.

**Divider**: A `<Text dimColor>{'─'.repeat(24)}</Text>` line between the header and the entries list.

## Risks / Trade-offs

Color support depends on the terminal's color capability. The mod uses Ink primitives which respect the terminal's capabilities automatically — no fallback needed.
