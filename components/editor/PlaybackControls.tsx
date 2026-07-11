'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
import { CapCutRangeSlider } from '@/components/editor/CapCutRangeSlider';
import {
  IconPlay,
  IconPause,
  IconSkipBack,
  IconSkipForward,
  IconUndo,
  IconRedo,
  IconZoomOut,
  IconZoomIn,
  IconSnap,
  IconVolume,
  IconVolumeMute,
  IconTrash,
} from '@/components/editor/TimelineIcons';

const ICON = { width: 18, height: 18 } as const;

function formatTimecode(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function ToolbarBtn({
  onClick,
  title,
  active,
  disabled,
  children,
}: {
  onClick: () => void;
  title: string;
  active?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
        disabled
          ? 'cursor-not-allowed text-neutral-300'
          : active
            ? 'bg-neutral-200 text-neutral-900'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
      }`}
    >
      {children}
    </button>
  );
}

function PlayBtn({
  onClick,
  title,
  playing,
}: {
  onClick: () => void;
  title: string;
  playing: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="mx-1 flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
    >
      {playing ? <IconPause width={16} height={16} /> : <IconPlay width={16} height={16} />}
    </button>
  );
}

function IconPreviewFullscreen({ width = 18, height = 18 }: { width?: number; height?: number }) {
  return (
    <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 9V5a1 1 0 011-1h4M4 15v4a1 1 0 001 1h4M16 4h4a1 1 0 011 1v4M16 20h4a1 1 0 01-1 1h-4" />
    </svg>
  );
}

export function PlaybackControls() {
  const previewFullscreen = useEditorUiStore((s) => s.previewFullscreen);
  const togglePreviewFullscreen = useEditorUiStore((s) => s.togglePreviewFullscreen);
  const {
    isPlaying,
    playbackDriver,
    currentTime,
    composition,
    zoom,
    snapEnabled,
    masterVolume,
    isMuted,
    clipboard,
    selectedClipId,
    selectedClipIds,
    setIsPlaying,
    setCurrentTime,
    setZoom,
    setSnapEnabled,
    setMasterVolume,
    setIsMuted,
    setClipboard,
    pasteClip,
    splitClip,
    addTextClip,
    addOverlayStickerClip,
    history,
    future,
    undo,
    redo,
    removeClip,
  } = useCompositionStore();

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  const rafRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const totalDuration = composition?.duration ?? 0;

  const tick = useCallback(() => {
    const now = performance.now();
    if (lastTimeRef.current !== null) {
      const delta = (now - lastTimeRef.current) / 1000;
      useCompositionStore.setState((s) => {
        const next = s.currentTime + delta;
        if (next >= (s.composition?.duration ?? 0)) {
          return { currentTime: 0, isPlaying: false };
        }
        return { currentTime: next };
      });
    }
    lastTimeRef.current = now;
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    // Remotion player drives currentTime via frameupdate — skip RAF to avoid desync.
    if (isPlaying && playbackDriver !== 'remotion') {
      lastTimeRef.current = performance.now();
      rafRef.current = requestAnimationFrame(tick);
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      lastTimeRef.current = null;
    }
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [isPlaying, playbackDriver, tick]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setIsPlaying(!isPlaying);
      } else if (e.code === 'ArrowLeft' && e.shiftKey) {
        setCurrentTime(currentTime - 0.1);
      } else if (e.code === 'ArrowRight' && e.shiftKey) {
        setCurrentTime(currentTime + 0.1);
      } else if (e.code === 'ArrowLeft') {
        setCurrentTime(currentTime - 1);
      } else if (e.code === 'ArrowRight') {
        setCurrentTime(currentTime + 1);
      } else if (e.code === 'Delete' || e.code === 'Backspace') {
        const store = useCompositionStore.getState();
        const voIds = store.getSelectedVoiceoverClipIds();
        const audIds = store.getSelectedAudioClipIds();
        const ovIds = store.getSelectedOverlayClipIds();
        const textIds = store.getSelectedTextClipIds();
        const bgIds = store.getSelectedBackgroundClipIds();
        const multiIds =
          voIds.length > 1
            ? voIds
            : audIds.length > 1
              ? audIds
              : ovIds.length > 1
                ? ovIds
                : textIds.length > 1
                  ? textIds
                  : bgIds.length > 1
                    ? bgIds
                    : [];
        if (multiIds.length > 1) {
          e.preventDefault();
          store.removeClips(multiIds);
          store.clearLaneClipSelection();
        } else if (selectedClipId) {
          e.preventDefault();
          removeClip(selectedClipId);
        }
      } else if (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey) && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        (e.code === 'KeyY' && (e.ctrlKey || e.metaKey)) ||
        (e.code === 'KeyZ' && (e.ctrlKey || e.metaKey) && e.shiftKey)
      ) {
        e.preventDefault();
        redo();
      } else if (e.code === 'KeyD' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const store = useCompositionStore.getState();
        const voIds = store.getSelectedVoiceoverClipIds();
        const audIds = store.getSelectedAudioClipIds();
        const ovIds = store.getSelectedOverlayClipIds();
        const bgIds = store.getSelectedBackgroundClipIds();
        const textIds = store.getSelectedTextClipIds();
        const comp = store.composition;
        if (!comp) return;
        if (voIds.length > 1) {
          const idSet = new Set(voIds);
          const clips = comp.tracks.voiceover.filter((c) => idSet.has(c.id));
          store.duplicateVoiceoverClips(clips);
        } else if (audIds.length > 1) {
          const idSet = new Set(audIds);
          const clips = comp.tracks.audio.filter((c) => idSet.has(c.id));
          store.duplicateAudioClips(clips);
        } else if (ovIds.length > 1) {
          const idSet = new Set(ovIds);
          const clips = comp.tracks.overlay.filter((c) => idSet.has(c.id));
          store.duplicateOverlayClips(clips);
        } else if (bgIds.length > 1) {
          const idSet = new Set(bgIds);
          const clips = comp.tracks.background.filter((c) => idSet.has(c.id));
          store.duplicateBackgroundClips(clips);
        } else if (textIds.length > 1) {
          const idSet = new Set(textIds);
          const clips = comp.tracks.text.filter((c) => idSet.has(c.id));
          store.duplicateTextClips(clips);
        } else if (selectedClipId) {
          const allClips = [
            ...comp.tracks.background,
            ...comp.tracks.text,
            ...comp.tracks.audio,
            ...comp.tracks.overlay,
            ...comp.tracks.voiceover,
          ];
          const clip = allClips.find((c) => c.id === selectedClipId);
          if (clip?.trackType === 'background') {
            store.duplicateBackgroundClips([clip]);
          } else if (clip?.trackType === 'text') {
            store.duplicateTextClips([clip]);
          } else if (clip?.trackType === 'overlay') {
            store.duplicateOverlayClips([clip]);
          } else if (clip?.trackType === 'audio') {
            store.duplicateAudioClips([clip]);
          } else if (clip?.trackType === 'voiceover') {
            store.duplicateVoiceoverClips([clip]);
          } else if (clip) {
            const dur = clip.endTime - clip.startTime;
            store.saveToHistory();
            store.addClip({
              ...clip,
              id: `${clip.id}-copy-${Date.now()}`,
              startTime: clip.endTime,
              endTime: clip.endTime + dur,
            });
          }
        }
      } else if (e.code === 'KeyC' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const store = useCompositionStore.getState();
        const voIds = store.getSelectedVoiceoverClipIds();
        const audIds = store.getSelectedAudioClipIds();
        const ovIds = store.getSelectedOverlayClipIds();
        const textIds = store.getSelectedTextClipIds();
        if (voIds.length > 0) {
          store.copySelectedVoiceoverClips();
        } else if (audIds.length > 0) {
          store.copySelectedAudioClips();
        } else if (ovIds.length > 0) {
          store.copySelectedOverlayClips();
        } else if (textIds.length > 0) {
          store.copySelectedTextClips();
        } else {
          store.copySelectedBackgroundClips();
        }
      } else if (e.code === 'KeyX' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const store = useCompositionStore.getState();
        const voIds = store.getSelectedVoiceoverClipIds();
        const audIds = store.getSelectedAudioClipIds();
        const ovIds = store.getSelectedOverlayClipIds();
        const textIds = store.getSelectedTextClipIds();
        const bgIds = store.getSelectedBackgroundClipIds();
        const multiIds =
          voIds.length > 0
            ? voIds
            : audIds.length > 0
              ? audIds
              : ovIds.length > 0
                ? ovIds
                : textIds.length > 0
                  ? textIds
                  : bgIds;
        if (multiIds.length === 0) return;
        store.saveToHistory();
        if (voIds.length > 0) {
          store.copySelectedVoiceoverClips();
        } else if (audIds.length > 0) {
          store.copySelectedAudioClips();
        } else if (ovIds.length > 0) {
          store.copySelectedOverlayClips();
        } else if (textIds.length > 0) {
          store.copySelectedTextClips();
        } else {
          store.copySelectedBackgroundClips();
        }
        if (multiIds.length > 1) {
          store.removeClips(multiIds);
          store.clearLaneClipSelection();
        } else {
          store.removeClip(multiIds[0]);
        }
      } else if (e.code === 'KeyV' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        const store = useCompositionStore.getState();
        const clip = store.clipboard;
        const multi = store.clipboardMulti;
        if (multi?.[0]?.trackType === 'voiceover' || clip?.trackType === 'voiceover') {
          store.pasteVoiceoverClipboard();
        } else if (multi?.[0]?.trackType === 'audio' || clip?.trackType === 'audio') {
          store.pasteAudioClipboard();
        } else if (multi?.[0]?.trackType === 'overlay' || clip?.trackType === 'overlay') {
          store.pasteOverlayClipboard();
        } else if (multi?.[0]?.trackType === 'text' || clip?.trackType === 'text') {
          store.pasteTextClipboard();
        } else {
          store.pasteBackgroundClipboard();
        }
      } else if (e.code === 'KeyS' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        if (selectedClipId) {
          splitClip(selectedClipId, currentTime);
        } else {
          const store = useCompositionStore.getState();
          const comp = store.composition;
          if (!comp) return;
          const allC = [
            ...comp.tracks.background,
            ...comp.tracks.text,
            ...comp.tracks.audio,
            ...comp.tracks.overlay,
            ...comp.tracks.voiceover,
          ];
          const active = allC.find((c) => c.startTime < currentTime && c.endTime > currentTime);
          if (active) splitClip(active.id, currentTime);
        }
      } else if (e.code === 'KeyT' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        addTextClip(currentTime, currentTime + 5);
      } else if (e.code === 'KeyO' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        addOverlayStickerClip(currentTime, currentTime + 4);
      } else if (e.code === 'Equal' || e.code === 'NumpadAdd') {
        e.preventDefault();
        setZoom(Math.min(10, zoom * 1.2));
      } else if (e.code === 'Minus' || e.code === 'NumpadSubtract') {
        e.preventDefault();
        setZoom(Math.max(0.3, zoom / 1.2));
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [
    isPlaying,
    currentTime,
    selectedClipId,
    clipboard,
    zoom,
    setIsPlaying,
    setCurrentTime,
    setZoom,
    undo,
    redo,
    removeClip,
    setClipboard,
    pasteClip,
    splitClip,
    addTextClip,
    addOverlayStickerClip,
  ]);

  return (
    <div className="flex h-11 shrink-0 items-center justify-between border-t border-neutral-200 bg-white px-3">
      <div className="flex items-center gap-1">
        <ToolbarBtn
          title="Reculer de 5 s"
          onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
        >
          <IconSkipBack {...ICON} />
        </ToolbarBtn>
        <PlayBtn
          title={isPlaying ? 'Pause (Espace)' : 'Lecture (Espace)'}
          playing={isPlaying}
          onClick={() => setIsPlaying(!isPlaying)}
        />
        <ToolbarBtn
          title="Avancer de 5 s"
          onClick={() => setCurrentTime(Math.min(totalDuration, currentTime + 5))}
        >
          <IconSkipForward {...ICON} />
        </ToolbarBtn>
        <span className="ml-2 min-w-[8.5rem] text-xs font-mono tabular-nums text-neutral-600">
          <span className="font-semibold text-neutral-900">{formatTimecode(currentTime)}</span>
          <span className="mx-1.5 text-neutral-400">|</span>
          {formatTimecode(totalDuration)}
        </span>
      </div>

      <div className="flex items-center gap-1.5">
        <div className="mx-0.5 flex items-center gap-0.5">
          <button
            type="button"
            title="Annuler (Ctrl+Z)"
            onClick={undo}
            disabled={!canUndo}
            className={`flex h-7 w-7 items-center justify-center transition-opacity ${
              canUndo
                ? 'text-neutral-900 hover:opacity-70'
                : 'cursor-default text-neutral-300'
            }`}
          >
            <IconUndo width={18} height={18} />
          </button>
          <button
            type="button"
            title="Rétablir (Ctrl+Y)"
            onClick={redo}
            disabled={!canRedo}
            className={`flex h-7 w-7 items-center justify-center transition-opacity ${
              canRedo
                ? 'text-neutral-900 hover:opacity-70'
                : 'cursor-default text-neutral-300'
            }`}
          >
            <IconRedo width={18} height={18} />
          </button>
        </div>

        <ToolbarBtn
          title={
            selectedClipIds.length > 1
              ? `Supprimer ${selectedClipIds.length} clips sélectionnés (Suppr)`
              : selectedClipId
              ? 'Supprimer le clip sélectionné (Suppr)'
              : 'Sélectionnez un clip sur la timeline'
          }
          disabled={!selectedClipId && selectedClipIds.length === 0}
          onClick={() => {
            const store = useCompositionStore.getState();
            const voIds = store.getSelectedVoiceoverClipIds();
            const audIds = store.getSelectedAudioClipIds();
            const ovIds = store.getSelectedOverlayClipIds();
            const bgIds = store.getSelectedBackgroundClipIds();
            const textIds = store.getSelectedTextClipIds();
            const ids =
              voIds.length > 1
                ? voIds
                : audIds.length > 1
                  ? audIds
                  : ovIds.length > 1
                    ? ovIds
                    : textIds.length > 1
                      ? textIds
                      : bgIds.length > 1
                        ? bgIds
                        : voIds.length > 0
                          ? voIds
                          : audIds.length > 0
                            ? audIds
                            : ovIds.length > 0
                              ? ovIds
                              : textIds.length > 0
                                ? textIds
                                : bgIds;
            if (ids.length > 1) {
              store.removeClips(ids);
              store.clearLaneClipSelection();
            } else if (ids.length === 1) {
              store.removeClip(ids[0]);
            } else if (selectedClipId) {
              removeClip(selectedClipId);
            }
          }}
        >
          <IconTrash {...ICON} />
        </ToolbarBtn>

        <div className="mx-0.5 h-6 w-px bg-neutral-200" aria-hidden />

        <ToolbarBtn
          title={previewFullscreen ? 'Quitter l’aperçu plein écran' : 'Aperçu plein écran'}
          active={previewFullscreen}
          onClick={togglePreviewFullscreen}
        >
          <IconPreviewFullscreen />
        </ToolbarBtn>

        <div className="mx-0.5 h-6 w-px bg-neutral-200" aria-hidden />

        <ToolbarBtn
          title="Zoom arrière"
          onClick={() => setZoom(Math.max(0.3, zoom / 1.2))}
        >
          <IconZoomOut {...ICON} />
        </ToolbarBtn>
        <CapCutRangeSlider
          min={0.3}
          max={10}
          step={0.1}
          value={zoom}
          onChange={setZoom}
          width="6rem"
          title={`Zoom ${zoom.toFixed(1)}×`}
          ariaLabel="Zoom timeline"
        />
        <ToolbarBtn
          title="Zoom avant"
          onClick={() => setZoom(Math.min(10, zoom * 1.2))}
        >
          <IconZoomIn {...ICON} />
        </ToolbarBtn>

        <div className="mx-0.5 h-6 w-px bg-neutral-200" aria-hidden />

        <ToolbarBtn
          title="Snap magnétique"
          active={snapEnabled}
          onClick={() => setSnapEnabled(!snapEnabled)}
        >
          <IconSnap {...ICON} />
        </ToolbarBtn>

        <div className="mx-0.5 h-6 w-px bg-neutral-200" aria-hidden />

        <ToolbarBtn
          title={isMuted ? 'Réactiver le son' : 'Couper le son'}
          onClick={() => setIsMuted(!isMuted)}
        >
          {isMuted || masterVolume === 0 ? (
            <IconVolumeMute {...ICON} />
          ) : (
            <IconVolume {...ICON} />
          )}
        </ToolbarBtn>
        <CapCutRangeSlider
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : masterVolume}
          onChange={(v) => {
            setMasterVolume(v);
            if (v > 0 && isMuted) setIsMuted(false);
          }}
          width="4rem"
          title="Volume principal"
          ariaLabel="Volume principal"
        />
      </div>
    </div>
  );
}
