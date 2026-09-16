#!/usr/bin/env node
// Builds the small WebP slides the home page hero demo shows.
//
// The demo on the home page sits in a 260×460 phone frame and its first slide
// is the page's largest paint, so the 800px CDN originals (up to 260 KB) cost
// the page its load time. Each slide is cropped to the frame the way
// `background-size: cover` would crop it, at 1.5× the frame size, and encoded
// as WebP, which every browser the docs support decodes. 1.5× rather than 2×
// keeps the first slide under 40 KB; the slide sits under a dark gradient,
// where the softer detail does not show. The React guide renders the same demo
// in a wide landscape preview and keeps the CDN originals.
//
// Needs ImageMagick (`magick`) and `cwebp` on the PATH. Run it when the demo
// slides change, then commit the output:
//
//   node scripts/docs-demo-images.mjs
import { execFileSync } from 'node:child_process';
import {
  mkdirSync,
  mkdtempSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// Same order and files as the slides in BasicSliderDemo.tsx.
const kSlides = [
  'image-07',
  'image-02',
  'image-03',
  'image-09',
  'image-05',
  'image-06',
  'image-08',
];
const kWidth = 390;
const kHeight = 690;
const kQuality = 50;
const kOutput = 'apps/docs/src/assets/demo';

mkdirSync(kOutput, { recursive: true });
const work = mkdtempSync(join(tmpdir(), 'docs-demo-images-'));

try {
  for (const [index, name] of kSlides.entries()) {
    // The CDN only answers requests that come from the site.
    const response = await fetch(
      `https://cdn.reelkit.dev/samples/images/${name}.jpg`,
      { headers: { Referer: 'https://reelkit.dev/' } },
    );
    if (!response.ok) {
      throw new Error(`${name}.jpg: ${response.status}`);
    }
    const original = join(work, `${name}.jpg`);
    const cropped = join(work, `${name}.png`);
    writeFileSync(original, Buffer.from(await response.arrayBuffer()));

    execFileSync('magick', [
      original,
      '-resize',
      `${kWidth}x${kHeight}^`,
      '-gravity',
      'center',
      '-extent',
      `${kWidth}x${kHeight}`,
      '-strip',
      cropped,
    ]);
    const target = join(kOutput, `slide-${index + 1}.webp`);
    execFileSync('cwebp', [
      '-quiet',
      '-m',
      '6',
      '-q',
      String(kQuality),
      '-sharp_yuv',
      cropped,
      '-o',
      target,
    ]);
    console.log(`${target}  ${statSync(target).size} bytes`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
