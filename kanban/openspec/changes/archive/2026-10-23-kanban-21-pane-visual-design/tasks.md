# Tasks

## 1. Add lane color map

- [x] 1.1 In `mod/kanban-board/hooks/register.tsx`, add a `LANE_COLORS` constant above the render function: `{ 'Not Started': 'cyan', 'In Progress': 'yellow', 'Archived': 'gray' }`.

## 2. Update lane header rendering

- [x] 2.1 Change the lane header `<Text bold>{lane}</Text>` to `<Text bold color={LANE_COLORS[lane] ?? 'white'}>{lane}</Text>`. For "Archived", also add `dimColor`.
- [x] 2.2 Add a `<Text dimColor>{'─'.repeat(24)}</Text>` line immediately after the lane header and before the entries list.

## 3. Update entry card rendering

- [x] 3.1 Replace the single `<Text>{entry.id}</Text>` with a `<Box flexDirection="row" gap={1}>` containing `<Text bold>{entry.id}</Text>` and `<Text dimColor>[{entry.priority}]</Text>`.
- [x] 3.2 Keep the existing `{entry.summary ? <Text dimColor>{entry.summary}</Text> : null}` line unchanged (it already has `dimColor`).

## 4. Deploy and verify

- [x] 4.1 Copy updated `register.tsx` to the deployed mod path: `~/.claude/dev-mods/<uuid>/kanban-board/hooks/register.tsx`.
- [x] 4.2 Reload the mod and run `/kanban-view`. Confirm lane headers are colored (cyan/yellow/dim) and each entry shows a bold ID with a bracketed priority and dim summary.
