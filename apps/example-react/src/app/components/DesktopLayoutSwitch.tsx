import { Observe, type Signal } from '@reelkit/react';
import type { DesktopLayout } from '@reelkit/react-stories-player';
import { Segmented } from './Segmented';

/** Switch between the single story and the carousel layout on desktop. */
export const DesktopLayoutSwitch = ({
  signal,
}: {
  signal: Signal<DesktopLayout>;
}) => (
  <Observe signals={[signal]}>
    {() => (
      <Segmented
        legend="Desktop layout"
        options={(['single', 'carousel'] as const).map((layout) => ({
          label: layout === 'single' ? 'Single' : 'Carousel',
          active: signal.value === layout,
          onClick: () => (signal.value = layout),
        }))}
      />
    )}
  </Observe>
);
