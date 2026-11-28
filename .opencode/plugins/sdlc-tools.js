// sdlc-tools — OpenCode V2 plugin.
//
// Registers the devflow and kanban skills and commands from the same files the
// Claude Code plugins ship, so the two harnesses read one source of truth.
// Skills are rewritten on the way in: the Claude plugin root variable becomes
// an absolute path, and the Claude `/plugin:skill` names become the OpenCode
// `/plugin-skill` command names.
//
// Add it to opencode.json:
//   { "plugins": ["git+https://github.com/sdevikar/sdlc-tools"] }

import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '../..');

// The frontmatter parser lives in its own CommonJS module: OpenCode's legacy
// loader treats every function exported from a plugin module as a plugin.
const require = createRequire(import.meta.url);
const { parseCommandFile, parseSkillFile } = require('./frontmatter.cjs');

const SKILL_DIRS = [
  { prefix: 'kanban', dir: path.join(root, 'kanban', '.opencode', 'skills') },
  { prefix: 'kanban', dir: path.join(root, 'kanban', 'plugins', 'kanban', 'skills') },
  { prefix: 'devflow', dir: path.join(root, 'devflow', 'skills') },
];

// The Claude Code pane and HTML render are Claude-only; OpenCode reads the
// board file directly. The `openspec-*` skills come from `openspec init` in
// each project, so shipping them again would duplicate that install.
function skipSkill(name) {
  return name === 'kanban-view' || name === 'kanban-render' || name.startsWith('openspec-');
}

// A skill name shared by two plugins would collide; prefix every id.
function skillId(prefix, name) {
  return name === prefix || name.startsWith(prefix + '-') ? name : `${prefix}-${name}`;
}

function rewrite(text) {
  return text
    .replaceAll('${CLAUDE_PLUGIN_ROOT}', root)
    .replaceAll('/devflow:', '/devflow-')
    .replaceAll('/kanban:', '/kanban-')
    .replace(
      'Use `/kanban-view` to render the board.',
      'Read `kanban.yaml` directly; the board pane and HTML render are Claude Code only.',
    )
    .replaceAll('/kanban-view', '/kanban');
}

function readSkills() {
  const byId = new Map();
  for (const { prefix, dir } of SKILL_DIRS) {
    let entries;
    try {
      entries = fs.readdirSync(dir, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      if (!entry.isDirectory() || skipSkill(entry.name)) continue;
      const file = path.join(dir, entry.name, 'SKILL.md');
      let text;
      try {
        text = fs.readFileSync(file, 'utf8');
      } catch {
        continue;
      }
      const parsed = parseSkillFile(text);
      if (!parsed) continue;
      const id = skillId(prefix, entry.name);
      byId.set(id, {
        id,
        name: id,
        description: parsed.description ? rewrite(parsed.description) : undefined,
        path: file,
        content: rewrite(parsed.body),
      });
    }
  }
  return [...byId.values()];
}

function readCommands(skills) {
  const byName = new Map();
  const dir = path.join(root, 'kanban', '.opencode', 'commands');
  try {
    for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.md'))) {
      const parsed = parseCommandFile(fs.readFileSync(path.join(dir, file), 'utf8'));
      if (!parsed) continue;
      const name = path.basename(file, '.md');
      if (skipSkill(name)) continue;
      byName.set(name, {
        name,
        description: parsed.description ? rewrite(parsed.description) : undefined,
        template: rewrite(parsed.template),
      });
    }
  } catch {}
  // A skill command carries the whole skill body, so it beats the generic
  // `Run kanban ... as described in skills` command files on a name clash.
  for (const skill of skills) {
    byName.set(skill.id, { name: skill.id, description: skill.description, template: skill.content });
  }
  return [...byName.values()];
}

function readRule() {
  try {
    return rewrite(fs.readFileSync(path.join(root, 'devflow', 'references', 'devflow-rule.md'), 'utf8'))
      .replaceAll('CLAUDE.md', 'AGENTS.md')
      .replace(
        '`/devflow-setup` copied this file from the devflow plugin. Run setup again to refresh it.',
        'The devflow plugin injects this rule every turn.',
      );
  } catch {
    return '';
  }
}

// Same fallback as ponytail: a template without $ARGUMENTS would drop what the
// user typed after the command, so append it.
function withArguments(template, input) {
  const text = String(input == null ? '' : input);
  if (template.includes('$ARGUMENTS')) return template.replaceAll('$ARGUMENTS', text);
  return text.trim() ? template + '\n\n' + text.trim() : template;
}

function run(command, args, cwd) {
  try {
    return execFileSync(command, args, {
      cwd,
      input: JSON.stringify({ cwd }),
      encoding: 'utf8',
      timeout: 30000,
      stdio: ['pipe', 'pipe', 'ignore'],
    }).trim();
  } catch {
    return '';
  }
}

function startContext(cwd) {
  const handoffs = path.join(cwd, '.devflow', 'handoffs');
  if (!fs.existsSync(handoffs)) return '';
  const raw = run('python3', [path.join(root, 'devflow', 'scripts', 'latest_handoff.py'), '--hook'], cwd);
  try {
    const data = JSON.parse(raw);
    return data.hookSpecificOutput?.additionalContext || data.systemMessage || '';
  } catch {
    return '';
  }
}

const plugin = {
  id: 'sdlc-tools',

  async setup(ctx) {
    const skills = readSkills();
    const commands = readCommands(skills);
    const rule = readRule();

    await ctx.skill.transform((editor) => {
      for (const skill of skills) editor.add(skill);
    });

    await ctx.command.transform((editor) => {
      for (const command of commands) {
        editor.add({
          name: command.name,
          description: command.description,
          execute: async ({ sessionID, prompt, delivery }) => {
            const withoutMentions = (items) => items?.map(({ mention, ...item }) => item);
            await ctx.session.prompt({
              ...prompt,
              sessionID,
              text: withArguments(command.template, prompt.text),
              files: withoutMentions(prompt.files),
              agents: withoutMentions(prompt.agents),
              skills: withoutMentions(prompt.skills),
              delivery,
            });
          },
        });
      }
    });

    if (rule) {
      const addRule = (event) => event.system.push({ type: 'text', text: rule });
      await ctx.session.hook('context', addRule);
      await ctx.session.hook('compaction', addRule);
    }

    // The Claude plugins print these at session start. OpenCode has no
    // SessionStart hook, so inject them once per session on the first turn.
    const seen = new Set();
    await ctx.session.hook('context', (event) => {
      const key = event.sessionID || 'default';
      if (seen.has(key)) return;
      seen.add(key);
      const text = startContext(event.directory || event.cwd || process.cwd());
      if (text) event.system.push({ type: 'text', text });
    });
  },
};

export default plugin;
