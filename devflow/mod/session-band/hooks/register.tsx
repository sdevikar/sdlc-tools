import type { Register } from 'claude-code'

const ACCENT = '#d97757'
const MUTED = '#87867f'

// shortcut: module variables reset on a hot reload, and session.start runs again then;
// $.state would need a contract keyed by the plugin name, which differs here (devflow) and under test (session-band).
let lines: string[] = []
let isHidden = false

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    try {
      // session_start.py prints the pointer as `systemMessage`: the same lines Claude reads.
      const { stdout } = await $.process.run(
        ['python3', `${$.plugin.root}/scripts/session_start.py`],
        { stdin: JSON.stringify({ cwd: e.cwd }), timeoutMs: 5000 },
      )
      const note: string = stdout.trim() ? (JSON.parse(stdout).systemMessage ?? '') : ''
      lines = note.split('\n').filter(Boolean)
    } catch {
      lines = []
    }
    $.ui.invalidate('ui.render')

    return next(e)
  })

  on('skill.prompt', { skill: 'devflow:pickup' }, ($, e, next) => {
    isHidden = true
    $.ui.invalidate('ui.render')

    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, ($, e, next) => {
    if (e.props.hasSurvey || isHidden || lines.length === 0) {
      return next(e)
    }
    const { Box, Button, Text } = $.ui.resolve(e)
    const [first, ...rest] = lines

    return (
      <Box flexDirection="column" width={e.props.bodyColumns}
           borderStyle="round" borderColor={ACCENT} paddingX={1}>
        <Box flexDirection="row" justifyContent="space-between">
          <Text wrap="truncate-end">
            <Text bold inverse color={ACCENT}> HANDOFF </Text> {first}
          </Text>
          <Button key="hide" label="Hide"
                  onPress={() => { isHidden = true; $.ui.invalidate('ui.render') }} />
        </Box>
        {rest.map(line => <Text color={MUTED} wrap="truncate-end">{line}</Text>)}
      </Box>
    )
  })
}
