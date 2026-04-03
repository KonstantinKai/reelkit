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

    const loop = () => {
      draw();
      frameRef.current = requestAnimationFrame(loop);
    };

    disposables.push(
      reaction(() => [activeIndex], draw),
      () => cancelAnimationFrame(frameRef.current),
      renderer.dispose,
    );

    frameRef.current = requestAnimationFrame(loop);

    return disposables.dispose;
  }, [totalStories]);

  return (
    <div
      style={{
        padding: '8px 8px 0',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
      }}
    >
      <canvas ref={canvasRef} />
    </div>
  );
};
