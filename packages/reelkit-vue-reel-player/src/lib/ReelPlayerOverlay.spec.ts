import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref, nextTick, type Component } from 'vue';
import { ReelPlayerOverlay } from './ReelPlayerOverlay';
import { useTimelineState } from './useTimelineState';
import type { ContentItem } from './types';

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

const sampleContent: ContentItem[] = [
  {
    id: 'a',
    media: [
      {
        id: 'a-1',
        type: 'image',
        src: 'https://example.com/a.jpg',
        aspectRatio: 9 / 16,
      },
    ],
    author: { name: 'A', avatar: 'https://example.com/avatar-a.jpg' },
    likes: 10,
    description: 'a',
  },
  {
    id: 'b',
    media: [
      {
        id: 'b-1',
        type: 'image',
        src: 'https://example.com/b.jpg',
        aspectRatio: 9 / 16,
      },
    ],
    author: { name: 'B', avatar: 'https://example.com/avatar-b.jpg' },
    likes: 20,
    description: 'b',
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

describe('ReelPlayerOverlay', () => {
  it('renders nothing when isOpen is false', () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: false,
            content: sampleContent,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    expect(document.querySelector('.rk-reel-overlay')).toBeNull();
  });

  it('renders teleported overlay when isOpen is true', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();
    expect(document.querySelector('.rk-reel-container')).not.toBeNull();
  });

  it('emits close on Escape key', async () => {
    const onClose = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            onClose,
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('emits close when CloseButton is clicked', async () => {
    const onClose = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            onClose,
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    const closeBtn = document.querySelector(
      '.rk-reel-close-btn',
    ) as HTMLButtonElement | null;
    expect(closeBtn).not.toBeNull();
    closeBtn?.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('teardown removes overlay from DOM when isOpen toggles to false', async () => {
    const isOpen = ref(true);
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: isOpen.value,
            content: sampleContent,
            onClose: () => {
              isOpen.value = false;
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();
    isOpen.value = false;
    await nextTick();
    expect(document.querySelector('.rk-reel-overlay')).toBeNull();
  });

  it('emits apiReady with imperative API and exposes the same shape', async () => {
    const onApiReady = vi.fn();
    const apiHolder = ref<unknown>(null);
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            ref: (el: unknown) => {
              apiHolder.value = el;
            },
            isOpen: true,
            content: sampleContent,
            onClose: () => {
              /* noop */
            },
            onApiReady,
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    await nextTick();
    expect(onApiReady).toHaveBeenCalledTimes(1);
    const api = onApiReady.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(typeof api['next']).toBe('function');
    expect(typeof api['prev']).toBe('function');
    expect(typeof api['goTo']).toBe('function');
    expect(typeof api['adjust']).toBe('function');
    expect(typeof api['observe']).toBe('function');
    expect(typeof api['unobserve']).toBe('function');
    expect(typeof api['close']).toBe('function');

    // Same surface area is exposed via template ref
    const exposed = apiHolder.value as Record<string, unknown> | null;
    expect(exposed).not.toBeNull();
    for (const key of [
      'next',
      'prev',
      'goTo',
      'adjust',
      'observe',
      'unobserve',
      'close',
    ]) {
      expect(typeof exposed?.[key]).toBe('function');
    }
  });

  it('emits slideChange when navigation moves the active slide', async () => {
    const onSlideChange = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            onClose: () => {
              /* noop */
            },
            onSlideChange,
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    await new Promise((r) => setTimeout(r, 600));
    expect(onSlideChange).toHaveBeenCalled();
    expect(onSlideChange.mock.calls[0]?.[0]).toBe(1);
  });

  it('default nav arrows: prev disabled at first slide, next enabled', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    const buttons = document.querySelectorAll(
      '.rk-reel-nav-arrows button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons.length).toBe(2);
    expect(buttons[0].hasAttribute('disabled')).toBe(true);
    expect(buttons[0].getAttribute('aria-disabled')).toBe('true');
    expect(buttons[1].hasAttribute('disabled')).toBe(false);
  });

  it('default nav arrows: both enabled when loop is true at first slide', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            loop: true,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    const buttons = document.querySelectorAll(
      '.rk-reel-nav-arrows button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(buttons[0].hasAttribute('disabled')).toBe(false);
    expect(buttons[1].hasAttribute('disabled')).toBe(false);
  });

  it('renders default loading + error indicators (no slot override)', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    expect(document.querySelector('.rk-reel-loader')).not.toBeNull();
  });

  it('custom slide slot receiving defaultContent renders without crash', async () => {
    let receivedDefault = false;
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            ReelPlayerOverlay,
            {
              isOpen: true,
              content: sampleContent,
              onClose: () => {
                /* noop */
              },
            },
            {
              slide: (scope: { defaultContent: () => unknown }) => {
                receivedDefault = typeof scope.defaultContent === 'function';
                return scope.defaultContent() as ReturnType<typeof h>;
              },
            },
          );
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    expect(receivedDefault).toBe(true);
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();
  });

  it('empty slot result falls back to default rendering', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            ReelPlayerOverlay,
            {
              isOpen: true,
              content: sampleContent,
              onClose: () => {
                /* noop */
              },
            },
            {
              // Slot returns no rendered nodes — parent should use default
              slide: () => null,
            },
          );
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    // Default rendering should produce the overlay container
    expect(document.querySelector('.rk-reel-overlay')).not.toBeNull();
  });

  it('emits update:isOpen on close (v-model:is-open support)', async () => {
    const onUpdateIsOpen = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            onClose: () => {
              /* noop */
            },
            'onUpdate:isOpen': onUpdateIsOpen,
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(onUpdateIsOpen).toHaveBeenCalledTimes(1);
    expect(onUpdateIsOpen.mock.calls[0]?.[0]).toBe(false);
  });

  it('locks body scroll while open', async () => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(ReelPlayerOverlay, {
            isOpen: true,
            content: sampleContent,
            onClose: () => {
              /* noop */
            },
          });
      },
    });

    mount(Host, { attachTo: document.body });
    await nextTick();
    // The shared sharedBodyLock singleton accumulates ref-counts across
    // tests in the same module, so we can only assert that lock fires —
    // not that unlock restores the body to a non-hidden state.
    expect(document.body.style.overflow).toBe('hidden');
  });

  describe('a11y', () => {
    it('overlay root is a labelled modal dialog', async () => {
      const Host = defineComponent({
        setup() {
          return () =>
            h(ReelPlayerOverlay, {
              isOpen: true,
              content: sampleContent,
              onClose: () => {
                /* noop */
              },
            });
        },
      });

      mount(Host, { attachTo: document.body });
      await nextTick();

      const overlay = document.querySelector('.rk-reel-overlay');
      expect(overlay).not.toBeNull();
      expect(overlay!.getAttribute('role')).toBe('dialog');
      expect(overlay!.getAttribute('aria-modal')).toBe('true');
      expect(overlay!.getAttribute('aria-label')).toBe('Video player');
    });

    it('ariaLabel prop overrides the default', async () => {
      const Host = defineComponent({
        setup() {
          return () =>
            h(ReelPlayerOverlay, {
              isOpen: true,
              content: sampleContent,
              ariaLabel: 'Featured reels',
              onClose: () => {
                /* noop */
              },
            });
        },
      });

      mount(Host, { attachTo: document.body });
      await nextTick();

      expect(
        document.querySelector('.rk-reel-overlay')!.getAttribute('aria-label'),
      ).toBe('Featured reels');
    });

    it('slide wrapper carries group role + slide position label', async () => {
      const Host = defineComponent({
        setup() {
          return () =>
            h(ReelPlayerOverlay, {
              isOpen: true,
              content: sampleContent,
              onClose: () => {
                /* noop */
              },
            });
        },
      });

      mount(Host, { attachTo: document.body });
      await nextTick();
      await nextTick();

      const wrapper = document.querySelector('.rk-reel-slide-wrapper');
      expect(wrapper).not.toBeNull();
      expect(wrapper!.getAttribute('role')).toBe('group');
      expect(wrapper!.getAttribute('aria-roledescription')).toBe('slide');
      expect(wrapper!.getAttribute('aria-label')).toBe(
        `Slide 1 of ${sampleContent.length}`,
      );
    });
  });
});

