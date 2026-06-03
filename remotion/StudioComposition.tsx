import { useMemo } from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import type { StudioCompositionInputProps } from '@/lib/studio/remotionBridge';
import { timeToFrame } from '@/lib/studio/remotionBridge';
import { RemotionBackgroundClip } from '@/remotion/layers/RemotionBackgroundClip';
import { RemotionTextClip } from '@/remotion/layers/RemotionTextClip';
import { RemotionOverlayClip } from '@/remotion/layers/RemotionOverlayClip';

function clipDurationFrames(
  clip: { startTime: number; endTime: number },
  fps: number
): number {
  return Math.max(1, timeToFrame(clip.endTime - clip.startTime, fps));
}

export const StudioComposition: React.FC<StudioCompositionInputProps> = ({
  composition,
}) => {
  const { fps } = useVideoConfig();

  const bg = composition.tracks.background ?? [];
  const texts = composition.tracks.text ?? [];
  const overlays = composition.tracks.overlay ?? [];

  const sortedBg = useMemo(
    () => [...bg].sort((a, b) => a.startTime - b.startTime),
    [bg]
  );

  const canvasBg = composition.canvasBackgroundColor ?? '#000000';
  const frameBorderW = composition.frameBorderWidth ?? 0;
  const frameBorderColor = composition.frameBorderColor ?? '#ffffff';

  return (
    <AbsoluteFill
      style={{
        backgroundColor: canvasBg,
        boxShadow:
          frameBorderW > 0
            ? `inset 0 0 0 ${frameBorderW}px ${frameBorderColor}`
            : undefined,
      }}
    >
      {sortedBg.map((clip, idx) => (
        <Sequence
          key={clip.id}
          from={timeToFrame(clip.startTime, fps)}
          durationInFrames={clipDurationFrames(clip, fps)}
          layout="none"
        >
          <AbsoluteFill style={{ zIndex: 10 + idx }}>
            <RemotionBackgroundClip clip={clip} composition={composition} />
          </AbsoluteFill>
        </Sequence>
      ))}

      {texts.map((clip) => (
        <Sequence
          key={clip.id}
          from={timeToFrame(clip.startTime, fps)}
          durationInFrames={clipDurationFrames(clip, fps)}
          layout="none"
        >
          <AbsoluteFill style={{ zIndex: 50 }}>
            <RemotionTextClip clip={clip} />
          </AbsoluteFill>
        </Sequence>
      ))}

      {overlays.map((clip) => (
        <Sequence
          key={clip.id}
          from={timeToFrame(clip.startTime, fps)}
          durationInFrames={clipDurationFrames(clip, fps)}
          layout="none"
        >
          <AbsoluteFill style={{ zIndex: 55 }}>
            <RemotionOverlayClip clip={clip} />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
