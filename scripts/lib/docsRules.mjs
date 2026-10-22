// Small decisions docs-check makes about a single page or package, kept apart
// from the script so they can be tested without a repository on disk.

/**
 * Whether `symbol` appears written as code: in backticks, as a component tag,
 * or called or parameterised. Names such as `first`, `last` or `Counter` are
 * also ordinary English words, and a translation rightly drops the word while
 * it must keep the identifier.
 *
 * @param {string} haystack - Page text, code samples included.
 * @param {string} symbol - Exported name.
 * @returns {boolean} True when the page names the symbol as code.
 */
export function mentionsAsCode(haystack, symbol) {
  const name = symbol.replace(/\$/g, '\\$');
  return new RegExp(`\`${name}\\b|<${name}\\b|\\b${name}[<(]`).test(haystack);
}

/**
 * Components a reference page documents below its hooks section. A binding's
 * API page reads from what a reader renders to what they call: components
 * first, then the hooks or composables that read their state. A component
 * filed after the hooks, under a utilities heading, is where a reader looking
 * for it stops scanning.
 *
 * @param {string} src - Page or mirror text.
 * @param {string[]} valueNames - Runtime exports of the package.
 * @returns {string[]} Component headings that sit after the first `## Hooks`
 * or `## Composables` heading; empty when the page has no such heading.
 */
export function componentsAfterHooks(src, valueNames) {
  // A styling section names its groups after the parts they style — a
  // `### Counter` of theming tokens — which is not where the component is
  // documented, so subheadings there are left out.
  let parent = '';
  const headings = [
    ...src.matchAll(/^(#{2,3})\s+(.+?)(?:\s*\[#[^\]]+\])?\s*$/gm),
  ]
    .map((m) => {
      const heading = { level: m[1].length, text: m[2].trim(), index: m.index };
      if (heading.level === 2) parent = heading.text;
      return { ...heading, parent };
    })
    .filter(
      (h) =>
        h.level === 2 || !/CSS|Theming|Token|Class|Keyboard/i.test(h.parent),
    );
  const hooks = headings.find(
    (h) => h.level === 2 && /^(Hooks|Composables)$/.test(h.text),
  );
  if (!hooks) return [];
  const components = new Set(
    valueNames.filter((n) => /^[A-Z][a-z]/.test(n) && !/^use[A-Z]/.test(n)),
  );
  return headings
    .filter((h) => h.index > hooks.index && components.has(h.text))
    .map((h) => h.text);
}

/**
 * `@internal` exports a package may not have. `stripInternal` deletes an
 * `@internal` declaration from the published types, so in such a package the
 * tag does not hide a symbol from the docs, it takes its type away from every
 * consumer who imports it.
 *
 * @param {{ compilerOptions?: { stripInternal?: boolean } }} tsconfig - The
 * package's parsed `tsconfig.lib.json`.
 * @param {string[]} internalNames - Exports tagged `@internal`.
 * @returns {string[]} The names that would lose their published type.
 */
export function strippedInternals(tsconfig, internalNames) {
  return tsconfig.compilerOptions?.stripInternal ? [...internalNames] : [];
}
