import type { Clip } from '@/types/composition';

const TIME_EPS = 0.001;

/** Piste A1 (première ligne audio — superposition libre, nouvelles lanes vers le bas). */
export const PRIMARY_AUDIO_LANE = 0;

export function getClipAudioLane(clip: Clip): number {
  return clip.audioLane ?? PRIMARY_AUDIO_LANE;
}

export interface AudioTimelineLane {
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

export function listActiveAudioLaneIndices(
  clips: Clip[],
  previewLane?: number | null
): number[] {
  const used = new Set<number>();
  for (const c of clips) used.add(getClipAudioLane(c));
  if (previewLane != null) used.add(previewLane);
  return Array.from(used).sort((a, b) => a - b);
}

/** Recolle les indices quand A1 est vide (A2/A3 → A1/A2). */
export function compactAudioLaneIndices(clips: Clip[]): Clip[] {
  if (clips.length === 0) return clips;
  const minUsed = Math.min(...clips.map(getClipAudioLane));
  if (minUsed === PRIMARY_AUDIO_LANE) return clips;
  return clips.map((c) => ({
    ...c,
    audioLane: getClipAudioLane(c) - minUsed,
  }));
}

/** Lanes triées index croissant : A1 en haut, A2+ vers le bas (inverse OV/T/V). */
export function buildAudioLanesForTimeline(
  clips: Clip[],
  previewLane?: number | null
): AudioTimelineLane[] {
  const indices = listActiveAudioLaneIndices(clips, previewLane);
  const lanes = indices.map((index) => ({
    index,
    clips: clips
      .filter((c) => getClipAudioLane(c) === index)
      .sort((a, b) => a.startTime - b.startTime),
    isPreview:
      previewLane != null &&
      index === previewLane &&
      !clips.some((c) => getClipAudioLane(c) === index),
  }));
  return lanes.sort((a, b) => a.index - b.index);
}

export function resolveAudioTrackLaneForDrop(
  audioClips: Clip[],
  start: number,
  end: number,
  preferredLane: number,
  excludeClipId?: string
): number {
  const lane = Math.max(PRIMARY_AUDIO_LANE, preferredLane);
  const others = audioClips.filter((c) => c.id !== excludeClipId);
  const conflictOn = (idx: number) =>
    others
      .filter((c) => getClipAudioLane(c) === idx)
      .some((c) => overlapsRange(c, start, end));

  if (!conflictOn(lane)) return lane;

  const existing = others
    .map(getClipAudioLane)
    .filter((n) => n >= PRIMARY_AUDIO_LANE);
  let candidate = PRIMARY_AUDIO_LANE;
  while (candidate < 128) {
    if (!conflictOn(candidate)) return candidate;
    candidate++;
  }
  const maxExisting =
    existing.length > 0 ? Math.max(...existing) : PRIMARY_AUDIO_LANE;
  return Math.max(PRIMARY_AUDIO_LANE, maxExisting + 1);
}

/** Drag vertical audio : vers le bas = index plus élevé (lane en dessous). */
export function laneIndexFromVerticalDragDown(
  startLane: number,
  startClientY: number,
  clientY: number,
  rowStepPx: number
): number {
  if (rowStepPx <= 0) return startLane;
  const deltaRows = Math.round((clientY - startClientY) / rowStepPx);
  return Math.max(0, startLane + deltaRows);
}

export function migrateAudioLanes(clips: Clip[]): Clip[] {
  if (clips.every((c) => c.audioLane !== undefined)) return clips;

  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
  const lanes: Clip[][] = [];
  const laneById = new Map<string, number>();

  for (const clip of sorted) {
    if (clip.audioLane !== undefined) {
      const lane = clip.audioLane;
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
    audioLane: c.audioLane ?? laneById.get(c.id) ?? PRIMARY_AUDIO_LANE,
  }));
}
