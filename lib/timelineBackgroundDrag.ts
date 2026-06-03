import type { Clip } from '@/types/composition';
import { LABEL_COL_WIDTH } from '@/lib/timelineTheme';
import {
  getClipBackgroundLane,
  laneIndexFromVerticalDrag,
  PRIMARY_BACKGROUND_LANE,
} from '@/lib/backgroundLanes';
import {
  applyMagneticV1TraceSnap,
  previewMagneticV1LaneLayout,
} from '@/lib/primaryBackgroundLane';
import {
  previewOverlayShiftLayout,
  resolveSnappedDisplayTrace,
} from '@/lib/timelineTraceSnap';

export interface BackgroundDragPreview {
  clipId: string;
  targetLane: number;
  startTime: number;
  /** Position affichée (bord gauche du ghost, alignée sur le média). */
  displayTraceStart: number;
  displayTraceEnd: number;
  /** Position au drop (ripple V1 / snap métier). */
  traceStart: number;
  traceEnd: number;
  shiftsNeighbors: boolean;
  narrowGapInsert?: boolean;
  laneRippleLayout?: Clip[];
}

export interface BackgroundDragGhost {
  clipId: string;
  clientX: number;
  clientY: number;
  grabDx: number;
  grabDy: number;
  width: number;
  height: number;
}

export interface BackgroundDragSession {
  clipId: string;
  sourceLane: number;
  preview: BackgroundDragPreview;
}

/** Temps depuis la position X (hors cadre → prolonge la timeline, pas de blocage). */
export function pointerXToTime(
  clientX: number,
  scrollEl: HTMLElement | null,
  pps: number
): number {
  if (!scrollEl || pps <= 0) return 0;
  const rect = scrollEl.getBoundingClientRect();
  const x = clientX - rect.left + scrollEl.scrollLeft - LABEL_COL_WIDTH;
  return Math.max(0, x / pps);
}

/** Temps au bord gauche du ghost (aligné sur le média, pas sur le curseur). */
export function pointerGhostLeftToTime(
  clientX: number,
  grabDx: number,
  scrollEl: HTMLElement | null,
  pps: number
): number {
  return pointerXToTime(clientX - grabDx, scrollEl, pps);
}

const TIMELINE_START_EPS = 0.001;

export interface ClampedBackgroundDragPointer {
  clientX: number;
  clientY: number;
  ghostStartTime: number;
  /** Bord gauche du ghost calé sur 00:00 → insertion tête de piste. */
  pinnedToTimelineStart: boolean;
}

/**
 * Limite le drag à la zone pistes (scroll timeline) : pas avant 00:00 ni hors cadre.
 */
export function clampBackgroundDragPointer(
  clientX: number,
  clientY: number,
  grabDx: number,
  grabDy: number,
  ghostHeight: number,
  scrollEl: HTMLElement | null,
  pps: number,
  maxGhostStartTime: number
): ClampedBackgroundDragPointer {
  if (!scrollEl || pps <= 0) {
    return {
      clientX,
      clientY,
      ghostStartTime: 0,
      pinnedToTimelineStart: true,
    };
  }

  const rect = scrollEl.getBoundingClientRect();
  const timelineZeroX = rect.left + LABEL_COL_WIDTH - scrollEl.scrollLeft;
  const minClientX = timelineZeroX + grabDx;
  const maxStart = Math.max(0, maxGhostStartTime);
  const maxClientX = timelineZeroX + maxStart * pps + grabDx;

  const cx = Math.min(Math.max(clientX, minClientX), maxClientX);

  const tracksTop = rect.top;
  const tracksBottom = rect.bottom;
  const minClientY = tracksTop + grabDy;
  const ghostBottomInset = Math.max(8, ghostHeight - grabDy);
  const maxClientY = Math.max(minClientY, tracksBottom - ghostBottomInset);
  const cy = Math.min(Math.max(clientY, minClientY), maxClientY);

  let ghostStartTime = pointerGhostLeftToTime(cx, grabDx, scrollEl, pps);
  const pinnedToTimelineStart = ghostStartTime <= TIMELINE_START_EPS;
  if (pinnedToTimelineStart) ghostStartTime = 0;

  return {
    clientX: cx,
    clientY: cy,
    ghostStartTime,
    pinnedToTimelineStart,
  };
}

/**
 * Piste V cible au drag vertical (CapCut) :
 * - curseur sur une ligne V existante → cette piste ;
 * - glisser vers le bas → index plus bas (min), jamais de nouvelle piste ;
 * - glisser vers le haut entre lignes existantes → index plus haut (max), plafonné ;
 * - nouvelle piste uniquement si drag vers le haut ET curseur au-dessus de toutes les lignes V.
 */
