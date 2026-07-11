import { useMemo } from 'react';
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from 'remotion';
import type { StudioCompositionInputProps } from '@/lib/studio/remotionBridge';
import { timeToFrame, isClipLaneVisible, getClipLaneIndex } from '@/lib/studio/remotionBridge';
import { RemotionBackgroundClip } from '@/remotion/layers/RemotionBackgroundClip';
import { RemotionTextClip } from '@/remotion/layers/RemotionTextClip';
import { RemotionOverlayClip } from '@/remotion/layers/RemotionOverlayClip';
import { RemotionV1Transition } from '@/remotion/layers/RemotionV1Transition';
import { resolveV1Transitions } from '@/lib/studio/remotionTransitions';

function clipDurationFrames(
  clip: { startTime: number; endTime: number },
  fps: number
): number {
  return Math.max(1, timeToFrame(clip.endTime - clip.startTime, fps));
}

export const StudioComposition: React.FC<StudioCompositionInputProps> = ({
  composition,
  laneMuted,
  laneHidden,
  trackHidden,
  skipCssTransitions = false,
  v1GlCoverReady = false,
}) => {
  const { fps } = useVideoConfig();
  const frame = useCurrentFrame();
  const exitTailFrames = skipCssTransitions ? 1 : 0;

  const bg = useMemo(
    () => composition.tracks.background ?? [],
    [composition.tracks.background]
  );
  const texts = useMemo(() => composition.tracks.text ?? [], [composition.tracks.text]);
  const overlays = useMemo(
    () => composition.tracks.overlay ?? [],
    [composition.tracks.overlay]
  );

  // Z-order: background lane ascending (V1 bottom, V2+ top), then text, then overlay.
  const sortedBg = useMemo(
    () =>
      [...bg]
        .filter((c) => isClipLaneVisible(c, 'background', laneHidden, trackHidden))
        .sort(
          (a, b) =>
            getClipLaneIndex(a, 'background') - getClipLaneIndex(b, 'background') ||
            a.startTime - b.startTime
        ),
    [bg, laneHidden, trackHidden]
  );

  const visibleTexts = useMemo(
    () => texts.filter((c) => isClipLaneVisible(c, 'text', laneHidden, trackHidden)),
    [texts, laneHidden, trackHidden]
  );

  const visibleOverlays = useMemo(
    () => overlays.filter((c) => isClipLaneVisible(c, 'overlay', laneHidden, trackHidden)),
    [overlays, laneHidden, trackHidden]
  );

  // Match the pause renderer's stacking exactly:
  //   background → overlay MEDIA (video/image) → text → overlay STICKERS (emoji/text).
  // In pause, overlay media pixels come from the player (behind the DOM text layer),
  // while emoji/sticker content is drawn on top of the text.
  const overlayMedia = useMemo(
    () => visibleOverlays.filter((c) => Boolean(c.url)),
    [visibleOverlays]
  );
  const overlayStickers = useMemo(
    () => visibleOverlays.filter((c) => !c.url && Boolean(c.content)),
    [visibleOverlays]
  );

  // Transitions — UNIQUEMENT sur la piste principale V1, ignorées si V1 est masquée.
  const v1Transitions = useMemo(() => {
    const v1Hidden =
      (trackHidden?.background ?? false) || (laneHidden?.['background-0'] ?? false);
    if (v1Hidden) return [];
    return resolveV1Transitions(composition, fps);
  }, [composition, fps, laneHidden, trackHidden]);

  /** Masque les clips impliqués — la couche transition (GL ou CSS) couvre le canvas entier. */
  const hiddenDuringTransition = useMemo(() => {
    const ids = new Set<string>();
    for (const tr of v1Transitions) {
      const inWindow = frame >= tr.startFrame && frame < tr.endFrame + exitTailFrames;
      const hideForPreviewGl = !skipCssTransitions || v1GlCoverReady;
      if (inWindow && hideForPreviewGl) {
        ids.add(tr.fromClip.id);
        ids.add(tr.toClip.id);
      }
    }
    return ids;
  }, [v1Transitions, frame, skipCssTransitions, v1GlCoverReady, exitTailFrames]);

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
      {/* 1 — Background media (V1 bottom, V2+ above) */}
      {sortedBg.map((clip) => {
        if (hiddenDuringTransition.has(clip.id)) return null;
        return (
        <Sequence
          key={clip.id}
          from={timeToFrame(clip.startTime, fps)}
          durationInFrames={clipDurationFrames(clip, fps)}
          layout="none"
        >
          <AbsoluteFill style={{ zIndex: 1000 + getClipLaneIndex(clip, 'background') * 10 }}>
            <RemotionBackgroundClip
              clip={clip}
              composition={composition}
              laneMuted={laneMuted}
            />
          </AbsoluteFill>
        </Sequence>
        );
      })}

      {/* 1.5 — Transitions V1 : clip entrant superposé au clip sortant (au-dessus de
          la lane V1, sous les pistes overlay/texte). Preview === export. */}
      {!skipCssTransitions &&
        v1Transitions.map((tr) => (
        <Sequence
          key={`tr-${tr.id}`}
          from={tr.startFrame}
          durationInFrames={tr.durationFrames}
          layout="none"
        >
          <AbsoluteFill style={{ zIndex: 1005 }}>
            <RemotionV1Transition
              transition={tr}
              composition={composition}
              laneMuted={laneMuted}
            />
          </AbsoluteFill>
        </Sequence>
        ))}

      {/* 2 — Overlay MEDIA (video / image) : above background, below text */}
      {overlayMedia.map((clip) => (
        <Sequence
          key={clip.id}
          from={timeToFrame(clip.startTime, fps)}
          durationInFrames={clipDurationFrames(clip, fps)}
          layout="none"
        >
          <AbsoluteFill style={{ zIndex: 2000 + getClipLaneIndex(clip, 'overlay') * 10 }}>
            <RemotionOverlayClip
              clip={clip}
              composition={composition}
              laneMuted={laneMuted}
            />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* 3 — Text : above all media */}
      {visibleTexts.map((clip) => (
        <Sequence
          key={clip.id}
          from={timeToFrame(clip.startTime, fps)}
          durationInFrames={clipDurationFrames(clip, fps)}
          layout="none"
        >
          <AbsoluteFill style={{ zIndex: 3000 + getClipLaneIndex(clip, 'text') * 10 }}>
            <RemotionTextClip clip={clip} />
          </AbsoluteFill>
        </Sequence>
      ))}

      {/* 4 — Overlay STICKERS (emoji / text content) : top-most, matches pause DOM layer */}
      {overlayStickers.map((clip) => (
        <Sequence
          key={clip.id}
          from={timeToFrame(clip.startTime, fps)}
          durationInFrames={clipDurationFrames(clip, fps)}
          layout="none"
        >
          <AbsoluteFill style={{ zIndex: 4000 + getClipLaneIndex(clip, 'overlay') * 10 }}>
            <RemotionOverlayClip
              clip={clip}
              composition={composition}
              laneMuted={laneMuted}
            />
          </AbsoluteFill>
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
