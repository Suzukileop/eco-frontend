import type { Clip } from '@/types/composition';
import {
  getClipVoiceoverLane,
  laneIndexFromVerticalDragDown,
  PRIMARY_VOICEOVER_LANE,
} from '@/lib/voiceoverLanes';
import {
  previewOverlayShiftLayout,
  resolveSnappedDisplayTrace,
} from '@/lib/timelineTraceSnap';

export interface VoiceoverDragPreview {
  clipId: string;
  targetLane: number;
  startTime: number;
  displayTraceStart: number;
  displayTraceEnd: number;
  traceStart: number;
  traceEnd: number;
  shiftsNeighbors: boolean;
  narrowGapInsert?: boolean;
  laneRippleLayout?: Clip[];
  sourceLaneRippleLayout?: Clip[];
}

export interface VoiceoverDragGhost {
  clipId: string;
  clientX: number;
  clientY: number;
  grabDx: number;
  grabDy: number;
  width: number;
  height: number;
}

export {
  pointerXToTime,
  pointerGhostLeftToTime,
  clampBackgroundDragPointer as clampVoiceoverDragPointer,
  isNearTimelineForDrop,
} from '@/lib/timelineBackgroundDrag';

import { type ClampedBackgroundDragPointer } from '@/lib/timelineBackgroundDrag';

export type ClampedVoiceoverDragPointer = ClampedBackgroundDragPointer;

export function resolveVoiceoverLaneForDrag(
  clientY: number,
  sourceLane: number,
  dragStartClientY: number,
  rowStepPx: number
): number {
  const step = rowStepPx > 0 ? rowStepPx : 56;
  const rows = Array.from(
    document.querySelectorAll<HTMLElement>('[data-voiceover-lane-index]')
  );

  const fromDelta = laneIndexFromVerticalDragDown(
    sourceLane,
    dragStartClientY,
    clientY,
    step
  );

  if (rows.length === 0) return fromDelta;

  const rowInfo = rows.map((row) => {
    const rect = row.getBoundingClientRect();
    return {
      lane: Number(row.dataset.voiceoverLaneIndex ?? PRIMARY_VOICEOVER_LANE),
      top: rect.top,
      bottom: rect.bottom,
    };
  });

  for (const r of rowInfo) {
    if (clientY >= r.top && clientY <= r.bottom) {
      return r.lane;
    }
  }

  const highest = rowInfo.reduce((a, b) => (a.top < b.top ? a : b));
  const lowest = rowInfo.reduce((a, b) => (a.bottom > b.bottom ? a : b));
  const maxLane = Math.max(...rowInfo.map((r) => r.lane));

  const draggingDown = clientY > dragStartClientY + step * 0.2;
  const draggingUp = clientY < dragStartClientY - step * 0.2;

  if (draggingDown && clientY > lowest.bottom) {
    const below = Math.max(1, Math.ceil((clientY - lowest.bottom) / step));
    return Math.max(fromDelta, maxLane + below);
  }

  if (draggingUp || clientY < highest.top) {
    return Math.max(0, Math.min(fromDelta, highest.lane));
  }

  let nearestLane = fromDelta;
  let bestDist = Number.POSITIVE_INFINITY;
  for (const r of rowInfo) {
    const mid = (r.top + r.bottom) / 2;
    const d = Math.abs(clientY - mid);
    if (d < bestDist) {
      bestDist = d;
      nearestLane = r.lane;
    }
  }

  if (draggingDown) {
    return Math.max(0, Math.min(Math.max(fromDelta, nearestLane), maxLane));
  }
  if (draggingUp) {
    return Math.max(0, Math.min(fromDelta, nearestLane));
  }

  return Math.max(0, Math.min(fromDelta, maxLane));
}

export function buildVoiceoverDragPreview(
  clip: Clip,
  allVoiceover: Clip[],
  targetLane: number,
  ghostStartTime: number,
  options?: { pinnedToTimelineStart?: boolean }
): VoiceoverDragPreview {
  const duration = Math.max(0.1, clip.endTime - clip.startTime);
  const laneClips = allVoiceover.filter(
    (c) => getClipVoiceoverLane(c) === targetLane
  );
  const withoutDragged = laneClips.filter((c) => c.id !== clip.id);

  const snapped = resolveSnappedDisplayTrace(
    withoutDragged,
    ghostStartTime,
    duration,
    options
  );

  const shiftPreview = previewOverlayShiftLayout(
    withoutDragged,
    snapped.displayStart,
    duration,
    snapped.narrowGapInsert ?? false
  );

  const laneRippleLayout = shiftPreview.shiftsNeighbors
    ? shiftPreview.layoutClips
    : undefined;

  return {
    clipId: clip.id,
    targetLane,
    startTime: snapped.displayStart,
    displayTraceStart: snapped.displayStart,
    displayTraceEnd: snapped.displayEnd,
    traceStart: snapped.displayStart,
    traceEnd: snapped.displayEnd,
    shiftsNeighbors: shiftPreview.shiftsNeighbors,
    narrowGapInsert: snapped.narrowGapInsert,
    laneRippleLayout,
    sourceLaneRippleLayout: undefined,
  };
}
