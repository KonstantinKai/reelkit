import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  slideTransition,
  createDeferred,
  useOverlayUrlState,
  indexKey,
  type ReelProps,
  type UrlCodec,
  type UrlLocator,
  type OverlayUrlStateOptions,
  type UrlStateController,
} from '@reelkit/react';
import { createFakeUrlAdapter } from '@reelkit/core/testing';
import type { LightboxItem } from './LightboxOverlay';
import { lightboxFadeTransition } from './lightboxFadeTransition';
import { lightboxZoomTransition } from './lightboxZoomTransition';
import { LightboxOverlay, LightboxUrlOverlay } from './LightboxOverlay';

// Track Reel props
let lastReelProps: Partial<ReelProps> = {};

const {
  mockPreloader,
  mockPreloaderLoaded,
  mockPreloaderErrored,
  mockPreloaderOnLoadedCallbacks,
} = vi.hoisted(() => {
  const loaded = new Set<string>();
  const errored = new Set<string>();
  const onLoadedCallbacks = new Map<string, Set<() => void>>();
  return {
    mockPreloaderLoaded: loaded,
    mockPreloaderErrored: errored,
    mockPreloaderOnLoadedCallbacks: onLoadedCallbacks,
    mockPreloader: {
      isLoaded: (src: string) => loaded.has(src),
      isErrored: (src: string) => errored.has(src),
      isPending: () => false,
      preload: vi.fn(),
      markLoaded: vi.fn((src: string) => loaded.add(src)),
      markErrored: vi.fn((src: string) => errored.add(src)),
      preloadRange: vi.fn(),
      onLoaded: vi.fn((src: string, cb: () => void) => {
        if (loaded.has(src)) {
          cb();
          return () => {
            /* noop */
          };
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
      // Invoke itemBuilder for index 0 so renderSlide gets exercised
      return (
        <div data-testid="mock-reel">
          {props.itemBuilder?.(0, 0, [1024, 768])}
        </div>
      );
    },
    useBodyLock: vi.fn(),
    useFullscreen: () => [
      mockFullscreenSignal,
      mockRequestFullscreen,
      mockExitFullscreen,
      mockToggleFullscreen,
    ],
    SwipeToClose: ({
      children,
      enabled,
      direction,
    }: {
      children: React.ReactNode;
      enabled?: boolean;
      direction?: string;
    }) => (
      <div
        data-testid="mock-swipe-to-close"
        data-enabled={enabled}
        data-direction={direction}
      >
        {children}
      </div>
    ),
  };
});

// Mock useFullscreen
const mockRequestFullscreen = vi.fn();
const mockExitFullscreen = vi.fn();
const mockToggleFullscreen = vi.fn();
const mockFullscreenSignal = {
  _value: false,
  get value() {
    return this._value;
  },
  set value(v: boolean) {
    this._value = v;
  },
  observe: () => vi.fn(),
};

vi.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Maximize: () => <span>Maximize</span>,
  Minimize: () => <span>Minimize</span>,
  ChevronLeft: () => <span>Left</span>,
  ChevronRight: () => <span>Right</span>,
  Volume2: () => <span>Volume2</span>,
  VolumeX: () => <span>VolumeX</span>,
  ImageOff: () => <span>ImageOff</span>,
}));

const mockImages: LightboxItem[] = [
  { src: 'img1.jpg', title: 'Image 1', description: 'First image' },
  { src: 'img2.jpg', title: 'Image 2' },
  { src: 'img3.jpg' },
];

