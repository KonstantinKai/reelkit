// Gives the relative imports in emitted declaration files the extensions an
// ES module consumer needs.
//
// The packages declare `"type": "module"`, so TypeScript reads every published
// `.d.ts` as an ES module. Under `moduleResolution: node16` or `nodenext` an
// ES module may only import a relative path that names its file, and a folder
// import is not allowed at all. The sources are written for bundler
// resolution, without extensions, and the declarations carry those
// specifiers over unchanged, so a consumer on `nodenext` resolves nothing and
// every export of the package silently becomes `any`.
//
// Whether a specifier names a file or a folder is read from the sources, not
// from the output folder: the declaration plugin writes its files in parallel
// into a freshly emptied folder, so a sibling declaration may not exist yet
// when a file is rewritten.

import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const _kSourceExtensions = ['.ts', '.tsx', '.mts', '.cts'];
const _kKeptExtension = /\.(?:[cm]?js|json|d\.[cm]?ts)$/;

/**
 * Blanks out comments while leaving string and template literals alone, so
 * an import quoted in a JSDoc example is never rewritten and a `//` inside a
 * template literal type is never mistaken for a comment. Every offset stays
 * where it was, line breaks included.
 *
 * @param {string} code - Declaration file text.
 * @returns {string} The same text with comment characters replaced by spaces.
 */
function maskComments(code) {
  let out = '';
  let index = 0;
  while (index < code.length) {
    const char = code[index];
    const next = code[index + 1];
    if (char === '/' && next === '/') {
      while (index < code.length && code[index] !== '\n') {
        out += ' ';
        index++;
      }
    } else if (char === '/' && next === '*') {
      const end = code.indexOf('*/', index + 2);
      const stop = end === -1 ? code.length : end + 2;
      for (; index < stop; index++) out += code[index] === '\n' ? '\n' : ' ';
    } else if (char === "'" || char === '"' || char === '`') {
      out += char;
      index++;
      while (index < code.length && code[index] !== char) {
        if (code[index] === '\\') {
          out += code[index];
          index++;
        }
        out += code[index] ?? '';
        index++;
      }
      out += code[index] ?? '';
      index++;
    } else {
      out += char;
      index++;
    }
  }
  return out;
}

/**
 * Builds the rewrite for one package's declarations.
 *
 * @param {{ outDir: string, srcDir: string }} options - The folder the
 *   declarations are written to and the source folder they mirror (the
 *   declaration plugin's `entryRoot`).
 * @returns {(filePath: string, content: string) => string} Rewrites the
 *   declaration written at `filePath`. Throws when a relative specifier names
 *   neither a source file nor a folder with an index, so a build fails rather
 *   than publish a guess.
 */
export function createSpecifierRewriter({ outDir, srcDir }) {
  const resolveSpecifier = (sourceFolder, specifier, filePath) => {
    const target = resolve(sourceFolder, specifier);
    if (
      _kSourceExtensions.some((extension) => existsSync(target + extension))
    ) {
      return `${specifier}.js`;
    }
    if (
      _kSourceExtensions.some((extension) =>
        existsSync(join(target, `index${extension}`)),
      )
    ) {
      return `${specifier}/index.js`;
    }
    throw new Error(
      `Cannot add an extension to '${specifier}' in ${filePath}: no source file or folder index at ${target}`,
    );
  };

  return (filePath, content) => {
    const sourceFolder = join(srcDir, relative(outDir, dirname(filePath)));
    const masked = maskComments(content);
    const pattern = /(\bfrom\s*|\bimport\s*\(\s*)(['"])(\.{1,2}\/[^'"]*)\2/g;
    let result = '';
    let last = 0;
    for (const match of masked.matchAll(pattern)) {
      const [, lead, quote, specifier] = match;
      if (_kKeptExtension.test(specifier)) continue;
      const start = match.index + lead.length + quote.length;
      result +=
        content.slice(last, start) +
        resolveSpecifier(sourceFolder, specifier, filePath);
      last = start + specifier.length;
    }
    return result + content.slice(last);
  };
}

/**
 * Turns a rewrite into the declaration plugin's `beforeWriteFile` hook, so
 * every package config hands over its rewriter the same way.
 *
 * @param {(filePath: string, content: string) => string} rewrite - From
 *   {@link createSpecifierRewriter}.
 * @returns {(filePath: string, content: string) => { content: string }} The
 *   hook, which keeps the file path and replaces the content.
 */
export function asBeforeWriteFile(rewrite) {
  return (filePath, content) => ({ content: rewrite(filePath, content) });
}
