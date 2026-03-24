import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkSoundButtonComponent } from './sound-button.component';

describe('RkSoundButtonComponent', () => {
  let fixture: ComponentFixture<RkSoundButtonComponent>;
  let component: RkSoundButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RkSoundButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RkSoundButtonComponent);
    component = fixture.componentInstance;
  });

  it('creates the component', () => {
    fixture.componentRef.setInput('muted', false);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('renders a button element', () => {
    fixture.componentRef.setInput('muted', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
  });

  it('button has type="button"', () => {
    fixture.componentRef.setInput('muted', false);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.type).toBe('button');
  });

  describe('when muted=true', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('muted', true);
      fixture.detectChanges();
    });

    it('shows VolumeX icon (one icon rendered)', () => {
      const icons = fixture.debugElement.queryAll(By.css('lucide-angular'));
      expect(icons.length).toBe(1);
    });

    it('has title "Unmute"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('title')).toBe('Unmute');
    });

    it('has aria-label "Unmute"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe('Unmute');
    });
  });

  describe('when muted=false', () => {
    beforeEach(() => {
      fixture.componentRef.setInput('muted', false);
      fixture.detectChanges();
    });

    it('shows Volume2 icon (one icon rendered)', () => {
      const icons = fixture.debugElement.queryAll(By.css('lucide-angular'));
      expect(icons.length).toBe(1);
    });

    it('has title "Mute"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('title')).toBe('Mute');
    });

    it('has aria-label "Mute"', () => {
      const button = fixture.debugElement.query(By.css('button'));
      expect(button.nativeElement.getAttribute('aria-label')).toBe('Mute');
    });
  });

  it('emits toggled output when button is clicked (muted)', () => {
    fixture.componentRef.setInput('muted', true);
    fixture.detectChanges();

    const toggledSpy = jest.fn();
    component.toggled.subscribe(toggledSpy);

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    expect(toggledSpy).toHaveBeenCalledTimes(1);
  });

  it('emits toggled output when button is clicked (unmuted)', () => {
    fixture.componentRef.setInput('muted', false);
    fixture.detectChanges();

    const toggledSpy = jest.fn();
    component.toggled.subscribe(toggledSpy);

    fixture.debugElement.query(By.css('button')).nativeElement.click();
    expect(toggledSpy).toHaveBeenCalledTimes(1);
  });

  it('switches title when muted input changes', () => {
    fixture.componentRef.setInput('muted', false);
    fixture.detectChanges();
    let button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('title')).toBe('Mute');

    fixture.componentRef.setInput('muted', true);
    fixture.detectChanges();
    button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('title')).toBe('Unmute');
  });
});
