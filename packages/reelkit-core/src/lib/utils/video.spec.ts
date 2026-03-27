import { describe, it, expect, vi } from 'vitest';
import { captureFrame, createSharedVideo } from './video';

describe('captureFrame', () => {
  it('returns null when getContext returns null (jsdom default)', () => {
    const video = document.createElement('video');
    expect(captureFrame(video)).toBeNull();
  });

  it('returns null when videoWidth is 0', () => {
    const video = document.createElement('video');
    Object.defineProperty(video, 'videoWidth', { value: 0 });
    Object.defineProperty(video, 'videoHeight', { value: 0 });
    expect(captureFrame(video)).toBeNull();
  });

  it('returns null on cross-origin error', () => {
    const video = document.createElement('video');
    Object.defineProperty(video, 'videoWidth', { value: 1920 });
    Object.defineProperty(video, 'videoHeight', { value: 1080 });

    vi.spyOn(document, 'createElement').mockImplementation(() => {
      throw new DOMException('Security error');
    });

    expect(captureFrame(video)).toBeNull();
    vi.restoreAllMocks();
  });

  it('returns data URL when canvas is available', () => {
    const video = document.createElement('video');
    Object.defineProperty(video, 'videoWidth', { value: 1920 });
    Object.defineProperty(video, 'videoHeight', { value: 1080 });

    const mockCtx = { drawImage: vi.fn() };
    const mockCanvas = {
      width: 0,
      height: 0,
      getContext: () => mockCtx,
      toDataURL: () => 'data:image/jpeg;base64,abc',
    };

    vi.spyOn(document, 'createElement').mockReturnValue(
      mockCanvas as unknown as HTMLCanvasElement,
    );

    const result = captureFrame(video);
    expect(result).toBe('data:image/jpeg;base64,abc');
    expect(mockCtx.drawImage).toHaveBeenCalledWith(video, 0, 0);
    vi.restoreAllMocks();
  });
});

describe('createSharedVideo', () => {
  it('creates a video element on first getVideo call', () => {
    const shared = createSharedVideo({ className: 'test-video' });
    const video = shared.getVideo();
    expect(video).toBeInstanceOf(HTMLVideoElement);
  });

  it('returns the same element on subsequent calls', () => {
    const shared = createSharedVideo({ className: 'test-video' });
    const first = shared.getVideo();
    const second = shared.getVideo();
    expect(first).toBe(second);
  });

  it('applies className', () => {
    const shared = createSharedVideo({ className: 'my-player' });
    expect(shared.getVideo().className).toBe('my-player');
  });

  it('sets playsInline', () => {
    const shared = createSharedVideo({ className: 'test' });
    expect(shared.getVideo().playsInline).toBe(true);
  });

  it('sets muted', () => {
    const shared = createSharedVideo({ className: 'test' });
    expect(shared.getVideo().muted).toBe(true);
  });

  it('sets autoplay', () => {
    const shared = createSharedVideo({ className: 'test' });
    expect(shared.getVideo().autoplay).toBe(true);
  });

  it('sets crossOrigin', () => {
    const shared = createSharedVideo({ className: 'test' });
    expect(shared.getVideo().crossOrigin).toBe('anonymous');
  });

  it('sets disableRemotePlayback when configured', () => {
    const shared = createSharedVideo({
      className: 'test',
      disableRemotePlayback: true,
    });
    expect(shared.getVideo().disableRemotePlayback).toBe(true);
  });

  it('sets disablePictureInPicture when configured', () => {
    const shared = createSharedVideo({
      className: 'test',
      disablePictureInPicture: true,
    });
    expect(
      (
        shared.getVideo() as HTMLVideoElement & {
          disablePictureInPicture: boolean;
        }
      ).disablePictureInPicture,
    ).toBe(true);
  });

  it('does not set disableRemotePlayback by default', () => {
    const shared = createSharedVideo({ className: 'test' });
    expect(shared.getVideo().disableRemotePlayback).toBeFalsy();
  });

  it('playbackPositions is an LRU cache', () => {
    const shared = createSharedVideo({ className: 'test' });
    shared.playbackPositions.set('a', 10);
    expect(shared.playbackPositions.get('a')).toBe(10);
  });

  it('capturedFrames is an LRU cache', () => {
    const shared = createSharedVideo({ className: 'test' });
    shared.capturedFrames.set('a', 'data:image/jpeg;base64,...');
    expect(shared.capturedFrames.get('a')).toBe('data:image/jpeg;base64,...');
  });

  it('each createSharedVideo call returns an independent instance', () => {
    const a = createSharedVideo({ className: 'a' });
    const b = createSharedVideo({ className: 'b' });
    expect(a.getVideo()).not.toBe(b.getVideo());
    a.playbackPositions.set('key', 5);
    expect(b.playbackPositions.get('key')).toBeUndefined();
  });
});
