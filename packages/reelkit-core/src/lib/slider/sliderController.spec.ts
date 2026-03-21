import { describe, it, expect } from 'vitest';
import { createSliderController } from './sliderController';

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
});
