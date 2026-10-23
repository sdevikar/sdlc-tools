declare module 'claude-code' {
  interface PluginState {
    'kanban-board': { collapsed: boolean; setupMode: 'init' | 'sync' | null }
  }
}
