import type { Clip } from '@/types/composition';
import {
  getTextLane0Clips,
  isOnPrimaryTextLane,
  PRIMARY_TEXT_LANE,
} from '@/lib/textLanes';
import type { ResolveSnappedDisplayTraceOptions } from '@/lib/timelineTraceSnap';
import {
  resolveSnappedDisplayTrace,
  type SnappedDisplayTrace,
} from '@/lib/timelineTraceSnap';

const TIME_EPS = 0.001;

export { isOnPrimaryTextLane };

export interface MagneticT1TraceSnap {
  displayStart: number;
  displayEnd: number;
  narrowGapInsert?: boolean;
}

export function applyMagneticT1TraceSnap(
  laneWithoutDragged: Clip[],
  snapped: MagneticT1TraceSnap,
  duration: number
): MagneticT1TraceSnap {
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

export function t1SequenceTailTime(laneWithoutDragged: Clip[]): number {
  if (laneWithoutDragged.length === 0) return 0;
  const packed = packTextLane0Clips(laneWithoutDragged);
  return packed[packed.length - 1].endTime;
}

export function resolveT1DragDisplayTrace(
  laneWithoutDragged: Clip[],
  ghostStartTime: number,
  duration: number,
  options?: ResolveSnappedDisplayTraceOptions
): SnappedDisplayTrace {
  const safeDuration = Math.max(0.1, duration);
  const safeStart = Math.max(0, ghostStartTime);
  const ghostCenter = safeStart + safeDuration / 2;
  const tail = t1SequenceTailTime(laneWithoutDragged);

  if (
    laneWithoutDragged.length > 0 &&
    (safeStart >= tail - TIME_EPS || ghostCenter >= tail - TIME_EPS)
  ) {
    return {
      displayStart: tail,
      displayEnd: tail + safeDuration,
      narrowGapInsert: false,
    };
  }

  let snapped = resolveSnappedDisplayTrace(
    laneWithoutDragged,
    ghostStartTime,
    duration,
    options
  );
  snapped = applyMagneticT1TraceSnap(laneWithoutDragged, snapped, duration);
  return snapped;
}

export function previewMagneticT1LaneLayout(
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
    textLane: PRIMARY_TEXT_LANE,
  };
  return packTextLane0Clips([...base, withTrace]);
}

export function packTextLane0Clips(lane0: Clip[]): Clip[] {
  const sorted = [...lane0].sort((a, b) => a.startTime - b.startTime);
  let t = 0;
  return sorted.map((clip) => {
    const dur = Math.max(0.1, clip.endTime - clip.startTime);
    const packed: Clip = {
      ...clip,
      startTime: t,
      endTime: t + dur,
      textLane: PRIMARY_TEXT_LANE,
    };
    t += dur;
    return packed;
  });
}

export function mergePackedTextLane0WithOtherText(
  allText: Clip[],
  packedLane0: Clip[]
): Clip[] {
  const lane0Ids = new Set(packedLane0.map((c) => c.id));
  const overlays = allText.filter((c) => !lane0Ids.has(c.id));
  return [...packedLane0, ...overlays];
}

export function rippleResizeTextLane(
  laneClips: Clip[],
  clipId: string,
  newStart: number,
  newEnd: number
): Clip[] {
  const sorted = [...laneClips].sort((a, b) => a.startTime - b.startTime);
  const idx = sorted.findIndex((c) => c.id === clipId);
  if (idx < 0) return sorted;

  const target = sorted[idx];
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;
  const minStart = prev ? prev.endTime : 0;

  let safeStart = Math.max(0, newStart);
  safeStart = Math.max(minStart, Math.min(safeStart, target.endTime - 0.1));

  const safeEnd = Math.max(safeStart + 0.1, newEnd);
  const deltaEnd = safeEnd - target.endTime;

  const pushOverflow =
    next && deltaEnd > TIME_EPS
      ? Math.max(0, safeEnd - next.startTime)
      : 0;

  return sorted.map((clip, j) => {
    if (clip.id === clipId) {
      return { ...clip, startTime: safeStart, endTime: safeEnd };
    }
    if (j > idx && pushOverflow > TIME_EPS) {
      return {
        ...clip,
        startTime: clip.startTime + pushOverflow,
        endTime: clip.endTime + pushOverflow,
      };
    }
    return clip;
  });
}

export function rippleInsertTextLane0(
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
  return packTextLane0Clips(result);
}

export function applyPrimaryLaneText(
  allText: Clip[],
  mutateLane0: (lane0: Clip[]) => Clip[]
): Clip[] {
  const lane0 = getTextLane0Clips(allText);
  const packed = packTextLane0Clips(mutateLane0(lane0));
  return mergePackedTextLane0WithOtherText(allText, packed);
}
