import { createSignal } from '@reelkit/core';
import { cdnUrl } from '@reelkit/example-data';

// Stands in for your backend. The recipe only relies on the signature of
// `fetchPosts`: a page number in, a page of posts out, cancellable through an
// AbortSignal.

export interface Post {
  id: string;
  title: string;
  image: string;
}

const kPageSize = 6;
const kDelayMs = 800;
const kImages = Array.from(
  { length: 9 },
  (_, i) => `samples/images/image-${String(i + 1).padStart(2, '0')}.jpg`,
);

/**
 * Demo switch: while on, the next request fails, so the error slide can be
 * seen. A signal, so the switch shows when a request has used it up. Only the
 * demo on this page uses it: delete it, and the `@reelkit/core` import with
 * it, when you replace `fetchPosts` with your API.
 */
export const failNextRequest = createSignal(false);

export function fetchPosts(page: number, signal: AbortSignal): Promise<Post[]> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      if (failNextRequest.value) {
        failNextRequest.value = false;
        reject(new Error('The feed could not be loaded.'));
        return;
      }
      resolve(
        Array.from({ length: kPageSize }, (_, i) => {
          const n = page * kPageSize + i;
          return {
            id: `post-${n}`,
            title: `Post ${n + 1}`,
            image: cdnUrl(kImages[n % kImages.length]),
          };
        }),
      );
    }, kDelayMs);

    signal.addEventListener(
      'abort',
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
