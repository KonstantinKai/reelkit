import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

vi.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Maximize: () => <span>Maximize</span>,
  Minimize: () => <span>Minimize</span>,
}));

// eslint-disable-next-line import/first
import { CloseButton, Counter, FullscreenButton } from './LightboxControls';

describe('CloseButton', () => {
  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<CloseButton onClick={onClick} />);

    fireEvent.click(screen.getByTitle('Close (Esc)'));

    expect(onClick).toHaveBeenCalledOnce();
  });

  it('uses default lightbox-close class', () => {
    const { container } = render(<CloseButton onClick={vi.fn()} />);

    expect(container.querySelector('.lightbox-close')).toBeTruthy();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <CloseButton onClick={vi.fn()} className="my-close" />,
    );

    expect(container.querySelector('.my-close')).toBeTruthy();
    expect(container.querySelector('.lightbox-close')).toBeNull();
  });
});

describe('Counter', () => {
  it('renders formatted counter text', () => {
    render(<Counter currentIndex={0} count={5} />);

    expect(screen.getByText('1 / 5')).toBeTruthy();
  });

  it('updates with different index', () => {
    render(<Counter currentIndex={3} count={10} />);

    expect(screen.getByText('4 / 10')).toBeTruthy();
  });

  it('uses default lightbox-counter class', () => {
    const { container } = render(<Counter currentIndex={0} count={3} />);

    expect(container.querySelector('.lightbox-counter')).toBeTruthy();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <Counter currentIndex={0} count={3} className="my-counter" />,
    );

    expect(container.querySelector('.my-counter')).toBeTruthy();
    expect(container.querySelector('.lightbox-counter')).toBeNull();
  });
});

describe('FullscreenButton', () => {
  it('shows Maximize icon when not fullscreen', () => {
    render(<FullscreenButton isFullscreen={false} onToggle={vi.fn()} />);

    expect(screen.getByTitle('Enter Fullscreen')).toBeTruthy();
    expect(screen.getByText('Maximize')).toBeTruthy();
  });

  it('shows Minimize icon when fullscreen', () => {
    render(<FullscreenButton isFullscreen={true} onToggle={vi.fn()} />);

    expect(screen.getByTitle('Exit Fullscreen')).toBeTruthy();
    expect(screen.getByText('Minimize')).toBeTruthy();
  });

  it('calls onToggle when clicked', () => {
    const onToggle = vi.fn();
    render(<FullscreenButton isFullscreen={false} onToggle={onToggle} />);

    fireEvent.click(screen.getByTitle('Enter Fullscreen'));

    expect(onToggle).toHaveBeenCalledOnce();
  });

  it('uses default lightbox-btn class', () => {
    const { container } = render(
      <FullscreenButton isFullscreen={false} onToggle={vi.fn()} />,
    );

    expect(container.querySelector('.lightbox-btn')).toBeTruthy();
  });

  it('accepts custom className', () => {
    const { container } = render(
      <FullscreenButton
        isFullscreen={false}
        onToggle={vi.fn()}
        className="my-fs-btn"
      />,
    );

    expect(container.querySelector('.my-fs-btn')).toBeTruthy();
    expect(container.querySelector('.lightbox-btn')).toBeNull();
  });
});
