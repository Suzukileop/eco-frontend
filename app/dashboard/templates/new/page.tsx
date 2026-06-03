'use client';

import Link from 'next/link';
import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { VideoSourceForm } from '@/components/templates/VideoSourceForm';

export default function NewTemplateAnalysisPage() {
  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <div>
          <Link href="/dashboard" className="text-sm text-teal-600 hover:text-teal-800">
            ← Tableau de bord
          </Link>
          <Link
            href="/dashboard/templates"
            className="ml-4 text-sm text-teal-600 hover:text-teal-800"
          >
            Mes analyses
          </Link>
          <h1 className="mt-3 text-3xl font-bold text-gray-900">Nouvelle analyse vidéo</h1>
          <p className="mt-2 text-sm text-gray-600">
            Décomposition plan par plan avec Grok, puis génération de fonds Nano Banana.
          </p>
        </div>
        <VideoSourceForm />
      </div>
    </DashboardHomeShell>
  );
}
