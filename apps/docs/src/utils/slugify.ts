/**
 * Deterministic, ascii-safe kebab-case slug.
 *
 * Replaces runs of non-alphanumeric characters with a single `-`, strips
 * leading/trailing separators, and lowercases. Idempotent under repeated
 * application: `slugify(slugify(s)) === slugify(s)`. Pure function — no
 * hidden state, so StrictMode double-mount or any other re-invocation of
 * components that call it produces the same id across renders.
 */
export function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
