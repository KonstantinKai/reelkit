/**
 * Minimal markdown-to-HTML for changelog format.
 *
 * Handles headings, `- ` lists, and the inline subset the changelog actually
 * uses: `code`, [links](url), **bold**, and bare @mentions. Raw HTML
 * characters inside inline code are escaped so a literal tag like `<Reel>`
 * survives the render instead of being interpreted, and silently swallowed,
 * by the browser.
 *
 * Anything outside that subset renders as its literal text on the changelog
 * page, so `renderChangelog.spec.ts` reads the real CHANGELOG.md and fails on
 * a construct this does not cover.
 */
const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderInlineCode = (inner: string): string =>
  `<code class="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-800 dark:text-slate-200">${escapeHtml(inner)}</code>`;

const _kSlotPrefix = '__RK_SLOT_';
const _kSlotSuffix = '__';
const _kSlotPattern = /__RK_SLOT_(\d+)__/g;

const _kAnchorClass = 'text-primary-600 dark:text-primary-400 hover:underline';

const anchor = (href: string, label: string): string =>
  `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer" class="${_kAnchorClass}">${label}</a>`;

// The body reaches the page through dangerouslySetInnerHTML, so a link only
// becomes an href when its scheme is one a reader can judge from the text.
const isSafeHref = (href: string): boolean => /^https?:\/\//i.test(href);

/**
 * Inline pass over one line.
 *
 * Every rule that produces HTML parks it in a slot and leaves a placeholder
 * behind, so no later rule can match inside markup an earlier one generated.
 * Without that, the bare-mention rule reached into the label of a link the
 * previous rule had just built and wrapped `@user` in a second anchor.
 */
const renderInline = (text: string): string => {
  const slots: string[] = [];
  const park = (html: string): string => {
    slots.push(html);
    return `${_kSlotPrefix}${slots.length - 1}${_kSlotSuffix}`;
  };

  let out = text.replace(/`([^`]+)`/g, (_, inner) =>
    park(renderInlineCode(inner)),
  );

  out = out.replace(/\[([^\]\n]+)\]\(([^)\s]+)\)/g, (whole, label, href) =>
    isSafeHref(href) ? park(anchor(href, escapeHtml(label))) : whole,
  );

  // Bare @username mentions, but not npm scopes like @reelkit/core. The
  // lookahead forbids the scope separator, and forbids alphanumerics so the
  // match cannot backtrack to a short prefix such as @reelki of @reelkit/x.
  out = out.replace(
    /@([a-zA-Z\d](?:[a-zA-Z\d-]*[a-zA-Z\d])?)(?![a-zA-Z\d\-/])/g,
    (_, user) =>
      park(anchor(`https://github.com/${user}`, `@${escapeHtml(user)}`)),
  );

  out = out.replace(
    /\*\*([^*\n]+)\*\*/g,
    (_, inner) => `<strong>${inner}</strong>`,
  );

  return out.replace(_kSlotPattern, (_, i) => slots[Number(i)]);
};

export function renderChangelog(md: string): string {
  const lines = md.split('\n');
  const output: string[] = [];
  let inList = false;

  for (const line of lines) {
    const isList = line.startsWith('- ');

    if (isList && !inList) {
      output.push(
        '<ul class="list-disc list-inside space-y-1 mb-4 text-sm text-slate-600 dark:text-slate-400">',
      );
      inList = true;
    } else if (!isList && inList) {
      output.push('</ul>');
      inList = false;
    }

    if (line.startsWith('### ')) {
      output.push(
        `<h3 class="text-base font-semibold mt-5 mb-2 text-slate-800 dark:text-slate-200">${line.slice(4)}</h3>`,
      );
    } else if (line.startsWith('## ')) {
      output.push(
        `<h2 class="text-xl font-bold mt-10 mb-3 pb-2 border-b border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">${line.slice(3)}</h2>`,
      );
    } else if (line.startsWith('# ')) {
      output.push(
        `<h1 class="text-2xl font-bold mt-12 mb-4 text-slate-900 dark:text-white">${line.slice(2)}</h1>`,
      );
    } else if (isList) {
      output.push(`<li>${renderInline(line.slice(2))}</li>`);
    } else if (line.trim() !== '') {
      output.push(
        `<p class="text-sm text-slate-600 dark:text-slate-400 mb-2">${renderInline(line)}</p>`,
      );
    }
  }

  if (inList) {
    output.push('</ul>');
  }

  return output.join('\n');
}
