import { create } from 'zustand';
import type { Clip, Composition, Format, TrackType, Transition } from '@/types/composition';
import { resolveEditorPanelTabForClip } from '@/lib/editorPanelRouting';
import {
  getClipBackgroundLane,
  getLane0Clips,
  isOnPrimaryBackgroundLane,
  migrateBackgroundLanes,
  PRIMARY_BACKGROUND_LANE,
  resolveOverlayLaneForDrop,
} from '@/lib/backgroundLanes';
import {
  applyMagneticV1TraceSnap,
  applyPrimaryLaneBackground,
  mergePackedLane0WithOtherBackground,
  packLane0Clips,
  rippleInsertLane0,
  rippleResizeLane0,
} from '@/lib/primaryBackgroundLane';
import { previewOverlayShiftLayout } from '@/lib/timelineTraceSnap';
import type { BackgroundDragPreview } from '@/lib/timelineBackgroundDrag';
import type { VideoAnalysisResponse } from '@/types/templates';

const DEFAULT_SEGMENT_DURATION = 5; // seconds per segment if no timing info

function buildInitialComposition(analysis: VideoAnalysisResponse): Composition {
  const segments = (analysis.segments ?? []).slice().sort((a, b) => a.seqNumber - b.seqNumber);
  const backgroundClips: Clip[] = [];
  const textClips: Clip[] = [];
  const overlayClips: Clip[] = [];
  let cursor = 0;

  for (const seg of segments) {
    const durationMs = seg.endTimeMs - seg.startTimeMs;
    const duration = durationMs > 0 ? durationMs / 1000 : DEFAULT_SEGMENT_DURATION;
    const start = cursor;
    const end = cursor + duration;

    const bgClip: Clip = {
      id: `bg-${seg.id}`,
      trackType: 'background',
      type: seg.generatedImages && seg.generatedImages.length > 0 ? 'image' : 'image',
      startTime: start,
      endTime: end,
      url: seg.generatedImages?.[0] ?? undefined,
      segmentId: seg.id,
      sequenceLabel: `S${seg.seqNumber}`,
      isFromAI: true,
      thumbnail: seg.generatedImages?.[0] ?? undefined,
      backgroundLane: PRIMARY_BACKGROUND_LANE,
    };

    const textClip: Clip = {
      id: `txt-${seg.id}`,
      trackType: 'text',
      type: 'text',
      startTime: start,
      endTime: end,
      content: seg.textOverlay ?? seg.transcript ?? '',
      position: 'bottom',
      x: 50,
      y: 80,
      boxWidthPct: 85,
      textAlign: 'center',
      fontSize: 24,
      fontColor: '#ffffff',
      fontWeight: 'bold',
      segmentId: seg.id,
      sequenceLabel: `S${seg.seqNumber}`,
    };

    backgroundClips.push(bgClip);
    textClips.push(textClip);

    // Exemple OV visible sur la première séquence (piste overlay)
    if (seg.seqNumber === 1) {
      overlayClips.push({
        id: `ov-demo-sticker-${seg.id}`,
        trackType: 'overlay',
        type: 'sticker',
        startTime: start,
        endTime: Math.min(start + 4, end),
        content: '✨',
        x: 82,
        y: 12,
        boxWidthPct: 18,
        fontSize: 52,
        opacity: 1,
        segmentId: seg.id,
        sequenceLabel: 'Sticker',
      });
      const fx = seg.capCutEffects?.[0];
      if (fx) {
        overlayClips.push({
          id: `ov-demo-fx-${seg.id}`,
          trackType: 'overlay',
          type: 'sticker',
          startTime: start,
          endTime: end,
          content: fx,
          x: 50,
          y: 8,
          boxWidthPct: 48,
          fontSize: 13,
          fontColor: '#fbbf24',
          fontWeight: 'bold',
          backgroundColor: '#000000',
          backgroundOpacity: 0.65,
          segmentId: seg.id,
          sequenceLabel: 'Effet',
        });
      }
    }

    cursor = end;
  }

  return {
    analysisId: analysis.id,
    title: 'Ma composition',
    duration: cursor,
    fps: 30,
    format: '9:16',
    tracks: {
      background: backgroundClips,
      text: textClips,
      audio: [],
      overlay: overlayClips,
      voiceover: [],
    },
    transitions: [],
  };
}

