import { syncFromOpenSpec } from './sync.js'

syncFromOpenSpec(process.cwd(), 'docs/kanban.yaml')
  .then(() => process.exit(0))
  .catch(e => { process.stderr.write(e.message + '\n'); process.exit(1) })
