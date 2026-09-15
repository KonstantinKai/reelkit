import type { ReactNode } from 'react';

export interface DocsFrontmatter {
  /** Page title, as shown in the `<h1>` and the browser tab. */
  title: string;
  /** Meta description and social card summary. */
  description: string;
}

/**
 * Shell around a content file's body. The heading comes from the
 * frontmatter so the body starts with its lead paragraph; the typography of
 * everything inside is the `.docs-mdx-content` block in `styles.css`.
 */
export function DocsPage({
  frontmatter,
  children,
}: {
  frontmatter: DocsFrontmatter;
  children: ReactNode;
}) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold mb-4">{frontmatter.title}</h1>
      <div className="docs-mdx-content">{children}</div>
    </div>
  );
}
