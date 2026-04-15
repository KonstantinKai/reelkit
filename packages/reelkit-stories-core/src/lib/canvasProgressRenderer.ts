import { getVisibleWindow } from './progress';

/** Configuration for {@link createCanvasProgressRenderer}. */
export interface CanvasProgressRendererConfig {
  /**
   * Gap in pixels between segments.
   * @default 2
   */
  gap?: number;

  /**
   * Bar height in pixels.
   * @default 2
   */
  barHeight?: number;

  /**
   * Minimum width in pixels for each segment before the sliding window kicks in.
   * @default 8
   */
  minSegmentWidth?: number;

  /** Background color of unfilled segments. */
  bgColor?: string;

  /** Fill color of completed/active segments. */
  fillColor?: string;
}

/** Framework-agnostic canvas progress bar renderer returned by {@link createCanvasProgressRenderer}. */
export interface CanvasProgressRenderer {
  /** Attach to a canvas element and start measuring its parent via ResizeObserver. */
  attach(canvas: HTMLCanvasElement): void;

  /** Draw the progress bar for the given state. */
  draw(totalStories: number, activeIndex: number, progress: number): void;

  /** Current measured width in CSS pixels. */
  readonly width: number;

  /** Clean up ResizeObserver and internal state. */
  dispose(): void;
}

/**
 * Framework-agnostic canvas progress bar renderer.
 *
 * Handles DPR scaling, ResizeObserver-based sizing, and the sliding
 * window layout via {@link getVisibleWindow}. Call {@link draw} on each
 * animation frame with the current state.
 */
export function createCanvasProgressRenderer(
  config?: CanvasProgressRendererConfig,
): CanvasProgressRenderer {
  const gap = config?.gap ?? 2;
  const barHeight = config?.barHeight ?? 2;
  const minSegmentWidth = config?.minSegmentWidth ?? 8;
  const bgColor = config?.bgColor ?? 'rgba(255, 255, 255, 0.3)';
  const fillColor = config?.fillColor ?? '#ffffff';

  let _canvas: HTMLCanvasElement | null = null;
  let _ctx: CanvasRenderingContext2D | null = null;
  let _observer: ResizeObserver | null = null;
  let _width = 0;

  const getDpr = (): number =>
    (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

  function measure(): void {
    if (!_canvas || !_canvas.parentElement) return;
    const parent = _canvas.parentElement;

    const style = getComputedStyle(parent);
    const pl = parseFloat(style.paddingLeft) || 0;
    const pr = parseFloat(style.paddingRight) || 0;
    const w = parent.clientWidth - pl - pr;

    if (w > 0 && w !== _width) {
      _width = w;
      const dpr = getDpr();
      _canvas.width = w * dpr;
      _canvas.height = barHeight * dpr;
      _canvas.style.width = `${w}px`;
      _canvas.style.height = `${barHeight}px`;
    }
  }

  return {
    get width(): number {
      return _width;
    },

    attach(canvas: HTMLCanvasElement): void {
      _canvas = canvas;
      _ctx = canvas.getContext('2d');

      measure();

      const parent = canvas.parentElement;
      if (parent) {
        _observer = new ResizeObserver(measure);
        _observer.observe(parent);
      }
    },

    draw(totalStories: number, activeIndex: number, progress: number): void {
      if (!_ctx || !_canvas || _width === 0) return;

      const dpr = getDpr();

      _ctx.clearRect(0, 0, _canvas.width, _canvas.height);

      const maxVisible = Math.floor((_width + gap) / (minSegmentWidth + gap));
      const needsWindow = totalStories > maxVisible && _width > 0;

      let startIndex = 0;
      let count = totalStories;

      if (needsWindow) {
        const win = getVisibleWindow(
          totalStories,
          activeIndex,
          0,
          _width,
          minSegmentWidth,
          gap,
        );
        startIndex = win.startIndex;
        count = win.segments.length;
      }

      const segWidth = (_width - gap * (count - 1)) / count;
      const h = barHeight * dpr;
      const r = Math.min(h / 2, 1 * dpr);

      for (let i = 0; i < count; i++) {
        const absIndex = startIndex + i;
        const x = i * (segWidth + gap) * dpr;
        const sw = segWidth * dpr;

        _ctx.fillStyle = bgColor;
        _ctx.beginPath();
        _ctx.roundRect(x, 0, sw, h, r);
        _ctx.fill();

        let fillWidth = 0;
        if (absIndex < activeIndex) {
          fillWidth = sw;
        } else if (absIndex === activeIndex) {
          fillWidth = sw * progress;
        }

        if (fillWidth > 0) {
          _ctx.fillStyle = fillColor;
          _ctx.beginPath();
          _ctx.roundRect(x, 0, fillWidth, h, r);
          _ctx.fill();
        }
      }
    },

    dispose(): void {
      _observer?.disconnect();
      _observer = null;
      _canvas = null;
      _ctx = null;
      _width = 0;
    },
  };
}
