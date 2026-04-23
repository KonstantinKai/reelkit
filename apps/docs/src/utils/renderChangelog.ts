/**
 * Minimal markdown-to-HTML for changelog format.
 * Handles: ## h2, ### h3, - list items (wrapped in ul), inline `code`,
 * empty lines. Escapes raw HTML characters inside inline code so literal
 * tags like `<Reel>` survive the render instead of being interpreted
 * (and silently swallowed) by the browser.
 */
const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const renderInlineCode = (inner: string): string =>
  `<code class="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono text-slate-800 dark:text-slate-200">${escapeHtml(inner)}</code>`;

const _kPlaceholderPrefix = '__RK_CODE_';
const _kPlaceholderSuffix = '__';
const _kPlaceholderPattern = /__RK_CODE_(\d+)__/g;

// Processes a line in two phases so mention-linking doesn't accidentally
// match content that lives inside inline `code`:
//   1. extract backtick spans into placeholders
//   2. run mention-linking on the remainder
//   3. swap placeholders back for their rendered <code>…</code> HTML
const linkMentions = (text: string): string => {
  const codeHtml: string[] = [];
  const withPlaceholders = text.replace(/`([^`]+)`/g, (_, inner) => {
    codeHtml.push(renderInlineCode(inner));
    return `${_kPlaceholderPrefix}${codeHtml.length - 1}${_kPlaceholderSuffix}`;
  });

  const linked = withPlaceholders
    .replace(
      /\[(@[a-zA-Z\d](?:[a-zA-Z\d-]*[a-zA-Z\d])?)\]\((https?:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">$1</a>',
    )
    .replace(
      // Match @username GitHub mentions, but NOT npm scopes like @reelkit/pkg.
      // Trailing negative lookahead forbids alphanumeric/hyphen (prevents
      // regex backtracking to a shorter username like @reelki for @reelkit/x)
      // AND `]` (avoid double-linking) AND `/` (npm scope separator).
      /(?<!\[)@([a-zA-Z\d](?:[a-zA-Z\d-]*[a-zA-Z\d])?)(?![a-zA-Z\d\-\]/])/g,
      '<a href="https://github.com/$1" target="_blank" rel="noopener noreferrer" class="text-primary-600 dark:text-primary-400 hover:underline">@$1</a>',
    );

  return linked.replace(_kPlaceholderPattern, (_, i) => codeHtml[Number(i)]);
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
      output.push(`<li>${linkMentions(line.slice(2))}</li>`);
    } else if (line.trim() !== '') {
      output.push(
        `<p class="text-sm text-slate-600 dark:text-slate-400 mb-2">${linkMentions(line)}</p>`,
      );
    }
  }

  if (inList) {
    output.push('</ul>');
  }

  return output.join('\n');
}
