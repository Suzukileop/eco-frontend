'use client';

import Image from 'next/image';
import { PortfolioShareButton } from '@/components/portfolio/PortfolioShareButton';
import {
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import { ArrowUpRight, SERIF } from '@/components/portfolio/portfolio-section-primitives';
import {
  heroContentLayerFrame,
  heroPortraitLayerShell,
  heroGeomLayerPositionStyle,
} from '@/components/portfolio/portfolio-hero-geometric';
import {
  DEFAULT_CONTENT_GUTTER,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import type { PortfolioHeroMotifLayout } from '@/components/portfolio/portfolio-hero-settings';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  portfolioMonochromeSocialBrandClass,
  isNoirPortfolioTheme,
} from '@/components/portfolio/portfolio-themes';
import type { PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import type {
  PortfolioHeroAvailabilityDesign,
  PortfolioHeroAvailabilityPlacement,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  creatorNameFontClass,
  creatorNameFontStyle,
  creatorNameSizeClass,
  portraitPositionStyle,
  portraitRadiusClass,
  portraitWrapperSizeClass,
  type PortfolioHeroProfileSettings,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  metaCardBorderStyle,
  metaCardIconStyle,
  metaCardInnerClass,
  metaCardShellClass,
  metaLabelSizeClass,
  metaLabelTextStyle,
  metaRowPositionStyle,
  metaValueSizeClass,
  metaValueTextStyle,
  resolveMetaCardAnchors,
  type PortfolioHeroMetaSettings,
} from '@/components/portfolio/portfolio-hero-meta-settings';

export function HeroAvailabilityBadge({
  isAvailable,
  responseTimeLabel,
  showResponseTime = false,
  design = 'pill-live',
  placement = 'above-headline',
  layoutFlipped = false,
  placementContext = 'viewport',
}: {
  isAvailable?: boolean;
  responseTimeLabel?: string | null;
  showResponseTime?: boolean;
  design?: PortfolioHeroAvailabilityDesign;
  placement?: PortfolioHeroAvailabilityPlacement;
  pill?: boolean;
  layoutFlipped?: boolean;
  placementContext?: 'viewport' | 'inline';
}) {
  const placementClass =
    placementContext === 'inline'
      ? 'relative'
      : placement === 'top-right'
        ? layoutFlipped
          ? 'absolute left-0 top-0 z-30 lg:left-6 lg:top-2'
          : 'absolute right-0 top-0 z-30 lg:right-6 lg:top-2'
        : placement === 'below-headline'
          ? 'relative'
          : 'relative';

  if (isAvailable === false) {
    const unavailableClass =
      design === 'bordered'
        ? 'rounded-lg border-2 border-amber-300 bg-amber-50 px-4 py-2'
        : design === 'soft'
          ? 'rounded-full bg-neutral-100 px-4 py-2'
          : 'rounded-full border border-amber-200/90 bg-amber-50/90 px-4 py-2 shadow-sm';

    return (
      <span
        className={`inline-flex w-fit max-w-full items-center gap-2.5 text-sm font-semibold tracking-wide text-amber-800 ${placementClass} ${unavailableClass}`}
      >
        <span className="h-2.5 w-2.5 rounded-full bg-amber-500" aria-hidden />
        Currently unavailable
      </span>
    );
  }

  const responseSuffix =
    showResponseTime && responseTimeLabel?.trim()
      ? ` · replies ${responseTimeLabel.toLowerCase()}`
      : '';

  const shellClass = (() => {
    switch (design) {
      case 'pill-minimal':
        return 'rounded-full bg-transparent px-0 py-1 text-emerald-700 shadow-none dark:text-emerald-300';
      case 'bordered':
        return 'rounded-lg border-2 border-emerald-300 bg-white px-4 py-2 text-emerald-800 shadow-sm dark:border-emerald-500/40 dark:bg-neutral-900 dark:text-emerald-300';
      case 'soft':
        return 'rounded-full border border-neutral-200/80 bg-neutral-100 px-4 py-2 text-neutral-800 shadow-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100';
      default:
        return 'rounded-full border border-emerald-200/80 bg-white px-4 py-2 text-emerald-800 shadow-sm dark:border-emerald-500/25 dark:bg-neutral-900 dark:text-emerald-300';
    }
  })();

  const showPulse = design === 'pill-live';

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-2.5 text-sm font-semibold tracking-wide ${placementClass} ${shellClass}`}
    >
      <span className="relative flex h-2.5 w-2.5 shrink-0" aria-hidden>
        {showPulse ? (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
        ) : null}
        <span
          className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
            design === 'soft' ? 'bg-neutral-500' : 'bg-emerald-500'
          }`}
        />
      </span>
      Available for work{responseSuffix}
    </span>
  );
}

