import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref, type Component } from 'vue';
import {
  SwipeToClose,
  useOverlayUrlState,
  urlIndexKey,
  type UrlAdapter,
} from '@reelkit/vue';
import { LightboxOverlay, LightboxUrlOverlay } from './LightboxOverlay';
import type { LightboxItem } from './types';

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
