import { describe, expect, it } from 'vitest';
import { renderChangelog } from './renderChangelog';

// eslint-disable-next-line @nx/enforce-module-boundaries
import changelogRaw from '../../../../CHANGELOG.md?raw';

const render = (md: string) => renderChangelog(md);

describe('changelog inline markdown', () => {
  it('renders a plain link as an anchor', () => {
    const html = render('- see [reelkit.dev/zh](https://reelkit.dev/zh) now');
    expect(html).toContain('href="https://reelkit.dev/zh"');
    expect(html).toContain('>reelkit.dev/zh</a>');
    expect(html).not.toContain('](');
  });

  it('renders bold as strong', () => {
    const html = render('- the **System** setting');
    expect(html).toContain('<strong>System</strong>');
    expect(html).not.toContain('**');
  });

  it('still renders a mention link', () => {
    const html = render('- [@eurusik](https://github.com/eurusik)');
    expect(html).toContain('href="https://github.com/eurusik"');
    expect(html).toContain('>@eurusik</a>');
    // One anchor, not a bare mention linked a second time inside the label.
    expect(html.match(/<a /g)).toHaveLength(1);
  });

  it('still links a bare mention and leaves npm scopes alone', () => {
    expect(render('- thanks @eurusik')).toContain(
      'href="https://github.com/eurusik"',
    );
    const scoped = render('- Updated @reelkit/core to 0.7.0');
    expect(scoped).not.toContain('<a ');
  });

  it('leaves markdown inside inline code untouched', () => {
    const html = render('- pass `**literal**` and `[not](a-link)` through');
    expect(html).toContain('**literal**');
    expect(html).toContain('[not](a-link)');
    expect(html.match(/<a /g)).toBeNull();
  });

  // The body reaches the page through dangerouslySetInnerHTML.
  it('refuses a non-http scheme in a link', () => {
    const html = render('- [click](javascript:alert(1))');
    expect(html).not.toContain('href="javascript:');
  });

  /**
   * The guard that would have caught this: it reads the real changelog rather
   * than a fixture, so an inline construct introduced by a future entry fails
   * here instead of shipping to the docs page as literal text.
   */
  it('leaves no raw markdown in the rendered changelog', () => {
    // Inline code renders its content literally on purpose, so a bracket or
    // asterisk inside a code span is not leftover markdown.
    const html = renderChangelog(changelogRaw).replace(
      /<code\b[^>]*>[\s\S]*?<\/code>/g,
      '',
    );
    const leftovers: string[] = [];
    for (const match of html.matchAll(/\[[^\]\n]+\]\([^)\n]+\)/g)) {
      leftovers.push(`link: ${match[0]}`);
    }
    for (const match of html.matchAll(/\*\*[^*\n]+\*\*/g)) {
      leftovers.push(`bold: ${match[0]}`);
    }
    expect(leftovers, leftovers.join('\n')).toEqual([]);
  });
});
