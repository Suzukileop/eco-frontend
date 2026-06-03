'use client';

import { CLIP_SELECTION } from '@/lib/timelineTheme';

/** Poignée trim CapCut : pilule cyan centrée sur le bord gauche/droit. */
export function TimelineTrimHandle({
  side,
  visible,
  junctionInset = 0,
  onMouseDown,
}: {
  side: 'left' | 'right';
  visible: boolean;
  /** Décale la poignée vers l’intérieur quand un voisin touche la jonction (transition au-dessus). */
  junctionInset?: number;
  onMouseDown: (e: React.MouseEvent) => void;
}) {
  const edgeClass =
    side === 'left'
      ? junctionInset > 0
        ? ''
        : 'left-0 -translate-x-1/2'
      : junctionInset > 0
        ? ''
        : 'right-0 translate-x-1/2';
  const edgeStyle =
    side === 'left' && junctionInset > 0
      ? { left: junctionInset }
      : side === 'right' && junctionInset > 0
        ? { right: junctionInset }
        : undefined;

  return (
    <button
      type="button"
      className={`absolute top-1/2 z-20 flex -translate-y-1/2 cursor-ew-resize items-center justify-center p-1 transition-opacity duration-150 ${edgeClass} ${
        visible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0 group-hover:pointer-events-auto group-hover:opacity-90'
      }`}
      style={{ background: 'transparent', border: 'none', ...edgeStyle }}
      title={side === 'left' ? 'Ajuster le début' : 'Ajuster la fin'}
      onMouseDown={onMouseDown}
      aria-label={side === 'left' ? 'Ajuster le début' : 'Ajuster la fin'}
    >
      <span
        className="block shrink-0 rounded-full shadow-sm transition-colors duration-150 hover:brightness-110"
        style={{
          width: CLIP_SELECTION.handlePillWidth,
          height: CLIP_SELECTION.handlePillHeight,
          backgroundColor: visible
            ? CLIP_SELECTION.handleColor
            : 'rgba(34, 211, 238, 0.55)',
        }}
        aria-hidden
      />
    </button>
  );
}
