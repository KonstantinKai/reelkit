import { Observe, type Signal } from '@reelkit/react';
import { Segmented } from './Segmented';

/**
 * On/off switch for remembering which stories were seen. Off, a page behaves
 * as if nothing had ever been seen: rings all unseen, every group opens on its
 * first story, nothing recorded. The store stays attached, so switching back
 * on shows what was stored all along.
 */
export const RememberSeenSwitch = ({ signal }: { signal: Signal<boolean> }) => (
  <Observe signals={[signal]}>
    {() => (
      <Segmented
        legend="Remember seen"
        options={[true, false].map((remember) => ({
          label: remember ? 'On' : 'Off',
          active: signal.value === remember,
          onClick: () => (signal.value = remember),
        }))}
      />
    )}
  </Observe>
);
