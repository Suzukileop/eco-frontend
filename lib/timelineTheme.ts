import type { TrackType } from '@/types/composition';

/** Thème clair timeline / contrôles (référence CapCut). */
export const LANE_HEIGHT = 48;
export const LANE_GAP = 6;
export const LABEL_COL_WIDTH = 96;
export const RULER_HEIGHT = 32;
export const LANE_CLIP_INSET_Y = 5;
/** Bandeau transitions au-dessus des clips (évite conflit avec trim). */
export const TRANSITION_RAIL_HEIGHT = 14;
export const CLIP_ICON_WIDTH = 24;
/** Décalage des poignées trim quand un clip voisin touche la jonction. */
export const TRIM_JUNCTION_INSET_PX = 14;

/** Ombre / trace de dépôt pendant le drag (réf. CapCut). */
export const CLIP_DROP_TRACE = {
  borderColor: 'rgba(34, 211, 238, 0.95)',
  fillColor: 'rgba(34, 211, 238, 0.12)',
  borderWidthPx: 2,
  borderRadiusPx: 8,
  zIndex: 44,
} as const;

export const CLIP_SELECTION = {
  borderColor: '#22d3ee',
  handleColor: '#22d3ee',
  handleHoverColor: '#06b6d4',
  /** Pilule trim sur le bord (réf. CapCut) */
  handlePillWidth: 5,
  handlePillHeight: 22,
  borderRadiusPx: 8,
  borderWidthPx: 2,
} as const;

export const TIMELINE_LIGHT = {
  toolbarBg: 'bg-white',
  toolbarBorder: 'border-neutral-200',
  surfaceBg: 'bg-white',
  headerBg: '#ffffff',
  laneSelectedGradient: 'linear-gradient(180deg, #d8dce3 0%, #cdd2da 100%)',
  laneIdleBg: '#f0f1f4',
  laneLockedBg: '#e8eaef',
  rulerBg: '#ffffff',
  gridLine: 'rgba(0,0,0,0.05)',
  playhead: '#171717',
  playheadLine: '#0a0a0a',
  previewWorkspaceBg: '#f0f1f4',
} as const;

/** Tête de lecture (réf. CapCut) — au-dessus de tous les éléments timeline. */
export const PLAYHEAD = {
  zIndex: 200,
  lineWidthPx: 2,
  headWidthPx: 12,
  headHeightPx: 22,
  headBorderPx: 1.5,
} as const;

/** Couleurs en hex — appliquées via style inline (Tailwind ne scanne pas lib/). */
export type ClipTrackStyle = {
  bgColor: string;
  borderColor: string;
  barColor: string;
  labelColor: string;
  labelBgColor: string;
  iconBadgeColor: string;
  iconColor: string;
  waveColor?: string;
};

export const CLIP_BY_TRACK: Record<TrackType, ClipTrackStyle> = {
  overlay: {
    bgColor: '#F48FB1',
    borderColor: '#E879A9',
    barColor: '#D9668F',
    labelColor: '#ffffff',
    labelBgColor: 'rgba(232, 121, 169, 0.35)',
    iconBadgeColor: 'rgba(224, 102, 149, 0.5)',
    iconColor: '#ffffff',
  },
  text: {
    bgColor: '#FFAB4D',
    borderColor: '#F59E0B',
    barColor: '#E8942E',
    labelColor: '#ffffff',
    labelBgColor: 'rgba(232, 148, 46, 0.4)',
    iconBadgeColor: 'rgba(232, 148, 46, 0.55)',
    iconColor: '#ffffff',
  },
  background: {
    bgColor: '#2A2A2A',
    borderColor: '#1F1F1F',
    barColor: 'rgba(115, 115, 115, 0.8)',
    labelColor: '#ffffff',
    labelBgColor: 'rgba(0, 0, 0, 0.55)',
    iconBadgeColor: 'rgba(0, 0, 0, 0.45)',
    iconColor: '#ffffff',
  },
  audio: {
    bgColor: '#7DCEA8',
    borderColor: '#5BB88A',
    barColor: '#4FA87A',
    labelColor: '#ffffff',
    labelBgColor: 'rgba(91, 184, 138, 0.35)',
    iconBadgeColor: 'rgba(91, 184, 138, 0.45)',
    iconColor: '#ffffff',
    waveColor: '#2d6b4f',
  },
  voiceover: {
    bgColor: '#B8A9E8',
    borderColor: '#9B8AD4',
    barColor: '#8B7BC8',
    labelColor: '#ffffff',
    labelBgColor: 'rgba(139, 123, 200, 0.4)',
    iconBadgeColor: 'rgba(139, 123, 200, 0.5)',
    iconColor: '#ffffff',
    waveColor: '#5b4d8a',
  },
};

export function getClipStyleForTrack(trackType: TrackType): ClipTrackStyle {
  return CLIP_BY_TRACK[trackType];
}

export function laneStripBackground(hasSelection: boolean, locked: boolean): string {
  if (locked) return TIMELINE_LIGHT.laneLockedBg;
  if (hasSelection) return TIMELINE_LIGHT.laneSelectedGradient;
  return TIMELINE_LIGHT.laneIdleBg;
}
