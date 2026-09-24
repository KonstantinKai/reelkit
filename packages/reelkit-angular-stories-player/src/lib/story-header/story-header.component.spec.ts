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
  // As in the React and Vue headers, a control appears only once the host
  // wires it: a pause or sound button nobody handles would do nothing.
  it('draws no pause or sound button unless the host asks for them', () => {
    const bare = labels(createHeader({ isVideo: true }));
    const wired = labels(
      createHeader({
        isVideo: true,
        showPauseButton: true,
        showSoundButton: true,
      }),
    );

    expect(bare).toEqual(['Close']);
    expect(wired).toEqual(expect.arrayContaining(['Mute', 'Pause', 'Close']));
  });

  it('offers sound only on a video story', () => {
    const onImage = labels(
      createHeader({ isVideo: false, showSoundButton: true }),
    );
    const onVideo = labels(
      createHeader({ isVideo: true, showSoundButton: true }),
    );
    expect(onImage).not.toContain('Mute');
    expect(onVideo).toContain('Mute');
  });

  it('names the sound control for what it will do', () => {
    const sound = { isVideo: true, showSoundButton: true };
    expect(labels(createHeader({ ...sound, isMuted: true }))).toContain(
      'Unmute',
    );
    expect(labels(createHeader({ ...sound, isMuted: false }))).toContain(
      'Mute',
    );
  });

  it('names the pause control for what it will do', () => {
    const pause = { showPauseButton: true };
    expect(labels(createHeader({ ...pause, isPaused: false }))).toContain(
      'Pause',
    );
    expect(labels(createHeader({ ...pause, isPaused: true }))).toContain(
      'Play',
    );
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

  it('names the author and shows the avatar', () => {
    const header = createHeader().nativeElement as HTMLElement;
    const avatar = header.querySelector(
      '.rk-stories-header-avatar',
    ) as HTMLImageElement;

    expect(header.querySelector('.rk-stories-header-name')?.textContent).toBe(
      'Alice',
    );
    expect(avatar.src).toContain('/alice.jpg');
    expect(avatar.alt).toBe('Alice');
  });

  it.each([
    ['now', 0],
    ['30m', 30 * 60_000],
    ['2h', 2 * 3_600_000],
    ['3d', 3 * 86_400_000],
    ['2w', 14 * 86_400_000],
  ])('shows %s for a story posted that long ago', (label, age) => {
    const header = createHeader({
      createdAt: new Date(Date.now() - age).toISOString(),
    }).nativeElement as HTMLElement;

    expect(header.querySelector('.rk-stories-header-time')?.textContent).toBe(
      label,
    );
  });

  it('shows no time for a story without a date', () => {
    expect(
      (createHeader().nativeElement as HTMLElement).querySelector(
        '.rk-stories-header-time',
      ),
    ).toBeNull();
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
    const fixture = createHeader({
      isVideo: true,
      showPauseButton: true,
      showSoundButton: true,
    });
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
