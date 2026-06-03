'use client';

import { useEffect, useMemo, useState } from 'react';
import { getWaveformPeaksForWindow, pseudoWaveformPeaks } from '@/lib/audioWaveform';

/** Opacité légère selon le volume — une seule teinte (couleur de la piste). */
function barOpacity(amplitude: number, loading?: boolean): number {
  if (loading) return 0.35;
  return 0.42 + amplitude * 0.48;
}

function MirroredWaveformSvg({
  peaks,
  baseColor,
  gradientId,
  loading,
}: {
  peaks: number[];
  baseColor: string;
  gradientId: string;
  loading?: boolean;
}) {
  const n = peaks.length;
  const mid = 16;
  const maxH = 14;

  return (
    <svg
      className="absolute inset-0 h-full w-full pointer-events-none"
      preserveAspectRatio="none"
      viewBox={`0 0 ${n} 32`}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={baseColor} stopOpacity={0.12} />
          <stop offset="50%" stopColor={baseColor} stopOpacity={0.28} />
          <stop offset="100%" stopColor={baseColor} stopOpacity={0.12} />
        </linearGradient>
      </defs>
      {/* enveloppe douce sous les barres */}
      <path
        d={buildEnvelopePath(peaks, n, mid, maxH)}
        fill={`url(#${gradientId})`}
        opacity={loading ? 0.2 : 0.5}
      />
      <line x1={0} y1={mid} x2={n} y2={mid} stroke={baseColor} strokeOpacity={0.12} strokeWidth={0.12} />
      {peaks.map((v, i) => {
        const h = Math.max(0.8, v * maxH);
        return (
          <rect
            key={i}
            x={i + 0.05}
            y={mid - h}
            width={0.85}
            height={h * 2}
            fill={baseColor}
            opacity={barOpacity(v, loading)}
            rx={0.35}
          />
        );
      })}
    </svg>
  );
}

function buildEnvelopePath(peaks: number[], n: number, mid: number, maxH: number): string {
  if (n < 2) return '';
  const step = n / (peaks.length - 1 || 1);
  let d = `M 0 ${mid}`;
  for (let i = 0; i < peaks.length; i++) {
    const x = i * step;
    const h = Math.max(0.5, peaks[i] * maxH);
    d += ` L ${x} ${mid - h}`;
  }
  for (let i = peaks.length - 1; i >= 0; i--) {
    const x = i * step;
    const h = Math.max(0.5, peaks[i] * maxH);
    d += ` L ${x} ${mid + h}`;
  }
  d += ' Z';
  return d;
}

export function AudioWaveform({
  clipId,
  url,
  widthPx,
  trimStart = 0,
  visibleDuration,
  baseColor,
}: {
  clipId: string;
  url?: string;
  widthPx: number;
  trimStart?: number;
  visibleDuration: number;
  baseColor: string;
}) {
  const barCount = useMemo(
    () => Math.max(28, Math.min(320, Math.floor(widthPx / 2.5))),
    [widthPx]
  );

  const [peaks, setPeaks] = useState<number[] | null>(null);
  const [loading, setLoading] = useState(false);

  const fallback = useMemo(
    () => pseudoWaveformPeaks(clipId, barCount),
    [clipId, barCount]
  );

  useEffect(() => {
    if (!url) {
      setPeaks(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    getWaveformPeaksForWindow(url, barCount, trimStart, visibleDuration)
      .then((data) => {
        if (!cancelled) {
          setPeaks(data);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPeaks(null);
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [url, barCount, trimStart, visibleDuration]);

  const display = peaks ?? fallback;
  const gradientId = useMemo(
    () => `wf-${clipId.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 24)}`,
    [clipId]
  );

  return (
    <div className="absolute inset-x-0 bottom-0 top-[15px] overflow-hidden">
      <MirroredWaveformSvg
        peaks={display}
        baseColor={baseColor}
        gradientId={gradientId}
        loading={loading && !peaks}
      />
    </div>
  );
}
