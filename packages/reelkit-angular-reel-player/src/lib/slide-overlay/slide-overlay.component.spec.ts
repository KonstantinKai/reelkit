import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkSlideOverlayComponent } from './slide-overlay.component';

function createFixture(
  inputs: {
    author?: { name: string; avatar: string };
    description?: string;
    likes?: number;
  } = {},
): ComponentFixture<RkSlideOverlayComponent> {
  const fixture = TestBed.createComponent(RkSlideOverlayComponent);
  if (inputs.author !== undefined)
    fixture.componentRef.setInput('author', inputs.author);
  if (inputs.description !== undefined)
    fixture.componentRef.setInput('description', inputs.description);
  if (inputs.likes !== undefined)
    fixture.componentRef.setInput('likes', inputs.likes);
  fixture.detectChanges();
  return fixture;
}

describe('RkSlideOverlayComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RkSlideOverlayComponent],
    });
  });

  // ---------------------------------------------------------------------------
  // Author / avatar
  // ---------------------------------------------------------------------------
  it('shows author name when author input is provided', () => {
    const fixture = createFixture({
      author: { name: 'Jane Doe', avatar: 'https://example.com/avatar.jpg' },
    });
    const name = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-name'),
    );
    expect(name.nativeElement.textContent.trim()).toBe('Jane Doe');
  });

  it('shows avatar image with correct src', () => {
    const fixture = createFixture({
      author: { name: 'Jane Doe', avatar: 'https://example.com/avatar.jpg' },
    });
    const avatar = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-avatar'),
    );
    expect(avatar.nativeElement.getAttribute('src')).toBe(
      'https://example.com/avatar.jpg',
    );
  });

  it('hides author section when author input is omitted', () => {
    const fixture = createFixture({ description: 'Some text' });
    const authorEl = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-author'),
    );
    expect(authorEl).toBeNull();
  });

  it('hides avatar image on load error (avatarError)', () => {
    const fixture = createFixture({
      author: { name: 'Jane Doe', avatar: 'https://example.com/bad.jpg' },
    });

    const avatar = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-avatar'),
    );
    avatar.triggerEventHandler('error', {});
    fixture.detectChanges();

    const avatarAfter = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-avatar'),
    );
    expect(avatarAfter).toBeNull();
  });

  it('still shows author name after avatar error', () => {
    const fixture = createFixture({
      author: { name: 'Jane Doe', avatar: 'https://example.com/bad.jpg' },
    });

    const avatar = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-avatar'),
    );
    avatar.triggerEventHandler('error', {});
    fixture.detectChanges();

    const name = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-name'),
    );
    expect(name).toBeTruthy();
    expect(name.nativeElement.textContent.trim()).toBe('Jane Doe');
  });

  it('resets avatarError when author input changes', () => {
    const fixture = createFixture({
      author: { name: 'Jane Doe', avatar: 'https://example.com/bad.jpg' },
    });

    const avatar = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-avatar'),
    );
    avatar.triggerEventHandler('error', {});
    fixture.detectChanges();

    // Change to new author — avatarError should reset
    fixture.componentRef.setInput('author', {
      name: 'John Smith',
      avatar: 'https://example.com/good.jpg',
    });
    fixture.detectChanges();

    const newAvatar = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-avatar'),
    );
    expect(newAvatar).toBeTruthy();
    expect(newAvatar.nativeElement.getAttribute('src')).toBe(
      'https://example.com/good.jpg',
    );
  });

  // ---------------------------------------------------------------------------
  // Description
  // ---------------------------------------------------------------------------
  it('shows description text when provided', () => {
    const fixture = createFixture({
      description: 'This is a cool reel #nature',
    });
    const desc = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-description'),
    );
    expect(desc.nativeElement.textContent.trim()).toBe(
      'This is a cool reel #nature',
    );
  });

  it('hides description when description input is omitted', () => {
    const fixture = createFixture({ likes: 100 });
    const desc = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-description'),
    );
    expect(desc).toBeNull();
  });

  // ---------------------------------------------------------------------------
  // Likes formatting
  // ---------------------------------------------------------------------------
  it('shows raw number for likes under 1K', () => {
    const fixture = createFixture({ likes: 999 });
    const likes = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-likes'),
    );
    expect(likes.nativeElement.textContent).toContain('999');
  });

  it('formats 1000 likes as 1K', () => {
    const fixture = createFixture({ likes: 1000 });
    const likes = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-likes'),
    );
    expect(likes.nativeElement.textContent).toContain('1K');
  });

  it('formats 1500 likes as 1.5K', () => {
    const fixture = createFixture({ likes: 1500 });
    const likes = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-likes'),
    );
    expect(likes.nativeElement.textContent).toContain('1.5K');
  });

  it('formats 1000000 likes as 1M', () => {
    const fixture = createFixture({ likes: 1_000_000 });
    const likes = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-likes'),
    );
    expect(likes.nativeElement.textContent).toContain('1M');
  });

  it('formats 2500000 likes as 2.5M', () => {
    const fixture = createFixture({ likes: 2_500_000 });
    const likes = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-likes'),
    );
    expect(likes.nativeElement.textContent).toContain('2.5M');
  });

  it('hides likes section when likes input is omitted', () => {
    const fixture = createFixture({ description: 'No likes' });
    const likes = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-likes'),
    );
    expect(likes).toBeNull();
  });

  it('likes section has aria-label with count', () => {
    const fixture = createFixture({ likes: 42 });
    const likes = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay-likes'),
    );
    expect(likes.nativeElement.getAttribute('aria-label')).toBe('42 likes');
  });

  // ---------------------------------------------------------------------------
  // Empty state
  // ---------------------------------------------------------------------------
  it('renders nothing when all inputs are omitted', () => {
    const fixture = createFixture({});
    const overlay = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay'),
    );
    expect(overlay).toBeNull();
  });

  it('renders overlay when any input is provided', () => {
    const fixture = createFixture({ likes: 0 });
    const overlay = fixture.debugElement.query(
      By.css('.rk-reel-slide-overlay'),
    );
    expect(overlay).toBeTruthy();
  });
});
