import Link from 'next/link';
import type { ReactNode } from 'react';
import {
  templatesBreadcrumbClass,
  templatesPageSubtitleClass,
  templatesPageTitleClass,
} from '@/components/templates/templates-section-ui';

type Breadcrumb = { href: string; label: string };

type TemplatesPageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  action?: ReactNode;
  badge?: string;
};

export function TemplatesPageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  badge = 'IA · Grok',
}: TemplatesPageHeaderProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0 flex-1">
        {breadcrumbs.length > 0 && (
          <nav className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm" aria-label="Fil d'Ariane">
            {breadcrumbs.map((crumb, index) => (
              <span key={crumb.href} className="inline-flex items-center gap-3">
                {index > 0 && <span className="text-neutral-300 dark:text-neutral-600">/</span>}
                <Link href={crumb.href} className={templatesBreadcrumbClass}>
                  {crumb.label}
                </Link>
              </span>
            ))}
          </nav>
        )}
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <h1 className={templatesPageTitleClass}>{title}</h1>
          <span className="inline-flex items-center rounded-full bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-orange-700 ring-1 ring-orange-500/20 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-500/30">
            {badge}
          </span>
        </div>
        {subtitle ? (
          <p className={`${templatesPageSubtitleClass} max-w-3xl truncate`} title={subtitle}>
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
