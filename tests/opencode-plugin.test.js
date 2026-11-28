#!/usr/bin/env node
// Smoke test for the OpenCode V2 adapter: the plugin's transforms and hooks
// behave against the real (structural) V2 shapes. No live OpenCode needed.

import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { default: plugin } = await import(pathToFileURL(path.join(root, '.opencode', 'plugins', 'sdlc-tools.js')));

function setup() {
  const added = { skills: [], commands: [] };
  const prompts = [];
  const hooks = {};
  const ctx = {
    skill: { transform: async (cb) => cb({ add: (skill) => added.skills.push(skill) }) },
    command: {
      transform: async (cb) =>
        cb({
          add: (command) => {
            added.commands.push(command);
            added.commands[command.name] = command;
          },
        }),
    },
    session: {
      prompt: async (input) => prompts.push(input),
      hook: async (name, cb) => {
        (hooks[name] ||= []).push(cb);
      },
    },
  };
  return plugin.setup(ctx).then(() => ({ added, prompts, hooks }));
}

test('default export is a V2 definition, with no V1 server()', () => {
  assert.equal(typeof plugin, 'object');
  assert.equal(plugin.id, 'sdlc-tools');
  assert.equal(typeof plugin.setup, 'function');
  assert.equal(plugin.server, undefined);
});

test('setup registers unique, prefixed devflow and kanban skills', async () => {
  const { added } = await setup();
  const ids = added.skills.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length, 'skill ids are unique');
  for (const id of ['devflow-atomic-commits', 'devflow-handoff', 'devflow-setup', 'kanban', 'kanban-setup', 'kanban-sync']) {
    assert.ok(ids.includes(id), `missing skill ${id}`);
  }
  assert.ok(!ids.includes('kanban-view'), 'the Claude Code pane skill is skipped');
  assert.ok(!ids.includes('kanban-render'), 'the Claude Code render skill is skipped');
  assert.ok(!ids.some((id) => id.includes('openspec')), 'openspec skills come from openspec init');
  assert.ok(!ids.some((id) => id.startsWith('mission-ctrl')), 'mission-ctrl is retired');
  for (const skill of added.skills) {
    assert.ok(skill.name && skill.description && skill.path && skill.content, `incomplete skill ${skill.id}`);
    assert.ok(!skill.content.includes('${CLAUDE_PLUGIN_ROOT}'), `unresolved plugin root in ${skill.id}`);
  }
});

test('setup registers the kanban commands and one command per skill', async () => {
  const { added } = await setup();
  const names = added.commands.map((c) => c.name);
  for (const name of ['kanban-add', 'kanban-move', 'kanban-sync', 'devflow-handoff', 'devflow-setup']) {
    assert.ok(names.includes(name), `missing command ${name}`);
  }
  assert.ok(!names.includes('kanban-view'), 'the Claude Code pane command is skipped');
  assert.ok(!names.includes('kanban-render'), 'the Claude Code render command is skipped');
});

test('a command sends the skill body with the typed input appended', async () => {
  const { added, prompts } = await setup();
  await added.commands['devflow-handoff'].execute({
    sessionID: 's1',
    prompt: { text: ' focus on tests ' },
    delivery: 'steer',
  });
  assert.equal(prompts.length, 1);
  assert.equal(prompts[0].sessionID, 's1');
  assert.equal(prompts[0].delivery, 'steer');
  assert.ok(prompts[0].text.includes('focus on tests'));
  assert.ok(!prompts[0].text.includes('$ARGUMENTS'));
});

test('the context hook injects the devflow rule every turn', async () => {
  const { hooks } = await setup();
  const event = { sessionID: 's1', system: [] };
  for (const cb of hooks.context) await cb(event);
  assert.ok(event.system.some((part) => part.type === 'text' && part.text.includes('# devflow working files')));
  assert.ok(event.system.some((part) => part.text.includes('The devflow plugin injects this rule every turn.')));
  assert.ok(event.system.every((part) => !part.text.includes('/devflow:')));
  assert.ok(event.system.every((part) => !part.text.includes('CLAUDE.md')));
});

test('the handoff pointer is injected once per session', async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'sdlc-tools-'));
  execFileSync('git', ['init', '-q'], { cwd: tmp });
  execFileSync('git', ['checkout', '-q', '-b', 'work'], { cwd: tmp });
  const handoffs = path.join(tmp, '.devflow', 'handoffs');
  fs.mkdirSync(handoffs, { recursive: true });
  fs.writeFileSync(
    path.join(handoffs, 'handoff_test_20260101-0000.md'),
    '---\nbranch: work\nstatus: open\nnext: do the thing\n---\n',
  );

  const cwd = process.cwd();
  process.chdir(tmp);
  try {
    const { hooks } = await setup();
    const first = { sessionID: 's1', system: [] };
    for (const cb of hooks.context) await cb(first);
    assert.ok(first.system.some((part) => part.text.includes('Handoff for this branch')));

    const second = { sessionID: 's1', system: [] };
    for (const cb of hooks.context) await cb(second);
    assert.ok(!second.system.some((part) => part.text.includes('Handoff for this branch')));
  } finally {
    process.chdir(cwd);
  }
});
