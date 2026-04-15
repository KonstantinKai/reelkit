import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkCounterComponent } from './counter.component';

describe('RkCounterComponent', () => {
  let fixture: ComponentFixture<RkCounterComponent>;
  let component: RkCounterComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RkCounterComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RkCounterComponent);
    component = fixture.componentInstance;
  });

  const setInputs = (currentIndex: number, count: number) => {
    fixture.componentRef.setInput('currentIndex', currentIndex);
    fixture.componentRef.setInput('count', count);
    fixture.detectChanges();
  };

  it('creates the component', () => {
    setInputs(0, 5);
    expect(component).toBeTruthy();
  });

  it('displays "1 / 5" when currentIndex is 0 and count is 5', () => {
    setInputs(0, 5);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.textContent.trim()).toBe('1 / 5');
  });

  it('displays "3 / 10" when currentIndex is 2 and count is 10', () => {
    setInputs(2, 10);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.textContent.trim()).toBe('3 / 10');
  });

  it('displays "1 / 1" for a single item', () => {
    setInputs(0, 1);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.textContent.trim()).toBe('1 / 1');
  });

  it('displays the last item correctly', () => {
    setInputs(4, 5);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.textContent.trim()).toBe('5 / 5');
  });

  it('has aria-live="polite" for screen reader announcements', () => {
    setInputs(0, 3);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.getAttribute('aria-live')).toBe('polite');
  });

  it('has role="status"', () => {
    setInputs(0, 3);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.getAttribute('role')).toBe('status');
  });

  it('has class "rk-lightbox-counter"', () => {
    setInputs(0, 3);
    const span = fixture.debugElement.query(By.css('.rk-lightbox-counter'));
    expect(span).toBeTruthy();
  });

  it('updates display when currentIndex changes', () => {
    setInputs(0, 5);
    let span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.textContent.trim()).toBe('1 / 5');

    fixture.componentRef.setInput('currentIndex', 2);
    fixture.detectChanges();
    span = fixture.debugElement.query(By.css('span'));
    expect(span.nativeElement.textContent.trim()).toBe('3 / 5');
  });
});
