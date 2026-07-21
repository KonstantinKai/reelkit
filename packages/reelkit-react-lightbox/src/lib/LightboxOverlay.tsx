/* eslint-disable react/jsx-no-useless-fragment */
import {
  type MutableRefObject,
  type ReactNode,
  type FC,
  useRef,
  useState,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import {
  createSignal,
  createContentLoadingController,
  createContentPreloader,
  createDisposableList,
  reaction,
  observeDomEvent,
  captureFocusForReturn,
  createFocusTrap,
  slideTransition,
  Reel,
  Observe,
  useBodyLock,
  useUrlState,
  indexCodec,
  SwipeToClose,
  type ReelApi,
  type ReelProps,
  type SwipeToCloseDirection,
  type TransitionTransformFn,
  type UrlAdapter,
  type UrlCodec,
  type UrlLocator,
  type UseUrlStateOptions,
} from '@reelkit/react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useFullscreen } from '@reelkit/react';
import LightboxControls from './LightboxControls';
import type {
  ControlsRenderProps,
  SlideRenderProps,
  NavigationRenderProps,
  InfoRenderProps,
} from './types';
import './LightboxOverlay.css';

/**
 * Data for a single lightbox item (image or video).
 *
 * At minimum, provide `src`. Optional `title` and `description` are
 * rendered in the built-in info overlay (unless overridden via `renderInfo`).
 *
 * For video items, set `type: 'video'` and optionally provide a `poster`
 * thumbnail. Video rendering requires opting in via `useVideoSlideRenderer`.
 */
export interface LightboxItem {
  /** URL of the image or video. */
  src: string;

  /**
   * Item type. Defaults to `'image'` when omitted.
   * Video items require opting in via `useVideoSlideRenderer` and `renderSlide`.
   */
  type?: 'image' | 'video';

  /** Poster/thumbnail image for video items. Used for preloading and as placeholder. */
  poster?: string;

  /** Title displayed in the info overlay. */
  title?: string;

  /** Description displayed below the title in the info overlay. */
  description?: string;

  /** Intrinsic width of the image in pixels. Currently unused by the lightbox. */
  width?: number;

  /** Intrinsic height of the image in pixels. Currently unused by the lightbox. */
  height?: number;
}

/**
 * Subset of {@link ReelProps} forwarded to the underlying `Reel` component.
 *
 * Allows controlling transition duration, swipe sensitivity, looping,
 * keyboard navigation, and wheel behaviour without accessing `Reel` directly.
 */
export type ReelProxyProps = Pick<
  ReelProps,
  | 'transitionDuration'
  | 'swipeDistanceFactor'
  | 'loop'
  | 'enableNavKeys'
  | 'enableWheel'
  | 'wheelDebounceMs'
>;

/**
 * Props for the {@link LightboxOverlay} component.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <LightboxOverlay
 *   isOpen={index !== null}
 *   images={images}
 *   initialIndex={index ?? 0}
 *   onClose={() => setIndex(null)}
 * />
 * ```
 *
 * @example
 * ```tsx
 * // With custom controls and info
 * <LightboxOverlay
 *   isOpen={isOpen}
 *   images={images}
 *   onClose={handleClose}
 *   renderControls={({ onClose, activeIndex, count }) => (
 *     <div>
 *       <Counter currentIndex={activeIndex} count={count} />
 *       <CloseButton onClick={onClose} />
 *     </div>
 *   )}
 *   renderInfo={({ item }) => <p>{item.title}</p>}
 * />
 * ```
 */
export interface LightboxOverlayBaseProps extends ReelProxyProps {
  /**
   * Accessible label for the dialog region. Announced by screen readers
   * when the lightbox opens.
   *
   * @default 'Image gallery'
   */
  ariaLabel?: string;

  /** Array of images to display as horizontal slides. */
  images: LightboxItem[];

  /**
   * Zero-based index of the initially visible image.
   * @default 0
   */
  initialIndex?: number;

  /**
   * Ref to access the Reel API
   */
  apiRef?: MutableRefObject<ReelApi | null>;

  /**
   * Slide transition function. Defaults to `slideTransition` from
   * `@reelkit/react`. Import additional built-ins from
   * `@reelkit/react-lightbox` (`lightboxFadeTransition`,
   * `lightboxZoomTransition`) or `@reelkit/react` (`flipTransition`).
   */
  transitionFn?: TransitionTransformFn;

  /**
   * Direction of the swipe-to-close gesture on mobile.
   *
   * @default 'up'
   */
  swipeToCloseDirection?: SwipeToCloseDirection;

  /**
   * Callback fired after slide change
   */
  onSlideChange?: (index: number) => void;

  /**
   * Custom controls. Replaces default close button, counter, and fullscreen toggle.
   */
  renderControls?: (props: ControlsRenderProps) => ReactNode;

  /**
   * Custom navigation arrows. Replaces default prev/next buttons.
   */
  renderNavigation?: (props: NavigationRenderProps) => ReactNode;

  /**
   * Custom info overlay. Replaces default title + description gradient.
   * Return `null` to hide the info overlay entirely.
   */
  renderInfo?: (props: InfoRenderProps) => ReactNode;

  /**
   * Custom slide rendering. Return null to fall back to default image slide.
   *
   * The optional `onReady` / `onWaiting` callbacks let the custom slide
   * report its loading state so the overlay can show/hide the spinner.
   */
  renderSlide?: (props: SlideRenderProps) => ReactNode | null;

  /** Custom loading indicator. Replaces default spinner. */
  renderLoading?: (props: {
    item: LightboxItem;
    activeIndex: number;
  }) => ReactNode;

  /** Custom error indicator. Replaces default error icon. */
  renderError?: (props: {
    item: LightboxItem;
    activeIndex: number;
  }) => ReactNode;
}

/**
 * Controlled mode: the surrounding component owns whether the lightbox is
 * open, and closes it from its own state.
 */
export interface LightboxControlledProps {
  /** When `true`, the lightbox is rendered and body scroll is locked. */
  isOpen: boolean;

  urlParam?: never;
  urlAdapter?: never;
  urlCodec?: never;
  urlLocator?: never;

  /** Callback to close the lightbox. Triggered by close button or Escape key. */
  onClose: () => void;
}

/**
 * URL-driven mode: the address bar owns whether the lightbox is open. The
 * lightbox opens itself when the parameter appears and closes itself when it
 * goes away, so a link to a slide can be shared and the back button closes
 * the gallery.
 *
 * Open it by writing the parameter — `useUrlState(param).set(index)` — rather
 * than by holding a boolean.
 */
interface LightboxUrlBaseProps {
  /** Query parameter that carries the active slide, for example `photo`. */
  urlParam: string;

  /**
   * Navigation system to read and write through. Defaults to the History API.
   *
   * Pass a router-backed adapter in a routed application: writing history
   * directly leaves a router's own location stale, and its next navigation
   * drops the parameter.
   */
  urlAdapter?: UrlAdapter;

  isOpen?: never;

  /** Called after the lightbox closes. The URL drives closing, not this. */
  onClose?: () => void;
}

/**
 * URL-driven mode.
 *
 * @typeParam Id - The identity `urlCodec` reads out of the parameter. Defaults
 * to a slide index, so a plain `?photo=3` gallery needs neither prop.
 */
export interface LightboxUrlProps<Id = number> extends LightboxUrlBaseProps {
  /**
   * Wire format for the parameter — its text ↔ a stable identity. Collection-
   * blind: it spells an identity into the URL and reads it back, nothing more.
   *
   * Omit it for the default integer codec (`?photo=3`). Supply one — base64 of
   * an id, a slug — to make a bookmark survive the gallery reordering: it names
   * the *image*, not whatever slid into that slot.
   *
   * @default indexCodec
   */
  urlCodec?: UrlCodec<Id>;

  /**
   * Where the codec's identity sits in `images`: `locate` (sync), `locateAsync`
   * (async fallback for a paginated gallery), and `identify` for writes. The
   * lightbox clamps whatever these return to the gallery's bounds.
   *
   * Required whenever `urlCodec` reads a non-index identity — a string id
   * cannot stand in for a position. Omit it only for the integer default.
   */
  urlLocator?: UrlLocator<Id>;
}

/**
 * Either controlled by a boolean, or driven by the URL — never both. Passing
 * `urlParam` and `isOpen` together is a type error, because they would be two
 * answers to the same question.
 */
export type LightboxOverlayProps<Id = number> = LightboxOverlayBaseProps &
  (LightboxControlledProps | LightboxUrlProps<Id>);

/** Props the inner content actually consumes once the lightbox is open. */
type LightboxContentProps = LightboxOverlayBaseProps & { onClose: () => void };

/**
 * Narrows a parsed or resolved value to a slide the gallery can actually show.
 * Anything else — a fraction, a negative, a stale index past the end — is the
 * same answer as no slide at all.
 */
const toSlideIndex = (value: number | null, count: number): number | null =>
  value !== null && Number.isInteger(value) && value >= 0 && value < count
    ? value
    : null;

/** Number of images to preload before and after the current index. */
const _kPreloadRange = 2;

const preloader = createContentPreloader({ maxCacheSize: 1000 });

/**
 * Inner content of the lightbox overlay. Manages slider, controls,
 * navigation, info overlay, fullscreen, resize, and image preloading.
 *
 * Rendered only when `isOpen` is `true` (gated by {@link LightboxOverlay}).
 * @internal
 */
const LightboxContent: FC<LightboxContentProps> = (props) => {
  const {
    images,
    initialIndex = 0,
    onClose,
    transitionFn,
    apiRef,
    loop = false,
    enableNavKeys = true,
    enableWheel = true,
    wheelDebounceMs,
    transitionDuration,
    swipeDistanceFactor,
    swipeToCloseDirection = 'up',
  } = props;

  const propsRef = useRef(props);
  propsRef.current = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const internalApiRef = useRef<ReelApi>(null);
  const sliderRef = apiRef ?? internalApiRef;

  const [
    {
      sizeSignal,
      loadingCtrl,
      indexSignal,
      isMobileSignal,
      handleAfterChange,
      handlePrev,
      handleNext,
      itemBuilder,
    },
  ] = useState(() => {
    const sizeSignal = createSignal<[number, number]>(
      typeof window !== 'undefined'
        ? [window.innerWidth, window.innerHeight]
        : [0, 0],
    );
    const loadingCtrl = createContentLoadingController(true, initialIndex);
    const indexSignal = createSignal(initialIndex);
    const isMobileSignal = createSignal(
      typeof window !== 'undefined'
        ? 'ontouchstart' in window || navigator.maxTouchPoints > 0
        : false,
    );

    const imageErrors = new Set<number>();
    const errorVersion = createSignal(0);

    return {
      sizeSignal,
      loadingCtrl,
      indexSignal,
      isMobileSignal,
      imageErrors,
      errorVersion,
      handleAfterChange: (index: number) => {
        loadingCtrl.setActiveIndex(index);
        const src = propsRef.current.images[index]?.src;
        if (src && preloader.isErrored(src)) {
          loadingCtrl.onError(index);
        } else if (src && preloader.isLoaded(src)) {
          loadingCtrl.onReady(index);
        }
        indexSignal.value = index;
        propsRef.current.onSlideChange?.(index);
      },
      handlePrev: () => {
        sliderRef.current?.prev();
      },
      handleNext: () => {
        sliderRef.current?.next();
      },
      itemBuilder: (
        index: number,
        _indexInRange: number,
        slideSize: [number, number],
      ) => {
        const { images: items, renderSlide } = propsRef.current;
        const image = items[index];
        const isActive = index === indexSignal.value;
        const onReady = () => loadingCtrl.onReady(index);
        const onWaiting = () => loadingCtrl.onWaiting(index);
        const onError = () => {
          preloader.markErrored(image.src);
          loadingCtrl.onError(index);
        };

        if (renderSlide) {
          const custom = renderSlide({
            item: image,
            index,
            size: slideSize,
            isActive,
            onReady,
            onWaiting,
            onError,
          });
          if (custom !== null) {
            return (
              <div
                className="rk-lightbox-slide"
                role="group"
                aria-roledescription="slide"
                aria-label={`Image ${index + 1} of ${items.length}`}
                style={{ width: slideSize[0], height: slideSize[1] }}
              >
                {custom}
              </div>
            );
          }
        }

        return (
          <div
            className="rk-lightbox-slide"
            role="group"
            aria-roledescription="slide"
            aria-label={`Image ${index + 1} of ${items.length}`}
            style={{ width: slideSize[0], height: slideSize[1] }}
          >
            <img
              src={image.src}
              alt={image.title || `Image ${index + 1}`}
              className="rk-lightbox-img"
              draggable={false}
              loading={isActive ? 'eager' : 'lazy'}
              ref={(node) => {
                // A cached image can finish decoding before React attaches the
                // handler below, so its load event never arrives and the slide
                // would sit under a spinner that has nothing left to wait for.
                // `naturalWidth` separates a decoded image from a broken one,
                // which reports complete just the same.
                if (node?.complete && node.naturalWidth > 0) {
                  preloader.markLoaded(image.src);
                  onReady();
                }
              }}
              onLoad={() => {
                preloader.markLoaded(image.src);
                onReady();
              }}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
                onError();
              }}
            />
          </div>
        );
      },
    };
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isFullscreen, _, exitFullscreen, toggleFullscreen] = useFullscreen({
    ref: containerRef,
  });

  useBodyLock(true);

  useEffect(() => {
    const disposables = createDisposableList();

    disposables.push(captureFocusForReturn());
    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.focus({ preventScroll: true });
      disposables.push(createFocusTrap(containerEl));
    }

    disposables.push(
      observeDomEvent(window, 'resize', () => {
        sizeSignal.value = [window.innerWidth, window.innerHeight];
        isMobileSignal.value =
          'ontouchstart' in window || navigator.maxTouchPoints > 0;
      }),
      observeDomEvent(window, 'keydown', (e) => {
        if (e.key === 'Escape') {
          if (isFullscreen.value) {
            exitFullscreen();
          } else {
            propsRef.current.onClose();
          }
        }
      }),
      reaction(
        () => [indexSignal],
        () => {
          preloader.preloadRange(
            propsRef.current.images,
            indexSignal.value,
            _kPreloadRange,
          );
        },
      ),
    );

    preloader.preloadRange(
      propsRef.current.images,
      indexSignal.value,
      _kPreloadRange,
    );

    const initialIdx = indexSignal.value;
    const initialSrc = propsRef.current.images[initialIdx]?.src;
    if (initialSrc) {
      disposables.push(
        preloader.onLoaded(initialSrc, () => loadingCtrl.onReady(initialIdx)),
      );
    }

    return disposables.dispose;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return createPortal(
    <div
      ref={containerRef}
      className="rk-lightbox-overlay"
      role="dialog"
      aria-modal="true"
      aria-label={props.ariaLabel ?? 'Image gallery'}
      tabIndex={-1}
    >
      <Observe signals={[isFullscreen, indexSignal]}>
        {() => {
          const idx = indexSignal.value;
          const {
            renderControls: renderCtrl,
            onClose: close,
            images: items,
          } = propsRef.current;
          return (
            <>
              {renderCtrl ? (
                renderCtrl({
                  item: items[idx],
                  onClose: close,
                  activeIndex: idx,
                  count: items.length,
                  isFullscreen: isFullscreen.value,
                  onToggleFullscreen: toggleFullscreen,
                })
              ) : (
                <LightboxControls
                  onClose={close}
                  currentIndex={idx}
                  count={items.length}
                  isFullscreen={isFullscreen.value}
                  onToggleFullscreen={toggleFullscreen}
                />
              )}
            </>
          );
        }}
      </Observe>
      <Observe
        signals={[loadingCtrl.isLoading, loadingCtrl.isError, indexSignal]}
      >
        {() => {
          const idx = indexSignal.value;
          const { renderLoading, renderError, images } = propsRef.current;
          const currentItem = images[idx];

          if (loadingCtrl.isError.value) {
            return renderError ? (
              <>{renderError({ item: currentItem, activeIndex: idx })}</>
            ) : (
              <div
                className="rk-lightbox-img-error"
                role="img"
                aria-label="Content unavailable"
              >
                <ImageOff size={48} strokeWidth={1.5} aria-hidden="true" />
                <span className="rk-lightbox-img-error-text">
                  Content unavailable
                </span>
              </div>
            );
          }
          if (loadingCtrl.isLoading.value) {
            return renderLoading ? (
              <>{renderLoading({ item: currentItem, activeIndex: idx })}</>
            ) : (
              <div className="rk-lightbox-spinner" />
            );
          }
          return null;
        }}
      </Observe>
      <Observe signals={[sizeSignal, isMobileSignal]}>
        {() => (
          <SwipeToClose
            direction={swipeToCloseDirection}
            enabled={isMobileSignal.value}
            onClose={onClose}
          >
            <Reel
              count={images.length}
              size={sizeSignal.value}
              direction="horizontal"
              initialIndex={initialIndex}
              apiRef={sliderRef}
              afterChange={handleAfterChange}
              transition={transitionFn ?? slideTransition}
              transitionDuration={transitionDuration}
              swipeDistanceFactor={swipeDistanceFactor}
              loop={loop}
              enableNavKeys={enableNavKeys}
              enableWheel={enableWheel}
              wheelDebounceMs={wheelDebounceMs}
              itemBuilder={itemBuilder}
            />
          </SwipeToClose>
        )}
      </Observe>
      <Observe signals={[indexSignal, isMobileSignal]}>
        {() => {
          const idx = indexSignal.value;
          const mobile = isMobileSignal.value;
          const { renderNavigation, images: items } = propsRef.current;

          if (renderNavigation) {
            return (
              <>
                {renderNavigation({
                  item: items[idx],
                  onPrev: handlePrev,
                  onNext: handleNext,
                  activeIndex: idx,
                  count: items.length,
                })}
              </>
            );
          }
          if (mobile || items.length <= 1) return null;
          return (
            <>
              {idx > 0 && (
                <button
                  className="rk-lightbox-nav rk-lightbox-nav-prev"
                  onClick={handlePrev}
                  title="Previous"
                >
                  <ChevronLeft size={32} />
                </button>
              )}
              {idx < items.length - 1 && (
                <button
                  className="rk-lightbox-nav rk-lightbox-nav-next"
                  onClick={handleNext}
                  title="Next"
                >
                  <ChevronRight size={32} />
                </button>
              )}
            </>
          );
        }}
      </Observe>
      <Observe signals={[indexSignal]}>
        {() => {
          const idx = indexSignal.value;
          const { renderInfo, images: items } = propsRef.current;
          const currentImage = items[idx];

          if (renderInfo) {
            return <>{renderInfo({ item: currentImage, index: idx })}</>;
          }
          if (!currentImage?.title && !currentImage?.description) return null;
          return (
            <div className="rk-lightbox-info">
              {currentImage.title && (
                <h3 className="rk-lightbox-title">{currentImage.title}</h3>
              )}
              {currentImage.description && (
                <p className="rk-lightbox-description">
                  {currentImage.description}
                </p>
              )}
            </div>
          );
        }}
      </Observe>
      <Observe signals={[isMobileSignal]}>
        {() =>
          isMobileSignal.value ? (
            <div className="rk-lightbox-swipe-hint">Swipe up to close</div>
          ) : null
        }
      </Observe>
    </div>,
    document.body,
  );
};

/**
 * @internal
 */
type UrlDrivenLightboxProps<Id> = LightboxOverlayBaseProps &
  LightboxUrlProps<Id>;

/**
 * Lightbox whose open state lives in the URL. Opens itself when the parameter
 * names a slide, closes itself when it goes away.
 * @internal
 */
const UrlDrivenLightbox = <Id,>({
  urlParam,
  urlAdapter,
  urlCodec,
  urlLocator,
  onClose,
  ...base
}: UrlDrivenLightboxProps<Id>) => {
  // Read inside callbacks only, so a changing gallery never rebuilds the
  // controller or restarts the subscription.
  const latest = useRef({ base, urlCodec, urlLocator, onClose });
  latest.current = { base, urlCodec, urlLocator, onClose };

  const { clamp, ...options } = useState(() => {
    // Bounding the index against the gallery is the one piece of this the
    // controller cannot do: `images.length` is overlay knowledge, and the core
    // primitive stays free of any overlay's shape.
    const clamp = (value: number | null): number | null =>
      toSlideIndex(value, latest.current.base.images.length);

    // The sync `locate` runs against the collection as it stands, so clamping
    // it is safe. `locateAsync` is forwarded UNCLAMPED: it reports the index of
    // data it just loaded, and clamping that against an `images` prop React has
    // not re-rendered yet would reject the very slide it went and fetched. It
    // is authoritative — the consumer owns its correctness.
    const locator: UrlLocator<Id> = {
      locate: (id) => {
        const inner = latest.current.urlLocator;
        return clamp(inner ? inner.locate(id) : (id as number));
      },
      identify: (index) => {
        const inner = latest.current.urlLocator;
        return inner ? inner.identify(index) : (index as Id);
      },
    };

    if (urlLocator?.locateAsync) {
      locator.locateAsync = (id) => latest.current.urlLocator!.locateAsync!(id);
    }

    return {
      adapter: urlAdapter,
      codec: (latest.current.urlCodec ?? indexCodec) as UrlCodec<Id>,
      locator,
      clamp,
    };
  })[0];

  const url = useUrlState<Id>(urlParam, options as UseUrlStateOptions<Id>);

  return (
    <Observe signals={[url.index]}>
      {() =>
        url.index.value === null ? null : (
          <LightboxContent
            {...base}
            initialIndex={url.index.value}
            onClose={() => {
              url.set(null);
              latest.current.onClose?.();
            }}
            onSlideChange={(index) => {
              url.set(index);
              latest.current.base.onSlideChange?.(index);
            }}
          />
        )
      }
    </Observe>
  );
};

/**
 * Full-screen image lightbox overlay with gesture, keyboard, and wheel
 * navigation.
 *
 * Renders into a portal on `document.body`. When `isOpen` is `false` the
 * component returns `null` — no DOM nodes are created.
 *
 * Customise controls, navigation, info overlay, and individual slides
 * via the `renderControls`, `renderNavigation`, `renderInfo`, and
 * `renderSlide` props. Reusable sub-components ({@link CloseButton},
 * {@link Counter}, {@link FullscreenButton}) are available for
 * composition inside `renderControls`.
 */
export const LightboxOverlay = <Id = number,>(
  // A non-index identity cannot stand in for a position, so a `urlCodec` that
  // reads one demands a `urlLocator`. The default `Id = number` leaves the
  // integer gallery unconstrained.
  props: LightboxOverlayProps<Id> &
    (Id extends number ? object : { urlLocator: UrlLocator<Id> }),
): ReactNode => {
  if (props.urlParam !== undefined) {
    return <UrlDrivenLightbox<Id> {...props} />;
  }

  if (!props.isOpen) return null;

  return <LightboxContent {...props} />;
};
