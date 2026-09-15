import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const stories = useOverlayUrlState({
  param: 'story',
  adapter,
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
  }),
});

<StoriesUrlOverlay controller={stories} groups={groups} />
