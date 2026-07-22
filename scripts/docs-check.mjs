#!/usr/bin/env node
// Gates the documentation invariants that kept slipping when they were only
// ad-hoc greps: a public export with no entry on its own package's API page, a
// docs page and its llms mirror drifting out of order, removed API names left
// in prose, and a claim that must never ship without its caveat.
//
// Judgment stays out of scope — this proves a symbol is mentioned and that
// section order agrees, not that the prose is correct.
//
// Usage:
//   node scripts/docs-check.mjs                     check (exit 1 on error)
//   node scripts/docs-check.mjs --update-baseline   re-snapshot known gaps

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(root, 'scripts', 'docs-check.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const updateBaseline = process.argv.includes('--update-baseline');

const errors = [];
const warnings = [];
const read = (p) => readFileSync(join(root, p), 'utf8');
const rel = (p) => p.replace(`${root}/`, '');

/**
 * Symbols a package genuinely OWNS — declared here or re-exported from a local
 * module. A symbol re-exported from another package (`@reelkit/core`) is
 * documented on that package's own API page, so requiring it here as well would
 * demand every binding restate the whole core reference.
 *
 * `export * from` cannot be enumerated without resolving the target, so it is
 * reported rather than silently skipped.
 */
function publicExports(file) {
  const src = read(file);
  const names = new Set();

  if (/^\s*export\s+\*\s+from/m.test(src)) {
    warnings.push(
      `${file}: has \`export * from\` — those re-exports are not enumerable, so coverage for them is not checked.`,
    );
  }

  // export { a, type B, c as d } from '...'   /   export { a, b }
  for (const block of src.matchAll(
    /export\s*\{([^}]*)\}\s*(?:from\s*['"]([^'"]+)['"])?/g,
  )) {
    const from = block[2];
    // Owned only when declared locally (no `from`) or re-exported from a
    // relative module. A bare specifier means another package owns the docs.
    if (from && !from.startsWith('.')) continue;
    for (let spec of block[1].split(',')) {
      spec = spec.trim();
      if (!spec) continue;
      spec = spec.replace(/^type\s+/, '');
      // `a as b` publishes b
      const as = spec.match(/\bas\s+([A-Za-z_$][\w$]*)$/);
      names.add(as ? as[1] : spec);
    }
  }

  // export const/function/class/interface/type/enum X
  for (const m of src.matchAll(
    /^\s*export\s+(?:declare\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm,
  )) {
    names.add(m[1]);
  }

  names.delete('default');
  return [...names].filter((n) => /^[A-Za-z_$][\w$]*$/.test(n)).sort();
}

const mentions = (haystack, symbol) =>
  new RegExp(`\\b${symbol.replace(/\$/g, '\\$')}\\b`).test(haystack);

/** H2 headings of a docs page (`<Heading level={2}>`) or an llms mirror (`## `). */
function headings(file) {
  const src = read(file);
  const clean = (s) =>
    s
      .replace(/&amp;/g, '&')
      .replace(/\{'\s*(.*?)\s*'\}/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();

  if (file.endsWith('.md')) {
    return [...src.matchAll(/^##\s+(.+)$/gm)].map((m) => clean(m[1]));
  }
  return [
    ...src.matchAll(/<Heading\s+level=\{2\}[^>]*>([\s\S]*?)<\/Heading>/g),
  ].map((m) => clean(m[1]));
}

// A gate with blind spots guarantees nothing where it is not looking, and the
// gaps it misses look identical to a clean pass. So every published package
// must be either covered by a surfaces entry or listed as deliberately
// undocumented — adding a package without doing one of the two fails here.
const configured = new Set(config.surfaces.map((s) => s.package));
const exempt = new Set(config.exemptPackages ?? []);
for (const entry of readdirSync(join(root, 'packages'))) {
  const pkg = `packages/${entry}/src/index.ts`;
  if (!existsSync(join(root, pkg))) continue;
  if (configured.has(pkg) || exempt.has(pkg)) continue;
  errors.push(
    `${pkg}: published package is not covered by docs-check — add a surfaces entry mapping it to its docs page + llms mirror, or list it in exemptPackages.`,
  );
}

// Every public export of a package must appear on that package's own API page
// AND its llms mirror. A reference table belongs where the symbol is exported,
// not where some other page happens to consume it.
const baseline = config.knownUndocumented ?? {};
const freshBaseline = {};

for (const s of config.surfaces) {
  for (const f of [s.package, s.page, s.mirror]) {
    if (!existsSync(join(root, f))) {
      errors.push(`docs-check config points at a missing file: ${f}`);
    }
  }
  if (!existsSync(join(root, s.package))) continue;

  const pageSrc = read(s.page);
  const mirrorSrc = read(s.mirror);
  const known = new Set(baseline[s.package] ?? []);
  const gaps = [];

  for (const sym of publicExports(s.package)) {
    const missing = [];
    if (!mentions(pageSrc, sym)) missing.push(rel(s.page));
    if (!mentions(mirrorSrc, sym)) missing.push(rel(s.mirror));
    if (!missing.length) continue;

    gaps.push(sym);
    const msg = `${s.package}: export \`${sym}\` is undocumented in ${missing.join(' and ')}`;
    if (known.has(sym)) warnings.push(`(baseline) ${msg}`);
    else errors.push(msg);
  }
  freshBaseline[s.package] = gaps;
}

// Mirrors are condensed, so the heading SETS legitimately differ. What must
// hold is that headings present in both appear in the same relative order —
// that is what catches a section moved on one surface but not the other.
for (const pair of config.mirrorPairs) {
  if (
    !existsSync(join(root, pair.page)) ||
    !existsSync(join(root, pair.mirror))
  ) {
    errors.push(
      `docs-check config points at a missing file: ${pair.page} / ${pair.mirror}`,
    );
    continue;
  }
  const norm = (h) =>
    h
      .toLowerCase()
      .replace(/\s*\(.*\)\s*$/, '')
      .trim();
  const page = headings(pair.page).map(norm);
  const mirror = headings(pair.mirror).map(norm);
  const shared = page.filter((h) => mirror.includes(h));
  const mirrorShared = mirror.filter((h) => page.includes(h));

  for (let i = 0; i < Math.min(shared.length, mirrorShared.length); i++) {
    if (shared[i] !== mirrorShared[i]) {
      errors.push(
        `${pair.page} and ${pair.mirror} order differs for shared sections: ` +
          `page has "${shared[i]}" where the mirror has "${mirrorShared[i]}"`,
      );
      break;
    }
  }
}

// A cross-page link with a #fragment must land on a heading that exists. The
// target page is resolved through its llms mirror's frontmatter `url`, so the
// mapping comes from the docs themselves rather than a second hand-kept list.
const slugify = (t) =>
  t
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const pageByUrl = new Map();
for (const pair of config.mirrorPairs) {
  if (!existsSync(join(root, pair.mirror))) continue;
  const url = read(pair.mirror).match(/^url:\s*(\S+)/m)?.[1];
  if (url) pageByUrl.set(new URL(url).pathname.replace(/\/$/, ''), pair.page);
}

const slugsOf = (file) => {
  const src = read(file);
  const texts = file.endsWith('.md')
    ? [...src.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1])
    : [
        ...src.matchAll(
          /<Heading\s+level=\{[23]\}[^>]*>([\s\S]*?)<\/Heading>/g,
        ),
      ].map((m) =>
        m[1]
          .replace(/&amp;/g, '&')
          .replace(/\{'\s*(.*?)\s*'\}/g, '$1')
          .replace(/\s+/g, ' ')
          .trim(),
      );
  return new Set(texts.map(slugify));
};

const slugCache = new Map();
for (const file of new Set(
  config.mirrorPairs.flatMap((p) => [p.page, p.mirror]),
)) {
  if (!existsSync(join(root, file))) continue;
  const src = read(file);
  for (const m of src.matchAll(/["(](\/docs\/[a-z0-9/-]*)#([a-z0-9-]+)/gi)) {
    const [, path, frag] = m;
    const target = pageByUrl.get(path.replace(/\/$/, ''));
    if (!target) continue;
    if (!slugCache.has(target)) slugCache.set(target, slugsOf(target));
    if (!slugCache.get(target).has(frag.toLowerCase())) {
      const line = src.slice(0, m.index).split('\n').length;
      errors.push(
        `${file}:${line}: link to ${path}#${frag} — no heading with that slug on ${rel(target)}`,
      );
    }
  }
}

// A snippet tagged `vue` is read as a single-file component. Script statements
// pasted in bare — the shape you get porting a React snippet, where statements
// and JSX share one block — do not parse as an SFC, and the highlighter mangles
// what a reader is meant to copy.
for (const file of new Set(
  config.mirrorPairs.flatMap((p) => [p.page, p.mirror]),
)) {
  if (!existsSync(join(root, file))) continue;
  const src = read(file);
  const blocks = file.endsWith('.md')
    ? [...src.matchAll(/```vue\n([\s\S]*?)```/g)]
    : [...src.matchAll(/code=\{`((?:[^`\\]|\\.)*)`\}\s*\n\s*language="vue"/g)];
  for (const m of blocks) {
    const body = m[1];
    const hasStatement = /^\s*(const|let|var|import|function)\s/m.test(body);
    if (hasStatement && !body.includes('<script')) {
      const line = src.slice(0, m.index).split('\n').length;
      errors.push(
        `${file}:${line}: a \`vue\` snippet has top-level statements but no <script> block — wrap it as an SFC (<script setup> + <template>) or tag it \`ts\`.`,
      );
    }
  }
}

// Cases the docs teach must not drift apart between bindings: a reader
// following the Vue page should meet the same situations as one on React.
for (const rule of config.parity ?? []) {
  for (const file of rule.files) {
    if (!existsSync(join(root, file))) continue;
    if (!new RegExp(`\\b${rule.token}\\b`).test(read(file))) {
      errors.push(`${file}: missing \`${rule.token}\` — ${rule.reason}`);
    }
  }
}

// Removed API names and framings the docs deliberately moved away from.
for (const rule of config.forbidden ?? []) {
  const re = new RegExp(rule.pattern, rule.flags ?? 'g');
  for (const file of rule.files) {
    if (!existsSync(join(root, file))) continue;
    const src = read(file);
    for (const m of src.matchAll(re)) {
      const line = src.slice(0, m.index).split('\n').length;
      errors.push(`${file}:${line}: ${rule.reason} (matched "${m[0].trim()}")`);
    }
  }
}

// A promise that is only conditionally true must not ship without the
// condition stated on the same surface.
for (const rule of config.requirePair ?? []) {
  const claim = new RegExp(rule.claim, rule.flags ?? '');
  const caveat = new RegExp(rule.caveat, rule.flags ?? '');
  for (const file of rule.files) {
    if (!existsSync(join(root, file))) continue;
    const src = read(file);
    if (claim.test(src) && !caveat.test(src)) {
      errors.push(`${file}: ${rule.reason}`);
    }
  }
}

if (updateBaseline) {
  config.knownUndocumented = freshBaseline;
  writeFileSync(configPath, `${JSON.stringify(config, null, 2)}\n`);
  const total = Object.values(freshBaseline).flat().length;
  console.log(
    `docs-check: baseline updated — ${total} known-undocumented export(s) recorded.`,
  );
  process.exit(0);
}

const verbose = process.argv.includes('--verbose');
if (verbose) for (const w of warnings) console.log(`  warn  ${w}`);
for (const e of errors) console.error(`  ERROR ${e}`);

const known = warnings.length
  ? ` ${warnings.length} known gap(s) carried in the baseline${verbose ? '' : ' — --verbose to list'}.`
  : '';

if (errors.length) {
  console.error(`\ndocs-check: ${errors.length} error(s).${known}`);
  process.exit(1);
}
console.log(`docs-check: passed.${known}`);
