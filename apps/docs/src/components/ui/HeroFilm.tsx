import { useEffect, useRef } from 'react';
import { cdnUrl } from '@reelkit/example-data';

// The files are immutable on the CDN, so a new cut gets a new version suffix
// instead of replacing these.
const _kFilm = 'hero/reelkit-intro-v1';
const _kPoster = 'hero/reelkit-intro-poster-v1.jpg';

export const heroFilmPreloadLinks = () => [
  {
    rel: 'preload',
    as: 'image',
    href: cdnUrl(_kPoster),
    fetchpriority: 'high',
  },
];

interface HeroFilmProps {
  /** Accessible name of the video. */
  label: string;
}

/**
 * The muted, looping intro film in the home page hero. Readers who ask for
 * reduced motion get the poster and the player controls instead of autoplay.
 */
export const HeroFilm = ({ label }: HeroFilmProps) => {
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const element = video.current;
    if (!element) return;

    // Server-rendered markup can reach the browser without the `muted`
    // attribute, and mobile browsers only autoplay muted video.
    element.muted = true;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      element.pause();
      element.controls = true;
      return;
    }
    element.play().catch(() => undefined);
  }, []);

  return (
    <video
      ref={video}
      className="block h-full w-full object-cover"
      autoPlay
      muted
      loop
      playsInline
      preload="auto"
      poster={cdnUrl(_kPoster)}
      aria-label={label}
    >
      <source src={cdnUrl(`${_kFilm}.mp4`)} type="video/mp4" />
      <source src={cdnUrl(`${_kFilm}.webm`)} type="video/webm" />
    </video>
  );
};
