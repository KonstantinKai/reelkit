import {
  StoriesUrlOverlay,
  useOverlayUrlState,
  urlIndexTwoAxisKey,
} from '@reelkit/react-stories-player';
import { Link } from 'react-router-dom';

const stories = useOverlayUrlState({
  param: 'story',
  ...urlIndexTwoAxisKey({
    outerCount: () => groups.length,
    innerCounts: () => groups.map((g) => g.stories.length),
  }),
});

// Opening a user is a link — the overlay reads the URL and opens itself.
{groups.map((g, i) => (
  <Link key={g.author.id} to={`?story=${i}.0`}>{g.author.name}</Link>
))}

<StoriesUrlOverlay controller={stories} groups={groups} />
