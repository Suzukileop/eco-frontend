import type { Clip } from '@/types/composition';
import {
  getLane0Clips,
  isOnPrimaryBackgroundLane,
  PRIMARY_BACKGROUND_LANE,
} from '@/lib/backgroundLanes';

const TIME_EPS = 0.001;

export { isOnPrimaryBackgroundLane };

export interface MagneticV1TraceSnap {
  displayStart: number;
  displayEnd: number;
  narrowGapInsert?: boolean;
}

/** V1 : colle la trace au média précédent (pas d’espace vide entre clips). */
export function applyMagneticV1TraceSnap(
  laneWithoutDragged: Clip[],
  snapped: MagneticV1TraceSnap,
  duration: number
): MagneticV1TraceSnap {
  const safeDuration = Math.max(0.1, duration);
  const start = Math.max(0, snapped.displayStart);
  if (start <= TIME_EPS) return snapped;

  const sorted = [...laneWithoutDragged].sort((a, b) => a.startTime - b.startTime);
  let preceding: Clip | undefined;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].endTime <= start + TIME_EPS) {
      preceding = sorted[i];
      break;
    }
  }
  if (!preceding) return snapped;

  if (start > preceding.endTime + TIME_EPS) {
    const newStart = preceding.endTime;
    return {
      displayStart: newStart,
      displayEnd: newStart + safeDuration,
      narrowGapInsert: snapped.narrowGapInsert,
    };
  }
  return snapped;
}

/** Aperçu V1 : piste recollée bout à bout (ghost à la position de la trace). */
export function previewMagneticV1LaneLayout(
  laneWithoutDragged: Clip[],
  shiftedPeers: Clip[] | undefined,
  traceStart: number,
  traceEnd: number,
  draggedClip: Clip
): Clip[] {
  const base = shiftedPeers ?? laneWithoutDragged;
  const withTrace: Clip = {
    ...draggedClip,
    startTime: traceStart,
    endTime: traceEnd,
    backgroundLane: PRIMARY_BACKGROUND_LANE,
  };
  return packLane0Clips([...base, withTrace]);
}

/** Colle les clips de la piste V1 bout à bout à partir de t=0 (aucun espace entre eux). */
export function packLane0Clips(lane0: Clip[]): Clip[] {
  const sorted = [...lane0].sort((a, b) => a.startTime - b.startTime);
  let t = 0;
  return sorted.map((clip) => {
    const dur = Math.max(0.1, clip.endTime - clip.startTime);
    const packed: Clip = {
      ...clip,
      startTime: t,
      endTime: t + dur,
      backgroundLane: PRIMARY_BACKGROUND_LANE,
    };
    t += dur;
    return packed;
  });
}

export function mergePackedLane0WithOtherBackground(
  allBg: Clip[],
  packedLane0: Clip[]
): Clip[] {
  const lane0Ids = new Set(packedLane0.map((c) => c.id));
  const overlays = allBg.filter((c) => !lane0Ids.has(c.id));
  return [...packedLane0, ...overlays];
}

function applyTrimOnStartChange(clip: Clip, deltaStart: number): Clip {
  const isTrimAware = clip.type === 'video' || clip.type === 'audio';
  if (!isTrimAware || Math.abs(deltaStart) <= TIME_EPS) return clip;
  return {
    ...clip,
    trimStart: Math.max(0, (clip.trimStart ?? 0) + deltaStart),
  };
}

/**
 * Étire / rétrécit un clip V1 : seul ce clip change de durée ;
 * les voisins à gauche / droite se décalent sans changer de durée.
 */
export function rippleResizeLane0(
  lane0: Clip[],
  clipId: string,
  newStart: number,
  newEnd: number
): Clip[] {
  const sorted = [...lane0].sort((a, b) => a.startTime - b.startTime);
  const idx = sorted.findIndex((c) => c.id === clipId);
  if (idx < 0) return sorted;

  const target = sorted[idx];
  const safeStart = Math.max(0, newStart);
  const safeEnd = Math.max(safeStart + 0.1, newEnd);
  const deltaStart = safeStart - target.startTime;
  const deltaEnd = safeEnd - target.endTime;

  return sorted.map((clip, j) => {
    if (clip.id === clipId) {
      return applyTrimOnStartChange(
        { ...clip, startTime: safeStart, endTime: safeEnd },
        deltaStart
      );
    }
    if (j < idx && Math.abs(deltaStart) > TIME_EPS) {
      return {
        ...clip,
        startTime: Math.max(0, clip.startTime + deltaStart),
        endTime: Math.max(0.1, clip.endTime + deltaStart),
      };
    }
    if (j > idx && Math.abs(deltaEnd) > TIME_EPS) {
      return {
        ...clip,
        startTime: clip.startTime + deltaEnd,
        endTime: clip.endTime + deltaEnd,
      };
    }
    return clip;
  });
}

