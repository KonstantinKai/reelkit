import type { AnchorHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useLocalePath } from '../../i18n/useLocale';
import { CodeBlock } from '../ui/CodeBlock';
import { Callout } from '../ui/Callout';
import { FrameworkVariant } from '../ui/FrameworkVariant';
import { Heading } from '../ui/Heading';
import { NextSteps } from '../NextSteps';

/**
 * Prose links are written unprefixed — `/docs/ssr` — and land in the
 * reader's locale here, the same way the chrome does. External links open
 * in a new tab; in-page anchors stay plain.
 */
function ProseLink({
  href = '',
  children,
  ...rest
}: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const localePath = useLocalePath();
  if (href.startsWith('/')) {
    return (
      <Link to={localePath(href)} className="docs-link" {...rest}>
        {children}
      </Link>
    );
  }
  if (href.startsWith('#')) {
    return (
      <a href={href} className="docs-link" {...rest}>
        {children}
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="docs-link"
      {...rest}
    >
      {children}
    </a>
  );
}

/**
 * Scroll container around a table. Markdown tables arrive here through the
 * `table` mapping; a table written as JSX (needed when rows carry a
 * framework attribute) uses it directly. Its cells never pass through the
 * map, so they are the one place the stylesheet reaches by tag name.
 */
export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className="docs-table">{children}</table>
    </div>
  );
}

/** Green affirmative cell — "Yes", "Так", whatever the locale says. */
export function Ok({ children }: { children: ReactNode }) {
  return <span className="text-green-600 dark:text-green-400">{children}</span>;
}

/**
 * A markdown element with a class hook. The stylesheet styles content
 * through these hooks only, so a shared component rendering the same tag
 * inside the page — the anchor in a heading, the list in NextSteps — keeps
 * its own look.
 */
function hooked(Tag: 'p' | 'ul' | 'ol' | 'code', className: string) {
  return (props: HTMLAttributes<HTMLElement>) => (
    <Tag {...props} className={className} />
  );
}

/**
 * Component map every content file compiles against. The MDX compiler
 * imports `useMDXComponents` from this module (`providerImportSource`), so
 * a content file uses `<CodeBlock>`, `<Callout>` and friends without
 * importing them, and markdown elements land on the site's own components.
 */
const mdxComponents = {
  p: hooked('p', 'docs-p'),
  a: ProseLink,
  ul: hooked('ul', 'docs-list'),
  ol: hooked('ol', 'docs-list docs-list-ordered'),
  code: hooked('code', 'docs-inline-code'),
  h2: (props: { id?: string; children?: ReactNode }) => (
    <Heading level={2} className="docs-h2" {...props}>
      {props.children}
    </Heading>
  ),
  h3: (props: { id?: string; children?: ReactNode }) => (
    <Heading level={3} className="docs-h3" {...props}>
      {props.children}
    </Heading>
  ),
  table: Table,
  Table,
  Ok,
  CodeBlock: (props: Parameters<typeof CodeBlock>[0]) => (
    <div className="docs-code">
      <CodeBlock {...props} />
    </div>
  ),
  Callout,
  FrameworkVariant,
  NextSteps,
};

export function useMDXComponents() {
  return mdxComponents;
}
