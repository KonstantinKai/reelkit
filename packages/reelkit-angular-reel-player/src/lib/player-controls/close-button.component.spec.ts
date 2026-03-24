import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkCloseButtonComponent } from './close-button.component';

describe('RkCloseButtonComponent', () => {
  let fixture: ComponentFixture<RkCloseButtonComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RkCloseButtonComponent],
    });
    fixture = TestBed.createComponent(RkCloseButtonComponent);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('renders a button element', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
  });

  it('button has aria-label "Close player"', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.getAttribute('aria-label')).toBe('Close player');
  });

  it('button has the rk-player-close-btn class', () => {
    const btn = fixture.debugElement.query(By.css('.rk-player-close-btn'));
    expect(btn).toBeTruthy();
  });

  it('button contains an SVG (X icon)', () => {
    const btn = fixture.debugElement.query(By.css('button'));
    const svg = btn.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });

  it('clicked output fires when button is clicked', () => {
    let count = 0;
    fixture.componentInstance.clicked.subscribe(() => {
      count++;
    });

    const btn = fixture.debugElement.query(By.css('button'));
    btn.triggerEventHandler('click', {});

    expect(count).toBe(1);
  });

  it('clicked output fires multiple times on repeated clicks', () => {
    let count = 0;
    fixture.componentInstance.clicked.subscribe(() => {
      count++;
    });

    const btn = fixture.debugElement.query(By.css('button'));
    btn.triggerEventHandler('click', {});
    btn.triggerEventHandler('click', {});
    btn.triggerEventHandler('click', {});

    expect(count).toBe(3);
  });
});
