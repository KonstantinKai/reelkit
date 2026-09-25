import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, type Component } from 'vue';
import {
  SwipeToClose,
  useOverlayUrlState,
  urlIndexKey,
  type UrlAdapter,
} from '@reelkit/vue';
import {
  LightboxOverlay,
  LightboxUrlOverlay,
  type LightboxApi,
} from './LightboxOverlay';
import type {
  ControlsSlotScope,
  ErrorSlotScope,
  InfoSlotScope,
  LightboxItem,
  LoadingSlotScope,
  NavigationSlotScope,
  SlideSlotScope,
} from './types';

// How many times the slider was asked to draw. The real Reel renders inside
// the counter, so every test in this file still exercises the real thing.
const reel = vi.hoisted(() => ({ renders: 0 }));

vi.mock('@reelkit/vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reelkit/vue')>();
  const {
    defineComponent: define,
    h: render,
    shallowRef,
  } = await import('vue');
  const RealReel = actual.Reel as unknown as Component;

  return {
    ...actual,
    Reel: define({
      name: 'CountedReel',
      inheritAttrs: false,
      setup(_, { attrs, slots, expose }) {
        const inner = shallowRef<Record<string, unknown> | null>(null);

        // The overlay keeps the slider's own api in a template ref and calls
        // it, so the counter has to hand that api through untouched.
        expose(
          new Proxy(
            {},
            {
              get: (_target, key) => inner.value?.[key as string],
              has: (_target, key) =>
                Boolean(inner.value) && key in inner.value!,
            },
          ),
        );

        return () => {
          reel.renders++;
          return render(
            RealReel,
            {
              ...attrs,
              ref: (el: unknown) =>
                (inner.value = el as Record<string, unknown> | null),
            },
            slots,
          );
        };
      },
    }),
  };
});

const sampleItems: LightboxItem[] = [
  {
    src: 'https://example.com/a.jpg',
    title: 'Alpha',
    description: 'first',
  },
  {
    src: 'https://example.com/b.jpg',
    title: 'Beta',
    description: 'second',
  },
  {
    src: 'https://example.com/c.jpg',
    title: 'Gamma',
  },
];

class MockResizeObserver {
  observe() {
    /* noop */
  }
  unobserve() {
    /* noop */
  }
  disconnect() {
    /* noop */
  }
}

beforeEach(() => {
  Object.defineProperty(window, 'innerWidth', {
    value: 1024,
    configurable: true,
  });
  Object.defineProperty(window, 'innerHeight', {
    value: 768,
    configurable: true,
  });
  (
    global as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
});

afterEach(() => {
  document.body.innerHTML = '';
});

describe('LightboxOverlay', () => {
  it('renders nothing when isOpen is false', () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: false,
            items: sampleItems,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    expect(document.querySelector('.rk-lightbox-overlay')).toBeNull();
  });

  it('renders teleported overlay when isOpen is true', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    const overlay = document.querySelector('.rk-lightbox-overlay');
    expect(overlay).not.toBeNull();
    expect(overlay?.getAttribute('role')).toBe('dialog');
    expect(overlay?.getAttribute('aria-modal')).toBe('true');
    expect(overlay?.getAttribute('aria-label')).toBe('Image gallery');
  });

  it('respects a custom ariaLabel', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            ariaLabel: 'Photo preview',
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    expect(
      document
        .querySelector('.rk-lightbox-overlay')
        ?.getAttribute('aria-label'),
    ).toBe('Photo preview');
  });

  it('emits close on Escape key', async () => {
    const onClose = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            onClose,
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('emits close + update:isOpen when the close button is clicked', async () => {
    const onClose = vi.fn();
    const onUpdate = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            onClose,
            'onUpdate:isOpen': onUpdate,
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    const closeBtn = document.querySelector(
      '.rk-lightbox-close',
    ) as HTMLButtonElement | null;
    expect(closeBtn).not.toBeNull();
    closeBtn?.click();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(false);
  });

  it('tears down when isOpen toggles to false', async () => {
    const isOpen = ref(true);
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: isOpen.value,
            items: sampleItems,
            onClose: () => {
              isOpen.value = false;
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-lightbox-overlay')).not.toBeNull();

    isOpen.value = false;
    await nextTick();
    expect(document.querySelector('.rk-lightbox-overlay')).toBeNull();
  });

  it('renders the built-in info overlay with title and description', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    const title = document.querySelector('.rk-lightbox-info-title');
    const description = document.querySelector('.rk-lightbox-info-description');
    expect(title?.textContent).toBe('Alpha');
    expect(description?.textContent).toBe('first');
  });

  it("defaults SwipeToClose direction to 'up'", async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    const wrapper = mount(Host, { attachTo: document.body });
    await nextTick();
    expect(wrapper.findComponent(SwipeToClose).props('direction')).toBe('up');
  });

  it('forwards swipeToCloseDirection="down" to SwipeToClose', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            swipeToCloseDirection: 'down',
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    const wrapper = mount(Host, { attachTo: document.body });
    await nextTick();
    expect(wrapper.findComponent(SwipeToClose).props('direction')).toBe('down');
  });

  it('omits the info overlay when showInfo is false', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            showInfo: false,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-lightbox-info')).toBeNull();
  });
});

