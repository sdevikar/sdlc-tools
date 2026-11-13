import type { Register } from 'claude-code'

const PANE = 'kanban-board'
const LANES = ['Not Started', 'In Progress', 'Archived'] as const

async function kanbanPath($: any): Promise<string> {
  const cwd = await $.session.cwd()
  return `${cwd}/kanban.yaml`
}

const collapsed = { plugin: 'kanban-board', key: 'collapsed' } as const
const collapsedProjects = { plugin: 'kanban-board', key: 'collapsedProjects' } as const

async function toggleCollapsed($: any) {
  for (;;) {
    const { value, version } = await $.state.get(collapsed)
    try { await $.state.set(collapsed, !(value ?? false), { ifVersion: version }); return } catch { /* retry on version conflict */ }
  }
}

async function toggleProjectCollapsed($: any, project: string) {
  for (;;) {
    const { value, version } = await $.state.get(collapsedProjects)
    const list: string[] = value ?? []
    const next = list.includes(project) ? list.filter(p => p !== project) : [...list, project]
    try { await $.state.set(collapsedProjects, next, { ifVersion: version }); return } catch { /* retry */ }
  }
}

function groupByProject(entries: Entry[]): Array<[string, Entry[]]> {
  const byProject = new Map<string, Entry[]>()
  const other: Entry[] = []
  for (const e of entries) {
    if (e.project) {
      if (!byProject.has(e.project)) byProject.set(e.project, [])
      byProject.get(e.project)!.push(e)
    } else {
      other.push(e)
    }
  }
  const result: Array<[string, Entry[]]> = [...byProject.entries()]
  if (other.length > 0) result.push(['Other', other])
  return result
}

// Display-only entry (pane rendering)
type Entry = { id: string; summary: string; priority: number; lane: string; project?: string }

// Full entry (sync logic)
type KanbanEntry = {
  id: string; title: string; lane: string; priority: number; specPath: string
  summary: string; status: string; createdAt: string; updatedAt: string
  archivedAt?: string; completedAt?: string; notes?: string
  tags?: string[]; assignee?: string; githubIssue?: string; project?: string
}
type ArtifactStatus = { id: string; status: string }
type ActiveChange = { name: string; artifacts: ArtifactStatus[] }
type ArchivedChange = { name: string; dirName: string }

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
    else if (key === 'project') current.project = v
  }
  if (current?.id) entries.push(current as Entry)
  return entries
}

function parseKanbanFull(text: string): KanbanEntry[] {
  const entries: KanbanEntry[] = []
  let current: Partial<KanbanEntry> | null = null
  let inTags = false
  for (const line of text.split('\n')) {
    if (/^  - \w/.test(line)) {
      if (current?.id) entries.push(current as KanbanEntry)
      current = { priority: 99, summary: '', status: '' }
      inTags = false
      const inline = line.match(/^  - (\w+):\s*(.*)$/)
      if (inline) {
        const v = inline[2].trim().replace(/^"|"$/g, '')
        if (inline[1] === 'id') current.id = v
      }
      continue
    }
    if (!current) continue
    if (/^      - /.test(line)) {
      if (inTags) {
        if (!current.tags) current.tags = []
        current.tags.push(line.slice(8).trim().replace(/^"|"$/g, ''))
      }
      continue
    }
    const m = line.match(/^    (\w+):\s*(.*)$/)
    if (!m) { inTags = false; continue }
    inTags = false
    const [, key, val] = m
    const v = val.trim().replace(/^"|"$/g, '')
    if (key === 'id') current.id = v
    else if (key === 'title') current.title = v
    else if (key === 'lane') current.lane = v
    else if (key === 'priority') current.priority = Number(v) || 99
    else if (key === 'specPath') current.specPath = v
    else if (key === 'summary') current.summary = v
    else if (key === 'status') current.status = v
    else if (key === 'createdAt') current.createdAt = v
    else if (key === 'updatedAt') current.updatedAt = v
    else if (key === 'archivedAt') current.archivedAt = v
    else if (key === 'completedAt') current.completedAt = v
    else if (key === 'notes') current.notes = v
    else if (key === 'assignee') current.assignee = v
    else if (key === 'githubIssue') current.githubIssue = v
    else if (key === 'project') current.project = v
    else if (key === 'tags') { inTags = true; current.tags = [] }
  }
  if (current?.id) entries.push(current as KanbanEntry)
  return entries
}

