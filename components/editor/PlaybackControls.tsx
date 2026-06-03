'use client';

import { useCallback, useEffect, useRef } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import { useEditorUiStore } from '@/stores/editorUiStore';
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
    currentTime,
    composition,
    zoom,
    snapEnabled,
    masterVolume,
    isMuted,
    clipboard,
    selectedClipId,
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
    undo,
    redo,
    removeClip,
  } = useCompositionStore();

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
    if (isPlaying) {
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
  }, [isPlaying, tick]);

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
        if (selectedClipId) removeClip(selectedClipId);
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
        if (selectedClipId) {
          const store = useCompositionStore.getState();
          const comp = store.composition;
          if (!comp) return;
          const allClips = [
            ...comp.tracks.background,
            ...comp.tracks.text,
            ...comp.tracks.audio,
            ...comp.tracks.overlay,
            ...comp.tracks.voiceover,
          ];
          const clip = allClips.find((c) => c.id === selectedClipId);
          if (clip) {
            const dur = clip.endTime - clip.startTime;
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
        if (selectedClipId) {
          const store = useCompositionStore.getState();
          const comp = store.composition;
          if (!comp) return;
          const allClips = [
            ...comp.tracks.background,
            ...comp.tracks.text,
            ...comp.tracks.audio,
            ...comp.tracks.overlay,
            ...comp.tracks.voiceover,
          ];
          const clip = allClips.find((c) => c.id === selectedClipId);
          if (clip) setClipboard(clip);
        }
      } else if (e.code === 'KeyV' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (clipboard) pasteClip();
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
        <ToolbarBtn title="Annuler (Ctrl+Z)" onClick={undo}>
          <IconUndo {...ICON} />
        </ToolbarBtn>
        <ToolbarBtn title="Rétablir (Ctrl+Y)" onClick={redo}>
          <IconRedo {...ICON} />
        </ToolbarBtn>

        <ToolbarBtn
          title={
            selectedClipId
              ? 'Supprimer le clip sélectionné (Suppr)'
              : 'Sélectionnez un clip sur la timeline'
          }
          disabled={!selectedClipId}
          onClick={() => {
            if (selectedClipId) removeClip(selectedClipId);
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
        <input
          type="range"
          min={0.3}
          max={10}
          step={0.1}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="h-1.5 w-24 cursor-pointer accent-neutral-800"
          title={`Zoom ${zoom.toFixed(1)}×`}
          aria-label="Zoom timeline"
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
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={isMuted ? 0 : masterVolume}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            setMasterVolume(v);
            if (v > 0 && isMuted) setIsMuted(false);
          }}
          className="h-1.5 w-16 cursor-pointer accent-neutral-800"
          title="Volume principal"
          aria-label="Volume principal"
        />
      </div>
    </div>
  );
}
