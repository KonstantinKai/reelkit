import { useEffect, useRef, type FC, type ReactElement } from 'react';
import { render, act } from '@testing-library/react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import { SoundProvider } from '@reelkit/react';
import { TimelineProvider, useTimelineState } from './TimelineState';
import TimelineBar from './TimelineBar';
import { shared } from './VideoSlide';

const renderWithProviders = (ui: ReactElement) =>
  render(
    <SoundProvider>
      <TimelineProvider>{ui}</TimelineProvider>
    </SoundProvider>,
  );

describe('TimelineBar', () => {
  it('renders slider role with default ARIA values', () => {
    const { container } = renderWithProviders(<TimelineBar />);
    const track = container.querySelector('.rk-reel-timeline-track');
    expect(track).toBeTruthy();
    expect(track?.getAttribute('role')).toBe('slider');
    expect(track?.getAttribute('aria-valuemin')).toBe('0');
    expect(track?.getAttribute('aria-valuemax')).toBe('0');
    expect(track?.getAttribute('aria-valuenow')).toBe('0');
  });

  it('reflects duration and currentTime via ARIA', () => {
    const Harness: FC = () => {
      const controller = useTimelineState();
      const videoRef = useRef<HTMLVideoElement | null>(null);
      useEffect(() => {
        if (videoRef.current) controller.attach(videoRef.current);
      }, [controller]);
      return (
        <>
          <video ref={videoRef} />
          <TimelineBar />
        </>
      );
    };

    const { container } = renderWithProviders(<Harness />);
    const video = container.querySelector('video') as HTMLVideoElement;
    Object.defineProperty(video, 'duration', {
      value: 100,
      configurable: true,
    });
    Object.defineProperty(video, 'currentTime', {
      value: 25,
      writable: true,
      configurable: true,
    });
    act(() => {
      video.dispatchEvent(new Event('loadedmetadata'));
      video.dispatchEvent(new Event('timeupdate'));
    });

    const track = container.querySelector('.rk-reel-timeline-track')!;
    expect(track.getAttribute('aria-valuemax')).toBe('100');
    expect(track.getAttribute('aria-valuenow')).toBe('25');
  });

  it('fill width tracks progress signal', () => {
    const Harness: FC = () => {
      const controller = useTimelineState();
      const videoRef = useRef<HTMLVideoElement | null>(null);
      useEffect(() => {
        if (videoRef.current) controller.attach(videoRef.current);
      }, [controller]);
      return (
        <>
          <video ref={videoRef} />
          <TimelineBar />
        </>
      );
    };

    const { container } = renderWithProviders(<Harness />);
    const video = container.querySelector('video') as HTMLVideoElement;
    Object.defineProperty(video, 'duration', {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(video, 'currentTime', {
      value: 50,
      writable: true,
      configurable: true,
    });
    act(() => {
      video.dispatchEvent(new Event('loadedmetadata'));
      video.dispatchEvent(new Event('timeupdate'));
    });

    const fill = container.querySelector(
      '.rk-reel-timeline-fill',
    ) as HTMLElement;
    expect(fill.style.width).toBe('25%');
  });

  it('throws when used outside TimelineProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => void 0);
    expect(() => render(<TimelineBar />)).toThrow(/TimelineProvider/);
    spy.mockRestore();
  });

  it('draws one segment per buffered range', () => {
    let timeline: ReturnType<typeof useTimelineState> | undefined;
    const Probe: FC = () => {
      timeline = useTimelineState();
      return <TimelineBar />;
    };
    const { container } = renderWithProviders(<Probe />);

    act(() => {
      timeline!.bufferedRanges.value = [
        { start: 0, end: 0.25 },
        { start: 0.5, end: 0.75 },
      ];
    });

    const segments = container.querySelectorAll<HTMLElement>(
      '.rk-reel-timeline-buffered',
    );
    expect(segments).toHaveLength(2);
    expect(segments[1].style.left).toBe('50%');
    expect(segments[1].style.width).toBe('25%');
  });

  describe('scrubbing', () => {
    // The provider pauses and resumes the one video every slide shares, so
    // the tests attach that element and describe it as a loaded video.
    const mountWithSharedVideo = (paused: boolean) => {
      const video = shared.getVideo();
      Object.defineProperty(video, 'duration', {
        value: 100,
        configurable: true,
      });
      Object.defineProperty(video, 'paused', {
        value: paused,
        configurable: true,
      });
      const Harness: FC = () => {
        const controller = useTimelineState();
        useEffect(() => controller.attach(video), [controller]);
        return <TimelineBar />;
      };
      const view = renderWithProviders(<Harness />);
      const track = view.container.querySelector(
        '.rk-reel-timeline-track',
      ) as HTMLElement;
      return { video, track };
    };

    const pointer = (type: string) => {
      const event = new MouseEvent(type, { bubbles: true, clientX: 0 });
      Object.defineProperty(event, 'pointerId', { value: 1 });
      return event;
    };

    afterEach(() => {
      const video = shared.getVideo();
      for (const key of ['duration', 'paused']) {
        delete (video as unknown as Record<string, unknown>)[key];
      }
      vi.restoreAllMocks();
    });

    it('pauses a playing video while scrubbing and resumes it afterwards', () => {
      const pause = vi
        .spyOn(HTMLMediaElement.prototype, 'pause')
        .mockImplementation(() => undefined);
      const play = vi
        .spyOn(HTMLMediaElement.prototype, 'play')
        .mockResolvedValue(undefined);
      const { track } = mountWithSharedVideo(false);

      act(() => {
        track.dispatchEvent(pointer('pointerdown'));
      });
      expect(pause).toHaveBeenCalledTimes(1);
      expect(track.hasAttribute('data-scrubbing')).toBe(true);

      act(() => {
        track.dispatchEvent(pointer('pointerup'));
      });
      expect(play).toHaveBeenCalledTimes(1);
      expect(track.hasAttribute('data-scrubbing')).toBe(false);
    });

    it('leaves a paused video paused after scrubbing', () => {
      const pause = vi
        .spyOn(HTMLMediaElement.prototype, 'pause')
        .mockImplementation(() => undefined);
      const play = vi
        .spyOn(HTMLMediaElement.prototype, 'play')
        .mockResolvedValue(undefined);
      const { track } = mountWithSharedVideo(true);

      act(() => {
        track.dispatchEvent(pointer('pointerdown'));
        track.dispatchEvent(pointer('pointerup'));
      });

      expect(pause).not.toHaveBeenCalled();
      expect(play).not.toHaveBeenCalled();
    });
  });
});
