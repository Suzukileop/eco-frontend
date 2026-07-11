import Link from 'next/link';
import { templatesLinkClass, templatesPrimaryBtnClass, templatesSectionClass } from '@/components/templates/templates-section-ui';

export function TemplatesEmptyState() {
  return (
    <div className={`${templatesSectionClass} flex flex-col items-center px-6 py-14 text-center`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl ring-1 ring-orange-500/20 dark:bg-orange-500/15">
        <span aria-hidden>🎬</span>
      </div>
      <h2 className="mt-5 text-lg font-bold text-neutral-900 dark:text-white">Aucune analyse pour le moment</h2>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
        Décomposez une vidéo virale plan par plan avec Grok, générez des fonds Nano Banana et préparez votre
        montage dans l&apos;éditeur.
      </p>
      <Link href="/dashboard/templates/new" className={`${templatesPrimaryBtnClass} mt-6`}>
        Lancer votre première analyse
      </Link>
      <p className="mt-4 text-xs text-neutral-500">
        Besoin d&apos;une vidéo modèle ?{' '}
        <Link href="/dashboard/ecosystem" className={templatesLinkClass}>
          Parcourir l&apos;écosystème
        </Link>
      </p>
    </div>
  );
}
