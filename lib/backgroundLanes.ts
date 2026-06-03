import type { Clip } from '@/types/composition';

const TIME_EPS = 0.001;

/** Piste V1 (séquence principale, clips contigus). */
export const PRIMARY_BACKGROUND_LANE = 0;

export function getClipBackgroundLane(clip: Clip): number {
  return clip.backgroundLane ?? PRIMARY_BACKGROUND_LANE;
}

export function isPrimaryBackgroundClip(clip: Clip): boolean {
  return clip.trackType === 'background' && getClipBackgroundLane(clip) === PRIMARY_BACKGROUND_LANE;
}

export function isOverlayBackgroundClip(clip: Clip): boolean {
  return clip.trackType === 'background' && getClipBackgroundLane(clip) > PRIMARY_BACKGROUND_LANE;
}

export function getLane0Clips(clips: Clip[]): Clip[] {
  return clips
    .filter((c) => isPrimaryBackgroundClip(c))
    .sort((a, b) => a.startTime - b.startTime);
}

/** @deprecated Alias — préférer getLane0Clips */
export function firstBackgroundLane(clips: Clip[]): Clip[] {
  return getLane0Clips(clips);
}

export function assignBackgroundLanes(clips: Clip[]): Clip[][] {
  return buildBackgroundLanesForTimeline(clips).map((l) => l.clips);
}

export interface BackgroundTimelineLane {
  index: number;
  clips: Clip[];
  /** Ligne vide affichée uniquement pendant un drag vers le haut. */
  isPreview?: boolean;
}

function overlapsRange(
  clip: Clip,
  start: number,
  end: number,
  excludeId?: string
): boolean {
  if (clip.id === excludeId) return false;
  return start < clip.endTime - TIME_EPS && end > clip.startTime + TIME_EPS;
}

/** Indices de pistes V à afficher (pas de lignes vides entre les pistes utilisées). */
export function listActiveBackgroundLaneIndices(
  clips: Clip[],
  previewLane?: number | null
): number[] {
  const used = new Set<number>([PRIMARY_BACKGROUND_LANE]);
  for (const c of clips) used.add(getClipBackgroundLane(c));
  if (previewLane != null && previewLane > PRIMARY_BACKGROUND_LANE) {
    used.add(previewLane);
  }
  return Array.from(used).sort((a, b) => a - b);
}

/**
 * Pistes V pour la timeline : uniquement les lignes utilisées (+ éventuelle preview).
 * Ordre d’affichage : overlays en haut (index élevé), V1 en bas.
 */
export function buildBackgroundLanesForTimeline(
  clips: Clip[],
  previewLane?: number | null
): BackgroundTimelineLane[] {
  const indices = listActiveBackgroundLaneIndices(clips, previewLane);
  const lanes = indices.map((index) => ({
    index,
    clips: clips
      .filter((c) => getClipBackgroundLane(c) === index)
      .sort((a, b) => a.startTime - b.startTime),
    isPreview:
      previewLane != null &&
      index === previewLane &&
      !clips.some((c) => getClipBackgroundLane(c) === index),
  }));
  return lanes.sort((a, b) => b.index - a.index);
}

/** Piste overlay la plus basse disponible sur [start, end], ou nouvelle si besoin. */
export function resolveOverlayLaneForDrop(
  bg: Clip[],
  start: number,
  end: number,
  preferredLane: number,
  excludeClipId?: string
): number {
  const lane = Math.max(1, preferredLane);
  const others = bg.filter((c) => c.id !== excludeClipId);
  const conflictOn = (idx: number) =>
    others
      .filter((c) => getClipBackgroundLane(c) === idx)
      .some((c) => overlapsRange(c, start, end));

  if (!conflictOn(lane)) return lane;

  const existing = others
    .map(getClipBackgroundLane)
    .filter((n) => n >= 1);
  let candidate = 1;
  while (candidate < 128) {
    if (!conflictOn(candidate)) return candidate;
    candidate++;
  }
  const maxExisting = existing.length > 0 ? Math.max(...existing) : 0;
  return Math.max(1, maxExisting + 1);
}

/** Calcule la piste cible depuis un drag vertical (vers le haut = index plus élevé). */
export function laneIndexFromVerticalDrag(
  startLane: number,
  startClientY: number,
  clientY: number,
  rowStepPx: number
): number {
  if (rowStepPx <= 0) return startLane;
  const deltaRows = Math.round((startClientY - clientY) / rowStepPx);
  return Math.max(0, startLane + deltaRows);
}

/**
 * Attribue backgroundLane aux clips sans index (chargement / legacy)
 * via placement greedy temporel.
 */
export function migrateBackgroundLanes(clips: Clip[]): Clip[] {
  if (clips.every((c) => c.backgroundLane !== undefined)) return clips;

  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
  const lanes: Clip[][] = [];
  const laneById = new Map<string, number>();

  for (const clip of sorted) {
    if (clip.backgroundLane !== undefined) {
      const lane = clip.backgroundLane;
      while (lanes.length <= lane) lanes.push([]);
      lanes[lane].push(clip);
      laneById.set(clip.id, lane);
      continue;
    }

    let placed = false;
    for (let i = 0; i < lanes.length; i++) {
      const last = lanes[i][lanes[i].length - 1];
      if (last && last.endTime <= clip.startTime + TIME_EPS) {
        lanes[i].push(clip);
        laneById.set(clip.id, i);
        placed = true;
        break;
      }
    }
    if (!placed) {
      const idx = lanes.length;
      lanes.push([clip]);
      laneById.set(clip.id, idx);
    }
  }

  return clips.map((c) => ({
    ...c,
    backgroundLane: c.backgroundLane ?? laneById.get(c.id) ?? PRIMARY_BACKGROUND_LANE,
  }));
}

export function overlapsPrimaryLaneAt(
  lane0: Clip[],
  start: number,
  end: number
): boolean {
  return lane0.some(
    (c) => start < c.endTime - TIME_EPS && end > c.startTime + TIME_EPS
  );
}

/** Première piste V libre (≥ 1) sans chevauchement sur [start, end]. */
export function findAvailableOverlayLane(
  allBg: Clip[],
  start: number,
  end: number,
  excludeClipId?: string
): number {
  return resolveOverlayLaneForDrop(allBg, start, end, 1, excludeClipId);
}

export function isOnPrimaryBackgroundLane(clipId: string, bgClips: Clip[]): boolean {
  const clip = bgClips.find((c) => c.id === clipId);
  return clip != null && isPrimaryBackgroundClip(clip);
}
