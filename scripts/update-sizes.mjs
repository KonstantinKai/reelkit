#!/usr/bin/env node

/**
 * Measures gzip sizes of built library packages using package-build-stats
 * and updates all size references across README files.
 *
 * Usage:
 *   node scripts/update-sizes.mjs            # measure & update
 *   node scripts/update-sizes.mjs --check    # CI mode — fail if sizes are stale
 *   node scripts/update-sizes.mjs --dry-run  # measure & print table only
 */

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPackageStats } from 'package-build-stats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const isCheck = process.argv.includes('--check');
const isDryRun = process.argv.includes('--dry-run');

// NOTE: `externalize` lists dependencies that should be treated as externals
// (peer deps) during measurement so each package reports its own code size only.
const packages = [
  { name: '@reelkit/core', dir: 'reelkit-core', externalize: [] },
  {
    name: '@reelkit/react',
    dir: 'reelkit-react',
    externalize: ['@reelkit/core'],
  },
  {
    name: '@reelkit/react-reel-player',
    dir: 'reelkit-react-reel-player',
    externalize: ['@reelkit/core', '@reelkit/react', 'lucide-react'],
  },
  {
    name: '@reelkit/react-lightbox',
    dir: 'reelkit-react-lightbox',
    externalize: ['@reelkit/core', '@reelkit/react', 'lucide-react'],
  },
  {
    name: '@reelkit/stories-core',
    dir: 'reelkit-stories-core',
    externalize: ['@reelkit/core'],
  },
  {
    name: '@reelkit/react-stories-player',
    dir: 'reelkit-react-stories-player',
    externalize: [
      '@reelkit/core',
      '@reelkit/react',
      '@reelkit/stories-core',
      'lucide-react',
    ],
  },
  {
    name: '@reelkit/angular',
    dir: 'reelkit-angular',
    ngPackagr: true,
  },
  {
    name: '@reelkit/angular-reel-player',
    dir: 'reelkit-angular-reel-player',
    ngPackagr: true,
  },
  {
    name: '@reelkit/angular-lightbox',
    dir: 'reelkit-angular-lightbox',
    ngPackagr: true,
  },
  {
    name: '@reelkit/angular-stories-player',
    dir: 'reelkit-angular-stories-player',
    ngPackagr: true,
  },
  {
    name: '@reelkit/vue',
    dir: 'reelkit-vue',
    externalize: ['@reelkit/core'],
  },
  {
    name: '@reelkit/vue-reel-player',
    dir: 'reelkit-vue-reel-player',
    externalize: ['@reelkit/core', '@reelkit/vue', 'lucide-vue-next'],
  },
  {
    name: '@reelkit/vue-lightbox',
    dir: 'reelkit-vue-lightbox',
    externalize: ['@reelkit/core', '@reelkit/vue', 'lucide-vue-next'],
  },
  {
    name: '@reelkit/vue-stories-player',
    dir: 'reelkit-vue-stories-player',
    externalize: [
      '@reelkit/core',
      '@reelkit/vue',
      '@reelkit/stories-core',
      'lucide-vue-next',
    ],
  },
];

/**
 * Measures ng-packagr output directly from the fesm2022 bundle.
 * package-build-stats cannot handle Angular's compiled output format.
 */
function measureNgPackagr(pkg) {
  const distDir = resolve(root, 'dist', 'packages', pkg.dir);
  const bundleName = pkg.dir.replace(/-/g, '-') + '.mjs';
  const bundlePath = resolve(distDir, 'fesm2022', bundleName);

  let jsBuf;
  try {
    jsBuf = readFileSync(bundlePath);
  } catch {
    console.error(
      `  ✗ ${pkg.name}: fesm2022 bundle not found — run "pnpm exec nx run-many -t build" first`,
    );
    process.exit(1);
  }

  const gzipped = gzipSync(jsBuf);
  const jsKB = (jsBuf.length / 1024).toFixed(1);
  const gzipKB = (gzipped.length / 1024).toFixed(1);

  // ng-packagr copies each stylesheet next to the bundle and leaves
  // `styles.css` as nothing but `@import` lines, so what a consumer downloads
  // is every stylesheet in the directory, not that one file.
  let cssKB = '-';
  let cssGzipKB = '-';
  const stylesheets = readdirSync(distDir)
    .filter((file) => file.endsWith('.css') && file !== 'styles.css')
    .sort();
  if (stylesheets.length > 0) {
    const cssBuf = Buffer.concat(
      stylesheets.map((file) => readFileSync(resolve(distDir, file))),
    );
    cssKB = (cssBuf.length / 1024).toFixed(1);
    cssGzipKB = (gzipSync(cssBuf).length / 1024).toFixed(1);
  }

  return {
    name: pkg.name,
    dir: pkg.dir,
    bytes: gzipped.length,
    kB: gzipKB,
    jsKB,
    cssKB,
    cssGzipKB,
  };
}

