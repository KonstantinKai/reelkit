import { describe, it, expect, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/react';
import { StoriesRing } from './StoriesRing';

const author = { id: 'a1', name: 'Alice', avatar: '/alice.jpg' };

function renderRing(totalStories: number, viewedCount: number) {
  const { container } = render(
    <StoriesRing
      author={author}
      totalStories={totalStories}
      viewedCount={viewedCount}
    />,
  );
  const ring = container.querySelector('.rk-stories-ring') as HTMLElement;

  return {
    ring,
    gradient: ring.style.getPropertyValue('--rk-stories-ring-gradient'),
  };
}

describe('StoriesRing', () => {
  it('paints the ring through a custom property, not the element background', () => {
    const { ring, gradient } = renderRing(6, 0);
    expect(gradient).toContain('conic-gradient');
    expect(ring.style.background).toBe('');
  });

  it('closes the gradient on the color it opened with', () => {
    const { gradient } = renderRing(6, 0);
    expect(gradient).toBe(
      'conic-gradient(from 180deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #f09433)',
    );
  });

  it('treats a half watched group the same as an untouched one', () => {
    const untouched = renderRing(6, 0);
    const half = renderRing(6, 3);
    expect(half.gradient).toBe(untouched.gradient);
    expect(half.ring.className).toBe(untouched.ring.className);
  });

  it('rotates while anything is left to watch', () => {
    expect(renderRing(6, 5).ring.className).toContain(
      'rk-stories-ring--active',
    );
  });

  it('shows a flat muted ring once the group is fully watched', () => {
    const { ring, gradient } = renderRing(6, 6);
    expect(gradient).toBe('rgba(255,255,255,0.25)');
    expect(ring.className).toBe('rk-stories-ring');
  });

  it('stays muted when the viewed count overshoots', () => {
    expect(renderRing(6, 9).gradient).toBe('rgba(255,255,255,0.25)');
  });

  it('renders nothing for an empty group', () => {
    const { ring, gradient } = renderRing(0, 0);
    expect(gradient).toBe('none');
    expect(ring.className).toBe('rk-stories-ring');
  });

  it('accepts a custom palette', () => {
    const { container } = render(
      <StoriesRing
        author={author}
        totalStories={3}
        viewedCount={1}
        gradientColors={['red', 'rgb(0 0 255)']}
      />,
    );
    const ring = container.querySelector('.rk-stories-ring') as HTMLElement;
    expect(ring.style.getPropertyValue('--rk-stories-ring-gradient')).toBe(
      'conic-gradient(from 180deg, red, rgb(0 0 255), red)',
    );
  });

  it('accepts a custom viewed color', () => {
    const { container } = render(
      <StoriesRing
        author={author}
        totalStories={3}
        viewedCount={3}
        viewedColor="#333"
      />,
    );
    const ring = container.querySelector('.rk-stories-ring') as HTMLElement;
    expect(ring.style.getPropertyValue('--rk-stories-ring-gradient')).toBe(
      '#333',
    );
  });

  it('sizes the ring and the avatar in pixels', () => {
    const { container } = render(
      <StoriesRing
        author={author}
        totalStories={3}
        viewedCount={0}
        size={80}
      />,
    );
    const ring = container.querySelector('.rk-stories-ring') as HTMLElement;

    expect(ring.style.width).toBe('80px');
    expect(ring.style.height).toBe('80px');
    expect(ring.querySelector('img')?.getAttribute('width')).toBe('72');
  });

  it('is a labelled button that reports a click', () => {
    const onClick = vi.fn();
    const { container } = render(
      <StoriesRing
        author={author}
        totalStories={3}
        viewedCount={0}
        onClick={onClick}
      />,
    );
    const ring = container.querySelector('.rk-stories-ring') as HTMLElement;

    expect(ring.getAttribute('role')).toBe('button');
    expect(ring.getAttribute('tabindex')).toBe('0');
    expect(ring.getAttribute('aria-label')).toBe("Alice's stories");

    fireEvent.click(ring);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('opens from the keyboard with Enter or Space, as a button does', () => {
    const onClick = vi.fn();
    const { container } = render(
      <StoriesRing
        author={author}
        totalStories={3}
        viewedCount={0}
        onClick={onClick}
      />,
    );
    const ring = container.querySelector('.rk-stories-ring') as HTMLElement;

    fireEvent.keyDown(ring, { key: 'Enter' });
    fireEvent.keyDown(ring, { key: ' ' });
    fireEvent.keyDown(ring, { key: 'a' });

    expect(onClick).toHaveBeenCalledTimes(2);
  });
});
