import { renderChangelog } from './renderChangelog';

export interface ChangelogEntry {
  /** Unique id — `package@version` slice of the `## ` heading (e.g. `@reelkit/core@0.5.0`). */
  id: string;
  /** Raw `## ` heading text (without the leading `## `). */
  title: string;
  /** ISO date `YYYY-MM-DD` when present in the heading, else `''`. */
  date: string;
  /** Rendered HTML of the entry body (between this `## ` header and the next). */
  bodyHtml: string;
}

const _kIdPattern = /(.+@[\d.]+)/;
const _kDatePattern = /\((\d{4}-\d{2}-\d{2})\)/;

/**
 * Split a CHANGELOG.md document into ordered entries keyed by `## ` top-level
 * headers. Order preserved from source (newest-first by convention).
 * Entries without a parseable `package@version` id are skipped.
 */
export function parseChangelog(md: string): ChangelogEntry[] {
  const lines = md.split('\n');
  const entries: ChangelogEntry[] = [];

  let currentTitle: string | null = null;
  let currentBody: string[] = [];

  const flush = () => {
    if (currentTitle === null) return;
    const idMatch = currentTitle.match(_kIdPattern);
    if (!idMatch) {
      currentTitle = null;
      currentBody = [];
      return;
    }
    const dateMatch = currentTitle.match(_kDatePattern);
    entries.push({
      id: idMatch[1].trim(),
      title: currentTitle,
      date: dateMatch ? dateMatch[1] : '',
      bodyHtml: renderChangelog(currentBody.join('\n').trim()),
    });
    currentTitle = null;
    currentBody = [];
  };

  for (const line of lines) {
    if (line.startsWith('## ')) {
      flush();
      currentTitle = line.slice(3);
    } else if (currentTitle !== null) {
      currentBody.push(line);
    }
  }
  flush();

  return entries;
}
