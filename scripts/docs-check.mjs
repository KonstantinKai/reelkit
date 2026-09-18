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
import { join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { publicExportNames } from './lib/publicExports.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(root, 'scripts', 'docs-check.config.json');
const config = JSON.parse(readFileSync(configPath, 'utf8'));
const updateBaseline = process.argv.includes('--update-baseline');

const errors = [];
const warnings = [];
const read = (p) => readFileSync(join(root, p), 'utf8');
const rel = (p) => p.replace(`${root}/`, '');

/**
 * Code samples a content page shows. A `.mdx` page keeps each sample in a
 * snippet file it imports as text and hands to `<CodeBlock>` or `<Sandbox>`;
 * a tsx page has none to resolve. Each sample carries the snippet's path, its
 * body, its language, and the line of the page that shows it.
 */
function snippetsOf(file) {
  if (!file.endsWith('.mdx')) return [];
  const src = read(file);
  const imports = new Map(
    [...src.matchAll(/^import (\w+) from '([^']+)\?raw';$/gm)].map((m) => [
      m[1],
      normalize(join(dirname(file), m[2])),
    ]),
  );
  return [...src.matchAll(/<(?:CodeBlock|Sandbox)\b([^>]*)>/g)].flatMap((m) => {
    const name = m[1].match(/\bcode=\{(\w+)\}/)?.[1];
    const path = name && imports.get(name);
    if (!path || !existsSync(join(root, path))) return [];
    return [
      {
        path,
        body: read(path),
        language: m[1].match(/\blanguage="([^"]+)"/)?.[1],
        line: src.slice(0, m.index).split('\n').length,
      },
    ];
  });
}

/**
 * Everything a reader sees on a page as source text: the page itself and,
 * for a content page, the code samples it imports — which is where a tsx
 * page kept them all along.
 */
const pageSource = (file) =>
  [read(file), ...snippetsOf(file).map((s) => s.body)].join('\n');

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
  const { names, hasStarExport } = publicExportNames(read(file));

  if (hasStarExport) {
    warnings.push(
      `${file}: has \`export * from\` — those re-exports are not enumerable, so coverage for them is not checked.`,
    );
  }

  return names;
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
  if (file.endsWith('.mdx')) {
    return [...src.matchAll(/^##\s+(.+?)\s*\[#[a-z0-9-]+\]\s*$/gm)].map((m) =>
      clean(m[1]),
    );
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

  const pageSrc = pageSource(s.page);
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
  // A content page states every anchor explicitly as `[#slug]`.
  if (file.endsWith('.mdx')) {
    return new Set(
      [...src.matchAll(/^#{2,3}\s+.*\[#([a-z0-9-]+)\]\s*$/gm)].map((m) => m[1]),
    );
  }
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
  const lineOf = (index) => src.slice(0, index).split('\n').length;
  const blocks = file.endsWith('.mdx')
    ? snippetsOf(file)
        .filter((s) => s.language === 'vue')
        .map((s) => ({ body: s.body, line: s.line }))
    : file.endsWith('.md')
      ? [...src.matchAll(/```vue\n([\s\S]*?)```/g)].map((m) => ({
          body: m[1],
          line: lineOf(m.index),
        }))
      : [
          ...src.matchAll(
            /code=\{`((?:[^`\\]|\\.)*)`\}\s*\n\s*language="vue"/g,
          ),
        ].map((m) => ({ body: m[1], line: lineOf(m.index) }));
  for (const { body, line } of blocks) {
    const hasStatement = /^\s*(const|let|var|import|function)\s/m.test(body);
    if (hasStatement && !body.includes('<script')) {
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
    if (!new RegExp(`\\b${rule.token}\\b`).test(pageSource(file))) {
      errors.push(`${file}: missing \`${rule.token}\` — ${rule.reason}`);
    }
  }
}

