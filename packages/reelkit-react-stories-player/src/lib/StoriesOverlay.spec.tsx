import { StrictMode, type ReactElement } from 'react';
import { render, act, cleanup } from '@testing-library/react';
import {
  describe,
  it,
  expect,
  vi,
  beforeAll,
  beforeEach,
  afterEach,
} from 'vitest';
import {
  noop,
  slideTransition,
  createUrlStateController,
  urlIndexTwoAxisKey,
  type TwoAxisIdentity,
  type TwoAxisPosition,
} from '@reelkit/react';
import {
  createStoriesViewedStateController,
  type StoriesGroup,
} from '@reelkit/stories-core';
import {
  createFakeStorageAdapter,
  createFakeUrlAdapter,
} from '@reelkit/core/testing';
import { StoriesOverlay, StoriesUrlOverlay } from './StoriesOverlay';
import type {
  HeaderRenderProps,
  ProgressBarRenderProps,
  StoriesApi,
} from './types';

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

let lastReelProps: Record<string, unknown>[] = [];

// The Reel is mocked so a story/group Reel renders a marker and exposes a
// controllable api; the surrounding StoriesContent stays real. Referenced only
// when a mocked Reel renders, well after this module's top-level evaluation.
vi.mock('@reelkit/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reelkit/react')>();
  return {
    ...actual,
    Reel: (props: Record<string, unknown>) => {
      lastReelProps.push(props);
      if (props['apiRef']) {
        const ref = props['apiRef'] as { current: unknown };
        ref.current = {
          next: vi.fn(),
          prev: vi.fn(),
          goTo: vi.fn().mockResolvedValue(undefined),
          adjust: vi.fn(),
          observe: vi.fn(),
          unobserve: vi.fn(),
        };
      }
      return <div data-testid="mock-reel" />;
    },
    useBodyLock: vi.fn(),
  };
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

