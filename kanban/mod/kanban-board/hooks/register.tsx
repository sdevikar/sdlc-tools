import type { Register } from 'claude-code'

const PANE = 'kanban-board'
const LANES = ['Not Started', 'In Progress', 'Archived'] as const

async function kanbanPath($: any): Promise<string> {
  const cwd = await $.session.cwd()
  return `${cwd}/docs/kanban.yaml`
}

const collapsed = { plugin: 'kanban-board', key: 'collapsed' } as const

type Entry = { id: string; summary: string; priority: number; lane: string }

function parseKanban(text: string): Entry[] {
  const entries: Entry[] = []
  let current: Partial<Entry> | null = null
  for (const line of text.split('\n')) {
    if (/^  - /.test(line)) {
      if (current?.id) entries.push(current as Entry)
      current = { priority: 99, summary: '' }
      const inline = line.match(/^  - (\w+):\s*(.*)$/)
      if (inline) {
        const v = inline[2].trim().replace(/^"|"$/g, '')
        if (inline[1] === 'id') current.id = v
      }
      continue
    }
    if (!current) continue
    const m = line.match(/^    (\w+):\s*(.*)$/)
    if (!m) continue
    const [, key, val] = m
    const v = val.trim().replace(/^"|"$/g, '')
    if (key === 'id') current.id = v
    else if (key === 'summary') current.summary = v
    else if (key === 'priority') current.priority = Number(v) || 99
    else if (key === 'lane') current.lane = v
  }
  if (current?.id) entries.push(current as Entry)
  return entries
}

function groupAndSort(entries: Entry[]): Record<string, Entry[]> {
  const groups: Record<string, Entry[]> = Object.fromEntries(LANES.map(l => [l, []]))
  for (const e of entries) {
    ;(groups[e.lane] ?? groups['Not Started']).push(e)
  }
  for (const lane of LANES) groups[lane].sort((a, b) => a.priority - b.priority)
  return groups
}

function renderInline(entries: Entry[]): string {
  const groups = groupAndSort(entries)
  const maxRows = Math.max(...LANES.map(l => groups[l].length), 0)
  const header = `| ${LANES.join(' | ')} |`
  const sep = `| ${LANES.map(() => '---').join(' | ')} |`
  const rows: string[] = []
  for (let i = 0; i < maxRows; i++) {
    const cells = LANES.map(lane => {
      const e = groups[lane][i]
      return e ? `${e.id}<br>${e.summary || '—'}` : ''
    })
    rows.push(`| ${cells.join(' | ')} |`)
  }
  return ['', header, sep, ...rows].join('\n')
}

const KANBAN_COMMANDS = ['kanban-sync', 'kanban-render', 'opsx-archive', 'opsx-propose'] as const

async function invalidateIfOpen($: any) {
  const panes = await $.ui.panes()
  if (panes.some((p: any) => p.id === PANE)) $.ui.invalidate('ui.render')
}

export const register: Register = on => {
  on('tool.call', { tool: 'Write' }, async ($, e, next) => {
    const result = await next(e)
    if (e.file_path.includes('kanban.yaml')) await invalidateIfOpen($)
    return result
  })

  on('tool.call', { tool: 'Edit' }, async ($, e, next) => {
    const result = await next(e)
    if (e.file_path.includes('kanban.yaml')) await invalidateIfOpen($)
    return result
  })

  for (const cmd of KANBAN_COMMANDS) {
    on('command.run', { command: cmd }, async ($, e, next) => {
      const result = await next(e)
      await invalidateIfOpen($)
      return result
    })
  }

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'kanban-view',
      description: 'Open the kanban board pane (or print inline in non-fullscreen)',
    })
    return next(e)
  })

  on('command.run', { command: 'kanban-view' }, async ($, e) => {
    const opened = await $.ui.open({ id: PANE, title: 'Kanban', closeOnEscape: true, focus: true })
    if (!opened.isPlaced) {
      const text = await $.fs.read(await kanbanPath($))
      return { text: `> ${opened.reason}\n\n` + renderInline(parseKanban(text)) }
    }
    const hint = e.presentation.isFullscreen
      ? ''
      : '\n> Side pane needs fullscreen. Run `/tui fullscreen` or start Claude with `CLAUDE_CODE_NO_FLICKER=1`.'
    return { text: 'Kanban board pane opened.' + hint }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    const { value: isCollapsed = false } = await $.state.get(collapsed)

    let entries: Entry[] = []
    try {
      const text = await $.fs.read(await kanbanPath($))
      entries = parseKanban(text)
    } catch {
      return (
        <Box>
          <Text color="red">Could not read docs/kanban.yaml</Text>
        </Box>
      )
    }

    const groups = groupAndSort(entries)

    return (
      <Box flexDirection="column" paddingX={1}>
        <Text dimColor>x close · c collapse · ctrl+x tab focus</Text>
        <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
          <Button
            hotkey="c"
            onPress={async () => {
              const held = await $.state.get(collapsed)
              await $.state.set(collapsed, !(held.value ?? false), { ifVersion: held.version })
            }}
          >
            {isCollapsed ? 'Expand' : 'Collapse'}
          </Button>
          <Button
            hotkey="x"
            onPress={() => { $.ui.close({ id: PANE }) }}
          >
            Close
          </Button>
        </Box>
        {LANES.map(lane => (
          <Box key={lane} flexDirection="column" marginBottom={1}>
            <Text bold>{lane}</Text>
            {!isCollapsed && groups[lane].map(entry => (
              <Box key={entry.id} marginLeft={1} flexDirection="column">
                <Text>{entry.id}</Text>
                {entry.summary ? <Text dimColor>{entry.summary}</Text> : null}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    )
  })
}
