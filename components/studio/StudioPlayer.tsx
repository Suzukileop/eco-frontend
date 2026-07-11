'use client';

import { useEffect, useMemo, useRef, type ComponentType } from 'react';
import { Player, type PlayerRef } from '@remotion/player';
import { StudioComposition } from '@/remotion/StudioComposition';
import {
  compositionToRemotionInput,
  getCompositionDurationFrames,
  getRemotionDimensions,
  timeToFrame,
  frameToTime,
} from '@/lib/studio/remotionBridge';
import { useCompositionStore } from '@/stores/compositionStore';

interface StudioPlayerProps {
  width: number;
  height: number;
  className?: string;
}

export function StudioPlayer({ width, height, className }: StudioPlayerProps) {
  const composition = useCompositionStore((s) => s.composition);
  const laneMuted = useCompositionStore((s) => s.laneMuted);
  const laneHidden = useCompositionStore((s) => s.laneHidden);
  const trackHidden = useCompositionStore((s) => s.trackHidden);
  const currentTime = useCompositionStore((s) => s.currentTime);
  const isPlaying = useCompositionStore((s) => s.isPlaying);
  const setCurrentTime = useCompositionStore((s) => s.setCurrentTime);
  const setPlaybackDriver = useCompositionStore((s) => s.setPlaybackDriver);
  const playerRef = useRef<PlayerRef>(null);
  const syncingFromStore = useRef(false);

  const fps = composition?.fps ?? 30;
  // WYSIWYG: the preview Player renders in the SAME coordinate space as the
  // pause editor (Konva / TextZoneClip use these exact display dimensions).
  // This guarantees fonts, frames and overlays are computed identically in
  // pause and play. The export path uses its own 1920 space via calculateMetadata.
  const fallbackDims = composition
    ? getRemotionDimensions(
        composition.format,
        composition.customAspectW,
        composition.customAspectH
      )
    : { width: 1080, height: 1920 };
  const compositionWidth = width > 0 ? Math.round(width) : fallbackDims.width;
  const compositionHeight = height > 0 ? Math.round(height) : fallbackDims.height;
  const v1GlCoverReady = useCompositionStore((s) => s.v1GlCoverReady);
  const durationInFrames = composition ? getCompositionDurationFrames(composition) : 30;
  const inputProps = useMemo(
    () =>
      composition
        ? compositionToRemotionInput(
            composition,
            laneMuted,
            laneHidden,
            trackHidden,
            true,
            v1GlCoverReady
          )
        : { composition: null as never },
    [composition, laneMuted, laneHidden, trackHidden, v1GlCoverReady]
  );

  // Remotion drives the playback clock while this component is mounted.
  useEffect(() => {
    setPlaybackDriver('remotion');
    return () => setPlaybackDriver('raf');
  }, [setPlaybackDriver]);

  // Seek when paused and playhead moves (scrubbing).
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !composition || isPlaying) return;
    syncingFromStore.current = true;
    player.pause();
    player.seekTo(timeToFrame(currentTime, fps));
    const t = window.setTimeout(() => {
      syncingFromStore.current = false;
    }, 50);
    return () => window.clearTimeout(t);
  }, [currentTime, fps, isPlaying, composition]);

  // Play / pause — seek to current playhead BEFORE starting playback.
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !composition) return;

    if (isPlaying) {
      syncingFromStore.current = true;
      const frame = timeToFrame(useCompositionStore.getState().currentTime, fps);
      player.seekTo(frame);
      void player.play();
      const t = window.setTimeout(() => {
        syncingFromStore.current = false;
      }, 100);
      return () => window.clearTimeout(t);
    }

    player.pause();
  }, [isPlaying, composition, fps]);

  // Drive store currentTime from Remotion frame updates (single clock source).
  useEffect(() => {
    const player = playerRef.current;
    if (!player || !composition) return;

    const onFrame = () => {
      if (syncingFromStore.current || !isPlaying) return;
      const frame = player.getCurrentFrame();
      setCurrentTime(frameToTime(frame, fps));
    };

    player.addEventListener('frameupdate', onFrame);
    return () => player.removeEventListener('frameupdate', onFrame);
  }, [fps, isPlaying, setCurrentTime, composition]);

  if (!composition) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-900 ${className ?? ''}`}
        style={{ width, height }}
      >
        <span className="text-sm text-gray-500">Aucune composition</span>
      </div>
    );
  }

  const RemotionComp = StudioComposition as unknown as ComponentType<Record<string, unknown>>;

  return (
    <Player
      ref={playerRef}
      component={RemotionComp}
      inputProps={inputProps as unknown as Record<string, unknown>}
      durationInFrames={durationInFrames}
      fps={fps}
      compositionWidth={compositionWidth}
      compositionHeight={compositionHeight}
      initialFrame={timeToFrame(currentTime, fps)}
      style={{ width, height }}
      className={className}
      controls={false}
      clickToPlay={false}
      spaceKeyToPlayOrPause={false}
      acknowledgeRemotionLicense
    />
  );
}
