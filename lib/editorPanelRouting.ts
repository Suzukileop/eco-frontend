import type { Clip, Composition } from '@/types/composition';

export const EDITOR_PANEL_TABS = ['TEXTE', 'AUDIO', 'IMAGE', 'VIDÉO', 'OV', 'TRANS'] as const;
export type EditorPanelTab = (typeof EDITOR_PANEL_TABS)[number];

export function findClipInComposition(
  composition: Composition,
  clipId: string
): Clip | undefined {
  const { tracks } = composition;
  return (
    tracks.background.find((c) => c.id === clipId) ??
    tracks.text.find((c) => c.id === clipId) ??
    tracks.audio.find((c) => c.id === clipId) ??
    tracks.overlay.find((c) => c.id === clipId) ??
    tracks.voiceover.find((c) => c.id === clipId)
  );
}

/** Onglet panneau droit correspondant au clip sélectionné sur la timeline. */
export function resolveEditorPanelTabForClip(
  composition: Composition,
  clipId: string
): EditorPanelTab | null {
  const { tracks } = composition;
  if (tracks.text.some((c) => c.id === clipId)) return 'TEXTE';
  const ov = tracks.overlay.find((c) => c.id === clipId);
  if (ov) {
    if (ov.type === 'video') return 'VIDÉO';
    if (ov.type === 'image' || ov.url) return 'IMAGE';
    return 'OV';
  }
  if (tracks.audio.some((c) => c.id === clipId)) return 'AUDIO';
  if (tracks.voiceover.some((c) => c.id === clipId)) return 'AUDIO';
  const bg = tracks.background.find((c) => c.id === clipId);
  if (bg) return bg.type === 'video' ? 'VIDÉO' : 'IMAGE';
  return null;
}
