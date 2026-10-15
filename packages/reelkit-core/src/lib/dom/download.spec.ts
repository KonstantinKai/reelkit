import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { downloadFile, getFileNameFromUrl } from './download';

const okResponse = (blob = new Blob(['data'])) =>
  ({ ok: true, status: 200, blob: () => Promise.resolve(blob) }) as Response;

describe('downloadFile', () => {
  let clicked: HTMLAnchorElement[];
  let open: ReturnType<typeof vi.fn<typeof window.open>>;
  let revoke: ReturnType<typeof vi.fn<(url: string) => void>>;

  beforeEach(() => {
    vi.useFakeTimers();
    clicked = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement,
    ) {
      clicked.push(this);
    });
    open = vi.fn<typeof window.open>();
    vi.stubGlobal('open', open);
    revoke = vi.fn<(url: string) => void>();
    // jsdom has no object URLs.
    URL.createObjectURL = vi.fn(() => 'blob:file');
    URL.revokeObjectURL = revoke;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(URL, 'createObjectURL');
    Reflect.deleteProperty(URL, 'revokeObjectURL');
    document.body.innerHTML = '';
  });

  it('saves the fetched file under the given name with one link click', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(okResponse())),
    );

    await downloadFile('https://cdn.example.com/a/photo.jpg', 'beach.jpg');

    expect(clicked).toHaveLength(1);
    expect(clicked[0].download).toBe('beach.jpg');
    expect(clicked[0].getAttribute('href')).toBe('blob:file');
    expect(open).not.toHaveBeenCalled();
  });

  it('names the file after the last segment of the URL by default', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(okResponse())),
    );

    await downloadFile('https://cdn.example.com/a/my%20photo.jpg?w=800#top');

    expect(clicked[0].download).toBe('my photo.jpg');
  });

  it('removes the link and revokes the object URL afterwards', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve(okResponse())),
    );

    await downloadFile('/photo.jpg');

    expect(document.querySelector('a')).toBeNull();
    expect(revoke).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(revoke).toHaveBeenCalledWith('blob:file');
  });

  it('opens the URL in a new tab when the server answers with an error', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.resolve({ ok: false, status: 403 } as Response)),
    );

    await downloadFile('https://cdn.example.com/photo.jpg');

    expect(open).toHaveBeenCalledWith(
      'https://cdn.example.com/photo.jpg',
      '_blank',
      'noopener',
    );
    expect(clicked).toHaveLength(0);
  });

  it('opens the URL in a new tab when the fetch is refused, without rejecting', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => Promise.reject(new TypeError('Failed to fetch'))),
    );

    await expect(
      downloadFile('https://other.example.com/photo.jpg'),
    ).resolves.toBeUndefined();

    expect(open).toHaveBeenCalledWith(
      'https://other.example.com/photo.jpg',
      '_blank',
      'noopener',
    );
  });

  it('does nothing without a window, as during server rendering', async () => {
    const fetch = vi.fn();
    vi.stubGlobal('fetch', fetch);
    vi.stubGlobal('window', undefined);

    await downloadFile('/photo.jpg');

    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('getFileNameFromUrl', () => {
  it.each([
    ['https://cdn.example.com/a/b/photo.jpg', 'photo.jpg'],
    ['/videos/clip.mp4?token=1', 'clip.mp4'],
    ['photo%E2%80%93final.png', 'photo–final.png'],
    ['https://cdn.example.com/a/', 'download'],
    ['https://cdn.example.com', 'download'],
    ['/bad%E0%A4%A.png', 'bad%E0%A4%A.png'],
  ])('names %s as %s', (url, name) => {
    expect(getFileNameFromUrl(url)).toBe(name);
  });
});
