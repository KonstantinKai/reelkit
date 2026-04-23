import { useState, type ReactNode } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import { slugify } from '../../utils/slugify';

/** Extract a plain-text label from arbitrary `ReactNode` children. */
function flatten(children: ReactNode): string {
  if (children == null || typeof children === 'boolean') return '';
  if (typeof children === 'string' || typeof children === 'number') {
    return String(children);
  }
  if (Array.isArray(children)) return children.map(flatten).join('');
  if (typeof children === 'object' && 'props' in children) {
    return flatten(
      (children as { props: { children?: ReactNode } }).props.children,
    );
  }
  return '';
}

interface HeadingProps {
  level: 2 | 3;
  children: ReactNode;

  /** Explicit id override; skips slug generation. */
  id?: string;

  /** Extra class names appended to the built-in heading class. */
  className?: string;
}

const _kAnchorClass = 'scroll-mt-24 group flex items-center gap-2';

/**
 * Anchored heading with a visible `#` link that copies the section URL.
 *
 * Slug is derived statelessly from the heading text via {@link slugify}, so
 * every render on every mount yields the same `id`. Duplicate heading text
 * within a single page is an authoring-time concern — the runtime does not
 * attempt to disambiguate because counter-based disambiguation broke under
 * React StrictMode dev double-mount.
 */
export function Heading({ level, children, id, className }: HeadingProps) {
  const slug = id ?? slugify(flatten(children));
  const [copied, setCopied] = useState(false);

  const onClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    if (typeof window === 'undefined') return;
    const href = `${window.location.pathname}#${slug}`;
    const absolute = `${window.location.origin}${href}`;
    window.history.replaceState(window.history.state, '', href);
    document.getElementById(slug)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(absolute)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        })
        .catch(() => {
          /* clipboard permissions denied or unavailable */
        });
    }
  };

  const classes = [className, _kAnchorClass].filter(Boolean).join(' ');
  const anchor = (
    <a
      href={`#${slug}`}
      onClick={onClick}
      aria-label={copied ? 'Link copied' : 'Copy link to section'}
      className={[
        'inline-flex items-center justify-center w-5 h-5 rounded',
        'text-slate-400 hover:text-primary-500 dark:hover:text-primary-400',
        'transition-colors',
        copied ? 'text-primary-500 dark:text-primary-400' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <LinkIcon size={14} />
    </a>
  );

  if (level === 2) {
    return (
      <h2 id={slug} className={classes}>
        <span>{children}</span>
        {anchor}
      </h2>
    );
  }

  return (
    <h3 id={slug} className={classes}>
      <span>{children}</span>
      {anchor}
    </h3>
  );
}
