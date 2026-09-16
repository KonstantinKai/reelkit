import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const srcDir = join(import.meta.dirname, '..');
const read = (path: string) => readFileSync(join(srcDir, path), 'utf8');

const signalComponents = [
  'components/WhatsNewDialog.tsx',
  'components/demos/BasicSliderDemo.tsx',
  'components/layout/Header.tsx',
  'components/layout/Sidebar.tsx',
  'components/ui/CodeBlock.tsx',
];

// These components keep their state in core signals and re-render only the
// parts that read them through `Observe`. `useState` is only the stable holder
// for those signals, created once by its initialiser.
describe('component state', () => {
  it.each(signalComponents)('holds state in core signals in %s', (file) => {
    const source = read(file);
    const holders = [
      ...source.matchAll(/useState(?:<[^>]*>)?\(\s*([^\n]{0,5})/g),
    ];
    for (const [call, argument] of holders) {
      expect(argument.trim(), `${file}: ${call}`).toMatch(/^\(\) =>/);
    }
    expect(source).not.toMatch(/,\s*set[A-Z]\w*\s*\]\s*=\s*useState/);
  });
});

// Work that starts on mount and stops on unmount lives in one effect per
// component or hook, with its teardowns collected in a disposable list, so
// nothing is left running when one of several effects is edited.
const effectCalls = (source: string) =>
  [...source.matchAll(/useEffect\(/g)].map(({ index }) => {
    let depth = 0;
    for (let end = index; end < source.length; end++) {
      if (source[end] === '(') depth++;
      if (source[end] === ')' && --depth === 0) {
        return source.slice(index, end + 1);
      }
    }
    return source.slice(index);
  });

describe('mount effects', () => {
  it.each(signalComponents)(
    'runs at most one mount effect per function in %s',
    (file) => {
      const functions = read(file).split(/^(?:export )?function /m);
      for (const body of functions) {
        const name = body.slice(0, body.indexOf('('));
        const mountEffects = effectCalls(body).filter((call) =>
          /,\s*\[\]\s*,?\s*\)$/.test(call),
        );
        expect(mountEffects.length, `${file}: ${name}`).toBeLessThanOrEqual(1);
      }
    },
  );

  it('collects the changelog badge teardowns in a disposable list', () => {
    expect(read('components/layout/Sidebar.tsx')).toMatch(
      /createDisposableList\(\)[\s\S]*whenIdle\([\s\S]*reaction\([\s\S]*return disposables\.dispose;/,
    );
  });
});

// Deferring work until the browser is idle has one implementation, so every
// caller gets the same Safari fallback.
describe('idle scheduling', () => {
  it('lives in its own util and is not reimplemented by callers', () => {
    expect(read('utils/whenIdle.ts')).toContain('export function whenIdle');
    expect(read('utils/loadChangelog.ts')).not.toContain('whenIdle');
    for (const file of signalComponents) {
      expect(read(file), file).not.toContain('requestIdleCallback');
    }
    expect(read('components/ui/CodeBlock.tsx')).toContain(
      "import { whenIdle } from '../../utils/whenIdle';",
    );
  });
});
