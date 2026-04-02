import { describe, it, expect, vi } from 'vitest';
import { observeMediaLoading } from './observeMediaLoading';

const createVideo = () => document.createElement('video');

describe('observeMediaLoading', () => {
  it('does not call onReady on canplay', () => {
    const video = createVideo();
    const onReady = vi.fn();

    observeMediaLoading(video, { onReady, onWaiting: vi.fn() });
    video.dispatchEvent(new Event('canplay'));

    expect(onReady).not.toHaveBeenCalled();
  });

  it('calls onReady on canplaythrough', () => {
    const video = createVideo();
    const onReady = vi.fn();

    observeMediaLoading(video, { onReady, onWaiting: vi.fn() });
    video.dispatchEvent(new Event('canplaythrough'));

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('calls onWaiting on waiting', () => {
    const video = createVideo();
    const onWaiting = vi.fn();

    observeMediaLoading(video, { onReady: vi.fn(), onWaiting });
    video.dispatchEvent(new Event('waiting'));

    expect(onWaiting).toHaveBeenCalledTimes(1);
  });

  it('calls onReady on playing', () => {
    const video = createVideo();
    const onReady = vi.fn();

    observeMediaLoading(video, { onReady, onWaiting: vi.fn() });
    video.dispatchEvent(new Event('playing'));

    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('calls onPlaying on playing when provided', () => {
    const video = createVideo();
    const onReady = vi.fn();
    const onPlaying = vi.fn();

    observeMediaLoading(video, { onReady, onWaiting: vi.fn(), onPlaying });
    video.dispatchEvent(new Event('playing'));

    expect(onReady).toHaveBeenCalledTimes(1);
    expect(onPlaying).toHaveBeenCalledTimes(1);
  });

  it('does not call onPlaying on canplay', () => {
    const video = createVideo();
    const onPlaying = vi.fn();

    observeMediaLoading(video, {
      onReady: vi.fn(),
      onWaiting: vi.fn(),
      onPlaying,
    });
    video.dispatchEvent(new Event('canplay'));

    expect(onPlaying).not.toHaveBeenCalled();
  });

  it('waiting → canplay sequence does not call onReady (prevents shallow buffer race)', () => {
    const video = createVideo();
    const onReady = vi.fn();
    const onWaiting = vi.fn();

    observeMediaLoading(video, { onReady, onWaiting });

    video.dispatchEvent(new Event('waiting'));
    expect(onWaiting).toHaveBeenCalledTimes(1);

    video.dispatchEvent(new Event('canplay'));
    expect(onReady).not.toHaveBeenCalled();
  });

  it('waiting → playing sequence calls onReady (playback actually resumed)', () => {
    const video = createVideo();
    const onReady = vi.fn();
    const onWaiting = vi.fn();

    observeMediaLoading(video, { onReady, onWaiting });

    video.dispatchEvent(new Event('waiting'));
    expect(onWaiting).toHaveBeenCalledTimes(1);

    video.dispatchEvent(new Event('playing'));
    expect(onReady).toHaveBeenCalledTimes(1);
  });

  it('removes all listeners on dispose', () => {
    const video = createVideo();
    const onReady = vi.fn();
    const onWaiting = vi.fn();

    const dispose = observeMediaLoading(video, { onReady, onWaiting });
    dispose();

    video.dispatchEvent(new Event('waiting'));
    video.dispatchEvent(new Event('playing'));
    video.dispatchEvent(new Event('canplaythrough'));

    expect(onReady).not.toHaveBeenCalled();
    expect(onWaiting).not.toHaveBeenCalled();
  });
});