interface CompositionStore {
  composition: Composition | null;
  currentTime: number;
  isPlaying: boolean;
  zoom: number;
  selectedClipId: string | null;
  selectedTrack: TrackType | null;
  activeSequence: number;
  format: Format;
  history: Composition[];
  future: Composition[];
  exportStatus: 'idle' | 'exporting' | 'done' | 'failed';
  exportUrl: string | null;
  snapEnabled: boolean;
  compositionId: string | null;
  masterVolume: number;
  isMuted: boolean;
  clipboard: Clip | null;
  trackHidden: Record<TrackType, boolean>;
  trackLocked: Record<TrackType, boolean>;
  // Per-lane state — key = "${trackType}-${laneIndex}", e.g. "background-1"
  laneHidden: Record<string, boolean>;
  laneLocked: Record<string, boolean>;
  /** Ouvre l’onglet TRANS du panneau droit (consommé par RightPanel). */
  editorRequestedPanelTab: string | null;
  /** Met en avant un raccord précis dans la section TRANS (consommé par TransitionSection). */
  transitionEditorFocusPair: { fromClipId: string; toClipId: string } | null;
  /** Raccord V1 actuellement ciblé pour ajouter / modifier une transition. */
  selectedTransitionJunction: { fromClipId: string; toClipId: string } | null;
  /** Ré-ouvre le panneau droit si replié (consommé par la page éditeur). */
  editorRequestExpandRightPanel: boolean;

  setComposition: (c: Composition) => void;
  setCompositionId: (id: string) => void;
  initFromAnalysis: (analysis: VideoAnalysisResponse) => void;
  addClip: (clip: Clip) => void;
  /** Insère au playhead (ou startTime du clip) et décale le contenu existant vers la droite. */
  insertClipAtPlayhead: (clip: Clip) => void;
  updateClip: (id: string, updates: Partial<Clip>) => void;
  updateCompositionFrame: (
    updates: Partial<
      Pick<Composition, 'canvasBackgroundColor' | 'frameBorderColor' | 'frameBorderWidth'>
    >
  ) => void;
  removeClip: (id: string) => void;
  moveClip: (id: string, newStartTime: number) => void;
  /** Déplace un clip V (temps + piste overlay éventuelle). */
  moveBackgroundClip: (
    id: string,
    newStartTime: number,
    targetBackgroundLane?: number
  ) => void;
  /** Drop drag : applique exactement l’aperçu (ombre / ripple). */
  commitBackgroundDragPreview: (preview: BackgroundDragPreview) => void;
  resizeClip: (id: string, newStartTime: number, newEndTime: number) => void;
  addTransition: (t: Transition) => void;
  updateTransition: (
    id: string,
    updates: Partial<Pick<Transition, 'type' | 'duration' | 'presetId' | 'glTransitionName'>>
  ) => void;
  removeTransition: (id: string) => void;
  setCurrentTime: (t: number) => void;
  setIsPlaying: (v: boolean) => void;
  setZoom: (z: number) => void;
  setSelectedClip: (id: string | null) => void;
  setActiveSequence: (n: number) => void;
  setFormat: (f: Format) => void;
  setCustomAspect: (w: number, h: number) => void;
  setSnapEnabled: (v: boolean) => void;
  setMasterVolume: (v: number) => void;
  setIsMuted: (v: boolean) => void;
  setExportStatus: (s: 'idle' | 'exporting' | 'done' | 'failed') => void;
  setExportUrl: (url: string | null) => void;
  setClipboard: (clip: Clip | null) => void;
  pasteClip: () => void;
  splitClip: (id: string, splitTime: number) => void;
  addTextClip: (startTime?: number, endTime?: number) => void;
  addOverlayStickerClip: (startTime?: number, endTime?: number) => void;
  toggleTrackHidden: (t: TrackType) => void;
  toggleTrackLocked: (t: TrackType) => void;
  toggleLaneHidden: (key: string) => void;
  toggleLaneLocked: (key: string) => void;
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  openTransitionsPanelForClipPair: (fromClipId: string, toClipId: string) => void;
  selectTransitionJunction: (fromClipId: string, toClipId: string) => void;
  clearSelectedTransitionJunction: () => void;
  consumeEditorPanelTabRequest: () => void;
  requestEditorPanelTab: (tab: string) => void;
  clearTransitionEditorFocusPair: () => void;
  consumeEditorRequestExpandRightPanel: () => void;
}

