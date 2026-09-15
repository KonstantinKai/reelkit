import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative } from 'node:path';

const contentDir = import.meta.dirname;

function contentFiles(): string[] {
  const found: string[] = [];
  const walk = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else if (entry.name.endsWith('.mdx')) found.push(path);
    }
  };
  walk(contentDir);
  return found.sort();
}

const files = contentFiles().map((path) => ({
  name: relative(contentDir, path),
  source: readFileSync(path, 'utf8'),
}));

/** Everything outside the frontmatter and the import lines. */
const body = (source: string) =>
  source.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^import\s.*$/gm, '');

describe.each(files)('content file $name', ({ source }) => {
  it('has a title and a description', () => {
    const frontmatter = source.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
    expect(frontmatter).toMatch(/^title:\s*\S/m);
    expect(frontmatter).toMatch(/^description:\s*\S/m);
  });

  // The build derives page meta from the frontmatter and injects it. A
  // hand-written export would collide with the injected one, or quietly
  // replace the locale-aware tags with whatever one translation wrote.
  it('leaves page meta to the frontmatter', () => {
    expect(body(source)).not.toMatch(/^export\s+(const|function)\s+meta\b/m);
  });

  // A sample written into the prose is a copy per locale, and copies drift.
  // Samples live once under `snippets/` and every locale imports the same
  // file, so a fix lands everywhere and the translations cannot disagree.
  it('takes every code sample from a shared snippet file', () => {
    expect(body(source)).not.toMatch(/^\s*```/m);
    expect(body(source)).not.toMatch(/code=\{`/);

    const snippets = new Map(
      [...source.matchAll(/^import (\w+) from '([^']+)';$/gm)].map((match) => [
        match[1],
        match[2],
      ]),
    );
    for (const [, name] of source.matchAll(
      /<(?:CodeBlock|Sandbox)\b[^>]*\bcode=\{(\w+)\}/g,
    )) {
      expect(
        snippets.get(name),
        `code={${name}} is not a snippet import`,
      ).toMatch(/\/snippets\/.+\?raw$/);
    }
  });

  // Styling belongs to the component map and the stylesheet; a class name in
  // content is one more thing every translation would have to copy.
  it('carries no class names', () => {
    expect(body(source)).not.toMatch(/\bclassName=/);
  });

  // Markdown only closes `**` when it is right-flanking: punctuation just
  // inside it needs whitespace or punctuation just outside. Chinese writes
  // `**键盘：**方向键` with no space, so the asterisks print as text and the
  // words are never bold. A space after the closing run fixes it.
  it('closes every bold run that ends in punctuation', () => {
    const offenders: string[] = [];
    for (const line of body(source).split('\n')) {
      if (/^\s*</.test(line)) continue;
      const prose = line.replace(/`[^`]*`/g, (code) => 'x'.repeat(code.length));
      const runs = [...prose.matchAll(/\*\*/g)].map((match) => match.index);
      for (let index = 1; index < runs.length; index += 2) {
        const at = runs[index];
        const before = prose[at - 1] ?? '';
        const after = prose[at + 2] ?? '';
        if (/[\p{P}\p{S}]/u.test(before) && /[\p{L}\p{N}]/u.test(after)) {
          offenders.push(line.trim());
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  // A legacy link whose target was an object, `to={{ hash: '#theming' }}`,
  // once converted to `[Theming](undefined)`. The page text stayed identical,
  // so only the link target itself can show it.
  it('links to a site path, a heading on the page, or a full URL', () => {
    const headings = new Set(
      [...source.matchAll(/^#{2,3} .*\[#([\w-]+)\]\s*$/gm)].map(
        (match) => match[1],
      ),
    );
    for (const [, target] of body(source).matchAll(/\]\(([^)\s]*)\)/g)) {
      expect(target, `link target "${target}"`).toMatch(
        /^(\/|#[\w-]+$|https?:\/\/)/,
      );
      if (target.startsWith('#')) {
        expect(headings, `no heading for "${target}"`).toContain(
          target.slice(1),
        );
      }
    }
  });
});
