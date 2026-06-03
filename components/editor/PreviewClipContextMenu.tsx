'use client';

import { useEffect } from 'react';
import { buildPreviewClipMenuItems } from '@/lib/previewClipMenu';

export interface PreviewCtxMenu {
  clipId: string;
  x: number;
  y: number;
}

export type PreviewCtxMenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
  action: () => void;
};

export function PreviewClipContextMenu({
  menu,
  onClose,
  extraItems = [],
}: {
  menu: PreviewCtxMenu | null;
  onClose: () => void;
  extraItems?: PreviewCtxMenuItem[];
}) {
  useEffect(() => {
    if (!menu) return;
    const close = () => onClose();
    window.addEventListener('mousedown', close);
    window.addEventListener('scroll', close, true);
    return () => {
      window.removeEventListener('mousedown', close);
      window.removeEventListener('scroll', close, true);
    };
  }, [menu, onClose]);

  if (!menu) return null;

  const items = [...extraItems, ...buildPreviewClipMenuItems(menu.clipId, onClose)];

  return (
    <div
      className="fixed z-[250] min-w-[188px] rounded-xl border border-neutral-200 bg-white py-1.5 shadow-2xl"
      style={{ left: menu.x, top: menu.y }}
      onMouseDown={(e) => e.stopPropagation()}
      role="menu"
    >
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="menuitem"
          disabled={item.disabled}
          onClick={() => {
            if (item.disabled) return;
            item.action();
          }}
          className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
            item.danger
              ? 'text-red-600 hover:bg-red-50 disabled:hover:bg-transparent'
              : 'text-neutral-800 hover:bg-neutral-100'
          }`}
        >
          {item.icon ? (
            <span className={`shrink-0 ${item.danger ? 'text-red-400' : 'text-neutral-500'}`}>
              {item.icon}
            </span>
          ) : null}
          {item.label}
        </button>
      ))}
    </div>
  );
}
