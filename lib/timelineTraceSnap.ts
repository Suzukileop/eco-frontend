import type { Clip } from '@/types/composition';

const TIME_EPS = 0.001;

export interface SnappedDisplayTrace {
  displayStart: number;
  displayEnd: number;
  /** Gap trop étroit : insertion collée à gauche, espace effacé au drop. */
  narrowGapInsert?: boolean;
}

function traceOverlapsClip(clip: Clip, start: number, duration: number): boolean {
  const end = start + duration;
  return start < clip.endTime - TIME_EPS && end > clip.startTime + TIME_EPS;
}

function ghostOverlapsClip(
  clip: Clip,
  ghostStart: number,
  ghostEnd: number
): boolean {
  return (
    ghostStart < clip.endTime - TIME_EPS && ghostEnd > clip.startTime + TIME_EPS
  );
}

/** Média sous le ghost : celui que le ghost recouvre le plus (pas le curseur). */
function findHostClipUnderGhost(
  sorted: Clip[],
  ghostStart: number,
  ghostEnd: number
): Clip | undefined {
  const overlapping = sorted.filter((c) =>
    ghostOverlapsClip(c, ghostStart, ghostEnd)
  );
  if (overlapping.length === 0) return undefined;

  let best = overlapping[0];
  let bestOverlap = -1;
  for (const c of overlapping) {
    const overlap =
      Math.min(ghostEnd, c.endTime) - Math.max(ghostStart, c.startTime);
    if (overlap > bestOverlap) {
      bestOverlap = overlap;
      best = c;
    }
  }
  return best;
}

function ghostCoversTimeRange(
  ghostStart: number,
  ghostEnd: number,
  zoneStart: number,
  zoneEnd: number
): boolean {
  return (
    ghostStart < zoneEnd - TIME_EPS && ghostEnd > zoneStart + TIME_EPS
  );
}

/**
 * Gauche/droite selon le centre du ghost ; la trace « après » attend que le bord
 * droit du ghost dépasse la fin du média (symétrique pour « avant »).
 */
function resolveTraceSideOfHostSticky(
  host: Clip,
  ghostStart: number,
  ghostEnd: number
): 'before' | 'after' {
  const hostMid = (host.startTime + host.endTime) / 2;
  const ghostCenter = (ghostStart + ghostEnd) / 2;

  if (ghostCenter >= hostMid) {
    if (ghostEnd < host.endTime - TIME_EPS) return 'before';
    return 'after';
  }
  /** Premier média à t=0 : insertion au début (CapCut), pas bascule « après ». */
  if (host.startTime <= TIME_EPS) return 'before';
  if (ghostStart > host.startTime + TIME_EPS) return 'after';
  return 'before';
}

/** Trace collée au bord gauche ou droit du média chevauché (sans gap résiduel). */
function traceStartFlushToHost(
  host: Clip,
  sorted: Clip[],
  duration: number,
  side: 'before' | 'after'
): number {
  if (side === 'after') {
    return host.endTime;
  }

  const idx = sorted.indexOf(host);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const minStart = prev ? prev.endTime : 0;

  /** Insertion au tout début de la piste → t=0, repousse tout à droite au preview. */
  if (host.startTime <= TIME_EPS) {
    return 0;
  }

  const flushLeft = host.startTime - duration;
  if (flushLeft >= minStart - TIME_EPS) {
    return Math.max(0, flushLeft);
  }
  return minStart;
}

interface TimeGap {
  start: number;
  end: number;
}

function sortClips(clips: Clip[]): Clip[] {
  return [...clips].sort((a, b) => a.startTime - b.startTime);
}

/** Intervalle libre qui contient `time` (entre deux clips ou après le dernier). */
function findGapContaining(sorted: Clip[], time: number): TimeGap | null {
  let prevEnd = 0;
  for (const c of sorted) {
    if (time < c.startTime - TIME_EPS) {
      return { start: prevEnd, end: c.startTime };
    }
    if (time <= c.endTime + TIME_EPS) return null;
    prevEnd = c.endTime;
  }
  return { start: prevEnd, end: Number.POSITIVE_INFINITY };
}

function findFollowingClip(sorted: Clip[], displayStart: number): Clip | undefined {
  return sorted.find((c) => c.startTime >= displayStart - TIME_EPS);
}

