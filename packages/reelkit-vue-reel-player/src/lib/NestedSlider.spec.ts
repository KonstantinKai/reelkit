import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, reactive, type VNode } from 'vue';
import { SoundProvider, type ReelExpose } from '@reelkit/vue';
import NestedSlider from './NestedSlider';
import { shared } from './VideoSlide';
import type {
  BaseContentItem,
  MediaItem,
  NavigationSlotScope,
  NestedSlideSlotScope,
} from './types';

const image = (id: string): MediaItem => ({
  id,
  type: 'image',
  src: `https://example.com/${id}.jpg`,
  aspectRatio: 9 / 16,
});

const video = (id: string): MediaItem => ({
  id,
  type: 'video',
  src: `https://example.com/${id}.mp4`,
  poster: `https://example.com/${id}-poster.jpg`,
  aspectRatio: 9 / 16,
});

type NestedProps = {
  media: MediaItem[];
  contentItem: BaseContentItem;
  isParentActive: boolean;
  size: [number, number];
  contentId: string;
  initialIndex?: number;
  enableWheel?: boolean;
  setInnerSlider: (api: ReelExpose | null) => void;
  onIndexChange?: (index: number) => void;
  onVideoRef?: (video: HTMLVideoElement | null) => void;
  onActiveMediaTypeChange?: (type: 'image' | 'video') => void;
  onReady?: () => void;
  onWaiting?: () => void;
  onError?: () => void;
  renderNavigation?: (scope: NavigationSlotScope) => VNode | VNode[] | null;
  renderNestedSlide?: (scope: NestedSlideSlotScope) => VNode | VNode[] | null;
};

const mountNested = (overrides: Partial<NestedProps> = {}) => {
  const media = overrides.media ?? [image('one'), image('two'), image('three')];
  let api: ReelExpose | null = null;
  const setInnerSlider = vi.fn((next: ReelExpose | null) => {
    api = next;
  });
  const props = reactive<NestedProps>({
    media,
    contentItem: { id: 'post', media },
    isParentActive: true,
    size: [360, 640],
    contentId: 'post',
    setInnerSlider,
    ...overrides,
  });
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(SoundProvider, null, {
          default: () => [h(NestedSlider, { ...props })],
        }),
    }),
    { attachTo: document.body },
  );
  return { wrapper, props, api: () => api!, setInnerSlider };
};

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
  (
    global as unknown as { ResizeObserver: typeof ResizeObserver }
  ).ResizeObserver = MockResizeObserver as unknown as typeof ResizeObserver;
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(
    () => undefined,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (shared.getVideo() as unknown as Record<string, unknown>)['paused'];
  document.body.innerHTML = '';
});

