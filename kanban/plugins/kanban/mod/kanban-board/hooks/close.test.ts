import { test, expect } from 'claude-code/testing'

test('Close button reaches ui.close', async ($, on) => {
  const closes: unknown[] = []
  on('session.cwd', async () => ({ value: '/proj' }))
  on('fs.read', async () => ({ value: 'entries:\n  - id: a\n    lane: Not Started\n    priority: 1\n' }))
  on('ui.close', async (_$: any, e: any) => { closes.push(e); return { value: undefined } })
  const pane = await $.ui.mount({
    plugin: 'kanban-board', surface: 'terminal', component: 'Pane', requestId: 'kanban-board',
    props: { title: 'Kanban', isFocused: false, bodyColumns: 60, placement: 'inline' } as any,
  })
  // press({ key: 'Close' }) covers both click and the x hotkey — the kit routes both through ui.press
  await pane.press({ key: 'Close' } as any)
  expect(closes.length).toBe(1)
  expect((closes[0] as any).id).toBe('kanban-board')
})
