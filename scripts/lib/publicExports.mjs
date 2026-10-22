// Names a package index publishes, read from its source text. Every
// re-export block counts, whatever its form — `export { a, type B } from
// './x'`, `export type { A } from './x'`, an inline `type` specifier — plus
// the declarations the file makes itself. A block re-exported from another
// package (a bare specifier) is left out: that package documents it.

/** One re-export block, in any of its forms; the names, then the module. */
export const kReexportBlock =
  /export\s*(?:type\s*)?\{([^}]*)\}\s*(?:from\s*['"]([^'"]+)['"])?/g;

/** A declaration the file makes itself: `export const X`, `export type X`, … */
export const kOwnDeclaration =
  /^\s*export\s+(?:declare\s+)?(?:const|let|var|function|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm;

/**
 * @param {string} src - The index file's source text.
 * @returns {{ names: string[]; valueNames: string[]; hasStarExport: boolean }}
 * The published names, sorted; the subset of them that exist at runtime —
 * components, factories, composables, everything a reader can call or render,
 * as opposed to a type alias or an interface, which only a signature mentions;
 * and whether an `export * from` left some of them unenumerable.
 */
export function publicExportNames(src) {
  const names = new Set();
  const values = new Set();

  for (const block of src.matchAll(kReexportBlock)) {
    const from = block[2];
    if (from && !from.startsWith('.')) continue;
    // A `export type { … }` block publishes types whatever its specifiers say.
    const typeBlock = /^export\s+type\s*\{/.test(block[0]);
    // Blocks group their names under comments; left in, a comment glues
    // itself to the next name and that name fails the identifier check.
    const specs = block[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    for (let spec of specs.split(',')) {
      spec = spec.trim();
      if (!spec) continue;
      const inlineType = /^type\s+/.test(spec);
      spec = spec.replace(/^type\s+/, '');
      const as = spec.match(/\bas\s+([A-Za-z_$][\w$]*)$/);
      const name = as ? as[1] : spec;
      names.add(name);
      if (!typeBlock && !inlineType) values.add(name);
    }
  }

  for (const m of src.matchAll(kOwnDeclaration)) {
    names.add(m[1]);
    if (!/\b(?:interface|type)\s+$/.test(m[0].slice(0, -m[1].length))) {
      values.add(m[1]);
    }
  }

  names.delete('default');
  values.delete('default');
  const identifier = (n) => /^[A-Za-z_$][\w$]*$/.test(n);
  return {
    names: [...names].filter(identifier).sort(),
    valueNames: [...values].filter(identifier).sort(),
    hasStarExport: /^\s*export\s+\*\s+from/m.test(src),
  };
}

/** Each specifier of a relative re-export block: the local and published name. */
function relativeSpecifiers(src) {
  const specs = [];
  for (const block of src.matchAll(kReexportBlock)) {
    const from = block[2];
    if (!from || !from.startsWith('.')) continue;
    const body = block[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    for (let spec of body.split(',')) {
      spec = spec.trim().replace(/^type\s+/, '');
      if (!spec) continue;
      const [local, published = local] = spec.split(/\s+as\s+/);
      specs.push({ local, published, from });
    }
  }
  return specs;
}

/** Whether the doc block directly above `name`'s declaration carries `@internal`. */
function declaresInternal(src, name) {
  const declaration = new RegExp(
    `(\\/\\*\\*(?:(?!\\*\\/)[\\s\\S])*\\*\\/)\\s*export\\s+(?:declare\\s+)?(?:const|let|var|function|class|interface|type|enum)\\s+${name.replace(/\$/g, '\\$')}\\b`,
  );
  const match = src.match(declaration);
  return match ? /@internal\b/.test(match[1]) : false;
}

/** Whether the module declares `name` itself, documented or not. */
const declares = (src, name) =>
  new RegExp(
    `^\\s*export\\s+(?:declare\\s+)?(?:const|let|var|function|class|interface|type|enum)\\s+${name.replace(/\$/g, '\\$')}\\b`,
    'm',
  ).test(src);

/**
 * Published names whose declaration is tagged `@internal`. The tag sits on the
 * declaration, which a package index rarely holds itself: it re-exports from
 * a module, and that module may in turn re-export from another. So the lookup
 * follows the name through up to two relative hops before reading the doc
 * block directly above its declaration.
 *
 * @param {string} indexSrc - The package index's source text.
 * @param {(fromDir: string, specifier: string) => { src: string; dir: string } | null} resolve
 * Loads the module a relative specifier points at, seen from a directory;
 * null when it cannot be found. Injected so the lookup runs without a disk.
 * @param {string} indexDir - Directory the index lives in.
 * @returns {string[]} The published names to leave out of the docs gate, sorted.
 */
export function internalExportNames(indexSrc, resolve, indexDir) {
  const internal = new Set();

  for (const m of indexSrc.matchAll(kOwnDeclaration)) {
    if (declaresInternal(indexSrc, m[1])) internal.add(m[1]);
  }

  const isInternal = (name, fromDir, specifier, hops) => {
    const module = resolve(fromDir, specifier);
    if (!module) return false;
    if (declares(module.src, name)) return declaresInternal(module.src, name);
    if (hops === 0) return false;
    const next = relativeSpecifiers(module.src).find(
      (s) => s.published === name,
    );
    return next
      ? isInternal(next.local, module.dir, next.from, hops - 1)
      : false;
  };

  for (const spec of relativeSpecifiers(indexSrc)) {
    if (isInternal(spec.local, indexDir, spec.from, 1)) {
      internal.add(spec.published);
    }
  }
  return [...internal].sort();
}
