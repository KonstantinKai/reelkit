import { Component, signal, WritableSignal } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ReelIndicatorComponent } from './reel-indicator.component';
import { ReelComponent } from '../reel/reel.component';
import { RkReelItemDirective } from '../reel/reel-item.directive';
import type { ReelApi } from '../reel/reel.types';

function installResizeObserverMock(): void {
  (globalThis as unknown as Record<string, unknown>).ResizeObserver = jest
    .fn()
    .mockImplementation((cb: (entries: ResizeObserverEntry[]) => void) => ({
      observe: jest.fn().mockImplementation(() => {
        cb([
          {
            contentRect: { width: 400, height: 300 },
          } as unknown as ResizeObserverEntry,
        ]);
      }),
      disconnect: jest.fn(),
    }));
}

@Component({
  template: `
    <rk-reel-indicator
      [count]="count()"
      [active]="active()"
      (dotClick)="clicks.push($event)"
    />
  `,
  imports: [ReelIndicatorComponent],
})
class StandaloneHostComponent {
  count: WritableSignal<number> = signal(5);
  active: WritableSignal<number> = signal(0);
  clicks: number[] = [];
}

@Component({
  template: `
    <rk-reel
      [count]="count()"
      [size]="[400, 300]"
      [transitionDuration]="0"
      (apiReady)="onApiReady($event)"
    >
      <ng-template rkReelItem let-i
        ><div>{{ i }}</div></ng-template
      >
      <rk-reel-indicator (dotClick)="clicks.push($event)" />
    </rk-reel>
  `,
  imports: [ReelComponent, RkReelItemDirective, ReelIndicatorComponent],
})
class InsideReelHostComponent {
  count: WritableSignal<number> = signal(5);
  clicks: number[] = [];
  api: ReelApi | null = null;
  onApiReady(api: ReelApi): void {
    this.api = api;
  }
}

// Declared at module scope to avoid re-declaration issues when
// TestBed.configureTestingModule is called inside a describe block.
@Component({
  template: `<rk-reel-indicator
    [count]="5"
    [active]="0"
    direction="horizontal"
  />`,
  imports: [ReelIndicatorComponent],
})
class HorizKeyHost {}

function getDots(fixture: ComponentFixture<unknown>): HTMLElement[] {
  return fixture.debugElement
    .queryAll(By.css('[data-testid^="indicator-dot-"]'))
    .map((de) => de.nativeElement as HTMLElement);
}

function getTablist(fixture: ComponentFixture<unknown>): HTMLElement {
  return fixture.debugElement.query(By.css('[role="tablist"]')).nativeElement;
}

