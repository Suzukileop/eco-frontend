'use client';

import type { ReactNode } from 'react';
import { PANEL, panelClasses as P } from '@/lib/rightPanelTheme';

export const SECTION_TABS = ['TEXTE', 'AUDIO', 'IMAGE', 'VIDÉO', 'OV', 'TRANS'] as const;
export type SectionTab = (typeof SECTION_TABS)[number];

function NavIcon({ children }: { children: ReactNode }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const NAV_ITEMS: { id: SectionTab; label: string; icon: ReactNode }[] = [
  {
    id: 'TEXTE',
    label: 'Texte',
    icon: (
      <NavIcon>
        <path d="M6 4h12M12 4v16M9 20h6" />
      </NavIcon>
    ),
  },
  {
    id: 'AUDIO',
    label: 'Audio',
    icon: (
      <NavIcon>
        <path d="M9 18V6l10-2v14" />
        <path d="M6 15a3 3 0 1 0 0-6" />
      </NavIcon>
    ),
  },
  {
    id: 'IMAGE',
    label: 'Image',
    icon: (
      <NavIcon>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
        <path d="M21 16l-5.5-5.5a1.5 1.5 0 0 0-2.12 0L5 19" />
      </NavIcon>
    ),
  },
  {
    id: 'VIDÉO',
    label: 'Vidéo',
    icon: (
      <NavIcon>
        <rect x="3" y="6" width="14" height="12" rx="2" />
        <path d="M17 10l4-2v8l-4-2" />
      </NavIcon>
    ),
  },
  {
    id: 'OV',
    label: 'Overlay',
    icon: (
      <NavIcon>
        <rect x="4" y="4" width="10" height="10" rx="1.5" />
        <rect x="10" y="10" width="10" height="10" rx="1.5" />
      </NavIcon>
    ),
  },
  {
    id: 'TRANS',
    label: 'Trans.',
    icon: (
      <NavIcon>
        <path d="M4 8h6l-2-3 2-3H4" />
        <path d="M20 16h-6l2 3-2 3h6" />
      </NavIcon>
    ),
  },
];

interface RightPanelSideNavProps {
  tab: SectionTab;
  onTabChange: (tab: SectionTab) => void;
}

export function RightPanelSideNav({ tab, onTabChange }: RightPanelSideNavProps) {
  return (
    <nav
      className={P.navRail}
      style={{ backgroundColor: PANEL.navBg }}
      aria-label="Outils éditeur"
    >
      <div className="flex flex-1 flex-col gap-0.5 py-2">
        {NAV_ITEMS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              title={item.label}
              aria-current={active ? 'page' : undefined}
              className={active ? P.navBtnActive : P.navBtnInactive}
              style={active ? { backgroundColor: PANEL.navActiveBg } : undefined}
            >
              <span className="flex h-5 w-5 shrink-0 items-center justify-center opacity-90">
                {item.icon}
              </span>
              <span className="max-w-full truncate text-center leading-tight">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
