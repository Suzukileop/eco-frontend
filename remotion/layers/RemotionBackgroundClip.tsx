import type { CSSProperties } from 'react';
import { Video, Img, useVideoConfig } from 'remotion';
import type { Clip, Composition } from '@/types/composition';
import { getAspectRatio } from '@/lib/formatPresets';
import { resolveMediaFilterCss } from '@/lib/studio/mediaFilterPresets';
import { mediaFrameHeightPx } from '@/lib/studio/mediaDimensions';

interface RemotionBackgroundClipProps {
  clip: Clip;
  composition: Composition;
}

/** Média fond — position / zoom alignés sur l’éditeur (x, y, boxWidthPct, mediaScale…). */
export function RemotionBackgroundClip({ clip, composition }: RemotionBackgroundClipProps) {
  if (!clip.url) return null;

  const { width: canvasW, height: canvasH } = useVideoConfig();
  const ratio = getAspectRatio(
    composition.format,
    composition.customAspectW,
    composition.customAspectH
  );

  const xPct = clip.x ?? 50;
  const yPct = clip.y ?? 50;
  const boxWidthPct = clip.boxWidthPct ?? 100;
  const mediaScale = clip.mediaScale ?? 1;
  const offsetX = clip.mediaOffsetX ?? 0;
  const offsetY = clip.mediaOffsetY ?? 0;
  const mediaRotation = clip.mediaRotation ?? 0;
  const trimStart = clip.trimStart ?? 0;

  const boxW = (canvasW * boxWidthPct) / 100;
  const boxH = mediaFrameHeightPx(boxW, clip, ratio.h / ratio.w);

  const frameStyle: CSSProperties = {
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

  return (
    <div style={frameStyle}>
      <div style={innerStyle}>
        {clip.type === 'video' ? (
          <Video
            src={clip.url}
            startFrom={Math.round(trimStart * (composition.fps ?? 30))}
            style={mediaStyle}
            muted
            volume={0}
          />
        ) : (
          <Img src={clip.url} style={mediaStyle} />
        )}
      </div>
    </div>
  );
}
