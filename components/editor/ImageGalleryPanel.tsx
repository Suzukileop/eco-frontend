'use client';

import { useCallback, useEffect, useState, type MouseEvent } from 'react';

export interface GalleryImageItem {
  id: string;
  url: string;
  name: string;
}

function filenameFromUrl(url: string, fallback: string): string {
  try {
    const path = new URL(url, 'https://local.invalid').pathname;
    const base = path.split('/').filter(Boolean).pop();
    if (base) return decodeURIComponent(base);
  } catch {
    const parts = url.split('/').filter(Boolean);
    const last = parts.pop();
    if (last) return decodeURIComponent(last.split('?')[0] ?? last);
  }
  return fallback;
}

export function galleryItemFromUrl(
  url: string,
  id: string,
  fallbackName: string
): GalleryImageItem {
  return {
    id,
    url,
    name: filenameFromUrl(url, fallbackName),
  };
}

function CheckAddedIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function ExpandPreviewIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M15 3h6v6" />
      <path d="m21 3-7 7" />
      <path d="m3 21 7-7" />
      <path d="M9 21H3v-6" />
    </svg>
  );
}

function ImagePreviewLightbox({
  url,
  name,
  onClose,
}: {
  url: string;
  name: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center bg-black/75 p-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal
      aria-label={`Aperçu : ${name}`}
      onMouseDown={onClose}
    >
      <button
        type="button"
        className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white/90 transition-colors hover:bg-white/20"
        onClick={onClose}
        aria-label="Fermer l’aperçu"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
      <figure
        className="relative max-h-[88vh] max-w-[min(92vw,720px)]"
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={name}
          className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain shadow-2xl ring-1 ring-white/15"
        />
        <figcaption className="mt-2 truncate text-center text-xs text-white/70">
          {name}
        </figcaption>
      </figure>
    </div>
  );
}

function PlusAddIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      className={className}
      aria-hidden
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ImageGalleryCard({
  item,
  timelineCount,
  onAdd,
}: {
  item: GalleryImageItem;
  timelineCount: number;
  onAdd: () => void;
}) {
  const [previewOpen, setPreviewOpen] = useState(false);

  const openPreview = useCallback((e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreviewOpen(true);
  }, []);

  return (
    <>
      <div className="flex w-[124px] shrink-0 flex-col items-start gap-1.5">
        <div className="group relative w-full">
          <div className="rounded-xl bg-[#252528] px-2.5 py-1.5 transition-colors hover:bg-[#2c2c30]">
            {timelineCount > 0 && (
              <span className="absolute left-1.5 top-1.5 z-20 flex items-center gap-0.5 rounded-md bg-cyan-500 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white shadow-sm">
                <CheckAddedIcon className="h-2.5 w-2.5" />
                Ajouté{timelineCount > 1 ? ` ×${timelineCount}` : ''}
              </span>
            )}
            <button
              type="button"
              onClick={onAdd}
              className="relative block w-full cursor-pointer overflow-hidden rounded-lg"
              title="Ajouter à la timeline"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.url}
                alt={item.name}
                className="aspect-[4/5] h-[112px] w-full object-contain"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/35 group-hover:opacity-100">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500 text-white shadow-md">
                  <PlusAddIcon className="h-4 w-4" />
                </span>
              </div>
            </button>
            <button
              type="button"
              onClick={openPreview}
              className="absolute bottom-2 right-2 z-10 flex h-6 w-6 items-center justify-center rounded-md bg-black/55 text-white opacity-0 shadow-md ring-1 ring-white/20 transition-opacity hover:bg-black/70 group-hover:opacity-100"
              title="Aperçu"
              aria-label={`Aperçu de ${item.name}`}
            >
              <ExpandPreviewIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        <p
          className="w-full truncate text-left text-[10px] leading-tight text-neutral-400"
          title={item.name}
        >
          {item.name}
        </p>
      </div>
      {previewOpen && (
        <ImagePreviewLightbox
          url={item.url}
          name={item.name}
          onClose={() => setPreviewOpen(false)}
        />
      )}
    </>
  );
}

function ImageGalleryRow({
  title,
  items,
  timelineUrlCounts,
  onAdd,
  emptyMessage,
}: {
  title: string;
  items: GalleryImageItem[];
  timelineUrlCounts: Map<string, number>;
  onAdd: (url: string) => void;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    if (!emptyMessage) return null;
    return (
      <div>
        <p className="mb-2 text-[10px] font-medium text-neutral-500">{title}</p>
        <p className="text-[10px] text-neutral-600">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-[10px] font-medium text-neutral-500">{title}</p>
      <div className="flex flex-row flex-wrap gap-3 px-1">
        {items.map((item) => (
          <ImageGalleryCard
            key={item.id}
            item={item}
            timelineCount={timelineUrlCounts.get(item.url) ?? 0}
            onAdd={() => onAdd(item.url)}
          />
        ))}
      </div>
    </div>
  );
}

export interface ImageGalleryPanelProps {
  aiImages: GalleryImageItem[];
  uploadedImages: GalleryImageItem[];
  timelineUrlCounts: Map<string, number>;
  onAdd: (url: string) => void;
}

export function ImageGalleryPanel({
  aiImages,
  uploadedImages,
  timelineUrlCounts,
  onAdd,
}: ImageGalleryPanelProps) {
  const hasAny = aiImages.length > 0 || uploadedImages.length > 0;
  if (!hasAny) return null;

  return (
    <div className="space-y-4">
      <ImageGalleryRow
        title="Images générées par l'IA"
        items={aiImages}
        timelineUrlCounts={timelineUrlCounts}
        onAdd={onAdd}
      />
      <ImageGalleryRow
        title="Images importées"
        items={uploadedImages}
        timelineUrlCounts={timelineUrlCounts}
        onAdd={onAdd}
      />
    </div>
  );
}
