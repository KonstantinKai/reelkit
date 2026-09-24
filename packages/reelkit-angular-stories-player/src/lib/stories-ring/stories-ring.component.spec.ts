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

  it('closes the gradient on the color it opened with', () => {
    expect(createRing(6, 0).gradient).toBe(
      'conic-gradient(from 180deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888, #f09433)',
    );
  });

  it('rotates while anything is left to watch', () => {
    expect(createRing(6, 5).ring.classList).toContain(
      'rk-stories-ring--active',
    );
  });

  it('shows a flat muted ring once the group is fully watched', () => {
    const { ring, gradient } = createRing(6, 6);
    expect(gradient).toBe('rgba(255,255,255,0.25)');
    expect(ring.className).toBe('rk-stories-ring');
  });

  it('stays muted when the viewed count overshoots', () => {
    expect(createRing(6, 9).gradient).toBe('rgba(255,255,255,0.25)');
  });

  it('draws no ring for an empty group', () => {
    const { ring, gradient } = createRing(0, 0);
    expect(gradient).toBe('none');
    expect(ring.className).toBe('rk-stories-ring');
  });

  it('accepts a custom palette', () => {
    expect(
      createRing(3, 1, { gradientColors: ['red', 'rgb(0 0 255)'] }).gradient,
    ).toBe('conic-gradient(from 180deg, red, rgb(0 0 255), red)');
  });

  it('accepts a custom viewed color', () => {
    expect(createRing(3, 3, { viewedColor: '#333' }).gradient).toBe('#333');
  });

  // The ring is a button to assistive technology, so it has to answer the
  // keys a button answers.
  it('opens from the keyboard with Enter or Space, as a button does', () => {
    const { fixture, ring } = createRing(3, 0);
    let clicks = 0;
    fixture.componentInstance.clicked.subscribe(() => clicks++);

    ring.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    ring.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));

    expect(clicks).toBe(2);
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
