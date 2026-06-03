'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';

export default function LegacyRequestRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  useEffect(() => {
    if (id) {
      router.replace(`/dashboard/ecosystem/${id}`);
    }
  }, [id, router]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-600">Redirection vers votre dossier écosystème…</p>
    </div>
  );
}
