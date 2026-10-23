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

const LANE_COLORS: Record<string, string> = {
  'Not Started': '#87867f',
  'In Progress': '#d97757',
  'Archived':    'gray',
}

const TEXT_COLORS: Record<string, string> = {
  'Not Started': 'black',
  'In Progress': 'black',
}

const LANE_ENTRY_BG: Record<string, string> = {
  'Not Started': '#87867f',
  'In Progress': '#d97757',
  'Archived':    '#gray',
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

const KANBAN_COMMANDS = ['kanban-sync', 'kanban-render'] as const

async function invalidateIfOpen($: any) {
  const panes = await $.ui.panes()
  if (panes.some((p: any) => p.id === PANE)) $.ui.invalidate('ui.render')
}

let archiveMtime = 0
let changesMtime = 0
const skippedFolders = new Set<string>()

async function checkArchiveFolder($: any) {
  const cwd = await $.session.cwd()
  try {
    const stat = await $.fs.stat(`${cwd}/openspec/changes/archive`)
    if (stat.mtimeMs === archiveMtime) return
    archiveMtime = stat.mtimeMs
  } catch {
    return
  }
  const result = await $.process.run(
    ['node', `${cwd}/libs/kanban-core/dist/src/cli.js`, 'archive-sync'],
    { cwd }
  )
  if (result.exitCode !== 0) {
    await $.ui.toast(`archive-sync: ${result.stderr.trim() || 'failed'}`)
  } else {
    await invalidateIfOpen($)
  }
}

async function checkChangesFolder($: any) {
  const cwd = await $.session.cwd()
  const changesPath = `${cwd}/openspec/changes`
  try {
    const stat = await $.fs.stat(changesPath)
    if (stat.mtimeMs === changesMtime && skippedFolders.size === 0) return
    changesMtime = stat.mtimeMs
  } catch {
    return
  }

  let folderNames: string[] = []
  try {
    const entries = await $.fs.list(changesPath)
    folderNames = entries
      .filter((e: any) => e.kind === 'directory' && e.name !== 'archive')
      .map((e: any) => e.name as string)
  } catch {
    return
  }

  let kbEntries: Entry[] = []
  try {
    const text = await $.fs.read(await kanbanPath($))
    kbEntries = parseKanban(text)
  } catch { /* ok */ }

  const existingIds = new Set(kbEntries.map(e => e.id))
  let hasMissing = false

  for (const name of folderNames) {
    if (existingIds.has(name)) { skippedFolders.delete(name); continue }
    try {
      await $.fs.stat(`${changesPath}/${name}/proposal.md`)
      skippedFolders.delete(name)
      hasMissing = true
    } catch {
      skippedFolders.add(name)
    }
  }

  if (!hasMissing) return

  const result = await $.process.run(
    ['node', `${cwd}/libs/kanban-core/dist/src/cli.js`, 'new-sync'],
    { cwd }
  )
  if (result.exitCode !== 0) {
    await $.ui.toast(`new-sync: ${result.stderr.trim() || 'failed'}`)
  } else {
    await invalidateIfOpen($)
  }
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
    $.clock.every(5000, async () => { await checkArchiveFolder($); await checkChangesFolder($) })
    await checkArchiveFolder($)
    await checkChangesFolder($)
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
          <Box key={lane} flexDirection="column" marginBottom={1}
               borderStyle="round" borderColor={LANE_COLORS[lane] ?? 'white'}
               paddingX={1}>
            <Text bold color={LANE_COLORS[lane] ?? 'white'} inverse>
              {` ${lane.toUpperCase()} `}
            </Text>
            {!isCollapsed && groups[lane].map(entry => (
              <Box key={entry.id} flexDirection="column"
                   backgroundColor={LANE_ENTRY_BG[lane]}
                   paddingX={1} marginTop={1}>
                <Box flexDirection="row" gap={1}>
                  <Text bold color={TEXT_COLORS[lane] ?? 'white'}>{entry.id}</Text>
                  <Text dimColor={!TEXT_COLORS[lane]}>[{entry.priority}]</Text>
                </Box>
                {entry.summary ? <Text color={TEXT_COLORS[lane] ?? 'white'} dimColor={!TEXT_COLORS[lane]}>{entry.summary}</Text> : null}
              </Box>
            ))}
          </Box>
        ))}
      </Box>
    )
  })
}
