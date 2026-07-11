'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { ContentPostBucket } from '@/types/creator-content';

type MenuItem = {
  id: string;
  label: string;
  onClick?: () => void;
  href?: string;
  tone?: 'default' | 'danger';
  disabled?: boolean;
};

type ContentPostOverflowMenuProps = {
  postId: string;
  bucket: ContentPostBucket;
  pinned: boolean;
  onPin: () => void;
  onUnpin: () => void;
  onArchive: () => void;
  onUnarchive: () => void;
  onMoveToTrash: () => void;
  onRestore: () => void;
  onPermanentDelete: () => void;
};

export function ContentPostOverflowMenu({
  postId,
  bucket,
  pinned,
  onPin,
  onUnpin,
  onArchive,
  onUnarchive,
  onMoveToTrash,
  onRestore,
  onPermanentDelete,
}: ContentPostOverflowMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open]);

  const items: MenuItem[] = [];

  if (bucket === 'trash') {
    items.push(
      { id: 'restore', label: 'Restore', onClick: onRestore },
      { id: 'permanent', label: 'Delete permanently', onClick: onPermanentDelete, tone: 'danger' }
    );
  } else {
    items.push({
      id: 'edit',
      label: 'Edit',
      href: `/dashboard/creator/content/${postId}/edit`,
    });

    if (bucket === 'active') {
      items.push({
        id: 'pin',
        label: pinned ? 'Unpin' : 'Pin to top',
        onClick: pinned ? onUnpin : onPin,
      });
      items.push({ id: 'archive', label: 'Archive', onClick: onArchive });
    }

    if (bucket === 'archived') {
      items.push({ id: 'unarchive', label: 'Unarchive', onClick: onUnarchive });
    }

    items.push({
      id: 'trash',
      label: 'Move to trash',
      onClick: onMoveToTrash,
      tone: 'danger',
    });
  }

  const run = (item: MenuItem) => {
    if (item.disabled) return;
    setOpen(false);
    item.onClick?.();
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
        aria-label="Content actions"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4zm0 6a2 2 0 110-4 2 2 0 010 4z" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-[calc(100%+0.35rem)] z-50 min-w-[11rem] overflow-hidden rounded-xl border border-neutral-200/90 bg-white py-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-900"
          role="menu"
        >
          {items.map((item) => {
            const className = `flex w-full items-center px-3 py-2 text-left text-sm transition hover:bg-neutral-50 dark:hover:bg-neutral-800 ${
              item.tone === 'danger'
                ? 'text-red-600 hover:text-red-700 dark:text-red-400'
                : 'text-neutral-700 dark:text-neutral-200'
            } ${item.disabled ? 'cursor-not-allowed opacity-50' : ''}`;

            if (item.href) {
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={className}
                  role="menuitem"
                >
                  {item.label}
                </Link>
              );
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => run(item)}
                disabled={item.disabled}
                className={className}
                role="menuitem"
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
