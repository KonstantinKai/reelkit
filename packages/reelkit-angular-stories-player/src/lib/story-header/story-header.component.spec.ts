import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RkStoryHeaderComponent } from './story-header.component';

const author = { id: 'a1', name: 'Alice', avatar: '/alice.jpg' };

function createHeader(
  inputs: Record<string, unknown> = {},
): ComponentFixture<RkStoryHeaderComponent> {
  const fixture = TestBed.createComponent(RkStoryHeaderComponent);
  fixture.componentRef.setInput('author', author);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  return fixture;
}

function labels(fixture: ComponentFixture<RkStoryHeaderComponent>): string[] {
  return fixture.debugElement
    .queryAll(By.css('button'))
    .map((button) => button.nativeElement.getAttribute('aria-label') as string);
}

describe('RkStoryHeaderComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RkStoryHeaderComponent] });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('always offers a way out', () => {
    expect(labels(createHeader())).toContain('Close');
  });

  // An image story has nothing to unmute, so offering the control would be a
  // button that does nothing.
  it('offers sound only on a video story', () => {
    const onImage = labels(createHeader({ isVideo: false }));
    const onVideo = labels(createHeader({ isVideo: true }));
    expect(onImage).not.toContain('Mute');
    expect(onVideo).toContain('Mute');
  });

  it('names the sound control for what it will do', () => {
    expect(labels(createHeader({ isVideo: true, isMuted: true }))).toContain(
      'Unmute',
    );
    expect(labels(createHeader({ isVideo: true, isMuted: false }))).toContain(
      'Mute',
    );
  });

  it('names the pause control for what it will do', () => {
    expect(labels(createHeader({ isPaused: false }))).toContain('Pause');
    expect(labels(createHeader({ isPaused: true }))).toContain('Play');
  });

  it('draws the verified badge only for a verified author', () => {
    const plain = createHeader();
    const verified = createHeader({
      author: { ...author, verified: true },
    });
    expect(
      plain.debugElement.query(By.css('.rk-stories-header-verified')),
    ).toBeNull();
    expect(
      verified.debugElement.query(By.css('.rk-stories-header-verified')),
    ).toBeTruthy();
  });

  it('spins while the media is still arriving, and stops once it fails', () => {
    const loading = createHeader({ isLoading: true });
    const failed = createHeader({ isLoading: true, isError: true });
    expect(
      loading.debugElement.query(By.css('.rk-stories-header-spinner')),
    ).toBeTruthy();
    expect(
      failed.debugElement.query(By.css('.rk-stories-header-spinner')),
    ).toBeNull();
  });

  // A held press hides the interface without interrupting the story, so the
  // header fades rather than unmounting.
  it('fades out instead of leaving when hidden', () => {
    const fixture = createHeader({ visible: false });
    const header = fixture.debugElement.query(By.css('.rk-stories-header'));
    expect(header).toBeTruthy();
    expect(header.nativeElement.className).toContain(
      'rk-stories-header--hidden',
    );
  });

  it('reports each control instead of acting on it', () => {
    const fixture = createHeader({ isVideo: true });
    const events: string[] = [];
    fixture.componentInstance.closed.subscribe(() => events.push('closed'));
    fixture.componentInstance.pauseToggled.subscribe(() =>
      events.push('pause'),
    );
    fixture.componentInstance.soundToggled.subscribe(() =>
      events.push('sound'),
    );

    for (const button of fixture.debugElement.queryAll(By.css('button'))) {
      button.nativeElement.click();
    }

    expect(events.sort()).toEqual(['closed', 'pause', 'sound']);
  });
});
