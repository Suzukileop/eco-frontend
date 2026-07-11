import type { TrackType } from '@/types/composition';

/** Thème clair timeline / contrôles (référence CapCut). */
/** Pistes utilitaires : texte, overlay, audio, voix off. */
export const LANE_HEIGHT_COMPACT = 28;
/** Piste vidéo superposition (V2+). */
export const LANE_HEIGHT_VIDEO_OVERLAY = 40;
/** Piste vidéo principale (V1). */
export const LANE_HEIGHT_VIDEO_PRIMARY = 56;
/** @deprecated Préférer getLaneHeight(trackType, laneIndex). */
export const LANE_HEIGHT = LANE_HEIGHT_VIDEO_PRIMARY;
export const LANE_GAP = 8;
export const LABEL_COL_WIDTH = 112;
export const RULER_HEIGHT = 32;
/** Largeur fixe du libellé piste (OV1, T1…) — alignement colonnes lock/eye. */
export const LANE_HEADER_LABEL_WIDTH = 28;
/** Boutons lock/eye — même taille sur toutes les pistes. */
export const LANE_HEADER_BTN_PX = 20;
export const LANE_CLIP_INSET_Y = 4;

export function getLaneHeight(trackType: TrackType, laneIndex = 0): number {
  if (trackType === 'background') {
    return laneIndex === 0 ? LANE_HEIGHT_VIDEO_PRIMARY : LANE_HEIGHT_VIDEO_OVERLAY;
  }
  return LANE_HEIGHT_COMPACT;
}

export function getLaneClipInsetY(trackType: TrackType, laneIndex = 0): number {
  if (trackType === 'background') {
    return laneIndex === 0 ? 4 : 3;
  }
  return 2;
}

export function getLaneDragStep(trackType: TrackType, laneIndex = 0): number {
  return getLaneHeight(trackType, laneIndex) + LANE_GAP;
}

/** Step moyen pour drag vertical entre pistes V (V1 et V2+ n’ont pas la même hauteur). */
export function getBackgroundLaneDragStep(): number {
  return (
    Math.round((LANE_HEIGHT_VIDEO_PRIMARY + LANE_HEIGHT_VIDEO_OVERLAY) / 2) + LANE_GAP
  );
}

export function isCompactLane(trackType: TrackType, laneIndex = 0): boolean {
  return getLaneHeight(trackType, laneIndex) <= LANE_HEIGHT_COMPACT;
}

/** Pistes avec contrôle mute dans l’en-tête timeline. */
export function trackSupportsLaneMute(trackType: TrackType): boolean {
  return trackType === 'background' || trackType === 'audio' || trackType === 'voiceover';
}

/** Bandeau transitions au-dessus des clips (évite conflit avec trim). */
export const TRANSITION_RAIL_HEIGHT = 14;
export const CLIP_ICON_WIDTH = 24;

export function getClipIconWidth(trackType: TrackType, laneIndex = 0): number {
  return isCompactLane(trackType, laneIndex) ? 18 : CLIP_ICON_WIDTH;
}
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

/** Teinte preview — source unique pour pistes timeline et zone preview */
const PREVIEW_WORKSPACE_BG = '#f0f5f7';
/** Nuance plus soutenue (piste avec clip sélectionné — bien visible vs preview) */
const LANE_SELECTED_BG = '#d2dce4';
/** Nuance atténuée (piste verrouillée) */
const LANE_LOCKED_BG = '#e8eef1';

export const TIMELINE_LIGHT = {
  toolbarBg: 'bg-white',
  toolbarBorder: 'border-neutral-200',
  surfaceBg: 'bg-white',
  headerBg: '#ffffff',
  /** Piste avec sélection — teinte preview renforcée */
  laneSelectedBg: LANE_SELECTED_BG,
  /** Piste sans sélection — identique au fond preview */
  laneIdleBg: PREVIEW_WORKSPACE_BG,
  laneLockedBg: LANE_LOCKED_BG,
  rulerBg: '#ffffff',
  gridLine: 'rgba(0,0,0,0.05)',
  playhead: '#171717',
  playheadLine: '#0a0a0a',
  /** Fond zone preview (autour du cadre) — bleu ciel très léger */
  previewWorkspaceBg: PREVIEW_WORKSPACE_BG,
  /** Survol zones format + menus contextuels (même teinte que la preview) */
  previewWorkspaceHoverBg: PREVIEW_WORKSPACE_BG,
} as const;

/** Tête de lecture (réf. CapCut) — au-dessus de tous les éléments timeline. */
export const PLAYHEAD = {
  zIndex: 200,
  lineWidthPx: 1.5,
  headWidthPx: 10,
  headHeightPx: 20,
  headBorderPx: 1.5,
  headRadiusPx: 2.5,
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
  if (hasSelection) return TIMELINE_LIGHT.laneSelectedBg;
  return TIMELINE_LIGHT.laneIdleBg;
}
