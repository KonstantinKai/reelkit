import { describe, it, expect, vi } from 'vitest';
import { createStoriesController } from './storiesController';

describe('createStoriesController', () => {
  const makeController = (overrides = {}, events = {}) =>
    createStoriesController(
      {
        groupCount: 3,
        storyCounts: [3, 2, 4],
        ...overrides,
      },
      events,
    );

  describe('navigation within a group', () => {
    it('nextStory advances within the group', () => {
      const ctrl = makeController();
      ctrl.nextStory();
      expect(ctrl.state.activeStoryIndex.value).toBe(1);
    });

    it('prevStory goes back within the group', () => {
      const ctrl = makeController({ initialStoryIndex: 2 });
      ctrl.prevStory();
      expect(ctrl.state.activeStoryIndex.value).toBe(1);
    });
  });

  describe('boundary transitions', () => {
    it('nextStory on last story switches to next group', () => {
      const onGroupChange = vi.fn();
      const ctrl = makeController({ initialStoryIndex: 2 }, { onGroupChange });

      ctrl.nextStory();

      expect(ctrl.state.activeGroupIndex.value).toBe(1);
      expect(ctrl.state.activeStoryIndex.value).toBe(0);
      expect(onGroupChange).toHaveBeenCalledWith(1);
    });

    it('prevStory on first story switches to previous group', () => {
      const onGroupChange = vi.fn();
      const ctrl = makeController(
        { initialGroupIndex: 1, initialStoryIndex: 0 },
        { onGroupChange },
      );

      ctrl.prevStory();

      expect(ctrl.state.activeGroupIndex.value).toBe(0);
      expect(ctrl.state.activeStoryIndex.value).toBe(0);
      expect(onGroupChange).toHaveBeenCalledWith(0);
    });

    it('prevStory on first story of first group is a no-op', () => {
      const ctrl = makeController();
      ctrl.prevStory();
      expect(ctrl.state.activeGroupIndex.value).toBe(0);
      expect(ctrl.state.activeStoryIndex.value).toBe(0);
    });
  });

  describe('last group close', () => {
    it('nextStory on last story of last group fires onClose', () => {
      const onClose = vi.fn();
      const onComplete = vi.fn();
      const ctrl = makeController(
        { initialGroupIndex: 2, initialStoryIndex: 3 },
        { onClose, onComplete },
      );

      ctrl.nextStory();

      expect(onComplete).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('pause/resume', () => {
    it('pause sets isPaused to true', () => {
      const ctrl = makeController();
      ctrl.pause();
      expect(ctrl.state.isPaused.value).toBe(true);
    });

    it('resume sets isPaused to false', () => {
      const ctrl = makeController();
      ctrl.pause();
      ctrl.resume();
      expect(ctrl.state.isPaused.value).toBe(false);
    });
  });

  describe('callbacks', () => {
    it('fires onStoryChange and onStoryViewed on navigation', () => {
      const onStoryChange = vi.fn();
      const onStoryViewed = vi.fn();
      const ctrl = makeController({}, { onStoryChange, onStoryViewed });

      ctrl.nextStory();

      expect(onStoryChange).toHaveBeenCalledWith(0, 1);
      expect(onStoryViewed).toHaveBeenCalledWith(0, 1);
    });

    it('fires onStoryComplete then advances on timer complete', () => {
      const onStoryComplete = vi.fn();
      const ctrl = makeController({}, { onStoryComplete });

      ctrl.onStoryTimerComplete();

      expect(onStoryComplete).toHaveBeenCalledWith(0, 0);
      expect(ctrl.state.activeStoryIndex.value).toBe(1);
    });
  });

  describe('goToGroup', () => {
    it('jumps to a specific group', () => {
      const ctrl = makeController();
      ctrl.goToGroup(2);
      expect(ctrl.state.activeGroupIndex.value).toBe(2);
      expect(ctrl.state.activeStoryIndex.value).toBe(0);
    });

    it('ignores out-of-range group index', () => {
      const ctrl = makeController();
      ctrl.goToGroup(5);
      expect(ctrl.state.activeGroupIndex.value).toBe(0);
    });

    it('goToGroup with current index still fires callbacks', () => {
      const onGroupChange = vi.fn();
      const onStoryChange = vi.fn();
      const ctrl = makeController({}, { onGroupChange, onStoryChange });

      ctrl.goToGroup(0);

      expect(onGroupChange).toHaveBeenCalledWith(0);
      expect(onStoryChange).toHaveBeenCalledWith(0, 0);
    });

    it('resumes last viewed story index when returning to a group', () => {
      const ctrl = makeController();

      ctrl.nextStory();
      ctrl.nextStory();
      expect(ctrl.state.activeStoryIndex.value).toBe(2);

      ctrl.goToGroup(1);
      expect(ctrl.state.activeGroupIndex.value).toBe(1);

      ctrl.goToGroup(0);
      expect(ctrl.state.activeStoryIndex.value).toBe(2);
    });
  });

  describe('video loading re-entry guard', () => {
    it('goToGroup sets both group and story index atomically', () => {
      const ctrl = makeController({ initialStoryIndex: 0 });

      ctrl.nextStory();
      ctrl.nextStory();
      ctrl.goToGroup(1);

      const gi = ctrl.state.activeGroupIndex.value;
      const si = ctrl.state.activeStoryIndex.value;

      expect(gi).toBe(1);
      expect(si).toBe(0);

      ctrl.goToGroup(0);
      expect(ctrl.state.activeGroupIndex.value).toBe(0);
      expect(ctrl.state.activeStoryIndex.value).toBe(2);
    });

    it('callers can guard re-entry by comparing activeGroupIndex before goToGroup', () => {
      const onGroupChange = vi.fn();
      const ctrl = makeController({}, { onGroupChange });

      ctrl.goToGroup(2);
      expect(onGroupChange).toHaveBeenCalledTimes(1);

      // Simulates the re-entry guard: skip if already at target
      if (ctrl.state.activeGroupIndex.value !== 2) {
        ctrl.goToGroup(2);
      }

      expect(onGroupChange).toHaveBeenCalledTimes(1);
    });
  });
});
