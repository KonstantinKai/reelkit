import { useRef, useState } from 'react';
import { Observe, createSignal } from '@reelkit/react';
import {
  StoriesOverlay,
  StoriesRingList,
  createStoriesViewedStateController,
} from '@reelkit/react-stories-player';
import '@reelkit/react-stories-player/styles.css';
import { groups } from './api';

export default function StoriesTray() {
  const [{ open, startGroup, lastGroup, viewed }] = useState(() => ({
    open: createSignal(false),
    startGroup: createSignal(0),
    lastGroup: createSignal(0),
    // One controller for the rings and the player, kept in localStorage, so
    // what was seen survives a reload.
    viewed: createStoriesViewedStateController({
      storageKey: 'stories-tray-seen',
      groups: () => groups,
    }),
  }));
  const tray = useRef<HTMLDivElement>(null);

  const openAt = (groupIndex: number) => {
    startGroup.value = groupIndex;
    lastGroup.value = groupIndex;
    open.value = true;
  };

  const close = () => {
    open.value = false;
    // As it unmounts, the player hands focus back to the ring that opened it.
    // Wait one task for that, then move focus on to the ring of the person the
    // viewer stopped at, scrolled into view, so they continue from there.
    setTimeout(() => {
      const ring = tray.current
        ?.querySelectorAll<HTMLElement>('.rk-stories-ring-list-item')
        [lastGroup.value]?.querySelector<HTMLElement>('[role="button"]');
      ring?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
      ring?.focus({ preventScroll: true });
    });
  };

  return (
    <div style={{ padding: 16 }}>
      <div ref={tray}>
        <StoriesRingList groups={groups} viewed={viewed} onSelect={openAt} />
      </div>

      <button
        type="button"
        onClick={viewed.forget}
        style={{
          marginTop: 12,
          padding: '6px 14px',
          border: 'none',
          borderRadius: 8,
          background: 'rgba(255, 255, 255, 0.12)',
          color: 'inherit',
          fontSize: 13,
          cursor: 'pointer',
        }}
      >
        Forget what was seen
      </button>

      <Observe signals={[open]}>
        {() => (
          <StoriesOverlay
            isOpen={open.value}
            groups={groups}
            initialGroupIndex={startGroup.value}
            viewed={viewed}
            onGroupChange={(groupIndex) => (lastGroup.value = groupIndex)}
            onClose={close}
          />
        )}
      </Observe>
    </div>
  );
}
