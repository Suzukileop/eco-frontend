import type { CSSProperties } from 'react';
import { Video, Img, useCurrentFrame, useVideoConfig } from 'remotion';
import type { Clip, Composition } from '@/types/composition';
import { getClipBackgroundLane } from '@/lib/backgroundLanes';
import { resolveMediaFilterCss } from '@/lib/studio/mediaFilterPresets';
import { mediaFrameHeightPx } from '@/lib/studio/mediaDimensions';

interface RemotionBackgroundClipProps {
  clip: Clip;
  composition: Composition;
  laneMuted?: Record<string, boolean>;
  /** Rendu image figée (poster) au lieu de la vidéo — utilisé hors transition. */
  posterOnly?: boolean;
  /** Remplit le parent (cadre transition) au lieu du positionnement canvas global. */
  fillFrame?: boolean;
  /** Frame vidéo figée à un instant local (export transition CapCut). */
  pinnedLocalTimeSec?: number;
}

/** Média fond — position / zoom alignés sur l’éditeur (x, y, boxWidthPct, mediaScale…). */
export function RemotionBackgroundClip({
  clip,
  composition,
  laneMuted,
  posterOnly = false,
  fillFrame = false,
  pinnedLocalTimeSec,
}: RemotionBackgroundClipProps) {
  const { width: canvasW, fps } = useVideoConfig();
  const relFrame = useCurrentFrame();

  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? 50;
  const boxWidthPct = clip.boxWidthPct ?? 100;
  const mediaScale = clip.mediaScale ?? 1;
  const offsetX = clip.mediaOffsetX ?? 0;
  const offsetY = clip.mediaOffsetY ?? 0;
  const mediaRotation = clip.mediaRotation ?? 0;
  const trimStart = clip.trimStart ?? 0;

  const boxW = (canvasW * boxWidthPct) / 100;
  const boxH = mediaFrameHeightPx(boxW, clip);

  const frameStyle: CSSProperties = fillFrame
    ? {
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        opacity: clip.opacity ?? 1,
      }
    : {
        position: 'absolute',
        left: `${xPct}%`,
        top: `${yPct}%`,
        width: boxW,
        height: boxH,
        transform: 'translate(-50%, -50%)',
        overflow: 'hidden',
        opacity: clip.opacity ?? 1,
      };

  const innerStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    transform: `translate(${offsetX}%, ${offsetY}%) scale(${mediaScale}) rotate(${mediaRotation}deg)`,
    transformOrigin: 'center center',
  };

  const mediaStyle: CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    filter: resolveMediaFilterCss(clip.filterPreset) || undefined,
  };

  const lane = getClipBackgroundLane(clip);
  const laneSilent = laneMuted?.[`background-${lane}`] ?? false;
  const clipSilent = clip.muted ?? false;
  const silent = laneSilent || clipSilent;
  const videoVolume = silent ? 0 : Math.min(1, Math.max(0, clip.volume ?? 1));

  if (!clip.url) return null;

  const posterSrc = clip.thumbnail ?? clip.url;
  const usePinnedVideo =
    clip.type === 'video' && pinnedLocalTimeSec != null && !posterOnly;
  const videoStartFrom = usePinnedVideo
    ? Math.max(0, Math.round(pinnedLocalTimeSec * fps) - relFrame)
    : Math.round(trimStart * fps);

  return (
    <div style={frameStyle}>
      <div style={innerStyle}>
        {clip.type === 'video' && !posterOnly ? (
          <Video
            src={clip.url}
            startFrom={videoStartFrom}
            style={mediaStyle}
            muted={silent}
            volume={videoVolume}
          />
        ) : (
          <Img src={clip.type === 'video' ? posterSrc : clip.url} style={mediaStyle} />
        )}
      </div>
    </div>
  );
}
