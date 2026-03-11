import { render } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { GestureController, GestureControllerEvents } from '@reelkit/core';

let capturedEvents: GestureControllerEvents | undefined;
const mockAttach = vi.fn();
const mockObserve = vi.fn();
const mockUnobserve = vi.fn();
const mockDetach = vi.fn();

vi.mock('@reelkit/core', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@reelkit/core')>();
  return {
    ...actual,
    createGestureController: (_config: unknown, events: GestureControllerEvents) => {
      capturedEvents = events;
      return {
        attach: mockAttach,
        observe: mockObserve,
        unobserve: mockUnobserve,
        detach: mockDetach,
      } as unknown as GestureController;
    },
  };
});

// eslint-disable-next-line import/first
import { SwipeToClose } from './SwipeToClose';

describe('SwipeToClose', () => {
  beforeEach(() => {
    capturedEvents = undefined;
    mockAttach.mockClear();
    mockObserve.mockClear();
    mockUnobserve.mockClear();
    mockDetach.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('disabled', () => {
    it('renders children without gesture controller when disabled', () => {
      const { container } = render(
        <SwipeToClose enabled={false} onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      expect(container.textContent).toBe('Content');
      expect(mockAttach).not.toHaveBeenCalled();
    });

    it('does not create gesture controller when disabled', () => {
      render(
        <SwipeToClose enabled={false} onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      expect(capturedEvents).toBeUndefined();
    });
  });

  describe('enabled', () => {
    it('attaches gesture controller when enabled', () => {
      render(
        <SwipeToClose enabled={true} onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      expect(mockAttach).toHaveBeenCalled();
      expect(mockObserve).toHaveBeenCalled();
    });

    it('detaches gesture controller on unmount', () => {
      const { unmount } = render(
        <SwipeToClose enabled={true} onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      unmount();

      expect(mockUnobserve).toHaveBeenCalled();
      expect(mockDetach).toHaveBeenCalled();
    });

    it('renders children', () => {
      const { container } = render(
        <SwipeToClose enabled={true} onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      expect(container.textContent).toBe('Content');
    });

    it('applies className to container', () => {
      const { container } = render(
        <SwipeToClose enabled={true} onClose={vi.fn()} className="custom">
          <span>Content</span>
        </SwipeToClose>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.className).toBe('custom');
    });

    it('has initial transform of 0', () => {
      const { container } = render(
        <SwipeToClose enabled={true} onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.transform).toBe('translateY(0px)');
    });

    it('has initial opacity of 1', () => {
      const { container } = render(
        <SwipeToClose enabled={true} onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.opacity).toBe('1');
    });

    it('has no transition initially', () => {
      const { container } = render(
        <SwipeToClose enabled={true} onClose={vi.fn()}>
          <span>Content</span>
        </SwipeToClose>,
      );

      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper.style.transition).toBe('none');
    });
  });
});
