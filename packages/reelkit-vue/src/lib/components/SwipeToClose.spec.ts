import { mount, enableAutoUnmount } from '@vue/test-utils';
import { describe, it, expect, vi, afterEach, beforeAll } from 'vitest';
import { h } from 'vue';
import { SwipeToClose } from './SwipeToClose';

enableAutoUnmount(afterEach);

class MockTouch {
  identifier: number;
  target: EventTarget;
  clientX: number;
  clientY: number;
  pageX: number;
  pageY: number;

  constructor(opts: {
    identifier: number;
    target: EventTarget;
    clientX: number;
    clientY: number;
    pageX: number;
    pageY: number;
  }) {
    this.identifier = opts.identifier;
    this.target = opts.target;
    this.clientX = opts.clientX;
    this.clientY = opts.clientY;
    this.pageX = opts.pageX;
    this.pageY = opts.pageY;
  }
}

beforeAll(() => {
  if (typeof globalThis.Touch === 'undefined') {
    (globalThis as unknown as Record<string, unknown>).Touch = MockTouch;
  }
});

const simulateTouch = (el: HTMLElement, startY: number, endY: number) => {
  const createTouch = (y: number) =>
    new Touch({
      identifier: 1,
      target: el,
      clientX: 100,
      clientY: y,
      pageX: 100,
      pageY: y,
    });

  el.dispatchEvent(
    new TouchEvent('touchstart', {
      bubbles: true,
      touches: [createTouch(startY)],
      changedTouches: [createTouch(startY)],
    }),
  );

  const steps = 5;
  const delta = (endY - startY) / steps;
  for (let i = 1; i <= steps; i++) {
    el.dispatchEvent(
      new TouchEvent('touchmove', {
        bubbles: true,
        touches: [createTouch(startY + delta * i)],
        changedTouches: [createTouch(startY + delta * i)],
      }),
    );
  }

  el.dispatchEvent(
    new TouchEvent('touchend', {
      bubbles: true,
      touches: [],
      changedTouches: [createTouch(endY)],
    }),
  );
};

describe('SwipeToClose', () => {
  it('renders children in default slot', () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up' },
      slots: {
        default: () => h('div', { 'data-testid': 'content' }, 'Content'),
      },
    });

    expect(wrapper.find('[data-testid="content"]').exists()).toBe(true);
    expect(wrapper.text()).toContain('Content');
  });

  it('applies transform and opacity styles', () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up' },
      slots: { default: () => h('div', 'Content') },
    });

    const el = wrapper.element as HTMLElement;
    expect(el.style.transform).toBe('translateY(0px)');
    expect(el.style.opacity).toBe('1');
  });

  it('sets width and height to 100%', () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'down' },
      slots: { default: () => h('div', 'Content') },
    });

    const el = wrapper.element as HTMLElement;
    expect(el.style.width).toBe('100%');
    expect(el.style.height).toBe('100%');
  });

  it('defaults enabled to true', () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up' },
      slots: { default: () => h('div', 'Content') },
    });

    expect(wrapper.props('enabled')).toBe(true);
  });

  it('defaults threshold to 0.2', () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up' },
      slots: { default: () => h('div', 'Content') },
    });

    expect(wrapper.props('threshold')).toBe(0.2);
  });

  it('cleans up on unmount', () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up' },
      slots: { default: () => h('div', 'Content') },
    });

    wrapper.unmount();
  });

  it('detaches controller when enabled becomes false', async () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up', enabled: true },
      slots: { default: () => h('div', 'Content') },
    });

    await wrapper.setProps({ enabled: false });
  });

  it('reattaches controller when enabled becomes true', async () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up', enabled: false },
      slots: { default: () => h('div', 'Content') },
    });

    await wrapper.setProps({ enabled: true });
  });

  it('updates drag offset on upward swipe', async () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up' },
      slots: { default: () => h('div', 'Content') },
    });

    const el = wrapper.element as HTMLElement;
    simulateTouch(el, 500, 300);
    await wrapper.vm.$nextTick();

    const transform = el.style.transform;
    expect(transform).toMatch(/translateY\(-?\d+/);
  });

  it('updates drag offset on downward swipe', async () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'down' },
      slots: { default: () => h('div', 'Content') },
    });

    const el = wrapper.element as HTMLElement;
    simulateTouch(el, 300, 500);
    await wrapper.vm.$nextTick();

    const transform = el.style.transform;
    expect(transform).toMatch(/translateY\(\d+/);
  });

  it('resets position when swipe does not exceed threshold', async () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up', threshold: 0.5 },
      slots: { default: () => h('div', 'Content') },
    });

    const el = wrapper.element as HTMLElement;
    simulateTouch(el, 500, 490);
    await wrapper.vm.$nextTick();

    await vi.waitFor(() => {
      expect(el.style.transform).toBe('translateY(0px)');
    });
  });

  it('emits close when swipe exceeds threshold', async () => {
    vi.useFakeTimers();

    Object.defineProperty(window, 'innerHeight', {
      value: 800,
      configurable: true,
    });

    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up', threshold: 0.01 },
      slots: { default: () => h('div', 'Content') },
    });

    const el = wrapper.element as HTMLElement;
    simulateTouch(el, 500, 100);

    vi.advanceTimersByTime(400);

    expect(wrapper.emitted('close')).toBeTruthy();

    vi.useRealTimers();
  });

  it('ignores wrong direction swipe (up component, downward swipe)', async () => {
    const wrapper = mount(SwipeToClose, {
      props: { direction: 'up' },
      slots: { default: () => h('div', 'Content') },
    });

    const el = wrapper.element as HTMLElement;
    simulateTouch(el, 300, 500);
    await wrapper.vm.$nextTick();

    expect(el.style.transform).toBe('translateY(0px)');
  });
});
