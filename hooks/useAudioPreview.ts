'use client';

import { useCallback, useEffect, useRef, useState, type Dispatch, type MutableRefObject, type SetStateAction } from 'react';
import { setPanelPreviewClipId } from '@/lib/audioPreviewGate';
import { pauseAllTimelineAudio } from '@/lib/timelineAudioRegistry';
import { useCompositionStore } from '@/stores/compositionStore';

export function formatAudioDuration(seconds: number | null | undefined): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '--:--';
  const total = Math.floor(seconds);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export function formatPlaybackTimeLabel(
  current: number | null | undefined,
  total: number | null | undefined,
  active: boolean
): string {
  const totalLabel =
    total != null && Number.isFinite(total) && total > 0
      ? formatAudioDuration(total)
      : null;
  const currentLabel =
    current != null && Number.isFinite(current) && current >= 0
      ? formatAudioDuration(current)
      : null;

  if (active && currentLabel && totalLabel) {
    return `${currentLabel} / ${totalLabel}`;
  }
  if (active && currentLabel) return currentLabel;
  if (totalLabel) return totalLabel;
  return '--:--';
}

export type AudioPreviewUi = {
  clipId: string;
  playing: boolean;
} | null;

export type AudioPreviewSettings = {
  volume?: number;
  playbackRate?: number;
};

function clampPreviewVolume(volume: number): number {
  return Math.min(1, Math.max(0, volume));
}

function clampPreviewPlaybackRate(rate: number): number {
  return Math.max(0.25, Math.min(4, rate));
}

function applyPreviewSettingsToAudio(
  audio: HTMLAudioElement,
  settings?: AudioPreviewSettings
): void {
  if (!settings) return;
  if (settings.volume != null && Number.isFinite(settings.volume)) {
    audio.volume = clampPreviewVolume(settings.volume);
  }
  if (settings.playbackRate != null && Number.isFinite(settings.playbackRate)) {
    audio.playbackRate = clampPreviewPlaybackRate(settings.playbackRate);
  }
}

function resolvePreviewMediaUrl(url: string): string {
  if (typeof window === 'undefined') return url;
  try {
    return new URL(url, window.location.href).href;
  } catch {
    return url;
  }
}

function waitUntilCanPlay(audio: HTMLAudioElement, timeoutMs = 15000): Promise<void> {
  if (audio.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error('audio load timeout'));
    }, timeoutMs);

    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error('audio load error'));
    };
    const cleanup = () => {
      window.clearTimeout(timer);
      audio.removeEventListener('canplay', onReady);
      audio.removeEventListener('error', onError);
    };

    audio.addEventListener('canplay', onReady);
    audio.addEventListener('error', onError);
  });
}

