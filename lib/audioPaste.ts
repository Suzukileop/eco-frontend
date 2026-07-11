import type { Clip } from '@/types/composition';
import { getClipAudioLane, PRIMARY_AUDIO_LANE } from '@/lib/audioLanes';

const TIME_EPS = 0.001;

export function isAudioClipboardClip(clip: Clip | null | undefined): boolean {
  return clip?.trackType === 'audio';
}

function laneHasOverlap(
  laneClips: Clip[],
  start: number,
  end: number
): boolean {
  return laneClips.some(
    (c) => start < c.endTime - TIME_EPS && end > c.startTime + TIME_EPS
  );
}

export function resolvePasteAudioLane(
  audioClips: Clip[],
  startTime: number,
  duration: number,
  preferredLane: number
): number {
  const safeStart = Math.max(0, startTime);
  const endTime = safeStart + Math.max(0.1, duration);
  const startLane = Math.max(PRIMARY_AUDIO_LANE, preferredLane);

  const maxUsed = audioClips.reduce(
    (max, c) => Math.max(max, getClipAudioLane(c)),
    startLane
  );

  for (let lane = startLane; lane <= maxUsed + 1; lane++) {
    const peers = audioClips.filter((c) => getClipAudioLane(c) === lane);
    if (!laneHasOverlap(peers, safeStart, endTime)) {
      return lane;
    }
  }

  let lane = maxUsed + 1;
  while (lane < 128) {
    const peers = audioClips.filter((c) => getClipAudioLane(c) === lane);
    if (!laneHasOverlap(peers, safeStart, endTime)) {
      return lane;
    }
    lane++;
  }

  return Math.max(PRIMARY_AUDIO_LANE, maxUsed + 1);
}

export function buildPastedAudioClips(
  sources: Clip[],
  existingAudio: Clip[],
  pasteAnchorTime: number,
  preferredAudioLane: number
): Clip[] {
  if (sources.length === 0) return [];

  const sorted = [...sources].sort((a, b) => a.startTime - b.startTime);
  const minStart = Math.min(...sorted.map((c) => c.startTime));
  const minLane = Math.min(...sorted.map((c) => getClipAudioLane(c)));
  const timeOffset = Math.max(0, pasteAnchorTime) - minStart;
  const ts = Date.now();

  const placed: Clip[] = [];
  for (const source of sorted) {
    const dur = Math.max(0.1, source.endTime - source.startTime);
    const startTime = source.startTime + timeOffset;
    const relativeLane = getClipAudioLane(source) - minLane;
    const preferred = Math.max(
      PRIMARY_AUDIO_LANE,
      preferredAudioLane + relativeLane
    );
    const targetLane = resolvePasteAudioLane(
      [...existingAudio, ...placed],
      startTime,
      dur,
      preferred
    );
    placed.push({
      ...source,
      id: `${source.id}-paste-${ts}-${placed.length}`,
      startTime,
      endTime: startTime + dur,
      trackType: 'audio',
      audioLane: targetLane,
    });
  }
  return placed;
}
