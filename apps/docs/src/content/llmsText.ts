import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join } from 'node:path';

// Renders `llms.txt` and `llms-full.txt` from the hand-authored pages in
// `content/llms`. The Vite config emits both files at build and serves them
// in dev; tests render the same text, so they check exactly what the site
// publishes. Runs in Node only.

export interface LlmsEntry {
  slug: string;
  title: string;
  url: string;
  section: string;
  order: number;
  desc: string;
  body: string;
}

const _kLlmsSiteTitle = 'Reelkit';
const _kLlmsTagline =
  'Headless, virtualized, TikTok-style vertical slider component library for React, Vue, and Angular. Zero dependencies in core; renders only 3 slides to the DOM at any time via virtualization.';
const _kLlmsIntro =
  'This file indexes the Reelkit documentation so LLM agents can consume it without scraping the React-rendered site. Each link points at the public docs URL; fetch `llms-full.txt` for the same index with embedded per-page summaries.';
const _kLlmsSectionOrder = [
  'Getting started',
  'Core',
  'React',
  'Vue',
  'Angular',
  'Meta',
];

function parseLlmsFile(path: string): LlmsEntry {
  const raw = readFileSync(path, 'utf8');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) {
    throw new Error(
      `[llms-txt] ${path}: missing or malformed YAML frontmatter (expected \`---\\n<keys>\\n---\\n<body>\`)`,
    );
  }
  const [, head, rest] = match;
  const meta: Record<string, string> = {};
  for (const line of head.split('\n')) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    meta[kv[1]] = value;
  }
  const required = ['title', 'url', 'section', 'desc'] as const;
  for (const key of required) {
    if (!meta[key]) {
      throw new Error(
        `[llms-txt] ${path}: missing required frontmatter key \`${key}\``,
      );
    }
  }
  const slug = basename(path).replace(/\.mdx?$/, '');
  const order = meta['order'] ? Number(meta['order']) : 999;
  if (Number.isNaN(order)) {
    throw new Error(
      `[llms-txt] ${path}: \`order\` must be numeric, got \`${meta['order']}\``,
    );
  }
  return {
    slug,
    title: meta['title'],
    url: meta['url'],
    section: meta['section'],
    order,
    desc: meta['desc'],
    body: rest.trim(),
  };
}

export function loadLlmsEntries(contentDir: string): LlmsEntry[] {
  if (!existsSync(contentDir)) return [];
  // Skip caveman-compress backup files (`<slug>.original.md`) — they share
  // the same frontmatter as the live page and would emit a duplicate entry.
  const files = readdirSync(contentDir).filter(
    (f) => f.endsWith('.md') && !f.endsWith('.original.md'),
  );
  return files
    .map((f) => parseLlmsFile(join(contentDir, f)))
    .sort((a, b) => {
      const sa = _kLlmsSectionOrder.indexOf(a.section);
      const sb = _kLlmsSectionOrder.indexOf(b.section);
      const aa = sa === -1 ? _kLlmsSectionOrder.length : sa;
      const bb = sb === -1 ? _kLlmsSectionOrder.length : sb;
      if (aa !== bb) return aa - bb;
      if (a.order !== b.order) return a.order - b.order;
      return a.title.localeCompare(b.title);
    });
}

function groupBySection(entries: LlmsEntry[]): Map<string, LlmsEntry[]> {
  const groups = new Map<string, LlmsEntry[]>();
  for (const e of entries) {
    const bucket = groups.get(e.section) ?? [];
    bucket.push(e);
    groups.set(e.section, bucket);
  }
  return groups;
}

export function renderLlmsTxt(entries: LlmsEntry[]): string {
  const lines: string[] = [
    `# ${_kLlmsSiteTitle}`,
    '',
    `> ${_kLlmsTagline}`,
    '',
    _kLlmsIntro,
    '',
  ];
  const groups = groupBySection(entries);
  for (const section of _kLlmsSectionOrder) {
    const bucket = groups.get(section);
    if (!bucket || bucket.length === 0) continue;
    lines.push(`## ${section}`, '');
    for (const e of bucket) {
      lines.push(`- [${e.title}](${e.url}): ${e.desc}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

export function renderLlmsFullTxt(entries: LlmsEntry[]): string {
  const lines: string[] = [
    `# ${_kLlmsSiteTitle}`,
    '',
    `> ${_kLlmsTagline}`,
    '',
    _kLlmsIntro,
    '',
    'Each section below embeds the full hand-authored summary for every page — fetch this file instead of `llms.txt` when you want content inline.',
    '',
  ];
  const groups = groupBySection(entries);
  for (const section of _kLlmsSectionOrder) {
    const bucket = groups.get(section);
    if (!bucket || bucket.length === 0) continue;
    lines.push(`## ${section}`, '');
    for (const e of bucket) {
      lines.push(`### ${e.title}`);
      lines.push('');
      lines.push(`URL: ${e.url}`);
      lines.push('');
      lines.push(e.body);
      lines.push('');
    }
  }
  return lines.join('\n');
}
