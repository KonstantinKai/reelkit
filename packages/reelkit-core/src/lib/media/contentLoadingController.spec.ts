import { describe, it, expect, vi } from 'vitest';
import { createContentLoadingController } from './contentLoadingController';

describe('createContentLoadingController', () => {
  it('defaults to isLoading=true', () => {
    const ctrl = createContentLoadingController();
    expect(ctrl.isLoading.value).toBe(true);
  });

  it('accepts custom initial loading state', () => {
    const ctrl = createContentLoadingController(false);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('accepts custom initial index', () => {
    const ctrl = createContentLoadingController(true, 5);
    ctrl.onReady(5);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('ignores onReady for default index when initialIndex differs', () => {
    const ctrl = createContentLoadingController(true, 3);
    ctrl.onReady(0);
    expect(ctrl.isLoading.value).toBe(true);
  });

  it('setActiveIndex resets loading to true', () => {
    const ctrl = createContentLoadingController(false);
    ctrl.setActiveIndex(1);
    expect(ctrl.isLoading.value).toBe(true);
  });

  it('onReady clears loading for matching index', () => {
    const ctrl = createContentLoadingController();
    ctrl.setActiveIndex(0);
    ctrl.onReady(0);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('onReady ignores stale index', () => {
    const ctrl = createContentLoadingController();
    ctrl.setActiveIndex(1);
    ctrl.onReady(0);
    expect(ctrl.isLoading.value).toBe(true);
  });

  it('onWaiting sets loading for matching index', () => {
    const ctrl = createContentLoadingController(false);
    ctrl.setActiveIndex(0);
    ctrl.onReady(0);
    expect(ctrl.isLoading.value).toBe(false);

    ctrl.onWaiting(0);
    expect(ctrl.isLoading.value).toBe(true);
  });

  it('onWaiting ignores stale index', () => {
    const ctrl = createContentLoadingController(false);
    ctrl.setActiveIndex(1);
    ctrl.onReady(1);
    expect(ctrl.isLoading.value).toBe(false);

    ctrl.onWaiting(0);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('setActiveIndex resets after onReady', () => {
    const ctrl = createContentLoadingController();
    ctrl.setActiveIndex(0);
    ctrl.onReady(0);
    expect(ctrl.isLoading.value).toBe(false);

    ctrl.setActiveIndex(1);
    expect(ctrl.isLoading.value).toBe(true);
  });

  it('rapid index changes — only latest index takes effect', () => {
    const ctrl = createContentLoadingController();
    ctrl.setActiveIndex(0);
    ctrl.setActiveIndex(1);
    ctrl.setActiveIndex(2);

    ctrl.onReady(0);
    expect(ctrl.isLoading.value).toBe(true);

    ctrl.onReady(1);
    expect(ctrl.isLoading.value).toBe(true);

    ctrl.onReady(2);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('notifies observers on state transitions', () => {
    const ctrl = createContentLoadingController();
    const listener = vi.fn();
    ctrl.isLoading.observe(listener);

    ctrl.setActiveIndex(0);
    ctrl.onReady(0);

    expect(listener).toHaveBeenCalled();
  });

  it('defaults to isError=false', () => {
    const ctrl = createContentLoadingController();
    expect(ctrl.isError.value).toBe(false);
  });

  it('onError sets isError=true and isLoading=false', () => {
    const ctrl = createContentLoadingController();
    ctrl.setActiveIndex(0);
    ctrl.onError(0);
    expect(ctrl.isError.value).toBe(true);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('onError ignores stale index', () => {
    const ctrl = createContentLoadingController();
    ctrl.setActiveIndex(1);
    ctrl.onError(0);
    expect(ctrl.isError.value).toBe(false);
  });

  it('setActiveIndex resets isError to false', () => {
    const ctrl = createContentLoadingController();
    ctrl.setActiveIndex(0);
    ctrl.onError(0);
    expect(ctrl.isError.value).toBe(true);

    ctrl.setActiveIndex(1);
    expect(ctrl.isError.value).toBe(false);
    expect(ctrl.isLoading.value).toBe(true);
  });

  it('onReady clears isError', () => {
    const ctrl = createContentLoadingController();
    ctrl.setActiveIndex(0);
    ctrl.onError(0);
    expect(ctrl.isError.value).toBe(true);

    ctrl.onReady(0);
    expect(ctrl.isError.value).toBe(false);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('onError at non-zero initialIndex requires setActiveIndex first', () => {
    const ctrl = createContentLoadingController(true, 0);
    // Without setActiveIndex, onError(3) is rejected by index guard
    ctrl.onError(3);
    expect(ctrl.isError.value).toBe(false);

    // After setActiveIndex, onError matches
    ctrl.setActiveIndex(3);
    ctrl.onError(3);
    expect(ctrl.isError.value).toBe(true);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('setActiveIndex resets state for reopen cycle', () => {
    const ctrl = createContentLoadingController(true, 0);
    // First open — image loads
    ctrl.setActiveIndex(0);
    ctrl.onReady(0);
    expect(ctrl.isLoading.value).toBe(false);

    // Reopen — setActiveIndex resets loading
    ctrl.setActiveIndex(0);
    expect(ctrl.isLoading.value).toBe(true);
    expect(ctrl.isError.value).toBe(false);

    // Image loads again
    ctrl.onReady(0);
    expect(ctrl.isLoading.value).toBe(false);
  });

  it('setActiveIndex after error resets for next slide', () => {
    const ctrl = createContentLoadingController(true, 0);
    ctrl.setActiveIndex(2);
    ctrl.onError(2);
    expect(ctrl.isError.value).toBe(true);

    // Navigate to next slide
    ctrl.setActiveIndex(3);
    expect(ctrl.isError.value).toBe(false);
    expect(ctrl.isLoading.value).toBe(true);

    ctrl.onReady(3);
    expect(ctrl.isLoading.value).toBe(false);
  });
});
