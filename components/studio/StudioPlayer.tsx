'use client';

import { useEffect, useRef, type ComponentType } from 'react';
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
  const currentTime = useCompositionStore((s) => s.currentTime);
  const isPlaying = useCompositionStore((s) => s.isPlaying);
  const setCurrentTime = useCompositionStore((s) => s.setCurrentTime);
  const playerRef = useRef<PlayerRef>(null);
  const syncingFromStore = useRef(false);

  const fps = composition?.fps ?? 30;
  const remotionDims = composition
    ? getRemotionDimensions(
        composition.format,
        composition.customAspectW,
        composition.customAspectH
      )
    : { width: 1080, height: 1920 };
  const durationInFrames = composition ? getCompositionDurationFrames(composition) : 30;
  const inputProps = composition
    ? compositionToRemotionInput(composition)
    : { composition: null as never };

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

  useEffect(() => {
    const player = playerRef.current;
    if (!player || !composition) return;
    if (isPlaying) {
      void player.play();
    } else {
      player.pause();
    }
  }, [isPlaying, composition]);

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
      compositionWidth={remotionDims.width}
      compositionHeight={remotionDims.height}
      style={{ width, height }}
      className={className}
      controls={false}
      clickToPlay={false}
      spaceKeyToPlayOrPause={false}
      acknowledgeRemotionLicense
    />
  );
}
