import { Component, signal } from '@angular/core';
import {
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
} from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkSwipeToCloseDirective } from './swipe-to-close.directive';

const mockController = {
  attach: jest.fn(),
  detach: jest.fn(),
  observe: jest.fn(),
  unobserve: jest.fn(),
  updateEvents: jest.fn(),
};

jest.mock('@reelkit/core', () => ({
  ...jest.requireActual('@reelkit/core'),
  createGestureController: jest.fn(() => mockController),
}));

import { createGestureController } from '@reelkit/core';

@Component({
  template: `<div [rkSwipeToClose]="enabled()" (dismissed)="onDismissed()">
    content
  </div>`,
  imports: [RkSwipeToCloseDirective],
})
class TestHostComponent {
  enabled = signal(false);
  dismissed = false;
  onDismissed() {
    this.dismissed = true;
  }
}

@Component({
  template: `<div
    [rkSwipeToClose]="enabled()"
    rkSwipeToCloseDirection="down"
    (dismissed)="onDismissed()"
  >
    content
  </div>`,
  imports: [RkSwipeToCloseDirective],
})
class TestHostDownComponent {
  enabled = signal(false);
  dismissed = false;
  onDismissed() {
    this.dismissed = true;
  }
}

describe('RkSwipeToCloseDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the directive', () => {
    const directive = fixture.debugElement.query(
      By.directive(RkSwipeToCloseDirective),
    );
    expect(directive).toBeTruthy();
  });

  it('does not attach gesture controller when disabled (default false)', () => {
    expect(mockController.attach).not.toHaveBeenCalled();
    expect(mockController.observe).not.toHaveBeenCalled();
  });

  it('attaches and observes gesture controller when enabled', () => {
    host.enabled.set(true);
    fixture.detectChanges();

    expect(createGestureController).toHaveBeenCalledWith(
      { useTouchEventsOnly: true },
      expect.any(Object),
    );
    expect(mockController.attach).toHaveBeenCalledTimes(1);
    expect(mockController.observe).toHaveBeenCalledTimes(1);
  });

  it('tears down controller when disabled after being enabled', () => {
    host.enabled.set(true);
    fixture.detectChanges();

    host.enabled.set(false);
    fixture.detectChanges();

    expect(mockController.unobserve).toHaveBeenCalled();
    expect(mockController.detach).toHaveBeenCalled();
  });

  it('tears down on destroy', () => {
    host.enabled.set(true);
    fixture.detectChanges();

    fixture.destroy();

    expect(mockController.unobserve).toHaveBeenCalled();
    expect(mockController.detach).toHaveBeenCalled();
  });

  describe('direction: up (default)', () => {
    let capturedEvents: Parameters<typeof createGestureController>[1];

    beforeEach(() => {
      host.enabled.set(true);
      fixture.detectChanges();
      capturedEvents = (createGestureController as jest.Mock).mock.calls[0][1];
    });

    it('emits dismissed when upward swipe exceeds threshold', fakeAsync(() => {
      const threshold = window.innerHeight * 0.2;
      const distance = -(threshold + 10);

      capturedEvents?.onVerticalDragEnd?.({
        primaryDistance: distance,
        delta: [0, 0],
        distance: [0, Math.abs(distance)],
        primaryDelta: distance,
        velocity: [0, -500],
        primaryVelocity: -500,
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: Date.now(),
      });

      tick(300);
      fixture.detectChanges();

      expect(host.dismissed).toBe(true);
    }));

    it('does not emit dismissed when swipe is below threshold', fakeAsync(() => {
      const threshold = window.innerHeight * 0.2;
      const distance = -(threshold - 10);

      capturedEvents?.onVerticalDragEnd?.({
        primaryDistance: distance,
        delta: [0, 0],
        distance: [0, Math.abs(distance)],
        primaryDelta: distance,
        velocity: [0, -100],
        primaryVelocity: -100,
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: Date.now(),
      });

      tick(300);
      fixture.detectChanges();

      expect(host.dismissed).toBe(false);
    }));

    it('does not emit dismissed when swipe is downward', fakeAsync(() => {
      const threshold = window.innerHeight * 0.2;
      const distance = threshold + 50;

      capturedEvents?.onVerticalDragEnd?.({
        primaryDistance: distance,
        delta: [0, 0],
        distance: [0, distance],
        primaryDelta: distance,
        velocity: [0, 500],
        primaryVelocity: 500,
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: Date.now(),
      });

      tick(300);
      fixture.detectChanges();

      expect(host.dismissed).toBe(false);
    }));

    it('uses current window.innerHeight at drag-end time', fakeAsync(() => {
      const originalHeight = window.innerHeight;

      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: 400,
      });

      const newThreshold = 400 * 0.2;
      const distance = -(newThreshold + 10);

      capturedEvents?.onVerticalDragEnd?.({
        primaryDistance: distance,
        delta: [0, 0],
        distance: [0, Math.abs(distance)],
        primaryDelta: distance,
        velocity: [0, -300],
        primaryVelocity: -300,
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: Date.now(),
      });

      tick(300);
      fixture.detectChanges();

      Object.defineProperty(window, 'innerHeight', {
        configurable: true,
        value: originalHeight,
      });

      expect(host.dismissed).toBe(true);
    }));
  });

  describe('direction: down', () => {
    let downFixture: ComponentFixture<TestHostDownComponent>;
    let downHost: TestHostDownComponent;
    let capturedEvents: Parameters<typeof createGestureController>[1];

    beforeEach(async () => {
      jest.clearAllMocks();
      TestBed.resetTestingModule();

      await TestBed.configureTestingModule({
        imports: [TestHostDownComponent],
      }).compileComponents();

      downFixture = TestBed.createComponent(TestHostDownComponent);
      downHost = downFixture.componentInstance;
      downHost.enabled.set(true);
      downFixture.detectChanges();
      capturedEvents = (createGestureController as jest.Mock).mock.calls[0][1];
    });

    afterEach(() => {
      downFixture.destroy();
    });

    it('emits dismissed on downward swipe exceeding threshold', fakeAsync(() => {
      const threshold = window.innerHeight * 0.2;
      const distance = threshold + 10;

      capturedEvents?.onVerticalDragEnd?.({
        primaryDistance: distance,
        delta: [0, 0],
        distance: [0, distance],
        primaryDelta: distance,
        velocity: [0, 500],
        primaryVelocity: 500,
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: Date.now(),
      });

      tick(300);
      downFixture.detectChanges();

      expect(downHost.dismissed).toBe(true);
    }));

    it('does not emit dismissed on upward swipe when direction is down', fakeAsync(() => {
      const threshold = window.innerHeight * 0.2;
      const distance = -(threshold + 10);

      capturedEvents?.onVerticalDragEnd?.({
        primaryDistance: distance,
        delta: [0, 0],
        distance: [0, Math.abs(distance)],
        primaryDelta: distance,
        velocity: [0, -500],
        primaryVelocity: -500,
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: Date.now(),
      });

      tick(300);
      downFixture.detectChanges();

      expect(downHost.dismissed).toBe(false);
    }));

    it('does not emit dismissed when downward swipe is below threshold', fakeAsync(() => {
      const threshold = window.innerHeight * 0.2;
      const distance = threshold - 10;

      capturedEvents?.onVerticalDragEnd?.({
        primaryDistance: distance,
        delta: [0, 0],
        distance: [0, distance],
        primaryDelta: distance,
        velocity: [0, 100],
        primaryVelocity: 100,
        globalPosition: [0, 0],
        localPosition: [0, 0],
        sourceTimestamp: Date.now(),
      });

      tick(300);
      downFixture.detectChanges();

      expect(downHost.dismissed).toBe(false);
    }));
  });
});
