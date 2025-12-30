type EventMap<T> = T extends Window
  ? WindowEventMap
  : T extends Document
  ? DocumentEventMap
  : T extends HTMLElement
  ? HTMLElementEventMap
  : never;

type EventCallback<T, K extends keyof EventMap<T>> = (event: EventMap<T>[K]) => void;

/**
 * Adds an event listener to a DOM element and returns a function to remove it
 */
export const observeDomEvent = <T extends EventTarget, K extends keyof EventMap<T>>(
  target: T,
  eventName: K,
  callback: EventCallback<T, K>,
  options?: AddEventListenerOptions
): (() => void) => {
  target.addEventListener(eventName as string, callback as EventListener, options);
  return () => {
    target.removeEventListener(eventName as string, callback as EventListener, options);
  };
};