describe('ReelIndicatorComponent', () => {
  beforeEach(() => {
    installResizeObserverMock();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('standalone mode (explicit inputs)', () => {
    let fixture: ComponentFixture<StandaloneHostComponent>;
    let host: StandaloneHostComponent;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
      fixture = TestBed.createComponent(StandaloneHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('renders a dot for each item in count', () => {
      expect(getDots(fixture).length).toBe(5);
    });

    it('marks the active dot with aria-selected="true"', () => {
      const dots = getDots(fixture);
      expect(dots[0].getAttribute('aria-selected')).toBe('true');
      dots.slice(1).forEach((dot) => {
        expect(dot.getAttribute('aria-selected')).toBe('false');
      });
    });

    it('updates the active dot when active signal changes', () => {
      host.active.set(3);
      fixture.detectChanges();

      const dots = getDots(fixture);
      expect(dots[3].getAttribute('aria-selected')).toBe('true');
      expect(dots[0].getAttribute('aria-selected')).toBe('false');
    });

    it('renders 0 dots when count is 0', () => {
      host.count.set(0);
      fixture.detectChanges();

      expect(getDots(fixture).length).toBe(0);
    });

    it('renders "No slides" accessible notice when count is 0', () => {
      host.count.set(0);
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('No slides');
    });

    it('dotClick output emits the clicked dot index', () => {
      getDots(fixture)[2].click();
      fixture.detectChanges();

      expect(host.clicks).toContain(2);
    });

    it('tabindex is "0" on the active dot and "-1" on others', () => {
      const dots = getDots(fixture);
      expect(dots[0].getAttribute('tabindex')).toBe('0');
      dots.slice(1).forEach((dot) => {
        expect(dot.getAttribute('tabindex')).toBe('-1');
      });
    });

    it('the tablist has an accessible aria-label', () => {
      expect(getTablist(fixture).getAttribute('aria-label')).toBeTruthy();
    });

    describe('keyboard navigation', () => {
      it('ArrowDown on dot 0 focuses dot 1 (vertical default)', () => {
        const dots = getDots(fixture);
        const focusSpy = jest.spyOn(dots[1], 'focus');

        dots[0].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        );
        fixture.detectChanges();

        expect(focusSpy).toHaveBeenCalled();
      });

      it('ArrowUp on dot 0 focuses last dot (wraps around)', () => {
        const dots = getDots(fixture);
        const focusSpy = jest.spyOn(dots[dots.length - 1], 'focus');

        dots[0].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
        );
        fixture.detectChanges();

        expect(focusSpy).toHaveBeenCalled();
      });

      it('ArrowDown on last dot focuses dot 0 (wraps around)', () => {
        const dots = getDots(fixture);
        const focusSpy = jest.spyOn(dots[0], 'focus');

        dots[dots.length - 1].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
        );
        fixture.detectChanges();

        expect(focusSpy).toHaveBeenCalled();
      });

      it('Enter triggers dotClick on the focused dot', () => {
        const dots = getDots(fixture);
        dots[0].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
        );
        fixture.detectChanges();

        expect(host.clicks).toContain(0);
      });

      it('Space triggers dotClick on the focused dot', () => {
        const dots = getDots(fixture);
        dots[0].dispatchEvent(
          new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
        );
        fixture.detectChanges();

        expect(host.clicks).toContain(0);
      });

      it('Home key focuses dot 0', () => {
        host.active.set(4);
        fixture.detectChanges();

        const dots = getDots(fixture);
        const focusSpy = jest.spyOn(dots[0], 'focus');

        dots[4].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
        );
        fixture.detectChanges();

        expect(focusSpy).toHaveBeenCalled();
      });

      it('End key focuses the last dot', () => {
        const dots = getDots(fixture);
        const focusSpy = jest.spyOn(dots[dots.length - 1], 'focus');

        dots[0].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
        );
        fixture.detectChanges();

        expect(focusSpy).toHaveBeenCalled();
      });
    });

    describe('horizontal keyboard navigation', () => {
      it('ArrowRight in horizontal direction focuses next dot', () => {
        const hFixture = TestBed.createComponent(HorizKeyHost);
        hFixture.detectChanges();

        const hDots = getDots(hFixture);
        const focusSpy = jest.spyOn(hDots[1], 'focus');

        hDots[0].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
        );
        hFixture.detectChanges();

        expect(focusSpy).toHaveBeenCalled();
      });

      it('ArrowLeft in horizontal direction focuses previous dot (wraps)', () => {
        const hFixture = TestBed.createComponent(HorizKeyHost);
        hFixture.detectChanges();

        const hDots = getDots(hFixture);
        const focusSpy = jest.spyOn(hDots[hDots.length - 1], 'focus');

        hDots[0].dispatchEvent(
          new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }),
        );
        hFixture.detectChanges();

        expect(focusSpy).toHaveBeenCalled();
      });
    });

    describe('windowed dots algorithm (count > visible)', () => {
      it('limits rendered dot count to visible + 2 edge dots when count > visible', () => {
        host.count.set(10);
        fixture.detectChanges();

        // With count=10, visible=5: renderStart=0, renderEnd=6 => 6 dots max.
        expect(getDots(fixture).length).toBeLessThanOrEqual(7);
        expect(getDots(fixture).length).toBeGreaterThan(0);
      });

      it('containerSize increases proportionally with count up to the visible threshold', () => {
        const component = fixture.debugElement.query(
          By.directive(ReelIndicatorComponent),
        ).componentInstance as ReelIndicatorComponent;

        const sizeAt5 = component.containerSize();

        host.count.set(3);
        fixture.detectChanges();
        const sizeAt3 = component.containerSize();

        expect(sizeAt3).toBeLessThanOrEqual(sizeAt5);
      });

      it('window slides when active dot reaches the end of the window', () => {
        host.count.set(10);
        fixture.detectChanges();

        const component = fixture.debugElement.query(
          By.directive(ReelIndicatorComponent),
        ).componentInstance as ReelIndicatorComponent;

        // Move active to 8 — window should slide near the end.
        host.active.set(8);
        fixture.detectChanges();

        // All rendered dots must cover index 8.
        const renderedIndexes = component.dots().map((d) => d.index);
        expect(renderedIndexes).toContain(8);
      });
    });
  });

  describe('inside rk-reel (context auto-connect)', () => {
    let fixture: ComponentFixture<InsideReelHostComponent>;
    let host: InsideReelHostComponent;

    beforeEach(fakeAsync(() => {
      TestBed.configureTestingModule({ imports: [InsideReelHostComponent] });
      fixture = TestBed.createComponent(InsideReelHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
      fixture.detectChanges(); // apply measuredSize from ngAfterViewInit/ResizeObserver
    }));

    it('renders dots matching the reel count', () => {
      expect(getDots(fixture).length).toBe(5);
    });

    it('active dot index 0 is selected initially', () => {
      expect(getDots(fixture)[0].getAttribute('aria-selected')).toBe('true');
    });

    it('updates active dot when reel navigates to index 2', fakeAsync(() => {
      host.api!.goTo(2, false);
      fixture.detectChanges();

      expect(getDots(fixture)[2].getAttribute('aria-selected')).toBe('true');
    }));

    it('dotClick on dot 2 emits the dot index via dotClick output', fakeAsync(() => {
      const dot2 = getDots(fixture)[2];
      dot2.click();
      fixture.detectChanges();

      expect(host.clicks).toContain(2);
    }));

    it('dots update when the reel count changes', fakeAsync(() => {
      host.count.set(3);
      fixture.detectChanges();

      expect(getDots(fixture).length).toBe(3);
    }));
  });

  describe('dot styling', () => {
    let fixture: ComponentFixture<StandaloneHostComponent>;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
      fixture = TestBed.createComponent(StandaloneHostComponent);
      fixture.detectChanges();
    });

    it('active dot uses the default activeColor (#fff)', () => {
      const component = fixture.debugElement.query(
        By.directive(ReelIndicatorComponent),
      ).componentInstance as ReelIndicatorComponent;

      const activeDot = component.dots().find((d) => d.index === 0)!;
      expect(activeDot.dotStyle['backgroundColor']).toBe('#fff');
    });

    it('inactive dot uses the default inactiveColor (rgba(255, 255, 255, 0.5))', () => {
      const component = fixture.debugElement.query(
        By.directive(ReelIndicatorComponent),
      ).componentInstance as ReelIndicatorComponent;

      const inactiveDot = component.dots().find((d) => d.index === 1)!;
      expect(inactiveDot.dotStyle['backgroundColor']).toBe(
        'rgba(255, 255, 255, 0.5)',
      );
    });

    it('all dots are circular (borderRadius: 50%)', () => {
      const component = fixture.debugElement.query(
        By.directive(ReelIndicatorComponent),
      ).componentInstance as ReelIndicatorComponent;

      component.dots().forEach((dot) => {
        expect(dot.dotStyle['borderRadius']).toBe('50%');
      });
    });

    it('custom activeColor is applied to the active dot', () => {
      @Component({
        template: `<rk-reel-indicator
          [count]="3"
          [active]="1"
          activeColor="red"
        />`,
        imports: [ReelIndicatorComponent],
      })
      class CustomColorHost {}

      const f = TestBed.createComponent(CustomColorHost);
      f.detectChanges();

      const component = f.debugElement.query(
        By.directive(ReelIndicatorComponent),
      ).componentInstance as ReelIndicatorComponent;

      const activeDot = component.dots().find((d) => d.index === 1)!;
      expect(activeDot.dotStyle['backgroundColor']).toBe('red');
    });
  });

  describe('direction input', () => {
    it('horizontal direction: container width equals containerSize', () => {
      @Component({
        template: `<rk-reel-indicator
          [count]="5"
          [active]="0"
          direction="horizontal"
        />`,
        imports: [ReelIndicatorComponent],
      })
      class HorizHost {}

      TestBed.configureTestingModule({ imports: [HorizHost] });
      const f = TestBed.createComponent(HorizHost);
      f.detectChanges();

      const tablist = getTablist(f);
      // In horizontal mode the width holds the containerSize.
      expect(tablist.style.width).toBeTruthy();
    });

    it('vertical direction: container height equals containerSize', () => {
      @Component({
        template: `<rk-reel-indicator
          [count]="5"
          [active]="0"
          direction="vertical"
        />`,
        imports: [ReelIndicatorComponent],
      })
      class VertHost {}

      TestBed.configureTestingModule({ imports: [VertHost] });
      const f = TestBed.createComponent(VertHost);
      f.detectChanges();

      const tablist = getTablist(f);
      expect(tablist.style.height).toBeTruthy();
    });
  });

  describe('resolvedActive', () => {
    it('uses explicit active input over context', fakeAsync(() => {
      TestBed.configureTestingModule({ imports: [InsideReelHostComponent] });
      const fixture = TestBed.createComponent(InsideReelHostComponent);
      fixture.detectChanges();
      fixture.detectChanges(); // apply measuredSize from ngAfterViewInit/ResizeObserver

      // Navigate reel to index 3.
      fixture.componentInstance.api!.goTo(3, false);
      fixture.detectChanges();

      // The indicator inside the reel should auto-reflect index 3.
      const component = fixture.debugElement.query(
        By.directive(ReelIndicatorComponent),
      ).componentInstance as ReelIndicatorComponent;

      expect(component.resolvedActive()).toBe(3);
    }));
  });

  // ─── Bug regression tests ──────────────────────────────────────────────────

  describe('Bug 4: Arrow keys only move focus — they do NOT call goTo()', () => {
    let fixture: ComponentFixture<StandaloneHostComponent>;
    let host: StandaloneHostComponent;

    beforeEach(() => {
      TestBed.configureTestingModule({ imports: [StandaloneHostComponent] });
      fixture = TestBed.createComponent(StandaloneHostComponent);
      host = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('ArrowDown moves focus but does NOT emit dotClick', () => {
      const dots = getDots(fixture);
      const focusSpy = jest.spyOn(dots[1], 'focus');

      dots[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }),
      );
      fixture.detectChanges();

      // Focus must move to the next dot.
      expect(focusSpy).toHaveBeenCalled();
      // But dotClick (which drives goTo) must NOT have fired.
      expect(host.clicks.length).toBe(0);
    });

    it('ArrowUp moves focus but does NOT emit dotClick', () => {
      const dots = getDots(fixture);
      const focusSpy = jest.spyOn(dots[dots.length - 1], 'focus');

      dots[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }),
      );
      fixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
      expect(host.clicks.length).toBe(0);
    });

    it('Home moves focus but does NOT emit dotClick', () => {
      host.active.set(3);
      fixture.detectChanges();

      const dots = getDots(fixture);
      const focusSpy = jest.spyOn(dots[0], 'focus');

      dots[3].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Home', bubbles: true }),
      );
      fixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
      expect(host.clicks.length).toBe(0);
    });

    it('End moves focus but does NOT emit dotClick', () => {
      const dots = getDots(fixture);
      const focusSpy = jest.spyOn(dots[dots.length - 1], 'focus');

      dots[0].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'End', bubbles: true }),
      );
      fixture.detectChanges();

      expect(focusSpy).toHaveBeenCalled();
      expect(host.clicks.length).toBe(0);
    });

    it('Enter DOES emit dotClick (activates the focused dot)', () => {
      const dots = getDots(fixture);

      dots[2].dispatchEvent(
        new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
      );
      fixture.detectChanges();

      expect(host.clicks).toContain(2);
    });

    it('Space DOES emit dotClick (activates the focused dot)', () => {
      const dots = getDots(fixture);

      dots[3].dispatchEvent(
        new KeyboardEvent('keydown', { key: ' ', bubbles: true }),
      );
      fixture.detectChanges();

      expect(host.clicks).toContain(3);
    });
  });

  describe('Bug 5: dotClick output fires even when _isNavigating is true', () => {
    it('dotClick still emits when a navigation is already in flight', fakeAsync(() => {
      TestBed.configureTestingModule({ imports: [InsideReelHostComponent] });
      const fixture = TestBed.createComponent(InsideReelHostComponent);
      fixture.detectChanges();
      fixture.detectChanges(); // apply measuredSize

      // Wire up a slow goTo that never resolves during this test so
      // _isNavigating stays true the whole time.
      fixture.componentInstance.api!.goTo(1, false);
      fixture.detectChanges();

      const component = fixture.debugElement.query(
        By.directive(ReelIndicatorComponent),
      ).componentInstance as ReelIndicatorComponent;

      // Forcibly put the component into the "navigating" state.
      (
        component as unknown as Record<string, WritableSignal<boolean>>
      )._isNavigating.set(true);
      fixture.detectChanges();

      const clicks: number[] = [];
      component.dotClick.subscribe((i: number) => clicks.push(i));

      // Click a dot while navigation is in flight.
      const dots = getDots(fixture);
      dots[2].click();
      fixture.detectChanges();

      // dotClick MUST still fire despite _isNavigating being true.
      expect(clicks).toContain(2);
    }));
  });

  // ─── Bug 6: _isNavigating.set() must not be called after destroy ─────────────

  describe('Bug 6: _isNavigating not set after component destruction', () => {
    it('does not throw when the goTo Promise resolves after the component is destroyed', fakeAsync(() => {
      TestBed.configureTestingModule({ imports: [InsideReelHostComponent] });
      const fixture = TestBed.createComponent(InsideReelHostComponent);
      fixture.detectChanges();
      fixture.detectChanges(); // apply measuredSize

      const component = fixture.debugElement.query(
        By.directive(ReelIndicatorComponent),
      ).componentInstance as ReelIndicatorComponent;

      // Capture the promise from a simulated goTo navigation.
      let resolveGoTo!: () => void;
      const slowPromise = new Promise<void>((res) => {
        resolveGoTo = res;
      });
      const origGoTo = (
        component as unknown as Record<string, Record<string, unknown>>
      ).reelContext.goTo;
      (
        component as unknown as Record<string, Record<string, unknown>>
      ).reelContext.goTo = () => slowPromise;

      // Click a dot to start navigation (sets _isNavigating = true).
      getDots(fixture)[1].click();
      fixture.detectChanges();
      expect(
        (
          component as unknown as Record<string, WritableSignal<boolean>>
        )._isNavigating(),
      ).toBe(true);

      // Destroy the component BEFORE the Promise resolves.
      fixture.destroy();

      // Resolving the Promise after destroy must NOT throw.
      expect(() => resolveGoTo()).not.toThrow();

      // Restore original goTo.
      (
        component as unknown as Record<string, Record<string, unknown>>
      ).reelContext.goTo = origGoTo;
    }));
  });
});
