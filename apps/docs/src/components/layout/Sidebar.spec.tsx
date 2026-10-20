import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Sidebar from './Sidebar';
import { navItems } from '../../data/navItems';

// Paths every framework shows, so the default framework renders them all.
const sharedPaths = navItems
  .filter((section) => !section.framework)
  .flatMap((section) => section.items)
  .filter((item) => !item.framework)
  .map((item) => item.path);

function activeLinksAt(path: string) {
  const { container, unmount } = render(
    <MemoryRouter initialEntries={[path]}>
      <Sidebar isOpen={false} onClose={() => undefined} />
    </MemoryRouter>,
  );
  const active = [...container.querySelectorAll('a[aria-current="page"]')].map(
    (link) => link.getAttribute('href'),
  );
  unmount();
  return active;
}

describe('sidebar', () => {
  // The recipes overview sits at a path every recipe page starts with, so a
  // prefix match would light it up beside the recipe being read.
  it.each(sharedPaths)('highlights only the page at %s', (path) => {
    expect(activeLinksAt(path)).toEqual([path]);
  });
});
