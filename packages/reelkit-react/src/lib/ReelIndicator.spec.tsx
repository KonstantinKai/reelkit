import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { createSignal } from '@reelkit/core';
import { ReelIndicator } from './ReelIndicator';
import { ReelContext, type ReelContextValue } from './ReelContext';

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

      const dot1Inner = screen
        .getByTestId('indicator-dot-1')
        .querySelector('span')!;
      const dot0Inner = screen
        .getByTestId('indicator-dot-0')
        .querySelector('span')!;

      expect(dot1Inner.style.backgroundColor).toBe(activeColor);
      expect(dot0Inner.style.backgroundColor).toBe(inactiveColor);
    });

    it('uses default props', () => {
      render(<ReelIndicator count={3} active={0} />);

      const dot0Inner = screen
        .getByTestId('indicator-dot-0')
        .querySelector('span')!;
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
      render(
        <ReelIndicator count={10} active={3} visible={5} edgeScale={0.5} />,
      );

      // windowStart should be clamp(3 - 2, 0, 5) = 1
      // windowEnd = min(1+5, 10) = 6
      // renderStart = max(0, 1-1) = 0, so dot 0 is leading edge
      const edgeDot = screen
        .getByTestId('indicator-dot-0')
        .querySelector('span')!;
      expect(edgeDot.style.transform).toContain('scale(0.5)');
    });

    it('normal dots have scale 1', () => {
      render(<ReelIndicator count={10} active={3} visible={5} />);

      const activeDot = screen
        .getByTestId('indicator-dot-3')
        .querySelector('span')!;
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

      const innerDot = container.querySelector(
        '[data-reel-indicator="0"] span',
      )!;
      expect((innerDot as HTMLElement).style.cursor).toBe('pointer');
    });

    it('sets cursor to default when onDotClick is not provided', () => {
      const { container } = render(<ReelIndicator count={3} active={0} />);

      const innerDot = container.querySelector(
        '[data-reel-indicator="0"] span',
      )!;
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

  describe('context auto-connect', () => {
    function createMockContext(
      index = 0,
      count = 3,
    ): ReelContextValue & {
      indexSignal: ReturnType<typeof createSignal<number>>;
      countSignal: ReturnType<typeof createSignal<number>>;
    } {
      const indexSignal = createSignal(index);
      const countSignal = createSignal(count);
      return {
        index: indexSignal,
        count: countSignal,
        goTo: vi.fn(() => Promise.resolve()),
        indexSignal,
        countSignal,
      };
    }

    it('reads active and count from context when props omitted', () => {
      const ctx = createMockContext(1, 4);

      render(
        <ReelContext.Provider value={ctx}>
          <ReelIndicator />
        </ReelContext.Provider>,
      );

      // Should render 4 dots with index 1 active
      expect(screen.getByTestId('indicator-dot-0')).toBeTruthy();
      expect(screen.getByTestId('indicator-dot-3')).toBeTruthy();
      expect(screen.queryByTestId('indicator-dot-4')).toBeNull();
    });

    it('explicit props take precedence over context', () => {
      const ctx = createMockContext(0, 10);

      render(
        <ReelContext.Provider value={ctx}>
          <ReelIndicator count={2} active={1} />
        </ReelContext.Provider>,
      );

      // Should render 2 dots, not 10
      expect(screen.getByTestId('indicator-dot-0')).toBeTruthy();
      expect(screen.getByTestId('indicator-dot-1')).toBeTruthy();
      expect(screen.queryByTestId('indicator-dot-2')).toBeNull();
    });

    it('throws when rendered without context and without active prop', () => {
      expect(() => {
        render(<ReelIndicator count={3} />);
      }).toThrow('ReelIndicator: "active" prop is required');
    });

    it('throws when rendered without context and without count prop', () => {
      expect(() => {
        render(<ReelIndicator active={0} />);
      }).toThrow('ReelIndicator: "count" prop is required');
    });

    it('re-renders when context index signal changes', () => {
      const ctx = createMockContext(0, 3);
      const activeColor = 'rgb(255, 0, 0)';
      const inactiveColor = 'rgb(0, 0, 255)';

      render(
        <ReelContext.Provider value={ctx}>
          <ReelIndicator
            activeColor={activeColor}
            inactiveColor={inactiveColor}
          />
        </ReelContext.Provider>,
      );

      // Dot 0 should be active initially
      const dot0 = screen.getByTestId('indicator-dot-0').querySelector('span')!;
      expect(dot0.style.backgroundColor).toBe(activeColor);

      // Update signal
      act(() => {
        ctx.indexSignal.value = 2;
      });

      // Dot 2 should now be active
      const dot2 = screen.getByTestId('indicator-dot-2').querySelector('span')!;
      expect(dot2.style.backgroundColor).toBe(activeColor);
      expect(dot0.style.backgroundColor).toBe(inactiveColor);
    });

    it('auto-wires onDotClick to context goTo', () => {
      const ctx = createMockContext(0, 3);

      render(
        <ReelContext.Provider value={ctx}>
          <ReelIndicator />
        </ReelContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('indicator-dot-2'));
      expect(ctx.goTo).toHaveBeenCalledWith(2, true);
    });

    it('explicit onDotClick overrides context goTo', () => {
      const ctx = createMockContext(0, 3);
      const customHandler = vi.fn();

      render(
        <ReelContext.Provider value={ctx}>
          <ReelIndicator onDotClick={customHandler} />
        </ReelContext.Provider>,
      );

      fireEvent.click(screen.getByTestId('indicator-dot-1'));
      expect(customHandler).toHaveBeenCalledWith(1);
      expect(ctx.goTo).not.toHaveBeenCalled();
    });
  });

  describe('accessibility', () => {
    it('container has role=tablist', () => {
      render(<ReelIndicator count={3} active={0} />);

      expect(screen.getByRole('tablist')).toBeTruthy();
    });

    it('container has aria-label', () => {
      render(<ReelIndicator count={3} active={0} />);

      expect(screen.getByRole('tablist').getAttribute('aria-label')).toBe(
        'Slide navigation',
      );
    });

    it('dots have role=tab', () => {
      render(<ReelIndicator count={3} active={0} />);

      const tabs = screen.getAllByRole('tab');
      expect(tabs.length).toBeGreaterThan(0);
    });

    it('active dot has aria-selected=true', () => {
      render(<ReelIndicator count={3} active={1} />);

      const dot1 = screen.getByTestId('indicator-dot-1');
      expect(dot1.getAttribute('aria-selected')).toBe('true');

      const dot0 = screen.getByTestId('indicator-dot-0');
      expect(dot0.getAttribute('aria-selected')).toBe('false');
    });

    it('active dot has tabindex=0, others have -1', () => {
      render(<ReelIndicator count={3} active={1} />);

      const dot1 = screen.getByTestId('indicator-dot-1');
      expect(dot1.getAttribute('tabindex')).toBe('0');

      const dot0 = screen.getByTestId('indicator-dot-0');
      expect(dot0.getAttribute('tabindex')).toBe('-1');
    });

    it('dots have aria-label', () => {
      render(<ReelIndicator count={3} active={0} />);

      const dot0 = screen.getByTestId('indicator-dot-0');
      expect(dot0.getAttribute('aria-label')).toBe('Slide 1');
    });

    it('Enter key activates dot', () => {
      const onDotClick = vi.fn();
      render(<ReelIndicator count={3} active={0} onDotClick={onDotClick} />);

      fireEvent.keyDown(screen.getByTestId('indicator-dot-1'), {
        key: 'Enter',
      });
      expect(onDotClick).toHaveBeenCalledWith(1);
    });

    it('Space key activates dot', () => {
      const onDotClick = vi.fn();
      render(<ReelIndicator count={3} active={0} onDotClick={onDotClick} />);

      fireEvent.keyDown(screen.getByTestId('indicator-dot-1'), { key: ' ' });
      expect(onDotClick).toHaveBeenCalledWith(1);
    });

    it('ArrowDown navigates to next dot (vertical)', () => {
      const onDotClick = vi.fn();
      render(
        <ReelIndicator
          count={5}
          active={1}
          direction="vertical"
          onDotClick={onDotClick}
        />,
      );

      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowDown' });
      expect(onDotClick).toHaveBeenCalledWith(2);
    });

    it('ArrowUp navigates to previous dot (vertical)', () => {
      const onDotClick = vi.fn();
      render(
        <ReelIndicator
          count={5}
          active={2}
          direction="vertical"
          onDotClick={onDotClick}
        />,
      );

      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowUp' });
      expect(onDotClick).toHaveBeenCalledWith(1);
    });

    it('ArrowRight navigates to next dot (horizontal)', () => {
      const onDotClick = vi.fn();
      render(
        <ReelIndicator
          count={5}
          active={1}
          direction="horizontal"
          onDotClick={onDotClick}
        />,
      );

      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowRight' });
      expect(onDotClick).toHaveBeenCalledWith(2);
    });

    it('Home key navigates to first dot', () => {
      const onDotClick = vi.fn();
      render(<ReelIndicator count={5} active={3} onDotClick={onDotClick} />);

      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'Home' });
      expect(onDotClick).toHaveBeenCalledWith(0);
    });

    it('End key navigates to last dot', () => {
      const onDotClick = vi.fn();
      render(<ReelIndicator count={5} active={1} onDotClick={onDotClick} />);

      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'End' });
      expect(onDotClick).toHaveBeenCalledWith(4);
    });

    it('ArrowUp clamps at 0', () => {
      const onDotClick = vi.fn();
      render(
        <ReelIndicator
          count={5}
          active={0}
          direction="vertical"
          onDotClick={onDotClick}
        />,
      );

      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'ArrowUp' });
      expect(onDotClick).toHaveBeenCalledWith(0);
    });

    it('unrelated keys are ignored', () => {
      const onDotClick = vi.fn();
      render(<ReelIndicator count={5} active={1} onDotClick={onDotClick} />);

      fireEvent.keyDown(screen.getByRole('tablist'), { key: 'a' });
      expect(onDotClick).not.toHaveBeenCalled();
    });
  });
});
