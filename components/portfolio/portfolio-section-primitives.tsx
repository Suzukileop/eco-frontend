'use client';

import Link from 'next/link';
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import {
  NeutralIconBadge,
  normalizeSocialPlatformKey,
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import { ProductThumbnailMedia } from '@/components/marketplace/ProductThumbnailMedia';
import { ContentMediaPreview } from '@/components/creator/creator-content-media';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import { getSkillUsageDescription } from '@/components/portfolio/skill-usage-descriptions';
import { formatPhoneDisplay } from '@/lib/phone';
import type {
  ExperienceBlockStatus,
  ExperienceEmploymentType,
  ExperienceProofLink,
  FaqItem,
  ProfileMediaBlock,
  ProfileServiceItem,
} from '@/types/ecosystem';
import type { MarketplaceContentItem } from '@/types/marketplace';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';
import type { PortfolioGlobalMotionProfile } from '@/components/portfolio/portfolio-motion-settings';
import { DEFAULT_MOTION_PROFILE } from '@/components/portfolio/portfolio-motion-settings';
import type { PortfolioNavSettings } from '@/components/portfolio/portfolio-settings-types';
import {
  formatNavLabel,
  portfolioNavBarContainerClass,
  portfolioNavBarInnerClass,
  portfolioNavBarShellStyle,
  portfolioNavBarWidthClass,
  portfolioNavIconGlyphClass,
  portfolioNavIsVertical,
  portfolioNavItemActiveClass,
  portfolioNavItemBaseClass,
  portfolioNavItemColorStyles,
  portfolioNavPlacementClass,
  portfolioNavRailDividerClass,
} from '@/components/portfolio/portfolio-nav-settings';
import { PortfolioNavIcon } from '@/components/portfolio/portfolio-nav-icons';
import type { PortfolioNavIconVariant } from '@/components/portfolio/portfolio-nav-items';
import {
  DEFAULT_ABOUT_PRESENTATION,
  aboutAccentColor,
  aboutSidePanelShellClass,
  aboutSidePanelAutoCenterClass,
  aboutSidePanelCardBackgroundSettings,
  aboutSidePanelFrameClass,
  aboutSidePanelFrameStyle,
  aboutSidePanelFullWidthLayoutClass,
  aboutSidePanelItemCellClass,
  aboutStatsAutoCenterClass,
  aboutStatCardFrameClass,
  aboutStatCardFrameStyle,
  aboutStatEditorialSuffix,
  aboutStatsGapStyle,
  aboutStatFontClass,
  aboutStatFontStyle,
  aboutStatIconColorStyle,
  aboutStatIconSizeClass,
  aboutStatLabelColorStyle,
  aboutStatLabelSizeClass,
  aboutStatLabelTrackingClass,
  aboutStatLabelWeightClass,
  aboutStatValueColorStyle,
  aboutStatValueSizeClass,
  aboutStatValueWeightClass,
  aboutWhyMeBlockClass,
  aboutWhyMeLayersSettings,
  aboutWhyMeFrameClass,
  aboutWhyMeFrameStyle,
  whyMeGapClass,
  resolveWhyMeHeading,
  resolveWhyMeMediaLayout,
  whyMeContentAlignClass,
  whyMeHeadingClass,
  whyMeHeadingStyle,
  isAboutRatingStat,
  type AboutStatValueSizeContext,
  type PortfolioAboutLayoutMode,
  type PortfolioAboutPresentationSettings,
} from '@/components/portfolio/portfolio-about-settings';
import {
  elementTextInlineStyle,
  elementTextStyleClass,
  toolsIconPixelSize,
  toolsIconShellClass,
  type PortfolioElementTextStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import {
  DEFAULT_EXPERIENCE_PRESENTATION,
  experienceAccentColor,
  experienceDetailsPanelClass,
  experienceDetailsPanelStyle,
  experienceDesignUsesEntryCard,
  experienceEntryShellClass,
  experienceEntryShellStyle,
  experienceItemGapClass,
  experienceItemsPerRowGridClass,
  experienceListShellClass,
  experienceStoryPanelClass,
  experienceStoryPanelStyle,
  experienceTextInlineStyle,
  experienceTextStyleClass,
  experienceToolsIconPixelSize,
  experienceToolsIconShellClass,
  experienceYearsClass,
  experienceYearsHighlightStyle,
  experienceYearsStyle,
  isExperienceDetailsElement,
  isExperienceStoryElement,
  normalizeExperienceElementOrder,
  normalizeExperienceElementStyles,
  normalizeExperienceElementZones,
  resolveExperienceBlockLabel,
  resolveExperienceBodyLayout,
  resolveExperienceItemsPerRow,
  resolveExperienceYearsTemplate,
  type PortfolioExperienceAsidePlacement,
  type PortfolioExperienceElementId,
  type PortfolioExperienceElementStyles,
  type PortfolioExperienceElementZones,
  type PortfolioExperiencePresentationSettings,
  type PortfolioExperienceSkillsTagStyle,
  type PortfolioExperienceTextStyle,
  type PortfolioExperienceToolsDisplay,
  type PortfolioExperienceToolsEntrySide,
  type PortfolioExperienceToolsIconSize,
  type PortfolioExperienceToolsZone,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  DEFAULT_WORK_PRESENTATION,
  WORK_CATEGORY_ALL_KEY,
  collectWorkCategories,
  filterWorkItemsByCategory,
  groupWorkItemsByCategory,
  normalizeWorkElementStyles,
  workCardContentAlignClass,
  workCardContentOrderClass,
  workCardFrameClass,
  workCardFrameStyle,
  workCardGapClass,
  workCardGridStyle,
  workCardMediaAspectClass,
  workCardMediaAspectStyle,
  workCardMediaClass,
  workCardMediaOrderClass,
  workCardShellClass,
  workCategoryChipClass,
  workCategoryNavClass,
  workCtaAlignClass,
  workCtaClassName,
  workCtaIconShellClass,
  workCtaStyle,
  resolveWorkItemsPerRow,
  workItemsPerRowGridClass,
  type PortfolioWorkPresentationSettings,
} from '@/components/portfolio/portfolio-work-settings';
import {
  DEFAULT_SERVICES_PRESENTATION,
  normalizeServicesElementStyles,
  resolveServicesServicesSubheadingLabel,
  resolveServicesSkillsSubheadingLabel,
  servicesAccordionShellClass,
  servicesCardFillDataAttrs,
  servicesCardFrameClass,
  servicesCardShellClass,
  servicesCardSurfaceStyle,
  servicesCardWidthClass,
  servicesContentAlignClass,
  servicesGalleryContainerClass,
  servicesGallerySupportsMarquee,
  servicesListIconShellClass,
  servicesListIconShellStyle,
  servicesListRowShellClass,
  servicesPricingHeroShellClass,
  servicesServiceCardMinHeight,
  servicesSkillCardMinHeight,
  servicesStageShellClass,
  resolveServicesCardTone,
  type PortfolioServicesPresentationSettings,
} from '@/components/portfolio/portfolio-services-settings';
import {
  resolveServicesBlockPresentation,
} from '@/components/portfolio/portfolio-services-block-settings';
import {
  ServicesCardBackgroundLayers,
  ServicesCardForeground,
} from '@/components/portfolio/portfolio-services-card-background-layers';
import {
  DEFAULT_FAQ_PRESENTATION,
  faqAnswerBorderStyle,
  faqContentAlignClass,
  faqExpandIconStyle,
  faqFrameClass,
  faqFrameStyle,
  faqIsCardDesign,
  faqItemAccentStyle,
  faqItemShellClass,
  faqListShellClass,
  faqSummaryPaddingClass,
  type PortfolioFaqExpandIconStyle,
  type PortfolioFaqPresentationSettings,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  DEFAULT_CONTACT_PRESENTATION,
  contactCardFrameClass,
  contactCardFrameStyle,
  contactCardMaxWidthClass,
  contactCardPlacementClass,
  contactCardShellClass,
  contactChannelGridClass,
  contactCtaClassName,
  contactCtaStyle,
  contactLinksBlockClass,
  type PortfolioContactCardDesign,
  type PortfolioContactPresentationSettings,
} from '@/components/portfolio/portfolio-contact-settings';
import {
  DEFAULT_FOOTER_PRESENTATION,
  footerAccentStyle,
  footerDividerClass,
  footerIconStyle,
  footerLayoutClass,
  footerPatternStyle,
  footerPrimaryStyle,
  footerCtaSubtitleStyle,
  footerCtaTitleStyle,
  footerCtaButtonClass,
  footerCtaButtonStyle,
  footerShellClass,
  footerTextStyle,
  footerTopMarginClass,
  isFooterBackgroundLight,
  resolveFooterCtaSubtitle,
  resolveFooterDescription,
  resolveFooterPrimaryColor,
  type PortfolioFooterPresentationSettings,
} from '@/components/portfolio/portfolio-footer-settings';
import { sectionBackgroundStyle } from '@/components/portfolio/portfolio-section-background-settings';
import {
  PORTFOLIO_EDITORIAL_GUTTER_X,
  PORTFOLIO_HERO_LAYER_INSET,
  portfolioEditorialShellClass,
} from '@/components/portfolio/portfolio-editorial-layout';
export const SERIF = "'Playfair Display', serif";

/** Shared max width for portfolio page sections */
export const PORTFOLIO_PAGE_MAX = 'mx-auto w-full max-w-[90rem] px-5 sm:px-8 lg:px-12';

export { PORTFOLIO_EDITORIAL_GUTTER_X, PORTFOLIO_HERO_LAYER_INSET, portfolioEditorialShellClass };

/** Editorial hero — same equal gutters as sections below (no max-width shift). */
export const PORTFOLIO_HERO_EDITORIAL_MAX = portfolioEditorialShellClass('medium');

/** Editorial sections below hero — viewport-wide, equal left/right inset */
export const PORTFOLIO_EDITORIAL_SECTION_MAX = portfolioEditorialShellClass('medium');

/** Shared chrome for floating nav pill and sticky section titles. */
export const PORTFOLIO_FLOATING_CHROME =
  'rounded-full border border-neutral-200/80 bg-white/90 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.08)] backdrop-blur-md dark:border-neutral-700 dark:bg-neutral-950/90';

export const PORTFOLIO_FLOATING_CHROME_LABEL =
  'px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em]';

function useSectionTitleStuck(enabled: boolean) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [isStuck, setIsStuck] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setIsStuck(false);
      return;
    }

    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStuck(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-72px 0px 0px 0px' }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [enabled]);

  return { sentinelRef, isStuck };
}

/**
 * Tracks whether the section enclosing the returned ref currently spans the
 * vertical center of the viewport. Used to show a single floating vertical
 * title at a time — only while its own section owns the middle of the screen.
 */
function useSectionCenterActive(enabled: boolean) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setActive(false);
      return;
    }

    const anchor = anchorRef.current;
    const section = anchor?.closest('section');
    if (!section) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const centerY = window.innerHeight / 2;
      setActive(rect.top <= centerY && rect.bottom >= centerY);
    };
    const onScroll = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [enabled]);

  return { anchorRef, active };
}

function wrapSectionTitleChrome(
  node: React.ReactNode,
  chromeClass?: string,
  chromeStyle?: React.CSSProperties
) {
  const hasChrome =
    Boolean(chromeClass?.trim()) || Boolean(chromeStyle && Object.keys(chromeStyle).length > 0);
  if (!hasChrome) return node;
  return (
    <div className={chromeClass} style={chromeStyle}>
      {node}
    </div>
  );
}

function formatServiceDeliveryLabel(deadline: string): string {
  const trimmed = deadline.trim();
  if (!trimmed) return '';

  if (/day|days|week|hour|month/i.test(trimmed)) {
    return trimmed;
  }

  const numberMatch = trimmed.match(/^(\d+)/);
  if (numberMatch) {
    const count = Number.parseInt(numberMatch[1], 10);
    if (Number.isFinite(count)) {
      return `${count} ${count === 1 ? 'day' : 'days'}`;
    }
  }

  return trimmed;
}

function resolveServicePrice(service: ProfileServiceItem): {
  hasPrice: boolean;
  amount: string | null;
} {
  const hasPrice = service.basePriceCents != null;
  return {
    hasPrice,
    amount: hasPrice ? (service.basePriceCents! / 100).toFixed(0) : null,
  };
}

function ServiceBriefIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path strokeLinecap="round" d="M7 5l2-2h6l2 2" />
      <path strokeLinecap="round" d="M9 12h6M12 9v6" />
    </svg>
  );
}

function ServicesCheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
      <path
        fillRule="evenodd"
        d="M16.704 5.29a1 1 0 010 1.42l-7.25 7.25a1 1 0 01-1.42 0l-3.25-3.25a1 1 0 111.42-1.42l2.54 2.54 6.54-6.54a1 1 0 011.42 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function ArrowUpRight({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" />
    </svg>
  );
}

function SideInfoCardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 11.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21s7-4.438 7-10a7 7 0 10-14 0c0 5.562 7 10 7 10z"
      />
    </svg>
  );
}

function SideInfoLanguagesIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.6 9h16.8M3.6 15h16.8M12 3c-2.4 2.8-3.6 5.6-3.6 9s1.2 6.2 3.6 9c2.4-2.8 3.6-5.6 3.6-9s-1.2-6.2-3.6-9z" />
    </svg>
  );
}

function SideInfoUserIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SideInfoCalendarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}

function SideInfoClockIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
    </svg>
  );
}

export const SIDE_INFO_ICONS = {
  location: SideInfoCardIcon,
  languages: SideInfoLanguagesIcon,
  gender: SideInfoUserIcon,
  memberSince: SideInfoCalendarIcon,
  availability: SideInfoClockIcon,
} as const;

export function SectionEyebrow({ index, label }: { index: string; label: string }) {
  return (
    <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400">
      {index} · {label}
    </p>
  );
}

