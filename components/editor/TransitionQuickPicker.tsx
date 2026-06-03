'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { getQuickGlTransitions } from '@/lib/glTransitions';

const PICKER_Z = 320;
/** Hauteur estimée du panneau (pour choisir au-dessus ou en dessous). */
const PICKER_EST_HEIGHT = 200;

const QUICK_THUMB: Record<string, string> = {
  'basic-cut': 'linear-gradient(135deg,#374151 50%,#1f2937 50%)',
  fade: 'linear-gradient(90deg,#1e3a5f,#4a5568)',
  crossZoom: 'radial-gradient(circle at center,#2d3748 20%,#1a202c 80%)',
  cube: 'linear-gradient(135deg,#4c51bf,#2d3748)',
  GlitchMemories: 'repeating-linear-gradient(90deg,#1a1a2e,#16213e 4px,#0f3460 8px)',
  DreamyZoom: 'radial-gradient(ellipse at center,#553c9a,#1a202c)',
  directionalwarp: 'linear-gradient(120deg,#2b6cb0,#1a365d)',
  burn: 'linear-gradient(180deg,#f6ad55,#c53030)',
  circleopen: 'radial-gradient(circle at center,transparent 30%,#2d3748 31%)',
};

export function TransitionQuickPicker({
  anchorRect,
  selectedGlName,
  onSelectGlName,
  onOpenFullCatalog,
  onClose,
}: {
  anchorRect: DOMRect;
  selectedGlName: string;
  onSelectGlName: (glName: string) => void;
  onOpenFullCatalog: () => void;
  onClose: () => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const presets = getQuickGlTransitions();
  const [mounted, setMounted] = useState(false);
  const [placement, setPlacement] = useState<'above' | 'below'>('above');

  useEffect(() => {
    setMounted(true);
  }, []);

  useLayoutEffect(() => {
    const spaceAbove = anchorRect.top;
    const spaceBelow = window.innerHeight - anchorRect.bottom;
    setPlacement(
      spaceAbove >= PICKER_EST_HEIGHT || spaceAbove >= spaceBelow ? 'above' : 'below'
    );
  }, [anchorRect.top, anchorRect.bottom]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  if (!mounted) return null;

  const centerX = anchorRect.left + anchorRect.width / 2;
  const style: React.CSSProperties =
    placement === 'above'
      ? {
          position: 'fixed',
          left: centerX,
          top: anchorRect.top,
          transform: 'translate(-50%, calc(-100% - 8px))',
          zIndex: PICKER_Z,
        }
      : {
          position: 'fixed',
          left: centerX,
          top: anchorRect.bottom,
          transform: 'translate(-50%, 8px)',
          zIndex: PICKER_Z,
        };

  return createPortal(
    <div
      ref={rootRef}
      style={style}
      className="pointer-events-auto"
      onMouseDown={(e) => e.stopPropagation()}
      role="dialog"
      aria-label="Choisir une transition"
    >
      <div className="w-[min(92vw,320px)] rounded-lg border border-gray-600 bg-gray-900/98 p-2 shadow-xl shadow-black/50">
        <p className="mb-1.5 px-0.5 text-[9px] font-semibold uppercase tracking-wide text-gray-400">
          Choisir une transition
        </p>
        <div className="grid grid-cols-4 gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              title={preset.label}
              onClick={() => onSelectGlName(preset.name)}
              className={`overflow-hidden rounded-md border text-left transition-all hover:scale-[1.03] ${
                selectedGlName === preset.name
                  ? 'border-blue-400 ring-1 ring-blue-500/80'
                  : 'border-gray-700 hover:border-gray-500'
              }`}
            >
              <div
                className="relative aspect-square w-full"
                style={{
                  background: QUICK_THUMB[preset.name] ?? 'linear-gradient(135deg,#374151,#1f2937)',
                }}
              />
              <p className="truncate px-0.5 py-0.5 text-center text-[8px] text-gray-300">
                {preset.label}
              </p>
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={onOpenFullCatalog}
          className="mt-2 w-full rounded-md border border-gray-600 py-1.5 text-[10px] font-medium text-blue-300 hover:bg-gray-800"
        >
          Tous les effets dans le panneau →
        </button>
      </div>
    </div>,
    document.body
  );
}
