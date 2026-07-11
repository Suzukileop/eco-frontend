'use client';

import { useState } from 'react';

interface CapCutRangeSliderProps {
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  /** Largeur du slider (ex. 6rem, 96px). */
  width?: string;
  ariaLabel: string;
  title?: string;
  /** Pouce visible uniquement au survol / focus / drag (barre timeline). */
  revealThumbOnInteraction?: boolean;
}

export function CapCutRangeSlider({
  min,
  max,
  step,
  value,
  onChange,
  width = '6rem',
  ariaLabel,
  title,
  revealThumbOnInteraction = true,
}: CapCutRangeSliderProps) {
  const [dragging, setDragging] = useState(false);
  const span = max - min;
  const fillPct = span > 0 ? ((value - min) / span) * 100 : 0;

  return (
    <div
      className={[
        'preview-zoom-slider-wrap capcut-range-slider shrink-0',
        revealThumbOnInteraction ? 'capcut-range-slider--reveal-thumb' : '',
        dragging ? 'is-active' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      style={
        {
          width,
          '--zoom-fill': `${fillPct}%`,
        } as React.CSSProperties
      }
      title={title}
    >
      <div className="preview-zoom-slider-rail" aria-hidden />
      <div className="preview-zoom-slider-fill" aria-hidden />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onBlur={() => setDragging(false)}
        className={`preview-zoom-slider appearance-none ${dragging ? 'is-dragging' : ''}`}
        aria-label={ariaLabel}
      />
    </div>
  );
}
