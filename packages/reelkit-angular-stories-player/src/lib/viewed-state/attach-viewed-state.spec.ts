import { Component, input } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { createFakeStorageAdapter } from '@reelkit/core/testing';
import {
  createStoriesViewedStateController,
  type StoriesViewedStateController,
} from '@reelkit/stories-core';
import { attachViewedState } from './attach-viewed-state';

@Component({ template: '' })
class HostComponent {
  readonly viewed = input<StoriesViewedStateController | undefined>(undefined);

  constructor() {
    attachViewedState(this.viewed);
  }
}

function createController(): StoriesViewedStateController {
  return createStoriesViewedStateController({
    groups: () => [
      {
        author: { id: 'a1', name: 'Alice', avatar: '/alice.jpg' },
        stories: [{ id: 's1', src: '/1.jpg', mediaType: 'image' }],
      },
    ],
    storageKey: 'attach-spec',
    storage: createFakeStorageAdapter().adapter,
  });
}

describe('attachViewedState', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HostComponent] });
  });

  afterEach(() => TestBed.resetTestingModule());

  it('does nothing without a controller', () => {
    const fixture = TestBed.createComponent(HostComponent);
    expect(() => fixture.detectChanges()).not.toThrow();
  });

  it('reads the store while the component is on screen', () => {
    const viewed = createController();
    const release = jest.fn();
    jest.spyOn(viewed, 'attach').mockReturnValue(release);

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('viewed', viewed);
    fixture.detectChanges();

    expect(viewed.attach).toHaveBeenCalledTimes(1);
  });

  // Nothing is read before the component renders, so a server render and the
  // first client render agree on what has been seen.
  it('reads nothing before the first render', () => {
    const viewed = createController();
    jest.spyOn(viewed, 'attach');

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('viewed', viewed);

    expect(viewed.attach).not.toHaveBeenCalled();
  });

  it('releases the store when the component goes', () => {
    const viewed = createController();
    const release = jest.fn();
    jest.spyOn(viewed, 'attach').mockReturnValue(release);

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('viewed', viewed);
    fixture.detectChanges();
    fixture.destroy();

    expect(release).toHaveBeenCalledTimes(1);
  });

  // Attaching is counted, so a ring list and a player can each read the same
  // store and be destroyed in either order.
  it('re-attaches when the controller is swapped', () => {
    const first = createController();
    const firstRelease = jest.fn();
    jest.spyOn(first, 'attach').mockReturnValue(firstRelease);

    const second = createController();
    jest.spyOn(second, 'attach');

    const fixture = TestBed.createComponent(HostComponent);
    fixture.componentRef.setInput('viewed', first);
    fixture.detectChanges();

    fixture.componentRef.setInput('viewed', second);
    fixture.detectChanges();

    expect(firstRelease).toHaveBeenCalledTimes(1);
    expect(second.attach).toHaveBeenCalledTimes(1);
  });
});