async function measure(pkg) {
  if (pkg.ngPackagr) return measureNgPackagr(pkg);

  const pkgDir = resolve(root, 'packages', pkg.dir);
  const pkgJsonPath = resolve(pkgDir, 'package.json');

  let original;
  let patched = false;

  // Temporarily move externalize deps into peerDependencies so
  // package-build-stats excludes them from the bundle.
  if (pkg.externalize.length > 0) {
    original = readFileSync(pkgJsonPath, 'utf8');
    const json = JSON.parse(original);

    json.peerDependencies ??= {};

    for (const dep of pkg.externalize) {
      if (json.dependencies?.[dep]) {
        json.peerDependencies[dep] = json.dependencies[dep];
        delete json.dependencies[dep];
      }
    }

    writeFileSync(pkgJsonPath, JSON.stringify(json, null, 2) + '\n', 'utf8');
    patched = true;
  }

  try {
    const stats = await getPackageStats(pkgDir, { client: 'npm' });
    const gzipKB = (stats.gzip / 1024).toFixed(1);
    const jsKB = (stats.size / 1024).toFixed(1);

    // Measure CSS if present
    const cssPath = resolve(pkgDir, 'dist', 'index.css');
    let cssKB = '-';
    let cssGzipKB = '-';
    try {
      const cssBuf = readFileSync(cssPath);
      cssKB = (cssBuf.length / 1024).toFixed(1);
      cssGzipKB = (gzipSync(cssBuf).length / 1024).toFixed(1);
    } catch {
      // no CSS file
    }

    return {
      name: pkg.name,
      dir: pkg.dir,
      bytes: stats.gzip,
      kB: gzipKB,
      jsKB,
      cssKB,
      cssGzipKB,
    };
  } catch (err) {
    console.error(
      `  ✗ ${pkg.name}: measurement failed — run "pnpm exec nx run-many -t build" first`,
    );
    console.error(`    ${err.message}`);
  } finally {
    if (patched) {
      writeFileSync(pkgJsonPath, original, 'utf8');
    }
  }
  // Only a failed measurement gets here. Exiting inside the catch would skip
  // the finally and leave the package.json with its dependencies moved.
  process.exit(1);
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replaces size references for a given package in a file.
 *
 * Patterns matched:
 *   1. shields.io badge:        "gzip-3.7%20kB" or "core%20gzip-3.7%20kB"
 *   2. Inline text:             "~3.7 kB gzip"
 *   3. Table row, two columns:  "| 3.7 kB | 1.6 kB |" — the JavaScript size
 *      and the stylesheet beside it, both written
 *   4. Table row, one column:   "| 3.7 kB" in the row containing the package
 *      name, for a table that has no stylesheet column
 */
function updateFile(filePath, sizesMap) {
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return false;
  }

  const original = content;

  const isSinglePackage = sizesMap.size === 1;

  for (const [name, size] of sizesMap) {
    const { kB } = size;
    const short = name.replace('@reelkit/', '');

    // shields.io badge with package-name prefix — e.g. "core%20gzip-3.7%20kB"
    const prefixedBadge = new RegExp(
      `(${escapeRegex(short)}%20gzip-)\\d+\\.\\d+(%20kB)`,
      'g',
    );
    content = content.replace(prefixedBadge, `$1${kB}$2`);

    // Inline text with package-name suffix — e.g. "~3.7 kB gzip core"
    const inlineWithSuffix = new RegExp(
      `~\\d+\\.\\d+( kB gzip ${escapeRegex(short)})`,
      'g',
    );
    content = content.replace(inlineWithSuffix, `~${kB}$1`);

    // These patterns are NOT package-specific, so only apply them in
    // single-package READMEs where there's no ambiguity.
    if (isSinglePackage) {
      // shields.io badge without prefix — e.g. "gzip-3.7%20kB"
      const plainBadge = new RegExp(
        `((?<!\\w%20)gzip-)\\d+\\.\\d+(%20kB)`,
        'g',
      );
      content = content.replace(plainBadge, `$1${kB}$2`);

      // Inline text without suffix — e.g. "~3.7 kB gzip" or "~3.7 kB gzip."
      content = content.replace(/~\d+\.\d+( kB gzip)(?!\s*\w)/g, `~${kB}$1`);
    }

    // Table row — this package's own row, JavaScript column then the CSS one
    // beside it. The two-column form runs first: the single-column pattern
    // below would stop at the JavaScript number and leave a stale stylesheet
    // size behind it, which is how the root table drifted before. A package
    // that ships no stylesheet keeps the em dash.
    const cssCell = size.cssGzipKB === '-' ? '—' : `${size.cssGzipKB} kB`;
    const twoColumnRow = new RegExp(
      `(\\|[^|]*${escapeRegex(name)}[^|]*\\|[^|]*\\|\\s*)\\d+\\.\\d+ kB(\\s*\\|\\s*)(?:\\d+\\.\\d+ kB|—)(\\s*\\|)`,
      'g',
    );
    content = content.replace(twoColumnRow, `$1${kB} kB$2${cssCell}$3`);

    const tableRowPattern = new RegExp(
      `(\\|[^|]*${escapeRegex(name)}[^|]*\\|[^|]*\\|\\s*)\\d+\\.\\d+( kB\\s*\\|)`,
      'g',
    );
    content = content.replace(tableRowPattern, `$1${kB}$2`);
  }

  if (content !== original) {
    if (!isCheck) {
      writeFileSync(filePath, content, 'utf8');
    }
    return true;
  }
  return false;
}

