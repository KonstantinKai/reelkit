import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SlideOverlay from './SlideOverlay';

describe('SlideOverlay', () => {
  it('returns null when no props provided', () => {
    const { container } = render(<SlideOverlay />);
    expect(container.firstChild).toBeNull();
  });

  it('renders author name and avatar', () => {
    const { container } = render(
      <SlideOverlay
        author={{ name: 'John Doe', avatar: 'https://example.com/avatar.jpg' }}
      />,
    );

    const name = container.querySelector('.reel-slide-overlay-name')!;
    expect(name.textContent).toBe('John Doe');

    const avatar = container.querySelector(
      '.reel-slide-overlay-avatar',
    ) as HTMLImageElement;
    expect(avatar.src).toBe('https://example.com/avatar.jpg');
    expect(avatar.alt).toBe('John Doe');
  });

  it('renders description', () => {
    const { container } = render(<SlideOverlay description="A cool video" />);
    const desc = container.querySelector('.reel-slide-overlay-description')!;
    expect(desc.textContent).toBe('A cool video');
  });

  it('renders likes count', () => {
    const { container } = render(<SlideOverlay likes={42} />);
    const likes = container.querySelector('.reel-slide-overlay-likes')!;
    expect(likes.textContent).toContain('42');
  });

  it('formats likes in thousands', () => {
    const { container } = render(<SlideOverlay likes={1500} />);
    const likes = container.querySelector('.reel-slide-overlay-likes')!;
    expect(likes.textContent).toContain('1.5K');
  });

  it('formats likes in millions', () => {
    const { container } = render(<SlideOverlay likes={2300000} />);
    const likes = container.querySelector('.reel-slide-overlay-likes')!;
    expect(likes.textContent).toContain('2.3M');
  });

  it('formats round thousands without decimal', () => {
    const { container } = render(<SlideOverlay likes={1000} />);
    const likes = container.querySelector('.reel-slide-overlay-likes')!;
    expect(likes.textContent).toContain('1K');
  });

  it('formats round millions without decimal', () => {
    const { container } = render(<SlideOverlay likes={1000000} />);
    const likes = container.querySelector('.reel-slide-overlay-likes')!;
    expect(likes.textContent).toContain('1M');
  });

  it('renders likes=0', () => {
    const { container } = render(<SlideOverlay likes={0} />);
    const likes = container.querySelector('.reel-slide-overlay-likes')!;
    expect(likes.textContent).toContain('0');
  });

  it('renders all fields together', () => {
    const { container } = render(
      <SlideOverlay
        author={{ name: 'Jane', avatar: 'https://example.com/j.jpg' }}
        description="Amazing content"
        likes={12500}
      />,
    );

    expect(
      container.querySelector('.reel-slide-overlay-name')!.textContent,
    ).toBe('Jane');
    expect(
      container.querySelector('.reel-slide-overlay-description')!.textContent,
    ).toBe('Amazing content');
    expect(
      container.querySelector('.reel-slide-overlay-likes')!.textContent,
    ).toContain('12.5K');
  });

  it('has correct CSS classes', () => {
    const { container } = render(
      <SlideOverlay
        author={{ name: 'User', avatar: 'https://example.com/a.jpg' }}
        description="Desc"
        likes={10}
      />,
    );

    expect(container.querySelector('.reel-slide-overlay')).not.toBeNull();
    expect(
      container.querySelector('.reel-slide-overlay-author'),
    ).not.toBeNull();
    expect(
      container.querySelector('.reel-slide-overlay-avatar'),
    ).not.toBeNull();
    expect(container.querySelector('.reel-slide-overlay-name')).not.toBeNull();
    expect(
      container.querySelector('.reel-slide-overlay-description'),
    ).not.toBeNull();
    expect(container.querySelector('.reel-slide-overlay-likes')).not.toBeNull();
  });

  it('omits author section when not provided', () => {
    const { container } = render(<SlideOverlay description="Just text" />);
    expect(container.querySelector('.reel-slide-overlay-author')).toBeNull();
  });

  it('omits description section when not provided', () => {
    const { container } = render(<SlideOverlay likes={100} />);
    expect(
      container.querySelector('.reel-slide-overlay-description'),
    ).toBeNull();
  });

  it('omits likes section when not provided', () => {
    const { container } = render(
      <SlideOverlay
        author={{ name: 'User', avatar: 'https://example.com/a.jpg' }}
      />,
    );
    expect(container.querySelector('.reel-slide-overlay-likes')).toBeNull();
  });
});