function findPrecedingClip(sorted: Clip[], displayStart: number): Clip | undefined {
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i].endTime <= displayStart + TIME_EPS) return sorted[i];
  }
  return undefined;
}

function slotBeforeClip(
  host: Clip,
  sorted: Clip[],
  duration: number
): number {
  const idx = sorted.indexOf(host);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const gapStart = prev ? prev.endTime : 0;
  const ideal = host.startTime - duration;
  let start = Math.max(gapStart, ideal);
  if (start + duration > host.startTime + TIME_EPS) {
    start = host.endTime;
  }
  return Math.max(0, start);
}

function slotAfterClip(host: Clip): number {
  return host.endTime;
}

function enforceTraceClearOfClips(
  sorted: Clip[],
  start: number,
  duration: number,
  refCenter: number
): number {
  let s = Math.max(0, start);
  for (let guard = 0; guard < sorted.length + 2; guard++) {
    const blocker = sorted.find((c) => traceOverlapsClip(c, s, duration));
    if (!blocker) return s;

    const mid = (blocker.startTime + blocker.endTime) / 2;
    const idx = sorted.indexOf(blocker);
    const prev = idx > 0 ? sorted[idx - 1] : null;
    const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

    if (refCenter < mid) {
      const candidate = slotBeforeClip(blocker, sorted, duration);
      if (!traceOverlapsClip(blocker, candidate, duration)) {
        s = candidate;
        continue;
      }
      s = prev ? prev.endTime : 0;
    } else {
      const candidate = slotAfterClip(blocker);
      if (!next || candidate + duration <= next.startTime + TIME_EPS) {
        s = candidate;
        continue;
      }
      const before = slotBeforeClip(blocker, sorted, duration);
      s = traceOverlapsClip(blocker, before, duration) ? candidate : before;
    }
  }
  return Math.max(0, s);
}

/**
 * CapCut — trace (ombre) :
 * - ghost chevauche un média → trace à gauche/droite, attend que le ghost recouvre la zone ;
 * - gap large → placement libre dans le gap ;
 * - gap plus étroit que le média → M2 + trace + M3 (espace effacé, M3 repoussé).
 */
export interface ResolveSnappedDisplayTraceOptions {
  /** Ghost calé sur 00:00 (limite zone drag) → insertion + ripple. */
  pinnedToTimelineStart?: boolean;
}

export function resolveSnappedDisplayTrace(
  laneClipsWithoutDragged: Clip[],
  ghostStart: number,
  duration: number,
  options?: ResolveSnappedDisplayTraceOptions
): SnappedDisplayTrace {
  const safeDuration = Math.max(0.1, duration);
  const safeStart = Math.max(0, ghostStart);
  const ghostEnd = safeStart + safeDuration;
  const ghostCenter = safeStart + safeDuration / 2;
  const pinned = options?.pinnedToTimelineStart ?? false;

  if (laneClipsWithoutDragged.length === 0) {
    return {
      displayStart: pinned ? 0 : safeStart,
      displayEnd: (pinned ? 0 : safeStart) + safeDuration,
      narrowGapInsert: false,
    };
  }

  const sorted = sortClips(laneClipsWithoutDragged);

  /**
   * Limite 00:00 atteinte (même média large) : trace à t=0, repousse toute la piste.
   */
  if (pinned || safeStart <= TIME_EPS) {
    return {
      displayStart: 0,
      displayEnd: safeDuration,
      narrowGapInsert: false,
    };
  }

  const firstClip = sorted[0];

  /** Glisser vers 00:00 sur le premier média → insertion tête de piste (CapCut). */
  if (
    firstClip &&
    firstClip.startTime <= TIME_EPS &&
    ghostOverlapsClip(firstClip, safeStart, ghostEnd) &&
    ghostCenter <= (firstClip.startTime + firstClip.endTime) / 2 + TIME_EPS
  ) {
    return {
      displayStart: 0,
      displayEnd: safeDuration,
      narrowGapInsert: false,
    };
  }

  const host = findHostClipUnderGhost(sorted, safeStart, ghostEnd);

  let displayStart: number;
  let narrowGapInsert = false;

  if (host) {
    const side = resolveTraceSideOfHostSticky(host, safeStart, ghostEnd);
    displayStart = traceStartFlushToHost(host, sorted, safeDuration, side);
  } else {
    const gap = findGapContaining(sorted, ghostCenter);
    const ghostInGap =
      gap != null &&
      ghostCoversTimeRange(safeStart, ghostEnd, gap.start, gap.end);

    if (gap && ghostInGap) {
      const gapSize = gap.end - gap.start;
      if (gapSize >= safeDuration - TIME_EPS) {
        const maxStart = gap.end - safeDuration;
        displayStart = Math.max(gap.start, Math.min(safeStart, maxStart));
        displayStart = enforceTraceClearOfClips(
          sorted,
          displayStart,
          safeDuration,
          ghostCenter
        );
      } else {
        /** Espace M2–M3 plus étroit que M1 : colle après M2, efface le gap. */
        displayStart = gap.start;
        narrowGapInsert = true;
      }
    } else {
      const anchor = findPrecedingClip(sorted, ghostCenter);
      if (anchor && ghostEnd > anchor.endTime + TIME_EPS) {
        const side = resolveTraceSideOfHostSticky(
          anchor,
          safeStart,
          ghostEnd
        );
        displayStart = traceStartFlushToHost(
          anchor,
          sorted,
          safeDuration,
          side
        );
      } else if (anchor) {
        displayStart = traceStartFlushToHost(
          anchor,
          sorted,
          safeDuration,
          'before'
        );
      } else {
        const last = sorted[sorted.length - 1];
        displayStart = Math.max(last.endTime, safeStart);
        displayStart = enforceTraceClearOfClips(
          sorted,
          displayStart,
          safeDuration,
          ghostCenter
        );
      }
    }
  }

  displayStart = Math.max(0, displayStart);

  return {
    displayStart,
    displayEnd: displayStart + safeDuration,
    narrowGapInsert,
  };
}

