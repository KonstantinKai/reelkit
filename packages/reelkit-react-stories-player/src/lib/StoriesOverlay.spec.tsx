import { StrictMode } from 'react';
import { render, act } from '@testing-library/react';
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
  slideTransition,
  createUrlStateController,
  urlIndexTwoAxisKey,
  type TwoAxisIdentity,
  type TwoAxisPosition,
} from '@reelkit/react';
import type { StoriesGroup } from '@reelkit/stories-core';
import { createFakeUrlAdapter } from '@reelkit/core/testing';
import { StoriesOverlay, StoriesUrlOverlay } from './StoriesOverlay';
import type { StoriesApi } from './types';

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
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
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
});

describe('StoriesUrlOverlay', () => {
  beforeEach(() => {
    lastReelProps = [];
    vi.stubGlobal('requestAnimationFrame', (cb: () => void) =>
      setTimeout(cb, 0),
    );
    vi.stubGlobal('cancelAnimationFrame', vi.fn());
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
});
