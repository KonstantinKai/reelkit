import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

const REPO = 'KonstantinKai/reelkit';
const CACHE_KEY = `gh-star-count:${REPO}`;
const CACHE_TTL_MS = 60 * 60 * 1000;

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

function readCache(): number | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const { count, ts } = JSON.parse(raw) as { count: number; ts: number };
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return count;
  } catch {
    return null;
  }
}

function writeCache(count: number) {
  try {
    sessionStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ count, ts: Date.now() }),
    );
  } catch {
    // sessionStorage unavailable (private mode, SSR) — skip
  }
}

function useStarCount(): number | null {
  const [count, setCount] = useState<number | null>(() => readCache());

  useEffect(() => {
    if (count !== null) return;
    let cancelled = false;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data: { stargazers_count?: number } | null) => {
        if (cancelled || !data?.stargazers_count) return;
        setCount(data.stargazers_count);
        writeCache(data.stargazers_count);
      })
      .catch(() => {
        // rate-limited or offline — leave count null, button still works
      });
    return () => {
      cancelled = true;
    };
  }, [count]);

  return count;
}

interface GitHubStarButtonProps {
  variant?: 'primary' | 'secondary' | 'on-dark';
  className?: string;
}

const VARIANT_STYLES: Record<
  NonNullable<GitHubStarButtonProps['variant']>,
  string
> = {
  primary:
    'px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 text-white shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:scale-105',
  secondary:
    'px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700',
  'on-dark':
    'px-8 py-4 bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-700 hover:text-white hover:border-slate-600',
};

const COUNT_PILL_STYLES: Record<
  NonNullable<GitHubStarButtonProps['variant']>,
  string
> = {
  primary: 'bg-white/20',
  secondary: 'bg-slate-200/80 dark:bg-slate-700/80',
  'on-dark': 'bg-black/30',
};

export function GitHubStarButton({
  variant = 'secondary',
  className = '',
}: GitHubStarButtonProps) {
  const count = useStarCount();

  return (
    <a
      href={`https://github.com/${REPO}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Star ReelKit on GitHub${count !== null ? ` (${count} stars)` : ''}`}
      className={`group inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-300 ${VARIANT_STYLES[variant]} ${className}`}
    >
      <Star
        size={18}
        className="transition-transform duration-300 group-hover:rotate-[72deg] group-hover:fill-yellow-400 group-hover:text-yellow-400"
      />
      <span>Star on GitHub</span>
      {count !== null && (
        <span
          className={`ml-1 px-2 py-0.5 text-sm font-mono rounded-md text-current ${COUNT_PILL_STYLES[variant]}`}
        >
          {formatCount(count)}
        </span>
      )}
    </a>
  );
}
