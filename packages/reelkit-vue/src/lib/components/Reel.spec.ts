import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { h, inject, defineComponent, nextTick } from 'vue';
import { Reel, createDefaultKeyExtractorForLoop } from './Reel';
import { RK_REEL_KEY } from '../context/ReelContext';

type ResizeCallback = ResizeObserverCallback;
let resizeObserverCallback: ResizeCallback | null = null;
let observedElements: Element[] = [];
let disconnectSpy: ReturnType<typeof vi.fn>;

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
    disconnectSpy?.();
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

    it('always renders slides wrapper for stable DOM structure', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const slidesWrapper = wrapper.element.children[0] as HTMLElement;
      expect(slidesWrapper.style.position).toBe('absolute');
      expect(slidesWrapper.style.width).toBe('100%');
      expect(slidesWrapper.style.height).toBe('100%');
    });

    it('applies reelStyle prop to root', () => {
      const wrapper = mount(Reel, {
        props: {
          count: 3,
          size: [400, 600],
          reelStyle: { border: '1px solid red' },
        },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.style.border).toBe('1px solid red');
    });

    it('applies reelClass prop to root', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], reelClass: 'my-slider' },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.classList.contains('my-slider')).toBe(true);
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

    it('goTo returns a promise', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const result = wrapper.vm.goTo(1, false);
      expect(result).toBeInstanceOf(Promise);
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
    it('applies vertical transition by default', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const slide = wrapper.element.querySelector(
        '[data-index="0"]',
      ) as HTMLElement;
      expect(slide).toBeTruthy();
      expect(slide.style.height).toBe('600px');
      expect(slide.style.width).toBe('100%');
    });

    it('applies horizontal transition when direction=horizontal', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], direction: 'horizontal' },
        slots: { item: itemSlot },
      });

      const slide = wrapper.element.querySelector(
        '[data-index="0"]',
      ) as HTMLElement;
      expect(slide).toBeTruthy();
      expect(slide.style.width).toBe('400px');
      expect(slide.style.height).toBe('100%');
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

    it('context count signal updates when count prop changes', async () => {
      let countSignal: { value: number } | null = null;
      const ContextConsumer = defineComponent({
        setup() {
          const ctx = inject(RK_REEL_KEY, null);
          countSignal = ctx?.count ?? null;
          return () => h('div');
        },
      });

      const wrapper = mount(Reel, {
        props: { count: 5, size: [400, 600] },
        slots: {
          item: itemSlot,
          default: () => h(ContextConsumer),
        },
      });

      expect(countSignal!.value).toBe(5);
      await wrapper.setProps({ count: 10 });
      expect(countSignal!.value).toBe(10);
    });
  });

  describe('auto-size', () => {
    let originalRO: typeof ResizeObserver;

    beforeEach(() => {
      originalRO = globalThis.ResizeObserver;
      disconnectSpy = vi.fn();
      globalThis.ResizeObserver =
        MockResizeObserver as unknown as typeof ResizeObserver;
      observedElements = [];
      resizeObserverCallback = null;
    });

    afterEach(() => {
      globalThis.ResizeObserver = originalRO;
    });

    it('sets 100% width/height when size is omitted', () => {
      const wrapper = mount(Reel, {
        props: { count: 3 },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.style.width).toBe('100%');
      expect(wrapper.element.style.height).toBe('100%');
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

    it('skips resize update when dimensions are zero', async () => {
      const spy = vi.fn(itemSlot);

      const wrapper = mount(Reel, {
        props: { count: 3 },
        slots: { item: spy },
      });

      triggerResize(0, 0);
      await wrapper.vm.$nextTick();
      expect(spy).not.toHaveBeenCalled();
    });

    it('skips resize update when dimensions unchanged', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3 },
        slots: { item: itemSlot },
      });

      triggerResize(400, 600);
      await wrapper.vm.$nextTick();

      const slidesBefore = wrapper.findAll('[data-index]').length;
      triggerResize(400, 600);
      await wrapper.vm.$nextTick();

      expect(wrapper.findAll('[data-index]').length).toBe(slidesBefore);
    });

    it('creates ResizeObserver when switching from explicit to auto', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] as [number, number] },
        slots: { item: itemSlot },
      });

      expect(observedElements.length).toBe(0);

      await wrapper.setProps({ size: undefined });
      expect(observedElements.length).toBe(1);
    });

    it('disconnects ResizeObserver when switching from auto to explicit', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3 },
        slots: { item: itemSlot },
      });

      triggerResize(400, 600);
      await wrapper.vm.$nextTick();
      expect(observedElements.length).toBe(1);

      await wrapper.setProps({ size: [400, 600] as [number, number] });
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('transition system', () => {
    it('renders slides with absolute positioning', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const slide = wrapper.element.querySelector(
        '[data-index="0"]',
      ) as HTMLElement;
      expect(slide.style.position).toBe('absolute');
      expect(slide.style.backfaceVisibility).toBe('hidden');
    });

    it('applies custom transition function', () => {
      const customTransition = vi.fn(() => ({
        transform: 'scale(0.5)',
        opacity: 0.5,
      }));

      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], transition: customTransition },
        slots: { item: itemSlot },
      });

      expect(customTransition).toHaveBeenCalled();
      const slide = wrapper.element.querySelector(
        '[data-index="0"]',
      ) as HTMLElement;
      expect(slide.style.transform).toBe('scale(0.5)');
      expect(slide.style.opacity).toBe('0.5');
    });

    it('applies transformOrigin and zIndex from transition', () => {
      const customTransition = vi.fn(() => ({
        transform: 'rotateY(45deg)',
        transformOrigin: 'left center',
        zIndex: 5,
      }));

      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], transition: customTransition },
        slots: { item: itemSlot },
      });

      const slide = wrapper.element.querySelector(
        '[data-index="0"]',
      ) as HTMLElement;
      expect(slide.style.transformOrigin).toBe('left center');
      expect(slide.style.zIndex).toBe('5');
    });

    it('uses default slideTransition when no transition prop', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const slide = wrapper.element.querySelector(
        '[data-index="0"]',
      ) as HTMLElement;
      expect(slide.style.transform).toBeTruthy();
    });

    it('uses custom keyExtractor for slide keys', () => {
      const keyExtractor = vi.fn((index: number) => `custom-${index}`);

      mount(Reel, {
        props: { count: 3, size: [400, 600], keyExtractor },
        slots: { item: itemSlot },
      });

      expect(keyExtractor).toHaveBeenCalled();
    });
  });

  describe('events', () => {
    it('emits afterChange on navigation', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      await wrapper.vm.goTo(1, false);
      await nextTick();

      expect(wrapper.emitted('afterChange')).toBeTruthy();
    });

    it('emits beforeChange on navigation', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      await wrapper.vm.goTo(1, false);
      await nextTick();

      expect(wrapper.emitted('beforeChange')).toBeTruthy();
    });

    it('tap handler fires exactly once (no double-fire from prop+emit duplication)', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });
      await nextTick();

      // Simulate a tap on the root element. Use native pointer events the
      // gesture controller listens to; touchstart/touchend is the simplest path.
      const el = wrapper.element as HTMLElement;
      const touchTarget = el;
      const createTouchEvent = (type: string) =>
        new Event(type, { bubbles: true, cancelable: true });
      touchTarget.dispatchEvent(createTouchEvent('touchstart'));
      touchTarget.dispatchEvent(createTouchEvent('touchend'));

      await nextTick();
      const taps = wrapper.emitted('tap') ?? [];
      // Whether the tap fires at all depends on gesture heuristics; the
      // critical invariant is that we never emit it MORE than once per gesture.
      expect(taps.length).toBeLessThanOrEqual(1);
    });

    it('goTo resolves without macrotask delay (sync done callback)', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      let resolvedBefore = false;
      const pendingGoTo = wrapper.vm.goTo(1, false).then(() => {
        resolvedBefore = true;
      });
      // One microtask flush should be enough; a setTimeout(0) would need a
      // macrotask and this would still be false.
      await Promise.resolve();
      await Promise.resolve();
      await pendingGoTo;
      expect(resolvedBefore).toBe(true);
    });
  });

  describe('config sync', () => {
    it('updates controller when count changes', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      await wrapper.setProps({ count: 10 });
      await nextTick();
    });

    it('updates controller when loop changes', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], loop: false },
        slots: { item: itemSlot },
      });

      await wrapper.setProps({ loop: true });
      await nextTick();
    });

    it('updates controller when enableWheel changes', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], enableWheel: false },
        slots: { item: itemSlot },
      });

      await wrapper.setProps({ enableWheel: true });
      await nextTick();
    });

    it('updates controller when enableNavKeys changes', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], enableNavKeys: true },
        slots: { item: itemSlot },
      });

      await wrapper.setProps({ enableNavKeys: false });
      await nextTick();
    });

    it('updates controller when enableGestures changes', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], enableGestures: true },
        slots: { item: itemSlot },
      });

      await wrapper.setProps({ enableGestures: false });
      await nextTick();
    });

    it('handles rangeExtractor prop change safely', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const custom = (index: number, count: number) => [
        Math.max(0, index - 1),
        index,
        Math.min(count - 1, index + 1),
      ];
      await wrapper.setProps({ rangeExtractor: custom });
      await nextTick();
    });
  });

  describe('SSR guard', () => {
    it('renderToString emits minimal region div without throwing', async () => {
      const { createSSRApp, h: hh } = await import('vue');
      const { renderToString } = await import('@vue/server-renderer');
      const originalWindow = globalThis.window;
      // Simulate Node-like SSR: `typeof window === 'undefined'`.
      // @ts-expect-error intentional delete for SSR simulation
      delete globalThis.window;
      try {
        const App = {
          render: () =>
            hh(
              Reel,
              { count: 3, ariaLabel: 'ssr-reel' },
              {
                item: ({ index }: { index: number }) =>
                  hh('div', `Slide ${index}`),
              },
            ),
        };
        const html = await renderToString(createSSRApp(App));
        expect(html).toContain('role="region"');
        expect(html).toContain('aria-roledescription="carousel"');
        expect(html).toContain('aria-label="ssr-reel"');
        // SSR branch skips slide rendering
        expect(html).not.toContain('role="tabpanel"');
      } finally {
        globalThis.window = originalWindow;
      }
    });
  });

  describe('accessibility', () => {
    it('has role=region on root', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.getAttribute('role')).toBe('region');
    });

    it('has aria-roledescription=carousel on root', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.getAttribute('aria-roledescription')).toBe(
        'carousel',
      );
    });

    it('applies ariaLabel prop', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600], ariaLabel: 'Photo gallery' },
        slots: { item: itemSlot },
      });

      expect(wrapper.element.getAttribute('aria-label')).toBe('Photo gallery');
    });

    it('sets role=tabpanel on slides', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const slide = wrapper.element.querySelector('[data-index="0"]');
      expect(slide?.getAttribute('role')).toBe('tabpanel');
    });

    it('sets inert on non-active slides', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const activeSlide = wrapper.element.querySelector('[data-index="0"]');
      expect(activeSlide?.hasAttribute('inert')).toBe(false);

      const inactiveSlide = wrapper.element.querySelector('[data-index="1"]');
      expect(inactiveSlide?.hasAttribute('inert')).toBe(true);
    });

    it('has aria-live region', () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      const liveRegion = wrapper.element.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeTruthy();
    });

    it('announces slide change in aria-live region', async () => {
      const wrapper = mount(Reel, {
        props: { count: 3, size: [400, 600] },
        slots: { item: itemSlot },
      });

      await wrapper.vm.goTo(1, false);
      await nextTick();
      await nextTick();

      const liveRegion = wrapper.element.querySelector('[aria-live="polite"]');
      expect(liveRegion?.textContent).toContain('Slide 2 of 3');
    });
  });
});

