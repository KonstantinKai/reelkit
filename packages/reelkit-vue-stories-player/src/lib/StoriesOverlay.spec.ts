import {
  enableAutoUnmount,
  flushPromises,
  mount,
  type VueWrapper,
} from '@vue/test-utils';
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { h, nextTick, reactive, type VNode } from 'vue';
import {
  createUrlStateController,
  noop,
  slideTransition,
  urlIndexTwoAxisKey,
  type TwoAxisIdentity,
  type TwoAxisPosition,
} from '@reelkit/vue';
import {
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/stories-core';
import {
  createFakeStorageAdapter,
  createFakeUrlAdapter,
} from '@reelkit/core/testing';
import { StoriesOverlay, StoriesUrlOverlay } from './StoriesOverlay';
import type { SlideSlotScope, StoriesApi } from './types';

interface ReelRender {
  attrs: Record<string, unknown>;
  slots: Record<string, ((scope: unknown) => VNode[]) | undefined>;
  api: {
    goTo: ReturnType<typeof vi.fn>;
    adjust: ReturnType<typeof vi.fn>;
  };
}

// Every render of the mocked Reel, with the attributes it was given. The
// stories content around it stays real; the Reel draws a marker instead of its
// slides and exposes a controllable api.
const reels = vi.hoisted(() => ({ renders: [] as ReelRender[] }));

vi.mock('@reelkit/vue', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reelkit/vue')>();
  const { defineComponent, h: render } = await import('vue');
  return {
    ...actual,
    useBodyLock: vi.fn(),
    Reel: defineComponent({
      name: 'MockReel',
      inheritAttrs: false,
      setup(_, { attrs, slots, expose }) {
        const api = {
          next: vi.fn(),
          prev: vi.fn(),
          goTo: vi.fn().mockResolvedValue(undefined),
          adjust: vi.fn(),
          observe: vi.fn(),
          unobserve: vi.fn(),
        };
        expose(api);
        return () => {
          reels.renders.push({
            attrs: { ...attrs },
            slots: slots as ReelRender['slots'],
            api,
          });
          return render('div', { 'data-testid': 'mock-reel' });
        };
      },
    }),
  };
});

enableAutoUnmount(afterEach);

beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {
      /* noop */
    }
    unobserve() {
      /* noop */
    }
    disconnect() {
      /* noop */
    }
  } as unknown as typeof ResizeObserver;
});

const mockGroups: StoriesGroup[] = [
  {
    author: { id: '1', name: 'Alice', avatar: 'alice.jpg' },
    stories: [
      { id: 's1', mediaType: 'image', src: 'img1.jpg' },
      { id: 's2', mediaType: 'image', src: 'img2.jpg' },
    ],
  },
  {
    author: { id: '2', name: 'Bob', avatar: 'bob.jpg' },
    stories: [{ id: 's3', mediaType: 'image', src: 'img3.jpg' }],
  },
];

const threeGroups: StoriesGroup[] = [
  ...mockGroups,
  {
    author: { id: '3', name: 'Carol', avatar: 'carol.jpg' },
    stories: [
      { id: 's4', mediaType: 'image', src: 'img4.jpg' },
      { id: 's5', mediaType: 'image', src: 'img5.jpg' },
    ],
  },
];

const fourGroups: StoriesGroup[] = [
  ...threeGroups,
  {
    author: { id: '4', name: 'Dave', avatar: 'dave.jpg' },
    stories: [{ id: 's6', mediaType: 'image', src: 'img6.jpg' }],
  },
];

const setViewport = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', {
    configurable: true,
    value: width,
  });
  Object.defineProperty(window, 'innerHeight', {
    configurable: true,
    value: height,
  });
};

const original = { width: window.innerWidth, height: window.innerHeight };

// The outer group Reel is the only one that renders: the mock draws no slides,
// so the story Reels inside them never mount.
const outerReel = () => reels.renders[reels.renders.length - 1];

type Slots = Record<string, (scope: never) => VNode | VNode[] | null>;

const open = (props: Record<string, unknown> = {}, slots: Slots = {}) =>
  mount(StoriesOverlay, {
    props: { isOpen: true, groups: mockGroups, ...props },
    slots: slots as never,
    attachTo: document.body,
  });

const apiOf = (wrapper: VueWrapper) => wrapper.vm as unknown as StoriesApi;

const overlay = () =>
  document.querySelector('.rk-stories-overlay') as HTMLElement;

const pressEscape = () =>
  window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

beforeEach(() => {
  reels.renders = [];
  vi.stubGlobal('requestAnimationFrame', (cb: () => void) => setTimeout(cb, 0));
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
});

