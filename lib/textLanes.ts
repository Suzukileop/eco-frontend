import type { Clip } from '@/types/composition';

const TIME_EPS = 0.001;

/** Piste T1 (première ligne texte — superposition libre, comme T2+). */
export const PRIMARY_TEXT_LANE = 0;

export function getClipTextLane(clip: Clip): number {
  return clip.textLane ?? PRIMARY_TEXT_LANE;
}

export function isPrimaryTextClip(clip: Clip): boolean {
  return clip.trackType === 'text' && getClipTextLane(clip) === PRIMARY_TEXT_LANE;
}

export function isOverlayTextClip(clip: Clip): boolean {
  return clip.trackType === 'text' && getClipTextLane(clip) > PRIMARY_TEXT_LANE;
}

export function getTextLane0Clips(clips: Clip[]): Clip[] {
  return clips
    .filter((c) => isPrimaryTextClip(c))
    .sort((a, b) => a.startTime - b.startTime);
}

export function assignTextLanes(clips: Clip[]): Clip[][] {
  return buildTextLanesForTimeline(clips).map((l) => l.clips);
}

export interface TextTimelineLane {
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

export function listActiveTextLaneIndices(
  clips: Clip[],
  previewLane?: number | null
): number[] {
  const used = new Set<number>();
  for (const c of clips) used.add(getClipTextLane(c));
  if (previewLane != null) used.add(previewLane);
  return Array.from(used).sort((a, b) => a - b);
}

/** Recolle les indices de piste (ex. T2/T3 → T1/T2) quand T1 est vide. */
export function compactTextLaneIndices(clips: Clip[]): Clip[] {
  if (clips.length === 0) return clips;
  const minUsed = Math.min(...clips.map(getClipTextLane));
  if (minUsed === PRIMARY_TEXT_LANE) return clips;
  return clips.map((c) => ({
    ...c,
    textLane: getClipTextLane(c) - minUsed,
  }));
}

export function buildTextLanesForTimeline(
  clips: Clip[],
  previewLane?: number | null
): TextTimelineLane[] {
  const indices = listActiveTextLaneIndices(clips, previewLane);
  const lanes = indices.map((index) => ({
    index,
    clips: clips
      .filter((c) => getClipTextLane(c) === index)
      .sort((a, b) => a.startTime - b.startTime),
    isPreview:
      previewLane != null &&
      index === previewLane &&
      !clips.some((c) => getClipTextLane(c) === index),
  }));
  return lanes.sort((a, b) => b.index - a.index);
}

export function resolveTextOverlayLaneForDrop(
  textClips: Clip[],
  start: number,
  end: number,
  preferredLane: number,
  excludeClipId?: string
): number {
  const lane = Math.max(PRIMARY_TEXT_LANE, preferredLane);
  const others = textClips.filter((c) => c.id !== excludeClipId);
  const conflictOn = (idx: number) =>
    others
      .filter((c) => getClipTextLane(c) === idx)
      .some((c) => overlapsRange(c, start, end));

  if (!conflictOn(lane)) return lane;

  const existing = others.map(getClipTextLane).filter((n) => n >= PRIMARY_TEXT_LANE);
  let candidate = PRIMARY_TEXT_LANE;
  while (candidate < 128) {
    if (!conflictOn(candidate)) return candidate;
    candidate++;
  }
  const maxExisting = existing.length > 0 ? Math.max(...existing) : PRIMARY_TEXT_LANE;
  return Math.max(PRIMARY_TEXT_LANE, maxExisting + 1);
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

export function migrateTextLanes(clips: Clip[]): Clip[] {
  if (clips.every((c) => c.textLane !== undefined)) return clips;

  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
  const lanes: Clip[][] = [];
  const laneById = new Map<string, number>();

  for (const clip of sorted) {
    if (clip.textLane !== undefined) {
      const lane = clip.textLane;
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
    textLane: c.textLane ?? laneById.get(c.id) ?? PRIMARY_TEXT_LANE,
  }));
}

export function isOnPrimaryTextLane(clipId: string, textClips: Clip[]): boolean {
  const clip = textClips.find((c) => c.id === clipId);
  return clip != null && isPrimaryTextClip(clip);
}
