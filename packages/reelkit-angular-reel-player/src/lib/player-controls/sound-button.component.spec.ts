import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { signal } from '@angular/core';
import { RkSoundButtonComponent } from './sound-button.component';
import { SoundStateService } from '../sound-state/sound-state.service';

function buildSoundState(muted = true, disabled = false): SoundStateService {
  const mutedSig = signal(muted);
  const disabledSig = signal(disabled);
  return {
    muted: mutedSig.asReadonly(),
    disabled: disabledSig.asReadonly(),
    toggle: jest.fn(() => mutedSig.update((v) => !v)),
    setDisabled: jest.fn((v: boolean) => disabledSig.set(v)),
  } as unknown as SoundStateService;
}

function createFixture(
  soundState: SoundStateService,
  isDisabled = false,
): ComponentFixture<RkSoundButtonComponent> {
  TestBed.overrideProvider(SoundStateService, { useValue: soundState });
  const fixture = TestBed.createComponent(RkSoundButtonComponent);
  if (isDisabled) fixture.componentRef.setInput('isDisabled', true);
  fixture.detectChanges();
  return fixture;
}

describe('RkSoundButtonComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RkSoundButtonComponent],
      providers: [SoundStateService],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const soundState = buildSoundState();
    const fixture = createFixture(soundState);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('injects SoundStateService', () => {
    const soundState = buildSoundState();
    const fixture = createFixture(soundState);
    // The component renders based on the service state, confirming injection
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
  });

  it('shows muted icon (volume-x SVG) when muted is true', () => {
    const soundState = buildSoundState(true);
    const fixture = createFixture(soundState);
    const btn = fixture.debugElement.query(By.css('button'));
    // When muted, the aria-label should be "Unmute"
    expect(btn.nativeElement.getAttribute('aria-label')).toBe('Unmute');
  });

  it('shows unmuted icon (volume-2 SVG) when muted is false', () => {
    const soundState = buildSoundState(false);
    const fixture = createFixture(soundState);
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.getAttribute('aria-label')).toBe('Mute');
  });

  it('hides button entirely when SoundStateService.disabled is true', () => {
    const soundState = buildSoundState(true, true);
    const fixture = createFixture(soundState);
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeNull();
  });

  it('shows button when SoundStateService.disabled is false', () => {
    const soundState = buildSoundState(true, false);
    const fixture = createFixture(soundState);
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn).toBeTruthy();
  });

  it('clicking button calls soundState.toggle() when not disabled', () => {
    const soundState = buildSoundState(true, false);
    const fixture = createFixture(soundState, false);
    const btn = fixture.debugElement.query(By.css('button'));
    btn.triggerEventHandler('click', {});
    expect(soundState.toggle).toHaveBeenCalledTimes(1);
  });

  it('clicking button does NOT call toggle() when isDisabled input is true', () => {
    const soundState = buildSoundState(true, false);
    const fixture = createFixture(soundState, true);
    const btn = fixture.debugElement.query(By.css('button'));
    btn.triggerEventHandler('click', {});
    expect(soundState.toggle).not.toHaveBeenCalled();
  });

  it('button has rk-disabled class when isDisabled input is true', () => {
    const soundState = buildSoundState(true, false);
    const fixture = createFixture(soundState, true);
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList.contains('rk-disabled')).toBe(true);
  });

  it('button does not have rk-disabled class when isDisabled input is false', () => {
    const soundState = buildSoundState(true, false);
    const fixture = createFixture(soundState, false);
    const btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.classList.contains('rk-disabled')).toBe(false);
  });

  it('aria-label updates reactively when mute state changes', () => {
    const soundState = buildSoundState(true, false);
    const fixture = createFixture(soundState, false);

    let btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.getAttribute('aria-label')).toBe('Unmute');

    // Toggle via service
    btn.triggerEventHandler('click', {});
    fixture.detectChanges();

    btn = fixture.debugElement.query(By.css('button'));
    expect(btn.nativeElement.getAttribute('aria-label')).toBe('Mute');
  });
});
