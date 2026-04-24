import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { SwipeToClose } from '@reelkit/vue';
import { LightboxOverlay } from './LightboxOverlay';
import type { LightboxItem } from './types';

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
