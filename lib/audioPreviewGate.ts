/** Bloque la lecture timeline sur un clip pendant l’aperçu panneau droit. */
let previewClipId: string | null = null;

export function setPanelPreviewClipId(id: string | null): void {
  previewClipId = id;
}

export function getPanelPreviewClipId(): string | null {
  return previewClipId;
}

export function isPanelPreviewActiveFor(clipId: string): boolean {
  return previewClipId === clipId;
}