// Removed API names and framings the docs deliberately moved away from.
for (const rule of config.forbidden ?? []) {
  const re = new RegExp(rule.pattern, rule.flags ?? 'g');
  for (const file of rule.files) {
    if (!existsSync(join(root, file))) continue;
    const src = pageSource(file);
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
    const src = pageSource(file);
    if (claim.test(src) && !caveat.test(src)) {
      errors.push(`${file}: ${rule.reason}`);
    }
  }
}

// A snippet is meant to be pasted, and the first line that breaks when an API
// moves between packages is its import — the name is still real, just published
// somewhere else now, so nothing about the prose looks wrong. Named imports are
// resolved against the package's own entry point. A side-effect import carries
// no names, and a default import names nothing the entry point has to declare.
if (config.snippetImports) {
  const packageDirs = new Map();
  for (const entry of readdirSync(join(root, 'packages'))) {
    const manifest = join(root, 'packages', entry, 'package.json');
    if (!existsSync(manifest)) continue;
    const name = JSON.parse(readFileSync(manifest, 'utf8')).name;
    if (name) packageDirs.set(name, `packages/${entry}`);
  }

  /**
   * Source entry point behind an import specifier: the package root, a bundler
   * secondary entry (`src/<subpath>.ts`), or an Angular secondary entry point,
   * which is its own directory carrying a public interface file.
   */
  const entryFor = (specifier) => {
    const [scope, name, ...rest] = specifier.split('/');
    const dir = packageDirs.get(`${scope}/${name}`);
    if (!dir) return null;

    const subpath = rest.join('/');
    const candidates = subpath
      ? [
          `${dir}/src/${subpath}.ts`,
          `${dir}/${subpath}/src/public-api.ts`,
          `${dir}/${subpath}/src/index.ts`,
        ]
      : [`${dir}/src/index.ts`];

    return candidates.find((candidate) => existsSync(join(root, candidate)));
  };

  /**
   * Every name a module publishes, including the ones it re-exports from
   * another package. That is the opposite question from `publicExports`, which
   * asks which package OWNS a symbol's reference table; a reader importing from
   * a binding only cares that the binding hands the name out.
   *
   * A star re-export cannot be enumerated without resolving its target, so the
   * whole entry point is reported and left unchecked rather than answering with
   * a list that is quietly short.
   */
  const exportedNames = (file) => {
    const src = read(file);
    if (/^\s*export\s+\*\s+from/m.test(src)) {
      warnings.push(
        `${file}: has \`export * from\` — snippet imports against this entry point are not checked.`,
      );
      return null;
    }

    const names = new Set();
    // `export type { … }` publishes names exactly as `export { … }` does, and a
    // package's type surface is most of what a snippet imports.
    for (const block of src.matchAll(/export\s*(?:type\s+)?\{([^}]*)\}/g)) {
      // Long export lists group their names under comment headings, which sit
      // inside the braces and name nothing.
      for (const spec of block[1].replace(/\/\/[^\n]*/g, '').split(',')) {
        const clean = spec.trim().replace(/^type\s+/, '');
        if (!clean) continue;
        const renamed = clean.match(/\bas\s+([A-Za-z_$][\w$]*)$/);
        names.add(renamed ? renamed[1] : clean);
      }
    }
    for (const m of src.matchAll(
      /^\s*export\s+(?:declare\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm,
    )) {
      names.add(m[1]);
    }

    names.delete('default');
    return names;
  };

  const allow = new Set(config.snippetImports.allow ?? []);
  const exportCache = new Map();
  const files = new Set([
    ...config.mirrorPairs.flatMap((p) => [p.page, p.mirror]),
    ...(config.snippetImports.files ?? []),
  ]);

  // A content page's samples are separate files, so each is scanned on its
  // own and a finding names the snippet that needs the fix.
  const sampleSources = [...files].flatMap((file) => {
    if (!existsSync(join(root, file))) return [];
    return file.endsWith('.mdx')
      ? snippetsOf(file).map((s) => [s.path, s.body])
      : [[file, read(file)]];
  });

  for (const [file, src] of sampleSources) {
    for (const m of src.matchAll(
      /import\s+(?:type\s+)?\{([^}]*)\}\s*from\s*['"](@reelkit\/[^'"]+)['"]/g,
    )) {
      const [, clause, specifier] = m;
      const line = src.slice(0, m.index).split('\n').length;
      const entry = entryFor(specifier);

      if (!entry) {
        errors.push(
          `${file}:${line}: snippet imports from \`${specifier}\` — no package under packages/ publishes that entry point.`,
        );
        continue;
      }
      if (!exportCache.has(entry)) exportCache.set(entry, exportedNames(entry));
      const exported = exportCache.get(entry);
      if (exported === null) continue;

      // A long import list is often grouped under comment headings, which are
      // part of the clause but name nothing.
      for (const spec of clause.replace(/\/\/[^\n]*/g, '').split(',')) {
        const clean = spec.trim().replace(/^type\s+/, '');
        if (!clean) continue;
        const name = clean.split(/\s+as\s+/)[0].trim();
        if (exported.has(name) || allow.has(`${specifier}:${name}`)) continue;
        errors.push(
          `${file}:${line}: snippet imports \`${name}\` from \`${specifier}\`, which does not export it — see ${rel(join(root, entry))}`,
        );
      }
    }
  }
}

