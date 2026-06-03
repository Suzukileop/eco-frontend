'use client';

import { useCallback, useRef } from 'react';

interface MediaRotationHandleProps {
  rotation: number;
  disabled?: boolean;
  onRotationChange: (deg: number) => void;
  onInteractionStart?: () => void;
}

function normalizeDeg(deg: number): number {
  let d = deg % 360;
  if (d > 180) d -= 360;
  if (d < -180) d += 360;
  return Math.round(d * 10) / 10;
}

export function MediaRotationHandle({
  rotation,
  disabled = false,
  onRotationChange,
  onInteractionStart,
}: MediaRotationHandleProps) {
  const dialRef = useRef<HTMLDivElement>(null);

  const startDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (disabled) return;
      onInteractionStart?.();
      const el = dialRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const startAngle = Math.atan2(clientY - cy, clientX - cx) * (180 / Math.PI);
      const startRot = rotation;

      const onMove = (ev: MouseEvent) => {
        const angle = Math.atan2(ev.clientY - cy, ev.clientX - cx) * (180 / Math.PI);
        onRotationChange(normalizeDeg(startRot + (angle - startAngle)));
      };
      const onUp = () => {
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
      };
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
    },
    [disabled, onInteractionStart, onRotationChange, rotation]
  );

  const indicatorDeg = rotation;

  return (
    <div
      className="pointer-events-auto absolute left-1/2 top-full z-50 mt-3 flex -translate-x-1/2 flex-col items-center gap-1"
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="h-5 w-px bg-blue-400" aria-hidden />
      <div
        ref={dialRef}
        role="slider"
        aria-label="Pivoter le média"
        aria-valuenow={rotation}
        tabIndex={disabled ? -1 : 0}
        className={`relative h-8 w-8 rounded-full border-2 border-white bg-blue-500 shadow-lg ${
          disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'
        }`}
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          startDrag(e.clientX, e.clientY);
        }}
        title="Pivoter"
      >
        <div
          className="absolute left-1/2 top-[2px] h-2 w-0.5 -translate-x-1/2 rounded-full bg-white"
          style={{ transform: `translateX(-50%) rotate(${indicatorDeg}deg)`, transformOrigin: '50% 100%' }}
        />
        <svg
          className="absolute inset-0 m-auto text-white/90"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          aria-hidden
        >
          <path d="M21 12a9 9 0 1 1-9-9" />
          <path d="M21 3v6h-6" />
        </svg>
      </div>
    </div>
  );
}
