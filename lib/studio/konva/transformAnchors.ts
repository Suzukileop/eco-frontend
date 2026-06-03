import type { CornerResizeEdge } from '@/lib/studio/canvasPointer';

/** Poignées texte : 4 coins + milieux gauche/droite (comme CapCut). */
export const TEXT_TRANSFORM_ANCHORS = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right',
  'middle-left',
  'middle-right',
] as const;

/** Stickers / médias : coins + milieux + haut/bas. */
export const MEDIA_TRANSFORM_ANCHORS = [
  ...TEXT_TRANSFORM_ANCHORS,
  'top-center',
  'bottom-center',
] as const;

export function isTextWidthAnchor(anchor: string | null | undefined): boolean {
  return anchor === 'middle-left' || anchor === 'middle-right';
}

export function isCornerAnchor(anchor: string | null | undefined): boolean {
  return resolveKonvaCornerAnchor(anchor) != null;
}

/** Konva peut renvoyer un nom composite ; on extrait le coin standard. */
export function resolveKonvaCornerAnchor(
  anchor: string | null | undefined
): (typeof TEXT_TRANSFORM_ANCHORS)[number] | null {
  if (!anchor) return null;
  for (const name of [
    'top-left',
    'top-right',
    'bottom-left',
    'bottom-right',
  ] as const) {
    if (anchor.includes(name)) return name;
  }
  return null;
}

export function anchorNameIncludes(name: string, token: string): boolean {
  return name.includes(token);
}

/** Poignée Konva Transformer → coin logique (nw/ne/sw/se). */
export const KONVA_ANCHOR_TO_CORNER: Record<string, CornerResizeEdge> = {
  'top-left': 'nw',
  'top-right': 'ne',
  'bottom-left': 'sw',
  'bottom-right': 'se',
};

export function konvaAnchorToCorner(anchor: string | null | undefined): CornerResizeEdge | null {
  const resolved = resolveKonvaCornerAnchor(anchor);
  if (!resolved) return null;
  return KONVA_ANCHOR_TO_CORNER[resolved] ?? null;
}