describe('ReelPlayerOverlay slider isolation', () => {
  // Grabs the timeline controller from inside the overlay, where the provider
  // that owns it lives. A slot has to return a component for the injection to
  // resolve: raw nodes are created in the test's scope, not the overlay's.
  let timeline: ReturnType<typeof useTimelineState> | null = null;

  const ControlsProbe = defineComponent({
    name: 'ControlsProbe',
    setup() {
      timeline = useTimelineState();
      return () => h('div');
    },
  });

  // The timeline reads the duration only once the active media is a video —
  // for an image it returns before the read, and nothing follows the signal.
  const videoContent: ContentItem[] = [
    {
      id: 'v',
      media: [
        {
          id: 'v-1',
          type: 'video',
          src: 'https://example.com/v.mp4',
          aspectRatio: 9 / 16,
        },
      ],
      author: { name: 'V', avatar: 'https://example.com/avatar-v.jpg' },
      likes: 1,
      description: 'v',
    },
  ];

  const openPlayer = (content: ContentItem[] = sampleContent) => {
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            ReelPlayerOverlay,
            {
              isOpen: true,
              content,
              onClose: () => {
                /* noop */
              },
            },
            { controls: () => h(ControlsProbe) },
          );
      },
    });

    return mount(Host, { attachTo: document.body });
  };

  const settle = async () => {
    await nextTick();
    await nextTick();
  };

  beforeEach(() => {
    timeline = null;
    reel.renders = 0;
    // jsdom leaves play() returning undefined, and the slide chains off it.
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  });

  it('leaves the slider alone when a slide reports it is ready', async () => {
    openPlayer();
    await settle();

    reel.renders = 0;
    document.querySelector('img')?.dispatchEvent(new Event('load'));
    await settle();

    expect(reel.renders).toBe(0);
  });

  it('leaves the slider alone when a slide reports an error', async () => {
    openPlayer();
    await settle();

    reel.renders = 0;
    document.querySelector('img')?.dispatchEvent(new Event('error'));
    await settle();

    expect(reel.renders).toBe(0);
  });

  it('leaves the slider alone when the timeline duration arrives', async () => {
    openPlayer(videoContent);
    await settle();

    reel.renders = 0;
    timeline!.duration.value = 42;
    await settle();

    expect(reel.renders).toBe(0);
  });

  // Drawing nothing again would also score zero, so each region has to be
  // shown following the signal it was handed.
  it('still clears the loader once a slide is ready', async () => {
    // Its own source: the preloader is module-scoped, so a source another
    // test already reported as loaded opens without a loader to clear.
    openPlayer([
      {
        ...sampleContent[0],
        media: [
          {
            id: 'fresh-1',
            type: 'image',
            src: 'https://example.com/fresh.jpg',
            aspectRatio: 9 / 16,
          },
        ],
      },
    ]);
    await settle();
    expect(document.querySelector('.rk-reel-loader')).not.toBeNull();

    document.querySelector('img')?.dispatchEvent(new Event('load'));
    await settle();

    expect(document.querySelector('.rk-reel-loader')).toBeNull();
  });

  it('still shows the timeline once the duration arrives', async () => {
    openPlayer(videoContent);
    await settle();
    expect(document.querySelector('.rk-reel-timeline')).toBeNull();

    timeline!.duration.value = 42;
    await settle();

    expect(document.querySelector('.rk-reel-timeline')).not.toBeNull();
  });
});
