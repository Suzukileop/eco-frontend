import type { Clip } from '@/types/composition';
import { getClipTextLane, PRIMARY_TEXT_LANE } from '@/lib/textLanes';

const TIME_EPS = 0.001;

export function isTextClipboardClip(clip: Clip | null | undefined): boolean {
  return clip?.trackType === 'text';
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

export function resolvePasteTextLane(
  textClips: Clip[],
  startTime: number,
  duration: number,
  preferredLane: number
): number {
  const safeStart = Math.max(0, startTime);
  const endTime = safeStart + Math.max(0.1, duration);
  const startLane = Math.max(PRIMARY_TEXT_LANE, preferredLane);

  const maxUsed = textClips.reduce(
    (max, c) => Math.max(max, getClipTextLane(c)),
    startLane
  );

  for (let lane = startLane; lane <= maxUsed + 1; lane++) {
    const peers = textClips.filter((c) => getClipTextLane(c) === lane);
    if (!laneHasOverlap(peers, safeStart, endTime)) {
      return lane;
    }
  }

  let lane = maxUsed + 1;
  while (lane < 128) {
    const peers = textClips.filter((c) => getClipTextLane(c) === lane);
    if (!laneHasOverlap(peers, safeStart, endTime)) {
      return lane;
    }
    lane++;
  }

  return Math.max(1, maxUsed + 1);
}

export function buildPastedTextClips(
  sources: Clip[],
  existingText: Clip[],
  pasteAnchorTime: number,
  preferredTextLane: number
): Clip[] {
  if (sources.length === 0) return [];

  const sorted = [...sources].sort((a, b) => a.startTime - b.startTime);
  const minStart = Math.min(...sorted.map((c) => c.startTime));
  const minLane = Math.min(...sorted.map((c) => getClipTextLane(c)));
  const timeOffset = Math.max(0, pasteAnchorTime) - minStart;
  const ts = Date.now();

  const placed: Clip[] = [];
  for (const source of sorted) {
    const dur = Math.max(0.1, source.endTime - source.startTime);
    const startTime = source.startTime + timeOffset;
    const relativeLane = getClipTextLane(source) - minLane;
    const preferred = Math.max(
      PRIMARY_TEXT_LANE,
      preferredTextLane + relativeLane
    );
    const targetLane = resolvePasteTextLane(
      [...existingText, ...placed],
      startTime,
      dur,
      preferred
    );
    placed.push({
      ...source,
      id: `${source.id}-paste-${ts}-${placed.length}`,
      startTime,
      endTime: startTime + dur,
      trackType: 'text',
      type: 'text',
      textLane: targetLane,
    });
  }
  return placed;
}
