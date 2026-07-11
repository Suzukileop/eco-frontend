'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/context/AuthContext';

type ProfileDropdownProps = {
  open: boolean;
  onClose: () => void;
};

export function ProfileDropdown({ open, onClose }: ProfileDropdownProps) {
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { user, logout, hasRole } = useAuth();

  useEffect(() => {
    if (!open) return;

    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open || !user) return null;

  const handleLogout = async () => {
    onClose();
    await logout();
    router.push('/login');
    router.refresh();
  };

  return (
    <div
      ref={ref}
      className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-72 overflow-hidden rounded-2xl border border-neutral-200/80 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:border-neutral-700 dark:bg-neutral-900"
      role="menu"
    >
      <div className="border-b border-neutral-100 px-4 py-4 dark:border-neutral-800">
        <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400">Profile settings</p>
        <p className="mt-0.5 text-sm font-semibold text-neutral-900 dark:text-white">View profile</p>
        <div className="mt-3 flex items-center gap-3">
          <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="md" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-neutral-900 dark:text-white">{user.fullName}</p>
            <p className="truncate text-xs text-neutral-500">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="py-1">
        <Link
          href="/dashboard/settings"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          role="menuitem"
        >
          <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Profile settings
        </Link>
        <Link
          href="/dashboard"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          role="menuitem"
        >
          <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          Dashboard
        </Link>
        {hasRole('ROLE_CREATOR') && (
          <Link
            href="/dashboard/creator?tab=profile"
            onClick={onClose}
            className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
            role="menuitem"
          >
            <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            Creator profile
          </Link>
        )}
        <Link
          href="/marketplace"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          role="menuitem"
        >
          <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Explore creators
        </Link>
        <Link
          href="/dashboard/notifications"
          onClick={onClose}
          className="flex items-center gap-3 px-4 py-2.5 text-sm text-neutral-700 transition hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
          role="menuitem"
        >
          <svg className="h-4 w-4 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          Notifications
        </Link>
      </div>

      <div className="border-t border-neutral-100 px-4 py-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => void handleLogout()}
          className="text-sm font-medium text-neutral-600 transition hover:text-[#EA580C] dark:text-neutral-400"
          role="menuitem"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
