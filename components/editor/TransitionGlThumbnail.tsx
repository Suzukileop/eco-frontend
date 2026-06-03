'use client';

import { useEffect, useRef, useState } from 'react';
import { formatGlTransitionLabel } from '@/lib/glTransitions';
import { requestGlThumbnail, getCachedGlThumbnail } from '@/lib/glTransitionThumbnails';

export function TransitionGlThumbnail({
  glName,
  label,
  fromUrl,
  toUrl,
  selected,
  disabled,
  onSelect,
}: {
  glName: string;
  label?: string;
  fromUrl?: string;
  toUrl?: string;
  selected?: boolean;
  disabled?: boolean;
  onSelect: () => void;
}) {
  const rootRef = useRef<HTMLButtonElement>(null);
  const [thumbUrl, setThumbUrl] = useState<string | null>(
    () => getCachedGlThumbnail(glName, fromUrl, toUrl) ?? null
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const cached = getCachedGlThumbnail(glName, fromUrl, toUrl);
    if (cached) {
      setThumbUrl(cached);
      return;
    }
    setThumbUrl(null);
  }, [glName, fromUrl, toUrl]);

  useEffect(() => {
    const el = rootRef.current;
    if (!el || thumbUrl) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.some((e) => e.isIntersecting);
        if (!visible) return;
        setLoading(true);
        requestGlThumbnail(glName, fromUrl, toUrl)
          .then((url) => {
            if (url) setThumbUrl(url);
          })
          .finally(() => setLoading(false));
        observer.disconnect();
      },
      { rootMargin: '80px', threshold: 0.05 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [glName, fromUrl, toUrl, thumbUrl]);

  const displayLabel = label ?? formatGlTransitionLabel(glName);

  return (
    <button
      ref={rootRef}
      type="button"
      disabled={disabled}
      onClick={onSelect}
      title={glName}
      className={`group flex flex-col overflow-hidden rounded-md border text-left transition-all ${
        selected
          ? 'border-cyan-400/80 ring-1 ring-cyan-500/60'
          : 'border-[#333333] hover:border-[#505050]'
      } disabled:opacity-35`}
    >
      <div className="relative aspect-video w-full bg-[#0d0d0d]">
        {thumbUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={thumbUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                'linear-gradient(135deg,#1e3a5f 0%,#2c5282 48%,#c05621 52%,#9b2c2c 100%)',
            }}
          />
        )}
        {loading && !thumbUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="h-3 w-3 animate-pulse rounded-full bg-cyan-400/80" />
          </div>
        )}
      </div>
      <p
        className={`truncate px-1.5 py-1 text-[9px] leading-tight ${
          selected ? 'text-cyan-200' : 'text-neutral-400 group-hover:text-neutral-200'
        }`}
      >
        {displayLabel}
      </p>
    </button>
  );
}
