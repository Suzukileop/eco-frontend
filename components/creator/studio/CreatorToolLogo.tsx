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
};

export function CreatorToolLogo({ label, preset, size = 20, className = '' }: CreatorToolLogoProps) {
  const resolvedPreset = preset ?? findCreatorToolPreset(label);
  const { urls, monochrome } = useMemo(
    () => (resolvedPreset ? getCreatorToolIconCandidates(resolvedPreset) : { urls: [], monochrome: true }),
    [resolvedPreset]
  );
  const [urlIndex, setUrlIndex] = useState(0);

  useEffect(() => {
    setUrlIndex(0);
  }, [resolvedPreset?.id, label]);

  const iconUrl = urls[urlIndex] ?? null;
  const shell = `flex shrink-0 items-center justify-center overflow-hidden rounded-md ${
    monochrome ? 'bg-neutral-100 dark:bg-neutral-800' : 'bg-transparent'
  } ${className}`;
  const imageClass = `h-full w-full object-contain ${monochrome ? 'p-0.5 dark:invert dark:brightness-200' : 'p-0'}`;

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
      className={`${shell} text-[10px] font-bold uppercase text-neutral-600 dark:text-neutral-300`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      {label.trim().charAt(0) || '?'}
    </span>
  );
}
