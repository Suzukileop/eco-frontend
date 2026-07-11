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
  rippleResizeBackgroundLane,
} from '@/lib/primaryBackgroundLane';
import {
  isBackgroundClipboardClip,
  buildPastedBackgroundClips,
} from '@/lib/backgroundPaste';
import {
  compactTextLaneIndices,
  getClipTextLane,
  migrateTextLanes,
  PRIMARY_TEXT_LANE,
  resolveTextOverlayLaneForDrop,
} from '@/lib/textLanes';
import { rippleResizeTextLane } from '@/lib/primaryTextLane';
import {
  isTextClipboardClip,
  buildPastedTextClips,
} from '@/lib/textPaste';
import { previewOverlayShiftLayout } from '@/lib/timelineTraceSnap';
import type { BackgroundDragPreview } from '@/lib/timelineBackgroundDrag';
import {
  isOverlayClipboardClip,
  buildPastedOverlayClips,
} from '@/lib/overlayPaste';
import {
  compactOverlayLaneIndices,
  getClipOverlayLane,
  migrateOverlayLanes,
  PRIMARY_OVERLAY_LANE,
  resolveOverlayTrackLaneForDrop,
} from '@/lib/overlayLanes';
import type { TextDragPreview } from '@/lib/timelineTextDrag';
import type { OverlayDragPreview } from '@/lib/timelineOverlayDrag';
import {
  compactAudioLaneIndices,
  getClipAudioLane,
  migrateAudioLanes,
  PRIMARY_AUDIO_LANE,
  resolveAudioTrackLaneForDrop,
} from '@/lib/audioLanes';
import {
  isAudioClipboardClip,
  buildPastedAudioClips,
} from '@/lib/audioPaste';
import type { AudioDragPreview } from '@/lib/timelineAudioDrag';
import {
  compactVoiceoverLaneIndices,
  getClipVoiceoverLane,
  migrateVoiceoverLanes,
  PRIMARY_VOICEOVER_LANE,
  resolveVoiceoverTrackLaneForDrop,
} from '@/lib/voiceoverLanes';
import {
  isVoiceoverClipboardClip,
  buildPastedVoiceoverClips,
} from '@/lib/voiceoverPaste';
import type { VoiceoverDragPreview } from '@/lib/timelineVoiceoverDrag';
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
      textLane: PRIMARY_TEXT_LANE,
      content: seg.textOverlay ?? seg.transcript ?? '',
      position: 'bottom',
      x: 50,
      y: 80,
      boxWidthPct: 85,
      textAlign: 'center',
      fontSize: 24,
      textScaleBaseFontSize: 24,
      textScalePct: 100,
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
        overlayLane: PRIMARY_OVERLAY_LANE,
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
          overlayLane: PRIMARY_OVERLAY_LANE,
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
  /** Horloge de lecture : 'remotion' quand StudioPlayer est actif, sinon 'raf'. */
  playbackDriver: 'raf' | 'remotion';
  /** Preview GL : true après la 1re frame de transition dessinée (évite blink entrée). */
  v1GlCoverReady: boolean;
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
  /** Presse-papier multi-clips (background) — conserve les positions relatives. */
  clipboardMulti: Clip[] | null;
  trackHidden: Record<TrackType, boolean>;
  trackLocked: Record<TrackType, boolean>;
  // Per-lane state — key = "${trackType}-${laneIndex}", e.g. "background-1"
  laneHidden: Record<string, boolean>;
  laneLocked: Record<string, boolean>;
  /** Mute par piste (clé `${trackType}-${laneIndex}`). */
  laneMuted: Record<string, boolean>;
  /** Ouvre l’onglet TRANS du panneau droit (consommé par RightPanel). */
  editorRequestedPanelTab: string | null;
  /** Met en avant un raccord précis dans la section TRANS (consommé par TransitionSection). */
  transitionEditorFocusPair: { fromClipId: string; toClipId: string } | null;
  /** Raccord V1 actuellement ciblé pour ajouter / modifier une transition. */
  selectedTransitionJunction: { fromClipId: string; toClipId: string } | null;
  /** Ré-ouvre le panneau droit si replié (consommé par la page éditeur). */
  editorRequestExpandRightPanel: boolean;
  /** Sélection multiple sur piste media (background) ou texte. */
  selectedClipIds: string[];
  /** Type de piste pour la multi-sélection timeline. */
  selectedClipTrackType: 'background' | 'text' | 'overlay' | 'audio' | 'voiceover' | null;

  setComposition: (c: Composition) => void;
  setCompositionId: (id: string | null) => void;
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
  moveTextClip: (
    id: string,
    newStartTime: number,
    targetTextLane?: number
  ) => void;
  moveOverlayClip: (
    id: string,
    newStartTime: number,
    targetOverlayLane?: number
  ) => void;
  moveAudioClip: (
    id: string,
    newStartTime: number,
    targetAudioLane?: number
  ) => void;
  moveVoiceoverClip: (
    id: string,
    newStartTime: number,
    targetVoiceoverLane?: number
  ) => void;
  /** Drop drag : applique exactement l’aperçu (ombre / ripple). */
  commitBackgroundDragPreview: (preview: BackgroundDragPreview) => void;
  commitTextDragPreview: (preview: TextDragPreview) => void;
  commitOverlayDragPreview: (preview: OverlayDragPreview) => void;
  commitAudioDragPreview: (preview: AudioDragPreview) => void;
  commitVoiceoverDragPreview: (preview: VoiceoverDragPreview) => void;
  resizeClip: (id: string, newStartTime: number, newEndTime: number) => void;
  addTransition: (t: Transition) => void;
  updateTransition: (
    id: string,
    updates: Partial<Pick<Transition, 'type' | 'duration' | 'presetId' | 'glTransitionName'>>
  ) => void;
  removeTransition: (id: string) => void;
  setCurrentTime: (t: number) => void;
  setIsPlaying: (v: boolean) => void;
  setPlaybackDriver: (d: 'raf' | 'remotion') => void;
  setV1GlCoverReady: (v: boolean) => void;
  setZoom: (z: number) => void;
  setSelectedClip: (id: string | null) => void;
  toggleBackgroundClipSelection: (id: string) => void;
  toggleTextClipSelection: (id: string) => void;
  toggleOverlayClipSelection: (id: string) => void;
  toggleAudioClipSelection: (id: string) => void;
  toggleVoiceoverClipSelection: (id: string) => void;
  setBackgroundClipSelection: (ids: string[]) => void;
  setTextClipSelection: (ids: string[]) => void;
  setOverlayClipSelection: (ids: string[]) => void;
  setAudioClipSelection: (ids: string[]) => void;
  setVoiceoverClipSelection: (ids: string[]) => void;
  clearBackgroundClipSelection: () => void;
  clearTextClipSelection: () => void;
  clearOverlayClipSelection: () => void;
  clearAudioClipSelection: () => void;
  clearVoiceoverClipSelection: () => void;
  clearLaneClipSelection: () => void;
  setActiveSequence: (n: number) => void;
  setFormat: (f: Format) => void;
  setCustomAspect: (w: number, h: number) => void;
  setSnapEnabled: (v: boolean) => void;
  setMasterVolume: (v: number) => void;
  setIsMuted: (v: boolean) => void;
  setExportStatus: (s: 'idle' | 'exporting' | 'done' | 'failed') => void;
  setExportUrl: (url: string | null) => void;
  setClipboard: (clip: Clip | null) => void;
  pasteClip: (preferredBackgroundLane?: number) => void;
  pasteTextClip: (preferredTextLane?: number) => void;
  pasteOverlayClip: (preferredOverlayLane?: number) => void;
  pasteAudioClip: (preferredAudioLane?: number) => void;
  pasteVoiceoverClip: (preferredVoiceoverLane?: number) => void;
  setClipboardMulti: (clips: Clip[]) => void;
  pasteClipMulti: (preferredBackgroundLane?: number) => void;
  pasteTextClipMulti: (preferredTextLane?: number) => void;
  pasteOverlayClipMulti: (preferredOverlayLane?: number) => void;
  pasteAudioClipMulti: (preferredAudioLane?: number) => void;
  pasteVoiceoverClipMulti: (preferredVoiceoverLane?: number) => void;
  removeClips: (ids: string[]) => void;
  duplicateBackgroundClips: (sources: Clip[]) => void;
  getSelectedBackgroundClipIds: () => string[];
  getSelectedTextClipIds: () => string[];
  getSelectedOverlayClipIds: () => string[];
  getSelectedAudioClipIds: () => string[];
  getSelectedVoiceoverClipIds: () => string[];
  copySelectedBackgroundClips: () => void;
  copySelectedTextClips: () => void;
  copySelectedOverlayClips: () => void;
  copySelectedAudioClips: () => void;
  copySelectedVoiceoverClips: () => void;
  pasteBackgroundClipboard: (preferredBackgroundLane?: number) => void;
  pasteTextClipboard: (preferredTextLane?: number) => void;
  pasteOverlayClipboard: (preferredOverlayLane?: number) => void;
  pasteAudioClipboard: (preferredAudioLane?: number) => void;
  pasteVoiceoverClipboard: (preferredVoiceoverLane?: number) => void;
  duplicateTextClips: (sources: Clip[]) => void;
  duplicateOverlayClips: (sources: Clip[]) => void;
  duplicateAudioClips: (sources: Clip[]) => void;
  duplicateVoiceoverClips: (sources: Clip[]) => void;
  splitClip: (id: string, splitTime: number) => void;
  addTextClip: (startTime?: number, endTime?: number) => void;
  addOverlayStickerClip: (startTime?: number, endTime?: number) => void;
  toggleTrackHidden: (t: TrackType) => void;
  toggleTrackLocked: (t: TrackType) => void;
  toggleLaneHidden: (key: string) => void;
  toggleLaneLocked: (key: string) => void;
  toggleLaneMuted: (key: string) => void;
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

