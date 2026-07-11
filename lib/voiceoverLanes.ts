import type { Clip } from '@/types/composition';

const TIME_EPS = 0.001;

/** Piste VO1 (première ligne voix off — superposition libre, empilement vers le bas). */
export const PRIMARY_VOICEOVER_LANE = 0;

export function getClipVoiceoverLane(clip: Clip): number {
  return clip.voiceoverLane ?? PRIMARY_VOICEOVER_LANE;
}

export interface VoiceoverTimelineLane {
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

export function listActiveVoiceoverLaneIndices(
  clips: Clip[],
  previewLane?: number | null
): number[] {
  const used = new Set<number>();
  for (const c of clips) used.add(getClipVoiceoverLane(c));
  if (previewLane != null) used.add(previewLane);
  return Array.from(used).sort((a, b) => a - b);
}

export function compactVoiceoverLaneIndices(clips: Clip[]): Clip[] {
  if (clips.length === 0) return clips;
  const minUsed = Math.min(...clips.map(getClipVoiceoverLane));
  if (minUsed === PRIMARY_VOICEOVER_LANE) return clips;
  return clips.map((c) => ({
    ...c,
    voiceoverLane: getClipVoiceoverLane(c) - minUsed,
  }));
}

export function buildVoiceoverLanesForTimeline(
  clips: Clip[],
  previewLane?: number | null
): VoiceoverTimelineLane[] {
  const indices = listActiveVoiceoverLaneIndices(clips, previewLane);
  const lanes = indices.map((index) => ({
    index,
    clips: clips
      .filter((c) => getClipVoiceoverLane(c) === index)
      .sort((a, b) => a.startTime - b.startTime),
    isPreview:
      previewLane != null &&
      index === previewLane &&
      !clips.some((c) => getClipVoiceoverLane(c) === index),
  }));
  return lanes.sort((a, b) => a.index - b.index);
}

export function resolveVoiceoverTrackLaneForDrop(
  voiceoverClips: Clip[],
  start: number,
  end: number,
  preferredLane: number,
  excludeClipId?: string
): number {
  const lane = Math.max(PRIMARY_VOICEOVER_LANE, preferredLane);
  const others = voiceoverClips.filter((c) => c.id !== excludeClipId);
  const conflictOn = (idx: number) =>
    others
      .filter((c) => getClipVoiceoverLane(c) === idx)
      .some((c) => overlapsRange(c, start, end));

  if (!conflictOn(lane)) return lane;

  const existing = others
    .map(getClipVoiceoverLane)
    .filter((n) => n >= PRIMARY_VOICEOVER_LANE);
  let candidate = PRIMARY_VOICEOVER_LANE;
  while (candidate < 128) {
    if (!conflictOn(candidate)) return candidate;
    candidate++;
  }
  const maxExisting =
    existing.length > 0 ? Math.max(...existing) : PRIMARY_VOICEOVER_LANE;
  return Math.max(PRIMARY_VOICEOVER_LANE, maxExisting + 1);
}

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

export function migrateVoiceoverLanes(clips: Clip[]): Clip[] {
  if (clips.every((c) => c.voiceoverLane !== undefined)) return clips;

  const sorted = [...clips].sort((a, b) => a.startTime - b.startTime);
  const lanes: Clip[][] = [];
  const laneById = new Map<string, number>();

  for (const clip of sorted) {
    if (clip.voiceoverLane !== undefined) {
      const lane = clip.voiceoverLane;
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
    voiceoverLane: c.voiceoverLane ?? laneById.get(c.id) ?? PRIMARY_VOICEOVER_LANE,
  }));
}
