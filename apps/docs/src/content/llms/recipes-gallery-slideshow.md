---
title: Gallery Slideshow
url: https://reelkit.dev/docs/recipes/gallery-slideshow
section: Recipes
order: 4
desc: A photo gallery in the lightbox that plays as a slideshow and downloads the original file of each photo.
---

# Gallery Slideshow

Album opens full screen, plays on its own until viewer pauses. Any photo can be saved: original file under proper name, not resized copy on screen.

`./api` = stand-in for backend: `photos` in shape of `LightboxItem` (`src` to show, `downloadUrl` to save, `downloadName` to save under). Page shows `api.ts` above demo. **Warning:** `cdnUrl` builds cdn.reelkit.dev links, served only to ReelKit sites → point `src` + `downloadUrl` at own files before copying.

## Why it works

- **Two props → slideshow with downloads.** `autoAdvance` plays as soon as lightbox opens; `showDownload` adds button saving current photo. Default bar gains play/pause + download buttons on its own.
- **Waits for each photo.** `autoAdvanceInterval` counted from moment photo loaded → slow connection never skips unseen picture.
- **Viewer stays in charge.** Swipe / key moves by hand, restarts next photo's interval, slideshow stays on. Pause button stops it; pointer resting on button or caption holds it. Stops on last photo unless `loop`.
- **Show small copy, save original.** `src` = what screen shows (resized keeps gallery fast). `downloadUrl` = what button saves, `downloadName` = file name. Sample CDN serves one size → both point at one file here.
- **Cross-origin downloads need CORS.** `download` attribute ignored on cross-origin link → lightbox fetches file, saves blob. File server must answer `Access-Control-Allow-Origin` for your site; otherwise photo opens in new tab so viewer can still save it (`downloadFile` in core).

## React

```tsx
const kSlideshowIntervalMs = 3000;

export default function GallerySlideshow() {
  const [{ openAt }] = useState(() => ({
    openAt: createSignal<number | null>(null),
  }));

  return (
    <>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 4,
        }}
      >
        {photos.map((photo, index) => (
          <button
            key={photo.src}
            aria-label={`Open ${photo.title}`}
            onClick={() => (openAt.value = index)}
          >
            <img src={photo.src} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <Observe signals={[openAt]}>
        {() => (
          <LightboxOverlay
            isOpen={openAt.value !== null}
            images={photos}
            initialIndex={openAt.value ?? 0}
            onClose={() => (openAt.value = null)}
            autoAdvance
            autoAdvanceInterval={kSlideshowIntervalMs}
            showDownload
          />
        )}
      </Observe>
    </>
  );
}
```

## Vue

`<LightboxOverlay v-model:is-open="open" :items="photos" :initial-index="startIndex" auto-advance :auto-advance-interval="kSlideshowIntervalMs" show-download />`.

## Angular

`<rk-lightbox-overlay [isOpen]="open()" [items]="photos" [initialIndex]="startIndex()" [autoAdvance]="true" [autoAdvanceInterval]="slideshowIntervalMs" [showDownload]="true" (closed)="open.set(false)" />`.
