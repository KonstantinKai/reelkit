import { mount } from '@vue/test-utils';
import { describe, it, expect } from 'vitest';
import { HeartAnimation } from './HeartAnimation';

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
});
