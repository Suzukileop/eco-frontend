import type { CSSProperties } from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Composition } from '@/types/composition';
import type {
  ResolvedV1Transition,
  TransitionDirection,
  TransitionFamily,
} from '@/lib/studio/remotionTransitions';
import { clipLocalTimeAtTransition } from '@/lib/transitionApply';
import { RemotionBackgroundClip } from '@/remotion/layers/RemotionBackgroundClip';

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

function incomingStyle(
  family: TransitionFamily,
  direction: TransitionDirection,
  p: number
): CSSProperties {
  switch (family) {
    case 'slide': {
      const off = (1 - p) * 100;
      const transform =
        direction === 'left'
          ? `translateX(${-off}%)`
          : direction === 'up'
            ? `translateY(${-off}%)`
            : direction === 'down'
              ? `translateY(${off}%)`
              : `translateX(${off}%)`;
      return { transform, opacity: 1 };
    }
    case 'zoom':
      return { opacity: p, transform: `scale(${1.18 - 0.18 * p})` };
    case 'glitch': {
      const jitter = (1 - p) * Math.sin(p * 38) * 1.6;
      return {
        opacity: clamp01(p * 1.25),
        transform: `translateX(${jitter}%)`,
        filter: `saturate(${1 + (1 - p) * 0.8}) contrast(${1 + (1 - p) * 0.3})`,
      };
    }
    case 'fade':
    default:
      return { opacity: p };
  }
}

function outgoingStyle(family: TransitionFamily, p: number): CSSProperties {
  if (family === 'fade' || family === 'zoom' || family === 'glitch') {
    return { opacity: 1 - p };
  }
  return { opacity: 1 };
}

interface RemotionV1TransitionProps {
  transition: ResolvedV1Transition;
  composition: Composition;
  laneMuted?: Record<string, boolean>;
}

/**
 * Transition V1 en format preview uniforme (canvas entier, contain).
 * Les clips sous-jacents sont masqués pendant la fenêtre — seule cette couche est visible.
 */
export function RemotionV1Transition({
  transition,
  composition,
  laneMuted,
}: RemotionV1TransitionProps) {
  const relFrame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = clamp01(relFrame / Math.max(1, transition.durationFrames - 1));
  const currentTime = transition.window.startTime + relFrame / fps;
  const fromLocal = clipLocalTimeAtTransition(
    transition.fromClip,
    'from',
    transition.window,
    currentTime
  );
  const toLocal = clipLocalTimeAtTransition(
    transition.toClip,
    'to',
    transition.window,
    currentTime
  );
  const { family, direction } = transition;
  const outStyle = outgoingStyle(family, p);
  const inStyle = incomingStyle(family, direction, p);

  return (
    <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none' }}>
      <AbsoluteFill style={outStyle}>
        <RemotionBackgroundClip
          clip={transition.fromClip}
          composition={composition}
          laneMuted={laneMuted}
          fillFrame
          pinnedLocalTimeSec={fromLocal}
        />
      </AbsoluteFill>
      <AbsoluteFill style={inStyle}>
        <RemotionBackgroundClip
          clip={transition.toClip}
          composition={composition}
          laneMuted={laneMuted}
          fillFrame
          pinnedLocalTimeSec={toLocal}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
