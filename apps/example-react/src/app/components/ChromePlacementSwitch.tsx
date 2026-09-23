import { Observe, type Signal } from '@reelkit/react';
import type { ChromePlacement } from '@reelkit/react-stories-player';
import { Segmented } from './Segmented';

/**
 * Switch between one progress bar and header above the player and a copy
 * inside every group, which turns with the group the way Instagram does it.
 */
export const ChromePlacementSwitch = ({
  signal,
}: {
  signal: Signal<ChromePlacement>;
}) => (
  <Observe signals={[signal]}>
    {() => (
      <Segmented
        legend="Progress & header"
        options={(['overlay', 'group'] as const).map((placement) => ({
          label: placement === 'overlay' ? 'Overlay' : 'Group',
          active: signal.value === placement,
          onClick: () => (signal.value = placement),
        }))}
      />
    )}
  </Observe>
);