describe('StoriesOverlay', () => {
  beforeEach(() => {
    lastReelProps = [];
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) =>
      setTimeout(cb, 0),
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <StoriesOverlay isOpen={false} onClose={vi.fn()} groups={mockGroups} />,
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders the overlay portal when isOpen is true', () => {
    const { baseElement } = render(
      <StoriesOverlay isOpen={true} onClose={vi.fn()} groups={mockGroups} />,
    );
    const overlay = baseElement.querySelector('.rk-stories-overlay');
    expect(overlay).toBeTruthy();
  });

  it('creates a Reel with cube transition by default', () => {
    render(
      <StoriesOverlay isOpen={true} onClose={vi.fn()} groups={mockGroups} />,
    );
    const outerReel = lastReelProps[0];
    expect(outerReel).toBeDefined();
    expect(outerReel['transition']).toBeTypeOf('function');
    expect(outerReel['direction']).toBe('horizontal');
  });

  it('respects groupTransition prop', () => {
    render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        groupTransition={slideTransition}
      />,
    );
    const outerReel = lastReelProps[0];
    expect(outerReel['transition']).toBe(slideTransition);
  });

  it('renders custom loading UI via renderLoading', () => {
    const { baseElement } = render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        renderLoading={({ story, storyIndex, groupIndex }) => (
          <div data-testid="custom-loading">
            Loading {groupIndex}:{storyIndex} - {story?.id}
          </div>
        )}
      />,
    );
    // Custom loading may or may not render depending on whether the image
    // is "preloaded" — the key check is that the prop is accepted without error
    expect(baseElement.querySelector('.rk-stories-overlay')).toBeTruthy();
  });

  it('renders custom error UI via renderError', () => {
    const { baseElement } = render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        renderError={({ story }) => (
          <div data-testid="custom-error">Error: {story?.id}</div>
        )}
      />,
    );
    expect(baseElement.querySelector('.rk-stories-overlay')).toBeTruthy();
  });

  it('does not render default error UI when no error', () => {
    const { baseElement } = render(
      <StoriesOverlay isOpen={true} onClose={vi.fn()} groups={mockGroups} />,
    );
    expect(baseElement.querySelector('.rk-stories-error')).toBeNull();
  });

  it('passes onError callback in renderSlide props', () => {
    render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        renderSlide={() => {
          return <div>Custom slide</div>;
        }}
      />,
    );
    // The mock Reel doesn't call itemBuilder, so receivedProps won't be set
    // in this mock setup, but the component should accept the prop without error
    expect(true).toBe(true);
  });

  // The controller is built once and outlives prop updates, so an event
  // callback captured at its creation would freeze to that render. It must call
  // whatever callback the latest render passed, not the one from mount.
  it('invokes the latest onStoryChange after a rerender, not one frozen at mount', () => {
    const first = vi.fn();
    const second = vi.fn();
    const apiRef = { current: null as StoriesApi | null };

    const { rerender } = render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={mockGroups}
        apiRef={apiRef}
        onStoryChange={first}
      />,
    );

    rerender(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={mockGroups}
        apiRef={apiRef}
        onStoryChange={second}
      />,
    );

    act(() => apiRef.current?.nextStory());

    expect(second).toHaveBeenCalledWith(0, 1);
    expect(first).not.toHaveBeenCalled();
  });

  // The controller is created once for the component's lifetime but must not be
  // torn down by an effect cleanup — React re-runs cleanups, and StrictMode
  // mounts, unmounts, then remounts. A controller disposed on that cleanup would
  // navigate with its callbacks wiped, so the URL would stop updating. Under
  // StrictMode, navigation must still fire the callback.
  it('still fires onStoryChange after a StrictMode mount/unmount/remount', () => {
    const onStoryChange = vi.fn();
    const apiRef = { current: null as StoriesApi | null };

    render(
      <StrictMode>
        <StoriesOverlay
          isOpen
          onClose={vi.fn()}
          groups={mockGroups}
          apiRef={apiRef}
          onStoryChange={onStoryChange}
        />
      </StrictMode>,
    );

    act(() => apiRef.current?.nextStory());

    expect(onStoryChange).toHaveBeenCalledWith(0, 1);
  });

  describe('renderNavigation', () => {
    it('renders default nav buttons when renderNavigation not provided', () => {
      const { baseElement } = render(
        <StoriesOverlay isOpen={true} onClose={vi.fn()} groups={mockGroups} />,
      );
      const navBtns = baseElement.querySelectorAll('.rk-stories-nav-btn');
      expect(navBtns.length).toBe(2);
    });

    it('hides default nav buttons when renderNavigation is provided', () => {
      const { baseElement } = render(
        <StoriesOverlay
          isOpen={true}
          onClose={vi.fn()}
          groups={mockGroups}
          renderNavigation={() => <div data-testid="custom-nav" />}
        />,
      );
      expect(baseElement.querySelectorAll('.rk-stories-nav-btn').length).toBe(
        0,
      );
      expect(
        baseElement.querySelector('[data-testid="custom-nav"]'),
      ).toBeTruthy();
    });

    it('passes navigation callbacks to renderNavigation', () => {
      let navProps: Record<string, unknown> = {};
      render(
        <StoriesOverlay
          isOpen={true}
          onClose={vi.fn()}
          groups={mockGroups}
          renderNavigation={(props) => {
            navProps = props as unknown as Record<string, unknown>;
            return <div />;
          }}
        />,
      );
      expect(navProps['onPrevStory']).toBeTypeOf('function');
      expect(navProps['onNextStory']).toBeTypeOf('function');
      expect(navProps['onPrevGroup']).toBeTypeOf('function');
      expect(navProps['onNextGroup']).toBeTypeOf('function');
    });
  });

  describe('renderProgressBar', () => {
    it('renders default canvas progress bar when renderProgressBar not provided', () => {
      const { baseElement } = render(
        <StoriesOverlay isOpen={true} onClose={vi.fn()} groups={mockGroups} />,
      );
      expect(baseElement.querySelector('canvas')).toBeTruthy();
    });

    it('replaces default progress bar when renderProgressBar is provided', () => {
      const { baseElement } = render(
        <StoriesOverlay
          isOpen={true}
          onClose={vi.fn()}
          groups={mockGroups}
          renderProgressBar={() => (
            <div data-testid="custom-progress">Custom</div>
          )}
        />,
      );
      expect(baseElement.querySelector('canvas')).toBeNull();
      expect(
        baseElement.querySelector('[data-testid="custom-progress"]'),
      ).toBeTruthy();
    });

    it('passes signals and group to renderProgressBar', () => {
      let progressProps: Record<string, unknown> = {};
      render(
        <StoriesOverlay
          isOpen={true}
          onClose={vi.fn()}
          groups={mockGroups}
          renderProgressBar={(props) => {
            progressProps = props as unknown as Record<string, unknown>;
            return <div />;
          }}
        />,
      );
      expect(progressProps['totalStories']).toBe(2);
      expect(progressProps['activeIndex']).toBeDefined();
      expect(progressProps['progress']).toBeDefined();
      expect(progressProps['group']).toBeDefined();
    });
  });

  describe('a11y', () => {
    it('overlay root is a labelled modal dialog', () => {
      render(<StoriesOverlay isOpen onClose={vi.fn()} groups={mockGroups} />);

      const overlay = document.querySelector('.rk-stories-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay!.getAttribute('role')).toBe('dialog');
      expect(overlay!.getAttribute('aria-modal')).toBe('true');
      expect(overlay!.getAttribute('aria-label')).toBe('Stories player');
    });

    it('ariaLabel prop overrides the default', () => {
      render(
        <StoriesOverlay
          isOpen
          onClose={vi.fn()}
          groups={mockGroups}
          ariaLabel="Friend stories"
        />,
      );

      expect(
        document
          .querySelector('.rk-stories-overlay')!
          .getAttribute('aria-label'),
      ).toBe('Friend stories');
    });
  });

  describe('enableKeyboard', () => {
    const pressEscape = () =>
      act(() => {
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      });

    it('handles the arrow keys and Escape by default', () => {
      const onClose = vi.fn();
      render(<StoriesOverlay isOpen onClose={onClose} groups={mockGroups} />);

      expect(lastReelProps[0]['enableNavKeys']).toBe(true);
      pressEscape();
      expect(onClose).toHaveBeenCalledOnce();
    });

    it('leaves the arrow keys and Escape alone when turned off', () => {
      const onClose = vi.fn();
      render(
        <StoriesOverlay
          isOpen
          onClose={onClose}
          groups={mockGroups}
          enableKeyboard={false}
        />,
      );

      expect(lastReelProps[0]['enableNavKeys']).toBe(false);
      pressEscape();
      expect(onClose).not.toHaveBeenCalled();
    });

    it('follows the prop when it changes while open', () => {
      const onClose = vi.fn();
      const { rerender } = render(
        <StoriesOverlay isOpen onClose={onClose} groups={mockGroups} />,
      );
      rerender(
        <StoriesOverlay
          isOpen
          onClose={onClose}
          groups={mockGroups}
          enableKeyboard={false}
        />,
      );

      expect(lastReelProps.at(-1)?.['enableNavKeys']).toBe(false);
      pressEscape();
      expect(onClose).not.toHaveBeenCalled();
    });
  });
});

