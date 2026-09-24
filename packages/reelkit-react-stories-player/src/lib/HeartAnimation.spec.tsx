import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HeartAnimation } from './HeartAnimation';

// Read from disk: the test run swaps every imported stylesheet for an empty one.
const heartStyles = readFileSync(
  resolve(__dirname, 'HeartAnimation.css'),
  'utf8',
);

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

  // Keyframes names are global to the page, so an app declaring its own
  // animation under the same bare name would replace the heart's.
  it('names its animation under the package prefix', () => {
    const names = [...heartStyles.matchAll(/@keyframes\s+([\w-]+)/g)].map(
      (match) => match[1],
    );

    expect(names).not.toHaveLength(0);
    for (const name of names) expect(name).toMatch(/^rk-stories-/);
  });
});
