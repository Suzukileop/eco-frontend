import type { Clip, Composition } from '@/types/composition';
import { buildRemotionOverlayStyle } from '@/lib/previewTextLayout';
import { RemotionBackgroundClip } from '@/remotion/layers/RemotionBackgroundClip';

interface RemotionOverlayClipProps {
  clip: Clip;
  composition: Composition;
  laneMuted?: Record<string, boolean>;
}

/**
 * Overlay track clip — mirrors edit-mode StudioOverlayHitZone:
 * - content-only (emoji/sticker) → buildRemotionOverlayStyle
 * - url (image/video) → RemotionBackgroundClip (full media transforms)
 */
export function RemotionOverlayClip({ clip, composition, laneMuted }: RemotionOverlayClipProps) {
  if (!clip.url && clip.content) {
    return (
      <div style={buildRemotionOverlayStyle(clip)}>
        {(clip.content ?? '').trim() || '\u00A0'}
      </div>
    );
  }

  if (!clip.url) return null;

  return (
    <RemotionBackgroundClip clip={clip} composition={composition} laneMuted={laneMuted} />
  );
}