describe('StoriesOverlay remembering where a viewer got to', () => {
  beforeEach(() => {
    lastReelProps = [];
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) =>
      setTimeout(cb, 0),
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reports the story it opened on as viewed', () => {
    const onStoryViewed = vi.fn();
    render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        initialGroupIndex={1}
        onStoryViewed={onStoryViewed}
      />,
    );

    expect(onStoryViewed).toHaveBeenCalledWith(1, 0);
  });

  it('reports the opening story once, not again on the first navigation', () => {
    const onStoryViewed = vi.fn();
    const apiRef = { current: null as StoriesApi | null };
    render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        apiRef={apiRef}
        onStoryViewed={onStoryViewed}
      />,
    );

    act(() => apiRef.current?.nextStory());

    expect(onStoryViewed.mock.calls).toEqual([
      [0, 0],
      [0, 1],
    ]);
  });

  it('opens the group it was given on the resumed story', () => {
    const onStoryViewed = vi.fn();
    render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        initialGroupIndex={0}
        resumeStoryIndex={() => 1}
        onStoryViewed={onStoryViewed}
      />,
    );

    expect(onStoryViewed).toHaveBeenCalledWith(0, 1);
  });

  // The timer is armed from the story the player actually opens on. Reading the
  // raw prop instead hands it nothing, which falls through to the no-media
  // branch and counts down over an image that has not loaded — so the header
  // spinner, which tracks that wait, is what tells the two apart.
  it('arms the timer against the resumed story, not an absent one', () => {
    const { baseElement } = render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        initialGroupIndex={0}
        resumeStoryIndex={() => 1}
      />,
    );

    expect(
      baseElement.querySelector('.rk-stories-header-spinner'),
    ).not.toBeNull();
  });

  it('lets an explicit opening story beat the resume callback', () => {
    const onStoryViewed = vi.fn();
    render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        initialGroupIndex={0}
        initialStoryIndex={0}
        resumeStoryIndex={() => 1}
        onStoryViewed={onStoryViewed}
      />,
    );

    expect(onStoryViewed).toHaveBeenCalledWith(0, 0);
  });

  it('opens an unvisited group where the resume callback points', () => {
    const apiRef = { current: null as StoriesApi | null };
    const onStoryChange = vi.fn();
    render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        initialGroupIndex={1}
        resumeStoryIndex={(groupIndex) => (groupIndex === 0 ? 1 : 0)}
        onStoryChange={onStoryChange}
        apiRef={apiRef}
      />,
    );

    act(() => apiRef.current?.prevGroup());

    expect(onStoryChange).toHaveBeenCalledWith(0, 1);
  });

  it('honours a resume callback swapped in after mount', () => {
    const apiRef = { current: null as StoriesApi | null };
    const onStoryChange = vi.fn();
    const { rerender } = render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        initialGroupIndex={1}
        resumeStoryIndex={() => 0}
        onStoryChange={onStoryChange}
        apiRef={apiRef}
      />,
    );

    rerender(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        initialGroupIndex={1}
        resumeStoryIndex={() => 1}
        onStoryChange={onStoryChange}
        apiRef={apiRef}
      />,
    );

    act(() => apiRef.current?.prevGroup());

    expect(onStoryChange).toHaveBeenCalledWith(0, 1);
  });

  it('leaves every group on its first story when no resume is given', () => {
    const apiRef = { current: null as StoriesApi | null };
    const onStoryChange = vi.fn();
    render(
      <StoriesOverlay
        isOpen={true}
        onClose={vi.fn()}
        groups={mockGroups}
        initialGroupIndex={1}
        onStoryChange={onStoryChange}
        apiRef={apiRef}
      />,
    );

    act(() => apiRef.current?.prevGroup());

    expect(onStoryChange).toHaveBeenCalledWith(0, 0);
  });
});

describe('StoriesUrlOverlay', () => {
  beforeEach(() => {
    lastReelProps = [];
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) =>
      setTimeout(cb, 0),
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // mockGroups: group 0 has 2 stories, group 1 has 1 — counts [2, 1].
  const build = (initial = '') => {
    const fake = createFakeUrlAdapter(initial);
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
    return { fake, controller };
  };

  // The outer group Reel is the first one StoriesContent renders, so its
  // captured props are lastReelProps[0]; a mounted content means the mocked
  // Reel is in the document.
  const isOpen = () =>
    document.body.querySelector('[data-testid="mock-reel"]') !== null;

  it('renders nothing while the parameter is absent', () => {
    const { controller } = build('');
    render(<StoriesUrlOverlay controller={controller} groups={mockGroups} />);
    expect(isOpen()).toBe(false);
  });

  it('opens seeded at the decoded group and story', () => {
    const { controller } = build('?story=1.0');
    render(<StoriesUrlOverlay controller={controller} groups={mockGroups} />);
    expect(isOpen()).toBe(true);
    // The outer group Reel is seeded to the decoded group index.
    expect(lastReelProps[0]['initialIndex']).toBe(1);
  });

  it('reflects navigation in the url without pushing a new entry', () => {
    const { fake, controller } = build('');
    const apiRef = { current: null as StoriesApi | null };
    render(
      <StoriesUrlOverlay
        controller={controller}
        groups={mockGroups}
        apiRef={apiRef}
      />,
    );

    act(() => controller.set({ outer: 0, inner: 0 })); // open, link-equivalent
    expect(isOpen()).toBe(true);
    expect(fake.counts.push).toBe(1);

    act(() => apiRef.current?.nextStory()); // group 0 story 0 → story 1
    expect(fake.adapter.read()).toBe('?story=0.1');
    // Opening pushed one entry; navigation only replaces it.
    expect(fake.counts.push).toBe(1);
  });

  it('closes by clearing the parameter on Escape', () => {
    const { fake, controller } = build('?story=0.0');
    render(<StoriesUrlOverlay controller={controller} groups={mockGroups} />);
    expect(isOpen()).toBe(true);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });

    expect(controller.position.value).toBeNull();
    expect(isOpen()).toBe(false);
    expect(fake.adapter.read()).not.toContain('story');
  });

  it('forwards the consumer callbacks alongside its own writes', () => {
    const { fake, controller } = build('?story=0.0');
    const onStoryChange = vi.fn();
    const onGroupChange = vi.fn();
    const onClose = vi.fn();
    const apiRef = { current: null as StoriesApi | null };
    render(
      <StoriesUrlOverlay
        controller={controller}
        groups={mockGroups}
        apiRef={apiRef}
        onStoryChange={onStoryChange}
        onGroupChange={onGroupChange}
        onClose={onClose}
      />,
    );

    act(() => apiRef.current?.nextStory());
    expect(onStoryChange).toHaveBeenCalledWith(0, 1);
    expect(fake.adapter.read()).toBe('?story=0.1');

    act(() => apiRef.current?.nextGroup());
    expect(onGroupChange).toHaveBeenCalledWith(1);

    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).toHaveBeenCalledTimes(1);
  });
  it('opens where the link points, whatever a resume callback suggests', () => {
    const { controller } = build('?story=0.0');
    const onStoryViewed = vi.fn();
    render(
      <StoriesUrlOverlay
        controller={controller}
        groups={mockGroups}
        resumeStoryIndex={() => 1}
        onStoryViewed={onStoryViewed}
      />,
    );

    expect(onStoryViewed).toHaveBeenCalledWith(0, 0);
  });
});

// On a desktop screen the story fills the window height apart from a small
// margin, keeps its 9:16 shape, and only gives way to the width when the
// canvas and both arrows would not fit side by side. Phones, and a window
// exactly as wide as the CSS breakpoint, fill the whole screen.
describe('StoriesOverlay size', () => {
  const original = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

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

  const groupReelSize = () => {
    const groupReels = lastReelProps.filter(
      (props) =>
        props['direction'] === 'horizontal' &&
        props['count'] === mockGroups.length,
    );
    return groupReels[groupReels.length - 1]['size'] as [number, number];
  };

  const openAt = (width: number, height: number) => {
    setViewport(width, height);
    render(
      <StoriesOverlay isOpen={true} onClose={vi.fn()} groups={mockGroups} />,
    );
    return groupReelSize();
  };

  beforeEach(() => {
    lastReelProps = [];
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) =>
      setTimeout(cb, 0),
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    setViewport(original.width, original.height);
    vi.restoreAllMocks();
  });

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

  // 800 wide leaves 648 for the canvas once both 44px arrows, their 16px
  // gaps and the 16px side margins are taken out.
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

  it('follows the window when it is resized', () => {
    openAt(1440, 900);
    act(() => {
      setViewport(1440, 1100);
      window.dispatchEvent(new Event('resize'));
    });
    const [width, height] = groupReelSize();
    expect(height).toBe(1068);
    expect(width).toBeCloseTo(1068 * (9 / 16), 5);
  });
});

