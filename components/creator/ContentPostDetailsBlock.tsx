'use client';

import { useEffect, useRef, useState } from 'react';
import type { ContentPostBucket, CreatorContentItemDto } from '@/types/creator-content';

type ContentPostDetailsBlockProps = {
  post: ContentPostDetailsPost;
  bucket?: ContentPostBucket;
  variant?: 'inline' | 'sidebar';
  hideTitle?: boolean;
};

export type ContentPostDetailsPost = Pick<
  CreatorContentItemDto,
  'title' | 'description' | 'tags' | 'toolsUsed' | 'textColor' | 'genre' | 'priceInfo'
>;

function MetaBox({ children, emptyLabel }: { children: React.ReactNode; emptyLabel: string }) {
  return (
    <div className="min-h-[3rem] rounded-xl border border-neutral-200/80 bg-neutral-50/80 p-3 dark:border-neutral-700/80 dark:bg-neutral-950/60">
      <div className="flex min-h-[1.25rem] flex-col gap-1">
        {children ? children : <span className="text-xs text-neutral-400">{emptyLabel}</span>}
      </div>
    </div>
  );
}

function needsShowMoreInline(description: string) {
  const singleLine = description.replace(/\s+/g, ' ').trim();
  return singleLine.length > 72 || description.includes('\n');
}

function DescriptionText({
  description,
  descExpanded,
  isSidebar,
  onClampedChange,
}: {
  description: string;
  descExpanded: boolean;
  isSidebar: boolean;
  onClampedChange: (clamped: boolean) => void;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || descExpanded) {
      onClampedChange(false);
      return;
    }

    const measure = () => {
      onClampedChange(el.scrollHeight > el.clientHeight + 1);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [description, descExpanded, isSidebar, onClampedChange]);

  const displayText = descExpanded ? description : description.replace(/\s*\n+\s*/g, ' ');

  return (
    <p
      ref={ref}
      className={`text-sm text-neutral-500 dark:text-neutral-400 ${
        descExpanded
          ? 'whitespace-pre-wrap leading-relaxed'
          : isSidebar
            ? 'line-clamp-3 leading-relaxed'
            : 'truncate'
      }`}
    >
      {displayText}
    </p>
  );
}

function bucketBadge(bucket?: ContentPostBucket) {
  if (bucket === 'archived') {
    return (
      <span className="rounded-md border border-amber-400/50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-600 dark:text-amber-400">
        Archived
      </span>
    );
  }
  if (bucket === 'trash') {
    return (
      <span className="rounded-md border border-red-400/50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600 dark:text-red-400">
        Trash
      </span>
    );
  }
  return null;
}

export function ContentPostTitle({
  post,
  bucket,
}: Pick<ContentPostDetailsBlockProps, 'post' | 'bucket'>) {
  const title = post.title?.trim() || 'Untitled';

  return (
    <div className="flex flex-wrap items-center gap-2">
      <h3
        className="text-lg font-bold leading-tight text-neutral-900 dark:text-white"
        style={post.textColor ? { color: post.textColor } : undefined}
      >
        {title}
      </h3>
      {bucketBadge(bucket)}
    </div>
  );
}

function ContentPostPriceEstimate({ priceInfo }: { priceInfo?: string | null }) {
  const priceLabel = priceInfo?.trim() ? priceInfo.trim() : null;

  return (
    <div className="rounded-xl border border-neutral-200/80 bg-white p-4 dark:border-neutral-700/80 dark:bg-neutral-900/80">
      <p className="text-xs leading-relaxed text-neutral-500 dark:text-neutral-400">
        Montant estimé pour reproduire cette création…
      </p>
      <p className="mt-2 text-xl font-bold tabular-nums text-neutral-900 dark:text-white">
        {priceLabel ?? '—'}
      </p>
    </div>
  );
}

export function ContentPostDetailsBlock({
  post,
  bucket,
  variant = 'inline',
  hideTitle = false,
}: ContentPostDetailsBlockProps) {
  const [descExpanded, setDescExpanded] = useState(false);
  const [descClamped, setDescClamped] = useState(false);
  const isSidebar = variant === 'sidebar';

  const title = post.title?.trim() || 'Untitled';
  const description = post.description?.trim() ?? '';
  const tags = (post.tags ?? []).filter(Boolean);
  const tools = (post.toolsUsed ?? []).filter(Boolean);
  const showMoreInline = needsShowMoreInline(description);
  const showToggle = isSidebar ? descClamped || descExpanded : showMoreInline || descExpanded;

  return (
    <div className={isSidebar ? 'space-y-5' : 'space-y-3'}>
      {!hideTitle && (
        <div className="flex flex-wrap items-center gap-2">
          <h3
            className={`font-bold leading-tight text-neutral-900 dark:text-white ${
              isSidebar ? 'text-xl' : 'text-lg'
            }`}
            style={post.textColor ? { color: post.textColor } : undefined}
          >
            {title}
          </h3>
          {bucketBadge(bucket)}
        </div>
      )}

      {description && (
        <div>
          <DescriptionText
            description={description}
            descExpanded={descExpanded}
            isSidebar={isSidebar}
            onClampedChange={setDescClamped}
          />
          {showToggle && (
            <button
              type="button"
              onClick={() => setDescExpanded((v) => !v)}
              className="mt-1.5 text-xs font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
            >
              {descExpanded ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      )}

      {isSidebar && <ContentPostPriceEstimate priceInfo={post.priceInfo} />}

      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        <MetaBox emptyLabel="—">
          {tags.length > 0 &&
            tags.map((tag) => (
              <span
                key={tag}
                className={`font-medium text-sky-600 dark:text-sky-400 ${
                  isSidebar ? 'text-sm' : 'truncate text-xs'
                }`}
              >
                #{tag}
              </span>
            ))}
        </MetaBox>
        <MetaBox emptyLabel="—">
          {tools.length > 0 &&
            tools.map((tool) => (
              <span
                key={tool}
                className={`font-medium text-neutral-700 dark:text-neutral-200 ${
                  isSidebar ? 'text-sm' : 'truncate text-xs'
                }`}
              >
                {tool}
              </span>
            ))}
        </MetaBox>
      </div>
    </div>
  );
}

export function ContentPostCardFooter({
  genre,
  priceInfo,
}: {
  genre?: string | null;
  priceInfo?: string | null;
}) {
  const genreLabel = genre?.trim() ? genre.trim().toUpperCase() : null;
  const priceLabel = priceInfo?.trim() ? priceInfo.trim() : null;
  const parts = [genreLabel, priceLabel].filter(Boolean);

  return (
    <div className="border-t border-neutral-200 py-2.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-neutral-400 dark:border-neutral-800">
      {parts.length > 0 ? parts.join(' · ') : 'No genre · No price'}
    </div>
  );
}
