'use client';

import { CapCutContextMenu, type CapCutMenuItem } from '@/components/editor/CapCutContextMenu';
import { buildPreviewClipMenuItems } from '@/lib/previewClipMenu';

export interface PreviewCtxMenu {
  clipId: string;
  x: number;
  y: number;
}

export type PreviewCtxMenuItem = CapCutMenuItem;

export function PreviewClipContextMenu({
  menu,
  onClose,
  extraItems = [],
}: {
  menu: PreviewCtxMenu | null;
  onClose: () => void;
  extraItems?: CapCutMenuItem[];
}) {
  if (!menu) return null;

  const items = [...extraItems, ...buildPreviewClipMenuItems(menu.clipId, onClose)];

  return (
    <CapCutContextMenu
      anchorX={menu.x}
      anchorY={menu.y}
      items={items}
      onClose={onClose}
    />
  );
}
