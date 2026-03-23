import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { h, inject, defineComponent } from 'vue';
import { Reel } from './Reel';
import { RK_REEL_KEY } from '../context/ReelContext';

type ResizeCallback = ResizeObserverCallback;
let resizeObserverCallback: ResizeCallback | null = null;
let observedElements: Element[] = [];

class MockResizeObserver {
  constructor(callback: ResizeCallback) {
    resizeObserverCallback = callback;
  }
  observe(el: Element) {
    observedElements.push(el);
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    observedElements = [];
    resizeObserverCallback = null;
  }
}

const triggerResize = (width: number, height: number) => {
  for (const el of observedElements) {
    Object.defineProperty(el, 'clientWidth', {
      value: width,
      configurable: true,
    });
    Object.defineProperty(el, 'clientHeight', {
      value: height,
      configurable: true,
    });
  }
  resizeObserverCallback?.(
    [{ contentRect: { width, height } }] as ResizeObserverEntry[],
    null as unknown as ResizeObserver,
  );
};

const itemSlot = ({ index, size }: { index: number; size: [number, number] }) =>
  h('div', {}, `Slide ${index} (${size[0]}x${size[1]})`);

describe('Reel', () => {
  describe('rendering', () => {
    it('renders root div with correct size', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const root = wrapper.element as HTMLElement;
      expect(root.style.width).toBe('400px');
      expect(root.style.height).toBe('600px');
    });

    it('sets user-select none on root', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.style.userSelect).toBe('none');
    });

    it('sets overflow hidden on root', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.style.overflow).toBe('hidden');
    });

    it('sets position relative on root', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.style.position).toBe('relative');
    });

    it('renders slides from item slot', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      expect(wrapper.text()).toContain('Slide 0');
    });

    it('renders default slot as overlay', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: {
          item: itemSlot,
          default: () => h('div', { 'data-testid': 'overlay' }, 'Overlay'),
        },
      });

      expect(wrapper.find('[data-testid="overlay"]').exists()).toBe(true);
    });
  });

  describe('expose', () => {
    it('exposes API via template ref', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const api = wrapper.vm;
      expect(api.next).toBeTypeOf('function');
      expect(api.prev).toBeTypeOf('function');
      expect(api.goTo).toBeTypeOf('function');
      expect(api.adjust).toBeTypeOf('function');
      expect(api.observe).toBeTypeOf('function');
      expect(api.unobserve).toBeTypeOf('function');
    });
  });

  describe('controller lifecycle', () => {
    it('detaches cleanly on unmount', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      wrapper.unmount();
    });

    it('renders data-index on slide wrappers', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      expect(wrapper.find('[data-index="0"]').exists()).toBe(true);
    });
  });

  describe('direction', () => {
    it('renders vertical flex layout by default', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const inner = wrapper.element.querySelector(
        '[style*="flex-direction"]',
      ) as HTMLElement;
      expect(inner).toBeTruthy();
      expect(inner.style.flexDirection).toBe('column');
    });

    it('renders horizontal flex layout when direction=horizontal', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], direction: 'horizontal' },
        slots: { item: itemSlot },
      });

      const inner = wrapper.element.querySelector(
        '[style*="flex-direction"]',
      ) as HTMLElement;
      expect(inner).toBeTruthy();
      expect(inner.style.flexDirection).toBe('row');
    });
  });

  describe('context', () => {
    it('provides ReelContext to children', () => {
      const ContextConsumer = defineComponent({
        setup() {
          const ctx = inject(RK_REEL_KEY, null);
          return () =>
            h(
              'div',
              { 'data-testid': 'ctx' },
              ctx ? 'has-context' : 'no-context',
            );
        },
      });

      const wrapper = mount(Reel, {
        props: { count: 5, size: [400, 600] },
        slots: {
          item: itemSlot,
          default: () => h(ContextConsumer),
        },
      });

      expect(wrapper.find('[data-testid="ctx"]').text()).toBe('has-context');
    });
  });

  describe('auto-size', () => {
    let originalRO: typeof ResizeObserver;

    beforeEach(() => {
      originalRO = globalThis.ResizeObserver;
      globalThis.ResizeObserver =
        MockResizeObserver as unknown as typeof ResizeObserver;
      observedElements = [];
      resizeObserverCallback = null;
    });

    afterEach(() => {
      globalThis.ResizeObserver = originalRO;
    });

    it('does not set inline width/height when size is omitted', () => {
      const wrapper = mount(Reel, {
        props: { count: 3 },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.style.width).toBe('');
      expect(wrapper.element.style.height).toBe('');
    });

    it('does not render slides before measurement', () => {
      const spy = vi.fn(itemSlot);

      mount(Reel, {
        props: { count: 3 },
        slots: { item: spy },
      });

      expect(spy).not.toHaveBeenCalled();
    });

    it('renders slides after ResizeObserver fires', async () => {
      const spy = vi.fn(itemSlot);

      const wrapper = mount(Reel, {
        props: { count: 3 },
        slots: { item: spy },
      });

      triggerResize(400, 600);
      await wrapper.vm.$nextTick();

      expect(spy).toHaveBeenCalled();
    });
  });
});
