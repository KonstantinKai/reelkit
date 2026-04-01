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
  slideTransition,
  flipTransition,
  Reel,
  Observe,
  useBodyLock,
  SwipeToClose,
  type ReelApi,
  type ReelProps,
  type TransitionTransformFn,
} from '@reelkit/react';
import { lightboxFadeTransition } from './lightboxFadeTransition';
import { lightboxZoomTransition } from './lightboxZoomTransition';
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
 * Built-in transition aliases for the lightbox.
 * Use `transitionFn` for custom {@link TransitionTransformFn} instead.
 */
export type TransitionType = 'slide' | 'fade' | 'flip' | 'zoom-in';

const _kTransitionMap: Record<TransitionType, TransitionTransformFn> = {
  slide: slideTransition,
  fade: lightboxFadeTransition,
  flip: flipTransition,
  'zoom-in': lightboxZoomTransition,
};

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
  | 'useNavKeys'
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
export interface LightboxOverlayProps extends ReelProxyProps {
  /** When `true`, the lightbox is rendered and body scroll is locked. */
  isOpen: boolean;

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
   * Built-in transition alias.
   * @default 'slide'
   */
  transition?: TransitionType;

  /**
   * Custom transition function. Takes priority over `transition` alias.
   */
  transitionFn?: TransitionTransformFn;

  /** Callback to close the lightbox. Triggered by close button or Escape key. */
  onClose: () => void;

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
const LightboxContent: FC<LightboxOverlayProps> = (props) => {
  const {
    images,
    initialIndex = 0,
    onClose,
    transition = 'slide',
    transitionFn,
    apiRef,
    loop = false,
    useNavKeys = true,
    enableWheel = true,
    wheelDebounceMs,
    transitionDuration,
    swipeDistanceFactor,
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
            style={{ width: slideSize[0], height: slideSize[1] }}
          >
            <img
              src={image.src}
              alt={image.title || `Image ${index + 1}`}
              className="rk-lightbox-img"
              draggable={false}
              loading={isActive ? 'eager' : 'lazy'}
              onLoad={() => {
                preloader.markLoaded(image.src);
                onReady();
              }}
              onError={onError}
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
    <div ref={containerRef} className="rk-lightbox-container">
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
            direction="up"
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
              transition={transitionFn ?? _kTransitionMap[transition]}
              transitionDuration={transitionDuration}
              swipeDistanceFactor={swipeDistanceFactor}
              loop={loop}
              useNavKeys={useNavKeys}
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
export const LightboxOverlay: FC<LightboxOverlayProps> = (props) => {
  if (!props.isOpen) return null;

  return <LightboxContent {...props} />;
};
