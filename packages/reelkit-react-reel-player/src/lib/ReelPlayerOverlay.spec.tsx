import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReelProps } from '@reelkit/react';
import type { ContentItem } from './types';
// Track Reel props
let lastReelProps: Partial<ReelProps> = {};

// Mock preloader with controllable state — vi.hoisted ensures
// these are available when vi.mock factory runs (both are hoisted).
const { mockPreloader, mockPreloaderLoaded, mockPreloaderOnLoadedCallbacks } =
  vi.hoisted(() => {
    const loaded = new Set<string>();
    const onLoadedCallbacks = new Map<string, Set<() => void>>();
    return {
      mockPreloaderLoaded: loaded,
      mockPreloaderOnLoadedCallbacks: onLoadedCallbacks,
      mockPreloader: {
        isLoaded: (src: string) => loaded.has(src),
        isPending: () => false,
        preload: vi.fn(),
        markLoaded: vi.fn((src: string) => loaded.add(src)),
        preloadRange: vi.fn(),
        onLoaded: vi.fn((src: string, cb: () => void) => {
          if (loaded.has(src)) {
            cb();
            return vi.fn();
          }
          let subs = onLoadedCallbacks.get(src);
          if (!subs) {
            subs = new Set();
            onLoadedCallbacks.set(src, subs);
          }
          subs.add(cb);
          return () => subs!.delete(cb);
        }),
      },
    };
  });

vi.mock('@reelkit/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reelkit/react')>();
  return {
    ...actual,
    createContentPreloader: () => mockPreloader,
    Reel: (props: ReelProps) => {
      lastReelProps = props;
      // Provide mock api ref
      if (props.apiRef) {
        const ref = props.apiRef as { current: unknown };
        ref.current = {
          next: vi.fn(),
          prev: vi.fn(),
          goTo: vi.fn().mockResolvedValue(undefined),
          adjust: vi.fn(),
          observe: vi.fn(),
          unobserve: vi.fn(),
        };
      }
      // Invoke itemBuilder for index 0 so MediaSlide gets rendered
      return (
        <div data-testid="mock-reel">
          {props.itemBuilder?.(0, 0, [400, 700])}
        </div>
      );
    },
    useBodyLock: vi.fn(),
  };
});

interface MockMediaSlideProps {
  renderNestedNavigation?: unknown;
  onReady?: () => void;
  onWaiting?: () => void;
  [key: string]: unknown;
}

let lastMediaSlideProps: MockMediaSlideProps = {};

vi.mock('./MediaSlide', () => ({
  default: (props: MockMediaSlideProps) => {
    lastMediaSlideProps = props;
    return <div data-testid="mock-media-slide" />;
  },
}));

