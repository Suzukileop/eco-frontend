import type { Clip } from '@/types/composition';

const TIME_EPS = 0.001;

/** Piste OV1 (première ligne overlay — superposition libre). */
export const PRIMARY_OVERLAY_LANE = 0;

export function getClipOverlayLane(clip: Clip): number {
  return clip.overlayLane ?? PRIMARY_OVERLAY_LANE;
}

export interface OverlayTimelineLane {
  index: number;
  clips: Clip[];
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

export function listActiveOverlayLaneIndices(
  clips: Clip[],
  previewLane?: number | null
): number[] {
  const used = new Set<number>();
  for (const c of clips) used.add(getClipOverlayLane(c));
  if (previewLane != null) used.add(previewLane);
  return Array.from(used).sort((a, b) => a - b);
}

export function compactOverlayLaneIndices(clips: Clip[]): Clip[] {
  if (clips.length === 0) return clips;
  const minUsed = Math.min(...clips.map(getClipOverlayLane));
  if (minUsed === PRIMARY_OVERLAY_LANE) return clips;
  return clips.map((c) => ({
    ...c,
    overlayLane: getClipOverlayLane(c) - minUsed,
  }));
}

export function buildOverlayLanesForTimeline(
  clips: Clip[],
  previewLane?: number | null
): OverlayTimelineLane[] {
  const indices = listActiveOverlayLaneIndices(clips, previewLane);
  const lanes = indices.map((index) => ({
    index,
    clips: clips
      .filter((c) => getClipOverlayLane(c) === index)
      .sort((a, b) => a.startTime - b.startTime),
    isPreview:
      previewLane != null &&
      index === previewLane &&
      !clips.some((c) => getClipOverlayLane(c) === index),
  }));
  return lanes.sort((a, b) => b.index - a.index);
}

export function resolveOverlayTrackLaneForDrop(
  overlayClips: Clip[],
  start: number,
  end: number,
  preferredLane: number,
  excludeClipId?: string
): number {
  const lane = Math.max(PRIMARY_OVERLAY_LANE, preferredLane);
  const others = overlayClips.filter((c) => c.id !== excludeClipId);
  const conflictOn = (idx: number) =>
    others
      .filter((c) => getClipOverlayLane(c) === idx)
      .some((c) => overlapsRange(c, start, end));

  if (!conflictOn(lane)) return lane;

  const existing = others
    .map(getClipOverlayLane)
    .filter((n) => n >= PRIMARY_OVERLAY_LANE);
  let candidate = PRIMARY_OVERLAY_LANE;
  while (candidate < 128) {
    if (!conflictOn(candidate)) return candidate;
    candidate++;
  }
  const maxExisting =
    existing.length > 0 ? Math.max(...existing) : PRIMARY_OVERLAY_LANE;
  return Math.max(PRIMARY_OVERLAY_LANE, maxExisting + 1);
}

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

export function migrateOverlayLanes(clips: Clip[]): Clip[] {
  if (clips.every((c) => c.overlayLane !== undefined)) return clips;

  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
  const lanes: Clip[][] = [];
  const laneById = new Map<string, number>();

  for (const clip of sorted) {
    if (clip.overlayLane !== undefined) {
      const lane = clip.overlayLane;
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
    overlayLane: c.overlayLane ?? laneById.get(c.id) ?? PRIMARY_OVERLAY_LANE,
  }));
}