function allClips(composition: Composition): Clip[] {
  return [
    ...composition.tracks.background,
    ...composition.tracks.text,
    ...composition.tracks.audio,
    ...composition.tracks.overlay,
    ...composition.tracks.voiceover,
  ];
}

/** Normalize compositions chargées sans la piste voiceover (JSON ancien). */
function normalizeCompositionTracks(c: Composition): Composition {
  const t = c.tracks;
  const voiceover = (t as { voiceover?: Clip[] }).voiceover;
  return {
    ...c,
    tracks: {
      background: t.background,
      text: t.text,
      audio: t.audio,
      overlay: t.overlay,
      voiceover: Array.isArray(voiceover) ? voiceover : [],
    },
  };
}

function updateClipInTrack(clips: Clip[], id: string, updates: Partial<Clip>): Clip[] {
  return clips.map((c) => (c.id === id ? { ...c, ...updates } : c));
}

function removeClipFromTrack(clips: Clip[], id: string): Clip[] {
  return clips.filter((c) => c.id !== id);
}

function recalcDuration(composition: Composition): number {
  const allC = allClips(composition);
  if (allC.length === 0) return 0;
  return Math.max(...allC.map((c) => c.endTime));
}

const TIME_EPS = 0.001;

/** Décale les clips à partir du playhead pour faire place à un nouvel insert. */
function rippleInsertOnTrack(
  clips: Clip[],
  insertTime: number,
  insertDuration: number,
  newClip: Clip
): Clip[] {
  const result: Clip[] = [];

  for (const clip of clips) {
    if (clip.startTime >= insertTime - TIME_EPS) {
      result.push({
        ...clip,
        startTime: clip.startTime + insertDuration,
        endTime: clip.endTime + insertDuration,
      });
    } else if (clip.endTime > insertTime + TIME_EPS) {
      const offsetIntoClip = insertTime - clip.startTime;
      const baseTrimStart = clip.trimStart ?? 0;
      const isTrimAware = clip.type === 'audio' || clip.type === 'video';

      result.push({ ...clip, endTime: insertTime });

      result.push({
        ...clip,
        id: `${clip.id}-ripple-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        startTime: insertTime + insertDuration,
        endTime: clip.endTime + insertDuration,
        trimStart: isTrimAware ? baseTrimStart + offsetIntoClip : clip.trimStart,
      });
    } else {
      result.push(clip);
    }
  }

  result.push(newClip);
  return result.sort((a, b) => a.startTime - b.startTime);
}

export const useCompositionStore = create<CompositionStore>((set, get) => ({
  composition: null,
  currentTime: 0,
  isPlaying: false,
  zoom: 1,
  selectedClipId: null,
  selectedTrack: null,
  activeSequence: 0,
  format: '9:16',
  history: [],
  future: [],
  exportStatus: 'idle',
  exportUrl: null,
  snapEnabled: true,
  compositionId: null,
  masterVolume: 1,
  isMuted: false,
  clipboard: null,
  trackHidden: { overlay: false, text: false, background: false, audio: false, voiceover: false },
  trackLocked: { overlay: false, text: false, background: false, audio: false, voiceover: false },
  laneHidden: {},
  laneLocked: {},
  editorRequestedPanelTab: null,
  transitionEditorFocusPair: null,
  selectedTransitionJunction: null,
  editorRequestExpandRightPanel: false,

  setComposition: (c) => {
    const normalized = normalizeCompositionTracks(c);
    const migrated = migrateBackgroundLanes(normalized.tracks.background);
    const background = applyPrimaryLaneBackground(migrated, packLane0Clips);
    set({
      composition: { ...normalized, tracks: { ...normalized.tracks, background } },
      format: normalized.format,
    });
  },
  setCompositionId: (id) => set({ compositionId: id }),

  initFromAnalysis: (analysis) => {
    const comp = buildInitialComposition(analysis);
    set({ composition: comp, format: comp.format, history: [], future: [], currentTime: 0 });
  },

  saveToHistory: () => {
    const { composition, history } = get();
    if (!composition) return;
    const newHistory = [...history, { ...composition }].slice(-50);
    set({ history: newHistory, future: [] });
  },

  openTransitionsPanelForClipPair: (fromClipId, toClipId) =>
    set({
      editorRequestedPanelTab: 'TRANS',
      transitionEditorFocusPair: { fromClipId, toClipId },
      selectedTransitionJunction: { fromClipId, toClipId },
      editorRequestExpandRightPanel: true,
    }),

  selectTransitionJunction: (fromClipId, toClipId) =>
    set({ selectedTransitionJunction: { fromClipId, toClipId } }),

  clearSelectedTransitionJunction: () => set({ selectedTransitionJunction: null }),

  consumeEditorPanelTabRequest: () => set({ editorRequestedPanelTab: null }),
  requestEditorPanelTab: (tab) =>
    set({ editorRequestedPanelTab: tab, editorRequestExpandRightPanel: true }),

  clearTransitionEditorFocusPair: () => set({ transitionEditorFocusPair: null }),

  consumeEditorRequestExpandRightPanel: () => set({ editorRequestExpandRightPanel: false }),

  undo: () => {
    const { history, composition, future } = get();
    if (history.length === 0 || !composition) return;
    const prev = history[history.length - 1];
    const newHistory = history.slice(0, -1);
    const newFuture = [{ ...composition }, ...future].slice(0, 50);
    set({ composition: normalizeCompositionTracks(prev), history: newHistory, future: newFuture });
  },

  redo: () => {
    const { future, composition, history } = get();
    if (future.length === 0 || !composition) return;
    const next = future[0];
    const newFuture = future.slice(1);
    const newHistory = [...history, { ...composition }].slice(-50);
    set({ composition: normalizeCompositionTracks(next), history: newHistory, future: newFuture });
  },

  addClip: (clip) => {
    const { composition, saveToHistory } = get();
    if (!composition) return;
    saveToHistory();
    const trackKey = clip.trackType as keyof typeof composition.tracks;
    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        [trackKey]: [...composition.tracks[trackKey], clip],
      },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated });
  },

  insertClipAtPlayhead: (clip) => {
    const { composition, saveToHistory } = get();
    if (!composition) return;
    const insertTime = Math.max(0, clip.startTime);
    const insertDuration = Math.max(0.1, clip.endTime - clip.startTime);
    const newClip: Clip = {
      ...clip,
      startTime: insertTime,
      endTime: insertTime + insertDuration,
    };
    saveToHistory();
    const trackKey = newClip.trackType as keyof typeof composition.tracks;

    let trackClips: Clip[];
    if (trackKey === 'background') {
      const bg = migrateBackgroundLanes(composition.tracks.background);
      const primaryClip: Clip = {
        ...newClip,
        backgroundLane: PRIMARY_BACKGROUND_LANE,
      };
      trackClips = applyPrimaryLaneBackground(bg, (lane0Clips) =>
        rippleInsertLane0(lane0Clips, insertTime, insertDuration, primaryClip)
      );
    } else {
      trackClips = rippleInsertOnTrack(
        composition.tracks[trackKey],
        insertTime,
        insertDuration,
        newClip
      );
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, [trackKey]: trackClips },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: newClip.id });
  },

  updateClip: (id, updates) => {
    const { composition } = get();
    if (!composition) return;

    const touchesTime =
      updates.startTime !== undefined || updates.endTime !== undefined;
    const bg = composition.tracks.background;
    if (
      touchesTime &&
      isOnPrimaryBackgroundLane(id, bg)
    ) {
      const background = applyPrimaryLaneBackground(bg, (lane0) => {
        const merged = lane0.map((c) => (c.id === id ? { ...c, ...updates } : c));
        return packLane0Clips(merged);
      });
      const updated: Composition = {
        ...composition,
        tracks: { ...composition.tracks, background },
      };
      updated.duration = recalcDuration(updated);
      set({ composition: updated });
      return;
    }

    const updated: Composition = {
      ...composition,
      tracks: {
        background: updateClipInTrack(composition.tracks.background, id, updates),
        text: updateClipInTrack(composition.tracks.text, id, updates),
        audio: updateClipInTrack(composition.tracks.audio, id, updates),
        overlay: updateClipInTrack(composition.tracks.overlay, id, updates),
        voiceover: updateClipInTrack(composition.tracks.voiceover, id, updates),
      },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated });
  },

  updateCompositionFrame: (updates) => {
    const { composition, saveToHistory } = get();
    if (!composition) return;
    saveToHistory();
    set({ composition: { ...composition, ...updates } });
  },

  removeClip: (id) => {
    const { composition, saveToHistory } = get();
    if (!composition) return;
    saveToHistory();

    let background = removeClipFromTrack(composition.tracks.background, id);
    if (isOnPrimaryBackgroundLane(id, composition.tracks.background)) {
      background = applyPrimaryLaneBackground(background, packLane0Clips);
    }

    const updated: Composition = {
      ...composition,
      tracks: {
        background,
        text: removeClipFromTrack(composition.tracks.text, id),
        audio: removeClipFromTrack(composition.tracks.audio, id),
        overlay: removeClipFromTrack(composition.tracks.overlay, id),
        voiceover: removeClipFromTrack(composition.tracks.voiceover, id),
      },
      transitions: composition.transitions.filter(
        (t) => t.fromClipId !== id && t.toClipId !== id
      ),
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: null });
  },

  moveClip: (id, newStartTime) => {
    const clip = get().composition
      ? allClips(get().composition!).find((c) => c.id === id)
      : undefined;
    if (clip?.trackType === 'background') {
      get().moveBackgroundClip(id, newStartTime);
      return;
    }
    const { composition } = get();
    if (!composition || !clip) return;
    const duration = clip.endTime - clip.startTime;
    const clamped = Math.max(0, newStartTime);
    get().updateClip(id, { startTime: clamped, endTime: clamped + duration });
  },

  moveBackgroundClip: (id, newStartTime, targetBackgroundLane) => {
    const { composition } = get();
    if (!composition) return;
    let bg = migrateBackgroundLanes(composition.tracks.background);
    const clip = bg.find((c) => c.id === id);
    if (!clip) return;

    const duration = Math.max(0.1, clip.endTime - clip.startTime);
    const clampedStart = Math.max(0, newStartTime);
    const clampedEnd = clampedStart + duration;
    const oldLane = getClipBackgroundLane(clip);
    const newLane =
      targetBackgroundLane !== undefined
        ? targetBackgroundLane
        : oldLane;

    if (newLane === PRIMARY_BACKGROUND_LANE) {
      if (oldLane === PRIMARY_BACKGROUND_LANE) {
        bg = bg.filter((c) => c.id !== id);
      } else {
        bg = mergePackedLane0WithOtherBackground(
          bg.filter((c) => c.id !== id),
          packLane0Clips(getLane0Clips(bg.filter((c) => c.id !== id)))
        );
      }

      const lanePeers = bg.filter(
        (c) => getClipBackgroundLane(c) === PRIMARY_BACKGROUND_LANE
      );
      const magnetic = applyMagneticV1TraceSnap(
        lanePeers,
        {
          displayStart: clampedStart,
          displayEnd: clampedEnd,
        },
        duration
      );
      const shiftPreview = previewOverlayShiftLayout(
        lanePeers,
        magnetic.displayStart,
        duration
      );

      const updatedClip: Clip = {
        ...clip,
        startTime: magnetic.displayStart,
        endTime: magnetic.displayEnd,
        backgroundLane: PRIMARY_BACKGROUND_LANE,
      };

      let background: Clip[];
      if (shiftPreview.shiftsNeighbors) {
        const shiftedById = new Map(
          shiftPreview.layoutClips.map((c) => [c.id, c] as const)
        );
        background = bg.map((c) => {
          if (getClipBackgroundLane(c) !== PRIMARY_BACKGROUND_LANE) return c;
          return shiftedById.get(c.id) ?? c;
        });
        background.push(updatedClip);
      } else {
        background = [...bg, updatedClip];
      }

      background = mergePackedLane0WithOtherBackground(
        background.filter((c) => getClipBackgroundLane(c) !== PRIMARY_BACKGROUND_LANE),
        packLane0Clips(getLane0Clips(background))
      );

      const updated: Composition = {
        ...composition,
        tracks: { ...composition.tracks, background },
      };
      updated.duration = recalcDuration(updated);
      set({ composition: updated, selectedClipId: id });
      return;
    }

    if (oldLane === PRIMARY_BACKGROUND_LANE) {
      const without = bg.filter((c) => c.id !== id);
      bg = mergePackedLane0WithOtherBackground(
        without,
        packLane0Clips(getLane0Clips(without))
      );
    }

    const resolvedLane = resolveOverlayLaneForDrop(
      bg,
      clampedStart,
      clampedEnd,
      Math.max(1, newLane),
      id
    );

    const updatedClip: Clip = {
      ...clip,
      startTime: clampedStart,
      endTime: clampedEnd,
      backgroundLane: resolvedLane,
    };

    const lanePeers = bg.filter(
      (c) => c.id !== id && getClipBackgroundLane(c) === resolvedLane
    );
    const shiftPreview = previewOverlayShiftLayout(lanePeers, clampedStart, duration);

    let background: Clip[];
    if (shiftPreview.shiftsNeighbors) {
      const shiftedIds = new Set(shiftPreview.layoutClips.map((c) => c.id));
      background = bg
        .filter((c) => c.id !== id)
        .map((c) => {
          if (shiftedIds.has(c.id)) {
            return shiftPreview.layoutClips.find((s) => s.id === c.id) ?? c;
          }
          return c;
        });
      background = [...background, updatedClip];
    } else {
      background = bg.some((c) => c.id === id)
        ? bg.map((c) => (c.id === id ? updatedClip : c))
        : [...bg, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, background },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: id });
  },

  commitBackgroundDragPreview: (preview) => {
    const { composition } = get();
    if (!composition) return;
    let bg = migrateBackgroundLanes(composition.tracks.background);
    const clip = bg.find((c) => c.id === preview.clipId);
    if (!clip) return;

    const startTime = preview.displayTraceStart;
    const endTime = preview.displayTraceEnd;
    const targetLane = preview.targetLane;
    const oldLane = getClipBackgroundLane(clip);

    const updatedClip: Clip = {
      ...clip,
      startTime,
      endTime,
      backgroundLane: targetLane,
    };

    bg = bg.filter((c) => c.id !== preview.clipId);

    if (oldLane === PRIMARY_BACKGROUND_LANE) {
      bg = mergePackedLane0WithOtherBackground(
        bg,
        packLane0Clips(getLane0Clips(bg))
      );
    }

    let background: Clip[];

    if (preview.laneRippleLayout) {
      const shiftedById = new Map(
        preview.laneRippleLayout.map((c) => [c.id, c] as const)
      );
      background = bg.map((c) => {
        if (getClipBackgroundLane(c) !== targetLane) return c;
        return shiftedById.get(c.id) ?? c;
      });
      background.push(updatedClip);
    } else {
      background = [...bg, updatedClip];
    }

    if (targetLane === PRIMARY_BACKGROUND_LANE) {
      background = mergePackedLane0WithOtherBackground(
        background.filter(
          (c) => getClipBackgroundLane(c) !== PRIMARY_BACKGROUND_LANE
        ),
        packLane0Clips(getLane0Clips(background))
      );
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, background },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: preview.clipId });
  },

  resizeClip: (id, newStartTime, newEndTime) => {
    const { composition } = get();
    if (!composition) return;
    const clip = allClips(composition).find((c) => c.id === id);
    if (!clip) return;

    const safeStart = Math.max(0, newStartTime);
    const safeEnd = Math.max(safeStart + 0.1, newEndTime);

    if (
      clip.trackType === 'background' &&
      isOnPrimaryBackgroundLane(id, composition.tracks.background)
    ) {
      const background = applyPrimaryLaneBackground(
        composition.tracks.background,
        (lane0) => rippleResizeLane0(lane0, id, safeStart, safeEnd)
      );
      const updated: Composition = {
        ...composition,
        tracks: { ...composition.tracks, background },
      };
      updated.duration = recalcDuration(updated);
      set({ composition: updated });
      return;
    }

    const updates: Partial<Clip> = { startTime: safeStart, endTime: safeEnd };

    const isTrimAware = clip.type === 'audio' || clip.type === 'video';
    if (isTrimAware && Math.abs(safeStart - clip.startTime) > 0.001) {
      const delta = safeStart - clip.startTime;
      updates.trimStart = Math.max(0, (clip.trimStart ?? 0) + delta);
    }

    get().updateClip(id, updates);
  },

  addTransition: (t) => {
    const { composition, saveToHistory } = get();
    if (!composition) return;
    const existing = composition.transitions.find(
      (tr) => tr.fromClipId === t.fromClipId && tr.toClipId === t.toClipId
    );
    if (existing) {
      saveToHistory();
      set({
        composition: {
          ...composition,
          transitions: composition.transitions.map((tr) =>
            tr.id === existing.id
              ? {
                  ...tr,
                  type: t.type,
                  duration: t.duration,
                  ...(t.presetId !== undefined ? { presetId: t.presetId } : {}),
                }
              : tr
          ),
        },
      });
      return;
    }
    saveToHistory();
    set({
      composition: {
        ...composition,
        transitions: [...composition.transitions, t],
      },
    });
  },

  updateTransition: (id, updates) => {
    const { composition, saveToHistory } = get();
    if (!composition) return;
    saveToHistory();
    set({
      composition: {
        ...composition,
        transitions: composition.transitions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      },
    });
  },

  removeTransition: (id) => {
    const { composition, saveToHistory } = get();
    if (!composition) return;
    saveToHistory();
    set({
      composition: {
        ...composition,
        transitions: composition.transitions.filter((t) => t.id !== id),
      },
    });
  },

  setCurrentTime: (t) => set({ currentTime: Math.max(0, t) }),
  setIsPlaying: (v) => set({ isPlaying: v }),
  setZoom: (z) => set({ zoom: Math.min(10, Math.max(1, z)) }),
  setSelectedClip: (id) => {
    const { composition, selectedClipId: prevId } = get();
    if (id === prevId) return;

    const patch: {
      selectedClipId: string | null;
      editorRequestedPanelTab?: string;
      editorRequestExpandRightPanel?: boolean;
    } = { selectedClipId: id };
    if (id && composition) {
      const tab = resolveEditorPanelTabForClip(composition, id);
      if (tab) {
        patch.editorRequestedPanelTab = tab;
        patch.editorRequestExpandRightPanel = true;
      }
    }
    set(patch);
  },
  setActiveSequence: (n) => set({ activeSequence: n }),
  setFormat: (f) => {
    const { composition, saveToHistory } = get();
    saveToHistory();
    const nextComp = composition
      ? {
          ...composition,
          format: f,
          ...(f === 'custom' && !composition.customAspectW
            ? { customAspectW: 9, customAspectH: 16 }
            : {}),
        }
      : null;
    set({ format: f, composition: nextComp });
  },

  setCustomAspect: (w, h) => {
    const { composition, saveToHistory } = get();
    if (!composition || w <= 0 || h <= 0) return;
    saveToHistory();
    const next = {
      ...composition,
      format: 'custom' as Format,
      customAspectW: Math.round(w),
      customAspectH: Math.round(h),
    };
    set({ format: 'custom', composition: next });
  },
  setSnapEnabled: (v) => set({ snapEnabled: v }),
  setMasterVolume: (v) => set({ masterVolume: Math.min(1, Math.max(0, v)) }),
  setIsMuted: (v) => set({ isMuted: v }),
  setExportStatus: (s) => set({ exportStatus: s }),
  setExportUrl: (url) => set({ exportUrl: url }),
  setClipboard: (clip) => set({ clipboard: clip }),

  pasteClip: () => {
    const { clipboard, currentTime, composition, saveToHistory } = get();
    if (!clipboard || !composition) return;
    saveToHistory();
    const dur = clipboard.endTime - clipboard.startTime;
    const newClip: Clip = {
      ...clipboard,
      id: `${clipboard.id}-paste-${Date.now()}`,
      startTime: currentTime,
      endTime: currentTime + dur,
    };
    const trackKey = newClip.trackType as keyof typeof composition.tracks;
    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, [trackKey]: [...composition.tracks[trackKey], newClip] },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: newClip.id });
  },

  splitClip: (id, splitTime) => {
    const { composition, saveToHistory } = get();
    if (!composition) return;
    const allC = allClips(composition);
    const clip = allC.find((c) => c.id === id);
    if (!clip || splitTime <= clip.startTime || splitTime >= clip.endTime) return;
    saveToHistory();
    const offsetIntoClip = splitTime - clip.startTime;
    const baseTrimStart = clip.trimStart ?? 0;
    const left: Clip = {
      ...clip,
      id: `${clip.id}-L-${Date.now()}`,
      endTime: splitTime,
    };
    const right: Clip = {
      ...clip,
      id: `${clip.id}-R-${Date.now()}`,
      startTime: splitTime,
      // Source offset moves forward so the audio/video resumes where the cut happened
      trimStart: baseTrimStart + offsetIntoClip,
    };
    const trackKey = clip.trackType as keyof typeof composition.tracks;
    const newTrack = composition.tracks[trackKey]
      .filter((c) => c.id !== id)
      .concat([left, right])
      .sort((a, b) => a.startTime - b.startTime);
    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, [trackKey]: newTrack },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: left.id });
  },

  addTextClip: (startTime, endTime) => {
    const { composition, currentTime, saveToHistory } = get();
    if (!composition) return;
    saveToHistory();
    const st = startTime ?? currentTime;
    const et = endTime ?? st + 5;
    const clip: Clip = {
      id: `txt-konva-${Date.now()}`,
      trackType: 'text',
      type: 'text',
      startTime: st,
      endTime: Math.max(st + 0.1, et),
      content: 'Votre texte',
      x: 50,
      y: 50,
      boxWidthPct: 42,
      fontSize: 42,
      lineHeight: 1.1,
      textAlign: 'center',
      fontColor: '#ffffff',
      fontWeight: 'bold',
      textPreset: 'none',
      position: 'center',
      sequenceLabel: 'Texte',
    };
    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, text: [...composition.tracks.text, clip] },
    };
    updated.duration = recalcDuration(updated);
    set({
      composition: updated,
      selectedClipId: clip.id,
      editorRequestedPanelTab: 'TEXTE',
      editorRequestExpandRightPanel: true,
    });
  },

  addOverlayStickerClip: (startTime, endTime) => {
    const { composition, currentTime, saveToHistory } = get();
    if (!composition) return;
    saveToHistory();
    const st = startTime ?? currentTime;
    const et = endTime ?? st + 4;
    const clip: Clip = {
      id: `ov-konva-${Date.now()}`,
      trackType: 'overlay',
      type: 'sticker',
      startTime: st,
      endTime: Math.max(st + 0.1, et),
      content: 'Sticker',
      x: 78,
      y: 18,
      boxWidthPct: 18,
      fontSize: 28,
      fontColor: '#ffffff',
      fontWeight: 'bold',
      sequenceLabel: 'Overlay',
    };
    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, overlay: [...composition.tracks.overlay, clip] },
    };
    updated.duration = recalcDuration(updated);
    set({
      composition: updated,
      selectedClipId: clip.id,
      editorRequestedPanelTab: 'OV',
      editorRequestExpandRightPanel: true,
    });
  },

  toggleTrackHidden: (t) =>
    set((s) => ({ trackHidden: { ...s.trackHidden, [t]: !s.trackHidden[t] } })),

  toggleTrackLocked: (t) =>
    set((s) => ({ trackLocked: { ...s.trackLocked, [t]: !s.trackLocked[t] } })),

  toggleLaneHidden: (key) =>
    set((s) => ({ laneHidden: { ...s.laneHidden, [key]: !s.laneHidden[key] } })),

  toggleLaneLocked: (key) =>
    set((s) => ({ laneLocked: { ...s.laneLocked, [key]: !s.laneLocked[key] } })),

}));
