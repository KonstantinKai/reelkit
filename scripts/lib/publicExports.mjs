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
