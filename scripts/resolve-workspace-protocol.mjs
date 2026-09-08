// Rewrites `workspace:` ranges in a built package manifest to the semver
// ranges pnpm would publish.
//
// pnpm does this itself when a package is published from its own workspace
// root, which is where every Vite-built package publishes from. The Angular
// packages publish from `dist/packages/<name>` instead, and there pnpm looks
// for the dependency in that directory's own `node_modules`, finds nothing,
// and refuses with ERR_PNPM_CANNOT_RESOLVE_WORKSPACE_PROTOCOL. So the same
// substitution runs here, from the workspace's own source manifests, before
// the publish step reaches pnpm.
//
// Usage: node scripts/resolve-workspace-protocol.mjs <path/to/package.json>...

import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');

const workspaceVersions = new Map();
for (const dir of readdirSync(join(root, 'packages'), {
  withFileTypes: true,
})) {
  if (!dir.isDirectory()) continue;
  const manifestPath = join(root, 'packages', dir.name, 'package.json');
  if (!existsSync(manifestPath)) continue;
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  if (manifest.name && manifest.version) {
    workspaceVersions.set(manifest.name, manifest.version);
  }
}

const rangeFor = (name, spec) => {
  const version = workspaceVersions.get(name);
  if (!version) {
    throw new Error(
      `${name} is declared with "${spec}" but no workspace package carries that name`,
    );
  }
  const modifier = spec.slice('workspace:'.length);
  if (modifier === '*') return version;
  if (modifier === '^' || modifier === '~') return `${modifier}${version}`;
  return modifier;
};

const fields = [
  'dependencies',
  'peerDependencies',
  'optionalDependencies',
  'devDependencies',
];

for (const manifestPath of process.argv.slice(2)) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  let changed = 0;
  for (const field of fields) {
    for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
      if (typeof spec !== 'string' || !spec.startsWith('workspace:')) continue;
      manifest[field][name] = rangeFor(name, spec);
      changed += 1;
    }
  }
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`${manifestPath}: ${changed} workspace range(s) resolved`);
}
