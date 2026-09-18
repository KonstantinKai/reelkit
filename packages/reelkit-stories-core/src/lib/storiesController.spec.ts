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
  describe('resuming a group that has not been visited yet', () => {
    it('opens an unvisited group where the resume callback points', () => {
      const ctrl = makeController({ resumeStoryIndex: () => 2 });

      ctrl.goToGroup(2);

      expect(ctrl.state.activeStoryIndex.value).toBe(2);
    });

    it('prefers the position this session left a group on', () => {
      const ctrl = makeController({ resumeStoryIndex: () => 3 });

      ctrl.goToGroup(2);
      ctrl.nextStory();
      ctrl.goToGroup(0);
      ctrl.goToGroup(2);

      expect(ctrl.state.activeStoryIndex.value).toBe(3);
    });

    it('reopens a story left mid-way, not the first unseen one after it', () => {
      const seen = new Map<number, number>();
      const ctrl = makeController(
        {
          resumeStoryIndex: (groupIndex: number) =>
            (seen.get(groupIndex) ?? -1) + 1,
        },
        {
          onStoryViewed: (groupIndex: number, storyIndex: number) =>
            seen.set(
              groupIndex,
              Math.max(seen.get(groupIndex) ?? -1, storyIndex),
            ),
        },
      );

      ctrl.reportInitialView();
      ctrl.nextStory();
      ctrl.goToGroup(1);
      ctrl.goToGroup(0);

      expect(ctrl.getLastStoryIndex(0)).toBe(1);
      expect(ctrl.state.activeStoryIndex.value).toBe(1);
    });

    it('bounds a suggestion the group cannot honour', () => {
      const ctrl = makeController({ resumeStoryIndex: () => 99 });

      ctrl.goToGroup(1);

      expect(ctrl.state.activeStoryIndex.value).toBe(1);
    });

    it('reports the same story it will open, so a neighbour renders in step', () => {
      const ctrl = makeController({ resumeStoryIndex: () => 1 });

      expect(ctrl.getLastStoryIndex(2)).toBe(1);
    });

    it('opens at the first story when nothing is configured', () => {
      const ctrl = makeController();

      ctrl.goToGroup(1);

      expect(ctrl.state.activeStoryIndex.value).toBe(0);
    });

    it('resumes the group it opens on, like any other', () => {
      const ctrl = makeController({
        initialGroupIndex: 1,
        resumeStoryIndex: () => 1,
      });

      expect(ctrl.state.activeStoryIndex.value).toBe(1);
      expect(ctrl.getLastStoryIndex(1)).toBe(1);
    });

    it('lets an explicit opening story beat the resume callback', () => {
      const ctrl = makeController({
        initialGroupIndex: 1,
        initialStoryIndex: 0,
        resumeStoryIndex: () => 1,
      });

      expect(ctrl.state.activeStoryIndex.value).toBe(0);
    });

    it('opens the first story when neither is given', () => {
      const ctrl = makeController({ initialGroupIndex: 1 });

      expect(ctrl.state.activeStoryIndex.value).toBe(0);
    });

    // A resume answer is computed by a consumer — an empty feed divided into a
    // count, a parsed value — so it can arrive as anything a number can be.
    it.each([
      ['not a number', Number.NaN, 0],
      ['unbounded', Number.POSITIVE_INFINITY, 0],
      ['negatively unbounded', Number.NEGATIVE_INFINITY, 0],
      ['fractional', 2.7, 2],
      ['a negative fraction', -0.7, 0],
    ])(
      'opens on a whole story when the answer is %s',
      (_label, answer, expected) => {
        const ctrl = makeController({
          initialGroupIndex: 2,
          resumeStoryIndex: () => answer,
        });

        expect(ctrl.state.activeStoryIndex.value).toBe(expected);
        expect(Number.isInteger(ctrl.state.activeStoryIndex.value)).toBe(true);
      },
    );

    it.each([
      ['not a number', Number.NaN, 0],
      ['fractional', 2.7, 2],
    ])(
      'opens a group reached later on a whole story when the answer is %s',
      (_label, answer, expected) => {
        const ctrl = makeController({ resumeStoryIndex: () => answer });

        ctrl.goToGroup(2);

        expect(ctrl.state.activeStoryIndex.value).toBe(expected);
      },
    );

    it('bounds a suggestion the opening group cannot honour', () => {
      const ctrl = makeController({
        initialGroupIndex: 1,
        resumeStoryIndex: () => 99,
      });

      expect(ctrl.state.activeStoryIndex.value).toBe(1);
    });
  });

  describe('the story the player opens on', () => {
    it('is reported as viewed', () => {
      const onStoryViewed = vi.fn();
      const ctrl = makeController({ initialStoryIndex: 1 }, { onStoryViewed });

      ctrl.reportInitialView();

      expect(onStoryViewed).toHaveBeenCalledWith(0, 1);
    });

    it('is reported once however many times it is asked for', () => {
      const onStoryViewed = vi.fn();
      const ctrl = makeController({}, { onStoryViewed });

      ctrl.reportInitialView();
      ctrl.reportInitialView();

      expect(onStoryViewed).toHaveBeenCalledTimes(1);
    });

    it('is not reported again once the viewer has moved on', () => {
      const onStoryViewed = vi.fn();
      const ctrl = makeController({}, { onStoryViewed });

      ctrl.nextStory();
      ctrl.reportInitialView();

      expect(onStoryViewed).toHaveBeenCalledTimes(1);
      expect(onStoryViewed).toHaveBeenCalledWith(0, 1);
    });

    it('does not announce a story change, only a view', () => {
      const onStoryChange = vi.fn();
      const ctrl = makeController({}, { onStoryChange });

      ctrl.reportInitialView();

      expect(onStoryChange).not.toHaveBeenCalled();
    });
  });

  // A feed that pages in more groups while the player is open. The counts are
  // copied when the controller is created, so without an update every group
  // past the first page stays out of reach.
  describe('groups that arrive while the player is open', () => {
    it('cannot reach a group it was never told about', () => {
      const onGroupChange = vi.fn();
      const ctrl = makeController({}, { onGroupChange });

      ctrl.goToGroup(3);

      expect(ctrl.state.activeGroupIndex.value).toBe(0);
      expect(onGroupChange).not.toHaveBeenCalled();
    });

    it('reaches an added group by index once the counts are updated', () => {
      const onGroupChange = vi.fn();
      const ctrl = makeController({}, { onGroupChange });

      ctrl.updateConfig({ groupCount: 4, storyCounts: [3, 2, 4, 2] });
      ctrl.goToGroup(3);

      expect(ctrl.state.activeGroupIndex.value).toBe(3);
      expect(ctrl.state.activeStoryIndex.value).toBe(0);
      expect(onGroupChange).toHaveBeenCalledWith(3);
    });

    it('moves on to an added group instead of closing after the old last one', () => {
      const onClose = vi.fn();
      const ctrl = makeController(
        { initialGroupIndex: 2, initialStoryIndex: 3 },
        { onClose },
      );

      ctrl.updateConfig({ groupCount: 4, storyCounts: [3, 2, 4, 2] });
      ctrl.nextStory();

      expect(onClose).not.toHaveBeenCalled();
      expect(ctrl.state.activeGroupIndex.value).toBe(3);
    });

    it('reaches a story added to a group already open', () => {
      const ctrl = makeController({
        initialGroupIndex: 1,
        initialStoryIndex: 1,
      });

      ctrl.updateConfig({ groupCount: 3, storyCounts: [3, 3, 4] });
      ctrl.nextStory();

      expect(ctrl.state.activeGroupIndex.value).toBe(1);
      expect(ctrl.state.activeStoryIndex.value).toBe(2);
    });

    it('keeps where each group was left', () => {
      const ctrl = makeController();
      ctrl.nextStory();
      ctrl.goToGroup(1);

      ctrl.updateConfig({ groupCount: 4, storyCounts: [3, 2, 4, 2] });

      expect(ctrl.getLastStoryIndex(0)).toBe(1);
      expect(ctrl.state.activeGroupIndex.value).toBe(1);
    });

    it('announces nothing by itself', () => {
      const events = {
        onStoryChange: vi.fn(),
        onGroupChange: vi.fn(),
        onStoryViewed: vi.fn(),
        onComplete: vi.fn(),
        onClose: vi.fn(),
      };
      const ctrl = makeController({}, events);

      ctrl.updateConfig({ groupCount: 4, storyCounts: [3, 2, 4, 2] });

      for (const event of Object.values(events)) {
        expect(event).not.toHaveBeenCalled();
      }
    });

    it('is not affected by later changes to the array it was given', () => {
      const ctrl = makeController({
        initialGroupIndex: 2,
        initialStoryIndex: 3,
      });
      const storyCounts = [3, 2, 4, 2];

      ctrl.updateConfig({ groupCount: 4, storyCounts });
      storyCounts[3] = 0;
      ctrl.nextStory();
      ctrl.nextStory();

      expect(ctrl.state.activeGroupIndex.value).toBe(3);
      expect(ctrl.state.activeStoryIndex.value).toBe(1);
    });

    // A feed can also lose groups and stories. The player stays on something
    // that still exists rather than pointing past the end.
    it('pulls the position back inside a feed that shrank', () => {
      const ctrl = makeController({
        initialGroupIndex: 2,
        initialStoryIndex: 3,
      });

      ctrl.updateConfig({ groupCount: 2, storyCounts: [3, 2] });

      expect(ctrl.state.activeGroupIndex.value).toBe(1);
      expect(ctrl.state.activeStoryIndex.value).toBeLessThan(2);
      expect(ctrl.getLastStoryIndex(1)).toBeLessThan(2);
    });

    it('pulls a remembered story back inside a group that lost stories', () => {
      const ctrl = makeController({ initialStoryIndex: 2 });
      ctrl.goToGroup(1);

      ctrl.updateConfig({ groupCount: 3, storyCounts: [1, 2, 4] });

      expect(ctrl.getLastStoryIndex(0)).toBe(0);
    });
  });
});