// A translated page mirrors its English original, and the two drift the
// moment a section lands on one and not the other. Prose is translated, so it
// cannot be compared. The parts that must match can: a translation imports the
// English page's snippet files rather than copying the samples, so both import
// the same ones in the same order, with the same number of sections and the
// same identifiers in the reference tables.
if (config.localeParity) {
  const contentRoot = 'apps/docs/src/content/en/docs';
  const englishPages = [];
  const walk = (dir) => {
    if (!existsSync(join(root, dir))) return;
    for (const entry of readdirSync(join(root, dir), { withFileTypes: true })) {
      const path = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.mdx')) englishPages.push(path);
    }
  };
  walk(contentRoot);

  const sampleFiles = (file) => snippetsOf(file).map((s) => s.path);
  const sectionCount = (src) => (src.match(/^##\s/gm) ?? []).length;
  const identifiers = (src) =>
    new Set([
      ...[...src.matchAll(/^\|\s*`([^`]+)`/gm)].map((m) => m[1]),
      ...[...src.matchAll(/\b(?:prop|name):\s*'([^']+)'/g)].map((m) => m[1]),
    ]);

  for (const page of englishPages) {
    const english = read(page);
    for (const locale of config.localeParity.locales) {
      const sibling = page.replace('/content/en/', `/content/${locale}/`);
      if (!existsSync(join(root, sibling))) continue;
      const translated = read(sibling);

      if (
        JSON.stringify(sampleFiles(page)) !==
        JSON.stringify(sampleFiles(sibling))
      ) {
        errors.push(
          `${sibling}: code samples differ from ${page} — both must show the same snippet files in the same order`,
        );
      }

      const englishSections = sectionCount(english);
      const translatedSections = sectionCount(translated);
      if (englishSections !== translatedSections) {
        errors.push(
          `${sibling}: ${translatedSections} sections where ${page} has ${englishSections}`,
        );
      }

      const englishIds = identifiers(english);
      const translatedIds = identifiers(translated);
      const missingIds = [...englishIds].filter((id) => !translatedIds.has(id));
      const extraIds = [...translatedIds].filter((id) => !englishIds.has(id));
      if (missingIds.length) {
        errors.push(
          `${sibling}: table rows missing versus ${page}: ${missingIds.join(', ')}`,
        );
      }
      if (extraIds.length) {
        errors.push(
          `${sibling}: table rows with no English counterpart: ${extraIds.join(', ')}`,
        );
      }
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