export interface OverlayShiftPreview {
  layoutClips: Clip[];
  shiftsNeighbors: boolean;
}

/**
 * Décalage des voisins si la trace déborde du gap libre.
 * Gap étroit : repousse à partir de la fin du gap (début de M3), pas de trou résiduel.
 */
export function previewOverlayShiftLayout(
  laneClipsWithoutDragged: Clip[],
  displayStart: number,
  duration: number,
  narrowGapInsert = false
): OverlayShiftPreview {
  const safeDuration = Math.max(0.1, duration);
  const traceEnd = displayStart + safeDuration;
  const sorted = sortClips(laneClipsWithoutDragged);

  if (sorted.length === 0) {
    return { layoutClips: [], shiftsNeighbors: false };
  }

  const following = findFollowingClip(sorted, displayStart);
  if (!following) {
    return { layoutClips: sorted, shiftsNeighbors: false };
  }

  const preceding = findPrecedingClip(sorted, displayStart);
  const gapStart = preceding?.endTime ?? 0;
  const gapEnd = following.startTime;
  const gapSize = gapEnd - gapStart;

  const traceFitsInGap =
    !narrowGapInsert &&
    gapSize >= safeDuration - TIME_EPS &&
    displayStart >= gapStart - TIME_EPS &&
    traceEnd <= gapEnd + TIME_EPS;

  if (traceFitsInGap) {
    return { layoutClips: sorted, shiftsNeighbors: false };
  }

  const overlapsFollowing =
    displayStart < following.endTime - TIME_EPS &&
    traceEnd > following.startTime + TIME_EPS;

  const pushFrom = narrowGapInsert ? gapEnd : following.startTime;
  /**
   * Début de timeline (t=0) : repousse tout le contenu à partir du premier clip.
   * Sinon débordement réel sur le clip suivant.
   */
  const shiftDelta = narrowGapInsert
    ? Math.max(0, traceEnd - gapEnd)
    : displayStart <= TIME_EPS && following.startTime <= TIME_EPS
      ? traceEnd
      : overlapsFollowing
        ? Math.max(0, traceEnd - following.startTime)
        : 0;

  if (shiftDelta <= TIME_EPS) {
    return { layoutClips: sorted, shiftsNeighbors: false };
  }

  const layoutClips = sorted.map((c) => {
    if (c.startTime >= pushFrom - TIME_EPS) {
      return {
        ...c,
        startTime: c.startTime + shiftDelta,
        endTime: c.endTime + shiftDelta,
      };
    }
    return c;
  });

  return { layoutClips, shiftsNeighbors: true };
}
