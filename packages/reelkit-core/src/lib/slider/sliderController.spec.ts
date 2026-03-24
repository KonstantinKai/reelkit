import { describe, it, expect, vi } from 'vitest';
import { createSliderController } from './sliderController';
import type { GestureControllerEvents } from '../gestures/types';

let capturedGestureEvents: Partial<GestureControllerEvents> = {};

vi.mock('../gestures/gestureController', () => ({
  createGestureController: (
    _config: unknown,
    events: Partial<GestureControllerEvents>,
  ) => {
    capturedGestureEvents = events;
    return {
      attach: vi.fn(),
      detach: vi.fn(),
      observe: vi.fn(),
      unobserve: vi.fn(),
      updateEvents: (e: Partial<GestureControllerEvents>) => {
        capturedGestureEvents = e;
      },
    };
  },
}));

describe('createSliderController', () => {
  describe('rangeExtractor clamping', () => {
    it('uses rangeExtractor result when it returns 3 or fewer items', () => {
      const controller = createSliderController({
        count: 10,
        rangeExtractor: () => [4, 5],
      });

      expect(controller.state.indexes.value).toEqual([4, 5]);
      controller.detach();
    });

    it('clamps rangeExtractor result to 3 items centered on current index', () => {
      const controller = createSliderController({
        count: 10,
        initialIndex: 3,
        rangeExtractor: () => [1, 2, 3, 4, 5],
      });

      expect(controller.state.indexes.value).toEqual([2, 3, 4]);
      controller.detach();
    });

    it('clamps to first 3 when current index is near the start of the range', () => {
      const controller = createSliderController({
        count: 10,
        initialIndex: 0,
        rangeExtractor: () => [0, 1, 2, 3, 4],
      });

      expect(controller.state.indexes.value).toEqual([0, 1, 2]);
      controller.detach();
    });

    it('clamps to last 3 when current index is near the end of the range', () => {
      const controller = createSliderController({
        count: 10,
        initialIndex: 9,
        rangeExtractor: () => [6, 7, 8, 9],
      });

      expect(controller.state.indexes.value).toEqual([7, 8, 9]);
      controller.detach();
    });
  });

  describe('cross-axis drag should not trigger navigation', () => {
    const makeDragEndEvent = (dx: number, dy: number) => ({
      globalPosition: [0, 0] as [number, number],
      localPosition: [0, 0] as [number, number],
      delta: [dx, dy] as [number, number],
      distance: [dx, dy] as [number, number],
      velocity: [0, 0] as [number, number],
    });

    it('horizontal slider ignores vertical-only drag end', () => {
      const onDragEnd = vi.fn();
      const controller = createSliderController(
        {
          count: 5,
          initialIndex: 2,
          direction: 'horizontal',
        },
        { onDragEnd },
      );
      controller.setPrimarySize(400);

      const events = capturedGestureEvents;

      // Simulate a vertical swipe (no onHorizontalDragStart called)
      events.onDragEnd?.(makeDragEndEvent(0, -200));

      expect(onDragEnd).not.toHaveBeenCalled();
      expect(controller.state.index.value).toBe(2);
      controller.detach();
    });

    it('horizontal slider processes main-axis drag end', () => {
      const onDragEnd = vi.fn();
      const controller = createSliderController(
        {
          count: 5,
          initialIndex: 2,
          direction: 'horizontal',
          swipeDistanceFactor: 0.1,
        },
        { onDragEnd },
      );
      controller.setPrimarySize(400);

      const events = capturedGestureEvents;

      // Simulate a horizontal swipe (onHorizontalDragStart called first)
      events.onHorizontalDragStart?.({
        globalPosition: [0, 0],
        localPosition: [0, 0],
        kind: 'touch',
      });
      events.onDragEnd?.(makeDragEndEvent(-200, 0));

      expect(onDragEnd).toHaveBeenCalled();
      controller.detach();
    });

    it('vertical slider ignores horizontal-only drag end', () => {
      const onDragEnd = vi.fn();
      const controller = createSliderController(
        {
          count: 5,
          initialIndex: 2,
          direction: 'vertical',
        },
        { onDragEnd },
      );
      controller.setPrimarySize(600);

      const events = capturedGestureEvents;

      // Simulate a horizontal swipe (no onVerticalDragStart called)
      events.onDragEnd?.(makeDragEndEvent(-200, 0));

      expect(onDragEnd).not.toHaveBeenCalled();
      expect(controller.state.index.value).toBe(2);
      controller.detach();
    });
  });
});
