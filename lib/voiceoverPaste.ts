import type { Clip } from '@/types/composition';
import { getClipVoiceoverLane, PRIMARY_VOICEOVER_LANE } from '@/lib/voiceoverLanes';

const TIME_EPS = 0.001;

export function isVoiceoverClipboardClip(clip: Clip | null | undefined): boolean {
  return clip?.trackType === 'voiceover';
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

export function resolvePasteVoiceoverLane(
  voiceoverClips: Clip[],
  startTime: number,
  duration: number,
  preferredLane: number
): number {
  const safeStart = Math.max(0, startTime);
  const endTime = safeStart + Math.max(0.1, duration);
  const startLane = Math.max(PRIMARY_VOICEOVER_LANE, preferredLane);

  const maxUsed = voiceoverClips.reduce(
    (max, c) => Math.max(max, getClipVoiceoverLane(c)),
    startLane
  );

  for (let lane = startLane; lane <= maxUsed + 1; lane++) {
    const peers = voiceoverClips.filter((c) => getClipVoiceoverLane(c) === lane);
    if (!laneHasOverlap(peers, safeStart, endTime)) {
      return lane;
    }
  }

  let lane = maxUsed + 1;
  while (lane < 128) {
    const peers = voiceoverClips.filter((c) => getClipVoiceoverLane(c) === lane);
    if (!laneHasOverlap(peers, safeStart, endTime)) {
      return lane;
    }
    lane++;
  }

  return Math.max(PRIMARY_VOICEOVER_LANE, maxUsed + 1);
}

export function buildPastedVoiceoverClips(
  sources: Clip[],
  existingVoiceover: Clip[],
  pasteAnchorTime: number,
  preferredVoiceoverLane: number
): Clip[] {
  if (sources.length === 0) return [];

  const sorted = [...sources].sort((a, b) => a.startTime - b.startTime);
  const minStart = Math.min(...sorted.map((c) => c.startTime));
  const minLane = Math.min(...sorted.map((c) => getClipVoiceoverLane(c)));
  const timeOffset = Math.max(0, pasteAnchorTime) - minStart;
  const ts = Date.now();

  const placed: Clip[] = [];
  for (const source of sorted) {
    const dur = Math.max(0.1, source.endTime - source.startTime);
    const startTime = source.startTime + timeOffset;
    const relativeLane = getClipVoiceoverLane(source) - minLane;
    const preferred = Math.max(
      PRIMARY_VOICEOVER_LANE,
      preferredVoiceoverLane + relativeLane
    );
    const targetLane = resolvePasteVoiceoverLane(
      [...existingVoiceover, ...placed],
      startTime,
      dur,
      preferred
    );
    placed.push({
      ...source,
      id: `${source.id}-paste-${ts}-${placed.length}`,
      startTime,
      endTime: startTime + dur,
      trackType: 'voiceover',
      voiceoverLane: targetLane,
    });
  }
  return placed;
}
