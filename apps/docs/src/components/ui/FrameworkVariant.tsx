import type { ReactNode } from 'react';
import type { Framework } from '../../data/frameworkSignal';

interface FrameworkVariantProps {
  /** Framework whose variant this block represents. */
  for: Framework;
  children: ReactNode;
  /** Render as a span instead of a div for inline contexts. */
  inline?: boolean;
}

/**
 * SSR-stable framework conditional. Server prerender renders all three
 * variants; the global `[data-rk-fw]` CSS rule (in `styles.css`) hides
 * the non-active ones based on `<html data-rk-fw="...">` set pre-paint
 * by the bootstrap script in `root.tsx`. Switching framework toggles
 * the `<html>` attr — no React re-render, no flash on first hydration.
 */
export function FrameworkVariant({
  for: framework,
  children,
  inline = false,
}: FrameworkVariantProps) {
  const Tag = inline ? 'span' : 'div';
  return <Tag data-rk-fw={framework}>{children}</Tag>;
}

interface FrameworkBlocksProps {
  react: ReactNode;
  angular: ReactNode;
  vue: ReactNode;
  inline?: boolean;
}

/**
 * Render a per-framework block trio in a single statement. Equivalent
 * to three sibling `<FrameworkVariant>` calls — convenience wrapper for
 * pages that previously used `<Observe>{() => renderFramework({ ... })}`.
 */
export function FrameworkBlocks({
  react,
  angular,
  vue,
  inline = false,
}: FrameworkBlocksProps) {
  return (
    <>
      <FrameworkVariant for="react" inline={inline}>
        {react}
      </FrameworkVariant>
      <FrameworkVariant for="angular" inline={inline}>
        {angular}
      </FrameworkVariant>
      <FrameworkVariant for="vue" inline={inline}>
        {vue}
      </FrameworkVariant>
    </>
  );
}
