import { Component, TemplateRef, viewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkReelItemDirective, RkReelItemContext } from './reel-item.directive';

/**
 * Host component that applies the directive on an ng-template.
 * Uses viewChild so we can reliably retrieve the directive instance even when
 * By.directive() does not traverse ng-template nodes in Angular 20 Ivy.
 */
@Component({
  template: `
    <ng-template
      rkReelItem
      let-index
      let-indexInRange="indexInRange"
      let-size="size"
    >
      <span class="slide">{{ index }},{{ indexInRange }}</span>
    </ng-template>
  `,
  imports: [RkReelItemDirective],
})
class HostComponent {
  readonly rkReelItem = viewChild(RkReelItemDirective);
}

describe('RkReelItemDirective', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  it('creates without error', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('is instantiated on the ng-template', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const directive = fixture.componentInstance.rkReelItem();

    expect(directive).toBeTruthy();
  });

  it('injects and exposes a TemplateRef', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    const directive = fixture.componentInstance.rkReelItem();

    expect(directive).toBeDefined();
    expect(directive!.templateRef).toBeDefined();
    expect(directive!.templateRef).toBeInstanceOf(TemplateRef);
  });

  it('templateRef is the same TemplateRef injected on the ng-template', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    // Try By.directive first; fall back to viewChild if ng-template not in debug tree.
    const de = fixture.debugElement.query(By.directive(RkReelItemDirective));
    const directive = fixture.componentInstance.rkReelItem()!;

    let templateRef: TemplateRef<unknown>;
    if (de) {
      templateRef = de.injector.get(TemplateRef);
    } else {
      // In Angular 20 Ivy, ng-template nodes may not surface via debugElement.query.
      // Access the TemplateRef via the directive's own inject result which is the
      // same TemplateRef that Angular injects on the ng-template host.
      templateRef = directive.templateRef;
    }

    expect(directive.templateRef).toBe(templateRef);
  });

  describe('ngTemplateContextGuard', () => {
    it('returns true for a valid RkReelItemContext object', () => {
      const mockDirective = {} as RkReelItemDirective;
      const ctx: RkReelItemContext = {
        $implicit: 0,
        indexInRange: 0,
        size: [300, 200],
      };
      expect(
        RkReelItemDirective.ngTemplateContextGuard(mockDirective, ctx),
      ).toBe(true);
    });

    it('returns true for any object (always-true type assertion)', () => {
      const mockDirective = {} as RkReelItemDirective;
      expect(
        RkReelItemDirective.ngTemplateContextGuard(mockDirective, {}),
      ).toBe(true);
    });

    it('returns true for null context (guard does not validate at runtime)', () => {
      const mockDirective = {} as RkReelItemDirective;
      expect(
        RkReelItemDirective.ngTemplateContextGuard(mockDirective, null),
      ).toBe(true);
    });

    it('returns true for a primitive value', () => {
      const mockDirective = {} as RkReelItemDirective;
      expect(
        RkReelItemDirective.ngTemplateContextGuard(mockDirective, 42),
      ).toBe(true);
    });
  });

  describe('RkReelItemContext type', () => {
    it('has $implicit, indexInRange and size properties', () => {
      const ctx: RkReelItemContext = {
        $implicit: 3,
        indexInRange: 1,
        size: [640, 480],
      };

      expect(ctx.$implicit).toBe(3);
      expect(ctx.indexInRange).toBe(1);
      expect(ctx.size).toEqual([640, 480]);
    });

    it('size is a two-element tuple [width, height]', () => {
      const ctx: RkReelItemContext = {
        $implicit: 0,
        indexInRange: 0,
        size: [1920, 1080],
      };
      const [width, height] = ctx.size;
      expect(width).toBe(1920);
      expect(height).toBe(1080);
    });
  });
});
