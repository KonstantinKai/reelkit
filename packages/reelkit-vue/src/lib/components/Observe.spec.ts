import { mount } from '@vue/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, shallowRef } from 'vue';
import { createSignal, type Signal } from '@reelkit/core';
import { Observe } from './Observe';

// Counts subscriptions to a signal and the releases of each one.
const track = <T>(signal: Signal<T>) => {
  const released = vi.fn();
  const observe = signal.observe.bind(signal);
  const subscribed = vi
    .spyOn(signal, 'observe')
    .mockImplementation((listener) => {
      const stop = observe(listener);
      return () => {
        released();
        stop();
      };
    });
  return { subscribed, released };
};

describe('Observe', () => {
  it('renders its slot from the current signal values', () => {
    const count = createSignal(1);
    const wrapper = mount(Observe, {
      props: { signals: [count] },
      slots: { default: () => `count ${count.value}` },
    });
    expect(wrapper.text()).toBe('count 1');
  });

  it('re-renders the slot when any signal changes', async () => {
    const a = createSignal('a');
    const b = createSignal('b');
    const wrapper = mount(Observe, {
      props: { signals: [a, b] },
      slots: { default: () => `${a.value}${b.value}` },
    });

    b.value = 'B';
    await nextTick();
    expect(wrapper.text()).toBe('aB');

    a.value = 'A';
    await nextTick();
    expect(wrapper.text()).toBe('AB');
  });

  // The point of the component: the parent that renders it takes no part in
  // a signal change.
  it('leaves the parent alone when a signal changes', async () => {
    const count = createSignal(0);
    const parentRender = vi.fn();
    const Parent = defineComponent({
      setup: () => () => {
        parentRender();
        return h(Observe, { signals: [count] }, () => String(count.value));
      },
    });
    const wrapper = mount(Parent);

    count.value = 1;
    await nextTick();

    expect(wrapper.text()).toBe('1');
    expect(parentRender).toHaveBeenCalledOnce();
  });

  it('keeps one subscription when the parent hands the same signals again', async () => {
    const count = createSignal(0);
    const { subscribed, released } = track(count);
    const tick = shallowRef(0);
    const Parent = defineComponent({
      setup: () => () =>
        h(Observe, { signals: [count] }, () => `${count.value}.${tick.value}`),
    });
    const wrapper = mount(Parent);

    tick.value = 1;
    await nextTick();

    expect(wrapper.text()).toBe('0.1');
    expect(subscribed).toHaveBeenCalledOnce();
    expect(released).not.toHaveBeenCalled();
  });

  it('follows a signal that replaced the first and lets the first go', async () => {
    const first = createSignal('first');
    const second = createSignal('second');
    const firstTracked = track(first);
    const current = shallowRef<Signal<string>>(first);
    const Parent = defineComponent({
      setup: () => () =>
        h(Observe, { signals: [current.value] }, () => current.value.value),
    });
    const wrapper = mount(Parent);

    current.value = second;
    await nextTick();
    expect(wrapper.text()).toBe('second');
    expect(firstTracked.released).toHaveBeenCalledOnce();

    second.value = 'followed';
    await nextTick();
    expect(wrapper.text()).toBe('followed');
  });

  it('lets its signals go once unmounted', () => {
    const count = createSignal(0);
    const { released } = track(count);
    const wrapper = mount(Observe, {
      props: { signals: [count] },
      slots: { default: () => String(count.value) },
    });

    wrapper.unmount();
    expect(released).toHaveBeenCalledOnce();
  });

  it('works in a template with no render function', async () => {
    const count = createSignal(2);
    const Host = defineComponent({
      components: { Observe },
      setup: () => ({ count }),
      template: `<Observe :signals="[count]"><b>{{ count.value }}</b></Observe>`,
    });
    const wrapper = mount(Host);
    expect(wrapper.find('b').text()).toBe('2');

    count.value = 3;
    await nextTick();
    expect(wrapper.find('b').text()).toBe('3');
  });
});