describe('LightboxOverlay', () => {
  beforeEach(() => {
    lastReelProps = {};
    mockFullscreenSignal._value = false;
    mockRequestFullscreen.mockClear();
    mockExitFullscreen.mockClear();
    mockPreloaderLoaded.clear();
    mockPreloaderOnLoadedCallbacks.clear();
    mockPreloader.markLoaded.mockClear();
    mockPreloader.onLoaded.mockClear();

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

    // Desktop by default (no touch)
    // NOTE: do NOT define 'ontouchstart' - its mere existence on window makes isMobile true
    delete (window as unknown as Record<string, unknown>)['ontouchstart'];
    Object.defineProperty(navigator, 'maxTouchPoints', {
      value: 0,
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
        <LightboxOverlay
          isOpen={false}
          images={mockImages}
          onClose={vi.fn()}
        />,
      );

      expect(container.innerHTML).toBe('');
    });

    it('renders portal when open', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(document.querySelector('.rk-lightbox-overlay')).toBeTruthy();
    });

    it('closes on close button click', () => {
      const onClose = vi.fn();

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={onClose} />,
      );

      fireEvent.click(screen.getByTitle('Close (Esc)'));

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('closes on ESC when not fullscreen', () => {
      const onClose = vi.fn();

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={onClose} />,
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onClose).toHaveBeenCalledOnce();
    });

    it('exits fullscreen on ESC when fullscreen is active', () => {
      mockFullscreenSignal._value = true;
      const onClose = vi.fn();

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={onClose} />,
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(mockExitFullscreen).toHaveBeenCalled();
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('counter', () => {
    it('shows current/total counter', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const counter = document.querySelector('.rk-lightbox-counter');
      expect(counter).toBeTruthy();
      expect(counter!.textContent).toBe('1 / 3');
    });

    it('updates counter on slide change', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(2));

      const counter = document.querySelector('.rk-lightbox-counter');
      expect(counter!.textContent).toBe('3 / 3');
    });
  });

  describe('navigation', () => {
    it('shows next button on desktop with multiple images', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      // At index 0, next should be visible but prev should not
      expect(screen.queryByTitle('Previous')).toBeNull();
      expect(screen.getByTitle('Next')).toBeTruthy();
    });

    it('shows prev button when not at first index', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          initialIndex={1}
        />,
      );

      // Simulate afterChange to update internal currentIndex state
      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(1));

      expect(screen.getByTitle('Previous')).toBeTruthy();
      expect(screen.getByTitle('Next')).toBeTruthy();
    });

    it('hides next button at last index', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(2));

      expect(screen.getByTitle('Previous')).toBeTruthy();
      expect(screen.queryByTitle('Next')).toBeNull();
    });

    it('calls prev on prev button click', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(1));

      fireEvent.click(screen.getByTitle('Previous'));

      const ref = lastReelProps.apiRef as unknown as {
        current: { prev: ReturnType<typeof vi.fn> };
      };
      expect(ref.current.prev).toHaveBeenCalled();
    });
  });

  describe('fullscreen', () => {
    it('renders fullscreen toggle button', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(screen.getByTitle('Enter Fullscreen')).toBeTruthy();
    });

    it('shows minimize icon when fullscreen', () => {
      mockFullscreenSignal._value = true;

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(screen.getByTitle('Exit Fullscreen')).toBeTruthy();
    });

    it('calls toggleFullscreen on button click', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      fireEvent.click(screen.getByTitle('Enter Fullscreen'));

      expect(mockToggleFullscreen).toHaveBeenCalled();
    });
  });

  describe('transitions', () => {
    it('uses horizontal direction for Reel', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(lastReelProps.direction).toBe('horizontal');
    });
  });

  describe('title and description', () => {
    it('shows title when available', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const title = document.querySelector('.rk-lightbox-title');
      expect(title).toBeTruthy();
      expect(title!.textContent).toBe('Image 1');
    });

    it('shows description when available', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const desc = document.querySelector('.rk-lightbox-description');
      expect(desc).toBeTruthy();
      expect(desc!.textContent).toBe('First image');
    });

    it('hides info section when no title or description', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      // Move to image 3 which has no title or description
      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(2));

      expect(document.querySelector('.rk-lightbox-info')).toBeNull();
    });
  });

  describe('mobile', () => {
    it('shows swipe hint on mobile', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 2,
        writable: true,
        configurable: true,
      });

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(document.querySelector('.rk-lightbox-swipe-hint')).toBeTruthy();
    });

    it('wraps Reel in SwipeToClose on mobile', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 2,
        writable: true,
        configurable: true,
      });

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const swipeToClose = screen.getByTestId('mock-swipe-to-close');
      expect(swipeToClose.getAttribute('data-enabled')).toBe('true');
    });

    it("defaults SwipeToClose direction to 'up'", () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(
        screen
          .getByTestId('mock-swipe-to-close')
          .getAttribute('data-direction'),
      ).toBe('up');
    });

    it('forwards swipeToCloseDirection="down" to SwipeToClose', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          swipeToCloseDirection="down"
        />,
      );

      expect(
        screen
          .getByTestId('mock-swipe-to-close')
          .getAttribute('data-direction'),
      ).toBe('down');
    });

    it('hides navigation buttons on mobile', () => {
      Object.defineProperty(navigator, 'maxTouchPoints', {
        value: 2,
        writable: true,
        configurable: true,
      });

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(screen.queryByTitle('Previous')).toBeNull();
      expect(screen.queryByTitle('Next')).toBeNull();
    });
  });

  describe('callbacks', () => {
    it('fires onSlideChange on after change', () => {
      const onSlideChange = vi.fn();

      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          onSlideChange={onSlideChange}
        />,
      );

      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(1));

      expect(onSlideChange).toHaveBeenCalledWith(1);
    });

    it('passes apiRef through', () => {
      const apiRef = { current: null };

      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          apiRef={apiRef}
        />,
      );

      expect(apiRef.current).toBeTruthy();
    });
  });

  describe('renderControls', () => {
    it('renders custom controls when provided', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderControls={() => <div data-testid="custom-controls">Custom</div>}
        />,
      );

      expect(screen.getByTestId('custom-controls')).toBeTruthy();
    });

    it('hides default controls when renderControls is provided', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderControls={() => <div data-testid="custom-controls" />}
        />,
      );

      expect(document.querySelector('.rk-lightbox-counter')).toBeNull();
      expect(screen.queryByTitle('Close (Esc)')).toBeNull();
      expect(screen.queryByTitle('Enter Fullscreen')).toBeNull();
    });

    it('passes correct props to renderControls', () => {
      const renderControls = vi.fn(() => <div />);

      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderControls={renderControls}
        />,
      );

      expect(renderControls).toHaveBeenCalledWith(
        expect.objectContaining({
          item: mockImages[0],
          activeIndex: 0,
          count: 3,
          isFullscreen: false,
          onClose: expect.any(Function),
          onToggleFullscreen: expect.any(Function),
        }),
      );
    });
  });

  describe('renderNavigation', () => {
    it('renders custom navigation when provided', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderNavigation={() => <div data-testid="custom-nav">Nav</div>}
        />,
      );

      expect(screen.getByTestId('custom-nav')).toBeTruthy();
    });

    it('hides default navigation when renderNavigation is provided', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderNavigation={() => <div data-testid="custom-nav" />}
        />,
      );

      expect(screen.queryByTitle('Previous')).toBeNull();
      expect(screen.queryByTitle('Next')).toBeNull();
    });

    it('passes correct props to renderNavigation', () => {
      const renderNavigation = vi.fn(() => <div />);

      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderNavigation={renderNavigation}
        />,
      );

      expect(renderNavigation).toHaveBeenCalledWith(
        expect.objectContaining({
          item: mockImages[0],
          onPrev: expect.any(Function),
          onNext: expect.any(Function),
          activeIndex: 0,
          count: 3,
        }),
      );
    });
  });

  describe('renderInfo', () => {
    it('renders custom info when provided', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderInfo={({ item }) => (
            <div data-testid="custom-info">{item.title}</div>
          )}
        />,
      );

      expect(screen.getByTestId('custom-info')).toBeTruthy();
      expect(screen.getByTestId('custom-info').textContent).toBe('Image 1');
    });

    it('hides default info when renderInfo is provided', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderInfo={() => <div data-testid="custom-info" />}
        />,
      );

      expect(document.querySelector('.rk-lightbox-info')).toBeNull();
    });

    it('passes correct props to renderInfo', () => {
      const renderInfo = vi.fn(() => <div />);

      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderInfo={renderInfo}
        />,
      );

      expect(renderInfo).toHaveBeenCalledWith({
        item: mockImages[0],
        index: 0,
      });
    });
  });

  describe('preloading', () => {
    it('calls preloadRange on mount with current images and index', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(mockPreloader.preloadRange).toHaveBeenCalledWith(mockImages, 0, 2);
    });

    it('calls preloadRange after slide change', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      mockPreloader.preloadRange.mockClear();

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      expect(mockPreloader.preloadRange).toHaveBeenCalledWith(mockImages, 1, 2);
    });
  });

  describe('renderSlide', () => {
    it('renders custom slide when returning non-null', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderSlide={({ item }) => (
            <div data-testid="custom-slide">{item.title}</div>
          )}
        />,
      );

      expect(screen.getByTestId('custom-slide')).toBeTruthy();
      expect(screen.getByTestId('custom-slide').textContent).toBe('Image 1');
    });

    it('falls back to default when renderSlide returns null', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderSlide={() => null}
        />,
      );

      // Default image should render
      const img = document.querySelector('.rk-lightbox-img');
      expect(img).toBeTruthy();
    });

    it('hides default image when custom slide is rendered', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderSlide={() => <div data-testid="custom-slide">Custom</div>}
        />,
      );

      expect(document.querySelector('.rk-lightbox-img')).toBeNull();
    });

    it('forwards lightboxFadeTransition when passed via transitionFn', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          transitionFn={lightboxFadeTransition}
        />,
      );

      expect(lastReelProps.transition).toBe(lightboxFadeTransition);
    });

    it('forwards lightboxZoomTransition when passed via transitionFn', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          transitionFn={lightboxZoomTransition}
        />,
      );

      expect(lastReelProps.transition).toBe(lightboxZoomTransition);
    });

    it('defaults to slideTransition when transitionFn is omitted', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(lastReelProps.transition).toBe(slideTransition);
    });

    it('forwards a custom transition fn', () => {
      const customFn = vi.fn();
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          transitionFn={customFn}
        />,
      );

      expect(lastReelProps.transition).toBe(customFn);
    });

    it('keeps itemBuilder reference stable on slide change so video slides are not remounted', () => {
      const mixedItems: LightboxItem[] = [
        { src: 'stable-img.jpg', title: 'Image' },
        {
          src: 'stable-video.mp4',
          type: 'video',
          poster: 'poster.jpg',
          title: 'Video',
        },
      ];

      render(
        <LightboxOverlay
          isOpen={true}
          images={mixedItems}
          onClose={vi.fn()}
          renderSlide={() => <div>custom</div>}
        />,
      );

      const firstItemBuilder = lastReelProps.itemBuilder;
      expect(firstItemBuilder).toBeTruthy();

      // Simulate slide change — this updates currentIndex state
      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(1));

      // itemBuilder must be the same reference — otherwise Reel remounts
      // slides and destroys the shared video element mid-transition
      expect(lastReelProps.itemBuilder).toBe(firstItemBuilder);
    });

    it('passes correct isActive to renderSlide after navigating to a video slide', () => {
      const mixedItems: LightboxItem[] = [
        { src: 'nav-img.jpg', title: 'Image' },
        {
          src: 'nav-video.mp4',
          type: 'video',
          poster: 'poster.jpg',
          title: 'Video',
        },
        { src: 'nav-img2.jpg', title: 'Image 2' },
      ];

      const renderSlide = vi.fn(() => null);

      render(
        <LightboxOverlay
          isOpen={true}
          images={mixedItems}
          onClose={vi.fn()}
          renderSlide={renderSlide}
        />,
      );

      // Initially at index 0, itemBuilder is called for index 0
      // renderSlide should receive isActive=true for index 0
      expect(renderSlide).toHaveBeenCalledWith(
        expect.objectContaining({
          item: mixedItems[0],
          index: 0,
          isActive: true,
        }),
      );

      renderSlide.mockClear();

      // Navigate to video slide (index 1)
      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(1));

      // Manually invoke itemBuilder for index 1 (simulates what Reel does)
      const itemBuilder = lastReelProps.itemBuilder as (
        index: number,
        indexInRange: number,
        size: [number, number],
      ) => React.ReactNode;
      itemBuilder(1, 1, [1024, 768]);

      // renderSlide should receive isActive=true for the video slide
      expect(renderSlide).toHaveBeenCalledWith(
        expect.objectContaining({
          item: mixedItems[1],
          index: 1,
          isActive: true,
        }),
      );

      // And isActive=false for the image slide
      renderSlide.mockClear();
      itemBuilder(0, 0, [1024, 768]);
      expect(renderSlide).toHaveBeenCalledWith(
        expect.objectContaining({
          item: mixedItems[0],
          index: 0,
          isActive: false,
        }),
      );
    });
  });

  describe('loading indicator flow', () => {
    it('shows spinner on initial mount', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(document.querySelector('.rk-lightbox-spinner')).toBeTruthy();
    });

    it('clears spinner via preloader.onLoaded for initially cached image', () => {
      mockPreloaderLoaded.add('img1.jpg');

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
    });

    it('clears spinner when preloader.onLoaded fires asynchronously', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(document.querySelector('.rk-lightbox-spinner')).toBeTruthy();

      act(() => {
        mockPreloaderLoaded.add('img1.jpg');
        mockPreloaderOnLoadedCallbacks.get('img1.jpg')?.forEach((cb) => cb());
      });

      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
    });

    it('clears spinner when image onLoad fires', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(document.querySelector('.rk-lightbox-spinner')).toBeTruthy();

      const img = document.querySelector(
        '.rk-lightbox-img',
      ) as HTMLImageElement;
      act(() => {
        fireEvent.load(img);
      });

      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
    });

    it('marks image as loaded in preloader on onLoad', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const img = document.querySelector(
        '.rk-lightbox-img',
      ) as HTMLImageElement;
      act(() => {
        fireEvent.load(img);
      });

      expect(mockPreloader.markLoaded).toHaveBeenCalledWith('img1.jpg');
    });

    it('skips spinner on navigation when image is preloaded', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      // Clear initial spinner
      act(() => {
        mockPreloaderLoaded.add('img1.jpg');
        mockPreloaderOnLoadedCallbacks.get('img1.jpg')?.forEach((cb) => cb());
      });
      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();

      // Mark next image as preloaded
      mockPreloaderLoaded.add('img2.jpg');

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
    });

    it('shows spinner on navigation when image is not preloaded', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      // Clear initial spinner
      act(() => {
        mockPreloaderLoaded.add('img1.jpg');
        mockPreloaderOnLoadedCallbacks.get('img1.jpg')?.forEach((cb) => cb());
      });

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      expect(document.querySelector('.rk-lightbox-spinner')).toBeTruthy();
    });

    it('custom renderSlide receives onReady that clears spinner', () => {
      let capturedOnReady: (() => void) | undefined;

      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderSlide={({ onReady }) => {
            capturedOnReady = onReady;
            return <div data-testid="custom-slide" />;
          }}
        />,
      );

      expect(document.querySelector('.rk-lightbox-spinner')).toBeTruthy();

      act(() => capturedOnReady!());

      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
    });

    it('shows error icon when image onError fires', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const itemBuilder = lastReelProps.itemBuilder as (
        i: number,
        ir: number,
        s: [number, number],
      ) => React.ReactNode;

      const { container } = render(<>{itemBuilder(0, 0, [1024, 768])}</>);

      const img = container.querySelector('img');
      act(() => {
        img?.dispatchEvent(new Event('error', { bubbles: true }));
      });

      expect(document.querySelector('.rk-lightbox-img-error')).toBeTruthy();
      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
    });

    it('custom renderSlide receives onError callback', () => {
      let capturedOnError: (() => void) | undefined;

      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderSlide={({ onError }) => {
            capturedOnError = onError;
            return <div />;
          }}
        />,
      );

      expect(capturedOnError).toBeDefined();
      act(() => capturedOnError!());

      expect(document.querySelector('.rk-lightbox-img-error')).toBeTruthy();
    });

    it('onAfterChange shows error icon for previously errored source', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      mockPreloaderErrored.add('img2.jpg');

      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(1));

      expect(document.querySelector('.rk-lightbox-img-error')).toBeTruthy();
      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();

      mockPreloaderErrored.clear();
    });

    it('renderLoading replaces default spinner and receives item', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderLoading={({ item, activeIndex }) => (
            <div data-testid="custom-loading">
              Loading {activeIndex} {item?.src}
            </div>
          )}
        />,
      );

      expect(document.querySelector('.rk-lightbox-spinner')).toBeNull();
      expect(screen.getByTestId('custom-loading')).toBeTruthy();
      expect(screen.getByTestId('custom-loading').textContent).toContain(
        mockImages[0].src,
      );
    });

    it('renderError replaces default error icon', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderError={({ activeIndex }) => (
            <div data-testid="custom-error">Error at {activeIndex}</div>
          )}
        />,
      );

      mockPreloaderErrored.add('img1.jpg');
      const afterChange = lastReelProps.afterChange as (i: number) => void;
      act(() => afterChange(0));

      expect(document.querySelector('.rk-lightbox-img-error')).toBeNull();
      expect(screen.getByTestId('custom-error')).toBeTruthy();

      mockPreloaderErrored.clear();
    });

    it('default spinner renders when renderLoading is not provided', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(document.querySelector('.rk-lightbox-spinner')).toBeTruthy();
    });
  });

  describe('a11y', () => {
    it('overlay root is a labelled modal dialog', () => {
      render(<LightboxOverlay isOpen images={mockImages} onClose={vi.fn()} />);

      const overlay = document.querySelector('.rk-lightbox-overlay');
      expect(overlay).toBeTruthy();
      expect(overlay!.getAttribute('role')).toBe('dialog');
      expect(overlay!.getAttribute('aria-modal')).toBe('true');
      expect(overlay!.getAttribute('aria-label')).toBe('Image gallery');
    });

    it('ariaLabel prop overrides the default', () => {
      render(
        <LightboxOverlay
          isOpen
          images={mockImages}
          onClose={vi.fn()}
          ariaLabel="Product photos"
        />,
      );

      expect(
        document
          .querySelector('.rk-lightbox-overlay')!
          .getAttribute('aria-label'),
      ).toBe('Product photos');
    });

    it('slide wrapper carries group role + image position label', () => {
      render(<LightboxOverlay isOpen images={mockImages} onClose={vi.fn()} />);

      const wrapper = document.querySelector('.rk-lightbox-slide');
      expect(wrapper).toBeTruthy();
      expect(wrapper!.getAttribute('role')).toBe('group');
      expect(wrapper!.getAttribute('aria-roledescription')).toBe('slide');
      expect(wrapper!.getAttribute('aria-label')).toBe(
        `Image 1 of ${mockImages.length}`,
      );
    });
  });

  describe('url-driven mode', () => {
    const isOpen = () =>
      document.querySelector('.rk-lightbox-overlay') !== null;

    // The consumer builds the controller with the hook and hands it to the
    // overlay; this harness mirrors that so a test can drive the fake url.
    let controller: UrlStateController;

    const renderUrl = <Id,>(
      options: OverlayUrlStateOptions<Id>,
      images: LightboxItem[] = mockImages,
    ) => {
      const Harness = () => {
        controller = useOverlayUrlState(options);
        return <LightboxUrlOverlay controller={controller} images={images} />;
      };
      return render(<Harness />);
    };

    // The default gallery bounds the index against its live size.
    const count = () => mockImages.length;

    it('pushes one history entry on open and replaces on every slide change', () => {
      const fake = createFakeUrlAdapter();

      renderUrl({ param: 'photo', adapter: fake.adapter, ...indexKey(count) });

      act(() => controller.set(0));
      expect(fake.counts.push).toBe(1);

      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(1));
      act(() => afterChange(2));

      // Paging costs nothing: one back step still leaves the gallery.
      expect(fake.counts.push).toBe(1);
      expect(fake.adapter.read()).toBe('?photo=2');
    });

    it('opens at the index named by the url on first render', () => {
      const fake = createFakeUrlAdapter('?photo=1');

      renderUrl({ param: 'photo', adapter: fake.adapter, ...indexKey(count) });

      expect(isOpen()).toBe(true);
      expect(lastReelProps.initialIndex).toBe(1);
    });

    it('stays closed when the parameter is absent', () => {
      const fake = createFakeUrlAdapter('?tab=media');

      renderUrl({ param: 'photo', adapter: fake.adapter, ...indexKey(count) });

      expect(isOpen()).toBe(false);
    });

    it('opens when the parameter appears while running', () => {
      const fake = createFakeUrlAdapter();

      renderUrl({ param: 'photo', adapter: fake.adapter, ...indexKey(count) });
      expect(isOpen()).toBe(false);

      act(() => fake.adapter.push('?photo=2'));

      expect(isOpen()).toBe(true);
      expect(lastReelProps.initialIndex).toBe(2);
    });

    it('closes when the parameter goes away', () => {
      const fake = createFakeUrlAdapter();

      renderUrl({ param: 'photo', adapter: fake.adapter, ...indexKey(count) });

      act(() => fake.adapter.push('?photo=2'));
      expect(isOpen()).toBe(true);

      act(() => fake.adapter.goBack());

      expect(isOpen()).toBe(false);
    });

    it('keeps its initial index when the url changes while open', () => {
      const fake = createFakeUrlAdapter('?photo=1');

      renderUrl({ param: 'photo', adapter: fake.adapter, ...indexKey(count) });
      expect(lastReelProps.initialIndex).toBe(1);

      // Once open the slider owns the index and the url only trails it.
      // Re-seeding here would reset the gallery under the user's swipe.
      act(() => fake.adapter.push('?photo=2'));

      expect(isOpen()).toBe(true);
      expect(lastReelProps.initialIndex).toBe(1);
    });

    it('drops an out-of-range parameter and stays closed', () => {
      const fake = createFakeUrlAdapter('?photo=99');

      renderUrl({ param: 'photo', adapter: fake.adapter, ...indexKey(count) });

      // The url may not assert a slide the gallery cannot show.
      expect(isOpen()).toBe(false);
      expect(fake.adapter.read()).toBe('');
    });

    it('drops an unparseable parameter and stays closed', () => {
      const fake = createFakeUrlAdapter('?photo=bogus');

      renderUrl({ param: 'photo', adapter: fake.adapter, ...indexKey(count) });

      expect(isOpen()).toBe(false);
      expect(fake.adapter.read()).toBe('');
    });

    describe('async resolution', () => {
      const flush = () => new Promise((done) => setTimeout(done, 0));

      const idCodec: UrlCodec<string> = {
        decode: (raw) => raw,
        encode: (id) => id,
      };

      const locateIn = (loaded: string[]): UrlLocator<string> => ({
        locate: (id) => {
          const found = loaded.indexOf(id);
          return found >= 0 ? found : null;
        },
        identify: (index) => loaded[index],
      });

      it('leaves the parameter untouched while the item is still resolving', async () => {
        const fake = createFakeUrlAdapter('?photo=99');
        const pending = createDeferred();

        renderUrl({
          param: 'photo',
          adapter: fake.adapter,
          codec: idCodec,
          locator: {
            ...locateIn([]),
            locateAsync: async () => {
              await pending.promise;
              return null;
            },
          },
        });

        expect(isOpen()).toBe(false);
        expect(fake.adapter.read()).toBe('?photo=99');
      });

      it('opens at the index locateAsync finds once the page arrives', async () => {
        const fake = createFakeUrlAdapter('?photo=late');
        const pending = createDeferred();
        const loaded: string[] = [];

        renderUrl({
          param: 'photo',
          adapter: fake.adapter,
          codec: idCodec,
          locator: {
            ...locateIn(loaded),
            locateAsync: async (id) => {
              await pending.promise;
              loaded.push('a', 'b', id);
              return loaded.indexOf(id);
            },
          },
        });
        expect(isOpen()).toBe(false);

        await act(async () => {
          pending.resolve();
          await flush();
        });

        expect(isOpen()).toBe(true);
        expect(lastReelProps.initialIndex).toBe(2);
      });

      it('drops the parameter when locateAsync still misses after the page arrives', async () => {
        const fake = createFakeUrlAdapter('?photo=gone');
        const pending = createDeferred();

        renderUrl({
          param: 'photo',
          adapter: fake.adapter,
          codec: idCodec,
          locator: {
            ...locateIn([]),
            // The pages arrive, and none of them holds this image.
            locateAsync: async () => {
              await pending.promise;
              return null;
            },
          },
        });

        await act(async () => {
          pending.resolve();
          await flush();
        });

        expect(isOpen()).toBe(false);
        expect(fake.adapter.read()).toBe('');
      });

      it('trusts the index locateAsync returns without re-reading images', async () => {
        const fake = createFakeUrlAdapter('?photo=late');

        renderUrl(
          {
            param: 'photo',
            adapter: fake.adapter,
            codec: idCodec,
            locator: {
              ...locateIn([]),
              locateAsync: async () => 2,
            },
          },
          [mockImages[0]],
        );

        await act(async () => {
          await flush();
        });

        expect(isOpen()).toBe(true);
        expect(lastReelProps.initialIndex).toBe(2);
      });

      it('drops the parameter when locateAsync rejects', async () => {
        const fake = createFakeUrlAdapter('?photo=boom');

        renderUrl({
          param: 'photo',
          adapter: fake.adapter,
          codec: idCodec,
          locator: {
            ...locateIn([]),
            locateAsync: () => Promise.reject(new Error('network')),
          },
        });

        await act(async () => {
          await flush();
        });

        expect(isOpen()).toBe(false);
        expect(fake.adapter.read()).toBe('');
      });

      it('ignores a locateAsync that settles after the url moved on', async () => {
        const fake = createFakeUrlAdapter('?photo=first');
        const first = createDeferred();
        const second = createDeferred();
        const gates = [first, second];
        const loaded: string[] = [];
        let call = 0;

        renderUrl({
          param: 'photo',
          adapter: fake.adapter,
          codec: idCodec,
          locator: {
            ...locateIn(loaded),
            locateAsync: async (id) => {
              await gates[call++].promise;
              loaded.push(id);
              return loaded.indexOf(id);
            },
          },
        });

        act(() => fake.adapter.push('?photo=second'));

        await act(async () => {
          first.resolve();
          await flush();
        });
        expect(isOpen()).toBe(false);

        await act(async () => {
          second.resolve();
          await flush();
        });

        expect(isOpen()).toBe(true);
        expect(lastReelProps.initialIndex).toBe(1);
      });

      it('ignores a locateAsync that settles after the parameter is cleared', async () => {
        const fake = createFakeUrlAdapter();
        const pending = createDeferred();
        const loaded: string[] = [];

        renderUrl({
          param: 'photo',
          adapter: fake.adapter,
          codec: idCodec,
          locator: {
            ...locateIn(loaded),
            locateAsync: async (id) => {
              await pending.promise;
              loaded.push(id);
              return loaded.indexOf(id);
            },
          },
        });

        act(() => fake.adapter.push('?photo=late'));
        act(() => fake.adapter.goBack());

        await act(async () => {
          pending.resolve();
          await flush();
        });

        expect(isOpen()).toBe(false);
      });

      it('ignores a locateAsync that settles after unmount', async () => {
        const fake = createFakeUrlAdapter('?photo=late');
        const pending = createDeferred();

        const { unmount } = renderUrl({
          param: 'photo',
          adapter: fake.adapter,
          codec: idCodec,
          locator: {
            ...locateIn([]),
            locateAsync: async () => {
              await pending.promise;
              return null;
            },
          },
        });

        unmount();

        await act(async () => {
          pending.resolve();
          await flush();
        });

        expect(fake.adapter.read()).toBe('?photo=late');
      });

      it('does not run the lookup again when the url changes while open', async () => {
        const fake = createFakeUrlAdapter('?photo=a');
        const locateAsync = vi.fn().mockResolvedValue(0);

        renderUrl({
          param: 'photo',
          adapter: fake.adapter,
          codec: idCodec,
          locator: { ...locateIn(['a', 'b']), locateAsync },
        });

        await act(async () => {
          await flush();
        });
        expect(isOpen()).toBe(true);
        expect(locateAsync).not.toHaveBeenCalled();

        act(() => fake.adapter.push('?photo=b'));

        expect(locateAsync).not.toHaveBeenCalled();
        expect(lastReelProps.initialIndex).toBe(0);
      });
    });

    it('resolves the index through a custom codec and locator', () => {
      const fake = createFakeUrlAdapter('?photo=img3');

      renderUrl({
        param: 'photo',
        adapter: fake.adapter,
        codec: { decode: (raw) => raw, encode: (id) => id },
        locator: {
          locate: (id) =>
            mockImages.findIndex((item) => item.src === `${id}.jpg`),
          identify: (index) => mockImages[index].src.replace('.jpg', ''),
        },
      });

      expect(isOpen()).toBe(true);
      expect(lastReelProps.initialIndex).toBe(2);
    });
  });
});
