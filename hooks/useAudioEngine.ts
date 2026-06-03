'use client';

import { useEffect, useRef } from 'react';
import { useCompositionStore } from '@/stores/compositionStore';
import type { Clip } from '@/types/composition';

/** Linear fade-in / fade-out gain (0–1) from timeline position vs clip bounds. */
function audioFadeGain(clip: Clip, compositionTime: number): number {
  const duration = clip.endTime - clip.startTime;
  if (duration <= 0) return 0;

  const u = compositionTime - clip.startTime;
  if (u < 0 || u >= duration) return 0;

  const finRaw = clip.fadeIn ?? 0;
  const foutRaw = clip.fadeOut ?? 0;
  const fin = Math.min(Math.max(0, finRaw), duration);
  const fout = Math.min(Math.max(0, foutRaw), duration);

  let inRamp = 1;
  if (fin > 0) {
    inRamp = Math.min(1, u / fin);
  }
  let outRamp = 1;
  if (fout > 0) {
    outRamp = Math.min(1, (duration - u) / fout);
  }
  return Math.max(0, Math.min(1, inRamp * outRamp));
}

/** Lane index for overlap stacking (same algorithm as Timeline). */
function laneIndexForClip(trackList: Clip[], clipId: string): number {
  const sorted = [...trackList].sort((a, b) => a.startTime - b.startTime);
  const lanes: Clip[][] = [];
  for (const clip of sorted) {
    let placed = false;
    for (const lane of lanes) {
      if (lane[lane.length - 1].endTime <= clip.startTime + 0.001) {
        lane.push(clip);
        placed = true;
        break;
      }
    }
    if (!placed) lanes.push([clip]);
  }
  for (let i = 0; i < lanes.length; i++) {
    if (lanes[i].some((c) => c.id === clipId)) return i;
  }
  return 0;
}

type StoreSlice = ReturnType<typeof useCompositionStore.getState>;

/** Master × piste visible (piste entière + lane). 0 si muet global. */
function masterMultiplierForClip(clip: Clip, state: StoreSlice): number {
  if (state.isMuted) return 0;
  const comp = state.composition;
  if (!comp) return 0;

  if (clip.trackType === 'audio') {
    if (state.trackHidden.audio) return 0;
    const lane = laneIndexForClip(comp.tracks.audio, clip.id);
    if (state.laneHidden[`audio-${lane}`]) return 0;
    return state.masterVolume;
  }
  if (clip.trackType === 'voiceover') {
    if (state.trackHidden.voiceover) return 0;
    const lane = laneIndexForClip(comp.tracks.voiceover, clip.id);
    if (state.laneHidden[`voiceover-${lane}`]) return 0;
    return state.masterVolume;
  }
  return 0;
}

/**
 * HTMLAudioElement pour les pistes **audio** (musique) et **voiceover** (voix off).
 * Trim-end, fade in/out, lanes masquées.
 */
export function useAudioEngine() {
  const audioMap       = useRef<Map<string, HTMLAudioElement>>(new Map());
  const endListeners   = useRef<Map<string, () => void>>(new Map());
  const lastMeta       = useRef<Map<string, { trimStart: number; duration: number }>>(new Map());

  function attachTrimEnd(el: HTMLAudioElement, clip: Clip) {
    const old = endListeners.current.get(clip.id);
    if (old) el.removeEventListener('timeupdate', old);

    const trimStart  = clip.trimStart ?? 0;
    const duration   = clip.endTime - clip.startTime;
    const upperBound = trimStart + duration;

    const listener = () => {
      if (el.currentTime >= upperBound) {
        el.pause();
        el.currentTime = trimStart;
      }
    };
    el.addEventListener('timeupdate', listener);
    endListeners.current.set(clip.id, listener);
    lastMeta.current.set(clip.id, { trimStart, duration });
  }

  useEffect(() => {
    let prevIsPlaying   = useCompositionStore.getState().isPlaying;
    let prevCurrentTime = useCompositionStore.getState().currentTime;

    const unsubscribe = useCompositionStore.subscribe((state) => {
      const comp   = state.composition;
      const audioC = comp?.tracks.audio ?? [];
      const voC    = comp?.tracks.voiceover ?? [];
      const clips  = [...audioC, ...voC];

      const currentIds = new Set(clips.map((c) => c.id));

      audioMap.current.forEach((el, id) => {
        if (!currentIds.has(id)) {
          el.pause();
          const l = endListeners.current.get(id);
          if (l) { el.removeEventListener('timeupdate', l); endListeners.current.delete(id); }
          lastMeta.current.delete(id);
          el.src = '';
          audioMap.current.delete(id);
        }
      });

      clips.forEach((clip) => {
        if (!clip.url) return;

        let el = audioMap.current.get(clip.id);
        const isNew = !el;

        if (isNew) {
          el = new Audio(clip.url);
          el.preload = 'auto';
          audioMap.current.set(clip.id, el);
        }

        const masterM = masterMultiplierForClip(clip, state);
        const fade      = audioFadeGain(clip, state.currentTime);
        const rawVol    = (clip.volume ?? 0.8) * masterM * fade;
        el!.volume       = Math.min(1, Math.max(0, clip.muted ? 0 : rawVol));
        el!.playbackRate = Math.max(0.25, Math.min(4, clip.playbackRate ?? 1));

        const trimStart = clip.trimStart ?? 0;
        const duration  = clip.endTime - clip.startTime;
        const meta      = lastMeta.current.get(clip.id);
        if (
          isNew ||
          !meta ||
          Math.abs(meta.trimStart - trimStart) > 0.01 ||
          Math.abs(meta.duration - duration) > 0.01
        ) {
          attachTrimEnd(el!, clip);
        }
      });

      const playChanged = state.isPlaying !== prevIsPlaying;
      const seeked =
        !state.isPlaying &&
        !prevIsPlaying &&
        Math.abs(state.currentTime - prevCurrentTime) > 0.08;

      prevIsPlaying   = state.isPlaying;
      prevCurrentTime = state.currentTime;

      if (!playChanged && !seeked) return;

      clips.forEach((clip) => {
        if (!clip.url) return;
        const el = audioMap.current.get(clip.id);
        if (!el) return;

        const isActive =
          clip.startTime <= state.currentTime && clip.endTime > state.currentTime;
        const audible = masterMultiplierForClip(clip, state) > 0;

        if (isActive && state.isPlaying && audible) {
          const trimStart = clip.trimStart ?? 0;
          const offset    = Math.max(0, state.currentTime - clip.startTime + trimStart);
          if (el.paused || Math.abs(el.currentTime - offset) > 0.5) {
            el.currentTime = offset;
          }
          el.play().catch(() => { /* autoplay blocked */ });
        } else {
          if (!el.paused) el.pause();
          if (isActive) {
            const trimStart = clip.trimStart ?? 0;
            el.currentTime  = Math.max(0, state.currentTime - clip.startTime + trimStart);
          }
        }
      });
    });

    return () => {
      unsubscribe();
      audioMap.current.forEach((el, id) => {
        const l = endListeners.current.get(id);
        if (l) el.removeEventListener('timeupdate', l);
        el.pause();
        el.src = '';
      });
      audioMap.current.clear();
      endListeners.current.clear();
      lastMeta.current.clear();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
