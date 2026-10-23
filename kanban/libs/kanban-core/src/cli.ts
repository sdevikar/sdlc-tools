import { syncFromOpenSpec, applyArchives, applyNewChanges } from './sync.js'

const [,, cmd] = process.argv

const run = cmd === 'archive-sync'
  ? applyArchives(process.cwd(), 'docs/kanban.yaml')
  : cmd === 'new-sync'
  ? applyNewChanges(process.cwd(), 'docs/kanban.yaml')
  : syncFromOpenSpec(process.cwd(), 'docs/kanban.yaml')

run
  .then(() => process.exit(0))
  .catch(e => { process.stderr.write(e.message + '\n'); process.exit(1) })
