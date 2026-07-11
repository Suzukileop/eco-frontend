/** Design tokens for Templates IA — aligned with Creator Studio / Marketplace (orange + dark). */

export const templatesSectionClass =
  'rounded-2xl border border-neutral-200/80 bg-white/90 p-6 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/85';

export const templatesSectionAccentClass =
  'rounded-2xl border border-orange-200/70 bg-orange-50/60 p-6 dark:border-orange-500/25 dark:bg-orange-500/8';

export const templatesPageTitleClass =
  'text-2xl font-bold tracking-tight text-neutral-900 dark:text-white sm:text-3xl';

export const templatesPageSubtitleClass = 'mt-2 text-sm text-neutral-600 dark:text-neutral-400';

export const templatesBreadcrumbClass =
  'text-sm font-medium text-orange-600 transition hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300';

export const templatesPrimaryBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 active:scale-[0.98] disabled:opacity-60';

export const templatesSecondaryBtnClass =
  'inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white/90 px-4 py-2 text-sm font-medium text-neutral-700 backdrop-blur-sm transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-neutral-200 dark:hover:bg-neutral-800';

export const templatesLinkClass =
  'font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300';

export const templatesInputClass =
  'mt-1.5 w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-400/20 dark:border-neutral-600 dark:bg-neutral-950 dark:text-neutral-100 dark:placeholder:text-neutral-500';

export const templatesLabelClass = 'block text-sm font-semibold text-neutral-800 dark:text-neutral-200';

export const templatesEyebrowClass =
  'text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400';

export const templatesTabActiveClass =
  'border-orange-500 bg-orange-50 text-orange-900 dark:border-orange-500/50 dark:bg-orange-500/15 dark:text-orange-200';

export const templatesTabInactiveClass =
  'border-neutral-200 text-neutral-700 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600';

export const templatesPanelClass =
  'overflow-hidden rounded-2xl border border-neutral-200/80 bg-white/90 shadow-sm backdrop-blur-sm dark:border-neutral-800 dark:bg-neutral-900/85';

export const templatesTableHeadClass = 'bg-neutral-50/80 dark:bg-neutral-950/60';

export const templatesTableRowHoverClass = 'hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40';

export function templatesStatusBadgeClass(status: string): string {
  const base = 'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold';
  switch (status) {
    case 'DONE':
      return `${base} bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-300`;
    case 'FAILED':
      return `${base} bg-red-100 text-red-800 dark:bg-red-500/15 dark:text-red-300`;
    case 'PROCESSING':
      return `${base} bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-300`;
    default:
      return `${base} bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300`;
  }
}