describe('NestedSlider', () => {
  it('hands its slider to the parent and takes it back on unmount', () => {
    const { wrapper, setInnerSlider } = mountNested();

    expect(setInnerSlider.mock.calls.at(0)?.[0]).not.toBeNull();

    wrapper.unmount();

    expect(setInnerSlider).toHaveBeenLastCalledWith(null);
  });

  it('shows indicator dots and only the next arrow on the first item', () => {
    const { wrapper } = mountNested();

    expect(wrapper.find('.rk-reel-nested-indicator').exists()).toBe(true);
    expect(wrapper.find('.rk-reel-nested-nav-prev').exists()).toBe(false);
    expect(wrapper.find('.rk-reel-nested-nav-next').exists()).toBe(true);
  });

  it('shows neither dots nor arrows for a single item', () => {
    const { wrapper } = mountNested({ media: [image('only')] });

    expect(wrapper.find('.rk-reel-nested-indicator').exists()).toBe(false);
    expect(wrapper.find('.rk-reel-nested-nav').exists()).toBe(false);
  });

  it('reports the active item when its post becomes active', async () => {
    const onIndexChange = vi.fn();
    const onActiveMediaTypeChange = vi.fn();
    const { props } = mountNested({
      isParentActive: false,
      onIndexChange,
      onActiveMediaTypeChange,
    });
    expect(onIndexChange).not.toHaveBeenCalled();

    props.isParentActive = true;
    await nextTick();

    expect(onIndexChange).toHaveBeenCalledWith(0);
    expect(onActiveMediaTypeChange).toHaveBeenCalledWith('image');
  });

  it('opens at the requested inner item', () => {
    const onIndexChange = vi.fn();
    const { wrapper } = mountNested({ initialIndex: 2, onIndexChange });

    expect(onIndexChange).toHaveBeenCalledWith(2);
    expect(wrapper.find('.rk-reel-nested-nav-next').exists()).toBe(false);
    expect(wrapper.find('.rk-reel-nested-nav-prev').exists()).toBe(true);
  });

  it('opens at the first item when the requested one does not exist', () => {
    const onIndexChange = vi.fn();
    mountNested({ initialIndex: 9, onIndexChange });

    expect(onIndexChange).toHaveBeenCalledWith(0);
  });

  it('moves to the next item from the next arrow and reports it', async () => {
    const onIndexChange = vi.fn();
    const onReady = vi.fn();
    const { wrapper } = mountNested({ onIndexChange, onReady });

    await wrapper.find('.rk-reel-nested-nav-next').trigger('click');

    await vi.waitFor(() => expect(onIndexChange).toHaveBeenLastCalledWith(1));
    // An image has nothing left to load once it is on screen.
    expect(onReady).toHaveBeenCalled();
    await nextTick();
    expect(wrapper.find('.rk-reel-nested-nav-prev').exists()).toBe(true);
  });

  it('moves back from the previous arrow', async () => {
    const onIndexChange = vi.fn();
    const { wrapper } = mountNested({ initialIndex: 1, onIndexChange });

    await wrapper.find('.rk-reel-nested-nav-prev').trigger('click');

    await vi.waitFor(() => expect(onIndexChange).toHaveBeenLastCalledWith(0));
  });

  it('pauses a playing video before leaving it', async () => {
    const onVideoRef = vi.fn();
    const onActiveMediaTypeChange = vi.fn();
    const { api } = mountNested({
      media: [video('clip'), image('after')],
      onVideoRef,
      onActiveMediaTypeChange,
    });
    expect(onVideoRef).toHaveBeenLastCalledWith(shared.getVideo());
    Object.defineProperty(shared.getVideo(), 'paused', {
      configurable: true,
      value: false,
    });

    await api().goTo(1, false);

    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalled();
    expect(onActiveMediaTypeChange).toHaveBeenLastCalledWith('image');
  });

  it('starts from the first item again when the media changes', async () => {
    const onIndexChange = vi.fn();
    const { api, props, wrapper } = mountNested({ onIndexChange });
    await api().goTo(2, false);
    await nextTick();
    expect(wrapper.find('.rk-reel-nested-nav-next').exists()).toBe(false);

    // Same length on purpose, so the slider has no reason of its own to move
    // and only the reset is under test.
    props.media = [
      image('fresh-one'),
      image('fresh-two'),
      image('fresh-three'),
    ];
    await nextTick();

    expect(wrapper.find('.rk-reel-nested-nav-prev').exists()).toBe(false);
    expect(wrapper.find('.rk-reel-nested-nav-next').exists()).toBe(true);

    // The slider itself went back to the first item, so next moves to the
    // second rather than doing nothing at the old last one.
    onIndexChange.mockClear();
    await wrapper.find('.rk-reel-nested-nav-next').trigger('click');
    await vi.waitFor(() => expect(onIndexChange).toHaveBeenLastCalledWith(1));
  });

  it('starts from the first item when the media shrinks under the current one', async () => {
    const onIndexChange = vi.fn();
    const { api, props, wrapper } = mountNested({ onIndexChange });
    await api().goTo(2, false);
    await nextTick();

    props.media = [image('short-one'), image('short-two')];
    await nextTick();

    expect(onIndexChange).toHaveBeenLastCalledWith(0);
    expect(wrapper.findAll('img')).toHaveLength(2);
    expect(wrapper.find('.rk-reel-nested-nav-prev').exists()).toBe(false);
    expect(wrapper.find('.rk-reel-nested-nav-next').exists()).toBe(true);
  });

  it('renders custom navigation that drives the slider', async () => {
    const scopes: NavigationSlotScope[] = [];
    const onIndexChange = vi.fn();
    const { wrapper } = mountNested({
      onIndexChange,
      renderNavigation: (scope) => {
        scopes.push(scope);
        return h('div', [
          h('button', { class: 'custom-prev', onClick: scope.onPrev }),
          h('button', { class: 'custom-next', onClick: scope.onNext }),
        ]);
      },
    });

    expect(wrapper.find('.rk-reel-nested-nav').exists()).toBe(false);
    expect(scopes.at(-1)).toMatchObject({ activeIndex: 0, count: 3 });

    await wrapper.find('.custom-next').trigger('click');
    await vi.waitFor(() => expect(onIndexChange).toHaveBeenLastCalledWith(1));

    await wrapper.find('.custom-prev').trigger('click');
    await vi.waitFor(() => expect(onIndexChange).toHaveBeenLastCalledWith(0));
  });

  it('renders a custom nested slide with the item it stands for', () => {
    const scopes: NestedSlideSlotScope[] = [];
    const { wrapper } = mountNested({
      onReady: () => undefined,
      renderNestedSlide: (scope) => {
        scopes.push(scope);
        return h('div', { class: 'custom-nested' }, scope.media.id);
      },
    });

    expect(wrapper.find('.custom-nested').exists()).toBe(true);
    const active = scopes.find((scope) => scope.index === 0);
    expect(active).toMatchObject({
      isActive: true,
      isInnerActive: true,
      slideKey: 'post:one',
    });
    expect(active?.onReady).toBeTypeOf('function');
    const inactive = scopes.find((scope) => scope.index === 1);
    expect(inactive?.onReady).toBeUndefined();
  });

  it('falls back to the default slide when the custom one renders nothing', () => {
    const { wrapper } = mountNested({ renderNestedSlide: () => null });

    expect(wrapper.find('img').exists()).toBe(true);
  });

  it('moves to the item whose indicator dot is clicked', async () => {
    const onIndexChange = vi.fn();
    const { wrapper } = mountNested({ onIndexChange });
    const dots = wrapper.findAll('.rk-reel-nested-indicator [role="tab"]');
    const target = dots.length ? dots[2] : null;
    expect(target).not.toBeNull();

    await target!.trigger('click');

    await vi.waitFor(() => expect(onIndexChange).toHaveBeenLastCalledWith(2));
  });
});
