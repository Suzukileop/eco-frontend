import type { Clip } from '@/types/composition';
import {
  getClipBackgroundLane,
  PRIMARY_BACKGROUND_LANE,
} from '@/lib/backgroundLanes';

const TIME_EPS = 0.001;

export function isBackgroundClipboardClip(clip: Clip | null | undefined): boolean {
  return clip?.trackType === 'background';
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

/**
 * Piste pour coller au playhead : piste cliquée si libre, sinon overlay au-dessus (index +1…).
 */
export function resolvePasteBackgroundLane(
  bg: Clip[],
  startTime: number,
  duration: number,
  preferredLane: number
): number {
  const safeStart = Math.max(0, startTime);
  const endTime = safeStart + Math.max(0.1, duration);
  const startLane = Math.max(PRIMARY_BACKGROUND_LANE, preferredLane);

  const maxUsed = bg.reduce(
    (max, c) => Math.max(max, getClipBackgroundLane(c)),
    startLane
  );

  for (let lane = startLane; lane <= maxUsed + 1; lane++) {
    const peers = bg.filter((c) => getClipBackgroundLane(c) === lane);
    if (!laneHasOverlap(peers, safeStart, endTime)) {
      return lane;
    }
  }

  let lane = maxUsed + 1;
  while (lane < 128) {
    const peers = bg.filter((c) => getClipBackgroundLane(c) === lane);
    if (!laneHasOverlap(peers, safeStart, endTime)) {
      return lane;
    }
    lane++;
  }

  return Math.max(1, maxUsed + 1);
}

/**
 * Colle un ou plusieurs clips background au playhead en conservant
 * la structure relative (timing + pistes), avec la même résolution
 * de lane que le collage d'un seul clip.
 */
export function buildPastedBackgroundClips(
  sources: Clip[],
  existingBg: Clip[],
  pasteAnchorTime: number,
  preferredBackgroundLane: number
): Clip[] {
  if (sources.length === 0) return [];

  const sorted = [...sources].sort((a, b) => a.startTime - b.startTime);
  const minStart = Math.min(...sorted.map((c) => c.startTime));
  const minLane = Math.min(...sorted.map((c) => getClipBackgroundLane(c)));
  const timeOffset = Math.max(0, pasteAnchorTime) - minStart;
  const ts = Date.now();

  const placed: Clip[] = [];
  for (const source of sorted) {
    const dur = Math.max(0.1, source.endTime - source.startTime);
    const startTime = source.startTime + timeOffset;
    const relativeLane = getClipBackgroundLane(source) - minLane;
    const preferred = Math.max(
      PRIMARY_BACKGROUND_LANE,
      preferredBackgroundLane + relativeLane
    );
    const targetLane = resolvePasteBackgroundLane(
      [...existingBg, ...placed],
      startTime,
      dur,
      preferred
    );
    placed.push({
      ...source,
      id: `${source.id}-paste-${ts}-${placed.length}`,
      startTime,
      endTime: startTime + dur,
      trackType: 'background',
      backgroundLane: targetLane,
    });
  }
  return placed;
}
