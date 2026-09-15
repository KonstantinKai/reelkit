declare module '*.mdx' {
  import type { ComponentType } from 'react';
  import type { DocsFrontmatter } from './components/mdx/DocsPage';

  export const frontmatter: DocsFrontmatter;
  export const meta: (args: { location: { pathname: string } }) => unknown[];
  const MDXContent: ComponentType;
  export default MDXContent;
}