/** Insertion au playhead sur V1 uniquement (autres pistes V / OV inchangées). */
export function rippleInsertLane0(
  lane0: Clip[],
  insertTime: number,
  insertDuration: number,
  newClip: Clip
): Clip[] {
  const ordered = [...lane0].sort((a, b) => a.startTime - b.startTime);
  const host = ordered.find(
    (clip) =>
      insertTime > clip.startTime + TIME_EPS &&
      insertTime < clip.endTime - TIME_EPS
  );

  // Si le tracker est sur un média, on insère avant/après selon son milieu.
  const insertionPoint = (() => {
    if (!host) return Math.max(0, insertTime);
    const mid = host.startTime + (host.endTime - host.startTime) / 2;
    return insertTime < mid ? host.startTime : host.endTime;
  })();

  const result = ordered.map((clip) => {
    if (clip.startTime >= insertionPoint - TIME_EPS) {
      return {
        ...clip,
        startTime: clip.startTime + insertDuration,
        endTime: clip.endTime + insertDuration,
      };
    }
    return clip;
  });

  result.push({
    ...newClip,
    startTime: insertionPoint,
    endTime: insertionPoint + insertDuration,
  });
  return packLane0Clips(result);
}

export interface Lane0InsertPreview {
  /** Clips de la piste (sans le clip déplacé) — décalés si ripple actif. */
  layoutClips: Clip[];
  traceStart: number;
  traceEnd: number;
  /** true = les voisins à droite sont repoussés ; false = trace posée dans un espace existant. */
  shiftsNeighbors: boolean;
}

/**
 * Aperçu survol CapCut :
 * - S’il y a déjà un espace suffisant entre deux médias → trace dans le gap, pas de décalage.
 * - Si les médias se touchent (V1 collée) → repousse à droite au survol ; annulé si pas de drop.
 */
export function previewLaneInsertRipple(
  laneClips: Clip[],
  draggedId: string,
  targetTime: number,
  options?: { packContiguous?: boolean }
): Lane0InsertPreview {
  const dragged = laneClips.find((c) => c.id === draggedId);
  if (!dragged) {
    const end = targetTime + 5;
    return {
      layoutClips: laneClips,
      traceStart: targetTime,
      traceEnd: end,
      shiftsNeighbors: false,
    };
  }

  const duration = Math.max(0.1, dragged.endTime - dragged.startTime);
  const without = laneClips
    .filter((c) => c.id !== draggedId)
    .sort((a, b) => a.startTime - b.startTime);

  const ordered = options?.packContiguous ? packLane0Clips(without) : without;

  const center = targetTime + duration / 2;
  let insertIdx = ordered.findIndex(
    (c) => center < c.startTime + (c.endTime - c.startTime) / 2
  );
  if (insertIdx < 0) insertIdx = ordered.length;

  const prev = insertIdx > 0 ? ordered[insertIdx - 1] : null;
  const next = insertIdx < ordered.length ? ordered[insertIdx] : null;
  const gapStart = prev ? prev.endTime : 0;
  const gapEnd = next ? next.startTime : Number.POSITIVE_INFINITY;
  const gapSize = gapEnd - gapStart;
  const hasSpacing = gapSize > TIME_EPS;
  const gapFits = hasSpacing && gapSize >= duration - TIME_EPS;

  if (gapFits && !options?.packContiguous) {
    const traceStart = Math.max(
      gapStart,
      Math.min(targetTime, gapEnd - duration)
    );
    return {
      layoutClips: without,
      traceStart,
      traceEnd: traceStart + duration,
      shiftsNeighbors: false,
    };
  }

  const traceStart = insertIdx === 0 ? 0 : ordered[insertIdx - 1].endTime;
  const traceEnd = traceStart + duration;

  const layoutClips = without.map((c) => {
    if (c.startTime >= traceStart - TIME_EPS) {
      return {
        ...c,
        startTime: c.startTime + duration,
        endTime: c.endTime + duration,
      };
    }
    return c;
  });

  return {
    layoutClips,
    traceStart,
    traceEnd,
    shiftsNeighbors: true,
  };
}

/** @deprecated Utiliser previewLaneInsertRipple */
export function previewLane0InsertRipple(
  lane0: Clip[],
  draggedId: string,
  targetTime: number
): Lane0InsertPreview {
  return previewLaneInsertRipple(lane0, draggedId, targetTime, {
    packContiguous: true,
  });
}

/** Réordonne un clip sur V1 selon la position cible du drag, puis recolle la piste. */
export function reorderLane0Clip(lane0: Clip[], clipId: string, targetTime: number): Clip[] {
  const sorted = [...lane0].sort((a, b) => a.startTime - b.startTime);
  const idx = sorted.findIndex((c) => c.id === clipId);
  if (idx < 0) return sorted;

  const [moved] = sorted.splice(idx, 1);
  const dur = moved.endTime - moved.startTime;
  const center = targetTime + dur / 2;

  let insertAt = sorted.findIndex((c) => center < c.startTime + (c.endTime - c.startTime) / 2);
  if (insertAt < 0) insertAt = sorted.length;

  sorted.splice(insertAt, 0, moved);
  return packLane0Clips(sorted);
}

export function applyPrimaryLaneBackground(
  allBg: Clip[],
  mutateLane0: (lane0: Clip[]) => Clip[]
): Clip[] {
  const lane0 = getLane0Clips(allBg);
  const packed = packLane0Clips(mutateLane0(lane0));
  return mergePackedLane0WithOtherBackground(allBg, packed);
}
