'use client';

/** Repères d’accrochage (alignés sur KonvaSnapGuidesLayer) — visibles pendant drag zone texte. */
import { useEditorUiStore } from '@/stores/editorUiStore';

interface TextZoneSnapGuidesOverlayProps {
  canvasWidth: number;
  canvasHeight: number;
}

export function TextZoneSnapGuidesOverlay({
  canvasWidth,
  canvasHeight,
}: TextZoneSnapGuidesOverlayProps) {
  const guides = useEditorUiStore((s) => s.konvaSnapGuides);
  const hasGuides = guides.vertical.length > 0 || guides.horizontal.length > 0;
  if (!hasGuides) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[45] overflow-visible" aria-hidden>
      {guides.vertical.map((x) => (
        <div
          key={`v-${x}`}
          className="absolute top-0 w-px border-l border-dashed border-cyan-400"
          style={{ left: x, height: canvasHeight }}
        />
      ))}
      {guides.horizontal.map((y) => (
        <div
          key={`h-${y}`}
          className="absolute left-0 h-px border-t border-dashed border-cyan-400"
          style={{ top: y, width: canvasWidth }}
        />
      ))}
    </div>
  );
}
