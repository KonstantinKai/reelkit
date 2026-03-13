import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ContentItem } from './types';

// Track Reel props
let lastReelProps: Record<string, unknown> = {};

vi.mock('@reelkit/react', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reelkit/react')>();
  return {
    ...actual,
    Reel: (props: Record<string, unknown>) => {
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
      const itemBuilder = props.itemBuilder as
        | ((
            index: number,
            key: string,
            size: [number, number],
          ) => React.ReactNode)
        | undefined;
      return (
        <div data-testid="mock-reel">
          {itemBuilder && itemBuilder(0, '0', [400, 700])}
        </div>
      );
    },
    useBodyLock: vi.fn(),
  };
});

let lastMediaSlideProps: Record<string, unknown> = {};

vi.mock('./MediaSlide', () => ({
  default: (props: Record<string, unknown>) => {
    lastMediaSlideProps = props;
    return <div data-testid="mock-media-slide" />;
  },
}));

vi.mock('./PlayerControls', () => ({
  default: ({
    onClose,
    showSound,
    soundDisabled,
  }: {
    onClose: () => void;

    showSound: boolean;

    soundDisabled: boolean;
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

      const ref = lastReelProps.apiRef as {
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

      const ref = lastReelProps.apiRef as {
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
});
