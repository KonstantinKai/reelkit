import { renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { StoriesViewedStateController } from '@reelkit/stories-core';
import { useAttachViewedState } from './useAttachViewedState';

const createController = () => {
  const release = vi.fn();
  const attach = vi.fn(() => release);
  return {
    viewed: { attach } as unknown as StoriesViewedStateController,
    attach,
    release,
  };
};

describe('useAttachViewedState', () => {
  it('attaches the controller while mounted and lets go on unmount', () => {
    const { viewed, attach, release } = createController();
    const { unmount } = renderHook(() => useAttachViewedState(viewed));

    expect(attach).toHaveBeenCalledOnce();
    expect(release).not.toHaveBeenCalled();

    unmount();
    expect(release).toHaveBeenCalledOnce();
  });

  it('moves the attachment to a controller swapped in', () => {
    const first = createController();
    const second = createController();
    const { rerender } = renderHook(
      ({ viewed }) => useAttachViewedState(viewed),
      { initialProps: { viewed: first.viewed } },
    );

    rerender({ viewed: second.viewed });

    expect(first.release).toHaveBeenCalledOnce();
    expect(second.attach).toHaveBeenCalledOnce();
  });

  it('does nothing without a controller', () => {
    expect(() =>
      renderHook(() => useAttachViewedState(undefined)).unmount(),
    ).not.toThrow();
  });
});
