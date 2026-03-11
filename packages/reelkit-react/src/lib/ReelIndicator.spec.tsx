import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ReelIndicator } from './ReelIndicator';

describe('ReelIndicator', () => {
  describe('rendering', () => {
    it('renders correct number of dots when count <= visible', () => {
      render(<ReelIndicator count={3} active={0} />);

      expect(screen.getByTestId('indicator-dot-0')).toBeTruthy();
      expect(screen.getByTestId('indicator-dot-1')).toBeTruthy();
      expect(screen.getByTestId('indicator-dot-2')).toBeTruthy();
      expect(screen.queryByTestId('indicator-dot-3')).toBeNull();
    });

    it('applies active color to the active dot', () => {
      const activeColor = 'rgb(255, 0, 0)';
      const inactiveColor = 'rgb(0, 0, 255)';

      render(
        <ReelIndicator
          count={3}
          active={1}
          activeColor={activeColor}
          inactiveColor={inactiveColor}
        />,
      );

      const dot1Inner = screen.getByTestId('indicator-dot-1').querySelector('span')!;
      const dot0Inner = screen.getByTestId('indicator-dot-0').querySelector('span')!;

      expect(dot1Inner.style.backgroundColor).toBe(activeColor);
      expect(dot0Inner.style.backgroundColor).toBe(inactiveColor);
    });

    it('uses default props', () => {
      render(<ReelIndicator count={3} active={0} />);

      const dot0Inner = screen.getByTestId('indicator-dot-0').querySelector('span')!;
      // Default activeColor is #fff (normalized to rgb by jsdom)
      expect(dot0Inner.style.backgroundColor).toBe('rgb(255, 255, 255)');
    });

    it('renders vertically by default', () => {
      const { container } = render(<ReelIndicator count={3} active={0} />);

      const root = container.firstElementChild as HTMLElement;
      // Vertical: height is the primary dimension
      expect(root.style.height).toBeTruthy();
    });

    it('renders horizontally when direction is horizontal', () => {
      const { container } = render(
        <ReelIndicator count={3} active={0} direction="horizontal" />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.style.width).toBeTruthy();
    });

    it('applies className and style', () => {
      const { container } = render(
        <ReelIndicator
          count={3}
          active={0}
          className="custom-class"
          style={{ margin: '10px' }}
        />,
      );

      const root = container.firstElementChild as HTMLElement;
      expect(root.className).toBe('custom-class');
      expect(root.style.margin).toBe('10px');
    });
  });

  describe('windowing', () => {
    it('centers active dot in window initially', () => {
      render(<ReelIndicator count={10} active={5} visible={5} />);

      // Active=5, visible=5, windowStart = clamp(5 - 2, 0, 5) = 3
      // Renders from max(0, 3-1)=2 to min(10, 8+1)=9
      expect(screen.getByTestId('indicator-dot-5')).toBeTruthy();
    });

    it('slides window forward when active moves past window end', () => {
      const { rerender } = render(
        <ReelIndicator count={10} active={0} visible={5} />,
      );

      // Move active to 5 (past visible window 0-4)
      rerender(<ReelIndicator count={10} active={5} visible={5} />);

      expect(screen.getByTestId('indicator-dot-5')).toBeTruthy();
    });

    it('slides window backward when active moves before window start', () => {
      const { rerender } = render(
        <ReelIndicator count={10} active={5} visible={5} />,
      );

      rerender(<ReelIndicator count={10} active={1} visible={5} />);

      expect(screen.getByTestId('indicator-dot-1')).toBeTruthy();
    });

    it('edge dots have reduced scale', () => {
      render(<ReelIndicator count={10} active={3} visible={5} edgeScale={0.5} />);

      // windowStart should be clamp(3 - 2, 0, 5) = 1
      // windowEnd = min(1+5, 10) = 6
      // renderStart = max(0, 1-1) = 0, so dot 0 is leading edge
      const edgeDot = screen.getByTestId('indicator-dot-0').querySelector('span')!;
      expect(edgeDot.style.transform).toContain('scale(0.5)');
    });

    it('normal dots have scale 1', () => {
      render(<ReelIndicator count={10} active={3} visible={5} />);

      const activeDot = screen.getByTestId('indicator-dot-3').querySelector('span')!;
      expect(activeDot.style.transform).toContain('scale(1)');
    });

    it('does not show edge dots when count <= visible', () => {
      render(<ReelIndicator count={3} active={0} visible={5} />);

      // All 3 dots are visible, no edge dots
      const dots = screen.getAllByTestId(/^indicator-dot-/);
      expect(dots).toHaveLength(3);
    });
  });

  describe('interaction', () => {
    it('calls onDotClick with correct index', () => {
      const onDotClick = vi.fn();

      render(<ReelIndicator count={5} active={0} onDotClick={onDotClick} />);

      fireEvent.click(screen.getByTestId('indicator-dot-2'));

      expect(onDotClick).toHaveBeenCalledWith(2);
    });

    it('does not call onDotClick when not provided', () => {
      render(<ReelIndicator count={5} active={0} />);

      // Should not throw
      fireEvent.click(screen.getByTestId('indicator-dot-1'));
    });

    it('sets cursor to pointer when onDotClick is provided', () => {
      const { container } = render(
        <ReelIndicator count={3} active={0} onDotClick={vi.fn()} />,
      );

      const innerDot = container.querySelector('[data-reel-indicator="0"] span')!;
      expect((innerDot as HTMLElement).style.cursor).toBe('pointer');
    });

    it('sets cursor to default when onDotClick is not provided', () => {
      const { container } = render(
        <ReelIndicator count={3} active={0} />,
      );

      const innerDot = container.querySelector('[data-reel-indicator="0"] span')!;
      expect((innerDot as HTMLElement).style.cursor).toBe('default');
    });
  });

  describe('data attributes', () => {
    it('adds data-testid to each dot', () => {
      render(<ReelIndicator count={3} active={0} />);

      expect(screen.getByTestId('indicator-dot-0')).toBeTruthy();
      expect(screen.getByTestId('indicator-dot-1')).toBeTruthy();
      expect(screen.getByTestId('indicator-dot-2')).toBeTruthy();
    });

    it('adds data-reel-indicator attribute with index', () => {
      const { container } = render(<ReelIndicator count={3} active={0} />);

      expect(container.querySelector('[data-reel-indicator="0"]')).toBeTruthy();
      expect(container.querySelector('[data-reel-indicator="1"]')).toBeTruthy();
      expect(container.querySelector('[data-reel-indicator="2"]')).toBeTruthy();
    });
  });
});
