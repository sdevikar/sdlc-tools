import { test, expect } from 'claude-code/testing'

test('init command opens no setup dialog', async ($, on) => {
  const opens: string[] = []
  on('ui.open', async (_$: any, e: any) => { opens.push(e.id); return { isPlaced: true } })
  await $.command.run({ name: 'init' } as any).catch(() => {})
  expect(opens.includes('kanban-setup-dialog')).toBe(false)
})
