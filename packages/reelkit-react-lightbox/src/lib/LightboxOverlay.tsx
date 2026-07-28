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
  useFullscreen,
  SwipeToClose,
  type ReelApi,
  type ReelProps,
  type SwipeToCloseDirection,
  type TransitionTransformFn,
  type UrlStateController,
} from '@reelkit/react';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import LightboxControls from './LightboxControls';
import type {
  LightboxItem,
  ControlsRenderProps,
  SlideRenderProps,
  NavigationRenderProps,
  InfoRenderProps,
} from './types';
import './LightboxOverlay.css';

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

  /** Callback to close the lightbox. Triggered by close button or Escape key. */
  onClose: () => void;
}

/**
 * URL-driven mode: the address bar owns whether the lightbox is open. A
 * {@link UrlStateController} — built in consumer code with `useOverlayUrlState`
 * — carries the open state, so the same controller can be read and driven from
 * elsewhere. The overlay opens itself when the controller's index names a slide
 * and closes when it clears.
 */
export interface LightboxUrlControlledProps {
  /**
   * URL-state controller from `useOverlayUrlState`. Its `index` drives whether
   * the overlay is open and which slide it shows; the overlay writes back
   * through it on slide change and close.
   */
  controller: UrlStateController;

  /** Called after the lightbox closes. The URL drives closing, not this. */
  onClose?: () => void;
}

/**
 * Props for the controlled {@link LightboxOverlay}. Open state is a boolean the
 * caller owns. For URL-driven open state, use {@link LightboxUrlOverlay}
 * instead — a separate component, so there is no mutually-exclusive prop to
 * police.
 */
export type LightboxOverlayProps = LightboxOverlayBaseProps &
  LightboxControlledProps;

/**
 * Props for {@link LightboxUrlOverlay}. Open state lives in the URL, carried by
 * a {@link UrlStateController} the consumer builds with `useOverlayUrlState`.
 */
export type LightboxUrlOverlayProps = LightboxOverlayBaseProps &
  LightboxUrlControlledProps;

/** Props the inner content actually consumes once the lightbox is open. */
type LightboxContentProps = LightboxOverlayBaseProps & { onClose: () => void };

/** Number of images to preload before and after the current index. */
const _kPreloadRange = 2;

const preloader = createContentPreloader({ maxCacheSize: 1000 });

/**
 * Inner content of the lightbox overlay. Manages slider, controls,
 * navigation, info overlay, fullscreen, resize, and image preloading.
 *
 * Rendered only while the lightbox is open — gated by {@link LightboxOverlay}
 * (`isOpen`) or {@link LightboxUrlOverlay} (a non-null `controller.position`).
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
 * Full-screen image lightbox overlay with gesture, keyboard, and wheel
 * navigation. Controlled: the caller owns `isOpen`. For URL-driven open state,
 * use {@link LightboxUrlOverlay} instead.
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
export const LightboxOverlay = (props: LightboxOverlayProps): ReactNode => {
  if (!props.isOpen) return null;

  return <LightboxContent {...props} />;
};

/**
 * Full-screen image lightbox whose open state lives in the URL. Build the
 * controller with `useOverlayUrlState` and pass it as `controller`: the address
 * bar owns the gallery, so it opens when the controller's index names a slide,
 * closes when it clears — links are shareable and the back button closes when it
 * was opened from within the app. A shared link opened directly in a fresh tab
 * has no history behind it, so browser-back leaves the site; the close button or
 * Escape removes the parameter in place and stays.
 *
 * Prefer a link to the parameter (`<Link to="?photo=3">`) as the open action —
 * the href does it with no handler, and the open is then shareable, opens in a
 * new tab, and back-closes for free. `controller.set` to the parameter opens it
 * too; `set` is also the low-level write the overlay uses for slide changes and
 * to close.
 *
 * The controlled {@link LightboxOverlay} and this url-driven overlay are
 * separate components: each carries exactly one open-state driver, so there is
 * no mutually-exclusive prop to police.
 */
export const LightboxUrlOverlay = (
  props: LightboxUrlOverlayProps,
): ReactNode => {
  const { controller, onClose, ...base } = props;
  const latest = useRef({ base, onClose });
  latest.current = { base, onClose };

  return (
    <Observe signals={[controller.position]}>
      {() => {
        if (controller.position.value === null) return null;

        return (
          <LightboxContent
            {...base}
            initialIndex={controller.position.value}
            onClose={() => {
              controller.set(null);
              latest.current.onClose?.();
            }}
            onSlideChange={(index) => {
              controller.set(index);
              latest.current.base.onSlideChange?.(index);
            }}
          />
        );
      }}
    </Observe>
  );
};