function extractProject(id: string): string | undefined {
  const m = id.match(/^(.+?)(?=-\d+-)/)
  return m ? m[1] : undefined
}

// Inline sync functions (from libs/kanban-core/src/sync.ts)
function artifactSt(artifacts: ArtifactStatus[], id: string): string {
  return artifacts.find(a => a.id === id)?.status ?? 'blocked'
}

function mapLane(artifacts: ArtifactStatus[]): string {
  const tasks = artifactSt(artifacts, 'tasks')
  const design = artifactSt(artifacts, 'design')
  if (tasks === 'done' || tasks === 'ready') return 'In Progress'
  if (design === 'done') return 'In Progress'
  return 'Not Started'
}

function mapStatus(artifacts: ArtifactStatus[]): string {
  const tasks = artifactSt(artifacts, 'tasks')
  const design = artifactSt(artifacts, 'design')
  const proposal = artifactSt(artifacts, 'proposal')
  if (tasks === 'done') return 'tasks ready'
  if (design === 'done') return 'design in progress'
  if (proposal === 'done') return 'proposal written'
  return 'no proposal'
}

function mergeSync(
  existing: KanbanEntry[],
  active: ActiveChange[],
  archived: ArchivedChange[]
): KanbanEntry[] {
  const byId = new Map(existing.map(e => [e.id, { ...e }]))
  const d = () => new Date().toISOString().slice(0, 10)

  for (const a of active) {
    const prev = byId.get(a.name)
    const entry: KanbanEntry = {
      id: a.name,
      title: prev?.title ?? a.name,
      lane: prev ? prev.lane : mapLane(a.artifacts),
      priority: prev?.priority ?? 99,
      specPath: `openspec/changes/${a.name}/`,
      summary: prev?.summary ?? '',
      status: mapStatus(a.artifacts),
      createdAt: prev?.createdAt ?? d(),
      updatedAt: d(),
    }
    if (prev?.notes !== undefined) entry.notes = prev.notes
    if (prev?.tags !== undefined) entry.tags = prev.tags
    if (prev?.assignee !== undefined) entry.assignee = prev.assignee
    if (prev?.githubIssue !== undefined) entry.githubIssue = prev.githubIssue
    if (prev?.project) entry.project = prev.project
    if (!entry.project) { const p = extractProject(a.name); if (p) entry.project = p }
    byId.set(a.name, entry)
  }

  for (const ar of archived) {
    const prev = byId.get(ar.name)
    const entry: KanbanEntry = {
      id: ar.name,
      title: prev?.title ?? ar.name,
      lane: 'Archived',
      priority: prev?.priority ?? 99,
      specPath: `openspec/changes/archive/${ar.dirName}/`,
      summary: prev?.summary ?? '',
      status: 'archived',
      createdAt: prev?.createdAt ?? d(),
      updatedAt: d(),
      archivedAt: prev?.archivedAt ?? d(),
      completedAt: prev?.completedAt ?? d(),
    }
    if (prev?.notes !== undefined) entry.notes = prev.notes
    if (prev?.tags !== undefined) entry.tags = prev.tags
    if (prev?.assignee !== undefined) entry.assignee = prev.assignee
    if (prev?.githubIssue !== undefined) entry.githubIssue = prev.githubIssue
    if (prev?.project) entry.project = prev.project
    if (!entry.project) { const p = extractProject(ar.name); if (p) entry.project = p }
    byId.set(ar.name, entry)
  }

  return [...byId.values()]
}

