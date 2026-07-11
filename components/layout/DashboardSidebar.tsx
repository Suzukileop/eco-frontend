'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { CreditBadge } from '@/components/CreditBadge';
import { SidebarFocusButton } from '@/components/layout/SidebarFocusButton';
import { SidebarThemeToggle } from '@/components/layout/SidebarThemeToggle';
import { brandSolidBg, DASHBOARD_SIDEBAR_BG } from '@/components/landing/landingBrand';
import { dashboardNavItems } from '@/components/layout/dashboard/navConfig';

const SIDEBAR_TRANSITION_MS = 300;
const SIDEBAR_GUTTER = 'px-3';
const ICON_RAIL = 'flex w-[4.5rem] shrink-0 items-center justify-center';

type DashboardSidebarProps = {
  collapsed: boolean;
  onToggle: () => void;
  focusMode: boolean;
  onFocusModeChange: (active: boolean) => void;
};

function isActive(pathname: string, href: string) {
  if (href === '/dashboard/home') {
    return pathname === '/dashboard/home' || pathname === '/dashboard';
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

function SidebarCollapseIcon({ collapsed }: { collapsed: boolean }) {
  if (collapsed) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path strokeLinecap="round" d="M9 5v14" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 12h4m0 0l-2-2m2 2l-2 2" />
      </svg>
    );
  }

  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75}>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path strokeLinecap="round" d="M9 5v14" />
    </svg>
  );
}


const navItemInactiveClass =
  'text-neutral-900 hover:bg-white/70 dark:text-white dark:hover:bg-neutral-900/50';
const navItemComingSoonClass =
  'text-neutral-900/60 hover:bg-white/50 dark:text-white/60 dark:hover:bg-neutral-900/30';
