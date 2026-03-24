import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkCloseButtonComponent } from './close-button.component';

describe('RkCloseButtonComponent', () => {
  let fixture: ComponentFixture<RkCloseButtonComponent>;
  let component: RkCloseButtonComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RkCloseButtonComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RkCloseButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('creates the component', () => {
    expect(component).toBeTruthy();
  });

  it('renders a button element', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button).toBeTruthy();
  });

  it('button has type="button" to prevent form submission', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.type).toBe('button');
  });

  it('button has aria-label="Close gallery"', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('aria-label')).toBe(
      'Close gallery',
    );
  });

  it('button has title="Close (Esc)"', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.getAttribute('title')).toBe('Close (Esc)');
  });

  it('applies default className "rk-lightbox-close"', () => {
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.className).toContain('rk-lightbox-close');
  });

  it('applies custom className when className input is set', () => {
    fixture.componentRef.setInput('className', 'my-custom-close-btn');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button'));
    expect(button.nativeElement.className).toContain('my-custom-close-btn');
  });

  it('renders a lucide-angular icon', () => {
    const icon = fixture.debugElement.query(By.css('lucide-angular'));
    expect(icon).toBeTruthy();
  });

  it('emits clicked output when button is clicked', () => {
    const clickedSpy = jest.fn();
    component.clicked.subscribe(clickedSpy);

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    fixture.detectChanges();

    expect(clickedSpy).toHaveBeenCalledTimes(1);
  });

  it('emits clicked output on multiple clicks', () => {
    const clickedSpy = jest.fn();
    component.clicked.subscribe(clickedSpy);

    const button = fixture.debugElement.query(By.css('button'));
    button.nativeElement.click();
    button.nativeElement.click();
    button.nativeElement.click();

    expect(clickedSpy).toHaveBeenCalledTimes(3);
  });
});
