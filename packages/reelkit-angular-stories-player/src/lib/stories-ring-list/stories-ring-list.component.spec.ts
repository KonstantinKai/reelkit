import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { createStoriesViewedStateController } from '@reelkit/stories-core';
import { createFakeStorageAdapter } from '@reelkit/core/testing';
import { RkStoriesRingListComponent } from './stories-ring-list.component';
import { RkStoriesRingComponent } from '../stories-ring/stories-ring.component';

const groups = [
  {
    id: 'g1',
    author: { id: 'a1', name: 'Alice', avatar: '/alice.jpg' },
    stories: [
      { id: 's1', src: '/1.jpg', mediaType: 'image' as const },
      { id: 's2', src: '/2.jpg', mediaType: 'image' as const },
    ],
  },
  {
    id: 'g2',
    author: { id: 'a2', name: 'Bo', avatar: '/bo.jpg' },
    stories: [{ id: 's3', src: '/3.jpg', mediaType: 'image' as const }],
  },
];

function createList(
  inputs: Record<string, unknown> = {},
): ComponentFixture<RkStoriesRingListComponent> {
  const fixture = TestBed.createComponent(RkStoriesRingListComponent);
  fixture.componentRef.setInput('groups', groups);
  for (const [name, value] of Object.entries(inputs)) {
    fixture.componentRef.setInput(name, value);
  }
  fixture.detectChanges();
  return fixture;
}

function ringCounts(
  fixture: ComponentFixture<RkStoriesRingListComponent>,
): number[] {
  return fixture.debugElement
    .queryAll(By.directive(RkStoriesRingComponent))
    .map((ring) => ring.componentInstance.viewedCount() as number);
}

describe('RkStoriesRingListComponent', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [RkStoriesRingListComponent] });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('draws one ring per group, with the author under it', () => {
    const fixture = createList();
    const names = fixture.debugElement
      .queryAll(By.css('.rk-stories-ring-list-name'))
      .map((name) => (name.nativeElement.textContent as string).trim());
    expect(names).toEqual(['Alice', 'Bo']);
  });

  it('shows every ring unwatched without a viewed controller', () => {
    expect(ringCounts(createList())).toEqual([0, 0]);
  });

  it('follows the viewed store it was given', () => {
    const viewed = createStoriesViewedStateController({
      groups: () => groups,
      storageKey: 'stories-spec',
      storage: createFakeStorageAdapter().adapter,
    });
    const fixture = createList({ viewed });
    viewed.markViewed(0, 0);
    fixture.detectChanges();

    expect(ringCounts(fixture)[0]).toBe(1);
  });

  // The list is on screen before the player opens, and the player picks its
  // opening story from this store while it first renders.
  it('reads the store while it is on screen and releases it after', () => {
    const viewed = createStoriesViewedStateController({
      groups: () => groups,
      storageKey: 'stories-spec',
      storage: createFakeStorageAdapter().adapter,
    });
    const release = jest.fn();
    jest.spyOn(viewed, 'attach').mockReturnValue(release);

    const fixture = createList({ viewed });
    expect(viewed.attach).toHaveBeenCalledTimes(1);
    expect(release).not.toHaveBeenCalled();

    fixture.destroy();

    expect(release).toHaveBeenCalledTimes(1);
  });

  it('reports which ring was chosen instead of opening anything', () => {
    const fixture = createList();
    const picked: number[] = [];
    fixture.componentInstance.selected.subscribe((index) => picked.push(index));

    fixture.debugElement
      .queryAll(By.directive(RkStoriesRingComponent))[1]
      .query(By.css('[role="button"]'))
      .nativeElement.click();

    expect(picked).toEqual([1]);
  });
});