const navIconInactiveClass = 'text-neutral-900 dark:text-white';
const sidebarIconButtonClass =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-500 shadow-sm transition hover:border-neutral-300 hover:text-[#F97316] dark:border-neutral-700 dark:bg-neutral-900 dark:hover:text-[#FB923C]';

function SidebarLabelPanel({
  show,
  children,
  className = '',
}: {
  show: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-w-0 flex-1 overflow-hidden pr-3 transition-opacity duration-300 ease-in-out ${
        show ? 'opacity-100' : 'pointer-events-none opacity-0'
      } ${className}`}
    >
      {children}
    </div>
  );
}

export function DashboardSidebar({
  collapsed,
  onToggle,
  focusMode,
  onFocusModeChange,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const { hasRole } = useAuth();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    'Creator studio': true,
  });
  const [showExpandedContent, setShowExpandedContent] = useState(!collapsed);

  useEffect(() => {
    if (collapsed) {
      setShowExpandedContent(false);
      return;
    }

    const timer = window.setTimeout(() => setShowExpandedContent(true), SIDEBAR_TRANSITION_MS);
    return () => window.clearTimeout(timer);
  }, [collapsed]);

  useEffect(() => {
    const onFullscreenChange = () => {
      onFocusModeChange(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, [onFocusModeChange]);

  const visibleItems = dashboardNavItems.filter((item) => {
    const isAgentOnly = hasRole('ROLE_AGENT') && !hasRole('ROLE_ADMIN');
    if (isAgentOnly) {
      return item.href === '/dashboard/home' || item.href === '/dashboard/agent';
    }
    return !item.roles || item.roles.some((role) => hasRole(role));
  });

  return (
    <aside
      className={`sticky top-0 flex h-screen shrink-0 flex-col overflow-hidden border-r border-neutral-200 ${DASHBOARD_SIDEBAR_BG} transition-[width] duration-300 ease-in-out dark:border-neutral-900 ${
        collapsed ? 'w-[4.5rem]' : 'w-64'
      }`}
    >
      <div
        className={`flex h-[4.5rem] shrink-0 items-center ${
          collapsed ? 'justify-center' : `${SIDEBAR_GUTTER} justify-between`
        }`}
      >
        {!collapsed && (
          <Link href="/dashboard/home" className="shrink-0" title="NoProbleme">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-bold text-white ${brandSolidBg}`}
            >
              NP
            </div>
          </Link>
        )}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={sidebarIconButtonClass}
        >
          <SidebarCollapseIcon collapsed={collapsed} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-x-hidden overflow-y-auto pb-4" aria-label="Main navigation">
        {visibleItems.map((item) => {
          const visibleChildren =
            item.children?.filter(
              (child) => !child.roles || child.roles.some((role) => hasRole(role))
            ) ?? [];
          const childActive = visibleChildren.some((child) => isActive(pathname, child.href));
          const active = item.activeWhen
            ? item.activeWhen(pathname) || childActive
            : childActive || isActive(pathname, item.href);
          const hasChildren = visibleChildren.length > 1;
          const isExpanded = expanded[item.label] ?? false;

          if (hasChildren && showExpandedContent) {
            return (
              <div key={item.href} className="space-y-1">
                <div className="flex items-center">
                  <div className={ICON_RAIL}>
                    <span className={active ? 'text-[#F97316]' : navIconInactiveClass}>{item.icon}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpanded((prev) => ({ ...prev, [item.label]: !isExpanded }))}
                    className={`flex min-w-0 flex-1 items-center gap-2 rounded-xl py-2.5 pr-3 text-sm font-medium transition ${
                      active
                        ? 'bg-white text-[#EA580C] shadow-sm dark:bg-neutral-900'
                        : navItemInactiveClass
                    }`}
                  >
                    <span className="flex-1 truncate text-left">{item.label}</span>
                    {item.badge ? (
                      <span className="shrink-0 rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold text-[#EA580C]">
                        {item.badge}
                      </span>
                    ) : null}
                    <svg
                      className={`h-4 w-4 shrink-0 text-neutral-400 transition ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
                {isExpanded && (
                  <div className="ml-[4.5rem] space-y-1 border-l border-neutral-200 pl-3 pr-3 dark:border-neutral-700">
                    {visibleChildren.map((child) => {
                      const childActive = isActive(pathname, child.href);
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`block rounded-lg px-3 py-2 text-sm transition ${
                            childActive
                              ? 'bg-white font-medium text-[#EA580C] shadow-sm dark:bg-neutral-900'
                              : `${navItemInactiveClass} hover:text-neutral-900 dark:hover:text-white`
                          }`}
                        >
                          {child.label}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              title={!showExpandedContent ? item.label : undefined}
              className={`flex items-center transition ${
                active && showExpandedContent
                  ? 'mr-3 rounded-xl bg-white text-[#EA580C] shadow-sm dark:bg-neutral-900'
                  : active
                    ? 'text-[#EA580C]'
                    : item.comingSoon
                      ? navItemComingSoonClass
                      : navItemInactiveClass
              }`}
            >
              <div className={`${ICON_RAIL} py-2.5`}>
                <span
                  className={
                    active
                      ? 'text-[#F97316]'
                      : item.comingSoon
                        ? 'text-neutral-900/60 dark:text-white/60'
                        : navIconInactiveClass
                  }
                >
                  {item.icon}
                </span>
              </div>
              <SidebarLabelPanel show={showExpandedContent} className="flex items-center gap-2 py-2.5">
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{item.label}</span>
                {item.badge ? (
                  <span className="shrink-0 rounded-full bg-[#FFF7ED] px-2 py-0.5 text-[10px] font-semibold text-[#EA580C]">
                    {item.badge}
                  </span>
                ) : null}
              </SidebarLabelPanel>
            </Link>
          );
        })}
      </nav>

      <div className={`${SIDEBAR_GUTTER} shrink-0 space-y-3 overflow-hidden pb-3`}>
        <div className="flex h-10 items-center">
          <SidebarFocusButton
            collapsed={collapsed}
            showExpandedContent={showExpandedContent}
            active={focusMode}
            onActiveChange={onFocusModeChange}
          />
        </div>
        <div className="flex h-12 items-center">
          <CreditBadge variant="sidebar" collapsed={collapsed} />
        </div>
        <div className="flex h-10 items-center">
          <SidebarThemeToggle collapsed={collapsed} showExpandedContent={showExpandedContent} />
        </div>
      </div>
    </aside>
  );
}