/**
 * Updates the bundleSizes array and comparison table in Installation.tsx.
 */
function updateDocs(filePath, results) {
  let content;
  try {
    content = readFileSync(filePath, 'utf8');
  } catch {
    return false;
  }

  const original = content;

  for (const r of results) {
    const eName = escapeRegex(r.name);

    // bundleSizes entry — match the object block for this package and replace js/gzip/css/cssGzip values
    // js: '14.5 kB' → js: '12.3 kB'
    const blockPattern = new RegExp(
      `(name:\\s*'${eName}'[^}]*?js:\\s*')\\d+\\.\\d+ kB('.*?gzip:\\s*')\\d+\\.\\d+ kB('.*?css:\\s*')(?:\\d+\\.\\d+ kB|-)('.*?cssGzip:\\s*')(?:\\d+\\.\\d+ kB|-)`,
      's',
    );
    content = content.replace(
      blockPattern,
      `$1${r.jsKB} kB$2${r.kB} kB$3${r.cssKB === '-' ? '-' : r.cssKB + ' kB'}$4${r.cssGzipKB === '-' ? '-' : r.cssGzipKB + ' kB'}`,
    );
  }

  // Update combined gzip sizes in comparison table
  const core = results.find((r) => r.name === '@reelkit/core');
  const react = results.find((r) => r.name === '@reelkit/react');
  const angular = results.find((r) => r.name === '@reelkit/angular');
  const vue = results.find((r) => r.name === '@reelkit/vue');

  if (core && react) {
    const combined = ((core.bytes + react.bytes) / 1024).toFixed(1);
    content = content.replace(
      /(name:\s*'ReelKit \(core \+ react\)'.*?gzip:\s*')\d+\.\d+ kB/s,
      `$1${combined} kB`,
    );
  }

  if (core && angular) {
    const combined = ((core.bytes + angular.bytes) / 1024).toFixed(1);
    content = content.replace(
      /(name:\s*'ReelKit \(core \+ angular\)'.*?gzip:\s*')\d+\.\d+ kB/s,
      `$1${combined} kB`,
    );
  }

  if (core && vue) {
    const combined = ((core.bytes + vue.bytes) / 1024).toFixed(1);
    content = content.replace(
      /(name:\s*'ReelKit \(core \+ vue\)'.*?gzip:\s*')\d+\.\d+ kB/s,
      `$1${combined} kB`,
    );
  }

  if (content !== original) {
    if (!isCheck) {
      writeFileSync(filePath, content, 'utf8');
    }
    return true;
  }
  return false;
}

console.log('Measuring gzip sizes…\n');

const results = [];
for (const pkg of packages) {
  const result = await measure(pkg);
  results.push(result);
}

const maxName = Math.max(...results.map((r) => r.name.length));

if (isDryRun) {
  const maxJs = Math.max(...results.map((r) => r.jsKB.length));
  const maxGzip = Math.max(...results.map((r) => r.kB.length));
  const hasCss = results.some((r) => r.cssKB !== '-');

  const header =
    `  ${'Package'.padEnd(maxName)}  ${'JS'.padStart(maxJs + 3)}  ${'Gzip'.padStart(maxGzip + 3)}` +
    (hasCss ? '  CSS (gzip)' : '');
  const separator =
    `  ${'─'.repeat(maxName)}  ${'─'.repeat(maxJs + 3)}  ${'─'.repeat(maxGzip + 3)}` +
    (hasCss ? `  ${'─'.repeat(12)}` : '');

  console.log(header);
  console.log(separator);
  for (const r of results) {
    const css =
      hasCss && r.cssKB !== '-' ? `  ${r.cssGzipKB.padStart(7)} kB` : '';
    console.log(
      `  ${r.name.padEnd(maxName)}  ${r.jsKB.padStart(maxJs)} kB  ${r.kB.padStart(maxGzip)} kB${css}`,
    );
  }
  console.log();
  process.exit(0);
}

for (const r of results) {
  const css = r.cssKB !== '-' ? `  css: ${r.cssGzipKB} kB` : '';
  console.log(
    `  ${r.name.padEnd(maxName)}  js: ${r.jsKB} kB  gzip: ${r.kB} kB${css}`,
  );
}
console.log();

const allSizes = new Map(results.map((r) => [r.name, r]));

const filesToUpdate = [
  resolve(root, 'README.md'),
  ...results.map((r) => resolve(root, 'packages', r.dir, 'README.md')),
];

let changed = 0;
for (const f of filesToUpdate) {
  const rel = f.replace(root + '/', '');
  const pkg = results.find((r) => f.includes(`/packages/${r.dir}/`));
  const sizes = pkg ? new Map([[pkg.name, pkg]]) : allSizes;

  if (updateFile(f, sizes)) {
    changed++;
    console.log(`  ${isCheck ? '✗ stale' : '✓ updated'}  ${rel}`);
  } else {
    console.log(`  · no change  ${rel}`);
  }
}

// The docs size tables, in every language, render the shared data module.
for (const page of ['apps/docs/src/data/bundleSizes.ts']) {
  const docsFile = resolve(root, page);
  if (updateDocs(docsFile, results)) {
    changed++;
    console.log(`  ${isCheck ? '✗ stale' : '✓ updated'}  ${page}`);
  } else {
    console.log(`  · no change  ${page}`);
  }
}

// The landing page quotes the core gzip figure in a sentence, once per
// language. One page serves every locale now, so the sentences live in the
// chrome dictionaries. Prose is where a number goes stale unnoticed, so the
// digits are rewritten in place and the wording around them is left to the
// translator.
const core = results.find((r) => r.name === '@reelkit/core');
for (const page of [
  'apps/docs/src/i18n/home/en.ts',
  'apps/docs/src/i18n/home/uk.ts',
  'apps/docs/src/i18n/home/zh.ts',
  'apps/docs/src/i18n/home/pt.ts',
  'apps/docs/src/i18n/home/ja.ts',
  'apps/docs/src/i18n/home/hi.ts',
  'apps/docs/src/i18n/home/es.ts',
]) {
  if (!core) break;

  const file = resolve(root, page);
  let content;
  try {
    content = readFileSync(file, 'utf8');
  } catch {
    continue;
  }

  const updated = content.replace(
    /(description:\s*'[^']*?)\d+\.\d+( (?:kB|кБ)[^']*')/,
    `$1${core.kB}$2`,
  );

  if (updated === content) {
    console.log(`  · no change  ${page}`);
    continue;
  }

  changed++;
  if (!isCheck) writeFileSync(file, updated, 'utf8');
  console.log(`  ${isCheck ? '✗ stale' : '✓ updated'}  ${page}`);
}

console.log();

if (isCheck && changed > 0) {
  console.error(
    `${changed} file(s) have stale size references. Run "node scripts/update-sizes.mjs" to fix.`,
  );
  process.exit(1);
}

if (!isCheck) {
  console.log(
    changed > 0 ? `Updated ${changed} file(s).` : 'All sizes are up to date.',
  );
}