export function resolveBackgroundLaneForDrag(
  clientY: number,
  sourceLane: number,
  dragStartClientY: number,
  rowStepPx: number
): number {
  const step = rowStepPx > 0 ? rowStepPx : 56;
  const rows = Array.from(
    document.querySelectorAll<HTMLElement>('[data-background-lane-index]')
  );

  if (rows.length === 0) {
    return laneIndexFromVerticalDrag(sourceLane, dragStartClientY, clientY, step);
  }

  const rowInfo = rows.map((row) => {
    const rect = row.getBoundingClientRect();
    return {
      lane: Number(row.dataset.backgroundLaneIndex ?? PRIMARY_BACKGROUND_LANE),
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

  const fromDelta = laneIndexFromVerticalDrag(
    sourceLane,
    dragStartClientY,
    clientY,
    step
  );

  const draggingUp = clientY < dragStartClientY - step * 0.2;
  const draggingDown = clientY > dragStartClientY + step * 0.2;

  if (draggingUp && clientY < highest.top) {
    const above = Math.max(1, Math.ceil((highest.top - clientY) / step));
    return Math.max(fromDelta, maxLane + above);
  }

  if (draggingDown || clientY > lowest.bottom) {
    return Math.max(0, Math.min(fromDelta, lowest.lane));
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

  if (draggingUp) {
    return Math.max(0, Math.min(Math.max(fromDelta, nearestLane), maxLane));
  }
  if (draggingDown) {
    return Math.max(0, Math.min(fromDelta, nearestLane));
  }

  return Math.max(0, Math.min(fromDelta, maxLane));
}

export interface BuildBackgroundDragPreviewOptions {
  pinnedToTimelineStart?: boolean;
}

export function buildBackgroundDragPreview(
  clip: Clip,
  allBg: Clip[],
  targetLane: number,
  ghostStartTime: number,
  options?: BuildBackgroundDragPreviewOptions
): BackgroundDragPreview {
  const duration = Math.max(0.1, clip.endTime - clip.startTime);
  const laneClips = allBg.filter((c) => getClipBackgroundLane(c) === targetLane);
  const withoutDragged = laneClips.filter((c) => c.id !== clip.id);
  let snapped = resolveSnappedDisplayTrace(
    withoutDragged,
    ghostStartTime,
    duration,
    options
  );

  const isPrimaryLane = targetLane === PRIMARY_BACKGROUND_LANE;
  if (isPrimaryLane) {
    snapped = applyMagneticV1TraceSnap(withoutDragged, snapped, duration);
  }

  const shiftPreview = previewOverlayShiftLayout(
    withoutDragged,
    snapped.displayStart,
    duration,
    snapped.narrowGapInsert ?? false
  );

  const laneRippleLayout = isPrimaryLane
    ? previewMagneticV1LaneLayout(
        withoutDragged,
        shiftPreview.shiftsNeighbors ? shiftPreview.layoutClips : undefined,
        snapped.displayStart,
        snapped.displayEnd,
        clip
      )
    : shiftPreview.shiftsNeighbors
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
  };
}

export function updateBackgroundDragSession(
  session: BackgroundDragSession,
  clip: Clip,
  allBg: Clip[],
  clientX: number,
  clientY: number,
  grabDx: number,
  grabDy: number,
  ghostHeight: number,
  dragStartClientY: number,
  rowStepPx: number,
  scrollEl: HTMLElement | null,
  pps: number,
  maxGhostStartTime: number,
  snapEnabled: boolean
): BackgroundDragSession {
  const clamped = clampBackgroundDragPointer(
    clientX,
    clientY,
    grabDx,
    grabDy,
    ghostHeight,
    scrollEl,
    pps,
    maxGhostStartTime
  );
  let ghostTime = clamped.ghostStartTime;
  if (snapEnabled) ghostTime = Math.round(ghostTime * 10) / 10;
  const targetLane = resolveBackgroundLaneForDrag(
    clamped.clientY,
    session.sourceLane,
    dragStartClientY,
    rowStepPx
  );
  const preview = buildBackgroundDragPreview(clip, allBg, targetLane, ghostTime, {
    pinnedToTimelineStart: clamped.pinnedToTimelineStart,
  });
  return { clipId: session.clipId, sourceLane: session.sourceLane, preview };
}

/** Zone élargie : drop valide même si le curseur dépasse un peu le cadre. */
export function isNearTimelineForDrop(clientX: number, clientY: number): boolean {
  const zone = document.querySelector('[data-editor-timeline-zone]');
  if (!zone) return true;
  const rect = zone.getBoundingClientRect();
  const padX = 120;
  const padY = 80;
  return (
    clientX >= rect.left - padX &&
    clientX <= rect.right + padX &&
    clientY >= rect.top - padY &&
    clientY <= rect.bottom + padY
  );
}

export function getBackgroundLaneRowRect(laneIndex: number): DOMRect | null {
  const row = document.querySelector<HTMLElement>(
    `[data-background-lane-index="${laneIndex}"]`
  );
  return row?.getBoundingClientRect() ?? null;
}
