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
});
