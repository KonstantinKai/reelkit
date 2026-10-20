import { cdnUrl } from '@reelkit/example-data';

// Stands in for your backend: an album of photos. Each one has the shape of
// `LightboxItem` from the lightbox of your framework, so the list goes to the
// lightbox as it is.

export interface Photo {
  src: string;
  title: string;
  downloadUrl: string;
  downloadName: string;
}

const kTitles = [
  'Morning light',
  'Coastline',
  'Old town',
  'Forest path',
  'Harbour',
  'Mountain pass',
  'Market day',
  'Night street',
  'Lakeside',
];

export const photos: Photo[] = kTitles.map((title, i) => {
  const file = `samples/images/image-${String(i + 1).padStart(2, '0')}.jpg`;
  return {
    // Your app would show a resized copy here and keep the original for the
    // download. The sample CDN serves one size, so both point at one file.
    src: cdnUrl(file),
    title,
    downloadUrl: cdnUrl(file),
    downloadName: `${title.toLowerCase().replace(/\s+/g, '-')}.jpg`,
  };
});
