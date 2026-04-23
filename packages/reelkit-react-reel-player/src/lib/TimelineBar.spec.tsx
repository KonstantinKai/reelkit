import { useEffect, useRef, type FC, type ReactElement } from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SoundProvider } from '@reelkit/react';
import { TimelineProvider, useTimelineState } from './TimelineState';
import TimelineBar from './TimelineBar';

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
});
