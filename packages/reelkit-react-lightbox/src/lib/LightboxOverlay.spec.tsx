import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { LightboxItem } from './LightboxOverlay';

// Track Reel props
let lastReelProps: Record<string, unknown> = {};

vi.mock('@reelkit/react', () => ({
  Reel: (props: Record<string, unknown>) => {
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
    const itemBuilder = props.itemBuilder as
      | ((
          index: number,
          key: number,
          size: [number, number],
        ) => React.ReactNode)
      | undefined;
    return (
      <div data-testid="mock-reel">
        {itemBuilder && itemBuilder(0, 0, [1024, 768])}
      </div>
    );
  },
  useBodyLock: vi.fn(),
}));

// Mock useFullscreen
const mockRequestFullscreen = vi.fn();
const mockExitFullscreen = vi.fn();
let mockIsFullscreen = false;

vi.mock('./useFullscreen', () => ({
  default: () => [mockIsFullscreen, mockRequestFullscreen, mockExitFullscreen],
}));

vi.mock('./SwipeToClose', () => ({
  SwipeToClose: ({
    children,
    enabled,
  }: {
    children: React.ReactNode;
    enabled: boolean;
  }) => (
    <div data-testid="mock-swipe-to-close" data-enabled={enabled}>
      {children}
    </div>
  ),
}));

vi.mock('lucide-react', () => ({
  X: () => <span>X</span>,
  Maximize: () => <span>Maximize</span>,
  Minimize: () => <span>Minimize</span>,
  ChevronLeft: () => <span>Left</span>,
  ChevronRight: () => <span>Right</span>,
}));

// eslint-disable-next-line import/first
import { LightboxOverlay } from './LightboxOverlay';

const mockImages: LightboxItem[] = [
  { src: 'img1.jpg', title: 'Image 1', description: 'First image' },
  { src: 'img2.jpg', title: 'Image 2' },
  { src: 'img3.jpg' },
];

describe('LightboxOverlay', () => {
  beforeEach(() => {
    lastReelProps = {};
    mockIsFullscreen = false;
    mockRequestFullscreen.mockClear();
    mockExitFullscreen.mockClear();

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
    delete (window as Record<string, unknown>)['ontouchstart'];
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

      expect(document.querySelector('.lightbox-container')).toBeTruthy();
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
      mockIsFullscreen = true;
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

      const counter = document.querySelector('.lightbox-counter');
      expect(counter).toBeTruthy();
      expect(counter!.textContent).toBe('1 / 3');
    });

    it('updates counter on slide change', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const afterChange = lastReelProps.afterChange as (index: number) => void;
      act(() => afterChange(2));

      const counter = document.querySelector('.lightbox-counter');
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

      const ref = lastReelProps.apiRef as {
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
      mockIsFullscreen = true;

      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      expect(screen.getByTitle('Exit Fullscreen')).toBeTruthy();
    });

    it('calls requestFullscreen on toggle when not fullscreen', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      fireEvent.click(screen.getByTitle('Enter Fullscreen'));

      expect(mockRequestFullscreen).toHaveBeenCalled();
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

      const title = document.querySelector('.lightbox-title');
      expect(title).toBeTruthy();
      expect(title!.textContent).toBe('Image 1');
    });

    it('shows description when available', () => {
      render(
        <LightboxOverlay isOpen={true} images={mockImages} onClose={vi.fn()} />,
      );

      const desc = document.querySelector('.lightbox-description');
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

      expect(document.querySelector('.lightbox-info')).toBeNull();
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

      expect(document.querySelector('.lightbox-swipe-hint')).toBeTruthy();
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

      expect(document.querySelector('.lightbox-counter')).toBeNull();
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

      expect(renderControls).toHaveBeenCalledWith({
        onClose: expect.any(Function),
        currentIndex: 0,
        count: 3,
        isFullscreen: false,
        onToggleFullscreen: expect.any(Function),
      });
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

      expect(renderNavigation).toHaveBeenCalledWith({
        onPrev: expect.any(Function),
        onNext: expect.any(Function),
        activeIndex: 0,
        count: 3,
      });
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

      expect(document.querySelector('.lightbox-info')).toBeNull();
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

  describe('renderSlide', () => {
    it('renders custom slide when returning non-null', () => {
      render(
        <LightboxOverlay
          isOpen={true}
          images={mockImages}
          onClose={vi.fn()}
          renderSlide={(item) => (
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
      const img = document.querySelector('.lightbox-img');
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

      expect(document.querySelector('.lightbox-img')).toBeNull();
    });
  });
});
