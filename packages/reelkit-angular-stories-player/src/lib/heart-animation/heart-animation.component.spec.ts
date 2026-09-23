import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

  // Keyframes names are global to the page, so an app declaring its own
  // animation under the same bare name would replace the heart's.
  it('names its animation under the package prefix', () => {
    const heartStyles = readFileSync(
      join(__dirname, '..', 'styles', 'heart-animation.css'),
      'utf8',
    );
    const names = [...heartStyles.matchAll(/@keyframes\s+([\w-]+)/g)].map(
      (match) => match[1],
    );

    expect(names).not.toHaveLength(0);
    for (const name of names) expect(name).toMatch(/^rk-stories-/);
  });
});
