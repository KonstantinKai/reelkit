import { describe, it } from 'vitest';
import { urlIndexKey } from '../url/urlIndexKey';
import { urlStableIdTwoAxisKey } from '../url/urlStableIdKey';
import {
  createViewedStateController,
  twoAxisViewedTracking,
} from './viewedState';

interface Story {
  id: string;
}

interface Group {
  id: string;
  stories: Story[];
}

const twoAxisKey = () =>
  urlStableIdTwoAxisKey<Group, Story>({
    outerItems: () => [],
    innerItems: (outer) => outer.stories,
  });

// A position that is not a plain slide index carries no inherent order, so
// without a progress function every recording would count as further than the
// last and the furthest-wins rule would quietly stop holding. The type is what
// catches it: at runtime the comparison merely returns false forever.
describe('createViewedStateController options', () => {
  it('takes a plain index key with no progress function', () => {
    createViewedStateController({
      storageKey: 'seen',
      ...urlIndexKey(() => 10),
    });
  });

  it('takes a two-axis key paired with the tracking preset', () => {
    createViewedStateController({
      storageKey: 'seen',
      ...twoAxisKey(),
      ...twoAxisViewedTracking,
    });
  });

  it('takes a two-axis key with a progress function written out', () => {
    createViewedStateController({
      storageKey: 'seen',
      ...twoAxisKey(),
      trackOf: (id) => String(id.outer),
      progressOf: (position) => position.inner,
    });
  });

  it('refuses a two-axis key with no progress function', () => {
    // @ts-expect-error a non-index position must say what progress means
    createViewedStateController({
      storageKey: 'seen',
      ...twoAxisKey(),
    });
  });
});
