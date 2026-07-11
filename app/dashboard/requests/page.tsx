'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LegacyRequestsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/ecosystem');
  }, [router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-neutral-600 dark:text-neutral-400">Redirecting to Ecosystem…</p>
    </div>
  );
}
