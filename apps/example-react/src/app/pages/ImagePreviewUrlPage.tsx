import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LightboxUrlOverlay, type LightboxItem } from '@reelkit/react-lightbox';
import {
  createSignal,
  Observe,
  Signal,
  useOverlayUrlState,
  urlIndexKey,
} from '@reelkit/react';
import { cdnUrl } from '@reelkit/example-data';
import { ImageOff } from 'lucide-react';
import { useReactRouterUrlAdapter } from '@reelkit/react/react-router-url-adapter';
import '@reelkit/react-lightbox/styles.css';
import './ImagePreviewPage.css';

const _kParam = 'photo';

/** How many images this page pretends to have loaded so far. */
const _kPageSize = 3;

/** Stand-in for the round trip that fetches the next page. */
const _kFetchDelayMs = 900;

const sampleImages: LightboxItem[] = [
  {
    src: cdnUrl('samples/images/image-01.jpg'),
    title: 'Mountain River',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/images/image-02.jpg'),
    title: 'Forest Path',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/images/image-03.jpg'),
    title: 'Lake at Dusk',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/images/image-04.jpg'),
    title: 'Coastal Cliffs',
    width: 1600,
    height: 1000,
  },
  {
    src: cdnUrl('samples/images/image-05.jpg'),
    title: 'Snow Ridge',
    width: 1600,
    height: 1000,
  },
];

const GalleryThumb: React.FC<{ src: string; alt: string }> = ({ src, alt }) => {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(255,255,255,0.3)',
          backgroundColor: '#1a1a1a',
        }}
      >
        <ImageOff size={28} strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <img src={src} alt={alt} loading="lazy" onError={() => setError(true)} />
  );
};

/**
 * The lightbox with its open state in the URL: the address bar names the
 * visible slide, the link can be shared, and the back button closes.
 *
 * This application is routed, so the router drives every read and write — the
 * default History adapter would leave the router's own location stale.
 */
export function ImagePreviewUrlPage() {
  const adapter = useReactRouterUrlAdapter();
  const navigate = useNavigate();

  const [loaded, fetching] = useState(
    () =>
      // Only part of the gallery has "arrived" — the rest stands in for pages
      // this feed has not fetched yet.
      [
        createSignal(sampleImages.slice(0, _kPageSize)),
        createSignal(false),
      ] as [Signal<LightboxItem[]>, Signal<boolean>],
  )[0];

  // A plain index gallery, so the built-in `urlIndexKey` supplies the codec and
  // the bounded `locate`/`identify` — the only thing this windowed feed adds is
  // a `locateAsync` pager for links past the loaded window. No hand-rolled
  // locator. Keeping the controller here (not inside the overlay) leaves
  // `photo.set` on hand for programmatic control.
  const photo = useOverlayUrlState({
    param: _kParam,
    adapter,
    ...urlIndexKey(
      () => loaded.value.length,
      async (index) => {
        // Nothing left to fetch: this link names an image the feed lacks.
        if (index < 0 || index >= sampleImages.length) return null;

        fetching.value = true;
        await new Promise((done) => setTimeout(done, _kFetchDelayMs));
        loaded.value = sampleImages.slice(0, index + 1);
        fetching.value = false;

        return index; // urlIndexKey re-bounds it against the grown count
      },
    ),
  });

  return (
    <div className="image-gallery-page">
      <div className="gallery-header">
        <h1>URL Image Gallery</h1>
        <p>
          Every thumbnail is an ordinary link to{' '}
          <code>?photo=&lt;index&gt;</code>— open one in a new tab, copy its
          address, or press back to close. Paging through the gallery never
          piles up history entries.
        </p>
        <p>
          Back closes the gallery when you opened it from here — the link pushed
          an entry, so back pops to the gallery. A shared link opened directly
          in a fresh tab has no history behind it, so back leaves the site;
          close with the ✕ button or Escape to stay on the gallery.
        </p>
        <p>
          Only the first {_kPageSize} images have loaded. The buttons below all
          point past them, the way a shared link into a long feed does — the
          lightbox waits for the image to arrive instead of discarding the
          address.
        </p>
        <div className="transition-selector">
          {/* All three buttons open the same slide. They differ only in what
              the browser gets to know about it. */}

          {/* A link, so the browser's own behaviour comes free: new tab, copy
              address, hover target, keyboard reach. */}
          <Link
            to={`?${_kParam}=${sampleImages.length - 1}`}
            className="transition-btn"
          >
            Open image {sampleImages.length} (link)
          </Link>
          {/* Navigating through the router. No href, so the browser affordances
              are gone, but the URL still changes and back still closes. */}
          <button
            type="button"
            className="transition-btn"
            onClick={() => navigate(`?${_kParam}=${sampleImages.length - 1}`)}
          >
            Open image {sampleImages.length} (router)
          </button>
          {/* Straight through the controller. The adapter routes the write, so
              this ends up in the same place as the other two — the difference
              is that the open started in code rather than from something the
              user could copy or middle-click. */}
          <button
            type="button"
            className="transition-btn"
            onClick={() => photo.set(sampleImages.length - 1)}
          >
            Open image {sampleImages.length} (controller.set)
          </button>
          <Observe signals={[fetching]}>
            {() => (fetching.value ? <span>Loading photo…</span> : null)}
          </Observe>
        </div>
      </div>

      <Observe signals={[loaded]}>
        {() => (
          <div className="gallery-grid">
            {loaded.value.map((image, index) => (
              // The open state is a URL, so opening is a link. That buys the
              // browser's own behaviour for free: open in a new tab, copy the
              // address, see the target on hover, reach it by keyboard.
              <Link
                key={image.src}
                to={`?${_kParam}=${index}`}
                className="gallery-item"
              >
                <GalleryThumb
                  src={image.src}
                  alt={image.title || `Image ${index + 1}`}
                />
                <div className="gallery-item-overlay">
                  {image.title && (
                    <span className="gallery-item-title">{image.title}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </Observe>

      <Observe signals={[loaded]}>
        {() => <LightboxUrlOverlay controller={photo} images={loaded.value} />}
      </Observe>
    </div>
  );
}

export default ImagePreviewUrlPage;