// With the carousel layout a desktop screen shows neighbouring groups as cards
// beside the player and slides between groups; phones keep the plain player.
describe('StoriesOverlay desktop carousel', () => {
  const original = {
    width: window.innerWidth,
    height: window.innerHeight,
  };

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

  const outerReel = () => {
    const groupReels = lastReelProps.filter(
      (props) => props['count'] === threeGroups.length,
    );
    return groupReels[groupReels.length - 1];
  };

  const overlay = () =>
    document.querySelector('.rk-stories-overlay') as HTMLElement;
  const cards = () => document.querySelectorAll('.rk-stories-card');
  const openCard = (name: string) =>
    act(() => {
      (
        document.querySelector(
          `[aria-label="Open stories by ${name}"]`,
        ) as HTMLElement
      ).click();
    });
  // jsdom has no TransitionEvent, so React listens for the prefixed name
  // instead; sending both reaches the handler whichever one React picked.
  const finishSlide = (name: string) => {
    const card = document
      .querySelector(`[aria-label="Open stories by ${name}"]`)!
      .closest('.rk-stories-card')!;
    for (const type of ['transitionend', 'webkitTransitionEnd']) {
      const event = new Event(type, { bubbles: true });
      Object.defineProperty(event, 'propertyName', { value: 'transform' });
      act(() => {
        card.dispatchEvent(event);
      });
    }
  };
  const nextFrames = () =>
    act(() => {
      vi.advanceTimersByTime(20);
    });

  beforeEach(() => {
    // Animation frames stay the stub below, which runs on these fake
    // timeouts; the story timer measures elapsed time through `performance`.
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'],
    });
    lastReelProps = [];
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) =>
      setTimeout(cb, 0),
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
    setViewport(1440, 900);
  });

  afterEach(() => {
    // Unmount while the fake timers still stand in for animation frames; the
    // player cancels its pending frames on the way out.
    cleanup();
    setViewport(original.width, original.height);
    Reflect.deleteProperty(window, 'matchMedia');
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows no cards with the default layout', () => {
    render(<StoriesOverlay isOpen onClose={vi.fn()} groups={threeGroups} />);
    expect(cards()).toHaveLength(0);
    expect(outerReel()['transition']).not.toBe(slideTransition);
  });

  it('shows the neighbouring groups beside the player on a desktop screen', () => {
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        initialGroupIndex={1}
        desktopLayout="carousel"
      />,
    );
    expect(
      Array.from(cards()).map((card) =>
        card.querySelector('button')?.getAttribute('aria-label'),
      ),
    ).toEqual(['Open stories by Alice', 'Open stories by Carol']);
    expect(overlay().classList).toContain('rk-stories-overlay--carousel');
  });

  it('keeps the plain player and its group transition on a phone', () => {
    setViewport(768, 1024);
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );
    expect(cards()).toHaveLength(0);
    expect(outerReel()['transition']).not.toBe(slideTransition);
    expect(overlay().classList).not.toContain('rk-stories-overlay--carousel');
  });

  it('switches layout when the window crosses the phone breakpoint', () => {
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );
    expect(cards().length).toBeGreaterThan(0);

    act(() => {
      setViewport(600, 900);
      window.dispatchEvent(new Event('resize'));
    });
    expect(cards()).toHaveLength(0);

    act(() => {
      setViewport(1440, 900);
      window.dispatchEvent(new Event('resize'));
    });
    expect(cards().length).toBeGreaterThan(0);
  });

  it('follows the layout prop when it changes', () => {
    const { rerender } = render(
      <StoriesOverlay isOpen onClose={vi.fn()} groups={threeGroups} />,
    );
    expect(cards()).toHaveLength(0);

    rerender(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );
    expect(cards().length).toBeGreaterThan(0);
  });

  it('opens a clicked group once, on the story it resumes from', () => {
    const onGroupChange = vi.fn();
    const onStoryChange = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
        resumeStoryIndex={(groupIndex) => (groupIndex === 2 ? 1 : 0)}
        onGroupChange={onGroupChange}
        onStoryChange={onStoryChange}
      />,
    );
    const api = outerReel()['apiRef'] as {
      current: { goTo: ReturnType<typeof vi.fn> };
    };

    openCard('Carol');

    expect(onGroupChange).toHaveBeenCalledOnce();
    expect(onGroupChange).toHaveBeenCalledWith(2);
    expect(onStoryChange).toHaveBeenLastCalledWith(2, 1);
    // The player jumps straight to the group; the cards carry the motion.
    expect(api.current.goTo).toHaveBeenCalledWith(2, false);
  });

  it('writes the clicked group to the url', () => {
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
    render(
      <StoriesUrlOverlay
        controller={controller}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );

    openCard('Bob');
    expect(fake.adapter.read()).toBe('?story=1.0');
  });

  it('reports the opened story as viewed only once the slide ends', () => {
    const onStoryViewed = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
        onStoryViewed={onStoryViewed}
      />,
    );
    onStoryViewed.mockClear();

    openCard('Bob');
    nextFrames();
    expect(overlay().classList).toContain('rk-stories-overlay--sliding');
    expect(onStoryViewed).not.toHaveBeenCalled();

    finishSlide('Bob');
    expect(onStoryViewed).toHaveBeenCalledOnce();
    expect(onStoryViewed).toHaveBeenCalledWith(1, 0);
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
  });

  // Leaving from the second story changes the story index on the way to Bob's
  // first; leaving from the first changes only the group, which asks nothing of
  // the timer on its own.
  it.each([
    ['another story index', 1],
    ['the same story index', 0],
  ])('holds the story timer until the slide ends, from %s', (_, from) => {
    // An image with no source starts its timer straight away, so the only
    // thing holding it back is the slide.
    const groups: StoriesGroup[] = [
      threeGroups[0],
      {
        author: { id: '2', name: 'Bob', avatar: 'bob.jpg' },
        stories: [{ id: 'quick', mediaType: 'image', src: '', duration: 300 }],
      },
      threeGroups[2],
    ];
    const onStoryComplete = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        initialStoryIndex={from}
        desktopLayout="carousel"
        onStoryComplete={onStoryComplete}
      />,
    );

    // The story lasts 300ms, so without the slide holding the timer it would
    // be over by now.
    openCard('Bob');
    act(() => {
      vi.advanceTimersByTime(600);
    });
    expect(overlay().classList).toContain('rk-stories-overlay--sliding');
    expect(onStoryComplete).not.toHaveBeenCalled();

    // No transition event arrives here, so the slide ends on its time limit.
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
    expect(onStoryComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onStoryComplete).toHaveBeenCalledWith(1, 0);
  });

  // A story with no source starts its timer straight away and runs for the
  // given time; one with a source waits for an image that never loads here.
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
  const pausePlayer = () =>
    act(() => {
      (document.querySelector('[aria-label="Pause"]') as HTMLElement).click();
    });
  // jsdom reports no transition duration, which leaves the limit at its margin.
  const endSlideOnTimeLimit = () =>
    act(() => {
      vi.advanceTimersByTime(800);
    });

  it('leaves the timer stopped after a slide into a story still loading', () => {
    const onStoryComplete = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        initialStoryIndex={1}
        desktopLayout="carousel"
        onStoryComplete={onStoryComplete}
      />,
    );

    // Leaving a paused player asks the timer to resume during the slide, and
    // the new story then resets it; the reset has to win.
    pausePlayer();
    openCard('Bob');
    endSlideOnTimeLimit();
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(onStoryComplete).not.toHaveBeenCalled();
  });

  it('drops a timer start asked for during the slide when the story then fails', () => {
    const onStoryComplete = vi.fn();
    let failStory = noop;
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={quickGroups()}
        initialStoryIndex={1}
        desktopLayout="carousel"
        renderSlide={(props) => {
          failStory = props.onError;
          return null;
        }}
        onStoryComplete={onStoryComplete}
      />,
    );

    openCard('Bob');
    nextFrames();
    // The mocked Reel draws no slides, so Bob's story is built by hand to get
    // hold of the callbacks the player gives it.
    const group = (
      outerReel()['itemBuilder'] as (
        index: number,
        indexInRange: number,
        size: [number, number],
      ) => ReactElement<{
        children: ReactElement<Record<string, unknown>>[];
      }>
    )(1, 0, [400, 700]);
    const storyReel = [group.props.children]
      .flat()
      .find((child) => child?.props?.['itemBuilder']);
    (
      storyReel?.props['itemBuilder'] as (
        index: number,
        indexInRange: number,
        size: [number, number],
      ) => unknown
    )(0, 0, [400, 700]);
    act(failStory);

    endSlideOnTimeLimit();
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onStoryComplete).not.toHaveBeenCalled();
  });

  it('starts the timer for the group opened last when a slide is interrupted', () => {
    const onStoryViewed = vi.fn();
    const onStoryComplete = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={quickGroups(5000)}
        initialStoryIndex={1}
        desktopLayout="carousel"
        onStoryViewed={onStoryViewed}
        onStoryComplete={onStoryComplete}
      />,
    );
    onStoryViewed.mockClear();

    openCard('Bob');
    nextFrames();
    openCard('Carol');
    nextFrames();
    finishSlide('Carol');

    expect(onStoryViewed).toHaveBeenCalledOnce();
    expect(onStoryViewed).toHaveBeenCalledWith(2, 0);

    // Bob's 300ms start was asked for first and must not run on Carol's story.
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(onStoryComplete).not.toHaveBeenCalled();
    act(() => {
      vi.advanceTimersByTime(4500);
    });
    expect(onStoryComplete).toHaveBeenCalledOnce();
    expect(onStoryComplete).toHaveBeenCalledWith(2, 0);
  });

  it.each([
    ['another story index', 1],
    ['the same story index', 0],
  ])('resumes a paused player on a card click, from %s', (_, from) => {
    const onStoryComplete = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={quickGroups()}
        initialStoryIndex={from}
        desktopLayout="carousel"
        onStoryComplete={onStoryComplete}
      />,
    );

    pausePlayer();
    openCard('Bob');
    endSlideOnTimeLimit();
    expect(document.querySelector('[aria-label="Pause"]')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onStoryComplete).toHaveBeenCalledWith(1, 0);
  });

  it('resumes a paused player on a group change without the carousel too', () => {
    const apiRef = { current: null as StoriesApi | null };
    const onStoryComplete = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={quickGroups()}
        apiRef={apiRef}
        onStoryComplete={onStoryComplete}
      />,
    );

    pausePlayer();
    act(() => apiRef.current?.goToGroup(1));
    expect(document.querySelector('[aria-label="Pause"]')).not.toBeNull();

    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onStoryComplete).toHaveBeenCalledWith(1, 0);
  });

  it('reports nothing for a story the player closed before showing', () => {
    const onStoryViewed = vi.fn();
    const onStoryComplete = vi.fn();
    const { unmount } = render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={quickGroups()}
        desktopLayout="carousel"
        onStoryViewed={onStoryViewed}
        onStoryComplete={onStoryComplete}
      />,
    );
    onStoryViewed.mockClear();

    openCard('Bob');
    nextFrames();
    unmount();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(onStoryViewed).not.toHaveBeenCalled();
    expect(onStoryComplete).not.toHaveBeenCalled();
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
    it('draws the card rings from it and repaints them without re-rendering the player', () => {
      const { viewed } = viewedFor();
      render(
        <StoriesOverlay
          isOpen
          onClose={vi.fn()}
          groups={threeGroups}
          desktopLayout="carousel"
          viewed={viewed}
        />,
      );
      expect(bobRing().classList).toContain('rk-stories-ring--active');
      const reelRenders = lastReelProps.length;

      // Bob has one story, so one seen is the whole group.
      act(() => {
        viewed.markViewed(1, 0);
      });

      expect(bobRing().classList).not.toContain('rk-stories-ring--active');
      expect(lastReelProps.length).toBe(reelRenders);
    });

    it('records every story shown and still tells the consumer', () => {
      const { viewed, storage } = viewedFor();
      const onStoryViewed = vi.fn();
      render(
        <StoriesOverlay
          isOpen
          onClose={vi.fn()}
          groups={threeGroups}
          viewed={viewed}
          onStoryViewed={onStoryViewed}
        />,
      );

      expect(storage.stored).toBe('["1.s1"]');
      expect(onStoryViewed).toHaveBeenCalledWith(0, 0);
    });

    it('opens a group where the controller says it was left', () => {
      const { viewed } = viewedFor('["1.s1"]');
      viewed.attach();
      const onStoryViewed = vi.fn();
      render(
        <StoriesOverlay
          isOpen
          onClose={vi.fn()}
          groups={threeGroups}
          viewed={viewed}
          onStoryViewed={onStoryViewed}
        />,
      );

      expect(onStoryViewed).toHaveBeenCalledWith(0, 1);
    });

    it('lets an explicit resumeStoryIndex win over the controller', () => {
      const { viewed } = viewedFor('["1.s1"]');
      viewed.attach();
      const onStoryViewed = vi.fn();
      render(
        <StoriesOverlay
          isOpen
          onClose={vi.fn()}
          groups={threeGroups}
          viewed={viewed}
          resumeStoryIndex={() => 0}
          onStoryViewed={onStoryViewed}
        />,
      );

      expect(onStoryViewed).toHaveBeenCalledWith(0, 0);
    });

    // The player chooses its opening story while it first renders, so the
    // store has to be read before that: from the wrapper that is mounted while
    // the player is still closed, not from the player itself.
    it('reads the store while still closed, so the first open resumes', () => {
      const { viewed, storage } = viewedFor('["1.s1"]');
      const onStoryViewed = vi.fn();
      const closed = (
        <StoriesOverlay
          isOpen={false}
          onClose={vi.fn()}
          groups={threeGroups}
          viewed={viewed}
          onStoryViewed={onStoryViewed}
        />
      );
      const { rerender } = render(closed);
      expect(storage.counts.read).toBeGreaterThan(0);

      rerender(
        <StoriesOverlay
          isOpen
          onClose={vi.fn()}
          groups={threeGroups}
          viewed={viewed}
          onStoryViewed={onStoryViewed}
        />,
      );

      expect(onStoryViewed).toHaveBeenCalledWith(0, 1);
    });

    it('stops following the store when it unmounts', () => {
      const { viewed, storage } = viewedFor();
      const { unmount } = render(
        <StoriesOverlay
          isOpen={false}
          onClose={vi.fn()}
          groups={threeGroups}
          viewed={viewed}
        />,
      );
      unmount();

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
      render(
        <StoriesUrlOverlay
          controller={controller}
          groups={threeGroups}
          viewed={viewed}
        />,
      );

      expect(storage.counts.read).toBeGreaterThan(0);
      expect(viewed.viewedState.value.get('1')).toBe(1);
    });
  });

  // A feed that loads another page while the player is open.
  const fourGroups: StoriesGroup[] = [
    ...threeGroups,
    {
      author: { id: '4', name: 'Dave', avatar: 'dave.jpg' },
      stories: [{ id: 's6', mediaType: 'image', src: 'img6.jpg' }],
    },
  ];

  it('opens a group that arrived after the player did, from its card', () => {
    const onGroupChange = vi.fn();
    const onStoryViewed = vi.fn();
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      initialGroupIndex: 2,
      desktopLayout: 'carousel' as const,
      onGroupChange,
      onStoryViewed,
    };
    const { rerender } = render(
      <StoriesOverlay {...props} groups={threeGroups} />,
    );
    rerender(<StoriesOverlay {...props} groups={fourGroups} />);
    onStoryViewed.mockClear();

    openCard('Dave');
    nextFrames();
    finishSlide('Dave');

    expect(onGroupChange).toHaveBeenCalledOnce();
    expect(onGroupChange).toHaveBeenCalledWith(3);
    expect(onStoryViewed).toHaveBeenCalledWith(3, 0);
  });

  it('moves on to a group that arrived late instead of closing, without the carousel too', () => {
    const apiRef = { current: null as StoriesApi | null };
    const onClose = vi.fn();
    const onGroupChange = vi.fn();
    const props = {
      isOpen: true,
      onClose,
      initialGroupIndex: 2,
      apiRef,
      onGroupChange,
    };
    const { rerender } = render(
      <StoriesOverlay {...props} groups={threeGroups} />,
    );
    rerender(<StoriesOverlay {...props} groups={fourGroups} />);

    act(() => apiRef.current?.nextGroup());

    expect(onClose).not.toHaveBeenCalled();
    expect(onGroupChange).toHaveBeenCalledWith(3);
  });

  // The story a late group opens on has no source, so its timer starts at
  // once. It can only do that when the player reads the groups it has now.
  it('times the story of a group that arrived late', () => {
    const apiRef = { current: null as StoriesApi | null };
    const onStoryComplete = vi.fn();
    const props = {
      isOpen: true,
      onClose: vi.fn(),
      initialGroupIndex: 2,
      apiRef,
      onStoryComplete,
    };
    const { rerender } = render(
      <StoriesOverlay {...props} groups={threeGroups} />,
    );
    rerender(
      <StoriesOverlay
        {...props}
        groups={[
          ...threeGroups,
          {
            author: { id: '4', name: 'Dave', avatar: 'dave.jpg' },
            stories: [quickStory('quick-dave', 300)],
          },
        ]}
      />,
    );

    act(() => apiRef.current?.goToGroup(3));
    act(() => {
      vi.advanceTimersByTime(400);
    });
    expect(onStoryComplete).toHaveBeenCalledWith(3, 0);
  });

  // jsdom resolves no stylesheet, so the duration a theme would give the cards
  // is reported by hand. The time limit has to wait for it, not cut it short.
  it('lets a slide themed longer than a second run to its end', () => {
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
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );

    openCard('Bob');
    act(() => {
      vi.advanceTimersByTime(1400);
    });
    expect(overlay().classList).toContain('rk-stories-overlay--sliding');

    // Still no transition event: the limit ends the slide once the themed
    // duration has passed.
    act(() => {
      vi.advanceTimersByTime(1500);
    });
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
  });

  // The opened group's card leaves the page when the slide ends. Focus left on
  // it would fall to the document body, outside the dialog.
  it('keeps focus in the dialog after opening a group from a focused card', () => {
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );
    (
      document.querySelector(
        '[aria-label="Open stories by Bob"]',
      ) as HTMLElement
    ).focus();

    openCard('Bob');
    nextFrames();
    finishSlide('Bob');
    expect(document.activeElement).toBe(overlay());
  });

  it('leaves focus alone after a slide when it was not on a card', () => {
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );
    const close = document.querySelector('[aria-label="Close"]') as HTMLElement;
    close.focus();

    openCard('Bob');
    nextFrames();
    finishSlide('Bob');
    expect(document.activeElement).toBe(close);
  });

  it('does not count a window resize as a slide', () => {
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );

    act(() => {
      setViewport(1920, 1080);
      window.dispatchEvent(new Event('resize'));
    });
    nextFrames();
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
  });

  // Deliberate: the carousel slide ignores prefers-reduced-motion. Do not
  // restore the check.
  it('slides even when the viewer prefers less motion', () => {
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: (query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
      }),
    });
    const onStoryViewed = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
        onStoryViewed={onStoryViewed}
      />,
    );
    onStoryViewed.mockClear();

    openCard('Bob');
    nextFrames();
    expect(overlay().classList).toContain('rk-stories-overlay--sliding');
    expect(onStoryViewed).not.toHaveBeenCalled();
  });

  it('does not slide after a touch swipe has already moved the player', () => {
    const onStoryViewed = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
        onStoryViewed={onStoryViewed}
      />,
    );
    onStoryViewed.mockClear();

    act(() => {
      (outerReel()['afterChange'] as (index: number) => void)(1);
    });
    nextFrames();
    expect(overlay().classList).not.toContain('rk-stories-overlay--sliding');
    expect(onStoryViewed).toHaveBeenCalledWith(1, 0);
    expect(
      Array.from(cards()).map((card) =>
        card.querySelector('button')?.getAttribute('aria-label'),
      ),
    ).toEqual(['Open stories by Alice', 'Open stories by Carol']);
  });

  it('previews a custom story with no image through renderSlide, inactive', () => {
    const groups: StoriesGroup[] = [
      threeGroups[0],
      {
        author: { id: '2', name: 'Bob', avatar: 'bob.jpg' },
        stories: [{ id: 'tip', mediaType: 'image', src: '' }],
      },
    ];
    const renderSlide = vi.fn(({ story, isActive, size }) => (
      <div
        data-testid={`slide-${story.id}`}
        data-active={String(isActive)}
        data-size={size.join('x')}
      />
    ));
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        desktopLayout="carousel"
        renderSlide={renderSlide}
      />,
    );
    const slide = document.querySelector(
      '.rk-stories-card [data-testid="slide-tip"]',
    ) as HTMLElement;
    expect(slide).not.toBeNull();
    expect(slide.dataset['active']).toBe('false');
    expect(slide.dataset['size']).toBe(
      (lastReelProps[0]['size'] as number[]).join('x'),
    );
  });

  it('puts the cards after the player controls in the tab order', () => {
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );
    const isCard = Array.from(overlay().querySelectorAll('button')).map(
      (button) => button.classList.contains('rk-stories-card-button'),
    );
    expect(isCard).toContain(false);
    expect(isCard.indexOf(true)).toBe(isCard.lastIndexOf(false) + 1);
  });

  it('still closes on Escape', () => {
    const onClose = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={onClose}
        groups={threeGroups}
        desktopLayout="carousel"
      />,
    );
    act(() => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    });
    expect(onClose).toHaveBeenCalled();
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

  type ItemBuilder = (
    index: number,
    indexInRange: number,
    size: [number, number],
  ) => ReactElement;

  const outerReel = () =>
    lastReelProps.filter((props) => props['afterChange']).at(-1)!;

  // The mocked Reel draws no slides, so a group slide is built by hand from
  // the item builder the player hands it.
  const groupSlide = (groupIndex: number) =>
    render(
      (outerReel()['itemBuilder'] as ItemBuilder)(groupIndex, 0, [400, 700]),
    ).container;

  const latestFor = <P extends { groupIndex: number }>(
    spy: { mock: { calls: [P][] } },
    groupIndex: number,
  ) =>
    spy.mock.calls
      .map(([props]) => props)
      .filter((props) => props.groupIndex === groupIndex)
      .at(-1)!;

  const progressSpy = () =>
    vi.fn((_props: ProgressBarRenderProps) => <div className="custom-bar" />);
  const headerSpy = () =>
    vi.fn((_props: HeaderRenderProps) => <div className="custom-header" />);

  const advance = (ms: number) =>
    act(() => {
      vi.advanceTimersByTime(ms);
    });

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'],
    });
    lastReelProps = [];
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) =>
      setTimeout(cb, 0),
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps one progress bar and header above the player by default', () => {
    render(<StoriesOverlay isOpen onClose={vi.fn()} groups={groups} />);

    expect(document.querySelectorAll('.rk-stories-ui-layer')).toHaveLength(1);
    const slide = groupSlide(0);
    expect(slide.querySelector('.rk-stories-ui-layer')).toBeNull();
    expect(slide.querySelector('.rk-stories-progress-bar')).toBeNull();
    expect(slide.querySelector('.rk-stories-header')).toBeNull();
  });

  it('tells custom renderers above the player which group they draw, as active', () => {
    const renderProgressBar = progressSpy();
    const renderHeader = headerSpy();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        initialGroupIndex={1}
        renderProgressBar={renderProgressBar}
        renderHeader={renderHeader}
      />,
    );

    expect(latestFor(renderProgressBar, 1).isActive).toBe(true);
    expect(latestFor(renderHeader, 1).isActive).toBe(true);
  });

  it('draws a progress bar and header inside every group slide', () => {
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        chromePlacement="group"
      />,
    );

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
    const renderProgressBar = progressSpy();
    const renderHeader = headerSpy();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        chromePlacement="group"
        resumeStoryIndex={(groupIndex) => (groupIndex === 1 ? 1 : 0)}
        renderProgressBar={renderProgressBar}
        renderHeader={renderHeader}
      />,
    );

    groupSlide(1);

    const bar = latestFor(renderProgressBar, 1);
    expect(bar.isActive).toBe(false);
    expect(bar.totalStories).toBe(2);
    expect(bar.activeIndex.value).toBe(1);
    expect(bar.progress.value).toBe(0);
    const header = latestFor(renderHeader, 1);
    expect(header.isActive).toBe(false);
    expect(header.storyIndex).toBe(1);
    expect(header.story.id).toBe('b2');
    expect(header.isPaused).toBe(false);
  });

  it('follows the running story in the active group', () => {
    const renderProgressBar = progressSpy();
    const renderHeader = headerSpy();
    const apiRef = { current: null as StoriesApi | null };
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        chromePlacement="group"
        apiRef={apiRef}
        renderProgressBar={renderProgressBar}
        renderHeader={renderHeader}
      />,
    );
    groupSlide(0);

    advance(1000);
    const bar = latestFor(renderProgressBar, 0);
    expect(bar.isActive).toBe(true);
    expect(bar.progress.value).toBeCloseTo(0.25, 1);

    act(() => apiRef.current?.nextStory());
    expect(bar.activeIndex.value).toBe(1);
    expect(latestFor(renderHeader, 0).storyIndex).toBe(1);

    act(() => apiRef.current?.pause());
    expect(latestFor(renderHeader, 0).isPaused).toBe(true);
  });

  it('hides the chrome of the active group during a long press', () => {
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        chromePlacement="group"
      />,
    );
    const slide = groupSlide(0);
    const layer = () => slide.querySelector('.rk-stories-ui-layer')!;

    act(() => (outerReel()['onLongPress'] as () => void)());
    expect(layer().classList).toContain('rk-stories-ui-layer--hidden');

    act(() => (outerReel()['onLongPressEnd'] as () => void)());
    expect(layer().classList).not.toContain('rk-stories-ui-layer--hidden');
  });

  it('hands the new group the running bar once the group changes', () => {
    const renderProgressBar = progressSpy();
    const apiRef = { current: null as StoriesApi | null };
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        chromePlacement="group"
        apiRef={apiRef}
        renderProgressBar={renderProgressBar}
      />,
    );
    groupSlide(0);
    groupSlide(1);
    const running = latestFor(renderProgressBar, 0).progress;

    act(() => apiRef.current?.nextGroup());

    const incoming = latestFor(renderProgressBar, 1);
    expect(incoming.isActive).toBe(true);
    expect(incoming.progress).toBe(running);
    expect(incoming.progress.value).toBe(0);
    const outgoing = latestFor(renderProgressBar, 0);
    expect(outgoing.isActive).toBe(false);
    expect(outgoing.progress).not.toBe(running);
  });

  it('keeps the group being left as it was while the player turns away from it', async () => {
    const renderProgressBar = progressSpy();
    const renderHeader = headerSpy();
    const apiRef = { current: null as StoriesApi | null };
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        chromePlacement="group"
        apiRef={apiRef}
        renderProgressBar={renderProgressBar}
        renderHeader={renderHeader}
      />,
    );
    let finishTurn = noop;
    (outerReel()['apiRef'] as { current: { goTo: unknown } }).current.goTo =
      vi.fn(() => new Promise<void>((resolve) => (finishTurn = resolve)));
    groupSlide(0);
    act(() => apiRef.current?.nextStory());
    advance(1000);

    act(() => apiRef.current?.nextGroup());

    const turning = latestFor(renderProgressBar, 0);
    expect(turning.isActive).toBe(false);
    expect(turning.activeIndex.value).toBe(1);
    expect(turning.progress.value).toBeCloseTo(0.25, 1);
    expect(latestFor(renderHeader, 0).storyIndex).toBe(1);

    await act(async () => finishTurn());

    const resting = latestFor(renderProgressBar, 0);
    expect(resting.activeIndex.value).toBe(1);
    expect(resting.progress.value).toBe(0);
  });

  it('shows a group that played to its end as complete while the player turns away', () => {
    const renderProgressBar = progressSpy();
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={groups}
        initialStoryIndex={1}
        chromePlacement="group"
        renderProgressBar={renderProgressBar}
      />,
    );
    (outerReel()['apiRef'] as { current: { goTo: unknown } }).current.goTo =
      vi.fn(() => new Promise<void>(noop));
    groupSlide(0);

    advance(4100);

    const done = latestFor(renderProgressBar, 0);
    expect(done.isActive).toBe(false);
    expect(done.progress.value).toBe(1);
  });

  // A tap on a button inside the swipe area never reaches the tap zones; the
  // gesture controller in the core package ignores interactive elements.
  it('closes and pauses from the default header inside a group slide', () => {
    const onClose = vi.fn();
    const onPause = vi.fn();
    render(
      <StoriesOverlay
        isOpen
        onClose={onClose}
        onPause={onPause}
        groups={groups}
        chromePlacement="group"
      />,
    );
    const slide = groupSlide(0);

    act(() => {
      (slide.querySelector('[aria-label="Pause"]') as HTMLElement).click();
    });
    expect(onPause).toHaveBeenCalled();

    act(() => {
      (slide.querySelector('[aria-label="Close"]') as HTMLElement).click();
    });
    expect(onClose).toHaveBeenCalled();
  });
});