function attachPreviewListeners(
  audio: HTMLAudioElement,
  id: string,
  ctx: {
    activeIdRef: MutableRefObject<string | null>;
    playingRef: MutableRefObject<boolean>;
    syncUi: (clipId: string | null, playing: boolean) => void;
    setDurations: Dispatch<SetStateAction<Record<string, number>>>;
    setCurrentTimes: Dispatch<SetStateAction<Record<string, number>>>;
    detachPreviewAudio: () => void;
  }
) {
  audio.onloadedmetadata = () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      ctx.setDurations((prev) =>
        prev[id] === audio.duration ? prev : { ...prev, [id]: audio.duration }
      );
    }
  };
  audio.onended = () => {
    if (ctx.activeIdRef.current !== id) return;
    ctx.playingRef.current = false;
    ctx.activeIdRef.current = null;
    setPanelPreviewClipId(null);
    ctx.syncUi(null, false);
    ctx.setCurrentTimes((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    ctx.detachPreviewAudio();
  };
  audio.onerror = () => {
    if (ctx.activeIdRef.current !== id) return;
    ctx.playingRef.current = false;
    ctx.syncUi(id, false);
    setPanelPreviewClipId(null);
  };
}

export function useAudioPreview() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeIdRef = useRef<string | null>(null);
  const playingRef = useRef(false);
  const loadingRef = useRef(false);
  const [previewUi, setPreviewUi] = useState<AudioPreviewUi>(null);
  const [durations, setDurations] = useState<Record<string, number>>({});
  const [currentTimes, setCurrentTimes] = useState<Record<string, number>>({});
  const rafRef = useRef<number | null>(null);
  const previewSettingsRef = useRef<Record<string, AudioPreviewSettings>>({});

  const syncUi = useCallback((clipId: string | null, playing: boolean) => {
    if (!clipId) {
      setPreviewUi(null);
      return;
    }
    setPreviewUi({ clipId, playing });
  }, []);

  const detachPreviewAudio = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.onended = null;
      el.onerror = null;
      el.onloadedmetadata = null;
      el.pause();
      el.removeAttribute('src');
      el.load();
    }
    audioRef.current = null;
  }, []);

  const stopPreview = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    detachPreviewAudio();
    activeIdRef.current = null;
    playingRef.current = false;
    loadingRef.current = false;
    setPanelPreviewClipId(null);
    setCurrentTimes({});
    syncUi(null, false);
  }, [detachPreviewAudio, syncUi]);

  const listenerCtx = useRef({
    activeIdRef,
    playingRef,
    syncUi,
    setDurations,
    setCurrentTimes,
    detachPreviewAudio,
  });
  listenerCtx.current = {
    activeIdRef,
    playingRef,
    syncUi,
    setDurations,
    setCurrentTimes,
    detachPreviewAudio,
  };

  const beginPlayback = useCallback(
    async (id: string, url: string, startAt = 0, settings?: AudioPreviewSettings) => {
      if (loadingRef.current) return;

      if (settings) {
        previewSettingsRef.current[id] = {
          ...previewSettingsRef.current[id],
          ...settings,
        };
      }

      pauseAllTimelineAudio();
      if (useCompositionStore.getState().isPlaying) {
        useCompositionStore.getState().setIsPlaying(false);
      }

      loadingRef.current = true;
      try {
        let audio = audioRef.current;

        if (activeIdRef.current !== id || !audio) {
          detachPreviewAudio();
          audio = new Audio(resolvePreviewMediaUrl(url));
          audio.preload = 'auto';
          audioRef.current = audio;
          activeIdRef.current = id;
          attachPreviewListeners(audio, id, listenerCtx.current);
          await waitUntilCanPlay(audio);
        }

        applyPreviewSettingsToAudio(audio, previewSettingsRef.current[id]);

        setPanelPreviewClipId(id);
        const seekTo = Math.max(0, startAt);
        audio.currentTime = seekTo;
        setCurrentTimes((prev) => ({ ...prev, [id]: seekTo }));
        await audio.play();

        playingRef.current = true;
        syncUi(id, true);
      } catch {
        playingRef.current = false;
        syncUi(id, false);
        setPanelPreviewClipId(null);
      } finally {
        loadingRef.current = false;
      }
    },
    [detachPreviewAudio, syncUi]
  );

  const applyPreviewSettings = useCallback((id: string, settings: AudioPreviewSettings) => {
    previewSettingsRef.current[id] = {
      ...previewSettingsRef.current[id],
      ...settings,
    };
    if (activeIdRef.current === id && audioRef.current) {
      applyPreviewSettingsToAudio(audioRef.current, previewSettingsRef.current[id]);
    }
  }, []);

  const togglePreview = useCallback(
    (
      id: string,
      url: string | null | undefined,
      options?: { startAt?: number; settings?: AudioPreviewSettings }
    ) => {
      if (!url || loadingRef.current) return;

      const startAt = options?.startAt ?? 0;
      const settings = options?.settings;

      if (activeIdRef.current === id && audioRef.current) {
        if (playingRef.current) {
          const t = audioRef.current.currentTime;
          audioRef.current.pause();
          playingRef.current = false;
          setCurrentTimes((prev) => ({ ...prev, [id]: t }));
          syncUi(id, false);
          setPanelPreviewClipId(id);
          if (settings) {
            applyPreviewSettings(id, settings);
          }
        } else {
          void beginPlayback(id, url, audioRef.current.currentTime || startAt, settings);
        }
        return;
      }

      void beginPlayback(id, url, startAt, settings);
    },
    [applyPreviewSettings, beginPlayback, syncUi]
  );

  const seekPreview = useCallback((id: string, time: number) => {
    if (activeIdRef.current !== id || !audioRef.current) return;
    const audio = audioRef.current;
    const max =
      Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : time;
    const next = Math.max(0, Math.min(max, time));
    audio.currentTime = next;
    setCurrentTimes((prev) => ({ ...prev, [id]: next }));
  }, []);

  useEffect(() => {
    if (!previewUi?.playing) {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    const id = previewUi.clipId;
    const tick = () => {
      const audio = audioRef.current;
      if (!audio || activeIdRef.current !== id || !playingRef.current) return;
      setCurrentTimes((prev) =>
        prev[id] === audio.currentTime ? prev : { ...prev, [id]: audio.currentTime }
      );
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        setDurations((prev) =>
          prev[id] === audio.duration ? prev : { ...prev, [id]: audio.duration }
        );
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [previewUi?.playing, previewUi?.clipId]);

  useEffect(() => () => stopPreview(), [stopPreview]);

  return {
    previewUi,
    durations,
    currentTimes,
    togglePreview,
    seekPreview,
    applyPreviewSettings,
    stopPreview,
  };
};
