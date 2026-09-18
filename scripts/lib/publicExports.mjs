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
 * @returns {{ names: string[]; hasStarExport: boolean }} The published names,
 * sorted, and whether an `export * from` left some of them unenumerable.
 */
export function publicExportNames(src) {
  const names = new Set();

  for (const block of src.matchAll(kReexportBlock)) {
    const from = block[2];
    if (from && !from.startsWith('.')) continue;
    // Blocks group their names under comments; left in, a comment glues
    // itself to the next name and that name fails the identifier check.
    const specs = block[1]
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/\/\/.*$/gm, '');
    for (let spec of specs.split(',')) {
      spec = spec.trim();
      if (!spec) continue;
      spec = spec.replace(/^type\s+/, '');
      const as = spec.match(/\bas\s+([A-Za-z_$][\w$]*)$/);
      names.add(as ? as[1] : spec);
    }
  }

  for (const m of src.matchAll(kOwnDeclaration)) names.add(m[1]);

  names.delete('default');
  return {
    names: [...names].filter((n) => /^[A-Za-z_$][\w$]*$/.test(n)).sort(),
    hasStarExport: /^\s*export\s+\*\s+from/m.test(src),
  };
}