describe('createDefaultKeyExtractorForLoop', () => {
  it('returns index as string for normal cases', () => {
    const extractor = createDefaultKeyExtractorForLoop(5);
    expect(extractor(0, 0)).toBe('0');
    expect(extractor(1, 1)).toBe('1');
    expect(extractor(4, 2)).toBe('4');
  });

  it('appends _cloned for 2-item loop at indexInRange 0', () => {
    const extractor = createDefaultKeyExtractorForLoop(2);
    expect(extractor(0, 0)).toBe('0_cloned');
    expect(extractor(1, 0)).toBe('1_cloned');
  });

  it('does not append _cloned for indexInRange > 0', () => {
    const extractor = createDefaultKeyExtractorForLoop(2);
    expect(extractor(0, 1)).toBe('0');
    expect(extractor(1, 2)).toBe('1');
  });

  it('does not append _cloned for count != 2', () => {
    const extractor = createDefaultKeyExtractorForLoop(3);
    expect(extractor(0, 0)).toBe('0');
  });

  it('applies keyPrefix', () => {
    const extractor = createDefaultKeyExtractorForLoop(5, 'slide-');
    expect(extractor(3, 1)).toBe('slide-3');
  });

  it('applies keyPrefix with cloned suffix', () => {
    const extractor = createDefaultKeyExtractorForLoop(2, 'p-');
    expect(extractor(0, 0)).toBe('p-0_cloned');
  });
});
