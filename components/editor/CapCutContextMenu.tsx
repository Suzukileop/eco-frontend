'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { IconChevronRight } from '@/components/editor/TimelineIcons';

export type CapCutMenuItem = {
  id: string;
  label: string;
  icon?: React.ReactNode;
  /** Touches affichées à droite (style CapCut). */
  shortcut?: string[];
  danger?: boolean;
  disabled?: boolean;
  /** Ligne de séparation avant cet item. */
  separatorBefore?: boolean;
  /** Chevron sous-menu (sans action). */
  hasSubmenu?: boolean;
  action?: () => void;
};

/** Polices système CapCut (Segoe UI / SF / Roboto) */
const MENU_FONT =
  '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';

const MENU_COLORS = {
  text: '#161616',
  textDisabled: '#c8c8c8',
  icon: '#161616',
  iconDisabled: '#d1d1d1',
  shortcutText: '#8a8a8a',
  shortcutBg: '#f3f3f3',
  shortcutBorder: '#e8e8e8',
  separator: '#ebebeb',
  hoverBg: '#f2f2f2',
} as const;

function MenuShortcut({ keys }: { keys: string[] }) {
  return (
    <span className="ml-auto flex shrink-0 items-center gap-[3px] pl-3">
      {keys.map((key) => (
        <kbd
          key={key}
          className="inline-flex h-[20px] min-w-[20px] max-w-[120px] items-center justify-center truncate rounded-[4px] border px-[6px] text-[11px] font-normal leading-none tracking-normal"
          style={{
            fontFamily: MENU_FONT,
            color: MENU_COLORS.shortcutText,
            backgroundColor: MENU_COLORS.shortcutBg,
            borderColor: MENU_COLORS.shortcutBorder,
          }}
        >
          {key}
        </kbd>
      ))}
    </span>
  );
}

const MENU_GAP_PX = 6;

export function CapCutContextMenu({
  anchorX,
  anchorY,
  items,
  onClose,
}: {
  anchorX: number;
  anchorY: number;
  items: CapCutMenuItem[];
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState({ left: anchorX, top: anchorY - MENU_GAP_PX });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const closeFromPointer = (e: Event) => {
      if (menuRef.current?.contains(e.target as Node)) return;
      onClose();
    };
    const close = () => onClose();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    // Capture : la timeline stoppe souvent la propagation en bubble
    const t = window.setTimeout(() => {
      window.addEventListener('mousedown', closeFromPointer, true);
      window.addEventListener('pointerdown', closeFromPointer, true);
    }, 0);

    window.addEventListener('scroll', close, true);
    window.addEventListener('resize', close);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('mousedown', closeFromPointer, true);
      window.removeEventListener('pointerdown', closeFromPointer, true);
      window.removeEventListener('scroll', close, true);
      window.removeEventListener('resize', close);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [onClose]);

  useLayoutEffect(() => {
    const el = menuRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    let left = anchorX;
    let top = anchorY - MENU_GAP_PX - rect.height;

    left = Math.max(8, Math.min(left, window.innerWidth - rect.width - 8));
    top = Math.max(8, top);

    setCoords({ left, top });
    setVisible(true);
  }, [anchorX, anchorY, items]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <>
      {/* Fond transparent — clic extérieur ferme le menu */}
      <div
        className="fixed inset-0 z-[249]"
        aria-hidden
        onMouseDown={(e) => {
          e.preventDefault();
          onClose();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          onClose();
        }}
      />
      <div
        ref={menuRef}
        role="menu"
        className={`fixed z-[250] min-w-[252px] max-w-[min(320px,calc(100vw-16px))] select-none overflow-hidden rounded-[8px] border border-[#ebebeb] bg-white py-[6px] shadow-[0_4px_18px_rgba(0,0,0,0.12),0_1px_4px_rgba(0,0,0,0.06)] transition-opacity duration-75 ${
          visible ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          left: coords.left,
          top: coords.top,
          fontFamily: MENU_FONT,
        }}
        onMouseDown={(e) => e.stopPropagation()}
        onContextMenu={(e) => e.preventDefault()}
      >
      {items.map((item) => (
        <div key={item.id}>
          {item.separatorBefore ? (
            <div
              className="my-[6px] h-px"
              style={{ backgroundColor: MENU_COLORS.separator }}
              role="separator"
            />
          ) : null}
          <div className="px-[6px]">
            <button
              type="button"
              role="menuitem"
              disabled={item.disabled || (!item.action && !item.hasSubmenu)}
              onClick={() => {
                if (item.disabled || !item.action) return;
                item.action();
              }}
              className="flex w-full min-w-0 items-center gap-[10px] rounded-[6px] px-[10px] py-[8px] text-left text-[14px] font-normal leading-[1.25] tracking-normal transition-colors duration-100 hover:enabled:bg-[#f2f2f2] disabled:cursor-not-allowed"
              style={{
                color: item.disabled ? MENU_COLORS.textDisabled : MENU_COLORS.text,
              }}
            >
              {item.icon ? (
                <span
                  className="flex h-4 w-4 shrink-0 items-center justify-center [&_svg]:h-4 [&_svg]:w-4"
                  style={{
                    color: item.disabled ? MENU_COLORS.iconDisabled : MENU_COLORS.icon,
                  }}
                >
                  {item.icon}
                </span>
              ) : (
                <span className="h-4 w-4 shrink-0" aria-hidden />
              )}
              <span className="min-w-0 flex-1 truncate">{item.label}</span>
              {item.shortcut && item.shortcut.length > 0 && !item.hasSubmenu ? (
                <MenuShortcut keys={item.shortcut} />
              ) : null}
              {item.hasSubmenu ? (
                <IconChevronRight
                  className="ml-auto h-[14px] w-[14px] shrink-0"
                  style={{
                    color: item.disabled ? MENU_COLORS.iconDisabled : '#a3a3a3',
                  }}
                />
              ) : null}
            </button>
          </div>
        </div>
      ))}
      </div>
    </>,
    document.body
  );
}
