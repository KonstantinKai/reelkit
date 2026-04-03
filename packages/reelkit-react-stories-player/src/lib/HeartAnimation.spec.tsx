import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HeartAnimation } from './HeartAnimation';

describe('HeartAnimation', () => {
  it('renders centered in the container', () => {
    const { container } = render(<HeartAnimation onComplete={vi.fn()} />);
    const heart = container.querySelector('.rk-stories-heart') as HTMLElement;
    expect(heart).toBeTruthy();
  });

  it('calls onComplete after animation ends', () => {
    const onComplete = vi.fn();
    const { container } = render(<HeartAnimation onComplete={onComplete} />);
    const heart = container.querySelector('.rk-stories-heart') as HTMLElement;
    heart.dispatchEvent(new Event('animationend', { bubbles: true }));
    expect(onComplete).toHaveBeenCalledTimes(1);
  });
});
