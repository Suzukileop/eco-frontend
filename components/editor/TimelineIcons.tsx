import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  width: 16,
  height: 16,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconPlay(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <polygon points="8,5 19,12 8,19" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconPause(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <rect x="6" y="5" width="4" height="14" fill="currentColor" stroke="none" />
      <rect x="14" y="5" width="4" height="14" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconSkipBack(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <polygon points="11,5 20,12 11,19" fill="currentColor" stroke="none" />
      <line x1="5" y1="5" x2="5" y2="19" />
    </svg>
  );
}

export function IconSkipForward(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <polygon points="4,5 13,12 4,19" fill="currentColor" stroke="none" />
      <line x1="19" y1="5" x2="19" y2="19" />
    </svg>
  );
}

export function IconUndo(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M9 7H5v4" />
      <path d="M5 11a7 7 0 1 0 2-5" />
    </svg>
  );
}

export function IconRedo(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M15 7h4v4" />
      <path d="M19 11a7 7 0 1 1-2-5" />
    </svg>
  );
}

export function IconZoomOut(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="7" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

export function IconZoomIn(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <circle cx="11" cy="11" r="7" />
      <line x1="11" y1="8" x2="11" y2="14" />
      <line x1="8" y1="11" x2="14" y2="11" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

export function IconSnap(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <path d="M6 4v16" />
      <path d="M18 4v16" />
      <path d="M6 12h12" />
    </svg>
  );
}

export function IconVolume(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <polygon points="11,6 15,10 15,14 11,18 11,6" fill="currentColor" stroke="none" />
      <path d="M16 9a4 4 0 0 1 0 6" />
      <path d="M18 7a7 7 0 0 1 0 10" />
    </svg>
  );
}

export function IconVolumeMute(p: IconProps) {
  return (
    <svg {...base} {...p}>
      <polygon points="11,6 15,10 15,14 11,18 11,6" fill="currentColor" stroke="none" />
      <line x1="17" y1="9" x2="21" y2="15" />
      <line x1="21" y1="9" x2="17" y2="15" />
    </svg>
  );
}

export function IconLock(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconUnlock(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0" />
    </svg>
  );
}

export function IconEye(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="2.5" />
    </svg>
  );
}

export function IconEyeOff(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <path d="M10.7 10.7a2.5 2.5 0 0 0 3.5 3.5" />
      <path d="M6.3 6.3C3.5 8.1 2 12 2 12s2 4.5 5 6.5" />
      <path d="M17.7 17.7C20.5 15.9 22 12 22 12s-2-4.5-5-6.5" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

export function IconSplit(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <path d="M12 4v16" />
      <path d="M8 8l4-4 4 4" />
      <path d="M8 16l4 4 4-4" />
    </svg>
  );
}

export function IconCopy(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <rect x="9" y="9" width="11" height="11" rx="1" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

export function IconCut(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />      <path d="M20 4L8.5 15.5M20 20L8.5 8.5" />
    </svg>
  );
}

export function IconPaste(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <path d="M15 4h-1a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" />
      <path d="M9 4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1" />
    </svg>
  );
}

export function IconDuplicate(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <rect x="8" y="8" width="12" height="12" rx="1" />
      <path d="M4 16H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v1" />
    </svg>
  );
}

export function IconTrash(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} {...p}>
      <path d="M4 7h16" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M6 7V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v2" />
      <path d="M9 7V4h6v3" />
    </svg>
  );
}

export function IconClose(p: IconProps) {
  return (
    <svg {...base} width={12} height={12} {...p}>
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

/** Losange — overlay / effet (CapCut). */
export function IconClipDiamond(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
      <path d="M12 3.5 19.5 12 12 20.5 4.5 12 12 3.5Z" />
    </svg>
  );
}

/** Titre texte. */
export function IconClipText(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
      <path d="M7 5h10v3h-3.5v11H10.5V8H7V5Z" />
    </svg>
  );
}

/** Vidéo / image. */
export function IconClipFilm(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} viewBox="0 0 24 24" {...p}>
      <rect x="3" y="5" width="18" height="14" rx="1.5" />
      <line x1="7" y1="5" x2="7" y2="19" />
      <line x1="11" y1="5" x2="11" y2="19" />
      <line x1="15" y1="5" x2="15" y2="19" />
    </svg>
  );
}

/** Note de musique — piste audio. */
export function IconClipMusic(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} viewBox="0 0 24 24" fill="currentColor" stroke="none" {...p}>
      <path d="M14 4v9.2a3.5 3.5 0 1 1-2-3.17V6.5l-6-1.2v8.9a3.5 3.5 0 1 1-2-3.17V5.5l10 2Z" />
    </svg>
  );
}

/** Micro — voix off. */
export function IconClipMic(p: IconProps) {
  return (
    <svg {...base} width={14} height={14} viewBox="0 0 24 24" {...p}>
      <rect x="9" y="3" width="6" height="10" rx="3" />
      <path d="M6 11a6 6 0 0 0 12 0" />
      <line x1="12" y1="17" x2="12" y2="21" />
      <line x1="9" y1="21" x2="15" y2="21" />
    </svg>
  );
}
