import { MutableRefObject, useCallback, useEffect, useRef, useState } from 'react';

export interface UseFullscreenProps<E extends HTMLElement> {
  ref: MutableRefObject<E | null>;
}

export type UseFullscreenResult = [
  fullscreen: boolean,
  requestFullscreen: () => void,
  exitFullscreen: () => void
];

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

const useFullscreen = <E extends HTMLElement>(
  props: UseFullscreenProps<E>
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
            `Error attempting to enable full-screen mode: ${err.message} (${err.name})`
          );
        });
    }
  }, [props.ref]);

  const exit = useCallback(() => {
    exitFullscreenFn()
      .then(() => {
        if (mountedRef.current) {
          setFullscreen(false);
        }
      })
      .catch((err) => {
        console.log(
          `Error attempting to exit full-screen mode: ${err.message} (${err.name})`
        );
      });
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
        handleFullscreenChange
      );
      document.removeEventListener(
        'mozfullscreenchange',
        handleFullscreenChange
      );
      document.removeEventListener(
        'MSFullscreenChange',
        handleFullscreenChange
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

  return [fullscreen, request, exit];
};

export default useFullscreen;
