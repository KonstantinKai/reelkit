// Firefox reads the object URL only after the click handler returns, so
// revoking it in the same task can cancel the download. A second is far
// longer than the browser needs and keeps the blob alive no longer than that.
const _kRevokeDelayMs = 1000;
const _kFallbackFileName = 'download';

/**
 * File name for a URL: its last path segment, decoded, without the query or
 * hash. A URL whose path ends in a slash gives `download`.
 *
 * @param url - Absolute or relative URL.
 */
export const getFileNameFromUrl = (url: string): string => {
  const base =
    typeof location === 'undefined' ? 'http://localhost/' : location.href;
  let pathname: string;
  try {
    pathname = new URL(url, base).pathname;
  } catch {
    return _kFallbackFileName;
  }
  const segment = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (!segment) return _kFallbackFileName;
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
};

/**
 * Saves a file to the user's device under the given name.
 *
 * The file is fetched and saved from a blob, because the `download`
 * attribute on a plain link is ignored for cross-origin URLs and the browser
 * would navigate to the file instead. When the fetch fails or the server
 * answers with an error (a cross-origin server without CORS headers is the
 * usual case), the URL opens in a new tab so the reader can still save it.
 *
 * @param url - Address of the file.
 * @param filename - Name to save under. Defaults to the last segment of the
 * URL's path.
 * @returns Resolves once the download has been handed to the browser or the
 * fallback tab opened. Never rejects. Does nothing without a window (server
 * rendering).
 */
export const downloadFile = async (
  url: string,
  filename?: string,
): Promise<void> => {
  if (typeof window === 'undefined') return;

  let blob: Blob;
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    blob = await response.blob();
  } catch {
    window.open(url, '_blank', 'noopener');
    return;
  }

  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename ?? getFileNameFromUrl(url);
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(objectUrl), _kRevokeDelayMs);
};
