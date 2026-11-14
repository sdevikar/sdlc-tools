import { syncFromOpenSpec, applyArchives, applyNewChanges } from './sync.js'
import { KANBAN_FILE } from './paths.js'

const [,, cmd] = process.argv

const run = cmd === 'archive-sync'
  ? applyArchives(process.cwd(), KANBAN_FILE)
  : cmd === 'new-sync'
  ? applyNewChanges(process.cwd(), KANBAN_FILE)
  : syncFromOpenSpec(process.cwd(), KANBAN_FILE)

run
  .then(() => process.exit(0))
  .catch(e => { process.stderr.write(e.message + '\n'); process.exit(1) })
