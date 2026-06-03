'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Role } from '@/types/auth';

export function DashboardHomeShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) return null;

  return <main className="mx-auto max-w-5xl space-y-8 px-4 py-10">{children}</main>;
}

function RolesCard({ roles }: { roles: Role[] }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-500">Vos rôles</h2>
      <div className="flex flex-wrap gap-2">
        {roles.map((role) => (
          <Badge key={role} role={role} />
        ))}
      </div>
    </div>
  );
}

export function DashboardWelcomeSection() {
  const { user, hasRole } = useAuth();
  if (!user) return null;
  const showCreatorHub =
    hasRole('ROLE_CLIENT') && hasRole('ROLE_CREATOR');

  return (
    <>
      <div className="flex flex-col gap-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:flex-row sm:items-center">
        <Avatar name={user.fullName} avatarUrl={user.avatarUrl} size="lg" />
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">Bienvenue, {user.fullName} !</h1>
          <p className="mt-0.5 text-sm text-gray-500">{user.email}</p>
          {user.emailVerified && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs text-green-600">
              <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              Email vérifié
            </span>
          )}
          {showCreatorHub && (
            <div className="mt-4">
              <Link
                href="/dashboard/creator/content"
                className="inline-flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 transition hover:bg-indigo-100"
              >
                Mon espace créateur
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
      <RolesCard roles={user.roles} />
      <AdminBanner />
    </>
  );
}

function AdminBanner() {
  const { hasRole } = useAuth();
  if (!hasRole('ROLE_ADMIN')) return null;
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
      <h2 className="mb-2 text-sm font-semibold text-red-800">Accès administrateur</h2>
      <p className="mb-4 text-sm text-red-600">Vous avez des droits administrateur sur la plateforme.</p>
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
      >
        Gérer les utilisateurs
      </Link>
    </div>
  );
}
