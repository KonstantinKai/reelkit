/* eslint-disable react-hooks/exhaustive-deps */
import { useRef, useState, useEffect, type FC } from 'react';
import { createDisposableList, reaction, type Signal } from '@reelkit/react';
import { createCanvasProgressRenderer } from '@reelkit/stories-core';
import type { CanvasProgressRendererConfig } from '@reelkit/stories-core';

/** Props for the {@link CanvasProgressBar} component. */
export interface CanvasProgressBarProps extends CanvasProgressRendererConfig {
  /** Total number of stories (segments) in the current group. */
  totalStories: number;

  /** Active story index signal. */
  activeIndex: Signal<number>;

  /** Timer progress signal (0–1). */
  progress: Signal<number>;

  /**
   * Whether the bar redraws on every animation frame to follow a running
   * timer. A bar that is not live draws only when its signals change or its
   * container resizes, which is all a bar showing a paused group needs.
   *
   * @default true
   */
  live?: boolean;
}

/**
 * Canvas-rendered segmented progress bar for Instagram-style stories.
 *
 * Thin React wrapper around the framework-agnostic
 * {@link createCanvasProgressRenderer} from `@reelkit/stories-core`.
 */
export const CanvasProgressBar: FC<CanvasProgressBarProps> = ({
  totalStories,
  activeIndex,
  progress,
  live = true,
  ...config
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const [renderer] = useState(() => createCanvasProgressRenderer(config));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const disposables = createDisposableList();

    renderer.attach(canvas);

    const draw = () => {
      renderer.draw(totalStories, activeIndex.value, progress.value);
    };

    if (live) {
      const loop = () => {
        draw();
        frameRef.current = requestAnimationFrame(loop);
      };

      disposables.push(
        reaction(() => [activeIndex], draw),
        () => cancelAnimationFrame(frameRef.current),
      );

      frameRef.current = requestAnimationFrame(loop);
    } else {
      // Resizing the canvas clears it. This observer is created after the
      // renderer's own, and observers are notified in the order they were
      // created, so the bar is repainted after the renderer has measured.
      const resizeObserver = new ResizeObserver(draw);
      if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

      disposables.push(
        reaction(() => [activeIndex, progress], draw),
        () => resizeObserver.disconnect(),
      );

      draw();
    }

    disposables.push(renderer.dispose);

    return disposables.dispose;
  }, [totalStories, activeIndex, progress, live]);

  return (
    <div className="rk-stories-progress-bar">
      <canvas ref={canvasRef} />
    </div>
  );
};
