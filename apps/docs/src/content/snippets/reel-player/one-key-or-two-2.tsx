import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';

const adapter = useReactRouterUrlAdapter();
const reel = useOverlayUrlState({
  param: 'reel',
  adapter,
  ...urlIndexKey(() => content.length),
});

<ReelPlayerUrlOverlay controller={reel} content={content} />
