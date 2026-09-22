import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkStoriesRingComponent } from './stories-ring.component';

const author = { id: 'a1', name: 'Alice', avatar: '/alice.jpg' };

function createRing(
  totalStories: number,
  viewedCount: number,
  extra: Record<string, unknown> = {},
): {
  fixture: ComponentFixture<RkStoriesRingComponent>;
  ring: HTMLElement;
  gradient: string;
} {
  const fixture = TestBed.createComponent(RkStoriesRingComponent);
  fixture.componentRef.setInput('author', author);
  fixture.componentRef.setInput('totalStories', totalStories);
  fixture.componentRef.setInput('viewedCount', viewedCount);
  for (const [name, value] of Object.entries(extra)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();

  const ring = fixture.debugElement.query(By.css('[role="button"]'))
    .nativeElement as HTMLElement;

  return {
    fixture,
    ring,
    gradient: ring.style.getPropertyValue('--rk-stories-ring-gradient'),
  };
}

describe('RkStoriesRingComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RkStoriesRingComponent] });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('paints the ring through a custom property, not the element background', () => {
    const { ring, gradient } = createRing(6, 0);
    expect(gradient).toContain('conic-gradient');
    expect(ring.style.background).toBe('');
  });

  it('treats a half watched group the same as an untouched one', () => {
    const untouched = createRing(6, 0);
    const half = createRing(6, 3);
    expect(half.gradient).toBe(untouched.gradient);
    expect(half.ring.className).toBe(untouched.ring.className);
  });

  it('mutes the ring once every story has been seen', () => {
    const watched = createRing(6, 6);
    const partial = createRing(6, 5);
    expect(watched.ring.className).not.toBe(partial.ring.className);
  });

  it('names the author in the accessible label', () => {
    const { ring } = createRing(3, 0);
    expect(ring.getAttribute('aria-label')).toBe("Alice's stories");
  });

  it('opens nothing by itself — a click is reported and no more', () => {
    const { fixture, ring } = createRing(3, 0);
    const clicks: number[] = [];
    fixture.componentInstance.clicked.subscribe(() => clicks.push(1));

    ring.click();

    expect(clicks).toHaveLength(1);
  });

  it('sizes the avatar from the ring diameter', () => {
    const { fixture } = createRing(3, 0, { size: 96 });
    const avatar = fixture.debugElement.query(By.css('img'))
      .nativeElement as HTMLImageElement;
    expect(Number(avatar.getAttribute('width'))).toBeGreaterThan(0);
    expect(avatar.getAttribute('width')).toBe(avatar.getAttribute('height'));
  });
});