export function SectionHeading({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-neutral-950 dark:text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {title}
        </h2>
        {subtitle ? (
          <p
            className="mt-3 max-w-2xl text-base italic leading-relaxed text-neutral-500 dark:text-neutral-400 sm:text-lg"
            style={{ fontFamily: SERIF }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

/** Sticky section title — sticks for the full section height until the next section title replaces it. */
export function EditorialSectionStickyHeader({
  title,
  subtitle,
  trailing,
  subtitleSerif = false,
  editorialLayout = false,
  centered = false,
  alignRight = false,
  alwaysCentered = false,
  className = '',
  titleTypographyClass = '',
  titleTypographyStyle,
  subtitleTypographyClass = '',
  subtitleTypographyStyle,
  titleDecorationStyle,
  subtitleDecorationStyle,
  titleChromeClass,
  titleChromeStyle,
  scrollBehavior = 'sticky',
  customTitleSizing = false,
  customSubtitleSizing = false,
  orientation = 'horizontal',
}: {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  subtitleSerif?: boolean;
  /** Editorial wide layout — compact title on the nav row (lg+). */
  editorialLayout?: boolean;
  /** Center title, subtitle, and trailing content (FAQ, Contact, etc.). */
  centered?: boolean;
  /** Align title, subtitle, and trailing content to the right (global override). */
  alignRight?: boolean;
  /** Keep title centered on scroll — no top-left sticky pill (Contact). */
  alwaysCentered?: boolean;
  className?: string;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  /** Inline decoration (underline/highlight) applied to a span hugging the text. */
  titleDecorationStyle?: React.CSSProperties;
  subtitleDecorationStyle?: React.CSSProperties;
  titleChromeClass?: string;
  titleChromeStyle?: React.CSSProperties;
  /** Global scroll behavior for section titles: floating pill or static. */
  scrollBehavior?: 'sticky' | 'static';
  /** When true, skip default editorial title scale (global typography controls size). */
  customTitleSizing?: boolean;
  /** When true, skip default subtitle scale and muted color. */
  customSubtitleSizing?: boolean;
  /** Global title orientation — horizontal (default) or rotated vertical rail. */
  orientation?: 'horizontal' | 'vertical';
}) {
  const spacingClass = className || 'mb-12 lg:mb-16';
  const stickyEnabled = scrollBehavior !== 'static';
  const pillMode = editorialLayout && stickyEnabled;
  const { sentinelRef, isStuck } = useSectionTitleStuck(stickyEnabled && !alwaysCentered);
  const centerContent = centered && !alignRight && (alwaysCentered || !isStuck || !stickyEnabled);
  const rightContent = alignRight && (alwaysCentered || !isStuck || !stickyEnabled);
  const showPill = pillMode && isStuck && !alwaysCentered;

  const positionClass = !stickyEnabled
    ? 'relative'
    : pillMode
      ? 'sticky top-16 sm:top-[4.75rem] lg:top-5'
      : isStuck
        ? 'sticky top-16 border-b border-neutral-200/70 bg-white/95 py-3 backdrop-blur-md sm:top-[4.75rem] sm:py-4 dark:border-neutral-800 dark:bg-neutral-950/95'
        : 'sticky top-16 sm:top-[4.75rem]';

  const titleSizeClass = showPill
    ? `leading-none text-neutral-950 dark:text-white ${PORTFOLIO_FLOATING_CHROME_LABEL}`
    : customTitleSizing
      ? 'text-neutral-950 dark:text-white'
      : stickyEnabled && !pillMode && isStuck
        ? 'text-3xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-4xl lg:leading-[0.95] dark:text-white'
        : 'text-5xl font-extrabold tracking-[-0.04em] text-neutral-950 sm:text-6xl lg:text-7xl lg:leading-[0.95] dark:text-white';

  if (orientation === 'vertical') {
    return (
      <VerticalSectionTitle
        title={title}
        subtitle={subtitle}
        trailing={trailing}
        subtitleSerif={subtitleSerif}
        centered={centered}
        alignRight={alignRight}
        spacingClass={spacingClass}
        titleTypographyClass={titleTypographyClass}
        titleTypographyStyle={titleTypographyStyle}
        titleDecorationStyle={titleDecorationStyle}
        subtitleTypographyClass={subtitleTypographyClass}
        subtitleTypographyStyle={subtitleTypographyStyle}
        subtitleDecorationStyle={subtitleDecorationStyle}
        customTitleSizing={customTitleSizing}
        customSubtitleSizing={customSubtitleSizing}
        titleChromeClass={titleChromeClass}
        titleChromeStyle={titleChromeStyle}
      />
    );
  }

  return (
    <>
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />
      <div
        className={`z-40 w-full transition-all duration-300 ease-out ${
          centerContent ? 'flex justify-center' : rightContent ? 'flex justify-end' : ''
        } ${positionClass}`}
      >
        <div
          className={
            showPill
              ? `w-fit max-w-full ${PORTFOLIO_FLOATING_CHROME}`
              : centerContent
                ? 'mx-auto w-fit max-w-full'
                : rightContent
                  ? 'ml-auto w-fit max-w-full'
                  : 'w-fit max-w-full'
          }
        >
          {wrapSectionTitleChrome(
            <h2
              className={`transition-all duration-300 ease-out ${
                centerContent ? 'text-center' : rightContent ? 'text-right' : ''
              } ${titleTypographyClass} ${titleSizeClass}`}
              style={titleTypographyStyle}
            >
              {titleDecorationStyle && Object.keys(titleDecorationStyle).length > 0 ? (
                <span style={titleDecorationStyle}>{title}</span>
              ) : (
                title
              )}
            </h2>,
            titleChromeClass,
            titleChromeStyle
          )}
        </div>
      </div>
      {subtitle ? (
        <p
          className={`mt-4 max-w-2xl leading-relaxed ${
            customSubtitleSizing ? '' : 'text-base text-neutral-500 sm:text-lg dark:text-neutral-400'
          } ${
            centered ? 'mx-auto text-center' : alignRight ? 'ml-auto text-right' : ''
          } ${subtitleTypographyClass} ${trailing ? 'mb-4' : spacingClass}`}
          style={{
            ...(subtitleSerif ? { fontFamily: SERIF } : undefined),
            ...subtitleTypographyStyle,
          }}
        >
          {subtitleDecorationStyle && Object.keys(subtitleDecorationStyle).length > 0 ? (
            <span style={subtitleDecorationStyle}>{subtitle}</span>
          ) : (
            subtitle
          )}
        </p>
      ) : null}
      {trailing ? (
        <div
          className={`${spacingClass}${
            centered ? ' flex justify-center' : alignRight ? ' flex justify-end' : ''
          }`}
        >
          {trailing}
        </div>
      ) : null}
      {!subtitle && !trailing ? <div className={spacingClass} aria-hidden /> : null}
    </>
  );
}

/**
 * Vertical (rotated) section title. On large screens it is fixed and centered
 * vertically, appearing only while its own section owns the middle of the
 * viewport — so a single title shows at a time and never bleeds into the
 * section above or below. On small screens it renders inline in normal flow.
 */
function VerticalSectionTitle({
  title,
  subtitle,
  trailing,
  subtitleSerif = false,
  centered = false,
  alignRight = false,
  spacingClass,
  titleTypographyClass = '',
  titleTypographyStyle,
  titleDecorationStyle,
  subtitleTypographyClass = '',
  subtitleTypographyStyle,
  subtitleDecorationStyle,
  customTitleSizing = false,
  customSubtitleSizing = false,
  titleChromeClass,
  titleChromeStyle,
}: {
  title: string;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  subtitleSerif?: boolean;
  centered?: boolean;
  alignRight?: boolean;
  spacingClass: string;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  titleDecorationStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  subtitleDecorationStyle?: React.CSSProperties;
  customTitleSizing?: boolean;
  customSubtitleSizing?: boolean;
  titleChromeClass?: string;
  titleChromeStyle?: React.CSSProperties;
}) {
  const { anchorRef, active } = useSectionCenterActive(true);

  const verticalTitleSize = customTitleSizing
    ? 'text-neutral-950 dark:text-white'
    : 'text-5xl font-black tracking-[-0.02em] text-neutral-950 sm:text-6xl lg:text-7xl dark:text-white';

  // For upright vertical text a highlight band should run alongside the column,
  // so flip the marker gradient from vertical (to bottom) to horizontal (to right).
  const toVerticalDecoration = (
    decoration?: React.CSSProperties
  ): React.CSSProperties | undefined => {
    if (!decoration || !decoration.backgroundImage) return decoration;
    return {
      ...decoration,
      backgroundImage: String(decoration.backgroundImage).replace(
        'linear-gradient(',
        'linear-gradient(to right, '
      ),
    };
  };
  const verticalTitleDecoration = toVerticalDecoration(titleDecorationStyle);
  const verticalSubtitleDecoration = toVerticalDecoration(subtitleDecorationStyle);

  const flowJustify = centered
    ? 'justify-center'
    : alignRight
      ? 'justify-end'
      : 'justify-start';

  const fixedPositionClass = centered
    ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'
    : alignRight
      ? 'top-1/2 right-6 -translate-y-1/2 xl:right-10'
      : 'top-1/2 left-6 -translate-y-1/2 xl:left-10';

  const titleNode = wrapSectionTitleChrome(
    <h2
      className={`${titleTypographyClass} ${verticalTitleSize}`}
      style={{
        writingMode: 'vertical-rl',
        textOrientation: 'upright',
        letterSpacing: '-0.05em',
        lineHeight: 1,
        ...titleTypographyStyle,
      }}
    >
      {verticalTitleDecoration && Object.keys(verticalTitleDecoration).length > 0 ? (
        <span style={verticalTitleDecoration}>{title}</span>
      ) : (
        title
      )}
    </h2>,
    titleChromeClass,
    titleChromeStyle
  );

  return (
    <>
      <div ref={anchorRef} className="h-px w-full" aria-hidden />
      {/* In-flow on small screens */}
      <div className={`mb-10 flex w-full items-start ${flowJustify} lg:hidden`}>{titleNode}</div>
      {/* Fixed & centered on large screens, visible only while the section owns the viewport center */}
      <div
        className={`pointer-events-none fixed z-30 hidden transition-opacity duration-500 ease-out lg:flex ${fixedPositionClass} ${
          active ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {titleNode}
      </div>
      {subtitle ? (
        <p
          className={`mt-4 max-w-2xl leading-relaxed ${
            customSubtitleSizing ? '' : 'text-base text-neutral-500 sm:text-lg dark:text-neutral-400'
          } ${
            centered ? 'mx-auto text-center' : alignRight ? 'ml-auto text-right' : ''
          } ${subtitleTypographyClass} ${trailing ? 'mb-4' : spacingClass}`}
          style={{
            ...(subtitleSerif ? { fontFamily: SERIF } : undefined),
            ...subtitleTypographyStyle,
          }}
        >
          {verticalSubtitleDecoration && Object.keys(verticalSubtitleDecoration).length > 0 ? (
            <span style={verticalSubtitleDecoration}>{subtitle}</span>
          ) : (
            subtitle
          )}
        </p>
      ) : null}
      {trailing ? (
        <div
          className={`${spacingClass} ${
            centered ? 'flex justify-center' : alignRight ? 'flex justify-end' : ''
          }`}
        >
          {trailing}
        </div>
      ) : null}
    </>
  );
}

type NavItem = { id: string; label: string; icon: PortfolioNavIconVariant };

function useNavVisibility(displayMode: PortfolioNavSettings['displayMode']) {
  const [visible, setVisible] = useState(displayMode === 'always');

  useEffect(() => {
    if (displayMode === 'always') {
      setVisible(true);
      return;
    }

    const update = () => {
      if (displayMode === 'on-scroll') {
        setVisible(window.scrollY > 96);
        return;
      }
      setVisible(window.scrollY > window.innerHeight * 0.72);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [displayMode]);

  return visible;
}

export function PortfolioFloatingNav({
  items,
  settings,
  activeId: controlledActiveId,
  onNavigate,
}: {
  items: NavItem[];
  settings: PortfolioNavSettings;
  /** Controlled active section (pages mode). */
  activeId?: string;
  /** When set, nav buttons switch pages instead of scrolling to hash anchors. */
  onNavigate?: (id: string) => void;
}) {
  const [observedActiveId, setObservedActiveId] = useState(items[0]?.id ?? '');
  const visible = useNavVisibility(settings.displayMode);
  const isControlled = typeof onNavigate === 'function';
  const activeId = isControlled
    ? (controlledActiveId ?? items[0]?.id ?? '')
    : observedActiveId;

  useEffect(() => {
    if (isControlled || items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleEntry?.target.id) {
          setObservedActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: '-40% 0px -50% 0px', threshold: [0, 0.25, 0.5] }
    );

    for (const item of items) {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [items, isControlled]);

  if (!settings.enabled) return null;
  if (settings.hideWhenSingle && items.length <= 1) return null;
  if (items.length === 0) return null;

  const vertical = portfolioNavIsVertical(settings.placement);
  const placementClass = portfolioNavPlacementClass(
    settings.placement,
    settings.edgeOffset,
    settings.barWidth
  );
  const widthClass = portfolioNavBarWidthClass(settings.barWidth, vertical);
  const innerWidthClass = portfolioNavBarInnerClass(
    settings.barWidth,
    vertical,
    settings.itemGap,
    settings.placement
  );
  const containerClass = portfolioNavBarContainerClass(
    settings.barDesign,
    settings.glassEffect,
    vertical,
    settings.barPadding ?? 'md',
    settings.barWidth
  );
  const shellStyle =
    settings.barDesign === 'dock'
      ? undefined
      : portfolioNavBarShellStyle(
          settings.barBackgroundColor,
          settings.barBorderColor,
          settings.glassEffect
        );
  const itemBaseClass = portfolioNavItemBaseClass(
    settings.barDesign,
    settings.contentMode,
    settings.buttonDesign,
    settings.labelCase,
    settings.compactOnMobile,
    vertical,
    settings.barThickness
  );
  const iconGlyphClass = portfolioNavIconGlyphClass(settings.barThickness);
  const showRailDividers = settings.barDesign === 'rail' && items.length > 1;

  return (
    <nav
      className={`pointer-events-none fixed z-50 transition-opacity duration-300 ease-out ${placementClass} ${widthClass} ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Portfolio navigation"
      aria-hidden={!visible}
    >
      <div className={`pointer-events-auto ${innerWidthClass} ${containerClass}`} style={shellStyle}>
        {items.map((item, index) => {
          const active = activeId === item.id;
          const label = formatNavLabel(item.label, settings.labelCase);
          const itemColors = portfolioNavItemColorStyles(
            settings.itemIconColor ?? '#525252',
            settings.itemTextColor ?? '#525252',
            settings.itemBackgroundColor ?? '#ffffff',
            settings.itemBorderColor ?? '#e5e5e5',
            active
          );
          const itemClassName = `${itemBaseClass} ${portfolioNavItemActiveClass(
            settings.barDesign,
            settings.buttonDesign,
            settings.activeStyle,
            active,
            vertical
          )}`;
          const itemContent =
            settings.contentMode === 'icons' ? (
              <span className="inline-flex" style={itemColors.icon}>
                <PortfolioNavIcon variant={item.icon} className={iconGlyphClass} />
              </span>
            ) : settings.contentMode === 'both' ? (
              <>
                <span className="inline-flex" style={itemColors.icon}>
                  <PortfolioNavIcon variant={item.icon} className={iconGlyphClass} />
                </span>
                <span style={itemColors.text}>{label}</span>
              </>
            ) : (
              <span style={itemColors.text}>{label}</span>
            );

          return (
            <Fragment key={item.id}>
              {showRailDividers && index > 0 ? (
                <span className={portfolioNavRailDividerClass(vertical)} aria-hidden />
              ) : null}
              {isControlled ? (
                <button
                  type="button"
                  onClick={() => onNavigate?.(item.id)}
                  aria-label={label}
                  aria-current={active ? 'page' : undefined}
                  title={settings.contentMode === 'icons' ? label : undefined}
                  className={itemClassName}
                  style={itemColors.shell}
                >
                  {itemContent}
                </button>
              ) : (
                <a
                  href={`#${item.id}`}
                  aria-label={label}
                  title={settings.contentMode === 'icons' ? label : undefined}
                  className={itemClassName}
                  style={itemColors.shell}
                >
                  {itemContent}
                </a>
              )}
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}

type PerPageNavItem = {
  id: string;
  label: string;
  icon: PortfolioNavIconVariant;
};

export function PortfolioPerPageNav({
  items,
  settings,
}: {
  items: PerPageNavItem[];
  settings: PortfolioNavSettings;
}) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const visible = useNavVisibility(settings.displayMode);

  useEffect(() => {
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleEntry?.target.id) {
          setActiveId(visibleEntry.target.id);
        }
      },
      { rootMargin: '-35% 0px -45% 0px', threshold: [0, 0.2, 0.45, 0.7] }
    );

    for (const item of items) {
      const node = document.getElementById(item.id);
      if (node) observer.observe(node);
    }

    return () => observer.disconnect();
  }, [items]);

  if (!settings.enabled) return null;
  if (settings.hideWhenSingle && items.length <= 1) return null;
  if (items.length === 0) return null;

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === activeId)
  );
  const activeItem = items[activeIndex] ?? items[0];
  const prevItem = activeIndex > 0 ? items[activeIndex - 1] : null;
  const nextItem = activeIndex < items.length - 1 ? items[activeIndex + 1] : null;

  const goTo = (id: string) => {
    const node = document.getElementById(id);
    if (node) {
      node.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveId(id);
    }
  };

  return (
    <nav
      className={`pointer-events-none fixed bottom-5 right-4 z-50 flex flex-col items-end gap-3 transition-opacity duration-300 sm:bottom-8 sm:right-6 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Page navigation"
      aria-hidden={!visible}
    >
      <div className="pointer-events-auto flex flex-col items-center gap-2 rounded-full border border-neutral-200/90 bg-white/95 px-2.5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-md">
        {items.map((item) => {
          const active = item.id === activeId;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(item.id)}
              aria-label={item.label}
              title={item.label}
              className={`h-2.5 w-2.5 rounded-full transition ${
                active ? 'scale-125 bg-neutral-950' : 'bg-neutral-300 hover:bg-neutral-500'
              }`}
            />
          );
        })}
      </div>

      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-neutral-200/90 bg-white/95 px-2 py-2 shadow-[0_12px_40px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <button
          type="button"
          onClick={() => prevItem && goTo(prevItem.id)}
          disabled={!prevItem}
          aria-label="Previous section"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="min-w-[5.5rem] px-1 text-center">
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-neutral-400">
            {activeIndex + 1} / {items.length}
          </p>
          <p className="truncate text-xs font-semibold text-neutral-900">
            {formatNavLabel(activeItem.label, settings.labelCase)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => nextItem && goTo(nextItem.id)}
          disabled={!nextItem}
          aria-label="Next section"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full text-neutral-700 transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-35"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </nav>
  );
}

function expandMarqueeItems(items: string[], minCount = 8): string[] {
  if (items.length === 0) return [];
  const expanded: string[] = [];
  while (expanded.length < minCount) {
    for (const item of items) {
      expanded.push(item);
      if (expanded.length >= minCount) break;
    }
  }
  return expanded;
}

function MarqueeTrack({ tools, hidden = false }: { tools: string[]; hidden?: boolean }) {
  return (
    <div className="flex shrink-0 items-center" aria-hidden={hidden}>
      {tools.map((tool, index) => (
        <span key={`${tool}-${index}`} className="inline-flex shrink-0 items-center gap-3 px-5 sm:px-7">
          <CreatorToolLogo label={tool} size={36} className="rounded-none" />
          <span className="whitespace-nowrap text-sm font-medium text-neutral-700 dark:text-neutral-200">{tool}</span>
          <span className="h-1 w-1 shrink-0 bg-orange-500" aria-hidden />
        </span>
      ))}
    </div>
  );
}

export function PortfolioToolsMarquee({ tools }: { tools: string[] }) {
  const unique = Array.from(new Set(tools.map((item) => item.trim()).filter(Boolean)));
  if (unique.length === 0) return null;

  const trackItems = expandMarqueeItems(unique, 6);

  return (
    <div className="overflow-hidden border-y border-neutral-200/80 py-5 dark:border-neutral-800 [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
      <div className="portfolio-marquee flex w-max will-change-transform">
        <MarqueeTrack tools={trackItems} />
        <MarqueeTrack tools={trackItems} hidden />
      </div>
    </div>
  );
}

export function EditorialWorkCard({
  item,
  presentation = DEFAULT_WORK_PRESENTATION,
}: {
  item: MarketplaceContentItem;
  presentation?: PortfolioWorkPresentationSettings;
}) {
  const href = `/marketplace/content/${item.id}`;
  const title = item.title?.trim() || 'Untitled project';
  const description = item.description?.trim() || item.priceInfo?.trim() || null;
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const toolsLabelText = presentation.toolsLabelText.trim() || 'Tools to use';
  const iconShellClass = toolsIconShellClass(presentation.toolsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.toolsIconSize);
  const tools = Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    presentation.maxToolsShown
  );
  const useSplitToolsList = tools.length > 5;
  const splitAt = useSplitToolsList ? Math.ceil(tools.length / 2) : tools.length;
  const primaryTools = tools.slice(0, splitAt);
  const overflowTools = tools.slice(splitAt);
  const showIcons =
    presentation.showCardTools &&
    presentation.showCardToolIcons &&
    (presentation.toolsDisplay === 'icons' || presentation.toolsDisplay === 'both');
  const showList =
    presentation.showCardTools &&
    presentation.showCardToolList &&
    (presentation.toolsDisplay === 'list' || presentation.toolsDisplay === 'both');
  const isOverlay = presentation.cardDesign === 'overlay';
  const shellClass = workCardShellClass(presentation.cardDesign, presentation.contentPlacement);
  const gridStyle = workCardGridStyle(
    presentation.cardDesign,
    presentation.contentPlacement,
    presentation.mediaRatio
  );
  const mediaOrderClass = workCardMediaOrderClass(presentation.cardDesign, presentation.contentPlacement);
  const contentOrderClass = workCardContentOrderClass(presentation.cardDesign, presentation.contentPlacement);
  const borderClass = workCardFrameClass(presentation);
  const borderStyle = workCardFrameStyle(presentation);
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);
  const ctaAlign = workCtaAlignClass(presentation.ctaAlignment);
  const mediaAspectClass = workCardMediaAspectClass(
    presentation.cardDesign,
    presentation.contentPlacement,
    presentation.mediaRatio
  );
  const mediaAspectStyle = workCardMediaAspectStyle(
    presentation.cardDesign,
    presentation.contentPlacement,
    presentation.mediaRatio
  );

  const mediaInner = item.mediaUrl ? (
    <ProductThumbnailMedia
      url={item.mediaUrl}
      alt={title}
      fit="cover"
      autoPlay
      zoomOnHover
      className="h-full w-full"
    />
  ) : (
    <div className="flex h-full w-full items-center justify-center bg-neutral-200 text-sm text-neutral-500 dark:bg-neutral-800">
      Preview unavailable
    </div>
  );

  const mediaBlock = (
    <Link href={href} className={`${workCardMediaClass(presentation.cardDesign)} ${mediaOrderClass}`.trim()}>
      <div className={`${mediaAspectClass} w-full`} style={mediaAspectStyle}>
        {mediaInner}
      </div>
    </Link>
  );

  const contentBlock = (
    <div
      className={`flex min-w-0 flex-col gap-5 lg:min-h-0 lg:py-0 ${contentOrderClass} ${contentAlign.container}`.trim()}
    >
      {presentation.showCategoryOnCard && item.genre?.trim() ? (
        <p
          className={`${elementTextStyleClass(styles.categoryOnCard, 'label')} ${contentAlign.text}`}
          style={elementTextInlineStyle(styles.categoryOnCard)}
        >
          {item.genre.trim()}
        </p>
      ) : null}
      {presentation.showCardTitle || (presentation.showCardDescription && description) ? (
        <div className={`w-fit max-w-full space-y-3 sm:max-w-xl ${contentAlign.block}`}>
          {presentation.showCardTitle ? (
            <h3
              className={`leading-tight tracking-[-0.02em] ${elementTextStyleClass(styles.cardTitle, 'title')} ${contentAlign.text}`}
              style={elementTextInlineStyle(styles.cardTitle)}
            >
              <Link href={href} className="transition hover:opacity-80">
                {title}
              </Link>
            </h3>
          ) : null}
          {presentation.showCardDescription && description ? (
            <p
              className={`leading-relaxed ${elementTextStyleClass(styles.cardDescription, 'body')} ${contentAlign.text}`}
              style={elementTextInlineStyle(styles.cardDescription)}
            >
              {description}
            </p>
          ) : null}
        </div>
      ) : null}

      {showIcons || showList ? (
        <div className={`min-w-0 ${contentAlign.block}`}>
          {presentation.showToolsLabel && (showIcons || showList) ? (
            <p
              className={`${elementTextStyleClass(styles.toolsLabel, 'label')} ${contentAlign.text}`}
              style={elementTextInlineStyle(styles.toolsLabel)}
            >
              {toolsLabelText}
            </p>
          ) : null}
          {showIcons ? (
            <div className={`flex flex-wrap gap-3 ${contentAlign.row} ${presentation.showToolsLabel ? 'mt-3' : ''}`}>
              {tools.map((tool) => (
                <div
                  key={`icon-${tool}`}
                  title={tool}
                  aria-label={tool}
                  className={`flex items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900 ${iconShellClass}`}
                >
                  <CreatorToolLogo label={tool} size={iconPixelSize} className="rounded-full" />
                </div>
              ))}
            </div>
          ) : null}
          {showList ? (
            <>
              <div className={`${showIcons ? 'mt-4' : presentation.showToolsLabel ? 'mt-3' : ''} lg:hidden`}>
                <EditorialWorkToolsList tools={tools} textStyle={styles.toolsList} />
              </div>
              {useSplitToolsList ? (
                <div
                  className={`${showIcons ? 'mt-4' : presentation.showToolsLabel ? 'mt-3' : ''} hidden gap-x-8 lg:grid lg:grid-cols-2`}
                >
                  <EditorialWorkToolsList tools={primaryTools} textStyle={styles.toolsList} />
                  <EditorialWorkToolsList tools={overflowTools} textStyle={styles.toolsList} />
                </div>
              ) : (
                <div
                  className={`${showIcons ? 'mt-4' : presentation.showToolsLabel ? 'mt-3' : ''} hidden lg:block`}
                >
                  <EditorialWorkToolsList tools={tools} textStyle={styles.toolsList} />
                </div>
              )}
            </>
          ) : null}
        </div>
      ) : null}

      {presentation.showCardCta ? (
        <div className={`flex w-full pt-1 ${ctaAlign}`}>
          <Link
            href={href}
            className={workCtaClassName(presentation.ctaDesign)}
            style={workCtaStyle(presentation.ctaDesign, presentation.ctaColor)}
          >
            <span className={elementTextStyleClass(styles.cta, 'body')} style={elementTextInlineStyle(styles.cta)}>
              {presentation.ctaLabel}
            </span>
            <span
              className={workCtaIconShellClass(presentation.ctaDesign)}
              style={
                presentation.ctaDesign === 'circle-icon'
                  ? {
                      color: presentation.ctaColor,
                      borderColor: `${presentation.ctaColor}33`,
                      backgroundColor: `${presentation.ctaColor}14`,
                    }
                  : undefined
              }
            >
              <ArrowUpRight className="h-4 w-4" />
            </span>
          </Link>
        </div>
      ) : null}
    </div>
  );

  if (isOverlay) {
    const overlayInner = (
      <div className="group relative overflow-hidden rounded-[2rem] bg-neutral-900 shadow-md transition duration-300 hover:-translate-y-0.5 hover:shadow-xl">
        <Link href={href} className="block">
          <div
            className={`${workCardMediaAspectClass('overlay', presentation.contentPlacement, presentation.mediaRatio)} w-full`}
            style={mediaAspectStyle}
          >
            {mediaInner}
          </div>
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent"
            aria-hidden
          />
        </Link>
        <div
          className={`pointer-events-none absolute inset-x-0 bottom-0 flex flex-col gap-4 p-6 sm:p-8 ${contentAlign.container}`}
        >
          <div
            className={`pointer-events-auto flex w-full flex-col gap-3 ${contentAlign.container} ${contentAlign.text} [&_*]:text-white`}
          >
            {presentation.showCardTitle ? (
              <h3
                className={`leading-tight tracking-[-0.02em] ${elementTextStyleClass(styles.cardTitle, 'title')}`}
                style={elementTextInlineStyle(styles.cardTitle)}
              >
                <Link href={href} className="transition hover:opacity-80">
                  {title}
                </Link>
              </h3>
            ) : null}
            {presentation.showCardDescription && description ? (
              <p
                className={`max-w-xl leading-relaxed ${elementTextStyleClass(styles.cardDescription, 'body')} ${contentAlign.block}`}
                style={elementTextInlineStyle(styles.cardDescription)}
              >
                {description}
              </p>
            ) : null}
            {showIcons ? (
              <div className={`mt-1 flex flex-wrap gap-2 ${contentAlign.row}`}>
                {tools.map((tool) => (
                  <div
                    key={`overlay-icon-${tool}`}
                    title={tool}
                    aria-label={tool}
                    className={`flex items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm ${iconShellClass}`}
                  >
                    <CreatorToolLogo label={tool} size={iconPixelSize} className="rounded-full" />
                  </div>
                ))}
              </div>
            ) : showList ? (
              <p
                className={`${elementTextStyleClass(styles.toolsList, 'label')}`}
                style={elementTextInlineStyle(styles.toolsList)}
              >
                {tools.join(' · ')}
              </p>
            ) : null}
            {presentation.showCardCta ? (
              <div className={`flex w-full pt-1 ${ctaAlign}`}>
                <Link
                  href={href}
                  className={workCtaClassName(presentation.ctaDesign)}
                  style={workCtaStyle(presentation.ctaDesign, presentation.ctaColor)}
                >
                  <span
                    className={elementTextStyleClass(styles.cta, 'body')}
                    style={elementTextInlineStyle(styles.cta)}
                  >
                    {presentation.ctaLabel}
                  </span>
                  <span
                    className={workCtaIconShellClass(presentation.ctaDesign)}
                    style={
                      presentation.ctaDesign === 'circle-icon'
                        ? {
                            color: presentation.ctaColor,
                            borderColor: `${presentation.ctaColor}33`,
                            backgroundColor: `${presentation.ctaColor}14`,
                          }
                        : undefined
                    }
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );

    if (borderClass) {
      return (
        <article className={borderClass} style={borderStyle}>
          {overlayInner}
        </article>
      );
    }
    return <article>{overlayInner}</article>;
  }

  if (borderClass) {
    return (
      <article className={borderClass} style={borderStyle}>
        <div className={shellClass} style={gridStyle}>
          {mediaBlock}
          {contentBlock}
        </div>
      </article>
    );
  }

  return (
    <article className={shellClass} style={gridStyle}>
      {mediaBlock}
      {contentBlock}
    </article>
  );
}

function WorkChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function WorkCardThumb({
  item,
  title,
  className,
}: {
  item: MarketplaceContentItem;
  title: string;
  className: string;
}) {
  return item.mediaUrl ? (
    <div className={className}>
      <ProductThumbnailMedia url={item.mediaUrl} alt={title} fit="cover" className="h-full w-full" />
    </div>
  ) : (
    <div
      className={`${className} flex items-center justify-center bg-neutral-200 text-[10px] text-neutral-500 dark:bg-neutral-800`}
    >
      N/A
    </div>
  );
}

/** Design 2 — Liste compacte: thin row with thumbnail, title, short description, arrow. */
function EditorialWorkListCard({
  item,
  presentation,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
}) {
  const href = `/marketplace/content/${item.id}`;
  const title = item.title?.trim() || 'Untitled project';
  const description = item.description?.trim() || item.priceInfo?.trim() || null;
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const frameClass = workCardFrameClass(presentation);
  const frameStyle = workCardFrameStyle(presentation);
  const baseFrame = frameClass || 'rounded-2xl border border-neutral-200/80 p-3 sm:p-4 dark:border-neutral-800';
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);

  return (
    <Link
      href={href}
      className={`group flex items-center gap-4 transition hover:bg-neutral-50/80 dark:hover:bg-neutral-900/40 ${baseFrame}`}
      style={frameStyle}
    >
      <WorkCardThumb
        item={item}
        title={title}
        className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 sm:h-20 sm:w-20 dark:bg-neutral-800"
      />
      <div className={`min-w-0 flex-1 ${contentAlign.text}`}>
        {presentation.showCategoryOnCard && item.genre?.trim() ? (
          <p
            className={`mb-0.5 ${elementTextStyleClass(styles.categoryOnCard, 'label')}`}
            style={elementTextInlineStyle(styles.categoryOnCard)}
          >
            {item.genre.trim()}
          </p>
        ) : null}
        {presentation.showCardTitle ? (
          <p
            className={`truncate transition group-hover:opacity-80 ${elementTextStyleClass(styles.cardTitle, 'body')}`}
            style={elementTextInlineStyle(styles.cardTitle)}
          >
            {title}
          </p>
        ) : null}
        {presentation.showCardDescription && description ? (
          <p
            className={`mt-0.5 truncate ${elementTextStyleClass(styles.cardDescription, 'body')}`}
            style={elementTextInlineStyle(styles.cardDescription)}
          >
            {description}
          </p>
        ) : null}
      </div>
      <ArrowUpRight className="h-5 w-5 shrink-0 text-neutral-300 transition group-hover:text-orange-500" />
    </Link>
  );
}

/** Design 4 — Accordéon: expandable row revealing description, tools, and CTA. */
function EditorialWorkAccordionRow({
  item,
  presentation,
  defaultOpen = false,
}: {
  item: MarketplaceContentItem;
  presentation: PortfolioWorkPresentationSettings;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const href = `/marketplace/content/${item.id}`;
  const title = item.title?.trim() || 'Untitled project';
  const description = item.description?.trim() || item.priceInfo?.trim() || null;
  const styles = normalizeWorkElementStyles(presentation.elementStyles);
  const iconShellClass = toolsIconShellClass(presentation.toolsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.toolsIconSize);
  const tools = Array.from(new Set((item.toolsUsed ?? []).map((t) => t.trim()).filter(Boolean))).slice(
    0,
    presentation.maxToolsShown
  );
  const showIcons =
    presentation.showCardTools &&
    presentation.showCardToolIcons &&
    (presentation.toolsDisplay === 'icons' || presentation.toolsDisplay === 'both');
  const frameClass = workCardFrameClass(presentation);
  const frameStyle = workCardFrameStyle(presentation);
  const baseFrame = frameClass || 'rounded-2xl border border-neutral-200/80 dark:border-neutral-800';
  const innerPad = presentation.cardPadding === 'none' ? 'px-4 sm:px-5' : '';
  const contentAlign = workCardContentAlignClass(presentation.cardContentAlignment);
  const ctaAlign = workCtaAlignClass(presentation.ctaAlignment);

  return (
    <div className={`overflow-hidden ${baseFrame}`} style={frameStyle}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center gap-4 py-4 text-left ${innerPad}`}
        aria-expanded={open}
      >
        <WorkCardThumb
          item={item}
          title={title}
          className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
        />
        <span className="min-w-0 flex-1">
          {presentation.showCategoryOnCard && item.genre?.trim() ? (
            <span
              className={`mb-0.5 block ${elementTextStyleClass(styles.categoryOnCard, 'label')}`}
              style={elementTextInlineStyle(styles.categoryOnCard)}
            >
              {item.genre.trim()}
            </span>
          ) : null}
          {presentation.showCardTitle ? (
            <span
              className={`block truncate ${elementTextStyleClass(styles.cardTitle, 'body')}`}
              style={elementTextInlineStyle(styles.cardTitle)}
            >
              {title}
            </span>
          ) : null}
        </span>
        <WorkChevronIcon
          className={`h-5 w-5 shrink-0 text-neutral-400 transition-transform duration-300 ${
            open ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`flex flex-col gap-4 pb-5 ${innerPad} ${contentAlign.container}`}>
            {presentation.showCardDescription && description ? (
              <p
                className={`leading-relaxed ${elementTextStyleClass(styles.cardDescription, 'body')} ${contentAlign.text}`}
                style={elementTextInlineStyle(styles.cardDescription)}
              >
                {description}
              </p>
            ) : null}
            {showIcons && tools.length > 0 ? (
              <div className={`flex flex-wrap gap-2.5 ${contentAlign.row}`}>
                {tools.map((tool) => (
                  <div
                    key={`acc-${item.id}-${tool}`}
                    title={tool}
                    aria-label={tool}
                    className={`flex items-center justify-center rounded-full border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900 ${iconShellClass}`}
                  >
                    <CreatorToolLogo label={tool} size={iconPixelSize} className="rounded-full" />
                  </div>
                ))}
              </div>
            ) : null}
            {presentation.showCardCta ? (
              <div className={`flex w-full ${ctaAlign}`}>
                <Link
                  href={href}
                  className={workCtaClassName(presentation.ctaDesign)}
                  style={workCtaStyle(presentation.ctaDesign, presentation.ctaColor)}
                >
                  <span
                    className={elementTextStyleClass(styles.cta, 'body')}
                    style={elementTextInlineStyle(styles.cta)}
                  >
                    {presentation.ctaLabel}
                  </span>
                  <span
                    className={workCtaIconShellClass(presentation.ctaDesign)}
                    style={
                      presentation.ctaDesign === 'circle-icon'
                        ? {
                            color: presentation.ctaColor,
                            borderColor: `${presentation.ctaColor}33`,
                            backgroundColor: `${presentation.ctaColor}14`,
                          }
                        : undefined
                    }
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </span>
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Renders the full collection of work items according to the chosen gallery layout. */
export function EditorialWorkGallery({
  items,
  presentation = DEFAULT_WORK_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  items: MarketplaceContentItem[];
  presentation?: PortfolioWorkPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const [activeCategory, setActiveCategory] = useState(WORK_CATEGORY_ALL_KEY);
  const categories = useMemo(
    () => collectWorkCategories(items, presentation.categoryUncategorizedLabel),
    [items, presentation.categoryUncategorizedLabel]
  );
  const showFilter =
    (presentation.categoryMode === 'filter' || presentation.categoryMode === 'filter-and-group') &&
    categories.length > 1;
  const showGroups =
    presentation.categoryMode === 'group' || presentation.categoryMode === 'filter-and-group';

  useEffect(() => {
    if (activeCategory === WORK_CATEGORY_ALL_KEY) return;
    if (!categories.some((category) => category.key === activeCategory)) {
      setActiveCategory(WORK_CATEGORY_ALL_KEY);
    }
  }, [activeCategory, categories]);

  const filteredItems = useMemo(
    () => (showFilter ? filterWorkItemsByCategory(items, activeCategory) : items),
    [activeCategory, items, showFilter]
  );

  const groups = useMemo(
    () =>
      showGroups
        ? groupWorkItemsByCategory(filteredItems, presentation.categoryUncategorizedLabel)
        : [{ key: WORK_CATEGORY_ALL_KEY, label: '', items: filteredItems }],
    [filteredItems, presentation.categoryUncategorizedLabel, showGroups]
  );

  const filterBar =
    showFilter ? (
      <nav className={workCategoryNavClass(presentation.categoryDesign)} aria-label="Work categories">
        {[
          {
            key: WORK_CATEGORY_ALL_KEY,
            label: presentation.categoryAllLabel,
            count: items.length,
          },
          ...categories,
        ].map((category) => {
          const active = category.key === activeCategory;
          return (
            <button
              key={category.key}
              type="button"
              onClick={() => setActiveCategory(category.key)}
              className={workCategoryChipClass(presentation.categoryDesign, active)}
              style={
                active
                  ? presentation.categoryDesign === 'pills'
                    ? { backgroundColor: presentation.categoryActiveColor, color: '#fff' }
                    : { color: presentation.categoryActiveColor }
                  : { color: presentation.categoryMutedColor }
              }
              aria-pressed={active}
            >
              {category.label}
              <span className="ml-1.5 text-xs font-medium opacity-60">{category.count}</span>
            </button>
          );
        })}
      </nav>
    ) : null;

  let motionIndex = 0;
  const galleryBlocks = groups.map((group) => {
    if (group.items.length === 0) return null;
    const block = (
      <WorkGalleryLayout
        key={group.key}
        items={group.items}
        presentation={presentation}
        motionProfile={motionProfile}
        startIndex={motionIndex}
      />
    );
    motionIndex += group.items.length;
    if (!showGroups || !group.label) return block;
    return (
      <div key={group.key} className="space-y-5">
        <div className="flex items-baseline justify-between gap-3">
          <h3
            className="text-sm font-bold uppercase tracking-[0.16em]"
            style={{ color: presentation.categoryActiveColor }}
          >
            {group.label}
          </h3>
          <span className="text-xs font-medium" style={{ color: presentation.categoryMutedColor }}>
            {group.items.length}
          </span>
        </div>
        {block}
      </div>
    );
  });

  return (
    <div className="space-y-8">
      {filterBar}
      <div className={showGroups ? 'space-y-10' : undefined}>{galleryBlocks}</div>
    </div>
  );
}

function WorkGalleryLayout({
  items,
  presentation,
  motionProfile,
  startIndex = 0,
}: {
  items: MarketplaceContentItem[];
  presentation: PortfolioWorkPresentationSettings;
  motionProfile: PortfolioGlobalMotionProfile;
  startIndex?: number;
}) {
  const gapClass = workCardGapClass(presentation.cardGap);
  const itemsPerRow = resolveWorkItemsPerRow(presentation.galleryLayout, presentation.itemsPerRow);
  const multiColClass = workItemsPerRowGridClass(itemsPerRow, presentation.cardGap);

  if (presentation.galleryLayout === 'list') {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkListCard item={item} presentation={presentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'accordion') {
    return (
      <div className="flex flex-col gap-3">
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkAccordionRow
              item={item}
              presentation={presentation}
              defaultOpen={startIndex + index === 0}
            />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'grid') {
    const gridPresentation: PortfolioWorkPresentationSettings = {
      ...presentation,
      contentPlacement: 'bottom',
    };
    return (
      <div className={multiColClass}>
        {items.map((item, index) => (
          <PortfolioMotionItem
            key={item.id}
            profile={motionProfile}
            index={startIndex + index}
            className="h-full"
          >
            <EditorialWorkCard item={item} presentation={gridPresentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (presentation.galleryLayout === 'overlay') {
    const overlayPresentation: PortfolioWorkPresentationSettings = {
      ...presentation,
      cardDesign: 'overlay',
    };
    return (
      <div className={multiColClass}>
        {items.map((item, index) => (
          <PortfolioMotionItem
            key={item.id}
            profile={motionProfile}
            index={startIndex + index}
            className="h-full"
          >
            <EditorialWorkCard item={item} presentation={overlayPresentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  // stack — 1 column stays a vertical list; 2+ uses the responsive grid
  if (itemsPerRow <= 1) {
    return (
      <div className={`flex flex-col ${gapClass}`}>
        {items.map((item, index) => (
          <PortfolioMotionItem key={item.id} profile={motionProfile} index={startIndex + index}>
            <EditorialWorkCard item={item} presentation={presentation} />
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  return (
    <div className={multiColClass}>
      {items.map((item, index) => (
        <PortfolioMotionItem
          key={item.id}
          profile={motionProfile}
          index={startIndex + index}
          className="h-full"
        >
          <EditorialWorkCard item={item} presentation={presentation} />
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

function EditorialWorkToolsList({
  tools,
  className = '',
  textStyle,
}: {
  tools: string[];
  className?: string;
  textStyle?: PortfolioElementTextStyle;
}) {
  if (tools.length === 0) return null;

  return (
    <ul className={`space-y-3 ${className}`.trim()}>
      {tools.map((tool) => (
        <li
          key={tool}
          className={`flex items-start gap-3.5 leading-relaxed ${
            textStyle ? elementTextStyleClass(textStyle, 'body') : 'text-base font-medium text-neutral-700 sm:text-lg dark:text-neutral-200'
          }`}
          style={textStyle ? elementTextInlineStyle(textStyle) : undefined}
        >
          <span
            className="relative mt-1.5 flex h-4 w-4 shrink-0 items-center justify-center"
            aria-hidden
          >
            <span className="absolute inset-0 rounded-full border-2 border-orange-500/90" />
            <span className="h-1.5 w-1.5 rounded-full bg-orange-500 shadow-[0_0_0_2px_rgba(249,115,22,0.15)]" />
          </span>
          <span>{tool}</span>
        </li>
      ))}
    </ul>
  );
}

type EditorialMarqueeCardTone = 'light' | 'muted';

export function EditorialServiceCard({
  service,
  tone = 'light',
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
}: {
  service: ProfileServiceItem;
  tone?: EditorialMarqueeCardTone;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
}) {
  const { hasPrice, amount: priceAmount } = resolveServicePrice(service);
  const shellClass = servicesCardShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const pricePlacement = presentation.servicesPricePlacement;
  const minHeightClass = servicesServiceCardMinHeight(presentation.cardDesign);
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);

  const priceBlock =
    presentation.showServicePrice || presentation.showServiceDelivery ? (
      <div
        className={`w-full shrink-0 self-stretch rounded-2xl border border-neutral-200/80 bg-white/80 px-4 py-3.5 dark:border-neutral-700 dark:bg-neutral-950/40 ${
          pricePlacement === 'top' ? 'mt-4' : 'mt-auto'
        }`}
      >
        <div
          className={`flex flex-wrap items-center gap-3 ${
            pricePlacement === 'end' ? 'justify-between' : align.row
          }`}
        >
          {presentation.showServicePrice ? (
            hasPrice ? (
              <p
                className={`shrink-0 leading-none ${elementTextStyleClass(elementStyles.price, 'title')}`}
                style={elementTextInlineStyle(elementStyles.price)}
              >
                <span className="mr-2 text-sm font-semibold text-neutral-400">From</span>
                {priceAmount}
                <span className="ml-1 text-lg font-bold text-orange-600">€</span>
              </p>
            ) : (
              <p
                className={`shrink-0 ${elementTextStyleClass(elementStyles.price, 'title')}`}
                style={elementTextInlineStyle(elementStyles.price)}
              >
                Custom quote
              </p>
            )
          ) : null}
          {presentation.showServiceDelivery && deliveryLabel ? (
            <p
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 dark:border-neutral-700 dark:bg-neutral-800 ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
              style={elementTextInlineStyle(elementStyles.delivery)}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
              Delivery · {deliveryLabel}
            </p>
          ) : null}
        </div>
      </div>
    ) : null;

  return (
    <article
      className={`${shellClass} ${frameClass} ${minHeightClass} flex h-full w-full flex-col ${align.container}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex min-h-0 flex-1 flex-col">
      {pricePlacement === 'top' ? priceBlock : null}

      {presentation.showServiceTitle ? (
        <h3
          className={`leading-tight tracking-[-0.02em] ${elementTextStyleClass(elementStyles.cardTitle, 'title')} ${align.text}`}
          style={elementTextInlineStyle(elementStyles.cardTitle)}
        >
          {service.title}
        </h3>
      ) : null}

      {presentation.showServiceDescription && service.description ? (
        <p
          className={`mt-4 min-h-0 flex-1 line-clamp-4 leading-relaxed ${elementTextStyleClass(elementStyles.cardBody, 'body')} ${align.text}`}
          style={{ fontFamily: SERIF, ...elementTextInlineStyle(elementStyles.cardBody) }}
        >
          {service.description}
        </p>
      ) : (
        <div className="min-h-0 flex-1" />
      )}

      {pricePlacement !== 'top' ? priceBlock : null}
      </ServicesCardForeground>
    </article>
  );
}

function EditorialServiceListRow({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, amount } = resolveServicePrice(service);
  const shellClass = servicesListRowShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const pricePlacement = presentation.servicesPricePlacement;
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const showDescription =
    presentation.showServiceDescription && Boolean(service.description?.trim());
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);

  const priceNode = presentation.showServicePrice ? (
    hasPrice ? (
      <p
        className={`shrink-0 tracking-[-0.03em] ${elementTextStyleClass(elementStyles.price, 'title')}`}
        style={elementTextInlineStyle(elementStyles.price)}
      >
        {amount}
        <span className="ml-0.5 text-sm font-bold text-orange-600">€</span>
      </p>
    ) : (
      <p
        className={`shrink-0 ${elementTextStyleClass(elementStyles.price, 'title')}`}
        style={elementTextInlineStyle(elementStyles.price)}
      >
        Sur devis
      </p>
    )
  ) : null;

  const titleBlock = (
    <div className={`min-w-0 flex-1 ${align.text}`}>
      {presentation.showServiceTitle ? (
        <p
          className={`truncate ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
          style={elementTextInlineStyle(elementStyles.cardTitle)}
        >
          {service.title}
        </p>
      ) : null}
      {presentation.showServiceDelivery && deliveryLabel ? (
        <p
          className={`mt-0.5 truncate ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
          style={elementTextInlineStyle(elementStyles.delivery)}
        >
          Livraison {deliveryLabel}
        </p>
      ) : null}
    </div>
  );

  const descriptionBlock = showDescription ? (
    <p
      className={`mt-3 line-clamp-3 leading-relaxed ${elementTextStyleClass(elementStyles.cardBody, 'body')} ${align.text}`}
      style={elementTextInlineStyle(elementStyles.cardBody)}
    >
      {service.description}
    </p>
  ) : null;

  const headerRow = (
    <div className={`flex w-full items-center gap-3 ${align.row}`}>
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${servicesListIconShellClass(presentation.cardDesign)}`}
        style={servicesListIconShellStyle(
          presentation.cardDesign,
          presentation.cardDesignIntensities,
          presentation.cardAccentColor,
          presentation.cardDesignTints
        )}
      >
        <ServiceBriefIcon className="h-5 w-5" />
      </div>
      {titleBlock}
      {pricePlacement === 'end' ? priceNode : null}
      {!priceNode && pricePlacement === 'end' ? (
        <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-orange-500" />
      ) : null}
    </div>
  );

  return (
    <article
      className={`group flex h-full w-full flex-col ${shellClass} ${frameClass} ${align.container}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex h-full flex-col">
      {pricePlacement === 'top' && priceNode ? (
        <div className={`mb-2 flex w-full ${align.row}`}>{priceNode}</div>
      ) : null}
      {headerRow}
      {pricePlacement === 'below' && priceNode ? (
        <div className={`mt-2 flex w-full ${align.row}`}>{priceNode}</div>
      ) : null}
      {descriptionBlock}
      </ServicesCardForeground>
    </article>
  );
}

function EditorialServicePricingHeroCard({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const { hasPrice, amount } = resolveServicePrice(service);
  const shellClass = servicesPricingHeroShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const accent = presentation.cardAccentColor;
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const features: { key: string; content: string; kind: 'delivery' | 'body' }[] = [
    deliveryLabel && presentation.showServiceDelivery
      ? { key: 'delivery', content: `Livraison en ${deliveryLabel}`, kind: 'delivery' as const }
      : null,
    service.description && presentation.showServiceDescription
      ? { key: 'description', content: service.description, kind: 'body' as const }
      : null,
    !hasPrice && presentation.showServicePrice
      ? { key: 'quote', content: 'Devis personnalisé selon votre projet', kind: 'body' as const }
      : null,
  ].filter((item): item is { key: string; content: string; kind: 'delivery' | 'body' } => item !== null);

  return (
    <article
      className={`${shellClass} ${frameClass} flex h-full w-full flex-col ${align.container} ${align.text}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex flex-1 flex-col">
      {presentation.showServicePrice ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">À partir de</p>
      ) : null}
      {presentation.showServicePrice ? (
        hasPrice ? (
          <p
            className={`mt-2 tracking-[-0.05em] ${elementTextStyleClass(elementStyles.price, 'title')}`}
            style={elementTextInlineStyle(elementStyles.price)}
          >
            {amount}
            <span className="ml-1 text-2xl font-bold text-orange-600">€</span>
          </p>
        ) : (
          <p
            className={`mt-2 tracking-[-0.03em] ${elementTextStyleClass(elementStyles.price, 'title')}`}
            style={elementTextInlineStyle(elementStyles.price)}
          >
            Sur devis
          </p>
        )
      ) : null}
      {presentation.showServiceTitle ? (
        <h3
          className={`mt-5 leading-tight tracking-[-0.02em] ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
          style={elementTextInlineStyle(elementStyles.cardTitle)}
        >
          {service.title}
        </h3>
      ) : null}
      {features.length > 0 ? (
        <ul className="mt-5 w-full space-y-2.5">
          {features.map((feature) => (
            <li
              key={feature.key}
              className={`flex items-start gap-2.5 leading-relaxed ${
                presentation.servicesContentAlignment === 'center'
                  ? 'justify-center'
                  : presentation.servicesContentAlignment === 'right'
                    ? 'justify-end'
                    : ''
              }`}
            >
              <ServicesCheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
              <span
                className={`${align.text} ${elementTextStyleClass(
                  feature.kind === 'delivery' ? elementStyles.delivery : elementStyles.cardBody,
                  feature.kind === 'delivery' ? 'label' : 'body'
                )}`}
                style={elementTextInlineStyle(
                  feature.kind === 'delivery' ? elementStyles.delivery : elementStyles.cardBody
                )}
              >
                {feature.content}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="mt-auto w-full self-stretch pt-6">
        <Link
          href="#contact"
          className="inline-flex w-full items-center justify-center rounded-full bg-neutral-950 px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-100"
          style={
            presentation.cardDesign === 'accent'
              ? { backgroundColor: accent, color: '#fff' }
              : undefined
          }
        >
          Commander
        </Link>
      </div>
      </ServicesCardForeground>
    </article>
  );
}

function EditorialServiceAccordionRow({
  service,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  defaultOpen = false,
  cardIndex = 0,
  tone = 'light',
}: {
  service: ProfileServiceItem;
  presentation?: PortfolioServicesPresentationSettings;
  defaultOpen?: boolean;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const { hasPrice, amount } = resolveServicePrice(service);
  const shellClass = servicesAccordionShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.servicesContentAlignment);
  const pricePlacement = presentation.servicesPricePlacement;
  const deliveryLabel = service.deadline ? formatServiceDeliveryLabel(service.deadline) : '';
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);

  const priceNode = presentation.showServicePrice ? (
    hasPrice ? (
      <span
        className={`shrink-0 tracking-[-0.03em] ${elementTextStyleClass(elementStyles.price, 'title')}`}
        style={elementTextInlineStyle(elementStyles.price)}
      >
        {amount}
        <span className="ml-0.5 text-sm font-bold text-orange-600">€</span>
      </span>
    ) : (
      <span
        className={`shrink-0 ${elementTextStyleClass(elementStyles.price, 'title')}`}
        style={elementTextInlineStyle(elementStyles.price)}
      >
        Sur devis
      </span>
    )
  ) : null;

  return (
    <div className={`relative h-full ${shellClass} ${frameClass}`} style={surfaceStyle} {...fillAttrs}>
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex h-full flex-col">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full gap-3 text-left ${
          pricePlacement === 'below' || pricePlacement === 'top' ? 'flex-col' : 'items-center'
        }`}
        aria-expanded={open}
      >
        {pricePlacement === 'top' && priceNode ? (
          <div className={`flex w-full items-center gap-2 ${align.row}`}>{priceNode}</div>
        ) : null}
        <div className={`flex w-full items-center gap-3 ${align.row}`}>
          <span className={`min-w-0 flex-1 ${align.text}`}>
            {presentation.showServiceTitle ? (
              <span
                className={`block truncate ${elementTextStyleClass(elementStyles.cardTitle, 'title')}`}
                style={elementTextInlineStyle(elementStyles.cardTitle)}
              >
                {service.title}
              </span>
            ) : null}
          </span>
          {pricePlacement === 'end' ? priceNode : null}
          <WorkChevronIcon
            className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
        {pricePlacement === 'below' && priceNode ? (
          <div className={`flex w-full ${align.row}`}>{priceNode}</div>
        ) : null}
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`space-y-3 border-t border-neutral-200/80 pt-3 dark:border-neutral-800 ${align.container}`}>
            {presentation.showServiceDescription && service.description ? (
              <p
                className={`leading-relaxed ${elementTextStyleClass(elementStyles.cardBody, 'body')} ${align.text}`}
                style={elementTextInlineStyle(elementStyles.cardBody)}
              >
                {service.description}
              </p>
            ) : null}
            {presentation.showServiceDelivery && deliveryLabel ? (
              <p
                className={`inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1.5 dark:border-neutral-700 dark:bg-neutral-800 ${elementTextStyleClass(elementStyles.delivery, 'label')}`}
                style={elementTextInlineStyle(elementStyles.delivery)}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
                Livraison · {deliveryLabel}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      </ServicesCardForeground>
    </div>
  );
}

function EditorialSkillListRow({
  skill,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  skill: string;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const shellClass = servicesListRowShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.skillsContentAlignment);
  const iconTop = presentation.skillsIconPlacement === 'top';
  const description = getSkillUsageDescription(skill);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const iconShellClass = toolsIconShellClass(presentation.skillsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.skillsIconSize);

  const icon = presentation.showSkillIcon ? (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 ${iconShellClass}`}
    >
      <CreatorToolLogo label={skill} size={iconPixelSize} className="rounded-lg" />
    </div>
  ) : null;

  if (iconTop) {
    return (
      <article
        className={`group flex h-full flex-col gap-2 ${shellClass} ${frameClass} ${align.container}`}
        style={surfaceStyle}
        {...fillAttrs}
      >
        <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
        <ServicesCardForeground className="flex h-full flex-col gap-2">
        {icon}
        <div className={`min-w-0 ${align.text}`}>
          {presentation.showSkillTitle ? (
            <p
              className={`truncate ${elementTextStyleClass(elementStyles.skillTitle, 'title')}`}
              style={elementTextInlineStyle(elementStyles.skillTitle)}
            >
              {skill}
            </p>
          ) : null}
          {presentation.showSkillDescription ? (
            <p
              className={`mt-0.5 line-clamp-2 leading-snug ${elementTextStyleClass(elementStyles.skillBody, 'body')}`}
              style={elementTextInlineStyle(elementStyles.skillBody)}
            >
              {description}
            </p>
          ) : null}
        </div>
        </ServicesCardForeground>
      </article>
    );
  }

  return (
    <article
      className={`group flex items-center gap-3 ${shellClass} ${frameClass}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex w-full items-center gap-3">
      {icon}
      <div className={`min-w-0 flex-1 ${align.text}`}>
        {presentation.showSkillTitle ? (
          <p
            className={`truncate ${elementTextStyleClass(elementStyles.skillTitle, 'title')}`}
            style={elementTextInlineStyle(elementStyles.skillTitle)}
          >
            {skill}
          </p>
        ) : null}
        {presentation.showSkillDescription ? (
          <p
            className={`mt-0.5 line-clamp-2 leading-snug ${elementTextStyleClass(elementStyles.skillBody, 'body')}`}
            style={elementTextInlineStyle(elementStyles.skillBody)}
          >
            {description}
          </p>
        ) : null}
      </div>
      </ServicesCardForeground>
    </article>
  );
}

function EditorialSkillPricingHeroCard({
  skill,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
  tone = 'light',
}: {
  skill: string;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const shellClass = servicesPricingHeroShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.skillsContentAlignment);
  const description = getSkillUsageDescription(skill);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const iconShellClass = toolsIconShellClass(presentation.skillsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.skillsIconSize);

  return (
    <article
      className={`${shellClass} ${frameClass} flex h-full w-full flex-col ${align.container} ${align.text}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex flex-1 flex-col">
      {presentation.showSkillIcon ? (
        <div
          className={`flex items-center justify-center rounded-[1.1rem] border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 ${iconShellClass}`}
        >
          <CreatorToolLogo label={skill} size={iconPixelSize} className="rounded-xl" />
        </div>
      ) : null}
      {presentation.showSkillTitle ? (
        <h3
          className={`mt-4 leading-tight tracking-[-0.02em] ${elementTextStyleClass(elementStyles.skillTitle, 'title')}`}
          style={elementTextInlineStyle(elementStyles.skillTitle)}
        >
          {skill}
        </h3>
      ) : null}
      {presentation.showSkillDescription ? (
        <p
          className={`mt-2 line-clamp-3 leading-relaxed ${elementTextStyleClass(elementStyles.skillBody, 'body')}`}
          style={elementTextInlineStyle(elementStyles.skillBody)}
        >
          {description}
        </p>
      ) : null}
      </ServicesCardForeground>
    </article>
  );
}

function EditorialSkillAccordionRow({
  skill,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  defaultOpen = false,
  cardIndex = 0,
  tone = 'light',
}: {
  skill: string;
  presentation?: PortfolioServicesPresentationSettings;
  defaultOpen?: boolean;
  cardIndex?: number;
  tone?: EditorialMarqueeCardTone;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const shellClass = servicesAccordionShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.skillsContentAlignment);
  const iconTop = presentation.skillsIconPlacement === 'top';
  const description = getSkillUsageDescription(skill);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const iconShellClass = toolsIconShellClass(presentation.skillsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.skillsIconSize);

  const icon = presentation.showSkillIcon ? (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 ${iconShellClass}`}
    >
      <CreatorToolLogo label={skill} size={iconPixelSize} className="rounded-lg" />
    </div>
  ) : null;

  return (
    <div className={`relative h-full ${shellClass} ${frameClass}`} style={surfaceStyle} {...fillAttrs}>
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex h-full flex-col">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`flex w-full gap-3 text-left ${iconTop ? `flex-col ${align.container}` : `items-center ${align.row}`}`}
        aria-expanded={open}
      >
        {iconTop ? icon : null}
        <div className="flex w-full items-center gap-3">
          {!iconTop ? icon : null}
          <span className={`min-w-0 flex-1 ${align.text}`}>
            {presentation.showSkillTitle ? (
              <span
                className={`block truncate ${elementTextStyleClass(elementStyles.skillTitle, 'title')}`}
                style={elementTextInlineStyle(elementStyles.skillTitle)}
              >
                {skill}
              </span>
            ) : null}
          </span>
          <WorkChevronIcon
            className={`h-4 w-4 shrink-0 text-neutral-400 transition-transform duration-300 ${
              open ? 'rotate-180' : ''
            }`}
          />
        </div>
      </button>
      <div
        className={`grid transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div className={`border-t border-neutral-200/80 pt-3 dark:border-neutral-800 ${align.container}`}>
            {presentation.showSkillDescription ? (
              <p
                className={`leading-relaxed ${elementTextStyleClass(elementStyles.skillBody, 'body')} ${align.text}`}
                style={elementTextInlineStyle(elementStyles.skillBody)}
              >
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>
      </ServicesCardForeground>
    </div>
  );
}

function renderServiceGalleryItem(
  service: ProfileServiceItem,
  presentation: PortfolioServicesPresentationSettings,
  index: number,
  tone: EditorialMarqueeCardTone
) {
  switch (presentation.servicesGalleryLayout) {
    case 'list':
      return (
        <EditorialServiceListRow
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'pricing-hero':
      return (
        <EditorialServicePricingHeroCard
          key={service.id}
          service={service}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'accordion':
      return (
        <EditorialServiceAccordionRow
          key={service.id}
          service={service}
          presentation={presentation}
          defaultOpen={index === 0}
          cardIndex={index}
          tone={tone}
        />
      );
    default:
      return (
        <EditorialServiceCard
          key={service.id}
          service={service}
          tone={tone}
          presentation={presentation}
          cardIndex={index}
        />
      );
  }
}

function renderSkillGalleryItem(
  skill: string,
  presentation: PortfolioServicesPresentationSettings,
  index: number,
  tone: EditorialMarqueeCardTone
) {
  switch (presentation.skillsGalleryLayout) {
    case 'list':
      return (
        <EditorialSkillListRow
          key={skill}
          skill={skill}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'pricing-hero':
      return (
        <EditorialSkillPricingHeroCard
          key={skill}
          skill={skill}
          presentation={presentation}
          cardIndex={index}
          tone={tone}
        />
      );
    case 'accordion':
      return (
        <EditorialSkillAccordionRow
          key={skill}
          skill={skill}
          presentation={presentation}
          defaultOpen={index === 0}
          cardIndex={index}
          tone={tone}
        />
      );
    default:
      return (
        <EditorialSkillCard
          key={skill}
          skill={skill}
          tone={tone}
          presentation={presentation}
          cardIndex={index}
        />
      );
  }
}

/** Framed panel — thin border around skills + services carousels. */
export function EditorialMarqueeStage({
  children,
  stageDesign = 'framed',
}: {
  children: React.ReactNode;
  stageDesign?: PortfolioServicesPresentationSettings['stageDesign'];
}) {
  const shellClass = servicesStageShellClass(stageDesign);
  if (!shellClass) return <>{children}</>;
  return <div className={shellClass}>{children}</div>;
}

export function EditorialSkillCard({
  skill,
  tone = 'light',
  presentation = DEFAULT_SERVICES_PRESENTATION,
  cardIndex = 0,
}: {
  skill: string;
  tone?: EditorialMarqueeCardTone;
  presentation?: PortfolioServicesPresentationSettings;
  cardIndex?: number;
}) {
  const shellClass = servicesCardShellClass(presentation.cardDesign, tone, presentation);
  const frameClass = servicesCardFrameClass(presentation);
  const surfaceStyle = servicesCardSurfaceStyle(presentation, tone);
  const fillAttrs = servicesCardFillDataAttrs(presentation);
  const align = servicesContentAlignClass(presentation.skillsContentAlignment);
  const iconTop = presentation.skillsIconPlacement === 'top';
  const minHeightClass = servicesSkillCardMinHeight(presentation.cardDesign);
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);
  const iconShellClass = toolsIconShellClass(presentation.skillsIconSize);
  const iconPixelSize = toolsIconPixelSize(presentation.skillsIconSize);

  const icon = presentation.showSkillIcon ? (
    <div
      className={`flex shrink-0 items-center justify-center rounded-2xl border border-neutral-200/80 ${iconShellClass}`}
    >
      <CreatorToolLogo label={skill} size={iconPixelSize} className="rounded-xl" />
    </div>
  ) : null;

  return (
    <article
      className={`${shellClass} ${frameClass} ${minHeightClass} flex h-full w-full flex-col ${align.container}`}
      style={surfaceStyle}
      {...fillAttrs}
    >
      <ServicesCardBackgroundLayers presentation={presentation} cardIndex={cardIndex} />
      <ServicesCardForeground className="flex min-h-0 flex-1 flex-col">
      {presentation.showSkillIcon || presentation.showSkillTitle ? (
        <div
          className={`flex w-full ${
            iconTop ? `flex-col gap-3 ${align.container}` : `items-start gap-4 ${align.row}`
          }`}
        >
          {icon}
          {presentation.showSkillTitle ? (
            <div className={`min-w-0 ${iconTop ? '' : 'pt-1'} ${align.text}`}>
              <h3
                className={`leading-tight tracking-[-0.02em] ${elementTextStyleClass(elementStyles.skillTitle, 'title')}`}
                style={elementTextInlineStyle(elementStyles.skillTitle)}
              >
                {skill}
              </h3>
            </div>
          ) : null}
        </div>
      ) : null}
      {presentation.showSkillDescription ? (
        <p
          className={`mt-5 flex-1 leading-relaxed ${elementTextStyleClass(elementStyles.skillBody, 'body')} ${align.text}`}
          style={elementTextInlineStyle(elementStyles.skillBody)}
        >
          {getSkillUsageDescription(skill)}
        </p>
      ) : null}
      </ServicesCardForeground>
    </article>
  );
}

function expandSkillsForMarquee(items: string[], minCount = 4): Array<{ key: string; skill: string }> {
  if (items.length === 0) return [];
  const expanded: Array<{ key: string; skill: string }> = [];
  let copy = 0;
  while (expanded.length < minCount) {
    for (const skill of items) {
      expanded.push({ key: `${skill}-marquee-${copy}-${expanded.length}`, skill });
      if (expanded.length >= minCount) break;
    }
    copy += 1;
  }
  return expanded;
}

function SkillsMarqueeTrack({
  skills,
  startIndex = 0,
  ariaHidden = false,
  presentation = DEFAULT_SERVICES_PRESENTATION,
}: {
  skills: Array<{ key: string; skill: string }>;
  startIndex?: number;
  ariaHidden?: boolean;
  presentation?: PortfolioServicesPresentationSettings;
}) {
  const widthClass = servicesCardWidthClass(presentation.displayMode);
  return (
    <div className="flex shrink-0 items-stretch gap-5 pr-5" aria-hidden={ariaHidden}>
      {skills.map((item, index) => (
        <div key={`${item.key}-${startIndex}`} className={widthClass}>
          {renderSkillGalleryItem(
            item.skill,
            presentation,
            startIndex + index,
            resolveServicesCardTone(
              startIndex + index,
              presentation.cardBackgroundAlternation,
              0
            )
          )}
        </div>
      ))}
    </div>
  );
}

export function EditorialSkillsGallery({
  skills,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  skills: string[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const items = Array.from(new Set(skills.map((item) => item.trim()).filter(Boolean)));
  const trackSkills = useMemo(
    () => expandSkillsForMarquee(items, Math.max(3, items.length)),
    [items]
  );
  const layout = presentation.skillsGalleryLayout;
  const blockPresentation = resolveServicesBlockPresentation(presentation, 'skills');
  const canMarquee =
    servicesGallerySupportsMarquee(layout) &&
    blockPresentation.displayMode === 'marquee' &&
    items.length > 1;

  if (items.length === 0) return null;

  if (!canMarquee) {
    const containerClass = servicesGalleryContainerClass(
      layout,
      blockPresentation.displayMode,
      'skills',
      blockPresentation.skillsColumns
    );
    return (
      <div className={containerClass}>
        {items.map((skill, index) => (
          <PortfolioMotionItem key={skill} profile={motionProfile} index={index} className="h-full">
            {renderSkillGalleryItem(
              skill,
              blockPresentation,
              index,
              resolveServicesCardTone(index, blockPresentation.cardBackgroundAlternation, 0)
            )}
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (items.length === 1) {
    return (
      <div className={servicesCardWidthClass(blockPresentation.displayMode)}>
        {renderSkillGalleryItem(items[0], blockPresentation, 0, 'light')}
      </div>
    );
  }

  const durationSec = Math.max(22, trackSkills.length * 11);

  return (
    <div className="group/skills-marquee overflow-x-hidden overflow-y-visible py-2 pb-3 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
      <div
        className="portfolio-skills-marquee flex w-max items-stretch will-change-transform"
        style={{ animationDuration: `${durationSec}s` }}
      >
        <SkillsMarqueeTrack skills={trackSkills} startIndex={0} presentation={blockPresentation} />
        <SkillsMarqueeTrack
          skills={trackSkills}
          startIndex={trackSkills.length}
          ariaHidden
          presentation={blockPresentation}
        />
      </div>
    </div>
  );
}

export function EditorialSkillShowcase({
  skills,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  skills: string[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  return <EditorialSkillsGallery skills={skills} presentation={presentation} motionProfile={motionProfile} />;
}

function expandServicesForMarquee(items: ProfileServiceItem[], minCount = 4): ProfileServiceItem[] {
  if (items.length === 0) return [];
  const expanded: ProfileServiceItem[] = [];
  let copy = 0;
  while (expanded.length < minCount) {
    for (const item of items) {
      expanded.push({ ...item, id: `${item.id}-marquee-${copy}-${expanded.length}` });
      if (expanded.length >= minCount) break;
    }
    copy += 1;
  }
  return expanded;
}

function ServicesMarqueeTrack({
  services,
  startIndex = 0,
  ariaHidden = false,
  presentation = DEFAULT_SERVICES_PRESENTATION,
}: {
  services: ProfileServiceItem[];
  startIndex?: number;
  ariaHidden?: boolean;
  presentation?: PortfolioServicesPresentationSettings;
}) {
  const widthClass = servicesCardWidthClass(presentation.displayMode);
  return (
    <div className="flex shrink-0 items-stretch gap-5 pr-5" aria-hidden={ariaHidden}>
      {services.map((service, index) => (
        <div key={`${service.id}-${startIndex}`} className={widthClass}>
          {renderServiceGalleryItem(
            service,
            presentation,
            startIndex + index,
            resolveServicesCardTone(
              startIndex + index,
              presentation.cardBackgroundAlternation,
              1
            )
          )}
        </div>
      ))}
    </div>
  );
}

export function EditorialServicesGallery({
  services,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  services: ProfileServiceItem[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const layout = presentation.servicesGalleryLayout;
  const blockPresentation = resolveServicesBlockPresentation(presentation, 'services');
  const canMarquee =
    servicesGallerySupportsMarquee(layout) &&
    blockPresentation.displayMode === 'marquee' &&
    services.length > 1;
  const trackServices = useMemo(() => {
    if (services.length <= 1) return services;
    return expandServicesForMarquee(services, Math.max(3, services.length));
  }, [services]);

  if (services.length === 0) return null;

  if (!canMarquee) {
    const containerClass = servicesGalleryContainerClass(
      layout,
      blockPresentation.displayMode,
      'services',
      blockPresentation.servicesColumns
    );
    return (
      <div className={containerClass}>
        {services.map((service, index) => (
          <PortfolioMotionItem key={service.id} profile={motionProfile} index={index} className="h-full">
            {renderServiceGalleryItem(
              service,
              blockPresentation,
              index,
              resolveServicesCardTone(index, blockPresentation.cardBackgroundAlternation, 1)
            )}
          </PortfolioMotionItem>
        ))}
      </div>
    );
  }

  if (services.length === 1) {
    return (
      <PortfolioMotionItem profile={motionProfile} index={0} className={servicesCardWidthClass(blockPresentation.displayMode)}>
        {renderServiceGalleryItem(services[0], blockPresentation, 0, 'light')}
      </PortfolioMotionItem>
    );
  }

  const durationSec = Math.max(22, trackServices.length * 11);

  return (
    <div className="group/services-marquee overflow-x-hidden overflow-y-visible pb-8 pt-0 [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]">
      <div
        className="portfolio-services-marquee flex w-max items-stretch will-change-transform"
        style={{ animationDuration: `${durationSec}s` }}
      >
        <ServicesMarqueeTrack services={trackServices} startIndex={0} presentation={blockPresentation} />
        <ServicesMarqueeTrack
          services={trackServices}
          startIndex={trackServices.length}
          ariaHidden
          presentation={blockPresentation}
        />
      </div>
    </div>
  );
}

export function EditorialServicesCarousel({
  services,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  services: ProfileServiceItem[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  return <EditorialServicesGallery services={services} presentation={presentation} motionProfile={motionProfile} />;
}

function EditorialServicesBlockSubheading({
  label,
  textStyle,
}: {
  label: string;
  textStyle: PortfolioElementTextStyle;
}) {
  return (
    <p
      className={`mb-4 sm:mb-5 ${elementTextStyleClass(textStyle, 'label')}`}
      style={elementTextInlineStyle(textStyle)}
    >
      {label}
    </p>
  );
}

export function EditorialServicesSkillsSection({
  skills,
  services,
  presentation = DEFAULT_SERVICES_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  skills: string[];
  services: ProfileServiceItem[];
  presentation?: PortfolioServicesPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const showSkillsBlock = presentation.showSkills && skills.length > 0;
  const showServicesBlock = presentation.showServices && services.length > 0;

  if (!showSkillsBlock && !showServicesBlock) return null;

  const skillsPresentation = resolveServicesBlockPresentation(presentation, 'skills');
  const servicesPresentation = resolveServicesBlockPresentation(presentation, 'services');
  const usesSplitBlocks = presentation.sectionOrganization !== 'combined';
  const elementStyles = normalizeServicesElementStyles(presentation.elementStyles);

  const skillsContent = showSkillsBlock ? (
    <div>
      {!usesSplitBlocks && presentation.showSkillsSubheading ? (
        <EditorialServicesBlockSubheading
          label={resolveServicesSkillsSubheadingLabel(presentation)}
          textStyle={elementStyles.blockSubheading}
        />
      ) : null}
      <EditorialSkillShowcase skills={skills} presentation={skillsPresentation} motionProfile={motionProfile} />
    </div>
  ) : null;

  const servicesContent = showServicesBlock ? (
    <div>
      {!usesSplitBlocks && presentation.showServicesSubheading ? (
        <EditorialServicesBlockSubheading
          label={resolveServicesServicesSubheadingLabel(presentation)}
          textStyle={elementStyles.blockSubheading}
        />
      ) : null}
      <EditorialServicesCarousel services={services} presentation={servicesPresentation} motionProfile={motionProfile} />
    </div>
  ) : null;

  const blockEntries = (
    presentation.stackOrder === 'services-first'
      ? [
          { key: 'services', content: servicesContent, stageDesign: servicesPresentation.stageDesign },
          { key: 'skills', content: skillsContent, stageDesign: skillsPresentation.stageDesign },
        ]
      : [
          { key: 'skills', content: skillsContent, stageDesign: skillsPresentation.stageDesign },
          { key: 'services', content: servicesContent, stageDesign: servicesPresentation.stageDesign },
        ]
  ).filter((entry) => entry.content);

  if (usesSplitBlocks) {
    return (
      <div className="flex flex-col gap-8 lg:gap-12">
        {blockEntries.map((entry) => (
          <EditorialMarqueeStage key={entry.key} stageDesign={entry.stageDesign}>
            {entry.content}
          </EditorialMarqueeStage>
        ))}
      </div>
    );
  }

  return (
    <EditorialMarqueeStage stageDesign={presentation.stageDesign}>
      {blockEntries.map((entry, index) => (
        <div key={entry.key} className={index > 0 ? 'mt-6 lg:mt-8' : undefined}>
          {entry.content}
        </div>
      ))}
    </EditorialMarqueeStage>
  );
}

export function StoryBlock({ block }: { block: ProfileMediaBlock }) {
  return <EditorialStoryBlock block={block} />;
}

const WHY_ME_ICONS = [
  function WhyMeSparkIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 2l1.4 4.3L17.5 8l-4.1 1.5L12 14l-1.4-4.5L6.5 8l4.1-1.7L12 2z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 18l.8 2.4 2.4.8-2.4.8L5 24l-.8-2.4-2.4-.8 2.4-.8L5 18zM19 14l.6 1.8 1.8.6-1.8.6L19 19l-.6-1.8-1.8-.6 1.8-.6L19 14z" />
      </svg>
    );
  },
  function WhyMeCheckIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
        <circle cx="12" cy="12" r="9" />
      </svg>
    );
  },
  function WhyMeUsersIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </svg>
    );
  },
  function WhyMeBoltIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
      </svg>
    );
  },
  function WhyMeTargetIcon({ className }: { className?: string }) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="5" />
        <circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    );
  },
] as const;

function EditorialHighlightMediaPreview({
  block,
  className = '',
  aspectClass = 'aspect-[4/5]',
}: {
  block: ProfileMediaBlock;
  className?: string;
  aspectClass?: string;
}) {
  if (!block.mediaUrl) return null;

  return (
    <div
      className={`mx-auto w-full max-w-[15rem] shrink-0 overflow-hidden rounded-2xl border border-neutral-200/80 shadow-sm sm:max-w-[17rem] lg:mx-0 lg:w-[14rem] xl:w-[16rem] ${className}`.trim()}
    >
      <div className={`relative w-full overflow-hidden bg-neutral-950/5 ${aspectClass}`}>
        <ProductThumbnailMedia
          url={block.mediaUrl}
          alt=""
          fit="cover"
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}

function WhyMeCardShell({
  presentation,
  cardIndex = 0,
  className = '',
  children,
}: {
  presentation: PortfolioAboutPresentationSettings;
  cardIndex?: number;
  className?: string;
  children: React.ReactNode;
}) {
  const frameClass = aboutWhyMeFrameClass(presentation);
  const surfaceStyle = aboutWhyMeFrameStyle(presentation);
  const layers = aboutWhyMeLayersSettings(presentation);

  return (
    <article
      className={`relative overflow-hidden ${frameClass} ${aboutWhyMeBlockClass(presentation.whyMeDesign)} ${className}`.trim()}
      style={surfaceStyle}
    >
      <ServicesCardBackgroundLayers presentation={layers} cardIndex={cardIndex} />
      <ServicesCardForeground>{children}</ServicesCardForeground>
    </article>
  );
}

function WhyMeBlockHeader({
  index,
  Icon,
  align,
}: {
  index: number;
  Icon: HighlightIcon;
  align: ReturnType<typeof whyMeContentAlignClass>;
}) {
  const number = String(index + 1).padStart(2, '0');

  return (
    <div className={`flex items-center gap-3.5 ${align.header}`}>
      <span className="text-3xl font-extrabold tabular-nums leading-none tracking-[-0.04em] text-orange-500/75">
        {number}
      </span>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-orange-600 transition group-hover:bg-orange-100">
        <Icon className="h-5 w-5" />
      </div>
      <span className="h-px max-w-[8rem] flex-1 bg-gradient-to-r from-orange-200/80 to-transparent" aria-hidden />
    </div>
  );
}

function WhyMeBlockText({
  block,
  align,
  presentation,
}: {
  block: ProfileMediaBlock;
  align: ReturnType<typeof whyMeContentAlignClass>;
  presentation: PortfolioAboutPresentationSettings;
}) {
  const hasText = Boolean(block.text?.trim());
  const subtitles = (block.subtitles ?? []).map((item) => item.trim()).filter(Boolean);
  const bodyClass = elementTextStyleClass(presentation.elementStyles.whyMeBody, 'body');
  const bodyStyle = elementTextInlineStyle(presentation.elementStyles.whyMeBody);
  const bulletClass = elementTextStyleClass(presentation.elementStyles.whyMeBullet, 'body');
  const bulletStyle = elementTextInlineStyle(presentation.elementStyles.whyMeBullet);

  return (
    <>
      {hasText ? (
        <p className={`mt-5 whitespace-pre-line leading-relaxed ${bodyClass} ${align.text}`} style={bodyStyle}>
          {block.text}
        </p>
      ) : null}
      {subtitles.length > 0 ? (
        <ul className={`mt-5 space-y-2.5 ${align.items === 'items-center' ? 'mx-auto w-fit' : ''}`}>
          {subtitles.map((item, subtitleIndex) => (
            <li
              key={`${subtitleIndex}-${item.slice(0, 24)}`}
              className={`flex items-start gap-3 leading-relaxed ${bulletClass} ${align.text}`}
              style={bulletStyle}
            >
              <span className="relative mt-2 flex h-4 w-4 shrink-0 items-center justify-center" aria-hidden>
                <span className="absolute h-4 w-4 rounded-full bg-orange-500/15" />
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
              </span>
              {item}
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
}

type HighlightIcon = (props: { className?: string }) => React.ReactNode;

function EditorialHighlightBlock({
  block,
  index,
  icons,
  presentation,
  compact = false,
}: {
  block: ProfileMediaBlock;
  index: number;
  icons: readonly HighlightIcon[];
  presentation: PortfolioAboutPresentationSettings;
  compact?: boolean;
}) {
  const hasMedia = Boolean(block.mediaUrl) && presentation.whyMeMediaPlacement !== 'text-only';
  const mediaLayout = resolveWhyMeMediaLayout(presentation.whyMeMediaPlacement, index);
  const align = whyMeContentAlignClass(presentation.whyMeContentAlign);
  const Icon = icons[index % icons.length];

  const flexDirection =
    mediaLayout === 'top'
      ? 'flex-col'
      : mediaLayout === 'left'
        ? 'lg:flex-row-reverse'
        : mediaLayout === 'right'
          ? 'lg:flex-row'
          : hasMedia
            ? index % 2 === 0
              ? 'lg:flex-row'
              : 'lg:flex-row-reverse'
            : '';

  return (
    <WhyMeCardShell presentation={presentation} cardIndex={index}>
      <div
        className={`relative flex flex-col gap-6 lg:items-center lg:gap-8 ${flexDirection} ${
          compact ? '' : ''
        } ${align.items}`}
      >
        {mediaLayout === 'top' && hasMedia ? (
          <EditorialHighlightMediaPreview
            block={block}
            className="max-w-none lg:mx-0 lg:w-full lg:max-w-none"
            aspectClass="aspect-[16/10]"
          />
        ) : null}

        <div className={`min-w-0 flex-1 ${align.text}`}>
          <WhyMeBlockHeader index={index} Icon={Icon} align={align} />
          <WhyMeBlockText block={block} align={align} presentation={presentation} />
        </div>

        {hasMedia && mediaLayout !== 'top' && mediaLayout !== 'hidden' ? (
          <EditorialHighlightMediaPreview block={block} />
        ) : null}
      </div>
    </WhyMeCardShell>
  );
}

function WhyMeGridBlock({
  block,
  index,
  icons,
  presentation,
}: {
  block: ProfileMediaBlock;
  index: number;
  icons: readonly HighlightIcon[];
  presentation: PortfolioAboutPresentationSettings;
}) {
  const align = whyMeContentAlignClass(presentation.whyMeContentAlign);
  const Icon = icons[index % icons.length];
  const hasMedia = Boolean(block.mediaUrl) && presentation.whyMeMediaPlacement !== 'text-only';

  return (
    <WhyMeCardShell presentation={presentation} cardIndex={index} className="h-full">
      <div className={`flex h-full flex-col ${align.items}`}>
        {hasMedia ? (
          <EditorialHighlightMediaPreview
            block={block}
            className="mb-5 max-w-none lg:mx-0 lg:w-full lg:max-w-none"
            aspectClass="aspect-[4/3]"
          />
        ) : null}
        <div className={`min-w-0 flex-1 ${align.text}`}>
          <WhyMeBlockHeader index={index} Icon={Icon} align={align} />
          <WhyMeBlockText block={block} align={align} presentation={presentation} />
        </div>
      </div>
    </WhyMeCardShell>
  );
}

function WhyMeStackedBlock({
  block,
  index,
  icons,
  presentation,
}: {
  block: ProfileMediaBlock;
  index: number;
  icons: readonly HighlightIcon[];
  presentation: PortfolioAboutPresentationSettings;
}) {
  const align = whyMeContentAlignClass(presentation.whyMeContentAlign);
  const Icon = icons[index % icons.length];
  const hasMedia = Boolean(block.mediaUrl) && presentation.whyMeMediaPlacement !== 'text-only';

  return (
    <WhyMeCardShell presentation={presentation} cardIndex={index}>
      {hasMedia ? (
        <EditorialHighlightMediaPreview
          block={block}
          className="mb-6 max-w-none lg:mx-0 lg:w-full lg:max-w-none"
          aspectClass="aspect-[21/9] sm:aspect-[2/1]"
        />
      ) : null}
      <div className={align.text}>
        <WhyMeBlockHeader index={index} Icon={Icon} align={align} />
        <WhyMeBlockText block={block} align={align} presentation={presentation} />
      </div>
    </WhyMeCardShell>
  );
}

export function EditorialWhyMeHeading({
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  presentation?: PortfolioAboutPresentationSettings;
}) {
  if (!presentation.showWhyMeHeading) return null;

  return (
    <h3 className={`mb-6 ${whyMeHeadingClass(presentation)}`} style={whyMeHeadingStyle(presentation)}>
      {resolveWhyMeHeading(presentation)}
    </h3>
  );
}

export function EditorialWhyMeBlock({
  block,
  index,
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  block: ProfileMediaBlock;
  index: number;
  presentation?: PortfolioAboutPresentationSettings;
}) {
  const design = presentation.whyMeDesign;

  if (design === 'grid') {
    return <WhyMeGridBlock block={block} index={index} icons={WHY_ME_ICONS} presentation={presentation} />;
  }

  if (design === 'stacked') {
    return <WhyMeStackedBlock block={block} index={index} icons={WHY_ME_ICONS} presentation={presentation} />;
  }

  return (
    <EditorialHighlightBlock
      block={block}
      index={index}
      icons={WHY_ME_ICONS}
      presentation={presentation}
      compact={design === 'compact' || design === 'minimal'}
    />
  );
}

export function EditorialWhyMeList({
  blocks,
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioAboutPresentationSettings;
}) {
  if (blocks.length === 0) return null;

  const gapClass = whyMeGapClass(presentation.whyMeGap);
  const isGrid = presentation.whyMeDesign === 'grid';

  return (
    <div className={isGrid ? `grid sm:grid-cols-2 ${gapClass}` : `flex flex-col ${gapClass}`}>
      {blocks.map((block, index) => (
        <EditorialWhyMeBlock key={block.id} block={block} index={index} presentation={presentation} />
      ))}
    </div>
  );
}

function splitExperienceText(text: string): { title: string | null; body: string | null } {
  const trimmed = text.trim();
  if (!trimmed) return { title: null, body: null };

  const lines = trimmed.split('\n').map((line) => line.trim()).filter(Boolean);
  if (lines.length > 1) {
    return { title: lines[0], body: lines.slice(1).join('\n') };
  }

  return { title: null, body: trimmed };
}

function resolveExperienceContent(block: ProfileMediaBlock): {
  period: string | null;
  title: string | null;
  organization: string | null;
  description: string | null;
  tags: string[];
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  links: ExperienceProofLink[];
  remarks: string | null;
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
} {
  const subtitles = (block.subtitles ?? []).map((item) => item.trim()).filter(Boolean);
  const period = block.period?.trim() || subtitles[0] || null;
  const tags = block.period?.trim() ? subtitles : subtitles.slice(1);
  const organization = block.organization?.trim() || null;
  const status =
    block.status === 'ONGOING' || block.status === 'FINISHED' ? block.status : null;
  const tasks = (block.tasks ?? []).map((item) => item.trim()).filter(Boolean);
  const tools = Array.from(
    new Set((block.tools ?? []).map((item) => item.trim()).filter(Boolean))
  ).slice(0, 8);
  const links = (block.links ?? [])
    .filter((link) => link.url?.trim() && link.label?.trim())
    .map((link, index) => ({
      id: link.id || `proof-${index}`,
      label: link.label.trim(),
      url: link.url.trim(),
      platform: link.platform ?? null,
      sortOrder: typeof link.sortOrder === 'number' ? link.sortOrder : index,
    }))
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const remarks = block.remarks?.trim() || null;
  const location = block.location?.trim() || null;
  const employmentType = block.employmentType ?? null;

  const dedicatedTitle = block.title?.trim() || null;
  if (dedicatedTitle) {
    return {
      period,
      title: dedicatedTitle,
      organization,
      description: block.text?.trim() || null,
      tags,
      status,
      tasks,
      tools,
      links,
      remarks,
      location,
      employmentType,
    };
  }

  const split = splitExperienceText(block.text ?? '');
  return {
    period,
    title: split.title,
    organization,
    description: split.body,
    tags,
    status,
    tasks,
    tools,
    links,
    remarks,
    location,
    employmentType,
  };
}

const EMPLOYMENT_TYPE_LABELS: Record<ExperienceEmploymentType, string> = {
  FULL_TIME: 'Full-time',
  PART_TIME: 'Part-time',
  CONTRACT: 'Contract',
  FREELANCE: 'Freelance',
  INTERNSHIP: 'Internship',
};

type ExperienceBodyProps = {
  title: string | null;
  organization: string | null;
  description: string | null;
  tags: string[];
  status: ExperienceBlockStatus | null;
  tasks: string[];
  tools: string[];
  links: ExperienceProofLink[];
  remarks: string | null;
  location: string | null;
  employmentType: ExperienceEmploymentType | null;
  accent: string;
  titleClassName?: string;
  layout?: 'stack' | 'split' | 'bento' | 'compact';
  asidePlacement?: PortfolioExperienceAsidePlacement;
  detailsPanelClassName?: string;
  detailsPanelStyle?: CSSProperties;
  storyPanelClassName?: string;
  storyPanelStyle?: CSSProperties;
  density?: 'comfortable' | 'compact';
  elementOrder?: PortfolioExperienceElementId[];
  elementZones?: PortfolioExperienceElementZones;
  toolsZone?: PortfolioExperienceToolsZone;
  toolsEntrySide?: PortfolioExperienceToolsEntrySide;
  toolsDisplay?: PortfolioExperienceToolsDisplay;
  toolsIconSize?: PortfolioExperienceToolsIconSize;
  showBlockLabels?: boolean;
  tasksLabel?: string;
  proofLabel?: string;
  noteLabel?: string;
  skillsLabel?: string;
  toolsLabel?: string;
  skillsTagStyle?: PortfolioExperienceSkillsTagStyle;
  elementStyles?: PortfolioExperienceElementStyles;
};

function ExperienceBlockHeading({
  label,
  show,
  textStyle,
}: {
  label: string;
  show: boolean;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  if (!show || !label.trim()) return null;
  if (!textStyle) {
    return (
      <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-neutral-400">{label}</p>
    );
  }
  return (
    <p
      className={`mb-3 leading-none ${experienceTextStyleClass(textStyle, 'label')}`}
      style={experienceTextInlineStyle(textStyle)}
    >
      {label}
    </p>
  );
}

function ExperienceEntryNote({
  remarks,
  label,
  showLabel,
  labelStyle,
  textStyle,
}: {
  remarks: string | null;
  label: string;
  showLabel: boolean;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  if (!remarks) return null;
  return (
    <div>
      <ExperienceBlockHeading label={label} show={showLabel} textStyle={labelStyle} />
      <p
        className={`leading-relaxed ${textStyle ? experienceTextStyleClass(textStyle, 'body') : 'text-base italic text-neutral-500'}`}
        style={textStyle ? experienceTextInlineStyle(textStyle) : { fontFamily: SERIF }}
      >
        {remarks}
      </p>
    </div>
  );
}

function ExperienceEntrySkillsBlock({
  tags,
  label,
  showLabel,
  tagStyle,
  accent,
  labelStyle,
  textStyle,
}: {
  tags: string[];
  label: string;
  showLabel: boolean;
  tagStyle: PortfolioExperienceSkillsTagStyle;
  accent: string;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  if (tags.length === 0) return null;
  return (
    <div>
      <ExperienceBlockHeading label={label} show={showLabel} textStyle={labelStyle} />
      <ExperienceEntryTags tags={tags} tagStyle={tagStyle} accent={accent} textStyle={textStyle} />
    </div>
  );
}

function renderExperienceElement(
  id: PortfolioExperienceElementId,
  ctx: {
    title: string | null;
    organization: string | null;
    description: string | null;
    tags: string[];
    status: ExperienceBlockStatus | null;
    tasks: string[];
    tools: string[];
    links: ExperienceProofLink[];
    remarks: string | null;
    location: string | null;
    employmentType: ExperienceEmploymentType | null;
    accent: string;
    titleClassName: string;
    denseTasks?: boolean;
    toolsDisplay?: PortfolioExperienceToolsDisplay;
    toolsIconSize?: PortfolioExperienceToolsIconSize;
    showBlockLabels?: boolean;
    tasksLabel?: string;
    proofLabel?: string;
    noteLabel?: string;
    skillsLabel?: string;
    toolsLabel?: string;
    skillsTagStyle?: PortfolioExperienceSkillsTagStyle;
    elementStyles?: PortfolioExperienceElementStyles;
  }
): React.ReactNode {
  const showLabels = ctx.showBlockLabels !== false;
  const styles = normalizeExperienceElementStyles(ctx.elementStyles);
  switch (id) {
    case 'title':
      return ctx.title ? (
        <h4
          className={`leading-snug tracking-[-0.02em] ${experienceTextStyleClass(styles.title, 'title')}`}
          style={experienceTextInlineStyle(styles.title)}
        >
          {ctx.title}
        </h4>
      ) : null;
    case 'organization':
      return ctx.organization ? (
        <p
          className={experienceTextStyleClass(styles.organization, 'body')}
          style={experienceTextInlineStyle(styles.organization)}
        >
          {ctx.organization}
        </p>
      ) : null;
    case 'meta':
      return (
        <ExperienceEntryMeta
          status={ctx.status}
          employmentType={ctx.employmentType}
          location={ctx.location}
          accent={ctx.accent}
          textStyle={styles.meta}
        />
      );
    case 'description':
      return ctx.description ? (
        <p
          className={`max-w-3xl leading-relaxed ${experienceTextStyleClass(styles.description, 'body')}`}
          style={experienceTextInlineStyle(styles.description)}
        >
          {ctx.description}
        </p>
      ) : null;
    case 'tasks':
      return (
        <ExperienceEntryTasks
          tasks={ctx.tasks}
          accent={ctx.accent}
          dense={ctx.denseTasks}
          label={resolveExperienceBlockLabel(ctx.tasksLabel, 'Tasks')}
          showLabel={showLabels}
          labelStyle={styles.blockLabel}
          textStyle={styles.tasks}
        />
      );
    case 'tools':
      return (
        <ExperienceEntryTools
          tools={ctx.tools}
          display={ctx.toolsDisplay ?? 'icons-and-labels'}
          iconSize={ctx.toolsIconSize ?? 'md'}
          label={resolveExperienceBlockLabel(ctx.toolsLabel, 'Tools')}
          showHeading={showLabels && ctx.toolsDisplay !== 'icons'}
          labelStyle={styles.blockLabel}
          textStyle={styles.tools}
        />
      );
    case 'proof':
      return (
        <ExperienceEntryLinks
          links={ctx.links}
          accent={ctx.accent}
          label={resolveExperienceBlockLabel(ctx.proofLabel, 'Proof')}
          showLabel={showLabels}
          labelStyle={styles.blockLabel}
          textStyle={styles.proof}
        />
      );
    case 'note':
      return (
        <ExperienceEntryNote
          remarks={ctx.remarks}
          label={resolveExperienceBlockLabel(ctx.noteLabel, 'Note')}
          showLabel={showLabels}
          labelStyle={styles.blockLabel}
          textStyle={styles.note}
        />
      );
    case 'skills':
      return (
        <ExperienceEntrySkillsBlock
          tags={ctx.tags}
          label={resolveExperienceBlockLabel(ctx.skillsLabel, 'Skills')}
          showLabel={showLabels}
          tagStyle={ctx.skillsTagStyle ?? 'soft'}
          accent={ctx.accent}
          labelStyle={styles.blockLabel}
          textStyle={styles.skills}
        />
      );
    default:
      return null;
  }
}

function ExperienceOrderedColumn({
  ids,
  className,
  style,
  childrenGapClass,
  render,
}: {
  ids: PortfolioExperienceElementId[];
  className?: string;
  style?: CSSProperties;
  childrenGapClass: string;
  render: (id: PortfolioExperienceElementId) => React.ReactNode;
}) {
  const nodes = ids.map((id) => ({ id, node: render(id) })).filter((item) => item.node != null);
  if (nodes.length === 0) return null;
  return (
    <div className={[childrenGapClass, className].filter(Boolean).join(' ')} style={style}>
      {nodes.map((item) => (
        <Fragment key={item.id}>{item.node}</Fragment>
      ))}
    </div>
  );
}

function ExperienceEntryTags({
  tags,
  tagStyle = 'soft',
  accent,
  textStyle,
}: {
  tags: string[];
  tagStyle?: PortfolioExperienceSkillsTagStyle;
  accent?: string;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  if (tags.length === 0) return null;
  const typeClass = textStyle ? experienceTextStyleClass(textStyle, 'body') : 'text-sm font-medium';
  const typeStyle = textStyle ? experienceTextInlineStyle(textStyle) : undefined;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        if (tagStyle === 'plain') {
          return (
            <span key={tag} className={typeClass} style={typeStyle}>
              {tag}
            </span>
          );
        }
        if (tagStyle === 'pill') {
          return (
            <span
              key={tag}
              className={`inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 ${typeClass}`}
              style={typeStyle}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ backgroundColor: accent ?? '#ea580c' }}
                aria-hidden
              />
              {tag}
            </span>
          );
        }
        if (tagStyle === 'outline') {
          return (
            <span
              key={tag}
              className={`inline-flex items-center rounded-full border border-neutral-200 bg-white px-3.5 py-2 ${typeClass}`}
              style={typeStyle}
            >
              {tag}
            </span>
          );
        }
        return (
          <span
            key={tag}
            className={`rounded-full bg-neutral-100 px-3.5 py-1.5 transition group-hover:bg-neutral-200/80 ${typeClass}`}
            style={typeStyle}
          >
            {tag}
          </span>
        );
      })}
    </div>
  );
}

function ExperienceEntryMeta({
  status,
  employmentType,
  location,
  accent,
  textStyle,
}: {
  status: ExperienceBlockStatus | null;
  employmentType: ExperienceEmploymentType | null;
  location: string | null;
  accent: string;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  const chips: { key: string; label: string; strong?: boolean }[] = [];
  if (status === 'ONGOING') chips.push({ key: 'status', label: 'Ongoing', strong: true });
  if (status === 'FINISHED') chips.push({ key: 'status', label: 'Finished' });
  if (employmentType) chips.push({ key: 'employment', label: EMPLOYMENT_TYPE_LABELS[employmentType] });
  if (location) chips.push({ key: 'location', label: location });
  if (chips.length === 0) return null;

  const typeClass = textStyle
    ? experienceTextStyleClass(textStyle, 'label')
    : 'text-xs font-semibold uppercase tracking-[0.12em]';

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <span
          key={chip.key}
          className={`inline-flex rounded-full px-3 py-1.5 ${typeClass} ${
            chip.strong ? 'text-white' : 'bg-neutral-100'
          }`}
          style={
            chip.strong
              ? { backgroundColor: accent, color: '#ffffff' }
              : textStyle
                ? experienceTextInlineStyle(textStyle)
                : undefined
          }
        >
          {chip.label}
        </span>
      ))}
    </div>
  );
}

function ExperienceEntryTasks({
  tasks,
  accent,
  dense = false,
  label = 'Tasks',
  showLabel = true,
  labelStyle,
  textStyle,
}: {
  tasks: string[];
  accent: string;
  dense?: boolean;
  label?: string;
  showLabel?: boolean;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  if (tasks.length === 0) return null;

  return (
    <div>
      <ExperienceBlockHeading label={label} show={showLabel} textStyle={labelStyle} />
      <ul
        className={`space-y-3 leading-relaxed ${
          textStyle
            ? experienceTextStyleClass(textStyle, 'body')
            : dense
              ? 'text-base text-neutral-600'
              : 'text-base text-neutral-600 sm:text-[1.05rem]'
        }`}
        style={textStyle ? experienceTextInlineStyle(textStyle) : undefined}
      >
        {tasks.map((task) => (
          <li key={task} className="flex gap-3">
            <span
              className="mt-2.5 h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: accent }}
              aria-hidden
            />
            <span>{task}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ExperienceEntryLinks({
  links,
  accent,
  label = 'Proof',
  showLabel = true,
  labelStyle,
  textStyle,
}: {
  links: ExperienceProofLink[];
  accent: string;
  label?: string;
  showLabel?: boolean;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  if (links.length === 0) return null;
  const typeClass = textStyle ? experienceTextStyleClass(textStyle, 'body') : 'text-sm font-semibold';
  const typeStyle = textStyle ? experienceTextInlineStyle(textStyle) : undefined;

  return (
    <div>
      <ExperienceBlockHeading label={label} show={showLabel} textStyle={labelStyle} />
      <div className="flex flex-wrap gap-2">
        {links.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3.5 py-2 transition hover:-translate-y-0.5 hover:border-neutral-300 hover:shadow-sm ${typeClass}`}
            style={typeStyle}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: accent }} aria-hidden />
            {link.label}
            <span aria-hidden className="text-neutral-400">
              ↗
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}

function ExperienceEntryTools({
  tools,
  display = 'icons-and-labels',
  iconSize = 'md',
  label = 'Tools',
  showHeading = true,
  labelStyle,
  textStyle,
}: {
  tools: string[];
  display?: PortfolioExperienceToolsDisplay;
  iconSize?: PortfolioExperienceToolsIconSize;
  label?: string;
  showHeading?: boolean;
  labelStyle?: PortfolioExperienceTextStyle;
  textStyle?: PortfolioExperienceTextStyle;
}) {
  if (tools.length === 0) return null;
  const iconsOnly = display === 'icons';
  const pixel = experienceToolsIconPixelSize(iconSize);
  const shell = experienceToolsIconShellClass(iconSize);
  const typeClass = textStyle ? experienceTextStyleClass(textStyle, 'body') : 'text-sm font-medium';
  const typeStyle = textStyle ? experienceTextInlineStyle(textStyle) : undefined;

  return (
    <div>
      <ExperienceBlockHeading label={label} show={showHeading} textStyle={labelStyle} />
      <div className={`flex flex-wrap ${iconsOnly ? 'gap-2.5' : 'gap-2'}`}>
        {tools.map((tool) =>
          iconsOnly ? (
            <span
              key={tool}
              className={`inline-flex ${shell} items-center justify-center rounded-full border border-neutral-200 bg-white`}
              title={tool}
            >
              <CreatorToolLogo label={tool} size={pixel} />
            </span>
          ) : (
            <span
              key={tool}
              className={`inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-2 pl-2 pr-3.5 ${typeClass}`}
              style={typeStyle}
              title={tool}
            >
              <CreatorToolLogo label={tool} size={pixel} />
              <span className="max-w-[9rem] truncate">{tool}</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}

function ExperienceEntryBody({
  title,
  organization,
  description,
  tags,
  status,
  tasks,
  tools,
  links,
  remarks,
  location,
  employmentType,
  accent,
  titleClassName = 'text-2xl font-bold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-3xl',
  layout = 'split',
  asidePlacement = 'right',
  detailsPanelClassName,
  detailsPanelStyle,
  storyPanelClassName,
  storyPanelStyle,
  density = 'comfortable',
  elementOrder,
  elementZones,
  toolsZone = 'details',
  toolsEntrySide = 'left',
  toolsDisplay = 'icons-and-labels',
  toolsIconSize = 'md',
  showBlockLabels = true,
  tasksLabel = '',
  proofLabel = '',
  noteLabel = '',
  skillsLabel = '',
  toolsLabel = '',
  skillsTagStyle = 'soft',
  elementStyles,
}: ExperienceBodyProps) {
  const order = normalizeExperienceElementOrder(elementOrder);
  const zones = normalizeExperienceElementZones(elementZones);
  const styles = normalizeExperienceElementStyles(elementStyles);
  const storyOrder = order.filter((id) => isExperienceStoryElement(id, toolsZone, zones));
  const detailsOrder = order.filter((id) => isExperienceDetailsElement(id, toolsZone, zones));
  const sectionGap = density === 'compact' ? 'space-y-3' : 'space-y-4';
  const storyClassName = storyPanelClassName ?? sectionGap;
  const asideClassName =
    detailsPanelClassName ??
    (density === 'compact'
      ? 'space-y-4 rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-4'
      : 'space-y-6 rounded-2xl border border-neutral-200/70 bg-neutral-50/70 p-5 sm:p-6');

  const elementCtx = {
    title,
    organization,
    description,
    tags,
    status,
    tasks,
    tools,
    links,
    remarks,
    location,
    employmentType,
    accent,
    titleClassName,
    toolsDisplay,
    toolsIconSize,
    showBlockLabels,
    tasksLabel,
    proofLabel,
    noteLabel,
    skillsLabel,
    toolsLabel,
    skillsTagStyle,
    elementStyles: styles,
  };

  const storyColumn = (
    <ExperienceOrderedColumn
      ids={storyOrder}
      className={storyClassName}
      style={storyPanelStyle}
      childrenGapClass={sectionGap}
      render={(id) => renderExperienceElement(id, elementCtx)}
    />
  );

  const detailsAside = (
    <ExperienceOrderedColumn
      ids={detailsOrder}
      className={asideClassName}
      style={detailsPanelStyle}
      childrenGapClass={sectionGap}
      render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
    />
  );

  const entryToolsInline =
    toolsZone === 'entry' && tools.length > 0 ? (
      <div className="mt-4 pt-1">
        <ExperienceEntryTools
          tools={tools}
          display={toolsDisplay}
          iconSize={toolsIconSize}
          showHeading={false}
        />
      </div>
    ) : null;

  const withEntryToolsBelow = (content: React.ReactNode) => (
    <div className="min-w-0">
      {content}
      {toolsZone === 'entry' && tools.length > 0 && layout !== 'split' ? (
        <div
          className={`mt-4 pt-1 ${
            toolsEntrySide === 'right' ? 'flex justify-end' : 'flex justify-start'
          }`}
        >
          <ExperienceEntryTools
            tools={tools}
            display={toolsDisplay}
            iconSize={toolsIconSize}
            showHeading={false}
          />
        </div>
      ) : null}
    </div>
  );

  if (layout === 'compact') {
    return withEntryToolsBelow(
      <div className="grid gap-6 md:grid-cols-[minmax(0,1.35fr)_minmax(14rem,0.85fr)]">
        <ExperienceOrderedColumn
          ids={[
            ...storyOrder,
            ...detailsOrder.filter((id) => id === 'note' || id === 'skills' || id === 'tools'),
          ]}
          className={storyClassName}
          style={storyPanelStyle}
          childrenGapClass={sectionGap}
          render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
        />
        <ExperienceOrderedColumn
          ids={detailsOrder.filter((id) => id === 'tasks' || id === 'proof')}
          className={asideClassName}
          style={detailsPanelStyle}
          childrenGapClass={density === 'compact' ? 'space-y-4' : 'space-y-5'}
          render={(id) => renderExperienceElement(id, { ...elementCtx, denseTasks: true })}
        />
      </div>
    );
  }

  if (layout === 'bento') {
    const zoneClass = detailsPanelClassName || 'rounded-2xl border border-neutral-200/80 bg-white/80 p-5';
    return withEntryToolsBelow(
      <>
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4 sm:mb-8">
          <ExperienceOrderedColumn
            ids={storyOrder.filter((id) => id === 'title' || id === 'organization')}
            className="min-w-0 max-w-3xl"
            childrenGapClass={sectionGap}
            render={(id) => renderExperienceElement(id, elementCtx)}
          />
          {storyOrder.includes('meta') ? renderExperienceElement('meta', elementCtx) : null}
        </div>
        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 xl:grid-cols-12">
          <ExperienceOrderedColumn
            ids={[
              ...storyOrder.filter((id) => id === 'description' || id === 'tools'),
              ...detailsOrder.filter((id) => id === 'note' || id === 'tools'),
            ]}
            className={`md:col-span-2 xl:col-span-6 ${storyClassName}`}
            style={storyPanelStyle}
            childrenGapClass={sectionGap}
            render={(id) => renderExperienceElement(id, elementCtx)}
          />
          <ExperienceOrderedColumn
            ids={detailsOrder.filter((id) => id === 'tasks')}
            className={`${zoneClass} xl:col-span-3`}
            style={detailsPanelStyle}
            childrenGapClass={sectionGap}
            render={(id) => renderExperienceElement(id, elementCtx)}
          />
          <ExperienceOrderedColumn
            ids={detailsOrder.filter((id) => id === 'proof' || id === 'skills')}
            className={`${zoneClass} xl:col-span-3`}
            style={detailsPanelStyle}
            childrenGapClass={sectionGap}
            render={(id) => renderExperienceElement(id, elementCtx)}
          />
        </div>
      </>
    );
  }

  if (layout === 'stack') {
    const stackOrder = toolsZone === 'entry' ? order.filter((id) => id !== 'tools') : order;
    return withEntryToolsBelow(
      <ExperienceOrderedColumn
        ids={stackOrder}
        className={storyClassName}
        style={storyPanelStyle}
        childrenGapClass={sectionGap}
        render={(id) => renderExperienceElement(id, elementCtx)}
      />
    );
  }

  // Split: tools sit directly under the chosen column card (not at the absolute entry bottom).
  const leftColumn = asidePlacement === 'left' ? detailsAside : storyColumn;
  const rightColumn = asidePlacement === 'left' ? storyColumn : detailsAside;

  return (
    <div className="min-w-0">
      <div className="grid gap-6 sm:gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(15rem,0.9fr)] xl:items-start">
        <div className="min-w-0">
          {leftColumn}
          {toolsEntrySide === 'left' ? entryToolsInline : null}
        </div>
        <div className="min-w-0">
          {rightColumn}
          {toolsEntrySide === 'right' ? entryToolsInline : null}
        </div>
      </div>
    </div>
  );
}

function ExperienceTimelineRail({
  accent,
  isLast,
  filled = false,
}: {
  accent: string;
  isLast: boolean;
  filled?: boolean;
}) {
  return (
    <div className="relative flex h-full min-h-[5rem] justify-center">
      {!isLast ? (
        <div
          className={`absolute bottom-0 top-3 w-px ${filled ? 'opacity-80' : 'bg-neutral-200'}`}
          style={filled ? { backgroundColor: accent } : undefined}
          aria-hidden
        />
      ) : null}
      <div
        className={`relative z-[1] mt-1.5 shrink-0 rounded-full ${
          filled
            ? 'h-3.5 w-3.5 shadow-[0_0_0_4px_rgba(255,255,255,1)]'
            : 'h-3.5 w-3.5 border-2 bg-white'
        }`}
        style={filled ? { backgroundColor: accent } : { borderColor: accent }}
        aria-hidden
      />
    </div>
  );
}

export function EditorialExperienceYears({
  years,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  years: number;
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  const template = resolveExperienceYearsTemplate(presentation);
  const marker = '{years}';
  const markerIndex = template.indexOf(marker);

  if (markerIndex === -1) {
    return (
      <p className={experienceYearsClass(presentation)} style={experienceYearsStyle(presentation)}>
        {template.replaceAll(marker, String(years))}
      </p>
    );
  }

  const before = template.slice(0, markerIndex);
  const after = template.slice(markerIndex + marker.length);
  const yearsNode = presentation.yearsBoldYears ? (
    <span className="font-bold" style={experienceYearsHighlightStyle(presentation)}>
      {years}
    </span>
  ) : (
    <span style={experienceYearsHighlightStyle(presentation)}>{years}</span>
  );

  return (
    <p className={experienceYearsClass(presentation)} style={experienceYearsStyle(presentation)}>
      {before}
      {yearsNode}
      {after}
    </p>
  );
}

export function EditorialExperienceBlock({
  block,
  index = 0,
  isLast = false,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
  inMultiColumn = false,
}: {
  block: ProfileMediaBlock;
  index?: number;
  isLast?: boolean;
  presentation?: PortfolioExperiencePresentationSettings;
  /** When true, prefer stacked body layout (cards in a 2–3 column grid). */
  inMultiColumn?: boolean;
}) {
  const {
    period,
    title,
    organization,
    description,
    tags,
    status,
    tasks,
    tools,
    links,
    remarks,
    location,
    employmentType,
  } = resolveExperienceContent(block);
  const accent = experienceAccentColor(presentation.accentColor);
  const design = presentation.experienceDesign;
  const shellClass = experienceEntryShellClass(presentation);
  const shellStyle = experienceEntryShellStyle(presentation);
  const bodyLayout = resolveExperienceBodyLayout(presentation, inMultiColumn);
  const detailsClass = experienceDetailsPanelClass(presentation);
  const detailsStyle = experienceDetailsPanelStyle(presentation);
  const storyClass = experienceStoryPanelClass(presentation);
  const storyStyle = experienceStoryPanelStyle(presentation);
  const bodyProps: ExperienceBodyProps = {
    title: presentation.showTitle ? title : null,
    organization: presentation.showOrganization ? organization : null,
    description: presentation.showDescription ? description : null,
    tags: presentation.showSkills ? tags : [],
    status: presentation.showMeta ? status : null,
    tasks: presentation.showTasks ? tasks : [],
    tools: presentation.showTools ? tools : [],
    links: presentation.showProof ? links : [],
    remarks: presentation.showNote ? remarks : null,
    location: presentation.showMeta ? location : null,
    employmentType: presentation.showMeta ? employmentType : null,
    accent,
    asidePlacement: presentation.asidePlacement,
    detailsPanelClassName: detailsClass || undefined,
    detailsPanelStyle: detailsStyle,
    storyPanelClassName: storyClass || undefined,
    storyPanelStyle: storyStyle,
    density: presentation.itemDensity,
    elementOrder: presentation.elementOrder,
    elementZones: presentation.elementZones,
    toolsZone: presentation.toolsZone,
    toolsEntrySide: presentation.toolsEntrySide,
    toolsDisplay: presentation.toolsDisplay,
    toolsIconSize: presentation.toolsIconSize,
    showBlockLabels: presentation.showBlockLabels,
    tasksLabel: presentation.tasksLabel,
    proofLabel: presentation.proofLabel,
    noteLabel: presentation.noteLabel,
    skillsLabel: presentation.skillsLabel,
    toolsLabel: presentation.toolsLabel,
    skillsTagStyle: presentation.skillsTagStyle,
    elementStyles: presentation.elementStyles,
  };
  const visiblePeriod = presentation.showPeriod ? period : null;

  if (design === 'large') {
    return (
      <article
        className={`${shellClass} h-full ${inMultiColumn ? 'mb-0' : 'mb-8 last:mb-0'}`}
        style={shellStyle}
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 sm:mb-6">
          {visiblePeriod ? (
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-400 sm:text-sm">
              {visiblePeriod}
            </p>
          ) : (
            <span />
          )}
          <span className="hidden h-px min-w-[3rem] flex-1 bg-neutral-200 sm:block" aria-hidden />
          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
            Role {String(index + 1).padStart(2, '0')}
          </span>
        </div>
        <ExperienceEntryBody
          {...bodyProps}
          layout={inMultiColumn ? 'stack' : bodyLayout === 'stack' ? 'stack' : 'bento'}
          titleClassName={
            inMultiColumn
              ? 'text-2xl font-bold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-3xl'
              : 'text-3xl font-bold leading-[1.05] tracking-[-0.03em] text-neutral-950 sm:text-4xl lg:text-5xl'
          }
        />
      </article>
    );
  }

  if (design === 'stacked') {
    return (
      <article className={`${shellClass} h-full`} style={shellStyle}>
        <div className="mb-4 flex flex-wrap items-center gap-3 sm:mb-5">
          {visiblePeriod ? (
            <span
              className="inline-flex rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em]"
              style={{ backgroundColor: `${accent}14`, color: accent }}
            >
              {visiblePeriod}
            </span>
          ) : null}
        </div>
        <ExperienceEntryBody
          {...bodyProps}
          layout={bodyLayout}
          titleClassName="text-xl font-bold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-2xl lg:text-3xl"
        />
      </article>
    );
  }

  if (design === 'compact') {
    return (
      <article className={shellClass} style={shellStyle}>
        <div className="grid gap-3 sm:gap-4 md:grid-cols-[6.5rem_minmax(0,1fr)] lg:grid-cols-[7.5rem_minmax(0,1fr)] lg:gap-8">
          <p className="text-sm font-semibold tabular-nums text-neutral-400 md:pt-1">
            {visiblePeriod ?? '—'}
          </p>
          <ExperienceEntryBody {...bodyProps} layout="compact" />
        </div>
      </article>
    );
  }

  if (design === 'timeline-accent') {
    return (
      <article className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-[5.5rem_1.5rem_minmax(0,1fr)] sm:gap-x-4 sm:pb-2 md:grid-cols-[7rem_2rem_minmax(0,1fr)] md:gap-x-6 lg:grid-cols-[8.5rem_2.25rem_minmax(0,1fr)]">
        <p className="text-sm font-semibold tabular-nums leading-snug sm:pt-1 sm:text-base" style={{ color: accent }}>
          {visiblePeriod ?? '—'}
        </p>
        <div className="hidden sm:block">
          <ExperienceTimelineRail accent={accent} isLast={isLast} filled />
        </div>
        <div className={`min-w-0 sm:pb-12 ${shellClass}`} style={shellStyle}>
          <ExperienceEntryBody {...bodyProps} layout={bodyLayout} />
        </div>
      </article>
    );
  }

  if (design === 'timeline-editorial') {
    return (
      <article className="relative mb-4 border-b border-neutral-200/80 pb-10 last:mb-0 last:border-b-0 last:pb-0 sm:pb-12">
        <div
          className="absolute bottom-0 left-0 top-0 hidden w-1 rounded-full lg:block"
          style={{ backgroundColor: accent }}
          aria-hidden
        />
        <div className={`lg:pl-8 ${shellClass}`} style={shellStyle}>
          <div className="mb-5 flex flex-wrap items-center gap-3 sm:mb-6">
            {visiblePeriod ? (
              <span
                className="inline-flex rounded-full px-3.5 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em]"
                style={{ backgroundColor: `${accent}16`, color: accent }}
              >
                {visiblePeriod}
              </span>
            ) : null}
            <span className="hidden h-px flex-1 bg-neutral-200 sm:block" aria-hidden />
          </div>
          <ExperienceEntryBody
            {...bodyProps}
            layout={bodyLayout}
            titleClassName="text-2xl font-bold leading-[1.1] tracking-[-0.03em] text-neutral-950 sm:text-3xl lg:text-4xl"
          />
        </div>
      </article>
    );
  }

  if (design === 'timeline-stepped') {
    const step = String(index + 1).padStart(2, '0');

    return (
      <article className={`${shellClass} h-full ${inMultiColumn ? 'mb-0' : 'mb-5 last:mb-0'}`} style={shellStyle}>
        <div className={`grid gap-5 ${inMultiColumn ? '' : 'lg:grid-cols-[5rem_minmax(0,1fr)] lg:gap-8'}`}>
          <div className="flex items-center gap-4 lg:items-start lg:block">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black tabular-nums tracking-[0.08em] text-white sm:h-12 sm:w-12"
              style={{ backgroundColor: accent }}
            >
              {step}
            </div>
            {visiblePeriod ? (
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-400 lg:mt-4">
                {visiblePeriod}
              </p>
            ) : null}
          </div>
          <ExperienceEntryBody
            {...bodyProps}
            layout={bodyLayout}
            titleClassName="text-xl font-bold leading-snug tracking-[-0.02em] text-neutral-950 sm:text-2xl lg:text-3xl"
          />
        </div>
      </article>
    );
  }

  return (
    <article className="grid grid-cols-1 gap-4 pb-8 sm:grid-cols-[5.5rem_1.5rem_minmax(0,1fr)] sm:gap-x-4 md:grid-cols-[7rem_2rem_minmax(0,1fr)] md:gap-x-6 lg:grid-cols-[8.5rem_2.25rem_minmax(0,1fr)]">
      <p className="text-sm font-medium tabular-nums leading-snug text-neutral-400 sm:pt-1 sm:text-base">
        {visiblePeriod ?? '—'}
      </p>
      <div className="hidden sm:block">
        <ExperienceTimelineRail accent={accent} isLast={isLast} />
      </div>
      <div className={`min-w-0 sm:pb-12 ${shellClass}`} style={shellStyle}>
        <ExperienceEntryBody {...bodyProps} layout={bodyLayout} />
      </div>
    </article>
  );
}

export function EditorialExperienceList({
  blocks,
  presentation = DEFAULT_EXPERIENCE_PRESENTATION,
}: {
  blocks: ProfileMediaBlock[];
  presentation?: PortfolioExperiencePresentationSettings;
}) {
  if (blocks.length === 0) return null;

  const design = presentation.experienceDesign;
  const itemsPerRow = resolveExperienceItemsPerRow(design, presentation.itemsPerRow);
  const inMultiColumn = itemsPerRow > 1;
  const gridClass = experienceItemsPerRowGridClass(itemsPerRow, design, presentation.itemGap);
  const listGap = inMultiColumn
    ? ''
    : experienceDesignUsesEntryCard(design) || design === 'large' || design === 'compact'
      ? `flex flex-col ${experienceItemGapClass(presentation.itemGap)}`
      : 'space-y-0';

  return (
    <div className={experienceListShellClass(presentation.listMaxWidth, presentation.listPlacement)}>
      <div className={`${gridClass} ${listGap}`.trim()}>
        {blocks.map((block, index) => (
          <EditorialExperienceBlock
            key={block.id}
            block={block}
            index={index}
            isLast={index === blocks.length - 1}
            presentation={presentation}
            inMultiColumn={inMultiColumn}
          />
        ))}
      </div>
    </div>
  );
}

export function EditorialStoryBlock({ block }: { block: ProfileMediaBlock }) {
  const hasText = Boolean(block.text?.trim());

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-neutral-200/80 bg-white shadow-sm">
      {hasText ? (
        <div
          className={`px-6 py-5 sm:px-7 sm:py-6${block.mediaUrl ? ' border-b border-neutral-100' : ''}`}
        >
          <p
            className="whitespace-pre-line text-base leading-relaxed text-neutral-600 sm:text-[1.02rem]"
            style={{ fontFamily: SERIF }}
          >
            {block.text}
          </p>
        </div>
      ) : null}
      {block.mediaUrl ? (
        <div className="aspect-[2/1] max-h-[16rem] w-full overflow-hidden bg-neutral-100 sm:max-h-[18rem]">
          <ContentMediaPreview locale="en" mediaUrl={block.mediaUrl} mediaType="FILE" large fluid />
        </div>
      ) : null}
    </article>
  );
}

function AboutStatCalendarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M8 3v4M16 3v4M3 10h18" />
    </svg>
  );
}

function AboutStatFolderIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M4 7h5l2 2h9a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" />
    </svg>
  );
}

function AboutStatGlobeIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.8 2.5 16.2 0 18M12 3c-2.5 2.8-2.5 16.2 0 18" />
    </svg>
  );
}

function AboutStatStarIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path d="M12 3.5l2.35 4.76 5.25.77-3.8 3.7.9 5.23L12 15.9l-4.7 2.47.9-5.23-3.8-3.7 5.25-.77L12 3.5z" />
    </svg>
  );
}

function AboutStatEditorialIcon({
  label,
  iconStyle,
  iconSizeClass,
}: {
  label: string;
  iconStyle: React.CSSProperties;
  iconSizeClass: string;
}) {
  const iconClass = `${iconSizeClass} shrink-0`;
  if (isAboutRatingStat(label)) return <AboutStatStarIcon className={iconClass} style={iconStyle} />;
  switch (label.toLowerCase()) {
    case 'content':
    case 'projects':
      return <AboutStatFolderIcon className={iconClass} style={iconStyle} />;
    case 'languages':
      return <AboutStatGlobeIcon className={iconClass} style={iconStyle} />;
    default:
      return <AboutStatCalendarIcon className={iconClass} style={iconStyle} />;
  }
}

function getAboutStatTypography(presentation: PortfolioAboutPresentationSettings, accent: string) {
  const labelClass = [
    aboutStatLabelSizeClass(presentation.statsLabelSize),
    aboutStatLabelWeightClass(presentation.statsLabelWeight),
    aboutStatLabelTrackingClass(presentation.statsLabelTracking),
    aboutStatFontClass(presentation.statsLabelFont, 'label'),
    presentation.statsLabelUppercase ? 'uppercase' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelStyle = {
    ...aboutStatLabelColorStyle(presentation.statsLabelColor),
    ...aboutStatFontStyle(presentation.statsLabelFont),
  };

  const iconStyle = aboutStatIconColorStyle(presentation.statsIconColor);
  const iconSizeClass = aboutStatIconSizeClass(presentation.statsIconSize);

  return {
    labelClass,
    labelStyle,
    iconStyle,
    iconSizeClass,
    valueClass: (context: AboutStatValueSizeContext) =>
      [
        aboutStatValueSizeClass(presentation.statsValueSize, context),
        aboutStatValueWeightClass(presentation.statsValueWeight),
        aboutStatFontClass(presentation.statsValueFont, 'value'),
      ].join(' '),
    valueStyle: (statLabel: string) => ({
      ...aboutStatValueColorStyle(presentation, statLabel, accent),
      ...aboutStatFontStyle(presentation.statsValueFont),
    }),
  };
}

function AboutStatCardShell({
  presentation,
  className = '',
  contentClassName = '',
  includePadding = true,
  children,
}: {
  presentation: PortfolioAboutPresentationSettings;
  className?: string;
  contentClassName?: string;
  includePadding?: boolean;
  children: React.ReactNode;
}) {
  const frameClass = aboutStatCardFrameClass(presentation, { includePadding });
  const surfaceStyle = aboutStatCardFrameStyle(presentation);

  return (
    <div className={`relative overflow-hidden ${frameClass} ${className}`.trim()} style={surfaceStyle}>
      <ServicesCardBackgroundLayers presentation={presentation} />
      <ServicesCardForeground className={contentClassName}>{children}</ServicesCardForeground>
    </div>
  );
}

function AboutUnifiedBandStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const typography = getAboutStatTypography(presentation, accent);
  const gapPx =
    presentation.statsGroupMode === 'unified'
      ? Math.max(12, presentation.statsGap)
      : Math.max(16, presentation.statsGap);
  const gapStyle = aboutStatsGapStyle(gapPx);
  const centerClass = aboutStatsAutoCenterClass(presentation.statsAutoCenter);

  // Always separate cards with gap — no shared bar / vertical dividers.
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-4 ${centerClass} ${
        presentation.statsAutoCenter ? 'justify-items-center' : ''
      }`}
      style={gapStyle}
    >
      {stats.map((stat, index) => (
        <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index} className="h-full">
          <AboutStatCardShell
            presentation={presentation}
            className={presentation.statsAutoCenter ? 'w-full min-w-[8.5rem] max-w-[12rem]' : undefined}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <p className={typography.valueClass('band')} style={typography.valueStyle(stat.label)}>
                {stat.value}
              </p>
              <p className={`mt-2 ${typography.labelClass}`} style={typography.labelStyle}>
                {stat.label}
              </p>
            </div>
          </AboutStatCardShell>
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

function AboutFeaturedStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const featured = stats.find((stat) => isAboutRatingStat(stat.label)) ?? stats[0];
  const secondary = stats.filter((stat) => stat !== featured);
  const typography = getAboutStatTypography(presentation, accent);
  const gapStyle = aboutStatsGapStyle(presentation.statsGap);
  const centerClass = presentation.statsAutoCenter ? 'justify-center' : '';

  return (
    <div className={`grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] ${centerClass} ${aboutStatsAutoCenterClass(presentation.statsAutoCenter)}`} style={gapStyle}>
      <PortfolioMotionItem profile={motionProfile} index={0}>
        <AboutStatCardShell presentation={presentation}>
          <div className="flex items-start gap-3">
            <p className={typography.valueClass('featured')} style={typography.valueStyle(featured.label)}>
              {featured.value}
            </p>
            {isAboutRatingStat(featured.label) ? (
              <AboutStatStarIcon
                className={`${typography.iconSizeClass} mt-2 shrink-0`}
                style={typography.iconStyle}
              />
            ) : null}
          </div>
          <p className={`mt-5 ${typography.labelClass}`} style={typography.labelStyle}>
            {isAboutRatingStat(featured.label) ? 'Note moyenne des clients' : featured.label}
          </p>
        </AboutStatCardShell>
      </PortfolioMotionItem>
      <div className="flex flex-col" style={gapStyle}>
        {secondary.map((stat, index) => (
          <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index + 1}>
            <AboutStatCardShell presentation={presentation}>
              <div className="flex items-center justify-between gap-4">
                <span className={typography.labelClass} style={typography.labelStyle}>
                  {stat.label}
                </span>
                <span className={typography.valueClass('bar')} style={typography.valueStyle(stat.label)}>
                  {stat.value}
                </span>
              </div>
            </AboutStatCardShell>
          </PortfolioMotionItem>
        ))}
      </div>
    </div>
  );
}

function AboutEditorialListStats({
  stats,
  accent,
  presentation,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  accent: string;
  presentation: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  const typography = getAboutStatTypography(presentation, accent);
  const gapStyle = aboutStatsGapStyle(presentation.statsGap);

  return (
    <div
      className={`flex flex-wrap ${presentation.statsAutoCenter ? 'justify-center' : ''} ${aboutStatsAutoCenterClass(presentation.statsAutoCenter)}`}
      style={gapStyle}
    >
      {stats.map((stat, index) => (
        <PortfolioMotionItem key={stat.label} profile={motionProfile} index={index}>
          <div className="flex items-center gap-3">
            <AboutStatCardShell
              presentation={presentation}
              includePadding={false}
              className="flex h-11 w-11 shrink-0 items-center justify-center"
            >
              <AboutStatEditorialIcon
                label={stat.label}
                iconStyle={typography.iconStyle}
                iconSizeClass={typography.iconSizeClass}
              />
            </AboutStatCardShell>
            <p>
              <span className={typography.valueClass('editorial')} style={typography.valueStyle(stat.label)}>
                {stat.value}
              </span>{' '}
              <span
                className={[
                  aboutStatLabelSizeClass(presentation.statsLabelSize),
                  aboutStatFontClass(presentation.statsLabelFont, 'label'),
                ].join(' ')}
                style={typography.labelStyle}
              >
                {aboutStatEditorialSuffix(stat.label)}
              </span>
            </p>
          </div>
        </PortfolioMotionItem>
      ))}
    </div>
  );
}

export function EditorialStatGrid({
  stats,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  stats: { value: string; label: string }[];
  presentation?: PortfolioAboutPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  if (stats.length === 0) return null;

  const accent = aboutAccentColor(presentation.accentColor);

  switch (presentation.statsDesign) {
    case 'featured':
      return <AboutFeaturedStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
    case 'editorial-list':
      return <AboutEditorialListStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
    default:
      return <AboutUnifiedBandStats stats={stats} accent={accent} presentation={presentation} motionProfile={motionProfile} />;
  }
}

function FaqPlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" d="M12 5v14M5 12h14" />
    </svg>
  );
}

function FaqChevronIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
    </svg>
  );
}

function FaqExpandIcon({ style }: { style: PortfolioFaqExpandIconStyle }) {
  return style === 'chevron' ? <FaqChevronIcon className="h-4 w-4" /> : <FaqPlusIcon className="h-4 w-4" />;
}

export function EditorialFaqItem({
  item,
  index,
  isLast = false,
  presentation = DEFAULT_FAQ_PRESENTATION,
}: {
  item: FaqItem;
  index: number;
  isLast?: boolean;
  presentation?: PortfolioFaqPresentationSettings;
}) {
  const number = String(index + 1).padStart(2, '0');
  const design = presentation.itemDesign;
  const isCard = faqIsCardDesign(design);
  const shellClass = faqItemShellClass(design);
  const accentStyle = faqItemAccentStyle(design, presentation.accentColor);
  const accent = presentation.accentColor;
  const iconStyles = faqExpandIconStyle(presentation.expandIconColor, presentation.accentColor);
  const summaryPadding = faqSummaryPaddingClass(design);
  const iconRotateClass =
    presentation.expandIconStyle === 'chevron' ? 'group-open:rotate-180' : 'group-open:rotate-45';

  const questionClass = `min-w-0 flex-1 leading-snug ${elementTextStyleClass(presentation.elementStyles.question, 'body')}`;
  const questionStyle = elementTextInlineStyle(presentation.elementStyles.question);
  const answerClass = `whitespace-pre-line leading-relaxed ${elementTextStyleClass(presentation.elementStyles.answer, 'body')}`;
  const answerStyle = elementTextInlineStyle(presentation.elementStyles.answer);
  const numberClass = `mt-1 w-8 shrink-0 tabular-nums ${elementTextStyleClass(presentation.elementStyles.number, 'body')}`;
  const numberStyle = elementTextInlineStyle(presentation.elementStyles.number);
  const align = faqContentAlignClass(presentation.itemAlign);

  const showInlineNumber = presentation.showItemNumbers && design !== 'numbered-rail';

  const details = (
    <details
      className={`group ${!isCard && design !== 'numbered-rail' ? shellClass : ''}`}
      style={{ ['--faq-accent' as string]: accent }}
    >
      <summary
        className={`flex cursor-pointer list-none items-start gap-4 sm:gap-5 [&::-webkit-details-marker]:hidden ${summaryPadding} ${align.row}`}
      >
        {showInlineNumber ? (
          <span className={numberClass} style={numberStyle}>
            {number}
          </span>
        ) : null}
        <span className={`${questionClass} ${align.text}`} style={questionStyle}>
          {item.question}
        </span>
        {presentation.showExpandIcon ? (
          <span
            className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border bg-white shadow-sm transition duration-200 ${iconRotateClass} group-open:border-[color:var(--faq-accent)] group-open:bg-[color:color-mix(in_srgb,var(--faq-accent)_12%,white)] group-open:text-[color:var(--faq-accent)]`}
            style={iconStyles.base}
            aria-hidden
          >
            <FaqExpandIcon style={presentation.expandIconStyle} />
          </span>
        ) : null}
      </summary>
      <div
        className={`pb-6 pr-2 sm:pb-7 ${
          showInlineNumber ? 'pl-12 sm:pl-[4.25rem]' : 'pl-2 sm:pl-4'
        } ${isCard ? 'px-5 sm:px-6' : ''} ${design === 'compact' ? 'pb-4 sm:pb-5' : ''}`}
      >
        <div
          className={`pl-5 sm:pl-6 ${presentation.showAnswerAccentBorder ? 'border-l-2' : ''}`}
          style={presentation.showAnswerAccentBorder ? faqAnswerBorderStyle(presentation.answerAccentBorderColor) : undefined}
        >
          <p className={`${answerClass} ${align.text}`} style={answerStyle}>
            {item.answer}
          </p>
        </div>
      </div>
    </details>
  );

  if (design === 'numbered-rail') {
    return (
      <article className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-start gap-x-4 sm:grid-cols-[4rem_minmax(0,1fr)]">
        <div className="relative flex h-full min-h-[4.5rem] flex-col items-center">
          {!isLast ? <div className="absolute bottom-0 top-10 w-px bg-neutral-200" aria-hidden /> : null}
          {presentation.showItemNumbers ? (
            <div
              className="relative z-[1] flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 bg-white text-xs font-black tabular-nums"
              style={{ borderColor: accent, color: accent }}
            >
              {number}
            </div>
          ) : (
            <div
              className="relative z-[1] mt-1 h-3.5 w-3.5 shrink-0 rounded-full border-2 bg-white"
              style={{ borderColor: accent }}
              aria-hidden
            />
          )}
        </div>
        <div className="min-w-0 pb-4">{details}</div>
      </article>
    );
  }

  if (isCard) {
    return (
      <div className={shellClass} style={accentStyle}>
        {details}
      </div>
    );
  }

  return details;
}

export function EditorialFaqList({
  items,
  presentation = DEFAULT_FAQ_PRESENTATION,
  motionProfile = DEFAULT_MOTION_PROFILE,
}: {
  items: FaqItem[];
  presentation?: PortfolioFaqPresentationSettings;
  motionProfile?: PortfolioGlobalMotionProfile;
}) {
  if (items.length === 0) return null;

  return (
    <div className={`${faqFrameClass(presentation)} relative overflow-hidden`} style={faqFrameStyle(presentation)}>
      <ServicesCardBackgroundLayers presentation={presentation} />
      <ServicesCardForeground>
        <div className={faqListShellClass(presentation.itemDesign, presentation.itemGap)}>
          {items.map((item, index) => (
            <PortfolioMotionItem key={item.id} profile={motionProfile} index={index}>
              <EditorialFaqItem
                item={item}
                index={index}
                isLast={index === items.length - 1}
                presentation={presentation}
              />
            </PortfolioMotionItem>
          ))}
        </div>
      </ServicesCardForeground>
    </div>
  );
}

export function SkillPill({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2.5 text-sm font-medium text-neutral-800 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100">
      <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
      <CreatorToolLogo label={label} size={22} />
      {label}
    </span>
  );
}

export function SideInfoCard({
  label,
  title,
  subtitle,
  dark = false,
  action,
  icon: Icon,
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  label: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
  action?: React.ReactNode;
  icon: (props: { className?: string }) => React.ReactNode;
  presentation?: PortfolioAboutPresentationSettings;
}) {
  return (
    <div
      className={`group rounded-[22px] border p-5 transition duration-200 ${
        dark
          ? 'border-neutral-800 bg-neutral-950 text-white shadow-[0_18px_40px_-24px_rgba(0,0,0,0.65)]'
          : 'border-neutral-200 bg-white hover:border-orange-200 hover:shadow-[0_12px_32px_-20px_rgba(249,115,22,0.35)] dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-orange-500/30'
      }`}
    >
      <SideInfoRow
        label={label}
        title={title}
        subtitle={subtitle}
        dark={dark}
        action={action}
        icon={Icon}
        presentation={presentation}
      />
    </div>
  );
}

function SideInfoRow({
  label,
  title,
  subtitle,
  dark = false,
  action,
  icon: Icon,
  plainIcon = false,
  hideLabel = false,
  presentation = DEFAULT_ABOUT_PRESENTATION,
}: {
  label: string;
  title: string;
  subtitle?: string;
  dark?: boolean;
  action?: React.ReactNode;
  icon: (props: { className?: string }) => React.ReactNode;
  plainIcon?: boolean;
  hideLabel?: boolean;
  presentation?: PortfolioAboutPresentationSettings;
}) {
  const labelClass = elementTextStyleClass(presentation.elementStyles.sideLabel, 'label');
  const labelStyle = dark ? undefined : elementTextInlineStyle(presentation.elementStyles.sideLabel);
  const titleClass = elementTextStyleClass(presentation.elementStyles.sideTitle, 'body');
  const titleStyle = dark ? undefined : elementTextInlineStyle(presentation.elementStyles.sideTitle);
  const subtitleClass = elementTextStyleClass(presentation.elementStyles.sideSubtitle, 'body');
  const subtitleStyle = dark ? undefined : elementTextInlineStyle(presentation.elementStyles.sideSubtitle);

  return (
    <div className={`flex gap-6 sm:gap-7 ${plainIcon ? 'items-center' : 'items-start'}`}>
      <div
        className={
          plainIcon
            ? `shrink-0 ${dark ? 'text-emerald-400' : 'text-orange-600 dark:text-orange-400'}`
            : `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition group-hover:scale-[1.03] ${
                dark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-orange-50 text-orange-600 dark:bg-orange-500/10'
              }`
        }
        aria-hidden
      >
        <Icon className={plainIcon ? 'h-7 w-7 sm:h-8 sm:w-8' : 'h-5 w-5'} />
      </div>
      <div className={`min-w-0 flex-1${plainIcon ? '' : ' pt-0.5'}`}>
        {hideLabel ? null : (
          <p
            className={`leading-snug ${dark ? 'font-bold text-emerald-400' : labelClass}`}
            style={labelStyle}
          >
            {label}
          </p>
        )}
        <p
          className={`leading-snug ${hideLabel ? '' : 'mt-1.5'} ${dark ? 'font-bold text-white' : titleClass}`}
          style={titleStyle}
        >
          {title}
        </p>
        {subtitle ? (
          <p className={`mt-1 leading-relaxed ${dark ? 'text-neutral-400' : subtitleClass}`} style={subtitleStyle}>
            {subtitle}
          </p>
        ) : null}
        {action ? <div className="mt-3.5">{action}</div> : null}
      </div>
    </div>
  );
}

export type EditorialSideInfoItem = {
  id: string;
  label: string;
  title: string;
  subtitle?: string;
  icon: (props: { className?: string }) => React.ReactNode;
};

/** Single vertical panel for About sidebar details (location, languages, etc.). */
function AboutSidePanelCardShell({
  presentation,
  className = '',
  includePadding = true,
  children,
}: {
  presentation: PortfolioAboutPresentationSettings;
  className?: string;
  includePadding?: boolean;
  children: React.ReactNode;
}) {
  const frameClass = aboutSidePanelFrameClass(presentation, { includePadding });
  const surfaceStyle = aboutSidePanelFrameStyle(presentation);
  const background = aboutSidePanelCardBackgroundSettings(presentation);

  return (
    <div className={`relative overflow-hidden ${frameClass} ${className}`.trim()} style={surfaceStyle}>
      <ServicesCardBackgroundLayers presentation={background} />
      <ServicesCardForeground>{children}</ServicesCardForeground>
    </div>
  );
}

export function EditorialSideInfoPanel({
  items,
  presentation = DEFAULT_ABOUT_PRESENTATION,
  layoutMode = 'sidebar-right',
}: {
  items: EditorialSideInfoItem[];
  presentation?: PortfolioAboutPresentationSettings;
  layoutMode?: PortfolioAboutLayoutMode;
}) {
  if (items.length === 0) return null;

  const isFullWidth = layoutMode === 'full-width';
  const itemLayout = isFullWidth ? presentation.sidePanelFullWidthLayout : 'stacked';
  const layoutClass = aboutSidePanelFullWidthLayoutClass(itemLayout);
  const centerClass = aboutSidePanelAutoCenterClass(presentation.sidePanelAutoCenter, itemLayout);
  const useStackedDividers =
    itemLayout === 'stacked' && presentation.sidePanelDesign !== 'minimal';

  const renderItem = (item: EditorialSideInfoItem) => (
    <div key={item.id} className={aboutSidePanelItemCellClass(itemLayout, presentation.sidePanelDesign)}>
      <SideInfoRow
        label={item.label}
        title={item.title}
        subtitle={item.subtitle}
        icon={item.icon}
        plainIcon
        hideLabel
        presentation={presentation}
      />
    </div>
  );

  if (presentation.sidePanelDesign === 'cards') {
    return (
      <div
        className={`${isFullWidth ? layoutClass : aboutSidePanelShellClass('cards')} ${centerClass} ${
          presentation.sidePanelAutoCenter ? '[&>*]:w-full [&>*]:max-w-md' : ''
        }`}
      >
        {items.map((item) => (
          <SideInfoCard
            key={item.id}
            label={item.label}
            title={item.title}
            subtitle={item.subtitle}
            icon={item.icon}
            presentation={presentation}
          />
        ))}
      </div>
    );
  }

  const itemList =
    itemLayout === 'stacked' ? (
      items.map((item, index) => (
        <div key={item.id}>
          {index > 0 && useStackedDividers ? (
            <div className="flex justify-center py-1" aria-hidden>
              <span className="h-px w-10 bg-neutral-300/70" />
            </div>
          ) : null}
          {renderItem(item)}
        </div>
      ))
    ) : (
      items.map((item) => renderItem(item))
    );

  if (presentation.sidePanelDesign === 'minimal' && itemLayout === 'stacked') {
    return (
      <AboutSidePanelCardShell presentation={presentation} className={centerClass}>
        <div className={`${layoutClass} divide-y divide-neutral-200/80`}>{itemList}</div>
      </AboutSidePanelCardShell>
    );
  }

  return (
    <AboutSidePanelCardShell presentation={presentation} className={centerClass}>
      <div className={`${layoutClass} ${centerClass}`}>{itemList}</div>
    </AboutSidePanelCardShell>
  );
}

function ContactLocationBlock({
  location,
  stacked = false,
}: {
  location: string;
  stacked?: boolean;
}) {
  const shellClass = stacked
    ? 'rounded-[1.35rem] border border-neutral-200/80 bg-transparent p-6 sm:p-7'
    : 'p-6 sm:p-7';

  return (
    <div className={shellClass}>
      <div className="mb-4 text-orange-600">
        <ContactLocationIcon className="h-8 w-8" />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">Location</p>
      <p className="mt-2 text-lg font-bold text-neutral-950">{location}</p>
    </div>
  );
}

function ContactCardShell({
  presentation,
  children,
}: {
  presentation: PortfolioContactPresentationSettings;
  children: React.ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden ${contactCardFrameClass(presentation)} ${contactCardShellClass(
        presentation.cardDesign
      )}`}
      style={contactCardFrameStyle(presentation)}
    >
      <ServicesCardBackgroundLayers presentation={presentation} />
      <ServicesCardForeground>{children}</ServicesCardForeground>
    </div>
  );
}

function ContactLinksBlock({
  links,
  design,
  blockOrder,
  renderSocialIcon,
  socialBrandClass,
}: {
  links: EditorialContactLink[];
  design: PortfolioContactCardDesign;
  blockOrder: PortfolioContactPresentationSettings['blockOrder'];
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
}) {
  return (
    <div className={contactLinksBlockClass(design, blockOrder)}>
      <p className="px-1 pb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400 sm:px-2">
        Links & social
      </p>
      <div
        className={`grid gap-1 sm:gap-2 ${
          design === 'stacked' ? 'grid-cols-1' : 'sm:grid-cols-2'
        }`}
      >
        {links.map((link) => (
          <EditorialContactLinkRow
            key={link.id}
            link={link}
            renderSocialIcon={renderSocialIcon}
            socialBrandClass={socialBrandClass}
          />
        ))}
      </div>
    </div>
  );
}

function ContactPrimaryChannels({
  presentation,
  visibleEmail,
  visiblePhone,
  visibleLocation,
  channelCount,
}: {
  presentation: PortfolioContactPresentationSettings;
  visibleEmail: string | null;
  visiblePhone: string | null;
  visibleLocation: string | null;
  channelCount: number;
}) {
  const stacked = presentation.cardDesign === 'stacked';
  const embedded = !stacked;

  return (
    <div className={contactChannelGridClass(presentation.cardDesign, channelCount)}>
      {visibleEmail?.trim() ? (
        <ContactChannelCard
          label="Email"
          value={visibleEmail.trim()}
          href={`mailto:${visibleEmail.trim()}`}
          icon={<ContactEmailIcon />}
          embedded={embedded}
          plainIcon={!stacked}
          showLabel={false}
        />
      ) : null}
      {visiblePhone?.trim() ? (
        <ContactChannelCard
          label="Phone"
          value={formatPhoneDisplay(visiblePhone.trim())}
          href={`tel:${visiblePhone.trim()}`}
          icon={<ContactPhoneIcon />}
          embedded={embedded}
          plainIcon={!stacked}
          showLabel={false}
        />
      ) : null}
      {visibleLocation?.trim() ? (
        <ContactLocationBlock location={visibleLocation.trim()} stacked={stacked} />
      ) : null}
    </div>
  );
}

export function ContactChannelCard({
  label,
  value,
  href,
  icon,
  embedded = false,
  plainIcon = false,
  showLabel = true,
}: {
  label: string;
  value: string;
  href: string;
  icon: React.ReactNode;
  embedded?: boolean;
  plainIcon?: boolean;
  showLabel?: boolean;
}) {
  const centered = embedded && plainIcon && !showLabel;

  return (
    <a
      href={href}
      aria-label={showLabel ? undefined : `${label}: ${value}`}
      className={`group relative flex h-full flex-col transition duration-200 ${
        centered ? 'items-center text-center' : ''
      } ${
        embedded
          ? `p-6 sm:p-7 ${plainIcon ? 'hover:bg-neutral-50/50' : 'hover:bg-neutral-50/80'}`
          : 'rounded-[1.35rem] border border-neutral-200/80 bg-transparent p-6 hover:border-orange-200 hover:shadow-[0_16px_40px_-24px_rgba(249,115,22,0.45)] sm:p-7'
      }`}
    >
      <ArrowUpRight className="absolute right-5 top-5 h-4 w-4 text-neutral-300 transition group-hover:text-orange-500" />
      {plainIcon ? (
        <div
          className={`text-orange-600 [&_svg]:h-7 [&_svg]:w-7 sm:[&_svg]:h-8 sm:[&_svg]:w-8${
            centered ? ' mb-3' : ' mb-4'
          }`}
        >
          {icon}
        </div>
      ) : (
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
          {icon}
        </div>
      )}
      {showLabel ? (
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-orange-600">{label}</p>
      ) : null}
      <p className={`break-words text-lg font-bold leading-snug text-neutral-950${showLabel ? ' mt-2' : ''}`}>
        {value}
      </p>
    </a>
  );
}

function ContactEmailIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function ContactPhoneIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  );
}

function ContactLocationIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

export type EditorialContactLink = {
  id: string;
  label: string;
  url: string;
  type: string;
  platform?: string | null;
};

type EditorialContactLinkRowProps = {
  link: EditorialContactLink;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
};

function inferContactLinkPlatform(link: EditorialContactLink): string | null {
  if (link.platform?.trim()) return link.platform.trim();

  const haystack = `${link.url} ${link.label}`.toLowerCase();
  if (haystack.includes('youtube') || haystack.includes('youtu.be')) return 'YOUTUBE';
  if (haystack.includes('tiktok')) return 'TIKTOK';
  if (haystack.includes('instagram')) return 'INSTAGRAM';
  if (haystack.includes('linkedin')) return 'LINKEDIN';
  if (haystack.includes('github')) return 'GITHUB';
  if (haystack.includes('twitter') || haystack.includes('x.com')) return 'TWITTER';

  return link.type === 'SOCIAL' ? link.label : null;
}

function ContactLinkIcon({
  link,
  renderSocialIcon,
  socialBrandClass,
}: {
  link: EditorialContactLink;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
}) {
  const platform = inferContactLinkPlatform(link);
  const socialKey = platform ? normalizeSocialPlatformKey(platform) : 'other';
  const isSocial = socialKey !== 'other';

  if (isSocial && platform) {
    const brandClass = socialBrandClass?.(platform) ?? socialPlatformBrandClass(platform);
    const iconNode = renderSocialIcon?.(platform, 'h-6 w-6') ?? (
      <SocialPlatformIcon platform={platform} className="h-6 w-6" />
    );

    return (
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${brandClass}`}>
        {iconNode}
      </div>
    );
  }

  if (link.type === 'WEBSITE') {
    return <NeutralIconBadge name="website" size="lg" accent />;
  }

  return <NeutralIconBadge name="link" size="lg" />;
}

function EditorialContactLinkRow({
  link,
  renderSocialIcon,
  socialBrandClass,
}: EditorialContactLinkRowProps) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noreferrer"
      className="group flex items-center gap-4 rounded-2xl border border-transparent px-3 py-4 transition hover:border-neutral-200/80 hover:bg-neutral-50/50 sm:px-4"
    >
      <ContactLinkIcon link={link} renderSocialIcon={renderSocialIcon} socialBrandClass={socialBrandClass} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold text-neutral-950 sm:text-base">{link.label}</p>
        <p className="truncate text-xs text-neutral-500">{link.url.replace(/^https?:\/\//, '')}</p>
      </div>
      <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-300 transition group-hover:text-orange-500" />
    </a>
  );
}

export function EditorialContactSection({
  email,
  phone,
  locationLabel,
  links,
  ctaHref,
  ctaLabel = 'Start a project',
  responseTimeLabel,
  membersOnlyNode,
  renderSocialIcon,
  socialBrandClass,
  editorialLayout = false,
  sectionTitle,
  sectionSubtitle,
  presentation = DEFAULT_CONTACT_PRESENTATION,
  titleTypographyClass,
  titleTypographyStyle,
  subtitleTypographyClass,
  subtitleTypographyStyle,
  titleDecorationStyle,
  subtitleDecorationStyle,
  titleChromeClass,
  titleChromeStyle,
  customTitleSizing,
  customSubtitleSizing,
  orientation,
  centered,
  alignRight = false,
  alwaysCentered,
  suppressBackground = false,
  scrollBehavior = 'sticky',
  motionProfile = DEFAULT_MOTION_PROFILE,
  topSpacingClass = 'pt-12 sm:pt-16 lg:pt-20',
}: {
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  links: EditorialContactLink[];
  ctaHref: string;
  ctaLabel?: string;
  responseTimeLabel?: string | null;
  membersOnlyNode?: React.ReactNode;
  renderSocialIcon?: (platform: string, className: string) => React.ReactNode;
  socialBrandClass?: (platform: string) => string;
  editorialLayout?: boolean;
  sectionTitle?: string;
  sectionSubtitle?: React.ReactNode;
  presentation?: PortfolioContactPresentationSettings;
  titleTypographyClass?: string;
  titleTypographyStyle?: React.CSSProperties;
  subtitleTypographyClass?: string;
  subtitleTypographyStyle?: React.CSSProperties;
  titleDecorationStyle?: React.CSSProperties;
  subtitleDecorationStyle?: React.CSSProperties;
  titleChromeClass?: string;
  titleChromeStyle?: React.CSSProperties;
  customTitleSizing?: boolean;
  customSubtitleSizing?: boolean;
  orientation?: 'horizontal' | 'vertical';
  centered?: boolean;
  alignRight?: boolean;
  alwaysCentered?: boolean;
  /** When a global page background is active, the contact section drops its own background. */
  suppressBackground?: boolean;
  /** Global scroll behavior for section titles. */
  scrollBehavior?: 'sticky' | 'static';
  motionProfile?: PortfolioGlobalMotionProfile;
  /** Global padding-top above the section title. */
  topSpacingClass?: string;
}) {
  const visibleEmail = presentation.showEmail ? (email ?? null) : null;
  const visiblePhone = presentation.showPhone ? (phone ?? null) : null;
  const visibleLocation = presentation.showLocation ? (locationLabel ?? null) : null;
  const visibleLinks = presentation.showSocialLinks ? links : [];
  const hasPrimary = Boolean(
    visibleEmail?.trim() || visiblePhone?.trim() || visibleLocation?.trim()
  );
  const hasLinks = visibleLinks.length > 0;
  const channelCount = [visibleEmail, visiblePhone, visibleLocation].filter((v) => v?.trim()).length;
  const bgStyle =
    !suppressBackground && presentation.sectionBackgroundEnabled
      ? sectionBackgroundStyle(presentation)
      : undefined;
  const resolvedCtaLabel = presentation.ctaLabel.trim() || ctaLabel;

  return (
    <section
      id="contact"
      className={`relative isolate scroll-mt-28 ${
        bgStyle ? `${topSpacingClass} pb-8 sm:pb-10 lg:pb-12` : topSpacingClass
      }`}
    >
      {bgStyle ? (
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-1/2 -z-10 w-screen -translate-x-1/2 -bottom-16 sm:-bottom-20"
          style={bgStyle}
        />
      ) : null}
      <EditorialSectionStickyHeader
        title={sectionTitle ?? 'Contact'}
        subtitle={sectionSubtitle ?? (
          <>
            Should you have a project in mind, I would be pleased to hear from you
            {responseTimeLabel?.trim() && presentation.showResponseTimeInSubtitle
              ? ` — I typically reply ${responseTimeLabel.toLowerCase()}.`
              : ' to discuss your objectives.'}
          </>
        )}
        subtitleSerif={presentation.subtitleSerif}
        editorialLayout={editorialLayout}
        centered={centered}
        alignRight={alignRight}
        alwaysCentered={alwaysCentered}
        className="mb-10 lg:mb-12"
        titleTypographyClass={titleTypographyClass}
        titleTypographyStyle={titleTypographyStyle}
        titleDecorationStyle={titleDecorationStyle}
        titleChromeClass={titleChromeClass}
        titleChromeStyle={titleChromeStyle}
        customTitleSizing={customTitleSizing}
        subtitleTypographyClass={subtitleTypographyClass}
        subtitleTypographyStyle={subtitleTypographyStyle}
        subtitleDecorationStyle={subtitleDecorationStyle}
        customSubtitleSizing={customSubtitleSizing}
        orientation={orientation}
        scrollBehavior={scrollBehavior}
      />
      <div className="relative">
        {(hasPrimary || hasLinks) && (
          <div
            className={`w-full ${contactCardMaxWidthClass(presentation.cardMaxWidth)} ${contactCardPlacementClass(
              presentation.cardPlacement
            )}`}
          >
            <PortfolioMotionItem profile={motionProfile} index={0}>
              <ContactCardShell presentation={presentation}>
                {presentation.blockOrder === 'links-first' && hasLinks ? (
                  <ContactLinksBlock
                    links={visibleLinks}
                    design={presentation.cardDesign}
                    blockOrder={presentation.blockOrder}
                    renderSocialIcon={renderSocialIcon}
                    socialBrandClass={socialBrandClass}
                  />
                ) : null}
                {hasPrimary ? (
                  <ContactPrimaryChannels
                    presentation={presentation}
                    visibleEmail={visibleEmail}
                    visiblePhone={visiblePhone}
                    visibleLocation={visibleLocation}
                    channelCount={channelCount}
                  />
                ) : null}
                {hasLinks && presentation.blockOrder === 'primary-first' ? (
                  <ContactLinksBlock
                    links={visibleLinks}
                    design={presentation.cardDesign}
                    blockOrder={presentation.blockOrder}
                    renderSocialIcon={renderSocialIcon}
                    socialBrandClass={socialBrandClass}
                  />
                ) : null}
              </ContactCardShell>
            </PortfolioMotionItem>
          </div>
        )}

        {presentation.showCta ? (
          <div
            className={`mx-auto mt-10 flex max-w-3xl flex-col items-center gap-4 ${
              presentation.ctaDesign === 'full-width' ? 'w-full px-4' : ''
            }`}
          >
            <PortfolioMotionItem profile={motionProfile} index={hasPrimary || hasLinks ? 1 : 0}>
              <a
                href={ctaHref}
                {...(ctaHref.startsWith('http') || ctaHref.startsWith('mailto')
                  ? { target: '_blank', rel: 'noreferrer' }
                  : {})}
                className={contactCtaClassName(presentation.ctaDesign)}
                style={contactCtaStyle(presentation.ctaDesign, presentation.ctaColor)}
              >
                {resolvedCtaLabel}
                <ArrowUpRight className="h-4 w-4" />
              </a>
            </PortfolioMotionItem>
            {membersOnlyNode}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function EditorialPortfolioFooter({
  creatorName,
  creatorId,
  bio,
  whyMeText,
  email,
  phone,
  locationLabel,
  hoursLabel,
  profileVisits,
  links,
  contentClassName,
  presentation = DEFAULT_FOOTER_PRESENTATION,
  stackOnContact = false,
  transparentBase = false,
  isAvailable = true,
  responseTimeLabel = null,
  contactHref = '#footer',
}: {
  creatorName: string;
  creatorId: string;
  avatarUrl?: string | null;
  bio?: string | null;
  whyMeText?: string | null;
  email?: string | null;
  phone?: string | null;
  locationLabel?: string | null;
  hoursLabel?: string | null;
  profileVisits: number;
  links: EditorialContactLink[];
  contentClassName: string;
  presentation?: PortfolioFooterPresentationSettings;
  stackOnContact?: boolean;
  transparentBase?: boolean;
  isAvailable?: boolean | null;
  responseTimeLabel?: string | null;
  contactHref?: string;
}) {
  const bgStyle =
    !transparentBase && presentation.sectionBackgroundEnabled
      ? sectionBackgroundStyle(presentation)
      : undefined;
  const lightBackground = isFooterBackgroundLight(presentation);
  const shellClass = footerShellClass(
    presentation.design,
    presentation.showTopBorder,
    lightBackground
  );
  const topMarginClass = stackOnContact ? 'mt-0' : footerTopMarginClass(presentation.design);
  const dividerClass = footerDividerClass(lightBackground);
  const mutedStyle = footerTextStyle(presentation.textColor);
  const primaryColor = resolveFooterPrimaryColor(presentation);
  const primaryStyle = footerPrimaryStyle(primaryColor);
  const iconStyle = footerIconStyle(presentation.iconColor);
  const accentStyle = footerAccentStyle(presentation.accentColor);
  const patternStyle = footerPatternStyle(presentation);

  const description = presentation.showDescription
    ? resolveFooterDescription({
        source: presentation.descriptionSource,
        custom: presentation.descriptionCustom,
        bio,
        whyMeText,
        maxLength: presentation.design === 'compact' ? 120 : 220,
      })
    : null;

  const phoneDisplay = phone?.trim() ? formatPhoneDisplay(phone.trim()) : null;
  const emailValue = email?.trim() || null;
  const locationValue = locationLabel?.trim() || null;
  const hoursValue = hoursLabel?.trim() || null;

  const contactItems: { id: string; label: string; href?: string; icon: 'phone' | 'email' | 'location' | 'hours' }[] =
    [];
  if (presentation.showPhone && phoneDisplay) {
    contactItems.push({
      id: 'phone',
      label: phoneDisplay,
      href: `tel:${phone!.replace(/\s+/g, '')}`,
      icon: 'phone',
    });
  }
  if (presentation.showEmail && emailValue) {
    contactItems.push({
      id: 'email',
      label: emailValue,
      href: `mailto:${emailValue}`,
      icon: 'email',
    });
  }
  if (presentation.showLocation && locationValue) {
    contactItems.push({ id: 'location', label: locationValue, icon: 'location' });
  }
  if (presentation.showHours && hoursValue) {
    contactItems.push({ id: 'hours', label: hoursValue, icon: 'hours' });
  }

  const visibleLinks = presentation.showContactLinks
    ? links.map((link) => ({
        ...link,
        label:
          link.type === 'WEBSITE' && /^site\s*web$/i.test(link.label.trim())
            ? 'Website'
            : link.label,
      }))
    : [];
  const ctaHref =
    contactHref?.trim() ||
    (emailValue ? `mailto:${emailValue}` : '#footer');
  const ctaSubtitle = resolveFooterCtaSubtitle({
    custom: presentation.ctaSubtitle,
    isAvailable,
    responseTimeLabel,
    hoursLabel,
  });

  const socialIconsRow =
    visibleLinks.length > 0 ? (
      <nav className="flex flex-wrap items-center gap-4" aria-label="Social">
        {visibleLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="transition hover:opacity-80"
            title={link.label}
          >
            <FooterSocialLinkIcon link={link} />
          </a>
        ))}
      </nav>
    ) : null;

  const socialLinksColumn =
    visibleLinks.length > 0 ? (
      <nav className="flex flex-col gap-3.5" aria-label="Social">
        {visibleLinks.map((link) => (
          <a
            key={link.id}
            href={link.url}
            target="_blank"
            rel="noreferrer"
            className="group inline-flex items-center gap-3 transition hover:opacity-80"
          >
            <FooterSocialLinkIcon link={link} />
            <span className="text-sm font-bold transition group-hover:opacity-80" style={primaryStyle}>
              {link.label}
            </span>
          </a>
        ))}
      </nav>
    ) : null;

  const contactStack =
    contactItems.length > 0 ? (
      <ul className="space-y-5">
        {contactItems.map((item) => (
          <li key={item.id}>
            {item.href ? (
              <a
                href={item.href}
                className="inline-flex items-start gap-3.5 text-sm transition hover:opacity-80"
                style={primaryStyle}
              >
                <FooterContactIcon type={item.icon} className="mt-0.5 h-4 w-4 shrink-0" style={iconStyle} />
                <span className="font-semibold">{item.label}</span>
              </a>
            ) : (
              <span className="inline-flex items-start gap-3.5 text-sm" style={primaryStyle}>
                <FooterContactIcon type={item.icon} className="mt-0.5 h-4 w-4 shrink-0" style={iconStyle} />
                <span className="font-semibold">{item.label}</span>
              </span>
            )}
          </li>
        ))}
      </ul>
    ) : null;

  const contactInline =
    contactItems.length > 0 ? (
      <div className="flex flex-wrap items-center gap-x-8 gap-y-3" style={mutedStyle}>
        {contactItems.map((item) =>
          item.href ? (
            <a
              key={item.id}
              href={item.href}
              className="inline-flex items-center gap-3 text-sm transition hover:opacity-80"
            >
              <FooterContactIcon type={item.icon} className="h-3.5 w-3.5" style={iconStyle} />
              <span>{item.label}</span>
            </a>
          ) : (
            <span key={item.id} className="inline-flex items-center gap-3 text-sm">
              <FooterContactIcon type={item.icon} className="h-3.5 w-3.5" style={iconStyle} />
              <span>{item.label}</span>
            </span>
          )
        )}
      </div>
    ) : null;

  const copyrightLine = presentation.showCopyright ? (
    <p className="text-xs font-medium tracking-wide" style={mutedStyle}>
      © {new Date().getFullYear()} {creatorName}
      {presentation.showProfileVisits && profileVisits > 0
        ? ` · ${profileVisits.toLocaleString()} views`
        : ''}
    </p>
  ) : null;

  const marketplaceLink = presentation.showMarketplaceLink ? (
    <Link
      href={`/marketplace/${creatorId}`}
      className="inline-flex items-center gap-1.5 text-sm font-semibold transition hover:opacity-80"
      style={accentStyle}
    >
      Marketplace profile
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  ) : null;

  const designCredit = presentation.showDesignCredit ? (
    <p className="text-xs font-medium tracking-wide" style={mutedStyle}>
      Design by NoProblème
    </p>
  ) : null;

  const columnHeading = (label: string) => (
    <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.18em]" style={mutedStyle}>
      {label}
    </p>
  );

  let body: React.ReactNode;

  if (presentation.design === 'compact') {
    // Design 2 — Compact SaaS
    body = (
      <>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            {presentation.showBrand ? (
              <p className="text-lg font-bold tracking-tight sm:text-xl" style={primaryStyle}>
                {creatorName}
              </p>
            ) : null}
            {description ? (
              <p className="max-w-md text-sm leading-relaxed" style={mutedStyle}>
                {description}
              </p>
            ) : null}
            {contactInline}
          </div>
          {socialIconsRow}
        </div>
        <div className={`flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between ${dividerClass}`}>
          {copyrightLine}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {marketplaceLink}
            {designCredit}
          </div>
        </div>
      </>
    );
  } else if (presentation.design === 'minimal') {
    // Design 3 — CTA contact
    const locationHours = [locationValue, hoursValue].filter(Boolean).join(' · ');
    const contactIconItems = contactItems.filter(
      (item) => item.icon === 'email' || item.icon === 'phone'
    );
    const contactIconsRow =
      contactIconItems.length > 0 ? (
        <nav className="flex flex-wrap items-center gap-4" aria-label="Contact">
          {contactIconItems.map((item) =>
            item.href ? (
              <a
                key={item.id}
                href={item.href}
                title={item.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 transition hover:border-neutral-300 hover:bg-white"
                style={iconStyle}
              >
                <FooterContactIcon type={item.icon} className="h-4 w-4" style={iconStyle} />
              </a>
            ) : (
              <span
                key={item.id}
                title={item.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/80 bg-white/80"
                style={iconStyle}
              >
                <FooterContactIcon type={item.icon} className="h-4 w-4" style={iconStyle} />
              </span>
            )
          )}
        </nav>
      ) : null;

    body = (
      <>
        {presentation.showContactCta ? (
          <div
            className="flex flex-col gap-5 rounded-2xl px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-7"
            style={{ backgroundColor: presentation.accentColor }}
          >
            <div className="min-w-0">
              <p
                className="text-xl font-bold tracking-tight sm:text-2xl"
                style={footerCtaTitleStyle(presentation.ctaTitleColor)}
              >
                {presentation.ctaTitle}
              </p>
              <p
                className="mt-1.5 text-sm"
                style={footerCtaSubtitleStyle(presentation.ctaSubtitleColor)}
              >
                {ctaSubtitle}
              </p>
            </div>
            <a
              href={ctaHref}
              className={footerCtaButtonClass(
                presentation.ctaButtonBorder ?? 'none',
                presentation.ctaButtonRadius ?? 'md',
                presentation.ctaButtonPadding ?? 'md'
              )}
              style={footerCtaButtonStyle(
                presentation.ctaButtonBackgroundColor ?? '#ffffff',
                presentation.ctaButtonTextColor ?? '#0a0a0a',
                presentation.ctaButtonBorder ?? 'none',
                presentation.ctaButtonBorderColor ?? '#e5e5e5'
              )}
            >
              {presentation.ctaButtonLabel}
            </a>
          </div>
        ) : null}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            {socialIconsRow}
            {socialIconsRow && contactIconsRow ? (
              <span className="hidden h-5 w-px bg-neutral-200 sm:block dark:bg-neutral-700" aria-hidden />
            ) : null}
            {contactIconsRow}
          </div>
          {locationHours ? (
            <p className="text-sm" style={mutedStyle}>
              {locationHours}
            </p>
          ) : null}
          <div className="space-y-1.5 sm:text-right">
            {copyrightLine}
            {marketplaceLink}
          </div>
        </div>
      </>
    );
  } else {
    // Design 1 — Colonnes avec séparateurs
    body = (
      <>
        <div className={`min-w-0 space-y-1 lg:border-r lg:pr-10 ${dividerClass}`}>
          {columnHeading('Networks')}
          {socialLinksColumn}
          {!socialLinksColumn && presentation.showBrand ? (
            <p className="text-base font-bold" style={primaryStyle}>
              {creatorName}
            </p>
          ) : null}
          {description ? (
            <p className="mt-3 max-w-xs text-sm leading-relaxed" style={mutedStyle}>
              {description}
            </p>
          ) : null}
        </div>
        <div className={`min-w-0 space-y-1 lg:border-r lg:px-10 ${dividerClass}`}>
          {columnHeading('Contact')}
          {contactStack}
        </div>
        <div className="flex min-w-0 flex-col justify-start gap-3 lg:pl-10">
          {copyrightLine ? (
            <p className="text-xs font-bold uppercase tracking-[0.14em]" style={mutedStyle}>
              © {new Date().getFullYear()} {creatorName}
            </p>
          ) : null}
          {marketplaceLink}
          {designCredit}
          {presentation.showProfileVisits && profileVisits > 0 ? (
            <p className="text-xs" style={mutedStyle}>
              {profileVisits.toLocaleString()} views
            </p>
          ) : null}
        </div>
      </>
    );
  }

  const fallbackBg = bgStyle || transparentBase ? '' : lightBackground ? 'bg-neutral-100' : 'bg-neutral-950';

  return (
    <footer id="footer" className={`relative isolate ${topMarginClass} ${shellClass} ${fallbackBg}`}>
      {bgStyle ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={bgStyle} />
      ) : null}
      {patternStyle ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 -z-10" style={patternStyle} />
      ) : null}
      <div className={`relative ${contentClassName} ${footerLayoutClass(presentation.design, presentation.alignment)}`}>
        {body}
      </div>
    </footer>
  );
}

function FooterSocialLinkIcon({ link }: { link: EditorialContactLink }) {
  const platform = inferContactLinkPlatform(link);
  const socialKey = platform ? normalizeSocialPlatformKey(platform) : 'other';
  const isSocial = socialKey !== 'other';

  if (isSocial && platform) {
    return (
      <span
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${socialPlatformBrandClass(platform)}`}
      >
        <SocialPlatformIcon platform={platform} className="h-4 w-4" />
      </span>
    );
  }

  const isWebsite = link.type === 'WEBSITE';
  return (
    <span
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
        isWebsite
          ? 'bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-300'
          : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300'
      }`}
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        {isWebsite ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 12a9 9 0 0 1-9 9m9-9a9 9 0 0 0-9-9m9 9H3m9 9a9 9 0 0 1-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 0 1 9-9"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 0 0-5.656 0l-4 4a4 4 0 1 0 5.656 5.656l1.102-1.101m-.758-4.899a4 4 0 0 0 5.656 0l4-4a4 4 0 0 0-5.656-5.656l-1.1 1.1"
          />
        )}
      </svg>
    </span>
  );
}

function FooterContactIcon({
  type,
  className = 'h-4 w-4',
  style,
}: {
  type: 'phone' | 'email' | 'location' | 'hours';
  className?: string;
  style?: CSSProperties;
}) {
  if (type === 'phone') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3.5 6.5c0-1.2.9-2.2 2.1-2.3l2-.2a1.8 1.8 0 011.7 1.3l.5 1.8a1.8 1.8 0 01-.5 1.7l-1 1a12.5 12.5 0 005.5 5.5l1-1a1.8 1.8 0 011.7-.5l1.8.5a1.8 1.8 0 011.3 1.7l-.2 2a2.2 2.2 0 01-2.3 2.1A15.5 15.5 0 013.5 6.5z"
        />
      </svg>
    );
  }
  if (type === 'email') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path strokeLinecap="round" d="M4 7l8 6 8-6" />
      </svg>
    );
  }
  if (type === 'location') {
    return (
      <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s7-5.4 7-11a7 7 0 10-14 0c0 5.6 7 11 7 11z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
    );
  }
  return (
    <svg className={className} style={style} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} aria-hidden>
      <circle cx="12" cy="12" r="8" />
      <path strokeLinecap="round" d="M12 8v4l2.5 1.5" />
    </svg>
  );
}

export function MarketplaceProfileLink({ creatorId }: { creatorId: string }) {
  return (
    <Link
      href={`/marketplace/${creatorId}`}
      className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-500 transition hover:text-orange-600 dark:hover:text-orange-400"
    >
      View all projects
      <ArrowUpRight className="h-3.5 w-3.5" />
    </Link>
  );
}
