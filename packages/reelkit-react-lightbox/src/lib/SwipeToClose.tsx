import * as React from 'react';
import { createSignal, createGestureController, type GestureController } from '@reelkit/core';
import { ValueNotifierObserver } from '@reelkit/react';

export interface SwipeToCloseProps {
  enabled: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

export const SwipeToClose: React.FC<SwipeToCloseProps> = ({
  enabled,
  onClose,
  children,
  className,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const gestureControllerRef = React.useRef<GestureController | null>(null);

  const [dragOffset, opacity, isTransitioning] = React.useState(() => [
    createSignal(0),
    createSignal(1),
    createSignal(false),
  ] as const)[0];

  // Track if vertical drag end was handled
  const verticalDragEndHandledRef = React.useRef(false);

  React.useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const height = window.innerHeight;
    const threshold = height * 0.2; // 20% of screen height

    const resetToOriginalPosition = () => {
      isTransitioning.value = true;
      dragOffset.value = 0;
      opacity.value = 1;
      setTimeout(() => {
        isTransitioning.value = false;
      }, 300);
    };

    const controller = createGestureController(
      { useTouchEventsOnly: true },
      {
        onVerticalDragStart: () => {
          verticalDragEndHandledRef.current = false;
        },
        onVerticalDragUpdate: (event) => {
          const { primaryDistance } = event;
          // Only handle upward swipes (negative distance)
          if (primaryDistance < 0) {
            dragOffset.value = primaryDistance;
            const progress = Math.min(Math.abs(primaryDistance) / (height * 0.3), 1);
            opacity.value = 1 - progress * 0.8;
          }
        },
        onVerticalDragEnd: (event) => {
          verticalDragEndHandledRef.current = true;
          const { primaryDistance } = event;

          if (primaryDistance < 0 && Math.abs(primaryDistance) > threshold) {
            // Close with animation
            isTransitioning.value = true;
            dragOffset.value = -height;
            opacity.value = 0;
            setTimeout(onClose, 300);
          } else {
            resetToOriginalPosition();
          }
        },
        // Fallback: reset if vertical drag started but onVerticalDragEnd wasn't called
        // (happens when last delta direction differs from overall drag direction)
        onDragEnd: () => {
          if (!verticalDragEndHandledRef.current && dragOffset.value !== 0) {
            resetToOriginalPosition();
          }
        },
      }
    );

    controller.attach(containerRef.current);
    controller.observe();
    gestureControllerRef.current = controller;

    return () => {
      controller.unobserve();
      controller.detach();
      gestureControllerRef.current = null;
    };
  }, [enabled, onClose, dragOffset, opacity, isTransitioning]);

  return (
    <ValueNotifierObserver deps={[dragOffset, opacity, isTransitioning]}>
      {() => (
        <div
          ref={containerRef}
          className={className}
          style={{
            transform: `translateY(${dragOffset.value}px)`,
            opacity: opacity.value,
            transition: isTransitioning.value
              ? 'transform 300ms ease-out, opacity 300ms ease-out'
              : 'none',
          }}
        >
          {children}
        </div>
      )}
    </ValueNotifierObserver>
  );
};