function normalizeTextTrack(clips: Clip[]): Clip[] {
  return compactTextLaneIndices(migrateTextLanes(clips));
}

function normalizeOverlayTrack(clips: Clip[]): Clip[] {
  return compactOverlayLaneIndices(migrateOverlayLanes(clips));
}

function normalizeAudioTrack(clips: Clip[]): Clip[] {
  return compactAudioLaneIndices(migrateAudioLanes(clips));
}

function normalizeVoiceoverTrack(clips: Clip[]): Clip[] {
  return compactVoiceoverLaneIndices(migrateVoiceoverLanes(clips));
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
  playbackDriver: 'raf',
  v1GlCoverReady: false,
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
  clipboardMulti: null,
  trackHidden: { overlay: false, text: false, background: false, audio: false, voiceover: false },
  trackLocked: { overlay: false, text: false, background: false, audio: false, voiceover: false },
  laneHidden: {},
  laneLocked: {},
  laneMuted: {},
  editorRequestedPanelTab: null,
  transitionEditorFocusPair: null,
  selectedTransitionJunction: null,
  editorRequestExpandRightPanel: false,
  selectedClipIds: [],
  selectedClipTrackType: null,

  setComposition: (c) => {
    const normalized = normalizeCompositionTracks(c);
    const migratedBg = migrateBackgroundLanes(normalized.tracks.background);
    const background = applyPrimaryLaneBackground(migratedBg, packLane0Clips);
    const text = normalizeTextTrack(normalized.tracks.text);
    const overlay = normalizeOverlayTrack(normalized.tracks.overlay);
    const audio = normalizeAudioTrack(normalized.tracks.audio);
    const voiceover = normalizeVoiceoverTrack(normalized.tracks.voiceover);
    set({
      composition: {
        ...normalized,
        tracks: { ...normalized.tracks, background, text, overlay, audio, voiceover },
      },
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
    let trackClips: Clip[];
    if (trackKey === 'audio') {
      const withLane: Clip = {
        ...clip,
        audioLane: clip.audioLane ?? PRIMARY_AUDIO_LANE,
      };
      trackClips = normalizeAudioTrack([...composition.tracks.audio, withLane]);
    } else if (trackKey === 'voiceover') {
      const withLane: Clip = {
        ...clip,
        voiceoverLane: clip.voiceoverLane ?? PRIMARY_VOICEOVER_LANE,
      };
      trackClips = normalizeVoiceoverTrack([...composition.tracks.voiceover, withLane]);
    } else {
      trackClips = [...composition.tracks[trackKey], clip];
    }
    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        [trackKey]: trackClips,
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
    } else if (trackKey === 'text') {
      const txt = normalizeTextTrack(composition.tracks.text);
      const textClip: Clip = {
        ...newClip,
        textLane: PRIMARY_TEXT_LANE,
      };
      trackClips = normalizeTextTrack([...txt, textClip]);
    } else if (trackKey === 'overlay') {
      const ov = normalizeOverlayTrack(composition.tracks.overlay);
      const overlayClip: Clip = {
        ...newClip,
        overlayLane: PRIMARY_OVERLAY_LANE,
      };
      trackClips = normalizeOverlayTrack([...ov, overlayClip]);
    } else if (trackKey === 'audio') {
      const aud = normalizeAudioTrack(composition.tracks.audio);
      const audioClip: Clip = {
        ...newClip,
        audioLane: PRIMARY_AUDIO_LANE,
      };
      trackClips = normalizeAudioTrack([...aud, audioClip]);
    } else if (trackKey === 'voiceover') {
      const vo = normalizeVoiceoverTrack(composition.tracks.voiceover);
      const voiceoverClip: Clip = {
        ...newClip,
        voiceoverLane: PRIMARY_VOICEOVER_LANE,
      };
      trackClips = normalizeVoiceoverTrack([...vo, voiceoverClip]);
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
    if (touchesTime && isOnPrimaryBackgroundLane(id, bg)) {
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

    const text = normalizeTextTrack(removeClipFromTrack(composition.tracks.text, id));
    const overlay = normalizeOverlayTrack(
      removeClipFromTrack(composition.tracks.overlay, id)
    );
    const audio = normalizeAudioTrack(
      removeClipFromTrack(composition.tracks.audio, id)
    );
    const voiceover = normalizeVoiceoverTrack(
      removeClipFromTrack(composition.tracks.voiceover, id)
    );

    const updated: Composition = {
      ...composition,
      tracks: {
        background,
        text,
        audio,
        overlay,
        voiceover,
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
    if (clip?.trackType === 'text') {
      get().moveTextClip(id, newStartTime);
      return;
    }
    if (clip?.trackType === 'overlay') {
      get().moveOverlayClip(id, newStartTime);
      return;
    }
    if (clip?.trackType === 'audio') {
      get().moveAudioClip(id, newStartTime);
      return;
    }
    if (clip?.trackType === 'voiceover') {
      get().moveVoiceoverClip(id, newStartTime);
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

  moveTextClip: (id, newStartTime, targetTextLane) => {
    const { composition } = get();
    if (!composition) return;
    const text = normalizeTextTrack(composition.tracks.text);
    const clip = text.find((c) => c.id === id);
    if (!clip) return;

    const duration = Math.max(0.1, clip.endTime - clip.startTime);
    const clampedStart = Math.max(0, newStartTime);
    const clampedEnd = clampedStart + duration;
    const oldLane = getClipTextLane(clip);
    const newLane = targetTextLane !== undefined ? targetTextLane : oldLane;

    const resolvedLane = resolveTextOverlayLaneForDrop(
      text,
      clampedStart,
      clampedEnd,
      Math.max(PRIMARY_TEXT_LANE, newLane),
      id
    );

    const updatedClip: Clip = {
      ...clip,
      startTime: clampedStart,
      endTime: clampedEnd,
      textLane: resolvedLane,
    };

    const lanePeers = text.filter(
      (c) => c.id !== id && getClipTextLane(c) === resolvedLane
    );
    const shiftPreview = previewOverlayShiftLayout(lanePeers, clampedStart, duration);

    let textTrack: Clip[];
    if (shiftPreview.shiftsNeighbors) {
      const shiftedIds = new Set(shiftPreview.layoutClips.map((c) => c.id));
      textTrack = text
        .filter((c) => c.id !== id)
        .map((c) => {
          if (shiftedIds.has(c.id)) {
            return shiftPreview.layoutClips.find((s) => s.id === c.id) ?? c;
          }
          return c;
        });
      textTrack = [...textTrack, updatedClip];
    } else {
      textTrack = text.some((c) => c.id === id)
        ? text.map((c) => (c.id === id ? updatedClip : c))
        : [...text, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, text: normalizeTextTrack(textTrack) },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: id });
  },

  commitTextDragPreview: (preview) => {
    const { composition } = get();
    if (!composition) return;
    const text = normalizeTextTrack(composition.tracks.text);
    const clip = text.find((c) => c.id === preview.clipId);
    if (!clip) return;

    const startTime = preview.displayTraceStart;
    const endTime = preview.displayTraceEnd;
    const targetLane = preview.targetLane;

    const updatedClip: Clip = {
      ...clip,
      startTime,
      endTime,
      textLane: targetLane,
    };

    const withoutDragged = text.filter((c) => c.id !== preview.clipId);

    let textTrack: Clip[];

    if (preview.laneRippleLayout) {
      const shiftedById = new Map(
        preview.laneRippleLayout.map((c) => [c.id, c] as const)
      );
      textTrack = withoutDragged.map((c) => {
        if (getClipTextLane(c) !== targetLane) return c;
        return shiftedById.get(c.id) ?? c;
      });
      textTrack.push(updatedClip);
    } else {
      textTrack = [...withoutDragged, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, text: normalizeTextTrack(textTrack) },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: preview.clipId });
  },

  moveOverlayClip: (id, newStartTime, targetOverlayLane) => {
    const { composition } = get();
    if (!composition) return;
    const overlay = normalizeOverlayTrack(composition.tracks.overlay);
    const clip = overlay.find((c) => c.id === id);
    if (!clip) return;

    const duration = Math.max(0.1, clip.endTime - clip.startTime);
    const clampedStart = Math.max(0, newStartTime);
    const clampedEnd = clampedStart + duration;
    const oldLane = getClipOverlayLane(clip);
    const newLane = targetOverlayLane !== undefined ? targetOverlayLane : oldLane;

    const resolvedLane = resolveOverlayTrackLaneForDrop(
      overlay,
      clampedStart,
      clampedEnd,
      Math.max(PRIMARY_OVERLAY_LANE, newLane),
      id
    );

    const updatedClip: Clip = {
      ...clip,
      startTime: clampedStart,
      endTime: clampedEnd,
      overlayLane: resolvedLane,
    };

    const lanePeers = overlay.filter(
      (c) => c.id !== id && getClipOverlayLane(c) === resolvedLane
    );
    const shiftPreview = previewOverlayShiftLayout(lanePeers, clampedStart, duration);

    let overlayTrack: Clip[];
    if (shiftPreview.shiftsNeighbors) {
      const shiftedIds = new Set(shiftPreview.layoutClips.map((c) => c.id));
      overlayTrack = overlay
        .filter((c) => c.id !== id)
        .map((c) => {
          if (shiftedIds.has(c.id)) {
            return shiftPreview.layoutClips.find((s) => s.id === c.id) ?? c;
          }
          return c;
        });
      overlayTrack = [...overlayTrack, updatedClip];
    } else {
      overlayTrack = overlay.some((c) => c.id === id)
        ? overlay.map((c) => (c.id === id ? updatedClip : c))
        : [...overlay, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, overlay: normalizeOverlayTrack(overlayTrack) },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: id });
  },

  commitOverlayDragPreview: (preview) => {
    const { composition } = get();
    if (!composition) return;
    const overlay = normalizeOverlayTrack(composition.tracks.overlay);
    const clip = overlay.find((c) => c.id === preview.clipId);
    if (!clip) return;

    const updatedClip: Clip = {
      ...clip,
      startTime: preview.displayTraceStart,
      endTime: preview.displayTraceEnd,
      overlayLane: preview.targetLane,
    };

    const withoutDragged = overlay.filter((c) => c.id !== preview.clipId);

    let overlayTrack: Clip[];
    if (preview.laneRippleLayout) {
      const shiftedById = new Map(
        preview.laneRippleLayout.map((c) => [c.id, c] as const)
      );
      overlayTrack = withoutDragged.map((c) => {
        if (getClipOverlayLane(c) !== preview.targetLane) return c;
        return shiftedById.get(c.id) ?? c;
      });
      overlayTrack.push(updatedClip);
    } else {
      overlayTrack = [...withoutDragged, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, overlay: normalizeOverlayTrack(overlayTrack) },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: preview.clipId });
  },

  moveAudioClip: (id, newStartTime, targetAudioLane) => {
    const { composition } = get();
    if (!composition) return;
    const audio = normalizeAudioTrack(composition.tracks.audio);
    const clip = audio.find((c) => c.id === id);
    if (!clip) return;

    const duration = Math.max(0.1, clip.endTime - clip.startTime);
    const clampedStart = Math.max(0, newStartTime);
    const clampedEnd = clampedStart + duration;
    const oldLane = getClipAudioLane(clip);
    const newLane = targetAudioLane !== undefined ? targetAudioLane : oldLane;

    const resolvedLane = resolveAudioTrackLaneForDrop(
      audio,
      clampedStart,
      clampedEnd,
      Math.max(PRIMARY_AUDIO_LANE, newLane),
      id
    );

    const updatedClip: Clip = {
      ...clip,
      startTime: clampedStart,
      endTime: clampedEnd,
      audioLane: resolvedLane,
    };

    const lanePeers = audio.filter(
      (c) => c.id !== id && getClipAudioLane(c) === resolvedLane
    );
    const shiftPreview = previewOverlayShiftLayout(lanePeers, clampedStart, duration);

    let audioTrack: Clip[];
    if (shiftPreview.shiftsNeighbors) {
      const shiftedIds = new Set(shiftPreview.layoutClips.map((c) => c.id));
      audioTrack = audio
        .filter((c) => c.id !== id)
        .map((c) => {
          if (shiftedIds.has(c.id)) {
            return shiftPreview.layoutClips.find((s) => s.id === c.id) ?? c;
          }
          return c;
        });
      audioTrack = [...audioTrack, updatedClip];
    } else {
      audioTrack = audio.some((c) => c.id === id)
        ? audio.map((c) => (c.id === id ? updatedClip : c))
        : [...audio, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, audio: normalizeAudioTrack(audioTrack) },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: id });
  },

  commitAudioDragPreview: (preview) => {
    const { composition } = get();
    if (!composition) return;
    const audio = normalizeAudioTrack(composition.tracks.audio);
    const clip = audio.find((c) => c.id === preview.clipId);
    if (!clip) return;

    const updatedClip: Clip = {
      ...clip,
      startTime: preview.displayTraceStart,
      endTime: preview.displayTraceEnd,
      audioLane: preview.targetLane,
    };

    const withoutDragged = audio.filter((c) => c.id !== preview.clipId);

    let audioTrack: Clip[];
    if (preview.laneRippleLayout) {
      const shiftedById = new Map(
        preview.laneRippleLayout.map((c) => [c.id, c] as const)
      );
      audioTrack = withoutDragged.map((c) => {
        if (getClipAudioLane(c) !== preview.targetLane) return c;
        return shiftedById.get(c.id) ?? c;
      });
      audioTrack.push(updatedClip);
    } else {
      audioTrack = [...withoutDragged, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: { ...composition.tracks, audio: normalizeAudioTrack(audioTrack) },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: preview.clipId });
  },

  moveVoiceoverClip: (id, newStartTime, targetVoiceoverLane) => {
    const { composition } = get();
    if (!composition) return;
    const voiceover = normalizeVoiceoverTrack(composition.tracks.voiceover);
    const clip = voiceover.find((c) => c.id === id);
    if (!clip) return;

    const duration = Math.max(0.1, clip.endTime - clip.startTime);
    const clampedStart = Math.max(0, newStartTime);
    const clampedEnd = clampedStart + duration;
    const oldLane = getClipVoiceoverLane(clip);
    const newLane = targetVoiceoverLane !== undefined ? targetVoiceoverLane : oldLane;

    const resolvedLane = resolveVoiceoverTrackLaneForDrop(
      voiceover,
      clampedStart,
      clampedEnd,
      Math.max(PRIMARY_VOICEOVER_LANE, newLane),
      id
    );

    const updatedClip: Clip = {
      ...clip,
      startTime: clampedStart,
      endTime: clampedEnd,
      voiceoverLane: resolvedLane,
    };

    const lanePeers = voiceover.filter(
      (c) => c.id !== id && getClipVoiceoverLane(c) === resolvedLane
    );
    const shiftPreview = previewOverlayShiftLayout(lanePeers, clampedStart, duration);

    let voiceoverTrack: Clip[];
    if (shiftPreview.shiftsNeighbors) {
      const shiftedIds = new Set(shiftPreview.layoutClips.map((c) => c.id));
      voiceoverTrack = voiceover
        .filter((c) => c.id !== id)
        .map((c) => {
          if (shiftedIds.has(c.id)) {
            return shiftPreview.layoutClips.find((s) => s.id === c.id) ?? c;
          }
          return c;
        });
      voiceoverTrack = [...voiceoverTrack, updatedClip];
    } else {
      voiceoverTrack = voiceover.some((c) => c.id === id)
        ? voiceover.map((c) => (c.id === id ? updatedClip : c))
        : [...voiceover, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        voiceover: normalizeVoiceoverTrack(voiceoverTrack),
      },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: id });
  },

  commitVoiceoverDragPreview: (preview) => {
    const { composition } = get();
    if (!composition) return;
    const voiceover = normalizeVoiceoverTrack(composition.tracks.voiceover);
    const clip = voiceover.find((c) => c.id === preview.clipId);
    if (!clip) return;

    const updatedClip: Clip = {
      ...clip,
      startTime: preview.displayTraceStart,
      endTime: preview.displayTraceEnd,
      voiceoverLane: preview.targetLane,
    };

    const withoutDragged = voiceover.filter((c) => c.id !== preview.clipId);

    let voiceoverTrack: Clip[];
    if (preview.laneRippleLayout) {
      const shiftedById = new Map(
        preview.laneRippleLayout.map((c) => [c.id, c] as const)
      );
      voiceoverTrack = withoutDragged.map((c) => {
        if (getClipVoiceoverLane(c) !== preview.targetLane) return c;
        return shiftedById.get(c.id) ?? c;
      });
      voiceoverTrack.push(updatedClip);
    } else {
      voiceoverTrack = [...withoutDragged, updatedClip];
    }

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        voiceover: normalizeVoiceoverTrack(voiceoverTrack),
      },
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

    if (clip.trackType === 'background') {
      let bg = migrateBackgroundLanes(composition.tracks.background);
      const lane = getClipBackgroundLane(clip);
      const laneClips = bg.filter((c) => getClipBackgroundLane(c) === lane);
      const resizedLane = rippleResizeBackgroundLane(
        laneClips,
        id,
        safeStart,
        safeEnd
      );
      const resizedById = new Map(resizedLane.map((c) => [c.id, c] as const));
      let background = bg.map((c) => {
        if (getClipBackgroundLane(c) !== lane) return c;
        return resizedById.get(c.id) ?? c;
      });

      if (lane === PRIMARY_BACKGROUND_LANE) {
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
      set({ composition: updated });
      return;
    }

    if (clip.trackType === 'text') {
      const text = normalizeTextTrack(composition.tracks.text);
      const lane = getClipTextLane(clip);
      const laneClips = text.filter((c) => getClipTextLane(c) === lane);
      const resizedLane = rippleResizeTextLane(laneClips, id, safeStart, safeEnd);
      const resizedById = new Map(resizedLane.map((c) => [c.id, c] as const));
      const textTrack = text.map((c) => {
        if (getClipTextLane(c) !== lane) return c;
        return resizedById.get(c.id) ?? c;
      });

      const updated: Composition = {
        ...composition,
        tracks: { ...composition.tracks, text: textTrack },
      };
      updated.duration = recalcDuration(updated);
      set({ composition: updated });
      return;
    }

    if (clip.trackType === 'overlay') {
      const overlay = normalizeOverlayTrack(composition.tracks.overlay);
      const lane = getClipOverlayLane(clip);
      const laneClips = overlay.filter((c) => getClipOverlayLane(c) === lane);
      const resizedLane = rippleResizeTextLane(laneClips, id, safeStart, safeEnd);
      const resizedById = new Map(resizedLane.map((c) => [c.id, c] as const));
      const overlayTrack = overlay.map((c) => {
        if (getClipOverlayLane(c) !== lane) return c;
        return resizedById.get(c.id) ?? c;
      });

      const updated: Composition = {
        ...composition,
        tracks: { ...composition.tracks, overlay: overlayTrack },
      };
      updated.duration = recalcDuration(updated);
      set({ composition: updated });
      return;
    }

    if (clip.trackType === 'audio') {
      const audio = normalizeAudioTrack(composition.tracks.audio);
      const lane = getClipAudioLane(clip);
      const laneClips = audio.filter((c) => getClipAudioLane(c) === lane);
      const resizedLane = rippleResizeTextLane(laneClips, id, safeStart, safeEnd);
      const resizedById = new Map(resizedLane.map((c) => [c.id, c] as const));
      const audioTrack = audio.map((c) => {
        if (getClipAudioLane(c) !== lane) return c;
        return resizedById.get(c.id) ?? c;
      });

      const updated: Composition = {
        ...composition,
        tracks: { ...composition.tracks, audio: audioTrack },
      };
      updated.duration = recalcDuration(updated);
      set({ composition: updated });
      return;
    }

    if (clip.trackType === 'voiceover') {
      const voiceover = normalizeVoiceoverTrack(composition.tracks.voiceover);
      const lane = getClipVoiceoverLane(clip);
      const laneClips = voiceover.filter((c) => getClipVoiceoverLane(c) === lane);
      const resizedLane = rippleResizeTextLane(laneClips, id, safeStart, safeEnd);
      const resizedById = new Map(resizedLane.map((c) => [c.id, c] as const));
      const voiceoverTrack = voiceover.map((c) => {
        if (getClipVoiceoverLane(c) !== lane) return c;
        return resizedById.get(c.id) ?? c;
      });

      const updated: Composition = {
        ...composition,
        tracks: { ...composition.tracks, voiceover: voiceoverTrack },
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
  setPlaybackDriver: (d) => set({ playbackDriver: d }),
  setV1GlCoverReady: (v) => set({ v1GlCoverReady: v }),
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
  toggleBackgroundClipSelection: (id) => {
    const { selectedClipIds, selectedClipTrackType } = get();
    const base =
      selectedClipTrackType === 'background' ? selectedClipIds : [];
    if (base.includes(id)) {
      const next = base.filter((x) => x !== id);
      set({
        selectedClipIds: next,
        selectedClipTrackType: next.length > 0 ? 'background' : null,
        ...(next.length === 0 ? { selectedClipId: null } : {}),
      });
    } else {
      set({
        selectedClipIds: [...base, id],
        selectedClipTrackType: 'background',
        selectedClipId: id,
      });
    }
  },
  toggleTextClipSelection: (id) => {
    const { selectedClipIds, selectedClipTrackType } = get();
    const base = selectedClipTrackType === 'text' ? selectedClipIds : [];
    if (base.includes(id)) {
      const next = base.filter((x) => x !== id);
      set({
        selectedClipIds: next,
        selectedClipTrackType: next.length > 0 ? 'text' : null,
        ...(next.length === 0 ? { selectedClipId: null } : {}),
      });
    } else {
      set({
        selectedClipIds: [...base, id],
        selectedClipTrackType: 'text',
        selectedClipId: id,
      });
    }
  },
  setBackgroundClipSelection: (ids) =>
    set({
      selectedClipIds: ids,
      selectedClipId: ids[0] ?? null,
      selectedClipTrackType: ids.length > 0 ? 'background' : null,
    }),
  setTextClipSelection: (ids) =>
    set({
      selectedClipIds: ids,
      selectedClipId: ids[0] ?? null,
      selectedClipTrackType: ids.length > 0 ? 'text' : null,
    }),
  clearBackgroundClipSelection: () => {
    const { selectedClipTrackType } = get();
    if (selectedClipTrackType !== 'background') return;
    set({ selectedClipIds: [], selectedClipTrackType: null, selectedClipId: null });
  },
  clearTextClipSelection: () => {
    const { selectedClipTrackType } = get();
    if (selectedClipTrackType !== 'text') return;
    set({ selectedClipIds: [], selectedClipTrackType: null, selectedClipId: null });
  },
  clearOverlayClipSelection: () => {
    const { selectedClipTrackType } = get();
    if (selectedClipTrackType !== 'overlay') return;
    set({ selectedClipIds: [], selectedClipTrackType: null, selectedClipId: null });
  },
  clearAudioClipSelection: () => {
    const { selectedClipTrackType } = get();
    if (selectedClipTrackType !== 'audio') return;
    set({ selectedClipIds: [], selectedClipTrackType: null, selectedClipId: null });
  },
  toggleOverlayClipSelection: (id) => {
    const { selectedClipIds, selectedClipTrackType } = get();
    const base = selectedClipTrackType === 'overlay' ? selectedClipIds : [];
    if (base.includes(id)) {
      const next = base.filter((x) => x !== id);
      set({
        selectedClipIds: next,
        selectedClipTrackType: next.length > 0 ? 'overlay' : null,
        ...(next.length === 0 ? { selectedClipId: null } : {}),
      });
    } else {
      set({
        selectedClipIds: [...base, id],
        selectedClipTrackType: 'overlay',
        selectedClipId: id,
      });
    }
  },
  setOverlayClipSelection: (ids) =>
    set({
      selectedClipIds: ids,
      selectedClipId: ids[0] ?? null,
      selectedClipTrackType: ids.length > 0 ? 'overlay' : null,
    }),
  toggleAudioClipSelection: (id) => {
    const { selectedClipIds, selectedClipTrackType } = get();
    const base = selectedClipTrackType === 'audio' ? selectedClipIds : [];
    if (base.includes(id)) {
      const next = base.filter((x) => x !== id);
      set({
        selectedClipIds: next,
        selectedClipTrackType: next.length > 0 ? 'audio' : null,
        ...(next.length === 0 ? { selectedClipId: null } : {}),
      });
    } else {
      set({
        selectedClipIds: [...base, id],
        selectedClipTrackType: 'audio',
        selectedClipId: id,
      });
    }
  },
  setAudioClipSelection: (ids) =>
    set({
      selectedClipIds: ids,
      selectedClipId: ids[0] ?? null,
      selectedClipTrackType: ids.length > 0 ? 'audio' : null,
    }),
  clearVoiceoverClipSelection: () => {
    const { selectedClipTrackType } = get();
    if (selectedClipTrackType !== 'voiceover') return;
    set({ selectedClipIds: [], selectedClipTrackType: null, selectedClipId: null });
  },
  toggleVoiceoverClipSelection: (id) => {
    const { selectedClipIds, selectedClipTrackType } = get();
    const base = selectedClipTrackType === 'voiceover' ? selectedClipIds : [];
    if (base.includes(id)) {
      const next = base.filter((x) => x !== id);
      set({
        selectedClipIds: next,
        selectedClipTrackType: next.length > 0 ? 'voiceover' : null,
        ...(next.length === 0 ? { selectedClipId: null } : {}),
      });
    } else {
      set({
        selectedClipIds: [...base, id],
        selectedClipTrackType: 'voiceover',
        selectedClipId: id,
      });
    }
  },
  setVoiceoverClipSelection: (ids) =>
    set({
      selectedClipIds: ids,
      selectedClipId: ids[0] ?? null,
      selectedClipTrackType: ids.length > 0 ? 'voiceover' : null,
    }),
  clearLaneClipSelection: () => {
    const { selectedClipIds } = get();
    if (selectedClipIds.length === 0) return;
    set({ selectedClipIds: [], selectedClipTrackType: null, selectedClipId: null });
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
  setClipboard: (clip) => {
    if (
      clip != null &&
      clip.trackType !== 'background' &&
      clip.trackType !== 'text' &&
      clip.trackType !== 'overlay' &&
      clip.trackType !== 'audio' &&
      clip.trackType !== 'voiceover'
    ) {
      return;
    }
    set({ clipboard: clip ? { ...clip } : null, clipboardMulti: null });
  },

  getSelectedBackgroundClipIds: () => {
    const { selectedClipId, selectedClipIds, selectedClipTrackType, composition } =
      get();
    if (selectedClipTrackType === 'background' && selectedClipIds.length > 0) {
      return [...selectedClipIds];
    }
    if (!selectedClipId || !composition) return [];
    const isBg = composition.tracks.background.some((c) => c.id === selectedClipId);
    return isBg ? [selectedClipId] : [];
  },

  getSelectedTextClipIds: () => {
    const { selectedClipId, selectedClipIds, selectedClipTrackType, composition } =
      get();
    if (selectedClipTrackType === 'text' && selectedClipIds.length > 0) {
      return [...selectedClipIds];
    }
    if (!selectedClipId || !composition) return [];
    const isText = composition.tracks.text.some((c) => c.id === selectedClipId);
    return isText ? [selectedClipId] : [];
  },

  getSelectedOverlayClipIds: () => {
    const { selectedClipId, selectedClipIds, selectedClipTrackType, composition } =
      get();
    if (selectedClipTrackType === 'overlay' && selectedClipIds.length > 0) {
      return [...selectedClipIds];
    }
    if (!selectedClipId || !composition) return [];
    const isOv = composition.tracks.overlay.some((c) => c.id === selectedClipId);
    return isOv ? [selectedClipId] : [];
  },

  getSelectedAudioClipIds: () => {
    const { selectedClipId, selectedClipIds, selectedClipTrackType, composition } =
      get();
    if (selectedClipTrackType === 'audio' && selectedClipIds.length > 0) {
      return [...selectedClipIds];
    }
    if (!selectedClipId || !composition) return [];
    const isAud = composition.tracks.audio.some((c) => c.id === selectedClipId);
    return isAud ? [selectedClipId] : [];
  },

  getSelectedVoiceoverClipIds: () => {
    const { selectedClipId, selectedClipIds, selectedClipTrackType, composition } =
      get();
    if (selectedClipTrackType === 'voiceover' && selectedClipIds.length > 0) {
      return [...selectedClipIds];
    }
    if (!selectedClipId || !composition) return [];
    const isVo = composition.tracks.voiceover.some((c) => c.id === selectedClipId);
    return isVo ? [selectedClipId] : [];
  },

  copySelectedBackgroundClips: () => {
    const ids = get().getSelectedBackgroundClipIds();
    if (ids.length === 0) return;
    const bg = get().composition?.tracks.background ?? [];
    const idSet = new Set(ids);
    const clips = bg.filter((c) => idSet.has(c.id));
    if (clips.length === 0) return;
    if (clips.length === 1) {
      set({ clipboard: { ...clips[0] }, clipboardMulti: null });
    } else {
      set({ clipboardMulti: clips.map((c) => ({ ...c })), clipboard: null });
    }
  },

  copySelectedTextClips: () => {
    const ids = get().getSelectedTextClipIds();
    if (ids.length === 0) return;
    const text = get().composition?.tracks.text ?? [];
    const idSet = new Set(ids);
    const clips = text.filter((c) => idSet.has(c.id));
    if (clips.length === 0) return;
    if (clips.length === 1) {
      set({ clipboard: { ...clips[0] }, clipboardMulti: null });
    } else {
      set({ clipboardMulti: clips.map((c) => ({ ...c })), clipboard: null });
    }
  },

  copySelectedOverlayClips: () => {
    const ids = get().getSelectedOverlayClipIds();
    if (ids.length === 0) return;
    const overlay = get().composition?.tracks.overlay ?? [];
    const idSet = new Set(ids);
    const clips = overlay.filter((c) => idSet.has(c.id));
    if (clips.length === 0) return;
    if (clips.length === 1) {
      set({ clipboard: { ...clips[0] }, clipboardMulti: null });
    } else {
      set({ clipboardMulti: clips.map((c) => ({ ...c })), clipboard: null });
    }
  },

  copySelectedAudioClips: () => {
    const ids = get().getSelectedAudioClipIds();
    if (ids.length === 0) return;
    const audio = get().composition?.tracks.audio ?? [];
    const idSet = new Set(ids);
    const clips = audio.filter((c) => idSet.has(c.id));
    if (clips.length === 0) return;
    if (clips.length === 1) {
      set({ clipboard: { ...clips[0] }, clipboardMulti: null });
    } else {
      set({ clipboardMulti: clips.map((c) => ({ ...c })), clipboard: null });
    }
  },

  copySelectedVoiceoverClips: () => {
    const ids = get().getSelectedVoiceoverClipIds();
    if (ids.length === 0) return;
    const voiceover = get().composition?.tracks.voiceover ?? [];
    const idSet = new Set(ids);
    const clips = voiceover.filter((c) => idSet.has(c.id));
    if (clips.length === 0) return;
    if (clips.length === 1) {
      set({ clipboard: { ...clips[0] }, clipboardMulti: null });
    } else {
      set({ clipboardMulti: clips.map((c) => ({ ...c })), clipboard: null });
    }
  },

  pasteBackgroundClipboard: (preferredBackgroundLane = PRIMARY_BACKGROUND_LANE) => {
    const { clipboardMulti, clipboard } = get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      if (clipboardMulti[0]?.trackType !== 'background') return;
      get().pasteClipMulti(preferredBackgroundLane);
    } else if (isBackgroundClipboardClip(clipboard)) {
      get().pasteClip(preferredBackgroundLane);
    }
  },

  pasteTextClipboard: (preferredTextLane = PRIMARY_TEXT_LANE) => {
    const { clipboardMulti, clipboard } = get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      if (clipboardMulti[0]?.trackType !== 'text') return;
      get().pasteTextClipMulti(preferredTextLane);
    } else if (isTextClipboardClip(clipboard)) {
      get().pasteTextClip(preferredTextLane);
    }
  },

  pasteOverlayClipboard: (preferredOverlayLane = PRIMARY_OVERLAY_LANE) => {
    const { clipboardMulti, clipboard } = get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      if (clipboardMulti[0]?.trackType !== 'overlay') return;
      get().pasteOverlayClipMulti(preferredOverlayLane);
    } else if (isOverlayClipboardClip(clipboard)) {
      get().pasteOverlayClip(preferredOverlayLane);
    }
  },

  pasteAudioClipboard: (preferredAudioLane = PRIMARY_AUDIO_LANE) => {
    const { clipboardMulti, clipboard } = get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      if (clipboardMulti[0]?.trackType !== 'audio') return;
      get().pasteAudioClipMulti(preferredAudioLane);
    } else if (isAudioClipboardClip(clipboard)) {
      get().pasteAudioClip(preferredAudioLane);
    }
  },

  pasteVoiceoverClipboard: (preferredVoiceoverLane = PRIMARY_VOICEOVER_LANE) => {
    const { clipboardMulti, clipboard } = get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      if (clipboardMulti[0]?.trackType !== 'voiceover') return;
      get().pasteVoiceoverClipMulti(preferredVoiceoverLane);
    } else if (isVoiceoverClipboardClip(clipboard)) {
      get().pasteVoiceoverClip(preferredVoiceoverLane);
    }
  },

  pasteClip: (preferredBackgroundLane = PRIMARY_BACKGROUND_LANE) => {
    const { clipboardMulti, clipboard, currentTime, composition, saveToHistory } = get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      get().pasteClipMulti(preferredBackgroundLane);
      return;
    }
    if (!composition || !clipboard || !isBackgroundClipboardClip(clipboard)) return;
    saveToHistory();

    const bg = migrateBackgroundLanes(composition.tracks.background);
    const newClips = buildPastedBackgroundClips(
      [clipboard],
      bg,
      currentTime,
      preferredBackgroundLane
    );
    if (newClips.length === 0) return;
    const newClip = newClips[0];

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        background: [...bg, newClip],
      },
    };
    updated.duration = recalcDuration(updated);
    set({ composition: updated, selectedClipId: newClip.id });
  },

  setClipboardMulti: (clips) => {
    const bgClips = clips.filter((c) => c.trackType === 'background');
    if (bgClips.length === 0) return;
    set({ clipboardMulti: bgClips.map((c) => ({ ...c })), clipboard: null });
  },

  pasteClipMulti: (preferredBackgroundLane = PRIMARY_BACKGROUND_LANE) => {
    const { clipboardMulti, currentTime, composition, saveToHistory } = get();
    if (!clipboardMulti || clipboardMulti.length === 0 || !composition) return;
    saveToHistory();

    const bg = migrateBackgroundLanes(composition.tracks.background);
    const newClips = buildPastedBackgroundClips(
      clipboardMulti,
      bg,
      currentTime,
      preferredBackgroundLane
    );

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        background: [...bg, ...newClips],
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);
    set({
      composition: updated,
      selectedClipIds: newIds,
      selectedClipId: newIds[0] ?? null,
      selectedClipTrackType: newIds.length > 0 ? 'background' : null,
    });
  },

  pasteTextClip: (preferredTextLane = PRIMARY_TEXT_LANE) => {
    const { clipboardMulti, clipboard, currentTime, composition, saveToHistory } =
      get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      get().pasteTextClipMulti(preferredTextLane);
      return;
    }
    if (!composition || !clipboard || !isTextClipboardClip(clipboard)) return;
    saveToHistory();

    const text = normalizeTextTrack(composition.tracks.text);
    const newClips = buildPastedTextClips(
      [clipboard],
      text,
      currentTime,
      preferredTextLane
    );
    if (newClips.length === 0) return;
    const newClip = newClips[0];

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        text: normalizeTextTrack([...text, newClip]),
      },
    };
    updated.duration = recalcDuration(updated);
    set({
      composition: updated,
      selectedClipId: newClip.id,
      selectedClipIds: [],
      selectedClipTrackType: null,
    });
  },

  pasteTextClipMulti: (preferredTextLane = PRIMARY_TEXT_LANE) => {
    const { clipboardMulti, currentTime, composition, saveToHistory } = get();
    if (!clipboardMulti || clipboardMulti.length === 0 || !composition) return;
    if (clipboardMulti[0]?.trackType !== 'text') return;
    saveToHistory();

    const text = normalizeTextTrack(composition.tracks.text);
    const newClips = buildPastedTextClips(
      clipboardMulti,
      text,
      currentTime,
      preferredTextLane
    );

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        text: normalizeTextTrack([...text, ...newClips]),
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);
    set({
      composition: updated,
      selectedClipIds: newIds,
      selectedClipId: newIds[0] ?? null,
      selectedClipTrackType: newIds.length > 0 ? 'text' : null,
    });
  },

  pasteOverlayClip: (preferredOverlayLane = PRIMARY_OVERLAY_LANE) => {
    const { clipboardMulti, clipboard, currentTime, composition, saveToHistory } =
      get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      get().pasteOverlayClipMulti(preferredOverlayLane);
      return;
    }
    if (!composition || !clipboard || !isOverlayClipboardClip(clipboard)) return;
    saveToHistory();

    const overlay = normalizeOverlayTrack(composition.tracks.overlay);
    const newClips = buildPastedOverlayClips(
      [clipboard],
      overlay,
      currentTime,
      preferredOverlayLane
    );
    if (newClips.length === 0) return;
    const newClip = newClips[0];

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        overlay: normalizeOverlayTrack([...overlay, newClip]),
      },
    };
    updated.duration = recalcDuration(updated);
    set({
      composition: updated,
      selectedClipId: newClip.id,
      selectedClipIds: [],
      selectedClipTrackType: null,
    });
  },

  pasteOverlayClipMulti: (preferredOverlayLane = PRIMARY_OVERLAY_LANE) => {
    const { clipboardMulti, currentTime, composition, saveToHistory } = get();
    if (!clipboardMulti || clipboardMulti.length === 0 || !composition) return;
    if (clipboardMulti[0]?.trackType !== 'overlay') return;
    saveToHistory();

    const overlay = normalizeOverlayTrack(composition.tracks.overlay);
    const newClips = buildPastedOverlayClips(
      clipboardMulti,
      overlay,
      currentTime,
      preferredOverlayLane
    );

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        overlay: normalizeOverlayTrack([...overlay, ...newClips]),
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);
    set({
      composition: updated,
      selectedClipIds: newIds,
      selectedClipId: newIds[0] ?? null,
      selectedClipTrackType: newIds.length > 0 ? 'overlay' : null,
    });
  },

  pasteAudioClip: (preferredAudioLane = PRIMARY_AUDIO_LANE) => {
    const { clipboardMulti, clipboard, currentTime, composition, saveToHistory } =
      get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      get().pasteAudioClipMulti(preferredAudioLane);
      return;
    }
    if (!composition || !clipboard || !isAudioClipboardClip(clipboard)) return;
    saveToHistory();

    const audio = normalizeAudioTrack(composition.tracks.audio);
    const newClips = buildPastedAudioClips(
      [clipboard],
      audio,
      currentTime,
      preferredAudioLane
    );
    if (newClips.length === 0) return;
    const newClip = newClips[0];

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        audio: normalizeAudioTrack([...audio, newClip]),
      },
    };
    updated.duration = recalcDuration(updated);
    set({
      composition: updated,
      selectedClipId: newClip.id,
      selectedClipIds: [],
      selectedClipTrackType: null,
    });
  },

  pasteAudioClipMulti: (preferredAudioLane = PRIMARY_AUDIO_LANE) => {
    const { clipboardMulti, currentTime, composition, saveToHistory } = get();
    if (!clipboardMulti || clipboardMulti.length === 0 || !composition) return;
    if (clipboardMulti[0]?.trackType !== 'audio') return;
    saveToHistory();

    const audio = normalizeAudioTrack(composition.tracks.audio);
    const newClips = buildPastedAudioClips(
      clipboardMulti,
      audio,
      currentTime,
      preferredAudioLane
    );

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        audio: normalizeAudioTrack([...audio, ...newClips]),
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);
    set({
      composition: updated,
      selectedClipIds: newIds,
      selectedClipId: newIds[0] ?? null,
      selectedClipTrackType: newIds.length > 0 ? 'audio' : null,
    });
  },

  pasteVoiceoverClip: (preferredVoiceoverLane = PRIMARY_VOICEOVER_LANE) => {
    const { clipboardMulti, clipboard, currentTime, composition, saveToHistory } =
      get();
    if (clipboardMulti && clipboardMulti.length > 0) {
      get().pasteVoiceoverClipMulti(preferredVoiceoverLane);
      return;
    }
    if (!composition || !clipboard || !isVoiceoverClipboardClip(clipboard)) return;
    saveToHistory();

    const voiceover = normalizeVoiceoverTrack(composition.tracks.voiceover);
    const newClips = buildPastedVoiceoverClips(
      [clipboard],
      voiceover,
      currentTime,
      preferredVoiceoverLane
    );
    if (newClips.length === 0) return;
    const newClip = newClips[0];

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        voiceover: normalizeVoiceoverTrack([...voiceover, newClip]),
      },
    };
    updated.duration = recalcDuration(updated);
    set({
      composition: updated,
      selectedClipId: newClip.id,
      selectedClipIds: [],
      selectedClipTrackType: null,
    });
  },

  pasteVoiceoverClipMulti: (preferredVoiceoverLane = PRIMARY_VOICEOVER_LANE) => {
    const { clipboardMulti, currentTime, composition, saveToHistory } = get();
    if (!clipboardMulti || clipboardMulti.length === 0 || !composition) return;
    if (clipboardMulti[0]?.trackType !== 'voiceover') return;
    saveToHistory();

    const voiceover = normalizeVoiceoverTrack(composition.tracks.voiceover);
    const newClips = buildPastedVoiceoverClips(
      clipboardMulti,
      voiceover,
      currentTime,
      preferredVoiceoverLane
    );

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        voiceover: normalizeVoiceoverTrack([...voiceover, ...newClips]),
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);
    set({
      composition: updated,
      selectedClipIds: newIds,
      selectedClipId: newIds[0] ?? null,
      selectedClipTrackType: newIds.length > 0 ? 'voiceover' : null,
    });
  },

  removeClips: (ids) => {
    const { composition, saveToHistory } = get();
    if (!composition || ids.length === 0) return;
    saveToHistory();
    const idSet = new Set(ids);
    let background = composition.tracks.background.filter((c) => !idSet.has(c.id));
    const text = normalizeTextTrack(
      composition.tracks.text.filter((c) => !idSet.has(c.id))
    );
    const overlay = normalizeOverlayTrack(
      composition.tracks.overlay.filter((c) => !idSet.has(c.id))
    );
    const audio = normalizeAudioTrack(
      composition.tracks.audio.filter((c) => !idSet.has(c.id))
    );
    const voiceover = normalizeVoiceoverTrack(
      composition.tracks.voiceover.filter((c) => !idSet.has(c.id))
    );

    const removedBgPrimary = composition.tracks.background.some(
      (c) => idSet.has(c.id) && isOnPrimaryBackgroundLane(c.id, composition.tracks.background)
    );
    if (removedBgPrimary) {
      background = applyPrimaryLaneBackground(background, packLane0Clips);
    }

    const updated: Composition = {
      ...composition,
      tracks: {
        background,
        text,
        audio,
        overlay,
        voiceover,
      },
    };
    updated.duration = recalcDuration(updated);
    set({
      composition: updated,
      selectedClipIds: [],
      selectedClipId: null,
      selectedClipTrackType: null,
    });
  },

  duplicateBackgroundClips: (sources) => {
    const { composition, saveToHistory } = get();
    const bgSources = sources.filter((c) => c.trackType === 'background');
    if (!composition || bgSources.length === 0) return;
    saveToHistory();

    const minStart = Math.min(...bgSources.map((c) => c.startTime));
    const maxEnd = Math.max(...bgSources.map((c) => c.endTime));
    const shift = maxEnd - minStart;
    const ts = Date.now();

    const newClips: Clip[] = bgSources.map((c, i) => ({
      ...c,
      id: `${c.id}-dup-${ts}-${i}`,
      startTime: c.startTime + shift,
      endTime: c.endTime + shift,
    }));

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        background: [...composition.tracks.background, ...newClips],
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);

    if (newClips.length > 1) {
      set({
        composition: updated,
        selectedClipIds: newIds,
        selectedClipId: newIds[0] ?? null,
        selectedClipTrackType: 'background',
      });
    } else {
      set({
        composition: updated,
        selectedClipId: newIds[0] ?? null,
        selectedClipIds: [],
        selectedClipTrackType: null,
      });
    }
  },

  duplicateTextClips: (sources) => {
    const { composition, saveToHistory } = get();
    const textSources = sources.filter((c) => c.trackType === 'text');
    if (!composition || textSources.length === 0) return;
    saveToHistory();

    const minStart = Math.min(...textSources.map((c) => c.startTime));
    const maxEnd = Math.max(...textSources.map((c) => c.endTime));
    const shift = maxEnd - minStart;
    const ts = Date.now();

    const newClips: Clip[] = textSources.map((c, i) => ({
      ...c,
      id: `${c.id}-dup-${ts}-${i}`,
      startTime: c.startTime + shift,
      endTime: c.endTime + shift,
    }));

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        text: normalizeTextTrack([...composition.tracks.text, ...newClips]),
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);

    if (newClips.length > 1) {
      set({
        composition: updated,
        selectedClipIds: newIds,
        selectedClipId: newIds[0] ?? null,
        selectedClipTrackType: 'text',
      });
    } else {
      set({
        composition: updated,
        selectedClipId: newIds[0] ?? null,
        selectedClipIds: [],
        selectedClipTrackType: null,
      });
    }
  },

  duplicateOverlayClips: (sources) => {
    const { composition, saveToHistory } = get();
    const ovSources = sources.filter((c) => c.trackType === 'overlay');
    if (!composition || ovSources.length === 0) return;
    saveToHistory();

    const minStart = Math.min(...ovSources.map((c) => c.startTime));
    const maxEnd = Math.max(...ovSources.map((c) => c.endTime));
    const shift = maxEnd - minStart;
    const ts = Date.now();

    const newClips: Clip[] = ovSources.map((c, i) => ({
      ...c,
      id: `${c.id}-dup-${ts}-${i}`,
      startTime: c.startTime + shift,
      endTime: c.endTime + shift,
    }));

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        overlay: normalizeOverlayTrack([...composition.tracks.overlay, ...newClips]),
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);

    if (newClips.length > 1) {
      set({
        composition: updated,
        selectedClipIds: newIds,
        selectedClipId: newIds[0] ?? null,
        selectedClipTrackType: 'overlay',
      });
    } else {
      set({
        composition: updated,
        selectedClipId: newIds[0] ?? null,
        selectedClipIds: [],
        selectedClipTrackType: null,
      });
    }
  },

  duplicateAudioClips: (sources) => {
    const { composition, saveToHistory } = get();
    const audSources = sources.filter((c) => c.trackType === 'audio');
    if (!composition || audSources.length === 0) return;
    saveToHistory();

    const minStart = Math.min(...audSources.map((c) => c.startTime));
    const maxEnd = Math.max(...audSources.map((c) => c.endTime));
    const shift = maxEnd - minStart;
    const ts = Date.now();

    const newClips: Clip[] = audSources.map((c, i) => ({
      ...c,
      id: `${c.id}-dup-${ts}-${i}`,
      startTime: c.startTime + shift,
      endTime: c.endTime + shift,
    }));

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        audio: normalizeAudioTrack([...composition.tracks.audio, ...newClips]),
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);

    if (newClips.length > 1) {
      set({
        composition: updated,
        selectedClipIds: newIds,
        selectedClipId: newIds[0] ?? null,
        selectedClipTrackType: 'audio',
      });
    } else {
      set({
        composition: updated,
        selectedClipId: newIds[0] ?? null,
        selectedClipIds: [],
        selectedClipTrackType: null,
      });
    }
  },

  duplicateVoiceoverClips: (sources) => {
    const { composition, saveToHistory } = get();
    const voSources = sources.filter((c) => c.trackType === 'voiceover');
    if (!composition || voSources.length === 0) return;
    saveToHistory();

    const minStart = Math.min(...voSources.map((c) => c.startTime));
    const maxEnd = Math.max(...voSources.map((c) => c.endTime));
    const shift = maxEnd - minStart;
    const ts = Date.now();

    const newClips: Clip[] = voSources.map((c, i) => ({
      ...c,
      id: `${c.id}-dup-${ts}-${i}`,
      startTime: c.startTime + shift,
      endTime: c.endTime + shift,
    }));

    const updated: Composition = {
      ...composition,
      tracks: {
        ...composition.tracks,
        voiceover: normalizeVoiceoverTrack([
          ...composition.tracks.voiceover,
          ...newClips,
        ]),
      },
    };
    updated.duration = recalcDuration(updated);
    const newIds = newClips.map((c) => c.id);

    if (newClips.length > 1) {
      set({
        composition: updated,
        selectedClipIds: newIds,
        selectedClipId: newIds[0] ?? null,
        selectedClipTrackType: 'voiceover',
      });
    } else {
      set({
        composition: updated,
        selectedClipId: newIds[0] ?? null,
        selectedClipIds: [],
        selectedClipTrackType: null,
      });
    }
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
    let newTrack = composition.tracks[trackKey]
      .filter((c) => c.id !== id)
      .concat([left, right])
      .sort((a, b) => a.startTime - b.startTime);
    if (trackKey === 'text') {
      newTrack = normalizeTextTrack(newTrack);
    } else if (trackKey === 'overlay') {
      newTrack = normalizeOverlayTrack(newTrack);
    } else if (trackKey === 'audio') {
      newTrack = normalizeAudioTrack(newTrack);
    } else if (trackKey === 'voiceover') {
      newTrack = normalizeVoiceoverTrack(newTrack);
    }
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
      textLane: PRIMARY_TEXT_LANE,
      content: 'Votre texte',
      x: 50,
      y: 50,
      boxWidthPct: 42,
      fontSize: 24,
      textScaleBaseFontSize: 24,
      textScalePct: 100,
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
      overlayLane: PRIMARY_OVERLAY_LANE,
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
      tracks: {
        ...composition.tracks,
        overlay: normalizeOverlayTrack([...composition.tracks.overlay, clip]),
      },
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

  toggleLaneMuted: (key) =>
    set((s) => ({ laneMuted: { ...s.laneMuted, [key]: !s.laneMuted[key] } })),

}));
