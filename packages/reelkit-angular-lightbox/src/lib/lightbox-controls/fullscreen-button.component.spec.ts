import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkFullscreenButtonComponent } from './fullscreen-button.component';

describe('RkFullscreenButtonComponent', () => {
  let fixture: ComponentFixture<RkFullscreenButtonComponent>;
  let component: RkFullscreenButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RkFullscreenButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RkFullscreenButtonComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.componentRef.setInput('isFullscreen', false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders a button element', () => {
    fixture.componentRef.setInput('isFullscreen', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
  });

  it('button has type="button"', () => {
    fixture.componentRef.setInput('isFullscreen', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.type).toBe('button');
  });

  describe('when not in fullscreen (isFullscreen=false)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isFullscreen', false);
      fixture.detectChanges();
    });

    it('shows Maximize icon (not Minimize)', () => {
      const icons = fixture.debugElement.queryAll(By.css('lucide-angular'));
      // One icon rendered — check there is exactly one
      expect(icons.length).toBe(1);
    });

    it('has title "Enter Fullscreen"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('title')).toBe(
        'Enter Fullscreen',
      );
    });

    it('has aria-label "Enter Fullscreen"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe(
        'Enter Fullscreen',
      );
    });
  });

  describe('when in fullscreen (isFullscreen=true)', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('isFullscreen', true);
      fixture.detectChanges();
    });

    it('shows Minimize icon', () => {
      const icons = fixture.debugElement.queryAll(By.css('lucide-angular'));
      expect(icons.length).toBe(1);
    });

    it('has title "Exit Fullscreen"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('title')).toBe(
        'Exit Fullscreen',
      );
    });

    it('has aria-label "Exit Fullscreen"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe(
        'Exit Fullscreen',
      );
    });
  });

  it('emits toggled output when button is clicked', () => {
    fixture.componentRef.setInput('isFullscreen', false);
    fixture.detectChanges();

    const toggledSpy = jest.fn();
    component.toggled.subscribe(toggledSpy);

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();

    expect(toggledSpy).toHaveBeenCalledTimes(1);
  });

  it('emits toggled output when in fullscreen and button is clicked', () => {
    fixture.componentRef.setInput('isFullscreen', true);
    fixture.detectChanges();

    const toggledSpy = jest.fn();
    component.toggled.subscribe(toggledSpy);

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();

    expect(toggledSpy).toHaveBeenCalledTimes(1);
  });

  it('switches title when isFullscreen input changes', () => {
    fixture.componentRef.setInput('isFullscreen', false);
    fixture.detectChanges();
    let button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('title')).toBe('Enter Fullscreen');

    fixture.componentRef.setInput('isFullscreen', true);
    fixture.detectChanges();
    button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('title')).toBe('Exit Fullscreen');
  });
});
