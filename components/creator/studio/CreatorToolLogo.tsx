'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  findCreatorToolPreset,
  getCreatorToolIconCandidates,
  type CreatorToolPreset,
} from '@/components/creator/studio/creator-profile-tools-catalog';

type CreatorToolLogoProps = {
  label: string;
  preset?: CreatorToolPreset | null;
  size?: number;
  className?: string;
  /** Hex background the chip sits on — used to pick a readable icon color. */
  bgColor?: string;
};

function hexLuminance(hex: string): number {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return 0.5;
  const r = parseInt(full.slice(0, 2), 16) / 255;
  const g = parseInt(full.slice(2, 4), 16) / 255;
  const b = parseInt(full.slice(4, 6), 16) / 255;
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/** Swap the color segment in a simpleicons.org URL. */
function recolorSimpleIcon(url: string, hex: string): string {
  return url.replace(/simpleicons\.org\/([^/]+)\/[0-9a-fA-F]{3,8}($|\?)/, `simpleicons.org/$1/${hex.replace('#', '')}$2`);
}

export function CreatorToolLogo({ label, preset, size = 20, className = '', bgColor }: CreatorToolLogoProps) {
  const resolvedPreset = preset ?? findCreatorToolPreset(label);
  const { urls, monochrome } = useMemo(
    () => (resolvedPreset ? getCreatorToolIconCandidates(resolvedPreset) : { urls: [], monochrome: true }),
    [resolvedPreset]
  );
  const [urlIndex, setUrlIndex] = useState(0);

  useEffect(() => {
    setUrlIndex(0);
  }, [resolvedPreset?.id, label]);

  // Pick a readable icon color based on the chip background.
  const isDarkBg = bgColor ? hexLuminance(bgColor) < 0.35 : false;

  const iconUrl = useMemo(() => {
    const raw = urls[urlIndex] ?? null;
    if (!raw || !bgColor) return raw;
    // Recolor simple-icons CDN URLs to contrast with the background.
    if (raw.includes('simpleicons.org')) {
      return recolorSimpleIcon(raw, isDarkBg ? 'f4f3ef' : '17171b');
    }
    return raw;
  }, [urls, urlIndex, bgColor, isDarkBg]);

  // For monochrome SVGs from jsdelivr, invert when background is dark.
  const needsInvert = monochrome && !bgColor;
  const forceInvert = monochrome && !!bgColor && isDarkBg;
  const forceBright = monochrome && !!bgColor && !isDarkBg;

  const shell = `flex shrink-0 items-center justify-center overflow-hidden rounded-md ${
    !bgColor && monochrome ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-transparent'
  } ${className}`;

  const imageClass = [
    'h-full w-full object-contain',
    monochrome ? 'p-0.5' : 'p-0',
    needsInvert ? 'dark:invert dark:brightness-200' : '',
    forceInvert ? 'invert brightness-200' : '',
    forceBright ? '' : '',
  ].join(' ').trim();

  if (iconUrl && urlIndex < urls.length) {
    return (
      <span className={shell} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconUrl}
          alt=""
          width={size}
          height={size}
          className={imageClass}
          onError={() => setUrlIndex((current) => current + 1)}
        />
      </span>
    );
  }

  return (
    <span
      className={`${shell} text-[10px] font-bold uppercase`}
      style={{
        width: size,
        height: size,
        color: bgColor
          ? isDarkBg ? '#f4f3ef' : '#17171b'
          : undefined,
      }}
      aria-hidden
    >
      {label.trim().charAt(0) || '?'}
    </span>
  );
}