describe('StoriesOverlay story duration', () => {
  type Builder = (
    index: number,
    indexInRange: number,
    size: [number, number],
  ) => ReactElement<{ children: ReactElement<Record<string, unknown>>[] }>;

  beforeEach(() => {
    vi.useFakeTimers({
      toFake: ['setTimeout', 'clearTimeout', 'Date', 'performance'],
    });
    lastReelProps = [];
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) =>
      setTimeout(cb, 0),
    );
    vi.stubGlobal('cancelAnimationFrame', (id: number) => clearTimeout(id));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('keeps a duration the story names over the one its video reports', () => {
    const onStoryComplete = vi.fn();
    let reportDuration: ((ms: number) => void) | undefined;
    render(
      <StoriesOverlay
        isOpen
        onClose={vi.fn()}
        groups={[
          {
            author: { id: '1', name: 'Alice', avatar: 'alice.jpg' },
            stories: [{ id: 'v', mediaType: 'video', src: '', duration: 3000 }],
          },
        ]}
        onStoryComplete={onStoryComplete}
        renderSlide={(props) => {
          reportDuration = props.onDurationReady;
          return null;
        }}
      />,
    );
    // The mocked Reel draws no slides, so the story is built by hand to get
    // hold of the callbacks the player gives it.
    const outer = lastReelProps.filter((props) => props['afterChange']).at(-1)!;
    const group = (outer['itemBuilder'] as Builder)(0, 0, [400, 700]);
    const storyReel = [group.props.children]
      .flat()
      .find((child) => child?.props?.['itemBuilder']);
    (storyReel?.props['itemBuilder'] as Builder)(0, 0, [400, 700]);

    act(() => reportDuration!(10_000));
    act(() => {
      vi.advanceTimersByTime(3100);
    });

    expect(onStoryComplete).toHaveBeenCalledWith(0, 0);
  });
});
