'use client';

import { DashboardHomeShell } from '@/components/DashboardHomeShell';
import { TemplatesPageHeader } from '@/components/templates/TemplatesPageHeader';
import { VideoSourceForm } from '@/components/templates/VideoSourceForm';

export default function NewTemplateAnalysisPage() {
  return (
    <DashboardHomeShell>
      <div className="mx-auto max-w-3xl space-y-8">
        <TemplatesPageHeader
          title="Nouvelle analyse vidéo"
          subtitle="Décomposition plan par plan avec Grok, puis génération de fonds Nano Banana."
          breadcrumbs={[
            { href: '/dashboard', label: '← Tableau de bord' },
            { href: '/dashboard/templates', label: 'Mes analyses' },
          ]}
        />
        <VideoSourceForm />
      </div>
    </DashboardHomeShell>
  );
}