function yamlStr(s: string): string {
  if (!s) return "''"
  if (/^[#\[\]{|>!*&?@`]/.test(s) || /: /.test(s) ||
      /^(true|false|yes|no|on|off|null|~|\d+(\.\d+)?)$/i.test(s) ||
      s.startsWith(' ') || s.endsWith(' ')) {
    return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return s
}

function serialiseKanban(entries: KanbanEntry[]): string {
  const d = new Date().toISOString().slice(0, 10)
  const lines: string[] = ['entries:']
  for (const e of entries) {
    lines.push(`  - id: ${e.id}`)
    lines.push(`    title: ${yamlStr(e.title ?? e.id)}`)
    lines.push(`    lane: ${yamlStr(e.lane)}`)
    lines.push(`    priority: ${e.priority}`)
    lines.push(`    specPath: ${yamlStr(e.specPath ?? '')}`)
    lines.push(`    summary: ${yamlStr(e.summary ?? '')}`)
    lines.push(`    status: ${yamlStr(e.status ?? '')}`)
    lines.push(`    createdAt: ${e.createdAt ?? d}`)
    lines.push(`    updatedAt: ${e.updatedAt ?? d}`)
    if (e.archivedAt) lines.push(`    archivedAt: ${e.archivedAt}`)
    if (e.completedAt) lines.push(`    completedAt: ${e.completedAt}`)
    if (e.notes) lines.push(`    notes: ${yamlStr(e.notes)}`)
    if (e.tags && e.tags.length > 0) {
      lines.push(`    tags:`)
      for (const t of e.tags) lines.push(`      - ${yamlStr(t)}`)
    }
    if (e.assignee) lines.push(`    assignee: ${yamlStr(e.assignee)}`)
    if (e.githubIssue) lines.push(`    githubIssue: ${yamlStr(e.githubIssue)}`)
    if (e.project) lines.push(`    project: ${yamlStr(e.project)}`)
  }
  return lines.join('\n') + '\n'
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

let setupTool = ''

// Scans openspec, merges into kanban.yaml, and returns the result line or `error: <reason>`.
async function runKanbanSetup($: any): Promise<string> {
  const cwd = await $.session.cwd()
  const kbPath = await kanbanPath($)

  const listResult = await $.process.run(['openspec', 'list', '--json'], { cwd })
  if (listResult.exitCode !== 0) {
    return `error: openspec list failed — ${listResult.stderr.trim() || 'unknown error'}`
  }

  let listData: { changes: { name: string }[] }
  try { listData = JSON.parse(listResult.stdout) }
  catch {
    return 'error: could not parse openspec list output'
  }

  const active: ActiveChange[] = []
  for (const c of listData.changes) {
    const st = await $.process.run(
      ['openspec', 'status', '--change', c.name, '--json'],
      { cwd }
    )
    if (st.exitCode === 0) {
      try {
        const parsed = JSON.parse(st.stdout) as { artifacts: ArtifactStatus[] }
        active.push({ name: c.name, artifacts: parsed.artifacts ?? [] })
      } catch { /* skip */ }
    }
  }

  const archived: ArchivedChange[] = []
  try {
    const dirs = await $.fs.list(`${cwd}/openspec/changes/archive`)
    for (const d of dirs) {
      if (d.kind !== 'directory') continue
      const m = d.name.match(/^\d{4}-\d{2}-\d{2}-(.+)$/)
      archived.push({ name: m ? m[1] : d.name, dirName: d.name })
    }
  } catch { /* no archive dir */ }

  let existing: KanbanEntry[] = []
  let mode: 'init' | 'sync' = 'init'
  try { existing = parseKanbanFull(await $.fs.read(kbPath)); mode = 'sync' } catch { /* ok */ }

  const existingIds = new Set(existing.map(e => e.id))
  const existingMap = new Map(existing.map(e => [e.id, JSON.stringify(e)]))

  const merged = mergeSync(existing, active, archived)
  await $.fs.write(kbPath, serialiseKanban(merged))
  await invalidateIfOpen($)

  let changed = 0, added = 0
  for (const m of merged) {
    if (!existingIds.has(m.id)) added++
    else if (existingMap.get(m.id) !== JSON.stringify(m)) changed++
  }
  const unchanged = merged.length - changed - added

  return mode === 'init'
    ? `Kanban init: ${merged.length} entries created`
    : `Kanban sync: ${changed + added} updated, ${unchanged} unchanged`
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
  const syncResult = await runKanbanSetup($)
  if (syncResult.startsWith('error:')) {
    await $.ui.toast(`archive-sync: ${syncResult.slice(7).trim()}`)
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

  const syncResult = await runKanbanSetup($)
  if (syncResult.startsWith('error:')) {
    await $.ui.toast(`new-sync: ${syncResult.slice(7).trim()}`)
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
    setupTool = (await $.tool.register({
      name: 'kanban_board_setup',
      description: 'Create or sync kanban.yaml for this project. Silent — no dialog. Returns a status line, "convert-needed" (kanban.yaml exists but uses an unrecognized format), or "error: <reason>".',
      inputSchema: { type: 'object' },
    })).tool
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

  on('tool.call', async ($, e, next) => {
    if (e.tool !== setupTool) return next(e)
    const kbPath = await kanbanPath($)
    try {
      const text = await $.fs.read(kbPath)
      if (!/^entries:/m.test(text)) return { result: 'convert-needed' }
    } catch { /* file absent — init mode */ }
    return { result: await runKanbanSetup($) }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text, Button } = $.ui.resolve(e)
    let isCollapsed = false
    try { isCollapsed = (await $.state.get(collapsed)).value ?? false } catch { /* not available in test context */ }
    let collapsedProjectsList: string[] = []
    try { collapsedProjectsList = (await $.state.get(collapsedProjects)).value ?? [] } catch { /* not available in test context */ }

    let entries: Entry[] = []
    try {
      const text = await $.fs.read(await kanbanPath($))
      entries = parseKanban(text)
    } catch {
      return (
        <Box>
          <Text color="red">Could not read kanban.yaml</Text>
        </Box>
      )
    }

    const groups = groupAndSort(entries)
    const hasProjects = entries.some(e => e.project)

    const renderEntry = (entry: Entry, lane: string) => (
      <Box key={entry.id} flexDirection="column"
           backgroundColor={LANE_ENTRY_BG[lane]}
           paddingX={1} marginTop={1}>
        <Box flexDirection="row" gap={1}>
          <Text bold color={TEXT_COLORS[lane] ?? 'white'}>{entry.id}</Text>
          <Text dimColor={!TEXT_COLORS[lane]}>[{entry.priority}]</Text>
        </Box>
        {entry.summary ? <Text color={TEXT_COLORS[lane] ?? 'white'} dimColor={!TEXT_COLORS[lane]}>{entry.summary}</Text> : null}
      </Box>
    )

    return (
      <Box flexDirection="column" paddingX={1}>
        <Text dimColor>x close · c collapse · ctrl+x tab focus</Text>
        <Box flexDirection="row" justifyContent="space-between" marginBottom={1}>
          <Button
            hotkey="c"
            onPress={() => toggleCollapsed($)}
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
            {!isCollapsed && (hasProjects
              ? groupByProject(groups[lane]).map(([proj, projEntries]) => {
                  const isProjCollapsed = collapsedProjectsList.includes(proj)
                  return (
                    <Box key={proj} flexDirection="column" marginTop={1}>
                      <Button onPress={() => toggleProjectCollapsed($, proj)}>
                        {isProjCollapsed ? '▶' : '▼'} {proj}
                      </Button>
                      {!isProjCollapsed && projEntries.map(entry => renderEntry(entry, lane))}
                    </Box>
                  )
                })
              : groups[lane].map(entry => renderEntry(entry, lane))
            )}
          </Box>
        ))}
      </Box>
    )
  })
}