afterEach(() => {
  setViewport(original.width, original.height);
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('StoriesOverlay', () => {
  it('renders nothing when isOpen is false', () => {
    open({ isOpen: false });
    expect(overlay()).toBeNull();
  });

  it('teleports the overlay to the body when isOpen is true', () => {
    open();
    expect(overlay()?.parentElement).toBe(document.body);
  });

  it('creates a horizontal Reel with the cube transition by default', () => {
    open();
    expect(outerReel().attrs['transition']).toBeTypeOf('function');
    expect(outerReel().attrs['transition']).not.toBe(slideTransition);
    expect(outerReel().attrs['direction']).toBe('horizontal');
  });

  it('respects the groupTransition prop', () => {
    open({ groupTransition: slideTransition });
    expect(outerReel().attrs['transition']).toBe(slideTransition);
  });

  it('shows no error state while nothing failed', () => {
    open();
    expect(document.querySelector('.rk-stories-error')).toBeNull();
  });

  it('emits close and update:isOpen together, and never closes itself', async () => {
    const wrapper = open();
    pressEscape();
    await nextTick();
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(wrapper.emitted('update:isOpen')).toEqual([[false]]);
    expect(overlay()).not.toBeNull();

    await wrapper.setProps({ isOpen: false });
    expect(overlay()).toBeNull();
  });

  it('calls the listener given last, not one captured when it opened', async () => {
    const first = vi.fn();
    const second = vi.fn();
    const wrapper = open({ onStoryChange: first });
    await wrapper.setProps({ onStoryChange: second });

    apiOf(wrapper).nextStory();

    expect(second).toHaveBeenCalledWith(0, 1);
    expect(first).not.toHaveBeenCalled();
  });

  it('opens again with a working player after it was closed', async () => {
    const wrapper = open();
    await wrapper.setProps({ isOpen: false });
    await wrapper.setProps({ isOpen: true });

    apiOf(wrapper).nextStory();
    expect(wrapper.emitted('storyChange')).toContainEqual([0, 1]);
  });

  it('forwards the api through its template ref and apiReady', async () => {
    const wrapper = open();
    const ready = wrapper.emitted('apiReady')?.[0]?.[0] as StoriesApi;
    expect(ready.nextStory).toBeTypeOf('function');

    ready.nextStory();
    expect(wrapper.emitted('storyChange')).toContainEqual([0, 1]);

    // Closed, the forwarded calls do nothing rather than throw.
    await wrapper.setProps({ isOpen: false });
    expect(() => apiOf(wrapper).nextStory()).not.toThrow();
  });

  it('emits pause and resume from the header button', async () => {
    const wrapper = open();
    (document.querySelector('[aria-label="Pause"]') as HTMLElement).click();
    await nextTick();
    (document.querySelector('[aria-label="Play"]') as HTMLElement).click();
    expect(wrapper.emitted('pause')).toHaveLength(1);
    expect(wrapper.emitted('resume')).toHaveLength(1);
  });

  it('adds a heart and emits doubleTap on a double tap', async () => {
    const wrapper = open();
    (outerReel().attrs['onDoubleTap'] as () => void)();
    await nextTick();
    expect(document.querySelectorAll('.rk-stories-heart')).toHaveLength(1);
    expect(wrapper.emitted('doubleTap')).toEqual([[0, 0]]);

    document
      .querySelector('.rk-stories-heart')
      ?.dispatchEvent(new Event('animationend'));
    await nextTick();
    expect(document.querySelectorAll('.rk-stories-heart')).toHaveLength(0);
  });

  it('pauses and hides the interface while a long press lasts', async () => {
    const wrapper = open();
    (outerReel().attrs['onLongPress'] as () => void)();
    await nextTick();
    expect(document.querySelector('.rk-stories-ui-layer')?.classList).toContain(
      'rk-stories-ui-layer--hidden',
    );
    expect(wrapper.emitted('pause')).toHaveLength(1);

    (outerReel().attrs['onLongPressEnd'] as () => void)();
    await nextTick();
    expect(
      document.querySelector('.rk-stories-ui-layer')?.classList,
    ).not.toContain('rk-stories-ui-layer--hidden');
    expect(wrapper.emitted('resume')).toHaveLength(1);
  });

  it('keeps the interface on screen during a long press with the hide-on-pause prop off', async () => {
    open({ hideUiOnPause: false });
    (outerReel().attrs['onLongPress'] as () => void)();
    await nextTick();
    expect(
      document.querySelector('.rk-stories-ui-layer')?.classList,
    ).not.toContain('rk-stories-ui-layer--hidden');
  });

  // A template writes the hyphenated spelling, which Vue camelizes before it
  // looks the prop up: a name carrying two capitals in a row would come back
  // spelled differently and never reach the component, landing on the root
  // element as an attribute instead.
  it('reads the hide-on-pause prop written the way a template writes it', async () => {
    const wrapper = open({ 'hide-ui-on-pause': false });
    (outerReel().attrs['onLongPress'] as () => void)();
    await nextTick();
    expect(
      document.querySelector('.rk-stories-ui-layer')?.classList,
    ).not.toContain('rk-stories-ui-layer--hidden');
    expect(overlay().hasAttribute('hide-ui-on-pause')).toBe(false);
    wrapper.unmount();
  });

  it.each([
    [50, [0, 0]],
    [300, [0, 1]],
  ])('moves by the tap zone for a tap at x=%i', (x, expected) => {
    const wrapper = open({ initialStoryIndex: 0 });
    (outerReel().attrs['onTap'] as (event: unknown) => void)({
      localPosition: [x, 100],
    });
    if (expected[1] === 1) {
      expect(wrapper.emitted('storyChange')).toContainEqual(expected);
    } else {
      expect(wrapper.emitted('storyChange')).toBeUndefined();
    }
  });

  it('closes after the last story of the last group completes', () => {
    const wrapper = open({ initialGroupIndex: 1 });
    apiOf(wrapper).nextStory();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  describe('navigation slot', () => {
    it('renders the default arrows without it', () => {
      open();
      expect(document.querySelectorAll('.rk-stories-nav-btn')).toHaveLength(2);
    });

    it('replaces both arrows and hands over the navigation callbacks', () => {
      let scope: Record<string, unknown> = {};
      open(
        {},
        {
          navigation: (given: never) => {
            scope = given;
            return h('div', { 'data-testid': 'custom-nav' });
          },
        },
      );
      expect(document.querySelectorAll('.rk-stories-nav-btn')).toHaveLength(0);
      expect(
        document.querySelector('[data-testid="custom-nav"]'),
      ).not.toBeNull();
      for (const name of [
        'onPrevStory',
        'onNextStory',
        'onPrevGroup',
        'onNextGroup',
      ]) {
        expect(scope[name]).toBeTypeOf('function');
      }
    });

    it('falls back to the arrows when the slot renders nothing', () => {
      open({}, { navigation: () => [] });
      expect(document.querySelectorAll('.rk-stories-nav-btn')).toHaveLength(2);
    });

    it('moves a story on a click and a group on a long press', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
      const wrapper = open({ groups: threeGroups });
      const next = document.querySelector(
        '[aria-label="Next story"]',
      ) as HTMLElement;

      next.dispatchEvent(new Event('pointerdown'));
      next.dispatchEvent(new Event('pointerup'));
      expect(wrapper.emitted('storyChange')).toContainEqual([0, 1]);

      next.dispatchEvent(new Event('pointerdown'));
      vi.advanceTimersByTime(500);
      next.dispatchEvent(new Event('pointerup'));
      expect(wrapper.emitted('groupChange')).toEqual([[1]]);
      vi.useRealTimers();
    });
  });

  describe('progressBar slot', () => {
    it('renders the canvas progress bar without it', () => {
      open();
      expect(document.querySelector('canvas')).not.toBeNull();
    });

    it('replaces the progress bar and hands over signals and the group', () => {
      let scope: Record<string, unknown> = {};
      open(
        {},
        {
          progressBar: (given: never) => {
            scope = given;
            return h('div', { 'data-testid': 'custom-progress' });
          },
        },
      );
      expect(document.querySelector('canvas')).toBeNull();
      expect(
        document.querySelector('[data-testid="custom-progress"]'),
      ).not.toBeNull();
      expect(scope['totalStories']).toBe(2);
      expect(scope['activeIndex']).toBeDefined();
      expect(scope['progress']).toBeDefined();
      expect(scope['group']).toEqual(mockGroups[0]);
    });
  });

  describe('header slot', () => {
    it('replaces the default header and hands over the story state', () => {
      let scope: Record<string, unknown> = {};
      open(
        {},
        {
          header: (given: never) => {
            scope = given;
            return h('div', { 'data-testid': 'custom-header' });
          },
        },
      );
      expect(document.querySelector('.rk-stories-header')).toBeNull();
      expect(
        document.querySelector('[data-testid="custom-header"]'),
      ).not.toBeNull();
      expect(scope).toMatchObject({
        storyIndex: 0,
        isPaused: false,
        isMuted: true,
        isVideo: false,
      });
      expect(scope['author']).toEqual(mockGroups[0].author);
    });

    it('offers the sound toggle only for a video story', () => {
      open({
        groups: [
          {
            author: { id: 'v', name: 'Video', avatar: 'v.jpg' },
            stories: [{ id: 'v1', mediaType: 'video', src: 'v1.mp4' }],
          },
        ],
      });
      expect(document.querySelector('[aria-label="Unmute"]')).not.toBeNull();
    });
  });

  describe('footer slot', () => {
    it('draws the active group footer with the story shown', () => {
      let scope: Record<string, unknown> = {};
      open(
        {},
        {
          footer: (given: never) => {
            scope = given;
            return h('div', { 'data-testid': 'custom-footer' });
          },
        },
      );
      // The footer lives inside the group slide, which the mocked Reel does
      // not draw, so the group is built by hand.
      const [group] = outerReel().slots['item']!({
        index: 0,
        indexInRange: 0,
        size: [400, 700],
      });
      const footer = (group.children as VNode[])[1];
      expect(footer).toBeTruthy();
      const rendered = mount({ render: () => footer });
      expect(rendered.find('[data-testid="custom-footer"]').exists()).toBe(
        true,
      );
      expect(scope).toMatchObject({ storyIndex: 0, story: { id: 's1' } });
    });
  });

  // The mocked Reel draws no slides, so the group and its stories are built by
  // hand from the item slots the player hands the two sliders.
  describe('a story that will not load', () => {
    const failFirstStory = async () => {
      const failures: (() => void)[] = [];
      open(
        {},
        {
          slide: (scope: never) => {
            failures.push((scope as SlideSlotScope).onError);
            return h('div');
          },
        },
      );
      const [group] = outerReel().slots['item']!({
        index: 0,
        indexInRange: 0,
        size: [400, 700],
      });
      mount({ render: () => group }, { attachTo: document.body });
      const storyReel = reels.renders.at(-1)!;
      const stories = [0, 1].map(
        (index) =>
          storyReel.slots['item']!({
            index,
            indexInRange: index,
            size: [400, 700],
          })[0],
      );
      mount({ render: () => stories }, { attachTo: document.body });
      failures[0]();
      await nextTick();
    };

    // The player keeps one loading state, so an error panel drawn per story
    // would appear on every story slide at once.
    it('reports it once, on the story that failed', async () => {
      await failFirstStory();
      expect(document.querySelectorAll('.rk-stories-error')).toHaveLength(1);
    });

    it('says what went wrong, not only the icon', async () => {
      await failFirstStory();
      const error = document.querySelector('.rk-stories-error')!;

      expect(error.getAttribute('aria-label')).toBe('Content unavailable');
      expect(error.textContent).toContain('Content unavailable');
    });
  });

  describe('a11y', () => {
    it('is a labelled modal dialog', () => {
      open();
      expect(overlay().getAttribute('role')).toBe('dialog');
      expect(overlay().getAttribute('aria-modal')).toBe('true');
      expect(overlay().getAttribute('aria-label')).toBe('Stories player');
      expect(overlay().getAttribute('tabindex')).toBe('-1');
    });

    it('takes its label from ariaLabel', () => {
      open({ ariaLabel: 'Friend stories' });
      expect(overlay().getAttribute('aria-label')).toBe('Friend stories');
    });

    it('labels the arrows', () => {
      open();
      expect(
        document.querySelector('[aria-label="Previous story"]'),
      ).not.toBeNull();
      expect(
        document.querySelector('[aria-label="Next story"]'),
      ).not.toBeNull();
    });

    it('takes focus when it opens and gives it back when it closes', async () => {
      const trigger = document.createElement('button');
      document.body.appendChild(trigger);
      trigger.focus();

      const wrapper = open();
      await nextTick();
      expect(document.activeElement).toBe(overlay());

      await wrapper.setProps({ isOpen: false });
      expect(document.activeElement).toBe(trigger);
      trigger.remove();
    });
  });

  describe('enableKeyboard', () => {
    it('handles the arrow keys and Escape by default', () => {
      const wrapper = open();
      expect(outerReel().attrs['enableNavKeys']).toBe(true);
      pressEscape();
      expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('moves between stories, not groups, on the arrow keys', () => {
      const wrapper = open();
      (outerReel().attrs['onNavKeyPress'] as (increment: 1 | -1) => void)(1);
      expect(wrapper.emitted('storyChange')).toEqual([[0, 1]]);
      expect(wrapper.emitted('groupChange')).toBeUndefined();
    });

    it('leaves the arrow keys and Escape alone when turned off', () => {
      const wrapper = open({ enableKeyboard: false });
      expect(outerReel().attrs['enableNavKeys']).toBe(false);
      pressEscape();
      expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('follows the prop when it changes while open', async () => {
      const wrapper = open();
      await wrapper.setProps({ enableKeyboard: false });
      expect(outerReel().attrs['enableNavKeys']).toBe(false);
      pressEscape();
      expect(wrapper.emitted('close')).toBeUndefined();
    });
  });

  // A story change, a pause and a viewed store update happen every few
  // seconds. Each repaints only the parts that show it; the sliders, which are
  // the heavy part, must not render again.
  describe('rendering', () => {
    it('does not render the sliders again for a story change or a pause', async () => {
      const wrapper = open({ groups: threeGroups });
      await flushPromises();
      const renders = reels.renders.length;

      apiOf(wrapper).nextStory();
      await flushPromises();
      apiOf(wrapper).pause();
      await flushPromises();
      apiOf(wrapper).resume();
      await flushPromises();

      expect(reels.renders.length).toBe(renders);
    });

    it('does not render the sliders again when the url follows the story', async () => {
      const fake = createFakeUrlAdapter('?story=0.0');
      const controller = createUrlStateController<
        TwoAxisIdentity,
        TwoAxisPosition
      >({
        param: 'story',
        adapter: fake.adapter,
        ...urlIndexTwoAxisKey({
          outerCount: () => mockGroups.length,
          innerCounts: () => mockGroups.map((g) => g.stories.length),
        }),
      });
      controller.attach();
      const wrapper = mount(StoriesUrlOverlay, {
        props: { controller, groups: mockGroups },
        attachTo: document.body,
      });
      await flushPromises();
      const renders = reels.renders.length;

      apiOf(wrapper).nextStory();
      await flushPromises();

      expect(fake.adapter.read()).toBe('?story=0.1');
      expect(reels.renders.length).toBe(renders);
    });
  });
});

describe('StoriesOverlay remembering where a viewer got to', () => {
  it('reports the story it opened on as viewed', () => {
    const wrapper = open({ initialGroupIndex: 1 });
    expect(wrapper.emitted('storyViewed')).toEqual([[1, 0]]);
  });

  it('reports the opening story once, not again on the first navigation', () => {
    const wrapper = open();
    apiOf(wrapper).nextStory();
    expect(wrapper.emitted('storyViewed')).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });

  it('opens the group it was given on the resumed story', () => {
    const wrapper = open({ initialGroupIndex: 0, resumeStoryIndex: () => 1 });
    expect(wrapper.emitted('storyViewed')).toEqual([[0, 1]]);
  });

  // The timer is armed from the story the player actually opens on. Reading the
  // raw prop instead hands it nothing, which falls through to the no-media
  // branch and counts down over an image that has not loaded — so the header
  // spinner, which tracks that wait, is what tells the two apart.
  it('arms the timer against the resumed story, not an absent one', async () => {
    open({ initialGroupIndex: 0, resumeStoryIndex: () => 1 });
    await nextTick();
    expect(document.querySelector('.rk-stories-header-spinner')).not.toBeNull();
  });

  it('lets an explicit opening story beat the resume callback', () => {
    const wrapper = open({
      initialGroupIndex: 0,
      initialStoryIndex: 0,
      resumeStoryIndex: () => 1,
    });
    expect(wrapper.emitted('storyViewed')).toEqual([[0, 0]]);
  });

  it('opens an unvisited group where the resume callback points', () => {
    const wrapper = open({
      initialGroupIndex: 1,
      resumeStoryIndex: (groupIndex: number) => (groupIndex === 0 ? 1 : 0),
    });
    apiOf(wrapper).prevGroup();
    expect(wrapper.emitted('storyChange')).toContainEqual([0, 1]);
  });

  it('honours a resume callback swapped in after it opened', async () => {
    const wrapper = open({ initialGroupIndex: 1, resumeStoryIndex: () => 0 });
    await wrapper.setProps({ resumeStoryIndex: () => 1 });
    apiOf(wrapper).prevGroup();
    expect(wrapper.emitted('storyChange')).toContainEqual([0, 1]);
  });

  it('leaves every group on its first story when no resume is given', () => {
    const wrapper = open({ initialGroupIndex: 1 });
    apiOf(wrapper).prevGroup();
    expect(wrapper.emitted('storyChange')).toContainEqual([0, 0]);
  });
});

describe('StoriesUrlOverlay', () => {
  // mockGroups: group 0 has 2 stories, group 1 has 1 — counts [2, 1].
  const build = (initial = '', groups = mockGroups) => {
    const fake = createFakeUrlAdapter(initial);
    const controller = createUrlStateController<
      TwoAxisIdentity,
      TwoAxisPosition
    >({
      param: 'story',
      adapter: fake.adapter,
      ...urlIndexTwoAxisKey({
        outerCount: () => groups.length,
        innerCounts: () => groups.map((g) => g.stories.length),
      }),
    });
    controller.attach();
    return { fake, controller };
  };

  const openUrl = (
    controller: ReturnType<typeof build>['controller'],
    props: Record<string, unknown> = {},
  ) =>
    mount(StoriesUrlOverlay, {
      props: { controller, groups: mockGroups, ...props },
      attachTo: document.body,
    });

  const isOpen = () =>
    document.body.querySelector('[data-testid="mock-reel"]') !== null;

  it('renders nothing while the parameter is absent', () => {
    const { controller } = build('');
    openUrl(controller);
    expect(isOpen()).toBe(false);
  });

  it('opens seeded at the decoded group and story', () => {
    const { controller } = build('?story=1.0');
    const wrapper = openUrl(controller);
    expect(isOpen()).toBe(true);
    expect(outerReel().attrs['initialIndex']).toBe(1);
    expect(wrapper.emitted('storyViewed')).toEqual([[1, 0]]);
  });

  it('reflects navigation in the url without pushing a new entry', async () => {
    const { fake, controller } = build('');
    const wrapper = openUrl(controller);

    controller.set({ outer: 0, inner: 0 }); // open, the way a link does
    await nextTick();
    expect(isOpen()).toBe(true);
    expect(fake.counts.push).toBe(1);

    apiOf(wrapper).nextStory();
    expect(fake.adapter.read()).toBe('?story=0.1');
    // Opening pushed one entry; navigation only replaces it.
    expect(fake.counts.push).toBe(1);
  });

  it('closes by clearing the parameter on Escape', async () => {
    const { fake, controller } = build('?story=0.0');
    const wrapper = openUrl(controller);
    expect(isOpen()).toBe(true);

    pressEscape();
    await nextTick();

    expect(controller.position.value).toBeNull();
    expect(isOpen()).toBe(false);
    expect(fake.adapter.read()).not.toContain('story');
    expect(wrapper.emitted('close')).toHaveLength(1);
  });

  it('emits the consumer events alongside its own writes', () => {
    const { fake, controller } = build('?story=0.0');
    const wrapper = openUrl(controller);

    apiOf(wrapper).nextStory();
    expect(wrapper.emitted('storyChange')).toContainEqual([0, 1]);
    expect(fake.adapter.read()).toBe('?story=0.1');

    apiOf(wrapper).nextGroup();
    expect(wrapper.emitted('groupChange')).toEqual([[1]]);
  });

  it('opens where the link points, whatever a resume callback suggests', () => {
    const { controller } = build('?story=0.0');
    const wrapper = openUrl(controller, { resumeStoryIndex: () => 1 });
    expect(wrapper.emitted('storyViewed')).toEqual([[0, 0]]);
  });
});

// On a desktop screen the story fills the window height apart from a small
// margin, keeps its 9:16 shape, and only gives way to the width when the
// canvas and both arrows would not fit side by side. Phones, and a window
// exactly as wide as the CSS breakpoint, fill the whole screen.
describe('StoriesOverlay size', () => {
  const openAt = (width: number, height: number) => {
    setViewport(width, height);
    open();
    return outerReel().attrs['size'] as [number, number];
  };

  it.each([
    [1280, 720, 387, 688],
    [1440, 900, 488, 868],
    [1920, 1080, 589, 1048],
    [2560, 1440, 792, 1408],
  ])(
    'fills the height of a %ix%i desktop window at 9:16',
    (width, height, expectedWidth, expectedHeight) => {
      const [actualWidth, actualHeight] = openAt(width, height);
      expect(Math.abs(actualWidth - expectedWidth)).toBeLessThanOrEqual(1);
      expect(Math.abs(actualHeight - expectedHeight)).toBeLessThanOrEqual(1);
    },
  );

  it('narrows to the room beside the arrows in a tall, narrow window', () => {
    const [width, height] = openAt(800, 1400);
    expect(width).toBe(648);
    expect(height).toBeCloseTo(1152, 5);
  });

  it.each([
    [768, 1024],
    [390, 844],
  ])('fills a %ix%i mobile screen', (width, height) => {
    expect(openAt(width, height)).toEqual([width, height]);
  });

  it('follows the window when it is resized', async () => {
    openAt(1440, 900);
    setViewport(1440, 1100);
    window.dispatchEvent(new Event('resize'));
    await nextTick();
    const [width, height] = outerReel().attrs['size'] as [number, number];
    expect(height).toBe(1068);
    expect(width).toBeCloseTo(1068 * (9 / 16), 5);
    expect(outerReel().api.adjust).toHaveBeenCalled();
  });
});

// A feed that loads another page while the player is open.
describe('StoriesOverlay with a growing feed', () => {
  it('moves on to a group that arrived late instead of closing', async () => {
    const wrapper = open({ groups: threeGroups, initialGroupIndex: 2 });
    await wrapper.setProps({ groups: fourGroups });

    apiOf(wrapper).nextGroup();

    expect(wrapper.emitted('close')).toBeUndefined();
    expect(wrapper.emitted('groupChange')).toEqual([[3]]);
  });

  // Vue apps tend to push into the array they already passed rather than hand
  // over a new one; the new group has to be reachable either way.
  it('reaches a group pushed into the same array', async () => {
    const groups = reactive([...threeGroups]) as StoriesGroup[];
    const wrapper = open({ groups, initialGroupIndex: 2 });

    groups.push(fourGroups[3]);
    await nextTick();
    apiOf(wrapper).nextGroup();

    expect(wrapper.emitted('close')).toBeUndefined();
    expect(wrapper.emitted('groupChange')).toEqual([[3]]);
  });

  it('reaches a story pushed into a group it already has', async () => {
    const groups = reactive(
      mockGroups.map((group) => ({ ...group, stories: [...group.stories] })),
    ) as StoriesGroup[];
    const wrapper = open({ groups, initialGroupIndex: 1 });

    groups[1].stories.push({ id: 's3b', mediaType: 'image', src: 'b.jpg' });
    await nextTick();
    apiOf(wrapper).nextStory();

    expect(wrapper.emitted('close')).toBeUndefined();
    expect(wrapper.emitted('storyChange')).toEqual([[1, 1]]);
  });
});

// With the carousel layout a desktop screen shows neighbouring groups as cards
// beside the player and slides between groups; phones keep the plain player.
describe('StoriesOverlay desktop carousel', () => {
  const cards = () => document.querySelectorAll('.rk-stories-card');
  const cardLabels = () =>
    Array.from(cards()).map((card) =>
      card.querySelector('button')?.getAttribute('aria-label'),
    );
  const openCard = async (name: string) => {
    (
      document.querySelector(
        `[aria-label="Open stories by ${name}"]`,
      ) as HTMLElement
    ).click();
    await nextTick();
  };
  const finishSlide = async (name: string) => {
    const card = document
      .querySelector(`[aria-label="Open stories by ${name}"]`)!
      .closest('.rk-stories-card')!;
    const event = new Event('transitionend', { bubbles: true });
    Object.defineProperty(event, 'propertyName', { value: 'transform' });
    card.dispatchEvent(event);
    await nextTick();
  };
  const advance = async (ms: number) => {
    vi.advanceTimersByTime(ms);
    await nextTick();
  };
  const nextFrames = () => advance(20);

  const quickStory = (id: string, duration?: number) => ({
    id,
    mediaType: 'image' as const,
    src: '',
    duration,
  });
  const quickGroups = (carolDuration?: number): StoriesGroup[] => [
    threeGroups[0],
    {
      author: { id: '2', name: 'Bob', avatar: 'bob.jpg' },
      stories: [quickStory('quick-bob', 300)],
    },
    {
      author: { id: '3', name: 'Carol', avatar: 'carol.jpg' },
      stories: [quickStory('quick-carol', carolDuration)],
    },
  ];
  const pausePlayer = async () => {
    (document.querySelector('[aria-label="Pause"]') as HTMLElement).click();
    await nextTick();
  };
  // jsdom reports no transition duration, which leaves the limit at its margin.
  const endSlideOnTimeLimit = () => advance(800);

  const carousel = (props: Record<string, unknown> = {}, slots: Slots = {}) =>
    open({ groups: threeGroups, desktopLayout: 'carousel', ...props }, slots);

  beforeEach(() => {
    // Animation frames stay the stub, which runs on these fake timeouts; the
    // story timer measures elapsed time through `performance`.
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'],
    });
    setViewport(1440, 900);
  });

  afterEach(() => {
    Reflect.deleteProperty(window, 'matchMedia');
    vi.useRealTimers();
  });

  it('shows no cards with the default layout', () => {
    open({ groups: threeGroups });
    expect(cards()).toHaveLength(0);
    expect(outerReel().attrs['transition']).not.toBe(slideTransition);
  });

  it('shows the neighbouring groups beside the player on a desktop screen', () => {
    carousel({ initialGroupIndex: 1 });
    expect(cardLabels()).toEqual([
      'Open stories by Alice',
      'Open stories by Carol',
    ]);
    expect(overlay().classList).toContain('rk-stories-overlay--carousel');
    expect(outerReel().attrs['transition']).toBe(slideTransition);
  });

  it('keeps the plain player and its group transition on a phone', () => {
    setViewport(768, 1024);
    carousel();
    expect(cards()).toHaveLength(0);
    expect(outerReel().attrs['transition']).not.toBe(slideTransition);
    expect(overlay().classList).not.toContain('rk-stories-overlay--carousel');
  });

  it('switches layout when the window crosses the phone breakpoint', async () => {
    carousel();
    expect(cards().length).toBeGreaterThan(0);

    setViewport(600, 900);
    window.dispatchEvent(new Event('resize'));
    await nextTick();
    expect(cards()).toHaveLength(0);

    setViewport(1440, 900);
    window.dispatchEvent(new Event('resize'));
    await nextTick();
    expect(cards().length).toBeGreaterThan(0);
  });

  it('follows the layout prop when it changes', async () => {
    const wrapper = open({ groups: threeGroups });
    expect(cards()).toHaveLength(0);

    await wrapper.setProps({ desktopLayout: 'carousel' });
    expect(cards().length).toBeGreaterThan(0);
  });

  it('opens a clicked group once, on the story it resumes from', async () => {
    const wrapper = carousel({
      resumeStoryIndex: (groupIndex: number) => (groupIndex === 2 ? 1 : 0),
    });

    await openCard('Carol');

    expect(wrapper.emitted('groupChange')).toEqual([[2]]);
    expect(wrapper.emitted('storyChange')?.at(-1)).toEqual([2, 1]);
    // The player jumps straight to the group; the cards carry the motion.
    expect(outerReel().api.goTo).toHaveBeenCalledWith(2, false);
  });

  it('writes the clicked group to the url', async () => {
    const fake = createFakeUrlAdapter('?story=0.0');
    const controller = createUrlStateController<
      TwoAxisIdentity,
      TwoAxisPosition
    >({
      param: 'story',
      adapter: fake.adapter,
      ...urlIndexTwoAxisKey({
        outerCount: () => threeGroups.length,
        innerCounts: () => threeGroups.map((g) => g.stories.length),
      }),
    });
    controller.attach();
    mount(StoriesUrlOverlay, {
      props: { controller, groups: threeGroups, desktopLayout: 'carousel' },
      attachTo: document.body,
    });

    await openCard('Bob');
    expect(fake.adapter.read()).toBe('?story=1.0');
  });

  it('reports the opened story as viewed only once the slide ends', async () => {
    const wrapper = carousel();
    const viewedBefore = wrapper.emitted('storyViewed')?.length ?? 0;

    await openCard('Bob');
    await nextFrames();
    expect(overlay().classList).toContain('rk-stories-overlay--sliding');
    expect(wrapper.emitted('storyViewed')).toHaveLength(viewedBefore);

    await finishSlide('Bob');
    expect(wrapper.emitted('storyViewed')?.slice(viewedBefore)).toEqual([
      [1, 0],
    ]);
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
  });

  // Leaving from the second story changes the story index on the way to Bob's
  // first; leaving from the first changes only the group, which asks nothing of
  // the timer on its own.
  it.each([
    ['another story index', 1],
    ['the same story index', 0],
  ])('holds the story timer until the slide ends, from %s', async (_, from) => {
    const wrapper = carousel({
      groups: quickGroups(),
      initialStoryIndex: from,
    });

    // The story lasts 300ms, so without the slide holding the timer it would
    // be over by now.
    await openCard('Bob');
    await advance(600);
    expect(overlay().classList).toContain('rk-stories-overlay--sliding');
    expect(wrapper.emitted('storyComplete')).toBeUndefined();

    // No transition event arrives here, so the slide ends on its time limit.
    await advance(200);
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
    expect(wrapper.emitted('storyComplete')).toBeUndefined();
    await advance(400);
    expect(wrapper.emitted('storyComplete')).toContainEqual([1, 0]);
  });

  it('leaves the timer stopped after a slide into a story still loading', async () => {
    const wrapper = carousel({ initialStoryIndex: 1 });

    // Leaving a paused player asks the timer to resume during the slide, and
    // the new story then resets it; the reset has to win.
    await pausePlayer();
    await openCard('Bob');
    await endSlideOnTimeLimit();
    await advance(6000);
    expect(wrapper.emitted('storyComplete')).toBeUndefined();
  });

  it('drops a timer start asked for during the slide when the story then fails', async () => {
    let failStory = noop;
    const wrapper = carousel(
      { groups: quickGroups(), initialStoryIndex: 1 },
      {
        slide: (scope: never) => {
          failStory = (scope as SlideSlotScope).onError;
          return null;
        },
      },
    );

    await openCard('Bob');
    await nextFrames();
    // The mocked Reel draws no slides, so Bob's story is built by hand to get
    // hold of the callbacks the player gives it.
    const [group] = outerReel().slots['item']!({
      index: 1,
      indexInRange: 0,
      size: [400, 700],
    });
    const storyReel = (group.children as VNode[])[0];
    (
      storyReel.children as {
        item: (scope: unknown) => unknown;
      }
    ).item({ index: 0, indexInRange: 0, size: [400, 700] });
    failStory();

    await endSlideOnTimeLimit();
    await advance(1000);
    expect(wrapper.emitted('storyComplete')).toBeUndefined();
  });

  it('starts the timer for the group opened last when a slide is interrupted', async () => {
    const wrapper = carousel({
      groups: quickGroups(5000),
      initialStoryIndex: 1,
    });
    const viewedBefore = wrapper.emitted('storyViewed')?.length ?? 0;

    await openCard('Bob');
    await nextFrames();
    await openCard('Carol');
    await nextFrames();
    await finishSlide('Carol');

    expect(wrapper.emitted('storyViewed')?.slice(viewedBefore)).toEqual([
      [2, 0],
    ]);

    // Bob's 300ms start was asked for first and must not run on Carol's story.
    await advance(1000);
    expect(wrapper.emitted('storyComplete')).toBeUndefined();
    await advance(4500);
    expect(wrapper.emitted('storyComplete')).toEqual([[2, 0]]);
  });

  it.each([
    ['another story index', 1],
    ['the same story index', 0],
  ])('resumes a paused player on a card click, from %s', async (_, from) => {
    const wrapper = carousel({
      groups: quickGroups(),
      initialStoryIndex: from,
    });

    await pausePlayer();
    await openCard('Bob');
    await endSlideOnTimeLimit();
    expect(document.querySelector('[aria-label="Pause"]')).not.toBeNull();

    await advance(400);
    expect(wrapper.emitted('storyComplete')).toContainEqual([1, 0]);
  });

  it('resumes a paused player on a group change without the carousel too', async () => {
    const wrapper = open({ groups: quickGroups() });

    await pausePlayer();
    apiOf(wrapper).goToGroup(1);
    await nextTick();
    expect(document.querySelector('[aria-label="Pause"]')).not.toBeNull();

    await advance(400);
    expect(wrapper.emitted('storyComplete')).toContainEqual([1, 0]);
  });

  it('reports nothing for a story the player closed before showing', async () => {
    const wrapper = carousel({ groups: quickGroups() });
    const viewedBefore = wrapper.emitted('storyViewed')?.length ?? 0;

    await openCard('Bob');
    await nextFrames();
    await wrapper.setProps({ isOpen: false });
    await advance(2000);
    expect(wrapper.emitted('storyViewed')).toHaveLength(viewedBefore);
    expect(wrapper.emitted('storyComplete')).toBeUndefined();
  });

  it('does not render the sliders again during a slide', async () => {
    carousel();
    await flushPromises();
    const renders = reels.renders.length;

    await openCard('Bob');
    await nextFrames();
    await finishSlide('Bob');

    expect(reels.renders.length).toBe(renders);
  });

  // One controller does the whole viewed job for the player: card rings,
  // where a group opens, and recording what was shown.
  describe('given a viewed controller', () => {
    const viewedFor = (stored: string | null = null) => {
      const storage = createFakeStorageAdapter({ initial: stored });
      const viewed = createStoriesViewedStateController({
        storageKey: 'seen',
        storage: storage.adapter,
        groups: () => threeGroups,
      });
      return { storage, viewed };
    };
    const bobRing = () =>
      document.querySelector(
        '[aria-label="Open stories by Bob"] .rk-stories-ring',
      ) as HTMLElement;

    // A story is marked seen every few seconds. The cards follow the
    // controller's signal and repaint alone; the mocked Reel records each
    // time it renders, and must not.
    it('draws the card rings from it and repaints them without re-rendering the player', async () => {
      const { viewed } = viewedFor();
      carousel({ viewed });
      await flushPromises();
      expect(bobRing().classList).toContain('rk-stories-ring--active');
      const renders = reels.renders.length;

      // Bob has one story, so one seen is the whole group.
      viewed.markViewed(1, 0);
      await nextTick();

      expect(bobRing().classList).not.toContain('rk-stories-ring--active');
      expect(reels.renders.length).toBe(renders);
    });

    it('records every story shown and still tells the consumer', () => {
      const { viewed, storage } = viewedFor();
      const wrapper = open({ groups: threeGroups, viewed });

      expect(storage.stored).toBe('["1.s1"]');
      expect(wrapper.emitted('storyViewed')).toEqual([[0, 0]]);
    });

    it('opens a group where the controller says it was left', () => {
      const { viewed } = viewedFor('["1.s1"]');
      viewed.attach();
      const wrapper = open({ groups: threeGroups, viewed });
      expect(wrapper.emitted('storyViewed')).toEqual([[0, 1]]);
    });

    it('lets an explicit resumeStoryIndex win over the controller', () => {
      const { viewed } = viewedFor('["1.s1"]');
      viewed.attach();
      const wrapper = open({
        groups: threeGroups,
        viewed,
        resumeStoryIndex: () => 0,
      });
      expect(wrapper.emitted('storyViewed')).toEqual([[0, 0]]);
    });

    // The player chooses its opening story while it is set up, so the store
    // has to be read before that: by the overlay mounted while still closed.
    it('reads the store while still closed, so the first open resumes', async () => {
      const { viewed, storage } = viewedFor('["1.s1"]');
      const wrapper = open({ isOpen: false, groups: threeGroups, viewed });
      expect(storage.counts.read).toBeGreaterThan(0);

      await wrapper.setProps({ isOpen: true });
      expect(wrapper.emitted('storyViewed')).toEqual([[0, 1]]);
    });

    it('stops following the store when it unmounts', () => {
      const { viewed, storage } = viewedFor();
      const wrapper = open({ isOpen: false, groups: threeGroups, viewed });
      wrapper.unmount();

      storage.fireExternalChange('["2.s3"]');

      expect(viewed.viewedState.value.get('2')).toBeUndefined();
    });

    it('is read by the url overlay while its player is closed', () => {
      const { storage, viewed } = viewedFor('["1.s1"]');
      const fake = createFakeUrlAdapter('');
      const controller = createUrlStateController<
        TwoAxisIdentity,
        TwoAxisPosition
      >({
        param: 'story',
        adapter: fake.adapter,
        ...urlIndexTwoAxisKey({
          outerCount: () => threeGroups.length,
          innerCounts: () => threeGroups.map((g) => g.stories.length),
        }),
      });
      controller.attach();
      mount(StoriesUrlOverlay, {
        props: { controller, groups: threeGroups, viewed },
        attachTo: document.body,
      });

      expect(storage.counts.read).toBeGreaterThan(0);
      expect(viewed.viewedState.value.get('1')).toBe(1);
    });
  });

  it('opens a group that arrived after the player did, from its card', async () => {
    const wrapper = carousel({ initialGroupIndex: 2 });
    await wrapper.setProps({ groups: fourGroups });
    const viewedBefore = wrapper.emitted('storyViewed')?.length ?? 0;

    await openCard('Dave');
    await nextFrames();
    await finishSlide('Dave');

    expect(wrapper.emitted('groupChange')).toEqual([[3]]);
    expect(wrapper.emitted('storyViewed')?.slice(viewedBefore)).toEqual([
      [3, 0],
    ]);
  });

  // The story a late group opens on has no source, so its timer starts at
  // once. It can only do that when the player reads the groups it has now.
  it('times the story of a group that arrived late', async () => {
    const wrapper = open({ groups: threeGroups, initialGroupIndex: 2 });
    await wrapper.setProps({
      groups: [
        ...threeGroups,
        {
          author: { id: '4', name: 'Dave', avatar: 'dave.jpg' },
          stories: [quickStory('quick-dave', 300)],
        },
      ],
    });

    apiOf(wrapper).goToGroup(3);
    await advance(400);
    expect(wrapper.emitted('storyComplete')).toEqual([[3, 0]]);
  });

  // jsdom resolves no stylesheet, so the duration a theme would give the cards
  // is reported by hand. The time limit has to wait for it, not cut it short.
  it('lets a slide themed longer than a second run to its end', async () => {
    const computed = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation(
      (element, pseudo) => {
        const style = computed(element, pseudo);
        return (element as Element).classList?.contains('rk-stories-card')
          ? Object.assign(Object.create(style), {
              transitionDuration: '1.5s, 1.5s',
            })
          : style;
      },
    );
    carousel();

    await openCard('Bob');
    await advance(1400);
    expect(overlay().classList).toContain('rk-stories-overlay--sliding');

    // Still no transition event: the limit ends the slide once the themed
    // duration has passed.
    await advance(1500);
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
  });

  // The opened group's card leaves the page when the slide ends. Focus left on
  // it would fall to the document body, outside the dialog.
  it('keeps focus in the dialog after opening a group from a focused card', async () => {
    carousel();
    (
      document.querySelector(
        '[aria-label="Open stories by Bob"]',
      ) as HTMLElement
    ).focus();

    await openCard('Bob');
    await nextFrames();
    await finishSlide('Bob');
    expect(document.activeElement).toBe(overlay());
  });

  it('leaves focus alone after a slide when it was not on a card', async () => {
    carousel();
    const close = document.querySelector('[aria-label="Close"]') as HTMLElement;
    close.focus();

    await openCard('Bob');
    await nextFrames();
    await finishSlide('Bob');
    expect(document.activeElement).toBe(close);
  });

  it('does not count a window resize as a slide', async () => {
    carousel();

    setViewport(1920, 1080);
    window.dispatchEvent(new Event('resize'));
    await nextFrames();
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
  });

  // Deliberate: the carousel slide ignores prefers-reduced-motion. Do not
  // restore the check.
  it('slides even when the viewer prefers less motion', async () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
      }),
    });
    const wrapper = carousel();
    const viewedBefore = wrapper.emitted('storyViewed')?.length ?? 0;

    await openCard('Bob');
    await nextFrames();
    expect(overlay().classList).toContain('rk-stories-overlay--sliding');
    expect(wrapper.emitted('storyViewed')).toHaveLength(viewedBefore);
  });

  it('does not slide after a touch swipe has already moved the player', async () => {
    const wrapper = carousel();

    (outerReel().attrs['onAfterChange'] as (index: number) => void)(1);
    await nextFrames();
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
    expect(wrapper.emitted('storyViewed')).toContainEqual([1, 0]);
    expect(cardLabels()).toEqual([
      'Open stories by Alice',
      'Open stories by Carol',
    ]);
  });

  it('previews a custom story with no image through the slide slot, inactive', () => {
    const groups: StoriesGroup[] = [
      threeGroups[0],
      {
        author: { id: '2', name: 'Bob', avatar: 'bob.jpg' },
        stories: [{ id: 'tip', mediaType: 'image', src: '' }],
      },
    ];
    carousel(
      { groups },
      {
        slide: (scope: never) => {
          const { story, isActive, size } = scope as SlideSlotScope;
          return h('div', {
            'data-testid': `slide-${story.id}`,
            'data-active': String(isActive),
            'data-size': size.join('x'),
          });
        },
      },
    );
    const slide = document.querySelector(
      '.rk-stories-card [data-testid="slide-tip"]',
    ) as HTMLElement;
    expect(slide).not.toBeNull();
    expect(slide.dataset['active']).toBe('false');
    expect(slide.dataset['size']).toBe(
      (outerReel().attrs['size'] as number[]).join('x'),
    );
  });

  it('replaces the card content through the groupPreview slot', () => {
    carousel(
      {},
      {
        groupPreview: (scope: never) =>
          h(
            'span',
            { class: 'custom-card' },
            (scope as { group: StoriesGroup }).group.author.name,
          ),
      },
    );
    expect(
      Array.from(document.querySelectorAll('.custom-card')).map(
        (card) => card.textContent,
      ),
    ).toEqual(['Bob', 'Carol']);
    expect(document.querySelector('.rk-stories-card-button')).toBeNull();
  });

  it('puts the cards after the player controls in the tab order', () => {
    carousel();
    const isCard = Array.from(overlay().querySelectorAll('button')).map(
      (button) => button.classList.contains('rk-stories-card-button'),
    );
    expect(isCard).toContain(false);
    expect(isCard.indexOf(true)).toBe(isCard.lastIndexOf(false) + 1);
  });

  it('still closes on Escape', () => {
    const wrapper = carousel();
    pressEscape();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});

describe('StoriesOverlay with the progress bar and header in each group', () => {
  const story = (id: string) => ({
    id,
    mediaType: 'image' as const,
    src: '',
    duration: 4000,
  });
  const groups: StoriesGroup[] = [
    {
      author: { id: '1', name: 'Alice', avatar: 'alice.jpg' },
      stories: [story('a1'), story('a2')],
    },
    {
      author: { id: '2', name: 'Bob', avatar: 'bob.jpg' },
      stories: [story('b1'), story('b2')],
    },
    {
      author: { id: '3', name: 'Carol', avatar: 'carol.jpg' },
      stories: [story('c1')],
    },
  ];

  type Scope = Record<string, unknown> & {
    groupIndex: number;
    isActive: boolean;
    totalStories?: number;
    storyIndex?: number;
    isPaused?: boolean;
  };

  // A group slide built by hand renders its own story Reel, so the last Reel
  // rendered is not always the group one.
  const groupReel = () =>
    reels.renders.filter((render) => render.attrs['onAfterChange']).at(-1)!;

  // The mocked Reel draws no slides, so a group slide is built by hand from
  // the item slot the player hands it.
  const groupSlide = (groupIndex: number) => {
    const [group] = groupReel().slots['item']!({
      index: groupIndex,
      indexInRange: 0,
      size: [400, 700],
    });
    return mount({ render: () => group }, { attachTo: document.body })
      .element as HTMLElement;
  };

  const recorder = () => {
    const scopes: Scope[] = [];
    const latestFor = (groupIndex: number) =>
      scopes.filter((scope) => scope.groupIndex === groupIndex).at(-1)!;
    return { scopes, latestFor };
  };

  const recordingSlots = () => {
    const bars = recorder();
    const headers = recorder();
    const slots: Slots = {
      progressBar: (scope: never) => {
        bars.scopes.push(scope);
        return h('div', { class: 'custom-bar' });
      },
      header: (scope: never) => {
        headers.scopes.push(scope);
        return h('div', { class: 'custom-header' });
      },
    };
    return { bars, headers, slots };
  };

  const signalValue = (scope: Scope, key: string) =>
    (scope[key] as { value: number }).value;

  const advance = async (ms: number) => {
    vi.advanceTimersByTime(ms);
    await nextTick();
  };

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps one progress bar and header above the player by default', () => {
    open({ groups });

    expect(document.querySelectorAll('.rk-stories-ui-layer')).toHaveLength(1);
    const slide = groupSlide(0);
    expect(slide.querySelector('.rk-stories-ui-layer')).toBeNull();
    expect(slide.querySelector('.rk-stories-progress-bar')).toBeNull();
    expect(slide.querySelector('.rk-stories-header')).toBeNull();
  });

  it('tells slots above the player which group they draw, as active', () => {
    const { bars, headers, slots } = recordingSlots();
    open({ groups, initialGroupIndex: 1 }, slots);

    expect(bars.latestFor(1).isActive).toBe(true);
    expect(headers.latestFor(1).isActive).toBe(true);
  });

  it('draws a progress bar and header inside every group slide', () => {
    open({ groups, chromePlacement: 'group' });

    expect(document.querySelector('.rk-stories-ui-layer')).toBeNull();
    for (const [groupIndex, name] of [
      [0, 'Alice'],
      [1, 'Bob'],
    ] as const) {
      const slide = groupSlide(groupIndex);
      expect(slide.querySelectorAll('.rk-stories-progress-bar')).toHaveLength(
        1,
      );
      expect(slide.querySelectorAll('.rk-stories-header')).toHaveLength(1);
      expect(slide.querySelector('.rk-stories-header-name')?.textContent).toBe(
        name,
      );
    }
  });

  it('shows a neighbouring group where it will resume, with nothing played', () => {
    const { bars, headers, slots } = recordingSlots();
    open(
      {
        groups,
        chromePlacement: 'group',
        resumeStoryIndex: (groupIndex: number) => (groupIndex === 1 ? 1 : 0),
      },
      slots,
    );

    groupSlide(1);

    const bar = bars.latestFor(1);
    expect(bar.isActive).toBe(false);
    expect(bar.totalStories).toBe(2);
    expect(signalValue(bar, 'activeIndex')).toBe(1);
    expect(signalValue(bar, 'progress')).toBe(0);
    const header = headers.latestFor(1);
    expect(header).toMatchObject({
      isActive: false,
      storyIndex: 1,
      story: { id: 'b2' },
      isPaused: false,
    });
  });

  it('follows the running story in the active group', async () => {
    const { bars, headers, slots } = recordingSlots();
    const wrapper = open({ groups, chromePlacement: 'group' }, slots);
    groupSlide(0);

    await advance(1000);
    const bar = bars.latestFor(0);
    expect(bar.isActive).toBe(true);
    expect(signalValue(bar, 'progress')).toBeCloseTo(0.25, 1);

    apiOf(wrapper).nextStory();
    await nextTick();
    expect(signalValue(bar, 'activeIndex')).toBe(1);
    expect(headers.latestFor(0).storyIndex).toBe(1);

    apiOf(wrapper).pause();
    await nextTick();
    expect(headers.latestFor(0).isPaused).toBe(true);
  });

  it('hides the chrome of the active group during a long press', async () => {
    open({ groups, chromePlacement: 'group' });
    const slide = groupSlide(0);
    const layer = () => slide.querySelector('.rk-stories-ui-layer')!;

    (groupReel().attrs['onLongPress'] as () => void)();
    await nextTick();
    expect(layer().classList).toContain('rk-stories-ui-layer--hidden');

    (groupReel().attrs['onLongPressEnd'] as () => void)();
    await nextTick();
    expect(layer().classList).not.toContain('rk-stories-ui-layer--hidden');
  });

  it('hands the new group the running bar once the group changes', async () => {
    const { bars, slots } = recordingSlots();
    const wrapper = open({ groups, chromePlacement: 'group' }, slots);
    groupSlide(0);
    groupSlide(1);
    const running = bars.latestFor(0)['progress'];

    apiOf(wrapper).nextGroup();
    await nextTick();

    const incoming = bars.latestFor(1);
    expect(incoming.isActive).toBe(true);
    expect(incoming['progress']).toBe(running);
    expect(signalValue(incoming, 'progress')).toBe(0);
    const outgoing = bars.latestFor(0);
    expect(outgoing.isActive).toBe(false);
    expect(outgoing['progress']).not.toBe(running);
  });

  it('keeps the group being left as it was while the player turns away from it', async () => {
    const { bars, headers, slots } = recordingSlots();
    const wrapper = open({ groups, chromePlacement: 'group' }, slots);
    let finishTurn = noop;
    groupReel().api.goTo.mockImplementation(
      () => new Promise<void>((resolve) => (finishTurn = resolve)),
    );
    groupSlide(0);
    apiOf(wrapper).nextStory();
    await nextTick();
    await advance(1000);

    apiOf(wrapper).nextGroup();
    await nextTick();

    const turning = bars.latestFor(0);
    expect(turning.isActive).toBe(false);
    expect(signalValue(turning, 'activeIndex')).toBe(1);
    expect(signalValue(turning, 'progress')).toBeCloseTo(0.25, 1);
    expect(headers.latestFor(0).storyIndex).toBe(1);

    finishTurn();
    await flushPromises();

    const resting = bars.latestFor(0);
    expect(signalValue(resting, 'activeIndex')).toBe(1);
    expect(signalValue(resting, 'progress')).toBe(0);
  });

  it('shows a group that played to its end as complete while the player turns away', async () => {
    const { bars, slots } = recordingSlots();
    open({ groups, initialStoryIndex: 1, chromePlacement: 'group' }, slots);
    groupReel().api.goTo.mockImplementation(() => new Promise<void>(noop));
    groupSlide(0);

    await advance(4100);

    const done = bars.latestFor(0);
    expect(done.isActive).toBe(false);
    expect(signalValue(done, 'progress')).toBe(1);
  });

  // A tap on a button inside the swipe area never reaches the tap zones; the
  // gesture controller in the core package ignores interactive elements.
  it('closes and pauses from the default header inside a group slide', async () => {
    const wrapper = open({ groups, chromePlacement: 'group' });
    const slide = groupSlide(0);

    (slide.querySelector('[aria-label="Pause"]') as HTMLElement).click();
    await nextTick();
    expect(wrapper.emitted('pause')).toHaveLength(1);

    (slide.querySelector('[aria-label="Close"]') as HTMLElement).click();
    expect(wrapper.emitted('close')).toHaveLength(1);
  });
});

describe('StoriesOverlay story duration', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'],
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps a duration the story names over the one its video reports', () => {
    let reportDuration: ((ms: number) => void) | undefined;
    const wrapper = open(
      {
        groups: [
          {
            author: { id: '1', name: 'Alice', avatar: 'alice.jpg' },
            stories: [{ id: 'v', mediaType: 'video', src: '', duration: 3000 }],
          },
        ],
      },
      {
        slide: (scope: never) => {
          reportDuration = (scope as SlideSlotScope).onDurationReady;
          return h('div');
        },
      },
    );
    // The mocked Reel draws no slides, so the story is built by hand to get
    // hold of the callbacks the player gives it.
    const [group] = outerReel().slots['item']!({
      index: 0,
      indexInRange: 0,
      size: [400, 700],
    });
    const storyReel = (group.children as VNode[])[0];
    (storyReel.children as Record<string, (scope: unknown) => unknown>)['item'](
      { index: 0, size: [400, 700] },
    );

    reportDuration!(10_000);
    vi.advanceTimersByTime(3100);

    expect(wrapper.emitted('storyComplete')).toContainEqual([0, 0]);
  });
});
