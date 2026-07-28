import { describe, expect, it } from 'vitest';

// Every source file in the app, read as text. `import.meta.glob` resolves at
// build time, so this works under Vitest without touching the filesystem.
const sources = import.meta.glob('../../**/*.{ts,tsx}', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * These names are ordinary exports today, so importing one is a deprecation
 * hint rather than an error — nothing in lint or typecheck fails, and the mark
 * would simply vanish on the next major bump. Hence a test. GithubIcon carries
 * the rest of the reason.
 */
const brandIcons = [
  'Github',
  'Gitlab',
  'Twitter',
  'Facebook',
  'Instagram',
  'Linkedin',
  'Youtube',
  'Twitch',
  'Slack',
  'Trello',
  'Figma',
  'Framer',
  'Codepen',
  'Codesandbox',
  'Dribbble',
  'Chrome',
];

function lucideImports(source: string): string[] {
  const names: string[] = [];
  for (const match of source.matchAll(
    /import\s*\{([^}]*)\}\s*from\s*'lucide-[^']*'/g,
  )) {
    for (const raw of match[1].split(',')) {
      const name = raw
        .trim()
        .split(/\s+as\s+/)[0]
        .trim();
      if (name) names.push(name);
    }
  }
  return names;
}

describe('brand icons', () => {
  it('reads every source file', () => {
    expect(Object.keys(sources).length).toBeGreaterThan(20);
  });

  it('imports no deprecated brand icon from lucide', () => {
    const offenders: string[] = [];
    for (const [path, source] of Object.entries(sources)) {
      for (const name of lucideImports(source)) {
        if (brandIcons.includes(name)) offenders.push(`${path}: ${name}`);
      }
    }
    expect(offenders, offenders.join('\n')).toEqual([]);
  });
});
