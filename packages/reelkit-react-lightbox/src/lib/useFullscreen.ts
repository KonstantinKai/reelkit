import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

/**
 * Options for the {@link useFullscreen} hook.
 *
 * @typeParam E - The HTML element type that will be toggled into fullscreen mode.
 */
export interface UseFullscreenProps<E extends HTMLElement> {
  /** Ref to the DOM element that should enter fullscreen. */
  ref: MutableRefObject<E | null>;
}

/**
 * Tuple returned by {@link useFullscreen}.
 *
 * - `[0]` — `boolean` indicating whether the element is currently fullscreen.
 * - `[1]` — Function to request fullscreen on the referenced element.
 * - `[2]` — Function to exit fullscreen.
 * - `[3]` — Toggle function that requests or exits fullscreen based on current state.
 */
export type UseFullscreenResult = [
  fullscreen: boolean,
  requestFullscreen: () => void,
  exitFullscreen: () => void,
  toggleFullscreen: () => void,
];

/**
 * Checks whether any element is currently in fullscreen mode,
 * accounting for vendor-prefixed properties.
 * @internal
 */
const isFullscreen = (): boolean => {
  const doc = document as Document & {
    webkitFullscreenElement?: Element;

    mozFullScreenElement?: Element;

    msFullscreenElement?: Element;
  };

  const element =
    doc.fullscreenElement ??
    doc.webkitFullscreenElement ??
    doc.mozFullScreenElement ??
    doc.msFullscreenElement;

  return element != null;
};

/**
 * Exits fullscreen mode via the standard or vendor-prefixed API.
 * Resolves immediately if no API is available.
 * @internal
 */
const exitFullscreenFn = (): Promise<void> => {
  const doc = document as Document & {
    mozCancelFullScreen?: () => Promise<void>;

    webkitExitFullscreen?: () => Promise<void>;

    msExitFullscreen?: () => Promise<void>;
  };

  if (doc.exitFullscreen) {
    return doc.exitFullscreen();
  } else if (doc.webkitExitFullscreen) {
    return doc.webkitExitFullscreen();
  } else if (doc.mozCancelFullScreen) {
    return doc.mozCancelFullScreen();
  } else if (doc.msExitFullscreen) {
    return doc.msExitFullscreen();
  }

  return Promise.resolve();
};

/**
 * Requests fullscreen mode on the given element via the standard or
 * vendor-prefixed API. Resolves immediately if no API is available.
 * @internal
 */
const requestFullscreenFn = (element: HTMLElement): Promise<void> => {
  const el = element as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    webkitEnterFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
  };

  if (el.requestFullscreen) {
    return el.requestFullscreen();
  } else if (el.webkitRequestFullscreen) {
    return el.webkitRequestFullscreen();
  } else if (el.webkitEnterFullscreen) {
    return el.webkitEnterFullscreen();
  } else if (el.mozRequestFullScreen) {
    return el.mozRequestFullScreen();
  } else if (el.msRequestFullscreen) {
    return el.msRequestFullscreen();
  }

  return Promise.resolve();
};

/**
 * React hook for managing the Fullscreen API with cross-browser support.
 *
 * Wraps the standard `requestFullscreen` / `exitFullscreen` methods
 * together with their WebKit, Mozilla, and MS vendor-prefixed
 * variants. Automatically listens for `fullscreenchange` events
 * (all prefixes) and exits fullscreen when the component unmounts.
 *
 * @typeParam E - The HTML element type (inferred from `props.ref`).
 *
 * @example
 * ```tsx
 * const ref = useRef<HTMLDivElement>(null);
 * const [isFs, requestFs, exitFs, toggleFs] = useFullscreen({ ref });
 * ```
 */
export const useFullscreen = <E extends HTMLElement>(
  props: UseFullscreenProps<E>,
): UseFullscreenResult => {
  const [fullscreen, setFullscreen] = useState(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const request = useCallback(() => {
    if (props.ref.current !== null) {
      if (isFullscreen()) {
        exitFullscreenFn();
      }

      requestFullscreenFn(props.ref.current)
        .then(() => {
          if (mountedRef.current) {
            setFullscreen(true);
          }
        })
        .catch((err) => {
          console.log(
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`,
          );
        });
    }
  }, []);

  const exit = useCallback(() => {
    exitFullscreenFn()
      .then(() => {
        if (mountedRef.current) {
          setFullscreen(false);
        }
      })
      .catch((err) => {
        console.log(
          `Error attempting to exit full-screen mode: ${err.message} (${err.name})`,
        );
      });
  }, []);

  const toggle = useCallback(() => {
    if (isFullscreen()) {
      exit();
    } else {
      request();
    }
  }, []);

  // Listen for fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (mountedRef.current) {
        setFullscreen(isFullscreen());
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener(
        'webkitfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange,
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange,
      );
    };
  }, []);

  // Exit fullscreen on unmount
  useEffect(() => {
    return () => {
      if (isFullscreen()) {
        exitFullscreenFn();
      }
    };
  }, []);

  return [fullscreen, request, exit, toggle];
};
