import { test, expect } from 'claude-code/testing'

test('kanban-view hint shown in classic renderer', async ($, on) => {
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  const result = await ($ as any).command.run({
    command: 'kanban-view',
    presentation: { isFullscreen: false, columns: 120 },
  })
  expect(result.text).toContain('/tui fullscreen')
})

test('kanban-view hint absent in fullscreen renderer', async ($, on) => {
  on('ui.open', async () => ({ value: { isPlaced: true } }))
  const result = await ($ as any).command.run({
    command: 'kanban-view',
    presentation: { isFullscreen: true, columns: 220 },
  })
  expect(result.text).not.toContain('/tui fullscreen')
})
