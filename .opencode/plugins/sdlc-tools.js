import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

const skillDirs = [
  path.join(root, 'devflow', 'skills'),
  path.join(root, 'kanban', '.opencode', 'skills'),
  path.join(root, 'mission-ctrl', 'packages', 'claude-plugin', 'skills'),
];

function readCommands() {
  const dir = path.join(root, 'kanban', '.opencode', 'commands');
  const out = [];
  try {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const raw = fs.readFileSync(path.join(dir, file), 'utf8');
      // minimal frontmatter parse
      const m = raw.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      let name = file.replace(/\.md$/, '');
      let description = '';
      let template = raw;
      if (m) {
        const fm = m[1];
        const body = m[2].trim();
        const nm = fm.match(/^name:\s*(.+)$/m);
        const dm = fm.match(/^description:\s*(.+)$/m);
        if (nm) name = nm[1].trim();
        if (dm) description = dm[1].trim();
        template = body;
      }
      out.push({ name, description, template });
    }
  } catch (e) {}
  return out;
}

const plugin = {
  id: 'sdlc-tools',
  async setup(ctx) {
    try {
      await ctx.skill.transform(async (draft) => {
        for (const dir of skillDirs) {
          // register each skill subdir's SKILL.md if present
          try {
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
              if (!entry.isDirectory()) continue;
              const skillFile = path.join(dir, entry.name, 'SKILL.md');
              if (fs.existsSync(skillFile)) {
                draft.source({ name: entry.name, path: skillFile });
              }
            }
          } catch (e) {}
        }
      });
    } catch (e) {}
  },
  async server({ client } = {}) {
    return {
      config: async (config) => {
        if (!config.skills) config.skills = {};
        if (!config.skills.paths) config.skills.paths = [];
        for (const dir of skillDirs) {
          if (fs.existsSync(dir) && !config.skills.paths.includes(dir)) {
            config.skills.paths.push(dir);
          }
        }
        if (!config.command) config.command = {};
        for (const c of readCommands()) {
          config.command[c.name] = { description: c.description, template: c.template };
        }
      },
    };
  },
};

export default plugin;
