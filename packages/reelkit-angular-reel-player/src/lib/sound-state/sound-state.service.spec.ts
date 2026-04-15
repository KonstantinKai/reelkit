import { TestBed } from '@angular/core/testing';
import { SoundStateService } from './sound-state.service';

describe('SoundStateService', () => {
  let service: SoundStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SoundStateService] });
    service = TestBed.inject(SoundStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('muted starts true', () => {
    expect(service.muted()).toBe(true);
  });

  it('disabled starts false', () => {
    expect(service.disabled()).toBe(false);
  });

  it('toggle() flips muted from true to false', () => {
    service.toggle();
    expect(service.muted()).toBe(false);
  });

  it('toggle() flips muted back to true on second call', () => {
    service.toggle();
    service.toggle();
    expect(service.muted()).toBe(true);
  });

  it('setDisabled(true) sets disabled to true', () => {
    service.setDisabled(true);
    expect(service.disabled()).toBe(true);
  });

  it('setDisabled(false) sets disabled back to false', () => {
    service.setDisabled(true);
    service.setDisabled(false);
    expect(service.disabled()).toBe(false);
  });

  it('muted is readonly externally — no set method exposed', () => {
    expect(typeof (service.muted as unknown as { set?: unknown }).set).toBe(
      'undefined',
    );
  });

  it('disabled is readonly externally — no set method exposed', () => {
    expect(typeof (service.disabled as unknown as { set?: unknown }).set).toBe(
      'undefined',
    );
  });

  it('reset() restores muted to true and disabled to false', () => {
    service.toggle();
    service.setDisabled(true);
    expect(service.muted()).toBe(false);
    expect(service.disabled()).toBe(true);

    service.reset();
    expect(service.muted()).toBe(true);
    expect(service.disabled()).toBe(false);
  });
});
