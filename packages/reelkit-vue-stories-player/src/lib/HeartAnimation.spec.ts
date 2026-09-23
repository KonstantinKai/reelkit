import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { HeartAnimation } from './HeartAnimation';

// Read from disk: the test run swaps every imported stylesheet for an empty one.
const heartStyles = readFileSync(
  resolve(__dirname, 'HeartAnimation.css'),
  'utf8',
);

describe('HeartAnimation', () => {
  it('renders the heart', () => {
    const wrapper = mount(HeartAnimation);
    expect(wrapper.find('.rk-stories-heart').exists()).toBe(true);
  });

  it('emits complete once the animation ends', async () => {
    const wrapper = mount(HeartAnimation);
    await wrapper.find('.rk-stories-heart').trigger('animationend');
    expect(wrapper.emitted('complete')).toHaveLength(1);
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
