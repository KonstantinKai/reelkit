import { Observe } from '@reelkit/react';
import InfiniteFeed from '../../content/snippets/recipes/infinite-feed/react';
import { failNextRequest } from '../../content/snippets/recipes/infinite-feed/api';

// The recipe page shows the snippet's code, so the demo renders that very
// module and adds only what a reader would not ship: a switch that fails the
// next request. It shows while it is armed and turns itself off once a request
// has failed.
export function InfiniteFeedDemo() {
  return (
    <>
      <InfiniteFeed />
      <Observe signals={[failNextRequest]}>
        {() => (
          <button
            type="button"
            aria-pressed={failNextRequest.value}
            onClick={() => (failNextRequest.value = !failNextRequest.value)}
            className={`absolute top-3 right-3 z-10 flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors duration-200 ${
              failNextRequest.value
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-black/60 hover:bg-black/75'
            }`}
          >
            <span
              aria-hidden
              className={`w-2 h-2 rounded-full ${failNextRequest.value ? 'bg-white' : 'bg-white/40'}`}
            />
            {failNextRequest.value ? 'Next request fails' : 'Fail next request'}
          </button>
        )}
      </Observe>
    </>
  );
}
