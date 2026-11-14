# Proposal

## Why

The kanban-board pane renders all content in plain white text with no color or visual hierarchy. Lane headers, entry IDs, and summaries are visually identical. The board is hard to scan at a glance.

## What Changes

- Apply distinct colors to each lane header: cyan for "Not Started", yellow for "In Progress", dim/gray for "Archived".
- Render each entry as a card: a colored top-border line, bold ID, and dimmed summary below it.
- Add a priority badge (the numeric value) rendered in dim text beside the entry ID.
- Separate lanes with a blank line and add a divider character under each lane header.

## Capabilities

### New Capabilities

- `pane-visual-design`: Color-coded lanes, card-style entries, and priority badges in the kanban-board pane.

### Modified Capabilities

*(none)*

## Impact

- Modifies: `mod/kanban-board/hooks/register.tsx` (repo copy and deployed copy)
- No data-format or behavior changes; pure rendering change
