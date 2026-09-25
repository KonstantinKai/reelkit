import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick } from 'vue';
import { TimelineBar } from './TimelineBar';
import { TimelineProvider, useTimelineState } from './useTimelineState';
import { shared } from './VideoSlide';

type Timeline = ReturnType<typeof useTimelineState>;

const mountBar = (props: Record<string, unknown> = {}) => {
  let timeline: Timeline | undefined;
  const Probe = defineComponent({
    setup() {
      timeline = useTimelineState();
      return () => h(TimelineBar, props);
    },
  });
  const wrapper = mount(
    defineComponent({
      setup: () => () =>
        h(TimelineProvider, null, { default: () => [h(Probe)] }),
    }),
    { attachTo: document.body },
  );
  const track = () =>
    wrapper.find('.rk-reel-timeline-track').element as HTMLElement;
  return { wrapper, timeline: () => timeline!, track };
};

// The provider pauses and resumes the one video every slide shares, so the
// tests drive that element and describe it the way a loaded video looks.
const stubSharedVideo = (overrides: {
  duration: number;
  currentTime?: number;
  paused?: boolean;
}) => {
  const video = shared.getVideo();
  Object.defineProperty(video, 'duration', {
    configurable: true,
    value: overrides.duration,
  });
  Object.defineProperty(video, 'currentTime', {
    configurable: true,
    writable: true,
    value: overrides.currentTime ?? 0,
  });
  Object.defineProperty(video, 'paused', {
    configurable: true,
    writable: true,
    value: overrides.paused ?? true,
  });
  return video;
};

const pointer = (type: string, clientX: number) => {
  const event = new MouseEvent(type, { bubbles: true, clientX });
  Object.defineProperty(event, 'pointerId', { value: 1 });
  return event;
};

afterEach(() => {
  const video = shared.getVideo();
  for (const key of ['duration', 'currentTime', 'paused']) {
    delete (video as unknown as Record<string, unknown>)[key];
  }
  vi.restoreAllMocks();
  document.body.innerHTML = '';
});

describe('TimelineBar', () => {
  it('renders a seek slider with empty values before any video attaches', () => {
    const { track } = mountBar();

    expect(track().getAttribute('role')).toBe('slider');
    expect(track().getAttribute('aria-label')).toBe('Seek');
    expect(track().getAttribute('aria-valuemax')).toBe('0');
    expect(track().getAttribute('aria-valuenow')).toBe('0');
    expect(track().getAttribute('aria-valuetext')).toBe('');
  });

  it('reports duration, position and a readable time once a video attaches', async () => {
    const { timeline, track } = mountBar();
    timeline().attach(stubSharedVideo({ duration: 100, currentTime: 65 }));
    await nextTick();

    expect(track().getAttribute('aria-valuemax')).toBe('100');
    expect(track().getAttribute('aria-valuenow')).toBe('65');
    expect(track().getAttribute('aria-valuetext')).toBe('1:05');
  });

  it('fills the track up to the current progress', async () => {
    const { wrapper, timeline } = mountBar();
    timeline().attach(stubSharedVideo({ duration: 200, currentTime: 50 }));
    await nextTick();

    const fill = wrapper.find('.rk-reel-timeline-fill').element as HTMLElement;
    const cursor = wrapper.find('.rk-reel-timeline-cursor')
      .element as HTMLElement;
    expect(fill.style.width).toBe('25%');
    expect(cursor.style.left).toBe('25%');
  });

  it('draws one segment per buffered range', async () => {
    const { wrapper, timeline } = mountBar();
    timeline().bufferedRanges.value = [
      { start: 0, end: 0.25 },
      { start: 0.5, end: 0.75 },
    ];
    await nextTick();

    const segments = wrapper.findAll('.rk-reel-timeline-buffered');
    expect(segments).toHaveLength(2);
    expect((segments[1].element as HTMLElement).style.left).toBe('50%');
    expect((segments[1].element as HTMLElement).style.width).toBe('25%');
  });

  it('merges a custom class and style onto the bar', () => {
    const { wrapper } = mountBar({
      class: 'my-timeline',
      style: { bottom: '8px' },
    });

    const root = wrapper.find('.rk-reel-timeline');
    expect(root.classes()).toContain('my-timeline');
    expect((root.element as HTMLElement).style.bottom).toBe('8px');
  });

  it('seeks with the arrow keys', async () => {
    const { timeline, track } = mountBar();
    const video = stubSharedVideo({ duration: 100, currentTime: 20 });
    timeline().attach(video);
    await nextTick();

    track().dispatchEvent(
      new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
    );

    expect(video.currentTime).toBeGreaterThan(20);
  });

  it('pauses a playing video while scrubbing and resumes it afterwards', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);
    const { timeline, track } = mountBar();
    timeline().attach(stubSharedVideo({ duration: 100, paused: false }));
    await nextTick();

    track().dispatchEvent(pointer('pointerdown', 0));
    expect(pause).toHaveBeenCalledTimes(1);
    expect(timeline().isScrubbing.value).toBe(true);

    track().dispatchEvent(pointer('pointerup', 0));
    expect(play).toHaveBeenCalledTimes(1);
    expect(timeline().isScrubbing.value).toBe(false);
  });

  it('leaves a paused video paused after scrubbing', async () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);
    const { timeline, track } = mountBar();
    timeline().attach(stubSharedVideo({ duration: 100, paused: true }));
    await nextTick();

    track().dispatchEvent(pointer('pointerdown', 0));
    track().dispatchEvent(pointer('pointerup', 0));

    expect(pause).not.toHaveBeenCalled();
    expect(play).not.toHaveBeenCalled();
  });

  it('stops listening for scrubbing once it unmounts', async () => {
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, 'pause')
      .mockImplementation(() => undefined);
    const { wrapper, timeline, track } = mountBar();
    timeline().attach(stubSharedVideo({ duration: 100, paused: false }));
    await nextTick();
    const element = track();

    wrapper.unmount();
    element.dispatchEvent(pointer('pointerdown', 0));

    expect(pause).not.toHaveBeenCalled();
  });

  it('refuses to render outside a timeline provider', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    expect(() => mount(TimelineBar)).toThrow(
      'useTimelineState must be used within TimelineProvider',
    );
    warn.mockRestore();
  });
});
