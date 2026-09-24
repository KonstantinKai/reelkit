import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkImageStorySlideComponent } from './image-story-slide.component';

function createSlide(
  inputs: Record<string, unknown> = {},
): ComponentFixture<RkImageStorySlideComponent> {
  const fixture = TestBed.createComponent(RkImageStorySlideComponent);
  fixture.componentRef.setInput('src', '/story.jpg');
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  return fixture;
}

describe('RkImageStorySlideComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RkImageStorySlideComponent] });
  });

  afterEach(() => TestBed.resetTestingModule());

  // A drag on the story moves the player; the browser's own image drag would
  // steal it and float a ghost of the picture instead.
  it('draws the story image with the shared class, never draggable', () => {
    const img = createSlide().debugElement.query(By.css('img'))
      .nativeElement as HTMLImageElement;

    expect(img.getAttribute('src')).toBe('/story.jpg');
    expect(img.classList).toContain('rk-stories-image');
    expect(img.getAttribute('draggable')).toBe('false');
  });

  it('reserves the box before the image arrives when given a ratio', () => {
    const fixture = createSlide({ aspectRatio: 0.5625 });
    const img = fixture.debugElement.query(By.css('img'))
      .nativeElement as HTMLImageElement;
    expect(img.style.aspectRatio).toBe('0.5625');
  });

  // The timer starts on this, not on render: a story the viewer cannot see
  // yet must not be counting down.
  it('reports the image as loaded', () => {
    const fixture = createSlide();
    let loaded = 0;
    fixture.componentInstance.loaded.subscribe(() => loaded++);

    fixture.debugElement
      .query(By.css('img'))
      .nativeElement.dispatchEvent(new Event('load'));

    expect(loaded).toBe(1);
  });

  it('hides a broken image rather than showing the browser icon', () => {
    const fixture = createSlide();
    let failed = 0;
    fixture.componentInstance.failed.subscribe(() => failed++);
    const img = fixture.debugElement.query(By.css('img'))
      .nativeElement as HTMLImageElement;

    img.dispatchEvent(new Event('error'));

    expect(img.style.display).toBe('none');
    expect(failed).toBe(1);
  });
});
