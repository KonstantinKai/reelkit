import { AnimatedObserve } from '@reelkit/react';

<AnimatedObserve signal={controller.state.axisValue}>
  {(value) => (
    <div style={{ transform: `translateY(${value}px)` }} />
  )}
</AnimatedObserve>
