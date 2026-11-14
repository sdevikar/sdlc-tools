import { test, expect } from 'claude-code/testing'

test('init command opens no setup dialog', async ($, on) => {
  const opens: string[] = []
  on('ui.open', async (_$: any, e: any) => { opens.push(e.id); return { isPlaced: true } })
  await $.command.run({ name: 'init' } as any).catch(() => {})
  expect(opens.includes('kanban-setup-dialog')).toBe(false)
})

test('setup tool returns convert-needed for unrecognized kanban.yaml', async ($, on) => {
  // In tests $.tool.register is unavailable, so setupTool stays ''.
  // Calling with tool:'' reaches the setup handler via the e.tool !== setupTool check.
  on('session.cwd', async () => ({ value: '/proj' }))
  on('fs.read', async () => ({ value: '# legacy format\n- item1\n' }))
  const result = await ($ as any).tool.call({ tool: '' })
  expect(result.result).toBe('convert-needed')
})
