import { mount } from '@vue/test-utils';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { defineComponent, h, ref, nextTick } from 'vue';
import { ReelPlayerOverlay } from './ReelPlayerOverlay';
import type { ContentItem } from './types';

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
      '.rk-player-close-btn',
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
      '.rk-player-nav-arrows button',
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
      '.rk-player-nav-arrows button',
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
});
