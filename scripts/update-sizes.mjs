#!/usr/bin/env node

/**
 * Measures gzip sizes of built library packages using package-build-stats
 * and updates all size references across README files.
 *
 * Usage:
 *   node scripts/update-sizes.mjs          # measure & update
 *   node scripts/update-sizes.mjs --check  # CI mode — fail if sizes are stale
 */

import { readFileSync, writeFileSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPackageStats } from 'package-build-stats';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

const isCheck = process.argv.includes('--check');

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
];

async function measure(pkg) {
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
      `  ✗ ${pkg.name}: measurement failed — run "npx nx run-many -t build" first`,
    );
    console.error(`    ${err.message}`);
    process.exit(1);
  } finally {
    if (patched) {
      writeFileSync(pkgJsonPath, original, 'utf8');
    }
  }
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Replaces size references for a given package in a file.
 *
 * Patterns matched:
 *   1. shields.io badge:  "gzip-3.7%20kB" or "core%20gzip-3.7%20kB"
 *   2. Inline text:       "~3.7 kB gzip"
 *   3. Table cell:        "| 3.7 kB" in the row containing the package name
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

  for (const [name, kB] of sizesMap) {
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

    // Table cell — match the row for this specific package
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

  // Update "ReelKit (core + react)" combined gzip in comparison table
  const core = results.find((r) => r.name === '@reelkit/core');
  const react = results.find((r) => r.name === '@reelkit/react');
  if (core && react) {
    const combined = ((core.bytes + react.bytes) / 1024).toFixed(1);
    content = content.replace(
      /(name:\s*'ReelKit \(core \+ react\)'.*?gzip:\s*')\d+\.\d+ kB/s,
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
for (const r of results) {
  const css = r.cssKB !== '-' ? `  css: ${r.cssGzipKB} kB` : '';
  console.log(
    `  ${r.name.padEnd(maxName)}  js: ${r.jsKB} kB  gzip: ${r.kB} kB${css}`,
  );
}
console.log();

const allSizes = new Map(results.map((r) => [r.name, r.kB]));

const filesToUpdate = [
  resolve(root, 'README.md'),
  ...results.map((r) => resolve(root, 'packages', r.dir, 'README.md')),
];

let changed = 0;
for (const f of filesToUpdate) {
  const rel = f.replace(root + '/', '');
  const pkg = results.find((r) => f.includes(`/packages/${r.dir}/`));
  const sizes = pkg ? new Map([[pkg.name, pkg.kB]]) : allSizes;

  if (updateFile(f, sizes)) {
    changed++;
    console.log(`  ${isCheck ? '✗ stale' : '✓ updated'}  ${rel}`);
  } else {
    console.log(`  · no change  ${rel}`);
  }
}

// Docs Installation.tsx
const docsFile = resolve(root, 'apps/docs/src/pages/docs/Installation.tsx');
const docsRel = docsFile.replace(root + '/', '');
if (updateDocs(docsFile, results)) {
  changed++;
  console.log(`  ${isCheck ? '✗ stale' : '✓ updated'}  ${docsRel}`);
} else {
  console.log(`  · no change  ${docsRel}`);
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