vi.mock('./PlayerControls', () => ({
  default: ({
    showSound,
    soundDisabled,
    onClose,
  }: {
    showSound: boolean;

    soundDisabled: boolean;

    onClose: () => void;
  }) => (
    <div data-testid="mock-player-controls">
      <button onClick={onClose} aria-label="Close" />
      <span data-show-sound={showSound} data-sound-disabled={soundDisabled} />
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  ChevronUp: () => <span>Up</span>,
  ChevronDown: () => <span>Down</span>,
  X: () => <span>X</span>,
  Volume2: () => <span>V2</span>,
  VolumeX: () => <span>VX</span>,
  Heart: () => <span>Heart</span>,
}));

// eslint-disable-next-line import/first
import { ReelPlayerOverlay } from './ReelPlayerOverlay';

const mockContent: ContentItem[] = [
  {
    id: 'c1',
    media: [
      {
        id: 'm1',
        type: 'video',
        src: 'v1.mp4',
        aspectRatio: 0.56,
        poster: 'p1.jpg',
      },
    ],
    author: { name: 'User1', avatar: '' },
    likes: 100,
    description: 'Test content 1',
  },
  {
    id: 'c2',
    media: [{ id: 'm2', type: 'image', src: 'img.jpg', aspectRatio: 1.5 }],
    author: { name: 'User2', avatar: '' },
    likes: 200,
    description: 'Test content 2',
  },
  {
    id: 'c3',
    media: [
      { id: 'm3', type: 'image', src: 'a.jpg', aspectRatio: 1 },
      { id: 'm4', type: 'video', src: 'v2.mp4', aspectRatio: 0.56 },
    ],
    author: { name: 'User3', avatar: '' },
    likes: 300,
    description: 'Test content 3',
  },
];

describe('ReelPlayerOverlay', () => {
  beforeEach(() => {
    lastReelProps = {};
    lastMediaSlideProps = {};
    mockPreloaderLoaded.clear();
    mockPreloaderOnLoadedCallbacks.clear();
    mockPreloader.markLoaded.mockClear();
    mockPreloader.preload.mockClear();
    mockPreloader.preloadRange.mockClear();
    mockPreloader.onLoaded.mockClear();
    // Mock window dimensions
    Object.defineProperty(window, 'innerWidth', {
      value: 1024,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, 'innerHeight', {
      value: 768,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('open/close', () => {
    it('renders nothing when closed', () => {
      const { container } = render(
        <ReelPlayerOverlay
          isOpen={false}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(container.innerHTML).toBe('');
    });

    it('renders portal when open', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(document.querySelector('.rk-reel-overlay')).toBeTruthy();
    });

    it('closes on ESC key', () => {
      const onClose = vi.fn();

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={onClose}
          content={mockContent}
        />,
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('closes via PlayerControls close button', () => {
      const onClose = vi.fn();

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={onClose}
          content={mockContent}
        />,
      );

      fireEvent.click(screen.getByLabelText('Close'));

      expect(onClose).toHaveBeenCalledOnce();
    });
  });

  describe('navigation', () => {
    it('renders prev and next arrows', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(screen.getByLabelText('Previous')).toBeTruthy();
      expect(screen.getByLabelText('Next')).toBeTruthy();
    });

    it('calls prev on prev arrow click', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      fireEvent.click(screen.getByLabelText('Previous'));

      const ref = lastReelProps.apiRef as unknown as {
        current: { prev: ReturnType<typeof vi.fn> };
      };
      expect(ref.current.prev).toHaveBeenCalled();
    });

    it('calls next on next arrow click', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      fireEvent.click(screen.getByLabelText('Next'));

      const ref = lastReelProps.apiRef as unknown as {
        current: { next: ReturnType<typeof vi.fn> };
      };
      expect(ref.current.next).toHaveBeenCalled();
    });
  });

  describe('reel configuration', () => {
    it('passes count from content length', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(lastReelProps.count).toBe(3);
    });

    it('uses vertical direction', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(lastReelProps.direction).toBe('vertical');
    });

    it('passes initialIndex', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          initialIndex={2}
        />,
      );

      expect(lastReelProps.initialIndex).toBe(2);
    });

    it('enables wheel by default', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(lastReelProps.enableWheel).toBe(true);
    });

    it('forwards transitionDuration', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          transitionDuration={500}
        />,
      );

      expect(lastReelProps.transitionDuration).toBe(500);
    });
  });

  describe('sound', () => {
    it('wraps content in SoundProvider', () => {
      // SoundProvider is internal - verify PlayerControls gets rendered
      // which uses useSoundState (would throw without provider)
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(screen.getByTestId('mock-player-controls')).toBeTruthy();
    });

    it('shows sound button when content has video', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          initialIndex={0}
        />,
      );

      const controls = screen.getByTestId('mock-player-controls');
      const soundSpan = controls.querySelector('span')!;
      expect(soundSpan.getAttribute('data-show-sound')).toBe('true');
    });
  });

  describe('callbacks', () => {
    it('fires onSlideChange through afterChange', () => {
      const onSlideChange = vi.fn();

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          onSlideChange={onSlideChange}
        />,
      );

      // Simulate afterChange callback from Reel
      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(1));

      expect(onSlideChange).toHaveBeenCalledWith(1);
    });
  });

  describe('renderNestedNavigation', () => {
    it('forwards renderNestedNavigation to MediaSlide', () => {
      const renderNestedNavigation = vi.fn(() => <div />);

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderNestedNavigation={renderNestedNavigation}
        />,
      );

      // itemBuilder is invoked by the Reel mock, which renders MediaSlide
      expect(lastMediaSlideProps.renderNestedNavigation).toBe(
        renderNestedNavigation,
      );
    });
  });

  describe('aspectRatio', () => {
    it('uses default 9:16 aspect ratio on desktop', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      const size = lastReelProps.size as [number, number];
      // Desktop: 1024x768. Height-based: width = 768 * 9/16 = 432
      expect(size[0]).toBeCloseTo(432, 0);
      expect(size[1]).toBe(768);
    });

    it('applies custom aspect ratio', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          aspectRatio={3 / 4}
        />,
      );

      const size = lastReelProps.size as [number, number];
      // Desktop: 1024x768. Height-based: width = 768 * 0.75 = 576
      expect(size[0]).toBeCloseTo(576, 0);
      expect(size[1]).toBe(768);
    });

    it('constrains to window width when aspect ratio is wide', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          aspectRatio={16 / 9}
        />,
      );

      const size = lastReelProps.size as [number, number];
      // Desktop: 1024x768. Height-based: width = 768 * 16/9 ≈ 1365 > 1024
      // Constrained: width = 1024, height = 1024 / (16/9) = 576
      expect(size[0]).toBe(1024);
      expect(size[1]).toBeCloseTo(576, 0);
    });
  });

  describe('resize handling', () => {
    it('updates size on window resize', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      const initialSize = lastReelProps.size;

      // Change window dimensions
      Object.defineProperty(window, 'innerWidth', {
        value: 500,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 900,
        writable: true,
        configurable: true,
      });

      act(() => {
        window.dispatchEvent(new Event('resize'));
      });

      // Size should have changed
      expect(lastReelProps.size).not.toEqual(initialSize);
    });
  });

  describe('loading indicator flow', () => {
    it('shows wave loader on initial mount', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(document.querySelector('.rk-reel-loader')).toBeTruthy();
    });

    it('clears wave loader via preloader.onLoaded for initial cached content', () => {
      mockPreloaderLoaded.add('v1.mp4');

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(document.querySelector('.rk-reel-loader')).toBeNull();
    });

    it('clears wave loader when preloader.onLoaded fires asynchronously', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(document.querySelector('.rk-reel-loader')).toBeTruthy();

      // Simulate the preloader finishing the load
      act(() => {
        mockPreloaderLoaded.add('v1.mp4');
        mockPreloaderOnLoadedCallbacks.get('v1.mp4')?.forEach((cb) => cb());
      });

      expect(document.querySelector('.rk-reel-loader')).toBeNull();
    });

    it('skips wave loader on navigation when content is preloaded', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      // Clear initial wave loader
      act(() => {
        mockPreloaderLoaded.add('v1.mp4');
        mockPreloaderOnLoadedCallbacks.get('v1.mp4')?.forEach((cb) => cb());
      });
      expect(document.querySelector('.rk-reel-loader')).toBeNull();

      // Mark next slide as preloaded before navigating
      mockPreloaderLoaded.add('img.jpg');

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      // Wave loader should not appear for preloaded image
      expect(document.querySelector('.rk-reel-loader')).toBeNull();
    });

    it('shows wave loader on navigation when content is not preloaded', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      // Clear initial wave loader
      act(() => {
        mockPreloaderLoaded.add('v1.mp4');
        mockPreloaderOnLoadedCallbacks.get('v1.mp4')?.forEach((cb) => cb());
      });

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      // img.jpg not preloaded → wave loader should appear
      expect(document.querySelector('.rk-reel-loader')).toBeTruthy();
    });

    it('passes onReady to MediaSlide that clears wave loader', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(document.querySelector('.rk-reel-loader')).toBeTruthy();

      // Simulate MediaSlide calling onReady
      const onReady = lastMediaSlideProps.onReady as () => void;
      act(() => onReady());

      expect(document.querySelector('.rk-reel-loader')).toBeNull();
    });

    it('onReady marks media as loaded in preloader', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      const onReady = lastMediaSlideProps.onReady as () => void;
      act(() => onReady());

      expect(mockPreloader.markLoaded).toHaveBeenCalledWith('v1.mp4');
    });

    it('passes onWaiting to MediaSlide that re-enables wave loader', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      // Clear wave loader first
      const onReady = lastMediaSlideProps.onReady as () => void;
      act(() => onReady());
      expect(document.querySelector('.rk-reel-loader')).toBeNull();

      // Simulate video buffering
      const onWaiting = lastMediaSlideProps.onWaiting as () => void;
      act(() => onWaiting());

      expect(document.querySelector('.rk-reel-loader')).toBeTruthy();
    });
  });

  describe('renderSlide', () => {
    it('passes onReady and onWaiting to renderSlide', () => {
      const renderSlide = vi.fn(() => null);

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderSlide={renderSlide}
        />,
      );

      expect(renderSlide).toHaveBeenCalledWith(
        expect.objectContaining({
          onReady: expect.any(Function),
          onWaiting: expect.any(Function),
        }),
      );
    });

    it('renderSlide onReady clears wave loader', () => {
      let capturedOnReady: (() => void) | undefined;

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderSlide={(props) => {
            capturedOnReady = props.onReady;
            return <div data-testid="custom-slide" />;
          }}
        />,
      );

      expect(document.querySelector('.rk-reel-loader')).toBeTruthy();

      act(() => capturedOnReady!());

      expect(document.querySelector('.rk-reel-loader')).toBeNull();
    });

    it('renderSlide onReady marks media as loaded in preloader', () => {
      let capturedOnReady: (() => void) | undefined;

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderSlide={(props) => {
            capturedOnReady = props.onReady;
            return <div />;
          }}
        />,
      );

      act(() => capturedOnReady!());

      expect(mockPreloader.markLoaded).toHaveBeenCalledWith('v1.mp4');
    });

    it('renderSlide onWaiting re-enables wave loader', () => {
      let capturedOnReady: (() => void) | undefined;
      let capturedOnWaiting: (() => void) | undefined;

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderSlide={(props) => {
            capturedOnReady = props.onReady;
            capturedOnWaiting = props.onWaiting;
            return <div />;
          }}
        />,
      );

      act(() => capturedOnReady!());
      expect(document.querySelector('.rk-reel-loader')).toBeNull();

      act(() => capturedOnWaiting!());
      expect(document.querySelector('.rk-reel-loader')).toBeTruthy();
    });
  });

  describe('renderControls', () => {
    it('renders custom controls when provided', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderControls={({ onClose, activeIndex }) => (
            <div data-testid="custom-controls" data-index={activeIndex}>
              <button onClick={onClose}>X</button>
            </div>
          )}
        />,
      );

      expect(screen.getByTestId('custom-controls')).toBeTruthy();
      expect(
        screen.getByTestId('custom-controls').getAttribute('data-index'),
      ).toBe('0');
    });

    it('hides default PlayerControls when renderControls is provided', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderControls={() => <div data-testid="custom-controls" />}
        />,
      );

      expect(screen.queryByTestId('mock-player-controls')).toBeNull();
    });
  });

  describe('renderNavigation', () => {
    it('renders custom navigation when provided', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderNavigation={({ onPrev, onNext, activeIndex, count }) => (
            <div data-testid="custom-nav">
              <button onClick={onPrev}>Prev</button>
              <span>
                {activeIndex}/{count}
              </span>
              <button onClick={onNext}>Next</button>
            </div>
          )}
        />,
      );

      expect(screen.getByTestId('custom-nav')).toBeTruthy();
    });

    it('hides default arrows when renderNavigation is provided', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderNavigation={() => <div />}
        />,
      );

      expect(screen.queryByLabelText('Previous')).toBeNull();
      expect(screen.queryByLabelText('Next')).toBeNull();
    });
  });

  describe('renderSlideOverlay', () => {
    it('renders custom slide overlay when provided', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderSlideOverlay={(item, index) => (
            <div data-testid="custom-overlay" data-index={index}>
              {(item as ContentItem).description}
            </div>
          )}
        />,
      );

      expect(screen.getByTestId('custom-overlay')).toBeTruthy();
    });

    it('renders null overlay when renderSlideOverlay returns null', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
          renderSlideOverlay={() => null}
        />,
      );

      expect(screen.queryByTestId('custom-overlay')).toBeNull();
    });
  });

  describe('mobile size', () => {
    it('uses full viewport on mobile-width screens', () => {
      Object.defineProperty(window, 'innerWidth', {
        value: 400,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 700,
        writable: true,
        configurable: true,
      });

      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      const size = lastReelProps.size as [number, number];
      expect(size[0]).toBe(400);
      expect(size[1]).toBe(700);
    });
  });

  describe('drag handlers', () => {
    it('fires onSlideDragStart through Reel', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(lastReelProps.onSlideDragStart).toBeTypeOf('function');
    });

    it('fires onSlideDragEnd through Reel', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(lastReelProps.onSlideDragEnd).toBeTypeOf('function');
    });

    it('fires onSlideDragCanceled through Reel', () => {
      render(
        <ReelPlayerOverlay
          isOpen={true}
          onClose={vi.fn()}
          content={mockContent}
        />,
      );

      expect(lastReelProps.onSlideDragCanceled).toBeTypeOf('function');
    });
  });
});
