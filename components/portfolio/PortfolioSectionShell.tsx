'use client';

import type { ReactNode } from 'react';
import {
  sectionBackgroundStyle,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';

export function PortfolioSectionShell({
  id,
  className,
  background,
  fitContent = false,
  suppressBackground = false,
  topSpacingClass = 'pt-12 sm:pt-16 lg:pt-20',
  header,
  children,
}: {
  id?: string;
  className?: string;
  background?: PortfolioSectionBackgroundSettings;
  fitContent?: boolean;
  /** When a global solid page color is active, section backgrounds are hidden so that color shows through. */
  suppressBackground?: boolean;
  /** Global padding-top above the section title — same for every section after the hero. */
  topSpacingClass?: string;
  /** Section title block — kept outside item motion so sticky title behavior still works. */
  header?: ReactNode;
  children: ReactNode;
}) {
  const bgStyle =
    !suppressBackground && background?.sectionBackgroundEnabled
      ? sectionBackgroundStyle(background)
      : undefined;
  const hasBackground = Boolean(bgStyle);

  const paddingClass =
    fitContent && hasBackground
      ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12`
      : topSpacingClass;

  return (
    <section
      id={id}
      className={`relative isolate scroll-mt-28 ${paddingClass} ${hasBackground && !fitContent ? 'min-h-screen' : ''} ${className ?? ''}`}
    >
      {bgStyle ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 left-1/2 -z-10 w-screen -translate-x-1/2"
          style={bgStyle}
        />
      ) : null}
      {header ? <div className="relative">{header}</div> : null}
      <div className="relative">{children}</div>
    </section>
  );
}
