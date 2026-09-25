import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref, nextTick, type Component } from 'vue';
import { ReelPlayerOverlay } from './ReelPlayerOverlay';
import { useTimelineState } from './useTimelineState';
import type { ContentItem } from './types';

// How many times the slider was asked to draw. The real Reel renders inside
// the counter, so every test in this file still exercises the real thing.
// It also keeps the vertical slider's latest props, so a test can play the
// part of a drag gesture, which jsdom has no touch input to produce.
const reel = vi.hoisted(() => ({
  renders: 0,
  verticalAttrs: {} as Record<string, unknown>,
}));

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
          if (attrs['direction'] === 'vertical') reel.verticalAttrs = attrs;
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

    // The viewport size lands one render after mount, so the dialog element
    // does not exist yet when the player mounts; focus has to follow it in.
    it('moves focus into the dialog when it opens', async () => {
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

      const overlay = document.querySelector('.rk-reel-overlay');
      expect(overlay).not.toBeNull();
      expect(overlay!.contains(document.activeElement)).toBe(true);
    });

    it('pulls focus back when it escapes the open dialog', async () => {
      const outside = document.createElement('button');
      document.body.appendChild(outside);
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

      outside.focus();

      const overlay = document.querySelector('.rk-reel-overlay');
      expect(document.activeElement).not.toBe(outside);
      expect(overlay!.contains(document.activeElement)).toBe(true);
    });

    it('hands focus back to the opener once it closes', async () => {
      const opener = document.createElement('button');
      document.body.appendChild(opener);
      opener.focus();
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
      await nextTick();
      expect(document.activeElement).not.toBe(opener);

      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await nextTick();
      await nextTick();

      expect(document.activeElement).toBe(opener);
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

describe('ReelPlayerOverlay behaviour', () => {
  let keySequence = 0;

  // The preloader is module-scoped, so every test that cares about load
  // state names sources nobody else has touched.
  const imageItem = (label: string, extra: Partial<ContentItem> = {}) => {
    const id = `${label}-${++keySequence}`;
    return {
      id,
      media: [
        {
          id: `${id}-media`,
          type: 'image' as const,
          src: `https://example.com/${id}.jpg`,
          aspectRatio: 9 / 16,
        },
      ],
      author: { name: label, avatar: `https://example.com/${id}-avatar.jpg` },
      likes: 1,
      description: label,
      ...extra,
    };
  };

  const videoItem = (label: string): ContentItem => {
    const id = `${label}-${++keySequence}`;
    return {
      id,
      media: [
        {
          id: `${id}-media`,
          type: 'video',
          src: `https://example.com/${id}.mp4`,
          poster: `https://example.com/${id}-poster.jpg`,
          aspectRatio: 9 / 16,
        },
      ],
      author: { name: label, avatar: `https://example.com/${id}-avatar.jpg` },
      likes: 1,
      description: label,
    };
  };

  const settle = async () => {
    await nextTick();
    await nextTick();
  };

  type OpenOptions = {
    content?: ContentItem[];
    props?: Record<string, unknown>;
    slots?: Record<string, (scope: never) => unknown>;
  };

  const openPlayer = async ({
    content = [imageItem('first'), imageItem('second')],
    props = {},
    slots,
  }: OpenOptions = {}) => {
    const onSlideChange = vi.fn();
    const onApiReady = vi.fn();
    const onClose = vi.fn();
    const Host = defineComponent({
      setup() {
        return () =>
          h(
            ReelPlayerOverlay,
            {
              isOpen: true,
              content,
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
    const api = () =>
      onApiReady.mock.calls.at(-1)?.[0] as {
        goTo: (index: number, animate?: boolean) => Promise<void>;
      };
    return { wrapper, api, onSlideChange, onClose, content };
  };

  beforeEach(() => {
    vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
    vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
      () => undefined,
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
    const video = document.querySelector('video');
    if (video) delete (video as unknown as Record<string, unknown>)['paused'];
  });

  describe('slide changes', () => {
    it('shows the error state straight away on returning to a failed slide', async () => {
      const { api } = await openPlayer();
      document.querySelector('img')?.dispatchEvent(new Event('error'));
      await settle();

      await api().goTo(1, false);
      await settle();
      expect(document.querySelector('.rk-reel-media-error')).toBeNull();

      await api().goTo(0, false);
      await settle();

      expect(document.querySelector('.rk-reel-media-error')).not.toBeNull();
    });

    it('skips the loader on returning to a slide that already loaded', async () => {
      const content = [imageItem('loaded'), imageItem('other')];
      const { api } = await openPlayer({ content });
      (
        document.querySelector(
          `img[src="${content[0].media[0].src}"]`,
        ) as HTMLImageElement
      ).dispatchEvent(new Event('load'));
      await settle();

      await api().goTo(1, false);
      await settle();
      expect(document.querySelector('.rk-reel-loader')).not.toBeNull();

      await api().goTo(0, false);
      await settle();

      expect(document.querySelector('.rk-reel-loader')).toBeNull();
    });

    it('pauses the playing video before moving off it and offers sound on a video slide', async () => {
      const { api } = await openPlayer({
        content: [videoItem('clip'), imageItem('after'), videoItem('next')],
      });
      const video = document.querySelector('video')!;
      Object.defineProperty(video, 'paused', {
        configurable: true,
        value: false,
      });

      await api().goTo(1, false);
      await settle();
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
      expect(document.querySelector('.rk-reel-sound-btn')).toBeNull();

      await api().goTo(2, false);
      await settle();
      expect(document.querySelector('.rk-reel-sound-btn')).not.toBeNull();
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
        const neighbour = videoItem('neighbour');
        await openPlayer({ content: [imageItem('here'), neighbour] });

        expect(created).toContain(neighbour.media[0].poster);
        expect(created).not.toContain(neighbour.media[0].src);
      } finally {
        vi.unstubAllGlobals();
      }
    });

    it('brings the loader back when the active slide starts buffering', async () => {
      await openPlayer({ content: [videoItem('buffer')] });
      const video = document.querySelector('video')!;
      video.dispatchEvent(new Event('playing'));
      await settle();
      expect(document.querySelector('.rk-reel-loader')).toBeNull();

      video.dispatchEvent(new Event('waiting'));
      await settle();

      expect(document.querySelector('.rk-reel-loader')).not.toBeNull();
    });
  });

  describe('dragging between slides', () => {
    const drag = (event: string) =>
      (reel.verticalAttrs[event] as (() => void) | undefined)?.();

    it('pauses the video while a drag is in progress and resumes it when the drag is cancelled', async () => {
      await openPlayer({ content: [videoItem('drag'), imageItem('below')] });
      const video = document.querySelector('video')!;
      Object.defineProperty(video, 'paused', {
        configurable: true,
        value: false,
      });
      vi.mocked(HTMLMediaElement.prototype.play).mockClear();

      drag('onSlideDragStart');
      expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);

      drag('onSlideDragEnd');
      drag('onSlideDragCanceled');
      expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    });

    it('does not resume a video that was already paused before the drag', async () => {
      await openPlayer({ content: [videoItem('still'), imageItem('below')] });
      const video = document.querySelector('video')!;
      Object.defineProperty(video, 'paused', {
        configurable: true,
        value: true,
      });
      vi.mocked(HTMLMediaElement.prototype.play).mockClear();

      drag('onSlideDragStart');
      drag('onSlideDragCanceled');

      expect(HTMLMediaElement.prototype.pause).not.toHaveBeenCalled();
      expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    });
  });

  describe('timeline', () => {
    let timeline: ReturnType<typeof useTimelineState> | null = null;
    const ControlsProbe = defineComponent({
      setup() {
        timeline = useTimelineState();
        return () => h('div');
      },
    });

    it('never renders the bar in never mode', async () => {
      await openPlayer({
        content: [videoItem('never')],
        props: { timeline: 'never' },
        slots: { controls: () => h(ControlsProbe) },
      });
      timeline!.duration.value = 120;
      await settle();

      expect(document.querySelector('.rk-reel-timeline')).toBeNull();
    });

    it('renders the bar for a short video in always mode', async () => {
      await openPlayer({
        content: [videoItem('short')],
        props: { timeline: 'always' },
        slots: { controls: () => h(ControlsProbe) },
      });
      timeline!.duration.value = 5;
      await settle();

      expect(document.querySelector('.rk-reel-timeline')).not.toBeNull();
    });

    it('leaves the bar out for an image slide in always mode', async () => {
      await openPlayer({ props: { timeline: 'always' } });

      expect(document.querySelector('.rk-reel-timeline')).toBeNull();
    });

    it('leaves a video shorter than the minimum without a bar', async () => {
      await openPlayer({
        content: [videoItem('clip')],
        props: { timelineMinDurationSeconds: 60 },
        slots: { controls: () => h(ControlsProbe) },
      });
      timeline!.duration.value = 45;
      await settle();

      expect(document.querySelector('.rk-reel-timeline')).toBeNull();
    });

    it('hands the timeline slot the default bar to reuse', async () => {
      const scopes: Array<{ activeIndex: number }> = [];
      await openPlayer({
        content: [videoItem('slot')],
        props: { timeline: 'always' },
        slots: {
          controls: () => h(ControlsProbe),
          timeline: ((scope: {
            activeIndex: number;
            defaultContent: () => unknown[];
          }) => {
            scopes.push(scope);
            return h('div', { class: 'custom-timeline' }, [
              ...(scope.defaultContent() as never[]),
            ]);
          }) as never,
        },
      });
      timeline!.duration.value = 90;
      await settle();

      const custom = document.querySelector('.custom-timeline');
      expect(custom).not.toBeNull();
      expect(custom!.querySelector('.rk-reel-timeline')).not.toBeNull();
      expect(scopes.at(-1)?.activeIndex).toBe(0);
    });
  });

  describe('slots', () => {
    it('renders the navigation slot in place of the arrows and lets it move the slider', async () => {
      const scopes: Array<{ activeIndex: number; count: number }> = [];
      const { onSlideChange } = await openPlayer({
        slots: {
          navigation: ((scope: {
            activeIndex: number;
            count: number;
            onNext: () => void;
            onPrev: () => void;
          }) => {
            scopes.push(scope);
            return h('div', [
              h('button', { class: 'custom-next', onClick: scope.onNext }),
              h('button', { class: 'custom-prev', onClick: scope.onPrev }),
            ]);
          }) as never,
        },
      });

      expect(document.querySelector('.rk-reel-nav-arrows')).toBeNull();
      expect(scopes.at(-1)).toMatchObject({ activeIndex: 0, count: 2 });

      (document.querySelector('.custom-next') as HTMLButtonElement).click();
      await vi.waitFor(() => expect(onSlideChange).toHaveBeenLastCalledWith(1));

      (document.querySelector('.custom-prev') as HTMLButtonElement).click();
      await vi.waitFor(() => expect(onSlideChange).toHaveBeenLastCalledWith(0));
    });

    it('renders the slide overlay slot in place of the author overlay', async () => {
      const scopes: Array<{ index: number; isActive: boolean }> = [];
      await openPlayer({
        slots: {
          slideOverlay: ((scope: { index: number; isActive: boolean }) => {
            scopes.push(scope);
            return h('div', { class: 'custom-overlay' });
          }) as never,
        },
      });

      expect(document.querySelector('.custom-overlay')).not.toBeNull();
      expect(document.querySelector('.rk-reel-slide-overlay')).toBeNull();
      expect(scopes.find((scope) => scope.index === 0)?.isActive).toBe(true);
    });

    it('renders the loading slot while the slide loads', async () => {
      const scopes: Array<{ activeIndex: number }> = [];
      await openPlayer({
        slots: {
          loading: ((scope: { activeIndex: number }) => {
            scopes.push(scope);
            return h('div', { class: 'custom-loading' });
          }) as never,
        },
      });

      expect(document.querySelector('.custom-loading')).not.toBeNull();
      expect(document.querySelector('.rk-reel-loader')).toBeNull();
      expect(scopes.at(-1)?.activeIndex).toBe(0);
    });

    it('renders the error slot once the slide fails', async () => {
      await openPlayer({
        slots: {
          error: (() => h('div', { class: 'custom-error' })) as never,
        },
      });

      document.querySelector('img')?.dispatchEvent(new Event('error'));
      await settle();

      expect(document.querySelector('.custom-error')).not.toBeNull();
      expect(document.querySelector('.rk-reel-media-error')).toBeNull();
    });
  });

  describe('slide overlay', () => {
    it('shortens large like counts', async () => {
      await openPlayer({
        content: [
          imageItem('thousands', { likes: 4500 }),
          imageItem('millions', { likes: 2_000_000 }),
        ],
      });

      const likes = Array.from(
        document.querySelectorAll('.rk-reel-slide-overlay-likes span'),
      ).map((span) => span.textContent);
      expect(likes).toContain('4.5K');
      expect(likes).toContain('2M');
    });

    it('draws no overlay for an item without author, description or likes', async () => {
      const bare = {
        id: `bare-${++keySequence}`,
        media: [
          {
            id: 'bare-media',
            type: 'image' as const,
            src: 'https://example.com/bare.jpg',
            aspectRatio: 9 / 16,
          },
        ],
      };
      await openPlayer({ content: [bare as unknown as ContentItem] });

      expect(document.querySelector('.rk-reel-slide-overlay')).toBeNull();
    });
  });

  describe('viewport size', () => {
    const slideSize = () => {
      const slide = document.querySelector(
        '.rk-reel-slide-wrapper',
      ) as HTMLElement;
      return [slide.style.width, slide.style.height];
    };

    it('fills the whole window on a narrow screen', async () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 900,
        configurable: true,
      });
      await openPlayer();

      expect(slideSize()).toEqual(['500px', '900px']);
    });

    it('keeps the aspect ratio inside a window too narrow for it', async () => {
      await openPlayer({ props: { aspectRatio: 2 } });

      expect(slideSize()).toEqual(['1024px', '512px']);
    });

    it('follows a window resize', async () => {
      await openPlayer();

      Object.defineProperty(window, 'innerWidth', {
        value: 600,
        configurable: true,
      });
      window.dispatchEvent(new Event('resize'));
      await settle();

      expect(slideSize()).toEqual(['600px', '768px']);
    });
  });

  it('exposes a template-ref api that is safe while closed and drives the slider when open', async () => {
    const player = ref<{
      next: () => void;
      prev: () => void;
      goTo: (index: number, animate?: boolean) => Promise<void>;
      adjust: () => void;
      observe: () => void;
      unobserve: () => void;
      close: () => void;
    } | null>(null);
    const isOpen = ref(false);
    const onSlideChange = vi.fn();
    const onClose = vi.fn();
    const content = [imageItem('one'), imageItem('two'), imageItem('three')];
    mount(
      defineComponent({
        setup: () => () =>
          h(ReelPlayerOverlay, {
            ref: player,
            isOpen: isOpen.value,
            content,
            onClose,
            onSlideChange,
          }),
      }),
      { attachTo: document.body },
    );

    player.value!.next();
    player.value!.prev();
    player.value!.adjust();
    player.value!.observe();
    player.value!.unobserve();
    await expect(player.value!.goTo(1)).resolves.toBeUndefined();
    expect(onSlideChange).not.toHaveBeenCalled();

    isOpen.value = true;
    await settle();

    await player.value!.goTo(2, false);
    expect(onSlideChange).toHaveBeenLastCalledWith(2);
    player.value!.prev();
    await vi.waitFor(() => expect(onSlideChange).toHaveBeenLastCalledWith(1));
    player.value!.next();
    await vi.waitFor(() => expect(onSlideChange).toHaveBeenLastCalledWith(2));
    player.value!.unobserve();
    player.value!.observe();
    player.value!.adjust();

    player.value!.close();
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
