import { expect, test } from 'claude-code/testing'

const BAND = {
  plugin: 'session-band', surface: 'terminal', component: 'AbovePrompt',
  props: { hasSurvey: false, isWorking: false, maxRows: 12, bodyColumns: 80, scroll: { offset: 0, bodyRows: 11 }, view: {} },
} as const
const POINTER = 'Last session: Built it.\nNext: Check it.\nHandoff: .devflow/handoffs/h.md. Run /devflow:pickup to continue.'

// The hooks here stand for the engine beneath the mod: session_start.py's output, then a plain band.
async function start($: any, on: any, out: object) {
  on('process.run', () => ({ value: { exitCode: 0, stdout: JSON.stringify(out), stderr: '' } }))
  on('session.start', (_: any, e: any) => ({ cwd: e.cwd }))
  on('ui.render', ($: any, e: any) => { const { Text } = $.ui.resolve(e); return <Text>engine</Text> })
  await $.session.start({ cwd: '/proj', surface: 'terminal', isInteractive: true })
  return $.ui.mount(BAND)
}
const engineOnly = async (ui: any) => expect((await ui.find({ type: 'Text' }))?.text).toBe('engine')

test('the card shows the pointer, and Hide removes it', async ($, on) => {
  const ui = await start($, on, { systemMessage: POINTER })
  expect(await ui.find({ type: 'Text', text: /Next: Check it/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /devflow:pickup to continue/ })).toBeDefined()
  await ui.press({ key: 'hide' })
  await engineOnly(ui)
})

test('running devflow:pickup removes the card', async ($, on) => {
  on('skill.prompt', (_: any, e: any) => ({ text: e.text }))
  const ui = await start($, on, { systemMessage: POINTER })
  expect(await ui.find({ type: 'Text', text: /Last session/ })).toBeDefined()
  await $.skill.prompt({ skill: 'devflow:pickup', text: 'pick up' } as any)
  await engineOnly(ui)
})

test('no open handoff draws no card', async ($, on) => {
  await engineOnly(await start($, on, { hookSpecificOutput: {} }))
})
