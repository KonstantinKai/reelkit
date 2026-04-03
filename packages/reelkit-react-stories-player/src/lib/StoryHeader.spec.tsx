import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StoryHeader } from './StoryHeader';

const author = { id: '1', name: 'Alice', avatar: 'alice.jpg' };
const verifiedAuthor = { ...author, verified: true };

describe('StoryHeader', () => {
  it('renders author name', () => {
    const { container } = render(
      <StoryHeader author={author} onClose={vi.fn()} />,
    );
    expect(container.textContent).toContain('Alice');
  });

  it('renders author avatar', () => {
    const { container } = render(
      <StoryHeader author={author} onClose={vi.fn()} />,
    );
    const img = container.querySelector('img');
    expect(img?.src).toContain('alice.jpg');
    expect(img?.alt).toBe('Alice');
  });

  it('renders verified badge when author is verified', () => {
    const { container } = render(
      <StoryHeader author={verifiedAuthor} onClose={vi.fn()} />,
    );
    expect(container.querySelector('.rk-stories-header-verified')).toBeTruthy();
  });

  it('does not render verified badge when author is not verified', () => {
    const { container } = render(
      <StoryHeader author={author} onClose={vi.fn()} />,
    );
    expect(container.querySelector('.rk-stories-header-verified')).toBeNull();
  });

  it('renders relative time for createdAt', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 3600_000).toISOString();
    const { container } = render(
      <StoryHeader author={author} createdAt={twoHoursAgo} onClose={vi.fn()} />,
    );
    expect(container.textContent).toContain('2h');
  });

  it('renders "now" for very recent createdAt', () => {
    const justNow = new Date().toISOString();
    const { container } = render(
      <StoryHeader author={author} createdAt={justNow} onClose={vi.fn()} />,
    );
    expect(container.textContent).toContain('now');
  });

  it('renders minutes for createdAt within an hour', () => {
    const thirtyMinsAgo = new Date(Date.now() - 30 * 60_000).toISOString();
    const { container } = render(
      <StoryHeader
        author={author}
        createdAt={thirtyMinsAgo}
        onClose={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('30m');
  });

  it('renders days for createdAt within a week', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 86_400_000).toISOString();
    const { container } = render(
      <StoryHeader
        author={author}
        createdAt={threeDaysAgo}
        onClose={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('3d');
  });

  it('renders weeks for createdAt over a week', () => {
    const twoWeeksAgo = new Date(Date.now() - 14 * 86_400_000).toISOString();
    const { container } = render(
      <StoryHeader author={author} createdAt={twoWeeksAgo} onClose={vi.fn()} />,
    );
    expect(container.textContent).toContain('2w');
  });

  it('fires onClose when close button is clicked', () => {
    const onClose = vi.fn();
    const { container } = render(
      <StoryHeader author={author} onClose={onClose} />,
    );
    const closeBtn = container.querySelector('[aria-label="Close"]');
    act(() => {
      closeBtn?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('shows pause icon by default, play icon when paused', () => {
    const { container, rerender } = render(
      <StoryHeader
        author={author}
        onClose={vi.fn()}
        onTogglePause={vi.fn()}
        isPaused={false}
      />,
    );
    const pauseBtn = container.querySelector('[aria-label="Pause"]');
    expect(pauseBtn).toBeTruthy();

    rerender(
      <StoryHeader
        author={author}
        onClose={vi.fn()}
        onTogglePause={vi.fn()}
        isPaused={true}
      />,
    );
    const playBtn = container.querySelector('[aria-label="Play"]');
    expect(playBtn).toBeTruthy();
  });

  it('shows sound button for video stories', () => {
    const { container } = render(
      <StoryHeader
        author={author}
        onClose={vi.fn()}
        isVideo={true}
        isMuted={false}
        onToggleSound={vi.fn()}
      />,
    );
    const muteBtn = container.querySelector('[aria-label="Mute"]');
    expect(muteBtn).toBeTruthy();
  });

  it('shows unmute label when muted', () => {
    const { container } = render(
      <StoryHeader
        author={author}
        onClose={vi.fn()}
        isVideo={true}
        isMuted={true}
        onToggleSound={vi.fn()}
      />,
    );
    const unmuteBtn = container.querySelector('[aria-label="Unmute"]');
    expect(unmuteBtn).toBeTruthy();
  });

  it('hides sound button for non-video stories', () => {
    const { container } = render(
      <StoryHeader
        author={author}
        onClose={vi.fn()}
        isVideo={false}
        onToggleSound={vi.fn()}
      />,
    );
    expect(container.querySelector('[aria-label="Mute"]')).toBeNull();
    expect(container.querySelector('[aria-label="Unmute"]')).toBeNull();
  });

  it('shows spinner when isLoading is true', () => {
    const { container } = render(
      <StoryHeader author={author} onClose={vi.fn()} isLoading={true} />,
    );
    expect(container.querySelector('.rk-stories-header-spinner')).toBeTruthy();
  });

  it('hides spinner when isError is true even if isLoading', () => {
    const { container } = render(
      <StoryHeader
        author={author}
        onClose={vi.fn()}
        isLoading={true}
        isError={true}
      />,
    );
    expect(container.querySelector('.rk-stories-header-spinner')).toBeNull();
  });

  it('applies opacity 0 when visible is false', () => {
    const { container } = render(
      <StoryHeader author={author} onClose={vi.fn()} visible={false} />,
    );
    const header = container.querySelector('.rk-stories-header') as HTMLElement;
    expect(header?.style.opacity).toBe('0');
  });
});