/** In-memory adapter driving the overlay in url mode from a controlled query. */
function fakeAdapter(initialQuery = '') {
  let query = initialQuery;
  let state: unknown = null;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((fn) => fn());
  const adapter: UrlAdapter = {
    read: () => query,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    push: (to, s) => {
      query = to;
      state = s;
      notify();
    },
    replace: (to, s) => {
      query = to;
      state = { ...(state as object), ...(s as object) };
      notify();
    },
    getState: () => state,
    goBack: () => undefined,
  };
  return { adapter, query: () => query };
}

const urlHost = (adapter: UrlAdapter) =>
  defineComponent({
    setup() {
      // The consumer builds the controller and hands it to the overlay.
      const controller = useOverlayUrlState({
        param: 'photo',
        adapter,
        ...urlIndexKey(() => sampleItems.length),
      });
      return () =>
        h(LightboxUrlOverlay, {
          items: sampleItems,
          controller,
        });
    },
  });

describe('LightboxUrlOverlay', () => {
  it('opens at the slide the parameter names', async () => {
    const { adapter } = fakeAdapter('?photo=1');
    mount(urlHost(adapter), { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-lightbox-overlay')).not.toBeNull();
  });

  it('closes and clears the parameter on the close button', async () => {
    const state = fakeAdapter('?photo=0');
    mount(urlHost(state.adapter), { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-lightbox-overlay')).not.toBeNull();

    (
      document.querySelector('.rk-lightbox-close') as HTMLElement | null
    )?.click();
    await nextTick();
    await nextTick();
    expect(document.querySelector('.rk-lightbox-overlay')).toBeNull();
    expect(state.query()).not.toContain('photo');
  });

  it('drops a parameter that names no slide instead of opening it', async () => {
    // The index locator bounds 99 against the 3-item gallery, so the overlay
    // stays closed and the stale parameter self-heals out of the URL.
    const state = fakeAdapter('?photo=99');
    mount(urlHost(state.adapter), { attachTo: document.body });
    await nextTick();
    await nextTick();
    expect(document.querySelector('.rk-lightbox-overlay')).toBeNull();
    expect(state.query()).not.toContain('photo=99');
  });
});

describe('LightboxOverlay slider isolation', () => {
  const openLightbox = () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            isOpen: true,
            items: sampleItems,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    return mount(Host, { attachTo: document.body });
  };

  const settle = async () => {
    await nextTick();
    await nextTick();
  };

  const setFullscreenElement = (el: Element | null) => {
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: el,
    });
    document.dispatchEvent(new Event('fullscreenchange'));
  };

  beforeEach(() => {
    reel.renders = 0;
  });

  afterEach(() => setFullscreenElement(null));

  it('leaves the slider alone when a slide reports it is ready', async () => {
    openLightbox();
    await settle();

    reel.renders = 0;
    document.querySelector('img')?.dispatchEvent(new Event('load'));
    await settle();

    expect(reel.renders).toBe(0);
  });

  it('leaves the slider alone when a slide reports an error', async () => {
    openLightbox();
    await settle();

    reel.renders = 0;
    document.querySelector('img')?.dispatchEvent(new Event('error'));
    await settle();

    expect(reel.renders).toBe(0);
  });

  it('leaves the slider alone when the window enters fullscreen', async () => {
    openLightbox();
    await settle();

    reel.renders = 0;
    setFullscreenElement(
      document.querySelector('.rk-lightbox-overlay') ?? document.body,
    );
    await settle();

    expect(reel.renders).toBe(0);
  });

  // Drawing nothing again would also score zero, so each region has to be
  // shown following the signal it was handed.
  it('still shows the error state once a slide fails', async () => {
    openLightbox();
    await settle();
    expect(document.querySelector('.rk-lightbox-error')).toBeNull();

    document.querySelector('img')?.dispatchEvent(new Event('error'));
    await settle();

    expect(document.querySelector('.rk-lightbox-error')).not.toBeNull();
  });

  it('still swaps the fullscreen control when fullscreen is entered', async () => {
    openLightbox();
    await settle();
    expect(document.querySelector('[title="Enter Fullscreen"]')).not.toBeNull();

    setFullscreenElement(
      document.querySelector('.rk-lightbox-overlay') ?? document.body,
    );
    await settle();

    expect(document.querySelector('[title="Exit Fullscreen"]')).not.toBeNull();
  });
});

describe('LightboxOverlay on a desktop pointer', () => {
  let touchStartDescriptor: PropertyDescriptor | undefined;
  let maxTouchPointsDescriptor: PropertyDescriptor | undefined;

  // The arrows only render without touch support, and jsdom advertises
  // `ontouchstart`, so each test here runs on a mouse-only window.
  beforeEach(() => {
    touchStartDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'ontouchstart',
    );
    maxTouchPointsDescriptor = Object.getOwnPropertyDescriptor(
      navigator,
      'maxTouchPoints',
    );
    delete (window as unknown as Record<string, unknown>)['ontouchstart'];
    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 0,
    });
  });

  afterEach(() => {
    if (touchStartDescriptor) {
      Object.defineProperty(window, 'ontouchstart', touchStartDescriptor);
    }
    if (maxTouchPointsDescriptor) {
      Object.defineProperty(
        navigator,
        'maxTouchPoints',
        maxTouchPointsDescriptor,
      );
    } else {
      delete (navigator as unknown as Record<string, unknown>)[
        'maxTouchPoints'
      ];
    }
    Object.defineProperty(document, 'fullscreenElement', {
      configurable: true,
      value: null,
    });
  });

  const settle = async () => {
    await nextTick();
    await nextTick();
  };

  type OpenOptions = {
    items?: LightboxItem[];
    props?: Record<string, unknown>;
    slots?: Record<string, (scope: never) => unknown>;
  };

  const openLightbox = async ({
    items = sampleItems,
    props = {},
    slots,
  }: OpenOptions = {}) => {
    const onClose = vi.fn();
    const onSlideChange = vi.fn();
    const onApiReady = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            LightboxOverlay,
            {
              isOpen: true,
              items,
              onClose,
              onSlideChange,
              onApiReady,
              ...props,
            },
            slots,
          );
      },
    });
    const wrapper = mount(Host, { attachTo: document.body });
    await settle();
    const api = () => onApiReady.mock.calls.at(-1)?.[0] as LightboxApi;
    return { wrapper, api, onClose, onSlideChange, onApiReady };
  };

  const prevArrow = () => document.querySelector('.rk-lightbox-nav-prev');
  const nextArrow = () => document.querySelector('.rk-lightbox-nav-next');

  it('shows only the next arrow on the first slide', async () => {
    await openLightbox();

    expect(nextArrow()).not.toBeNull();
    expect(prevArrow()).toBeNull();
  });

  it('shows only the previous arrow on the last slide', async () => {
    await openLightbox({ props: { initialIndex: 2 } });

    expect(prevArrow()).not.toBeNull();
    expect(nextArrow()).toBeNull();
  });

  it('shows both arrows on every slide when looping', async () => {
    await openLightbox({ props: { loop: true } });

    expect(prevArrow()).not.toBeNull();
    expect(nextArrow()).not.toBeNull();
  });

  it('moves to the next slide when the next arrow is clicked', async () => {
    const { onSlideChange } = await openLightbox();

    (nextArrow() as HTMLButtonElement).click();

    await vi.waitFor(() => expect(onSlideChange).toHaveBeenCalledWith(1));
    await settle();
    expect(prevArrow()).not.toBeNull();
    expect(document.querySelector('.rk-lightbox-info-title')?.textContent).toBe(
      'Beta',
    );
  });

  it('moves to the previous slide when the previous arrow is clicked', async () => {
    const { onSlideChange } = await openLightbox({
      props: { initialIndex: 2 },
    });

    (prevArrow() as HTMLButtonElement).click();

    await vi.waitFor(() => expect(onSlideChange).toHaveBeenCalledWith(1));
  });

  it('hides the arrows when showNavigation is false', async () => {
    await openLightbox({ props: { showNavigation: false } });

    expect(nextArrow()).toBeNull();
    expect(prevArrow()).toBeNull();
  });

  it('hides the arrows for a single item', async () => {
    await openLightbox({ items: [sampleItems[0]] });

    expect(nextArrow()).toBeNull();
    expect(prevArrow()).toBeNull();
  });

  it('hides the arrows once a resize reports a touch device', async () => {
    await openLightbox();
    expect(nextArrow()).not.toBeNull();

    Object.defineProperty(navigator, 'maxTouchPoints', {
      configurable: true,
      value: 5,
    });
    window.dispatchEvent(new Event('resize'));
    await settle();

    expect(nextArrow()).toBeNull();
  });

  it('resizes every slide to the new window size', async () => {
    await openLightbox();

    Object.defineProperty(window, 'innerWidth', {
      value: 800,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 600,
      configurable: true,
    });
    window.dispatchEvent(new Event('resize'));
    await settle();

    const slide = document.querySelector('.rk-lightbox-slide') as HTMLElement;
    expect(slide.style.width).toBe('800px');
    expect(slide.style.height).toBe('600px');
  });

  it('renders nothing while the window has no size', async () => {
    Object.defineProperty(window, 'innerWidth', {
      value: 0,
      configurable: true,
    });
    await openLightbox();

    expect(document.querySelector('.rk-lightbox-overlay')).toBeNull();
  });

  it('renders the navigation slot in place of the arrows', async () => {
    const scopes: NavigationSlotScope[] = [];
    await openLightbox({
      slots: {
        navigation: (scope: NavigationSlotScope) => {
          scopes.push(scope);
          return h(
            'button',
            { class: 'custom-next', onClick: scope.onNext },
            'next',
          );
        },
      } as OpenOptions['slots'],
    });

    expect(nextArrow()).toBeNull();
    expect(document.querySelector('.custom-next')).not.toBeNull();
    expect(scopes.at(-1)).toMatchObject({
      item: sampleItems[0],
      activeIndex: 0,
      count: 3,
    });
  });

  it('lets the navigation slot move the slider', async () => {
    const { onSlideChange } = await openLightbox({
      props: { initialIndex: 1 },
      slots: {
        navigation: (scope: NavigationSlotScope) =>
          h('button', { class: 'custom-prev', onClick: scope.onPrev }, 'prev'),
      } as OpenOptions['slots'],
    });

    (document.querySelector('.custom-prev') as HTMLButtonElement).click();

    await vi.waitFor(() => expect(onSlideChange).toHaveBeenCalledWith(0));
  });

  it('falls back to the arrows when the navigation slot renders nothing', async () => {
    await openLightbox({
      slots: { navigation: () => null } as OpenOptions['slots'],
    });

    expect(nextArrow()).not.toBeNull();
  });

  it('renders the controls slot in place of the built-in bar', async () => {
    const scopes: ControlsSlotScope[] = [];
    await openLightbox({
      slots: {
        controls: (scope: ControlsSlotScope) => {
          scopes.push(scope);
          return h(
            'button',
            { class: 'custom-close', onClick: scope.onClose },
            'x',
          );
        },
      } as OpenOptions['slots'],
    });

    expect(document.querySelector('.rk-lightbox-close')).toBeNull();
    expect(scopes.at(-1)).toMatchObject({
      item: sampleItems[0],
      activeIndex: 0,
      count: 3,
      isFullscreen: false,
    });
  });

  it('closes from the controls slot close handler', async () => {
    const { onClose } = await openLightbox({
      slots: {
        controls: (scope: ControlsSlotScope) =>
          h('button', { class: 'custom-close', onClick: scope.onClose }, 'x'),
      } as OpenOptions['slots'],
    });

    (document.querySelector('.custom-close') as HTMLButtonElement).click();

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('falls back to the built-in bar when the controls slot renders nothing', async () => {
    await openLightbox({
      slots: { controls: () => null } as OpenOptions['slots'],
    });

    expect(document.querySelector('.rk-lightbox-close')).not.toBeNull();
  });

  it('omits the controls bar when showControls is false', async () => {
    await openLightbox({ props: { showControls: false } });

    expect(document.querySelector('.rk-lightbox-close')).toBeNull();
  });

  it('requests fullscreen on the overlay from the fullscreen button', async () => {
    const requestFullscreen = vi.fn(() => Promise.resolve());
    HTMLElement.prototype.requestFullscreen = requestFullscreen;
    try {
      await openLightbox();

      (
        document.querySelector(
          '[title="Enter Fullscreen"]',
        ) as HTMLButtonElement
      ).click();
      await settle();

      expect(requestFullscreen).toHaveBeenCalledTimes(1);
      expect(requestFullscreen.mock.contexts[0]).toBe(
        document.querySelector('.rk-lightbox-overlay'),
      );
    } finally {
      delete (HTMLElement.prototype as unknown as Record<string, unknown>)[
        'requestFullscreen'
      ];
    }
  });

  it('leaves fullscreen on Escape instead of closing', async () => {
    const exitFullscreen = vi.fn(() => Promise.resolve());
    document.exitFullscreen = exitFullscreen;
    try {
      const { onClose } = await openLightbox();
      Object.defineProperty(document, 'fullscreenElement', {
        configurable: true,
        value: document.querySelector('.rk-lightbox-overlay'),
      });
      document.dispatchEvent(new Event('fullscreenchange'));
      await settle();

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

      expect(exitFullscreen).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    } finally {
      delete (document as unknown as Record<string, unknown>)['exitFullscreen'];
    }
  });

  it('ignores keys other than Escape', async () => {
    const { onClose } = await openLightbox();

    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('renders the info slot with the active item', async () => {
    const scopes: InfoSlotScope[] = [];
    await openLightbox({
      slots: {
        info: (scope: InfoSlotScope) => {
          scopes.push(scope);
          return h('div', { class: 'custom-info' }, scope.item.title);
        },
      } as OpenOptions['slots'],
    });

    expect(document.querySelector('.rk-lightbox-info')).toBeNull();
    expect(document.querySelector('.custom-info')?.textContent).toBe('Alpha');
    expect(scopes.at(-1)).toEqual({ item: sampleItems[0], index: 0 });
  });

  it('omits the built-in info for an item without title or description', async () => {
    await openLightbox({ items: [{ src: 'https://example.com/plain.jpg' }] });

    expect(document.querySelector('.rk-lightbox-info')).toBeNull();
  });

  it('renders the slide slot in place of the built-in image', async () => {
    const scopes: SlideSlotScope[] = [];
    await openLightbox({
      slots: {
        slide: (scope: SlideSlotScope) => {
          scopes.push(scope);
          return h('div', { class: 'custom-slide' }, String(scope.index));
        },
      } as OpenOptions['slots'],
    });

    expect(document.querySelector('.custom-slide')).not.toBeNull();
    expect(document.querySelector('img.rk-lightbox-img')).toBeNull();
    const active = scopes.find((scope) => scope.index === 0);
    expect(active).toMatchObject({
      item: sampleItems[0],
      isActive: true,
      size: [1024, 768],
    });
  });

  it('clears the spinner once the slide slot reports ready', async () => {
    let ready: (() => void) | undefined;
    await openLightbox({
      items: [{ src: 'https://example.com/slot-ready.jpg' }],
      slots: {
        slide: (scope: SlideSlotScope) => {
          ready = scope.onReady;
          return h('div', { class: 'custom-slide' });
        },
      } as OpenOptions['slots'],
    });
    expect(document.querySelector('.rk-lightbox-spinner')).not.toBeNull();

    ready!();
    await settle();

    expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
  });

  it('shows the spinner again when the slide slot reports buffering', async () => {
    let scope: SlideSlotScope | undefined;
    await openLightbox({
      items: [{ src: 'https://example.com/slot-waiting.jpg' }],
      slots: {
        slide: (slotScope: SlideSlotScope) => {
          scope = slotScope;
          return h('div', { class: 'custom-slide' });
        },
      } as OpenOptions['slots'],
    });
    scope!.onReady();
    await settle();

    scope!.onWaiting();
    await settle();

    expect(document.querySelector('.rk-lightbox-spinner')).not.toBeNull();
  });

  it('shows the error state once the slide slot reports an error', async () => {
    let fail: (() => void) | undefined;
    await openLightbox({
      items: [{ src: 'https://example.com/slot-error.jpg' }],
      slots: {
        slide: (scope: SlideSlotScope) => {
          fail = scope.onError;
          return h('div', { class: 'custom-slide' });
        },
      } as OpenOptions['slots'],
    });

    fail!();
    await settle();

    expect(document.querySelector('.rk-lightbox-error')).not.toBeNull();
  });

  it('falls back to the built-in image when the slide slot renders nothing', async () => {
    await openLightbox({
      slots: { slide: () => null } as OpenOptions['slots'],
    });

    expect(document.querySelector('img.rk-lightbox-img')).not.toBeNull();
  });

  it('renders the loading slot in place of the spinner', async () => {
    const scopes: LoadingSlotScope[] = [];
    await openLightbox({
      items: [{ src: 'https://example.com/loading-slot.jpg' }],
      slots: {
        loading: (scope: LoadingSlotScope) => {
          scopes.push(scope);
          return h('div', { class: 'custom-loading' });
        },
      } as OpenOptions['slots'],
    });

    expect(document.querySelector('.custom-loading')).not.toBeNull();
    expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
    expect(scopes.at(-1)?.activeIndex).toBe(0);
  });

  it('falls back to the spinner when the loading slot renders nothing', async () => {
    await openLightbox({
      items: [{ src: 'https://example.com/loading-empty.jpg' }],
      slots: { loading: () => null } as OpenOptions['slots'],
    });

    expect(document.querySelector('.rk-lightbox-spinner')).not.toBeNull();
  });

  it('renders the error slot once the image fails', async () => {
    const scopes: ErrorSlotScope[] = [];
    await openLightbox({
      items: [{ src: 'https://example.com/error-slot.jpg' }],
      slots: {
        error: (scope: ErrorSlotScope) => {
          scopes.push(scope);
          return h('div', { class: 'custom-error' });
        },
      } as OpenOptions['slots'],
    });

    document.querySelector('img')?.dispatchEvent(new Event('error'));
    await settle();

    expect(document.querySelector('.custom-error')).not.toBeNull();
    expect(document.querySelector('.rk-lightbox-error')).toBeNull();
    expect(scopes.at(-1)?.activeIndex).toBe(0);
  });

  it('falls back to the built-in error when the error slot renders nothing', async () => {
    await openLightbox({
      items: [{ src: 'https://example.com/error-empty.jpg' }],
      slots: { error: () => null } as OpenOptions['slots'],
    });

    document.querySelector('img')?.dispatchEvent(new Event('error'));
    await settle();

    expect(document.querySelector('.rk-lightbox-error')).not.toBeNull();
  });

  it('shows the error state straight away on returning to a failed image', async () => {
    const items: LightboxItem[] = [
      { src: 'https://example.com/returns-broken.jpg' },
      { src: 'https://example.com/returns-next.jpg' },
    ];
    const { api, onSlideChange } = await openLightbox({ items });
    document.querySelector('img')?.dispatchEvent(new Event('error'));
    await settle();

    await api().goTo(1, false);
    await settle();
    expect(document.querySelector('.rk-lightbox-error')).toBeNull();

    await api().goTo(0, false);
    await settle();

    expect(onSlideChange).toHaveBeenLastCalledWith(0);
    expect(document.querySelector('.rk-lightbox-error')).not.toBeNull();
  });

  it('skips the spinner on returning to an image that already loaded', async () => {
    const items: LightboxItem[] = [
      { src: 'https://example.com/returns-loaded.jpg' },
      { src: 'https://example.com/returns-other.jpg' },
    ];
    const { api } = await openLightbox({ items });
    const firstImage = document.querySelector(
      `img[src="${items[0].src}"]`,
    ) as HTMLImageElement;
    firstImage.dispatchEvent(new Event('load'));
    await settle();

    await api().goTo(1, false);
    await settle();
    expect(document.querySelector('.rk-lightbox-spinner')).not.toBeNull();

    await api().goTo(0, false);
    await settle();

    expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
  });

  it('hands out an api that drives the slider and closes', async () => {
    const { api, onSlideChange, onClose, onApiReady } = await openLightbox();
    expect(onApiReady).toHaveBeenCalled();

    api().next();
    await vi.waitFor(() => expect(onSlideChange).toHaveBeenLastCalledWith(1));

    api().prev();
    await vi.waitFor(() => expect(onSlideChange).toHaveBeenLastCalledWith(0));

    await api().goTo(2, false);
    expect(onSlideChange).toHaveBeenLastCalledWith(2);

    api().unobserve();
    api().observe();
    api().adjust();

    api().close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('exposes the same api on the template ref', async () => {
    const lightbox = ref<LightboxApi | null>(null);
    const isOpen = ref(false);
    const onSlideChange = vi.fn();
    const onClose = vi.fn();
    const onUpdate = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(LightboxOverlay, {
            ref: lightbox,
            isOpen: isOpen.value,
            items: sampleItems,
            onClose,
            onSlideChange,
            'onUpdate:isOpen': onUpdate,
          });
      },
    });
    mount(Host, { attachTo: document.body });

    // Closed: every slider method is a no-op and goTo still resolves.
    lightbox.value!.next();
    lightbox.value!.prev();
    lightbox.value!.adjust();
    lightbox.value!.observe();
    lightbox.value!.unobserve();
    await expect(lightbox.value!.goTo(1)).resolves.toBeUndefined();
    expect(onSlideChange).not.toHaveBeenCalled();

    isOpen.value = true;
    await settle();

    lightbox.value!.next();
    await vi.waitFor(() => expect(onSlideChange).toHaveBeenLastCalledWith(1));
    lightbox.value!.prev();
    await vi.waitFor(() => expect(onSlideChange).toHaveBeenLastCalledWith(0));
    await lightbox.value!.goTo(2, false);
    expect(onSlideChange).toHaveBeenLastCalledWith(2);
    lightbox.value!.unobserve();
    lightbox.value!.observe();
    lightbox.value!.adjust();

    lightbox.value!.close();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onUpdate).toHaveBeenCalledWith(false);
  });

  it('preloads the poster of a neighbouring video instead of the video', async () => {
    const created: string[] = [];
    vi.stubGlobal(
      'Image',
      class {
        onload: (() => void) | null = null;
        onerror: (() => void) | null = null;
        set src(value: string) {
          created.push(value);
        }
      },
    );
    try {
      await openLightbox({
        items: [
          { src: 'https://example.com/before-video.jpg' },
          {
            type: 'video',
            src: 'https://example.com/neighbour.mp4',
            poster: 'https://example.com/neighbour-poster.jpg',
          },
        ],
      });

      expect(created).toContain('https://example.com/neighbour-poster.jpg');
      expect(created).not.toContain('https://example.com/neighbour.mp4');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});

describe('LightboxUrlOverlay slide changes', () => {
  it('writes the new slide into the url and reports it', async () => {
    const state = fakeAdapter('?photo=0');
    const onSlideChange = vi.fn();
    const onApiReady = vi.fn();
    const Host = defineComponent({
      setup() {
        const controller = useOverlayUrlState({
          param: 'photo',
          adapter: state.adapter,
          ...urlIndexKey(() => sampleItems.length),
        });
        return () =>
          h(LightboxUrlOverlay, {
            items: sampleItems,
            controller,
            onSlideChange,
            onApiReady,
          });
      },
    });
    mount(Host, { attachTo: document.body });
    await nextTick();
    await nextTick();

    const api = onApiReady.mock.calls.at(-1)?.[0] as LightboxApi;
    await api.goTo(2, false);
    await nextTick();

    expect(onSlideChange).toHaveBeenCalledWith(2);
    expect(state.query()).toContain('photo=2');
  });

  it('exposes an api on the template ref that closes through the url', async () => {
    const state = fakeAdapter('');
    const lightbox = ref<LightboxApi | null>(null);
    const onClose = vi.fn();
    const onSlideChange = vi.fn();
    let open: ((index: number) => void) | undefined;
    const Host = defineComponent({
      setup() {
        const controller = useOverlayUrlState({
          param: 'photo',
          adapter: state.adapter,
          ...urlIndexKey(() => sampleItems.length),
        });
        open = (index) => controller.set(index);
        return () =>
          h(LightboxUrlOverlay, {
            ref: lightbox,
            items: sampleItems,
            controller,
            onClose,
            onSlideChange,
          });
      },
    });
    // Opened from inside the app, so closing steps back through history; the
    // fake lands that step by dropping the parameter.
    const goBack = vi
      .spyOn(state.adapter, 'goBack')
      .mockImplementation(() => state.adapter.push('', null));
    mount(Host, { attachTo: document.body });

    // Closed: the slider methods are no-ops and goTo still resolves.
    lightbox.value!.next();
    lightbox.value!.prev();
    lightbox.value!.adjust();
    lightbox.value!.observe();
    lightbox.value!.unobserve();
    await expect(lightbox.value!.goTo(1)).resolves.toBeUndefined();

    open!(0);
    await nextTick();
    await nextTick();
    expect(document.querySelector('.rk-lightbox-overlay')).not.toBeNull();

    await lightbox.value!.goTo(1, false);
    expect(onSlideChange).toHaveBeenCalledWith(1);
    lightbox.value!.next();
    lightbox.value!.prev();
    lightbox.value!.unobserve();
    lightbox.value!.observe();
    lightbox.value!.adjust();

    lightbox.value!.close();
    await nextTick();
    await nextTick();

    expect(onClose).toHaveBeenCalledTimes(1);
    expect(goBack).toHaveBeenCalledTimes(1);
    expect(state.query()).not.toContain('photo');
    expect(document.querySelector('.rk-lightbox-overlay')).toBeNull();
  });
});
