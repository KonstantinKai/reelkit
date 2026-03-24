import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkImageSlideComponent } from './image-slide.component';

describe('RkImageSlideComponent', () => {
  let fixture: ComponentFixture<RkImageSlideComponent>;

  function createFixture(
    inputs: Partial<{
      src: string;
      poster: string;
      alt: string;
      isActive: boolean;
      width: number;
      height: number;
    }> = {},
  ): ComponentFixture<RkImageSlideComponent> {
    fixture = TestBed.createComponent(RkImageSlideComponent);
    const comp = fixture.componentRef;
    comp.setInput('src', inputs.src ?? 'https://example.com/img.jpg');
    if (inputs.poster !== undefined) comp.setInput('poster', inputs.poster);
    if (inputs.alt !== undefined) comp.setInput('alt', inputs.alt);
    if (inputs.isActive !== undefined)
      comp.setInput('isActive', inputs.isActive);
    if (inputs.width !== undefined) comp.setInput('width', inputs.width);
    if (inputs.height !== undefined) comp.setInput('height', inputs.height);
    fixture.detectChanges();
    return fixture;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RkImageSlideComponent],
    });
  });

  it('renders the main image with the provided src', () => {
    createFixture({ src: 'https://example.com/photo.jpg' });
    const img = fixture.debugElement.query(By.css('.rk-image-slide-img'));
    expect(img).toBeTruthy();
    expect(img.nativeElement.getAttribute('src')).toBe(
      'https://example.com/photo.jpg',
    );
  });

  it('does not render poster image when poster input is not provided', () => {
    createFixture({ src: 'https://example.com/photo.jpg' });
    const poster = fixture.debugElement.query(By.css('.rk-image-slide-poster'));
    expect(poster).toBeNull();
  });

  it('shows poster while loading (has rk-visible class before load event)', () => {
    createFixture({
      src: 'https://example.com/photo.jpg',
      poster: 'https://example.com/poster.jpg',
    });
    const poster = fixture.debugElement.query(By.css('.rk-image-slide-poster'));
    // Initially isLoading = true, so poster has rk-visible
    expect(poster.nativeElement.classList.contains('rk-visible')).toBe(true);
  });

  it('hides poster after load event fires', () => {
    createFixture({
      src: 'https://example.com/photo.jpg',
      poster: 'https://example.com/poster.jpg',
    });

    const mainImg = fixture.debugElement.query(By.css('.rk-image-slide-img'));
    mainImg.triggerEventHandler('load', {});
    fixture.detectChanges();

    const poster = fixture.debugElement.query(By.css('.rk-image-slide-poster'));
    expect(poster.nativeElement.classList.contains('rk-visible')).toBe(false);
  });

  it('main image gets rk-visible class after load', () => {
    createFixture({ src: 'https://example.com/photo.jpg' });
    const mainImg = fixture.debugElement.query(By.css('.rk-image-slide-img'));

    mainImg.triggerEventHandler('load', {});
    fixture.detectChanges();

    expect(mainImg.nativeElement.classList.contains('rk-visible')).toBe(true);
  });

  it('shows poster as fallback on error and removes main image from DOM', () => {
    createFixture({
      src: 'https://example.com/photo.jpg',
      poster: 'https://example.com/poster.jpg',
    });

    const mainImg = fixture.debugElement.query(By.css('.rk-image-slide-img'));
    mainImg.triggerEventHandler('error', {});
    fixture.detectChanges();

    // hasError = true → main img is removed (the @if(!hasError()) block)
    const mainImgAfter = fixture.debugElement.query(
      By.css('.rk-image-slide-img'),
    );
    expect(mainImgAfter).toBeNull();

    // Poster should still be visible (hasError = true → rk-visible on poster)
    const poster = fixture.debugElement.query(By.css('.rk-image-slide-poster'));
    expect(poster.nativeElement.classList.contains('rk-visible')).toBe(true);
  });

  it('resets isLoading and hasError when src input changes (linkedSignal)', () => {
    createFixture({
      src: 'https://example.com/photo.jpg',
      poster: 'https://example.com/poster.jpg',
    });

    // Trigger an error on first src
    const mainImg = fixture.debugElement.query(By.css('.rk-image-slide-img'));
    mainImg.triggerEventHandler('error', {});
    fixture.detectChanges();

    // Main image should be gone (hasError=true)
    expect(
      fixture.debugElement.query(By.css('.rk-image-slide-img')),
    ).toBeNull();

    // Change src — linkedSignal resets hasError to false and isLoading to true
    fixture.componentRef.setInput('src', 'https://example.com/photo2.jpg');
    fixture.detectChanges();

    // Main image should re-appear (hasError reset to false)
    const newImg = fixture.debugElement.query(By.css('.rk-image-slide-img'));
    expect(newImg).toBeTruthy();
    expect(newImg.nativeElement.getAttribute('src')).toBe(
      'https://example.com/photo2.jpg',
    );

    // Poster should be visible again (isLoading reset to true)
    const poster = fixture.debugElement.query(By.css('.rk-image-slide-poster'));
    expect(poster.nativeElement.classList.contains('rk-visible')).toBe(true);
  });

  it('applies aria-hidden when isActive is false', () => {
    createFixture({ isActive: false });
    const container = fixture.debugElement.query(
      By.css('.rk-image-slide-container'),
    );
    expect(container.nativeElement.getAttribute('aria-hidden')).toBe('true');
  });

  it('removes aria-hidden when isActive is true', () => {
    createFixture({ isActive: true });
    const container = fixture.debugElement.query(
      By.css('.rk-image-slide-container'),
    );
    expect(container.nativeElement.getAttribute('aria-hidden')).toBeNull();
  });

  it('sets width and height styles on the container', () => {
    createFixture({ width: 400, height: 700 });
    const container = fixture.debugElement.query(
      By.css('.rk-image-slide-container'),
    );
    expect(container.nativeElement.style.width).toBe('400px');
    expect(container.nativeElement.style.height).toBe('700px');
  });

  it('applies alt attribute to main image when provided', () => {
    createFixture({
      src: 'https://example.com/photo.jpg',
      alt: 'A sunset photo',
    });
    const mainImg = fixture.debugElement.query(By.css('.rk-image-slide-img'));
    expect(mainImg.nativeElement.getAttribute('alt')).toBe('A sunset photo');
  });

  it('has lazy loading attribute on main image', () => {
    createFixture({ src: 'https://example.com/photo.jpg' });
    const mainImg = fixture.debugElement.query(By.css('.rk-image-slide-img'));
    expect(mainImg.nativeElement.getAttribute('loading')).toBe('lazy');
  });

  it('host element has display:block style', () => {
    createFixture({ src: 'https://example.com/photo.jpg' });
    const hostEl: HTMLElement = fixture.nativeElement;
    expect(hostEl.style.display).toBe('block');
  });
});
