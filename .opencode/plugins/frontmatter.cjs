'use strict';

// OpenCode plugin frontmatter parser.
//
// Kept out of the plugin module so the module has exactly one export. OpenCode's
// legacy loader calls every exported function as a plugin factory, which throws
// when a parser is handed the plugin context object instead of a string.

function frontmatterField(frontmatter, key) {
  const lines = frontmatter.split(/\r?\n/);
  const at = lines.findIndex((line) => line.startsWith(key + ':'));
  if (at === -1) return undefined;
  const value = lines[at].slice(key.length + 1).trim();
  if (value[0] !== '>' && value[0] !== '|') return value;

  // Block scalar: `>` folds the lines into one, `|` keeps them. Indented lines
  // continue the block; the next unindented key ends it.
  const block = [];
  for (const line of lines.slice(at + 1)) {
    if (line.trim() && !/^\s/.test(line)) break;
    block.push(line.trim());
  }
  while (block.length && !block[block.length - 1]) block.pop();
  const joined = block.join(value[0] === '|' ? '\n' : ' ');
  return value.endsWith('-') ? joined : joined + '\n';
}

function parseFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---[^\S\n]*\r?\n?([\s\S]*)$/);
  if (!match) return null;
  return { frontmatter: match[1], body: match[2] };
}

function parseCommandFile(content) {
  const parsed = parseFrontmatter(content);
  if (!parsed) return null;
  return {
    description: frontmatterField(parsed.frontmatter, 'description'),
    template: parsed.body.trim(),
  };
}

function parseSkillFile(content) {
  const parsed = parseFrontmatter(content);
  if (!parsed) return null;
  return {
    name: frontmatterField(parsed.frontmatter, 'name'),
    description: frontmatterField(parsed.frontmatter, 'description'),
    body: parsed.body,
  };
}

module.exports = { parseCommandFile, parseSkillFile };
