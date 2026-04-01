import type { FC } from 'react';
import { X, Pause, Play, Volume2, VolumeX } from 'lucide-react';
import type { AuthorInfo } from '@reelkit/stories-core';
import './StoryHeader.css';

/** Props for the {@link StoryHeader} component. */
export interface StoryHeaderProps {
  /** Author information (avatar, name, verified status). */
  author: AuthorInfo;

  /** When the story was created. Used to display a relative time string. */
  createdAt?: string | Date;

  /** Whether the story is currently paused. Controls the pause/play icon. */
  isPaused?: boolean;

  /** Whether audio is muted. */
  isMuted?: boolean;

  /** Whether the current story is a video (shows sound toggle). */
  isVideo?: boolean;

  /** Whether content is loading (shows spinner). */
  isLoading?: boolean;

  /** Whether content failed to load. Hides spinner when true. */
  isError?: boolean;

  /**
   * Whether the header is visible. When false, the header fades out.
   * @default true
   */
  visible?: boolean;

  /** Callback fired when the close button is clicked. */
  onClose: () => void;

  /** Callback fired when the pause/play button is clicked. */
  onTogglePause?: () => void;

  /** Callback fired when the sound toggle button is clicked. */
  onToggleSound?: () => void;
}

/**
 * Formats a date into a human-readable relative time string (e.g. "2h", "3d").
 */
function formatTimeAgo(date: string | Date): string {
  const now = Date.now();
  const then = new Date(date).getTime();
  const seconds = Math.floor((now - then) / 1000);

  if (seconds < 60) return 'now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}

/** Inline SVG for the verified badge (blue checkmark circle). */
const VerifiedBadge: FC = () => (
  <svg
    className="rk-stories-header-verified"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
  >
    <circle cx="12" cy="12" r="12" fill="#3897F0" />
    <path
      d="M9.5 12.5L11 14L15 10"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Default header for a stories player slide.
 *
 * Renders the author avatar, name, optional verified badge, relative
 * timestamp, and a close button. Supports an opacity transition for
 * show/hide (e.g. when paused with `hideUIOnPause`).
 */
export const StoryHeader: FC<StoryHeaderProps> = ({
  author,
  createdAt,
  onClose,
  isPaused,
  onTogglePause,
  isMuted,
  onToggleSound,
  isVideo,
  isLoading,
  isError,
  visible = true,
}) => (
  <div className="rk-stories-header" style={{ opacity: visible ? 1 : 0 }}>
    <img
      className="rk-stories-header-avatar"
      src={author.avatar}
      alt={author.name}
    />
    <span className="rk-stories-header-name">{author.name}</span>
    {author.verified && <VerifiedBadge />}
    {createdAt && (
      <span className="rk-stories-header-time">{formatTimeAgo(createdAt)}</span>
    )}
    <div className="rk-stories-header-actions">
      {isLoading && !isError && <div className="rk-stories-header-spinner" />}
      {isVideo && onToggleSound && (
        <button
          className="rk-stories-header-btn"
          onClick={onToggleSound}
          aria-label={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>
      )}
      {onTogglePause && (
        <button
          className="rk-stories-header-btn rk-stories-header-btn--desktop"
          onClick={onTogglePause}
          aria-label={isPaused ? 'Play' : 'Pause'}
        >
          {isPaused ? <Play size={20} /> : <Pause size={20} />}
        </button>
      )}
      <button
        className="rk-stories-header-btn"
        onClick={onClose}
        aria-label="Close"
      >
        <X size={24} />
      </button>
    </div>
  </div>
);
