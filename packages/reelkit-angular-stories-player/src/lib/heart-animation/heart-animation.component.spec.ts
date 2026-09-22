import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkHeartAnimationComponent } from './heart-animation.component';

describe('RkHeartAnimationComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RkHeartAnimationComponent] });
  });

  afterEach(() => TestBed.resetTestingModule());

  // The player keeps a heart in the DOM until it says it is done, so this
  // event is the only thing that ever removes one.
  it('reports the end of its animation so the player can drop it', () => {
    const fixture = TestBed.createComponent(RkHeartAnimationComponent);
    fixture.detectChanges();
    let completed = 0;
    fixture.componentInstance.completed.subscribe(() => completed++);

    fixture.debugElement
      .query(By.css('.rk-stories-heart'))
      .nativeElement.dispatchEvent(new Event('animationend'));

    expect(completed).toBe(1);
  });
});
