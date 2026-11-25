import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';

const release = (version: number) =>
  `## @reelkit/core@0.${version}.0 (2026-0${version}-01)\n\n- change ${version}\n\n`;

// Six releases in all, the newest four in the head: a reader who last looked
// at the oldest one is owed five, more than the head holds.
vi.mock('virtual:reelkit-changelog', () => ({
  ids: [6, 5, 4, 3, 2, 1].map((version) => `@reelkit/core@0.${version}.0`),
  head: [6, 5, 4, 3].map(release).join(''),
  chunkCount: 2,
  loadChunk: vi.fn(),
}));

const { loadChunk } = await import('virtual:reelkit-changelog');
const { default: WhatsNewDialog } = await import('./WhatsNewDialog');

const _kLastSeenKey = 'rk-docs:whats-new:last-seen';

const renderDialog = () =>
  render(
    <MemoryRouter initialEntries={['/docs/getting-started']}>
      <WhatsNewDialog />
    </MemoryRouter>,
  );

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  vi.clearAllMocks();
});

describe("what's new dialog", () => {
  it('counts every release since the last one seen, beyond the newest shown', async () => {
    window.localStorage.setItem(_kLastSeenKey, '@reelkit/core@0.1.0');
    renderDialog();
    await screen.findByRole('dialog');
    for (const version of [6, 5, 4]) {
      expect(
        screen.getByText(`@reelkit/core@0.${version}.0 (2026-0${version}-01)`),
      ).toBeTruthy();
    }
    expect(screen.queryByText(/@reelkit\/core@0\.3\.0/)).toBeNull();
    expect(screen.getByText('+2 more releases')).toBeTruthy();
    expect(loadChunk).not.toHaveBeenCalled();
  });

  it('treats a last-seen release missing from the list as everything new', async () => {
    window.localStorage.setItem(_kLastSeenKey, '@reelkit/core@0.0.9');
    renderDialog();
    await screen.findByRole('dialog');
    expect(screen.getByText('+3 more releases')).toBeTruthy();
  });

  it('stays closed on a first visit and remembers the newest release', async () => {
    renderDialog();
    await waitFor(() =>
      expect(window.localStorage.getItem(_kLastSeenKey)).toBe(
        '@reelkit/core@0.6.0',
      ),
    );
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});
