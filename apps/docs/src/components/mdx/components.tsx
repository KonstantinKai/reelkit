import type {
  AnchorHTMLAttributes,
  ComponentProps,
  HTMLAttributes,
  ReactNode,
} from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useLocalePath } from '../../i18n/useLocale';
import { setFramework } from '../../data/frameworkSignal';
import { CodeBlock } from '../ui/CodeBlock';
import { Callout } from '../ui/Callout';
import { FeatureCardGrid, type FeatureCardItem } from '../ui/FeatureCard';
import { FrameworkVariant } from '../ui/FrameworkVariant';
import { Heading } from '../ui/Heading';
import { Sandbox } from '../ui/Sandbox';
import { NextSteps } from '../NextSteps';
import { AngularIcon, ReactIcon, VueIcon } from '../FrameworkSwitcher';
import { BundleSizeTable, LibraryComparison } from './BundleTables';

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
 * `table` mapping and read as a reference table; a table written as JSX
 * (needed when rows carry a framework attribute) uses it directly, `boxed`
 * for the bordered comparison style. Its cells never pass through the map,
 * so they are the one place the stylesheet reaches by tag name.
 */
export function Table({
  boxed = false,
  children,
}: {
  boxed?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto mb-6">
      <table className={boxed ? 'docs-table docs-table-boxed' : 'docs-table'}>
        {children}
      </table>
    </div>
  );
}

/** Green affirmative cell — "Yes", "Так", whatever the locale says. */
export function Ok({ children }: { children: ReactNode }) {
  return <span className="text-green-600 dark:text-green-400">{children}</span>;
}

/** Row of feature cards under a page's introduction. */
function FeatureGrid({
  columns = 4,
  items,
}: {
  columns?: 3 | 4;
  items: FeatureCardItem[];
}) {
  return (
    <div
      className={`grid grid-cols-2 ${columns === 3 ? 'md:grid-cols-3' : 'md:grid-cols-4'} gap-4 mb-6`}
    >
      <FeatureCardGrid items={items} />
    </div>
  );
}

/** Small note under a live demo. */
function Caption({ children }: { children: ReactNode }) {
  return <p className="docs-caption">{children}</p>;
}

/** Type signature line above a reference table. */
function Signature({ children }: { children: ReactNode }) {
  return <p className="docs-signature">{children}</p>;
}

/** Link out to a hosted example of the section it sits in. */
function DemoLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="docs-demo-link"
    >
      {children}
    </a>
  );
}

function StackBlitzMark() {
  return (
    <svg width="16" height="16" viewBox="0 0 28 28" fill="currentColor">
      <path d="M12.747 16.273h-7.46L18.925 1.5l-3.671 10.227h7.46L9.075 26.5l3.672-10.227z" />
    </svg>
  );
}

/** A framework's hosted demo and its StackBlitz starter, side by side. */
function DemoLinks({
  demo,
  demoLabel,
  starter,
  starterLabel,
}: {
  demo: string;
  demoLabel: string;
  starter: string;
  starterLabel: string;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <a
        href={demo}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-primary-500/25 transition-all duration-200"
      >
        {demoLabel}
      </a>
      <a
        href={starter}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
      >
        <StackBlitzMark />
        {starterLabel}
      </a>
    </div>
  );
}

const _kFrameworkButton =
  'flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-medium transition-all duration-200 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600';

/** The three framework buttons; the active one is highlighted by CSS. */
function FrameworkPicker() {
  return (
    <div className="flex gap-3">
      <button
        data-fw-btn="react"
        onClick={() => setFramework('react')}
        className={_kFrameworkButton}
      >
        <ReactIcon className="w-5 h-5 text-sky-500" />
        React
      </button>
      <button
        data-fw-btn="angular"
        onClick={() => setFramework('angular')}
        className={_kFrameworkButton}
      >
        <AngularIcon className="w-5 h-5 text-rose-500" />
        Angular
      </button>
      <button
        data-fw-btn="vue"
        onClick={() => setFramework('vue')}
        className={_kFrameworkButton}
      >
        <VueIcon className="w-5 h-5 text-emerald-500" />
        Vue
      </button>
    </div>
  );
}

/**
 * A markdown list with a marker other than the default disc: a dot for a
 * run of short facts, a check mark for a support matrix.
 */
function Bullets({
  marker,
  children,
}: {
  marker: 'dot' | 'check';
  children: ReactNode;
}) {
  return <div data-bullets={marker}>{children}</div>;
}

/** A list of headline points, each a bold title over a short explanation. */
function KeyPoints({ children }: { children: ReactNode }) {
  return <ul className="docs-key-points">{children}</ul>;
}

function KeyPoint({
  title,
  children,
}: {
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <li className="docs-key-point">
      <ArrowRight className="w-5 h-5 text-primary-500 flex-shrink-0 mt-0.5" />
      <div>
        <strong className="docs-key-point-title">{title}</strong>
        {children}
      </div>
    </li>
  );
}

/**
 * A markdown element with a class hook. The stylesheet styles content
 * through these hooks only, so a shared component rendering the same tag
 * inside the page — the anchor in a heading, the list in NextSteps — keeps
 * its own look.
 */
function hooked(
  Tag: 'p' | 'ul' | 'ol' | 'li' | 'code' | 'strong',
  className: string,
) {
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
  li: hooked('li', 'docs-li'),
  code: hooked('code', 'docs-inline-code'),
  strong: hooked('strong', 'docs-strong'),
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
  CodeBlock: (props: ComponentProps<typeof CodeBlock>) => (
    <div className="docs-code">
      <CodeBlock {...props} />
    </div>
  ),
  Sandbox: (props: ComponentProps<typeof Sandbox>) => (
    <div className="docs-code">
      <Sandbox {...props} />
    </div>
  ),
  Callout,
  FrameworkVariant,
  // Opens a section with its own heading, so it takes the section's top
  // distance that a markdown h2 would carry.
  NextSteps: (props: ComponentProps<typeof NextSteps>) => (
    <div className="docs-section">
      <NextSteps {...props} />
    </div>
  ),
  FeatureGrid,
  Caption,
  Signature,
  DemoLink,
  DemoLinks,
  FrameworkPicker,
  Bullets,
  KeyPoints,
  KeyPoint,
  BundleSizeTable,
  LibraryComparison,
};

export function useMDXComponents() {
  return mdxComponents;
}