export function HeroCtas({
  creatorId,
  fullName,
  showWorkCta,
  showContactCta,
  primaryClass = 'inline-flex items-center gap-2 bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700',
  secondaryClass = 'inline-flex items-center gap-2 border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-neutral-900 transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white',
}: Pick<PortfolioHeroData, 'creatorId' | 'fullName' | 'showWorkCta' | 'showContactCta'> & {
  primaryClass?: string;
  secondaryClass?: string;
}) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {showWorkCta ? (
        <a href="#work" className={primaryClass}>
          View my work
          <ArrowUpRight className="h-4 w-4" />
        </a>
      ) : null}
      {showContactCta ? (
        <a href="#footer" className={secondaryClass}>
          Contact me
        </a>
      ) : null}
      <PortfolioShareButton creatorId={creatorId} creatorName={fullName} compact />
    </div>
  );
}

export function HeroStatsRow({
  stats,
  className = 'mt-10 grid grid-cols-3 gap-4 border-t border-neutral-200/80 pt-8 dark:border-neutral-800 sm:max-w-lg',
  valueClass = 'text-2xl font-bold text-neutral-950 dark:text-white sm:text-3xl',
  labelClass = 'mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-neutral-400',
}: {
  stats: PortfolioHeroData['stats'];
  className?: string;
  valueClass?: string;
  labelClass?: string;
}) {
  if (stats.length === 0) return null;

  return (
    <div className={className}>
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className={valueClass}>{stat.value}</p>
          <p className={labelClass}>{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

/** Decorative frame — full border on every edge of the portrait. */
export function HeroPortraitEditorialFrame({
  show = true,
  color = '#ffffff',
  width = 14,
  radiusClass = 'rounded-[2rem]',
}: {
  show?: boolean;
  color?: string;
  width?: number;
  radiusClass?: string;
}) {
  if (!show || width <= 0) return null;

  return (
    <div
      className={`pointer-events-none absolute inset-0 ${radiusClass}`}
      style={{
        borderWidth: width,
        borderStyle: 'solid',
        borderColor: color,
      }}
    />
  );
}

type EditorialPortraitLayerProps = {
  fullName: string;
  avatarUrl?: string | null;
};

/** Pristine portrait + external frame, above the geom overlay so the photo is never filtered or clipped. */
export function PortfolioHeroEditorialPortraitLayer({
  fullName,
  avatarUrl,
  fadeOpacity = 1,
  motifLayout = 'centered',
  profile,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: EditorialPortraitLayerProps & {
  fadeOpacity?: number;
  motifLayout?: PortfolioHeroMotifLayout;
  profile: PortfolioHeroProfileSettings;
  contentGutter?: PortfolioContentGutter;
}) {
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const radiusClass = portraitRadiusClass(profile.portraitRadius);

  return (
    <div
      className={`${heroPortraitLayerShell(contentGutter)} z-[25]`}
      style={{
        ...heroGeomLayerPositionStyle(motifLayout),
        ...(fadeOpacity >= 1 ? {} : { opacity: fadeOpacity, willChange: 'opacity' }),
      }}
    >
      <div className="absolute inset-0 pb-8 pt-20 sm:pb-10 sm:pt-24 lg:pb-0 lg:pt-0">
        <div
          className="absolute flex flex-col items-center"
          style={portraitPositionStyle(profile.portraitPosition)}
        >
          <div className={`relative ${portraitWrapperSizeClass(profile.portraitSize)}`}>
            <div className="relative aspect-[4/5] w-full">
              <div className={`overflow-hidden ${radiusClass}`}>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={360}
                    height={450}
                    className="aspect-[4/5] w-full object-cover"
                    priority
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center bg-neutral-200 text-4xl font-bold text-neutral-700">
                    {initials}
                  </div>
                )}
              </div>
              <HeroPortraitEditorialFrame
                show={profile.showPortraitFrame}
                color={profile.portraitFrameColor}
                width={profile.portraitFrameWidth}
                radiusClass={radiusClass}
              />
            </div>
          </div>
          {profile.showCreatorName ? (
            <p
              className={`mt-4 text-center ${creatorNameSizeClass(profile.creatorNameSize)} ${creatorNameFontClass(profile.creatorNameFont)}`}
              style={{
                color: profile.creatorNameColor,
                ...creatorNameFontStyle(profile.creatorNameFont),
              }}
            >
              {fullName}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type EditorialMetaLayerProps = {
  yearsOfExperience?: number | null;
  workCount?: number;
  locationLabel?: string | null;
  fadeOpacity?: number;
};

/** Stats straddling the motif bottom edge — half on black, half on white (like the portrait). */
export function PortfolioHeroEditorialMetaLayer({
  yearsOfExperience,
  workCount,
  locationLabel,
  fadeOpacity = 1,
  motifLayout = 'centered',
  meta,
  contentGutter = DEFAULT_CONTENT_GUTTER,
}: EditorialMetaLayerProps & {
  motifLayout?: PortfolioHeroMotifLayout;
  meta: PortfolioHeroMetaSettings;
  contentGutter?: PortfolioContentGutter;
}) {
  const fadeStyle = fadeOpacity >= 1 ? undefined : { opacity: fadeOpacity, willChange: 'opacity' as const };

  return (
    <div className={`${heroContentLayerFrame(contentGutter)} z-[26] overflow-visible`} style={fadeStyle}>
      <HeroProfileMeta
        editorial
        elevated
        straddle
        motifLayout={motifLayout}
        meta={meta}
        yearsOfExperience={yearsOfExperience}
        workCount={workCount}
        locationLabel={locationLabel}
      />
    </div>
  );
}

export function HeroPortrait({
  fullName,
  avatarUrl,
  className = 'aspect-[4/5] w-full object-cover',
  wrapperClass = 'w-full max-w-md',
  rounded = false,
  caption,
  captionOnDark = false,
  preserveLayoutOnDesktop = false,
  profile,
  children,
}: {
  fullName: string;
  avatarUrl?: string | null;
  className?: string;
  wrapperClass?: string;
  rounded?: boolean;
  caption?: string | null;
  captionOnDark?: boolean;
  /** Editorial: hide in-flow image on lg (elevated layer renders the visible photo). */
  preserveLayoutOnDesktop?: boolean;
  profile?: PortfolioHeroProfileSettings;
  children?: React.ReactNode;
}) {
  const radiusClass = profile ? portraitRadiusClass(profile.portraitRadius) : rounded ? 'rounded-[2rem]' : '';
  const shell = radiusClass ? `overflow-hidden ${radiusClass}` : '';
  const resolvedWrapperClass = profile ? portraitWrapperSizeClass(profile.portraitSize) : wrapperClass;
  const showCaption = profile ? profile.showCreatorName : Boolean(caption?.trim());
  const captionText = caption?.trim() || fullName;

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <figure className={resolvedWrapperClass}>
      <div className="relative">
        <div className={`relative ${shell}`}>
          {avatarUrl ? (
            <>
              <Image
                src={avatarUrl}
                alt={fullName}
                width={360}
                height={450}
                className={`${className}${preserveLayoutOnDesktop ? ' lg:hidden' : ''}`}
                priority
              />
              {preserveLayoutOnDesktop ? (
                <div className={`hidden lg:block ${className}`} aria-hidden />
              ) : null}
            </>
          ) : (
            <>
              <div
                className={`flex items-center justify-center bg-neutral-200 text-4xl font-bold text-neutral-700 dark:bg-neutral-800 dark:text-white ${className}${preserveLayoutOnDesktop ? ' lg:hidden' : ''}`}
              >
                {initials}
              </div>
              {preserveLayoutOnDesktop ? (
                <div className={`hidden lg:block ${className}`} aria-hidden />
              ) : null}
            </>
          )}
          {profile ? (
            <HeroPortraitEditorialFrame
              show={profile.showPortraitFrame}
              color={profile.portraitFrameColor}
              width={profile.portraitFrameWidth}
              radiusClass={radiusClass || 'rounded-[2rem]'}
            />
          ) : null}
          {children}
        </div>
      </div>
      {showCaption ? (
        <figcaption
          className={
            profile
              ? `mt-4 text-center ${creatorNameSizeClass(profile.creatorNameSize)} ${creatorNameFontClass(profile.creatorNameFont)}`
              : `mt-4 text-center text-base font-bold tracking-tight sm:text-lg ${
                  captionOnDark
                    ? 'text-neutral-950 lg:relative lg:z-30 lg:text-white dark:text-white'
                    : 'text-neutral-950 dark:text-white'
                }`
          }
          style={
            profile
              ? {
                  color: profile.creatorNameColor,
                  ...creatorNameFontStyle(profile.creatorNameFont),
                }
              : undefined
          }
        >
          {captionText}
        </figcaption>
      ) : null}
    </figure>
  );
}

export function HeroTitle({
  fullName,
  nameLead,
  nameAccent,
  isVerified,
  accentClass = 'bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 bg-clip-text text-transparent',
  sizeClass = 'text-4xl sm:text-5xl lg:text-6xl',
  darkSurface = false,
}: Pick<PortfolioHeroData, 'fullName' | 'nameLead' | 'nameAccent' | 'isVerified'> & {
  accentClass?: string;
  sizeClass?: string;
  darkSurface?: boolean;
}) {
  const titleClass = darkSurface ? 'text-white' : 'text-neutral-950 dark:text-white';

  return (
    <>
      <h1 className={`font-bold tracking-tight ${titleClass} ${sizeClass} leading-[1.05]`}>
        {nameAccent ? (
          <>
            <span className="block">{nameLead}</span>
            <span className={`mt-1 block ${accentClass}`}>{nameAccent}</span>
          </>
        ) : (
          <span className="block">{fullName}</span>
        )}
      </h1>
      {isVerified ? (
        <span className="mt-3 inline-block bg-blue-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
          Verified
        </span>
      ) : null}
    </>
  );
}

export function HeroSpecialite({
  specialite,
  darkSurface = false,
}: {
  specialite?: string | null;
  darkSurface?: boolean;
}) {
  if (!specialite?.trim()) return null;
  return (
    <p
      className={`mt-4 text-xl italic sm:text-2xl ${darkSurface ? 'text-neutral-400' : 'text-neutral-500 dark:text-neutral-400'}`}
      style={{ fontFamily: SERIF }}
    >
      {specialite}
    </p>
  );
}

export function HeroToolsGrid({
  tools,
  layout = 'column',
  onDark = false,
}: {
  tools: string[];
  layout?: 'column' | 'row';
  onDark?: boolean;
}) {
  const items = Array.from(new Set(tools.map((item) => item.trim()).filter(Boolean))).slice(0, 6);
  if (items.length === 0) return null;

  const chipClass = onDark
    ? 'border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900 lg:border-neutral-200 lg:bg-white lg:shadow-md'
    : 'border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900';

  return (
    <div className={`flex ${layout === 'row' ? 'flex-row flex-wrap justify-start gap-2.5' : 'flex-col gap-3'}`}>
      {items.map((tool) => (
        <div
          key={tool}
          title={tool}
          aria-label={tool}
          className={`flex h-12 w-12 items-center justify-center rounded-full border ${chipClass}`}
        >
          <CreatorToolLogo label={tool} size={28} className="pf-tool-logo rounded-full !bg-white" />
        </div>
      ))}
    </div>
  );
}

function HeroMetaIcon({
  type,
  accentColor,
  visible,
}: {
  type: 'years' | 'projects' | 'location';
  accentColor: string;
  visible: boolean;
}) {
  if (!visible) return null;

  const className = `${
    type === 'location' ? 'h-6 w-6' : 'h-5 w-5'
  } text-orange-500 dark:text-orange-400`;
  const style = metaCardIconStyle(accentColor);

  if (type === 'years') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
      </svg>
    );
  }

  if (type === 'projects') {
    return (
      <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4 5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1V5zM4 15a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4zm10 0a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-4z"
        />
      </svg>
    );
  }

  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.828 0l-4.243-4.243a8 8 0 1 1 11.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" />
    </svg>
  );
}

/** locationLabel is "city, country" — display as "country / city". */
function formatLocationDisplay(label: string): string {
  const commaIndex = label.indexOf(',');
  if (commaIndex === -1) return label.trim();
  const city = label.slice(0, commaIndex).trim();
  const country = label.slice(commaIndex + 1).trim();
  if (!city || !country) return label.trim();
  return `${country} / ${city}`;
}

function HeroProfileMetaItem({
  item,
  meta,
  showStraddleHighlight = false,
}: {
  item: { id: string; value: string; label: string; icon: 'years' | 'projects' | 'location' };
  meta: PortfolioHeroMetaSettings;
  showStraddleHighlight?: boolean;
}) {
  const isLocation = item.icon === 'location';
  const valueClass = metaValueSizeClass(meta.metaValueSize, isLocation);
  const labelClass = `${metaLabelSizeClass(meta.metaValueSize)} font-bold uppercase tracking-[0.1em]`;
  const valueStyle = metaValueTextStyle(meta.metaValueColor);
  const labelStyle = metaLabelTextStyle(meta.metaLabelColor);

  const icon = (
    <HeroMetaIcon type={item.icon} accentColor={meta.metaAccentColor} visible={meta.showMetaIcons} />
  );

  const valueNode = isLocation ? (
    <p
      className={`relative max-w-[8.5rem] font-bold sm:max-w-[9.5rem] ${valueClass}`}
      style={valueStyle}
      title={item.value}
    >
      {formatLocationDisplay(item.value)}
    </p>
  ) : (
    <p className={`relative font-bold ${valueClass}`} style={valueStyle}>
      {item.value}
    </p>
  );

  const labelNode =
    meta.metaShowLabels && !isLocation ? (
      <p className={`relative mt-0.5 ${labelClass}`} style={labelStyle}>
        {item.label}
      </p>
    ) : null;

  const innerClass = metaCardInnerClass(meta.metaInnerLayout);

  const content = (() => {
    switch (meta.metaInnerLayout) {
      case 'inline':
        return (
          <>
            {icon}
            <div className="min-w-0">
              {valueNode}
              {labelNode}
            </div>
          </>
        );
      case 'value-first':
        return (
          <>
            {valueNode}
            {labelNode}
            {icon}
          </>
        );
      case 'icon-bottom':
        return (
          <>
            {valueNode}
            {labelNode}
            <div className="mt-0.5">{icon}</div>
          </>
        );
      default:
        return (
          <>
            {icon}
            <div className={isLocation ? 'mt-1.5' : 'mt-1'}>{valueNode}</div>
            {labelNode}
          </>
        );
    }
  })();

  return (
    <div
      className={metaCardShellClass(meta, isLocation)}
      style={metaCardBorderStyle(meta)}
    >
      {showStraddleHighlight && meta.showMetaFrame && meta.metaDisplayDesign === 'elevated' ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-neutral-400/[0.07]"
        />
      ) : null}
      <div className={`relative ${innerClass}`}>{content}</div>
    </div>
  );
}

function buildHeroMetaItems(
  yearsOfExperience: number | null | undefined,
  workCount: number | undefined,
  locationLabel: string | null | undefined,
  meta: PortfolioHeroMetaSettings
) {
  return [
    yearsOfExperience != null && yearsOfExperience > 0 && meta.showYearsCard
      ? { id: 'years', value: `${yearsOfExperience}+`, label: 'Years exp.', icon: 'years' as const }
      : null,
    workCount != null && workCount > 0 && meta.showProjectsCard
      ? { id: 'projects', value: String(workCount), label: 'Projects', icon: 'projects' as const }
      : null,
    locationLabel?.trim() && meta.showLocationCard
      ? { id: 'location', value: locationLabel.trim(), label: 'Location', icon: 'location' as const }
      : null,
  ].filter(
    (item): item is { id: string; value: string; label: string; icon: 'years' | 'projects' | 'location' } =>
      item != null
  );
}

function metaRowGapClass(spread: PortfolioHeroMetaSettings['metaSpread']): string {
  switch (spread) {
    case 'compact':
      return 'gap-5 sm:gap-6';
    case 'wide':
      return 'gap-10 sm:gap-12';
    default:
      return 'gap-7 sm:gap-9';
  }
}

export function HeroProfileMeta({
  yearsOfExperience,
  workCount,
  locationLabel,
  className = '',
  spread = false,
  editorial = false,
  elevated = false,
  straddle = false,
  meta,
}: {
  yearsOfExperience?: number | null;
  workCount?: number;
  locationLabel?: string | null;
  className?: string;
  spread?: boolean;
  editorial?: boolean;
  elevated?: boolean;
  straddle?: boolean;
  motifLayout?: PortfolioHeroMotifLayout;
  meta: PortfolioHeroMetaSettings;
}) {
  const items = buildHeroMetaItems(yearsOfExperience, workCount, locationLabel, meta);

  if (items.length === 0) return null;

  if (straddle && elevated && editorial && meta.metaPlacementMode === 'straddle-bottom') {
    const anchors = resolveMetaCardAnchors(items.length, meta.metaPosition.x, meta.metaSpread);
    const rowTop = `${meta.metaPosition.y}vh`;

    return (
      <>
        {items.map((item, index) => (
          <div
            key={item.id}
            className={`pointer-events-auto absolute -translate-x-1/2 -translate-y-1/2 ${className}`.trim()}
            style={{ left: `${anchors[index]}%`, top: rowTop }}
          >
            <HeroProfileMetaItem item={item} meta={meta} showStraddleHighlight />
          </div>
        ))}
      </>
    );
  }

  if (straddle && elevated && editorial && meta.metaPlacementMode === 'free') {
    return (
      <div
        className={`pointer-events-auto absolute flex items-center ${metaRowGapClass(meta.metaSpread)} ${className}`.trim()}
        style={metaRowPositionStyle(meta.metaPosition)}
      >
        {items.map((item) => (
          <HeroProfileMetaItem key={item.id} item={item} meta={meta} />
        ))}
      </div>
    );
  }

  return (
    <div
      className={`flex items-center ${
        spread ? 'w-full justify-between' : `justify-center ${metaRowGapClass(meta.metaSpread)}`
      } ${className}`.trim()}
    >
      {items.map((item) => (
        <HeroProfileMetaItem key={item.id} item={item} meta={meta} />
      ))}
    </div>
  );
}

export function HeroSocialGrid({
  links,
  themeId = 'editorial',
}: {
  links: PortfolioHeroData['socialLinks'];
  themeId?: PortfolioThemeId;
}) {
  if (links.length === 0) return null;

  const brandClass = isNoirPortfolioTheme(themeId)
    ? portfolioMonochromeSocialBrandClass
    : socialPlatformBrandClass;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {links.slice(0, 6).map((link) => (
        <a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noreferrer"
          title={link.label}
          aria-label={link.label}
          className={`flex h-12 w-12 items-center justify-center rounded-full border border-neutral-200 transition hover:border-neutral-400 hover:shadow-sm dark:border-neutral-700 ${brandClass(link.platform)}`}
        >
          <SocialPlatformIcon platform={link.platform} className="h-6 w-6" />
        </a>
      ))}
    </div>
  );
}

export function HeroSideNav({ items }: { items: PortfolioHeroData['navItems'] }) {
  if (items.length <= 1) return null;

  return (
    <nav className="hidden flex-col gap-3 lg:flex" aria-label="Accès rapide">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="group flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.14em] text-neutral-400 transition hover:text-orange-600"
        >
          <span className="h-px w-6 bg-neutral-300 transition group-hover:w-10 group-hover:bg-orange-500" />
          {item.label}
        </a>
      ))}
    </nav>
  );
}
