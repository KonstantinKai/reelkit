import type { CSSProperties } from 'react';

interface AnimatedWordmarkProps {
  className?: string;
}

const _kWords = [
  { text: 'Reel', className: 'text-slate-900 dark:text-white' },
  { text: 'Kit', className: 'rk-wordmark-gradient' },
];

/**
 * The "ReelKit" heading text, revealed letter by letter out of a blur. It
 * loops on the same six second cycle as `AnimatedLogo`, so the two enter and
 * leave together. The animation lives with the `rk-wordmark` rules in
 * `styles.css`.
 */
export function AnimatedWordmark({ className }: AnimatedWordmarkProps) {
  let index = 0;

  return (
    <span className={`rk-wordmark ${className ?? ''}`}>
      <span className="sr-only">ReelKit</span>
      <span aria-hidden="true">
        {_kWords.map((word) =>
          [...word.text].map((letter, position) => (
            <span
              key={index}
              className={`rk-wordmark-letter ${word.className}`}
              style={
                {
                  '--i': index++,
                  '--j': position,
                  '--n': word.text.length,
                } as CSSProperties
              }
            >
              {letter}
            </span>
          )),
        )}
      </span>
    </span>
  );
}
