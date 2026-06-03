import type { Clip } from '@/types/composition';
import { RemotionTextClip } from '@/remotion/layers/RemotionTextClip';

export function RemotionOverlayClip({ clip }: { clip: Clip }) {
  if (clip.type === 'text' || clip.content) {
    return <RemotionTextClip clip={clip} />;
  }

  if (!clip.url) return null;

  return (
    <img
      src={clip.url}
      alt=""
      style={{
        position: 'absolute',
        left: `${clip.x ?? 50}%`,
        top: `${clip.y ?? 50}%`,
        transform: `translate(-50%, -50%) rotate(${clip.mediaRotation ?? 0}deg)`,
        width: `${clip.boxWidthPct ?? 40}%`,
        opacity: clip.opacity ?? 1,
      }}
    />
  );
}
