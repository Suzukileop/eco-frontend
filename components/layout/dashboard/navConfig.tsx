import type { Role } from '@/types/auth';
import type { ReactNode } from 'react';
import { isContentCreatorsPath, isMarketplaceHubPath } from '@/lib/marketplace-nav';

export type DashboardNavChild = {
  href: string;
  label: string;
  roles?: Role[];
};

export type DashboardNavItem = {
  href: string;
  label: string;
  icon: ReactNode;
  badge?: string;
  roles?: Role[];
  comingSoon?: boolean;
  children?: DashboardNavChild[];
  activeWhen?: (pathname: string) => boolean;
};

export const dashboardNavItems: DashboardNavItem[] = [
  {
    href: '/dashboard/home',
    label: 'Actualités',
    activeWhen: (pathname) => pathname === '/dashboard/home' || pathname === '/dashboard',
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/templates',
    label: 'Templates',
    badge: 'AI',
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 4h10M5 8h14l-1 12H6L5 8z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/ecosystem',
    label: 'Ecosystem',
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
      </svg>
    ),
  },
  {
    href: '/dashboard/discussions',
    label: 'Discussions',
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
    ),
  },
  {
    href: '/dashboard/creator',
    label: 'Creator studio',
    roles: ['ROLE_CREATOR'],
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/marketplace/creators',
    label: 'Content creators',
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    activeWhen: isContentCreatorsPath,
  },
  {
    href: '/marketplace',
    label: 'Marketplace',
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    activeWhen: isMarketplaceHubPath,
  },
  {
    href: '/dashboard/editor/studio',
    label: 'Video editor',
    activeWhen: (pathname) =>
      pathname.startsWith('/dashboard/editor') ||
      /^\/dashboard\/templates\/[^/]+\/studio(?:\/|$)/.test(pathname),
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/custom-content',
    label: 'Custom content',
    badge: 'Soon',
    comingSoon: true,
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/analytics',
    label: 'Analytics',
    badge: 'Soon',
    comingSoon: true,
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    href: '/dashboard/agent',
    label: 'Agent queue',
    roles: ['ROLE_AGENT'],
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    href: '/admin/users',
    label: 'Admin',
    roles: ['ROLE_ADMIN'],
    icon: (
      <svg className="h-[1.375rem] w-[1.375rem]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
];

export function getPageTitle(pathname: string): string {
  if (pathname === '/dashboard/home') return 'Actualités';
  if (pathname === '/dashboard' || pathname === '/dashboard/home') return 'Actualités';
  if (pathname.startsWith('/dashboard/requests')) return 'Ecosystem';
  if (pathname.startsWith('/dashboard/templates')) {
    if (/^\/dashboard\/templates\/[^/]+\/studio(?:\/|$)/.test(pathname)) return 'Video editor';
    return 'Templates';
  }
  if (pathname.startsWith('/dashboard/editor')) return 'Video editor';
  if (pathname.startsWith('/dashboard/custom-content')) return 'Custom content';
  if (pathname.startsWith('/dashboard/credits')) return 'Credits';
  if (pathname.startsWith('/dashboard/ecosystem')) return 'Ecosystem';
  if (pathname.startsWith('/dashboard/discussions')) return 'Discussions';
  if (pathname.startsWith('/dashboard/search')) return 'Search';
  if (pathname.startsWith('/dashboard/analytics')) return 'Analytics';
  if (pathname.startsWith('/dashboard/scheduler')) return 'Scheduler';
  if (pathname.startsWith('/dashboard/agent/deliver')) return 'Deliver content';
  if (pathname.startsWith('/dashboard/agent')) return 'Agent queue';
  if (pathname.startsWith('/dashboard/creator/content/new')) return 'New content';
  if (pathname.startsWith('/dashboard/creator/content')) return 'Creator studio';
  if (pathname.startsWith('/dashboard/creator/products/new')) return 'New product';
  if (pathname.startsWith('/dashboard/creator/products')) return 'Creator studio';
  if (pathname.startsWith('/dashboard/creator/profile')) return 'Creator studio';
  if (pathname.startsWith('/dashboard/settings')) return 'Profile settings';
  if (pathname.startsWith('/dashboard/creator')) return 'Creator studio';
  if (isContentCreatorsPath(pathname)) return 'Content creators';
  if (isMarketplaceHubPath(pathname)) return 'Marketplace';
  return 'Dashboard';
}
