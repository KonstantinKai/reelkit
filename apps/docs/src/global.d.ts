interface Window {
  plausible?: (
    event: string,
    options?: { props?: Record<string, string> },
  ) => void;
}
