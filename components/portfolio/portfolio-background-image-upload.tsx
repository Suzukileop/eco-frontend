'use client';

import { useContentMediaUpload } from '@/components/creator/creator-content-media';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export const PORTFOLIO_BACKGROUND_IMAGE_ACCEPT =
  'image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif';

export function PortfolioBackgroundImageUpload({
  url,
  onChange,
  label = 'Background image',
}: {
  url: string;
  onChange: (url: string) => void;
  label?: string;
}) {
  const { inputRef, uploading, uploadError, pickFile, onFileChange, fileName } = useContentMediaUpload({
    locale: 'en',
    onUrlChange: onChange,
  });
  const hasImage = Boolean(url.trim());

  return (
    <div className="space-y-3">
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500">{label}</p>
      {hasImage ? (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-neutral-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="" className="max-h-40 w-full object-cover" />
        </div>
      ) : (
        <div className="flex min-h-[7.5rem] flex-col items-center justify-center rounded-xl border-2 border-dashed border-neutral-200 bg-white px-4 text-center">
          <p className="text-sm font-semibold text-neutral-700">No image yet</p>
          <p className="mt-1 text-xs text-neutral-500">JPEG, PNG, WebP or GIF</p>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={PORTFOLIO_BACKGROUND_IMAGE_ACCEPT}
          className="sr-only"
          onChange={(event) => void onFileChange(event)}
        />
        <button
          type="button"
          onClick={pickFile}
          disabled={uploading}
          className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:bg-neutral-50 disabled:opacity-60"
        >
          {uploading ? <LoadingSpinner size="sm" /> : null}
          {uploading ? 'Uploading…' : hasImage ? 'Replace image' : 'Upload image'}
        </button>
        {hasImage ? (
          <button
            type="button"
            onClick={() => onChange('')}
            disabled={uploading}
            className="rounded-full px-3 py-2 text-sm font-medium text-neutral-500 transition hover:text-neutral-900 disabled:opacity-60"
          >
            Remove
          </button>
        ) : null}
        {fileName && !uploading ? (
          <span className="max-w-[12rem] truncate text-xs text-neutral-500">{fileName}</span>
        ) : null}
      </div>
      {uploadError ? <p className="text-xs text-red-600">{uploadError}</p> : null}
    </div>
  );
}
