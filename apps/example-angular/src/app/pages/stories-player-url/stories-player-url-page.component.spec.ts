import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { StoriesPlayerUrlPageComponent } from './stories-player-url-page.component';

function createPage(): ComponentFixture<StoriesPlayerUrlPageComponent> {
  const fixture = TestBed.createComponent(StoriesPlayerUrlPageComponent);
  fixture.detectChanges();
  return fixture;
}

function legends(fixture: ComponentFixture<StoriesPlayerUrlPageComponent>) {
  return fixture.debugElement
    .queryAll(By.css('legend'))
    .map((legend) => (legend.nativeElement.textContent as string).trim());
}

describe('StoriesPlayerUrlPageComponent', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      imports: [StoriesPlayerUrlPageComponent],
      providers: [provideRouter([])],
    });
  });

  afterEach(() => {
    TestBed.resetTestingModule();
    localStorage.clear();
  });

  // The page's point is that the URL key is switchable; without the switches
  // it shows one shape and the demo says nothing the plain page does not.
  it('offers every switch the React demo does', () => {
    expect(legends(createPage())).toEqual([
      'Group addressing',
      'Story addressing',
      'Hash (stable id)',
      'Remember seen',
      'Desktop layout',
      'Progress & header',
    ]);
  });

  // Hashing only means something for an id on the wire, so it stays disabled
  // while both axes are addressed by index.
  it('keeps hashing disabled until an axis is addressed by id', () => {
    const fixture = createPage();
    const hashButtons = fixture.debugElement
      .queryAll(By.css('fieldset'))[2]
      .queryAll(By.css('button'));

    expect(hashButtons.every((b) => b.nativeElement.disabled)).toBe(true);
  });
});
