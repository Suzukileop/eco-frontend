'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, MouseEvent, ReactNode, RefObject } from 'react';
import Image from 'next/image';
import { PortfolioShareButton } from '@/components/portfolio/PortfolioShareButton';
import {
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import { ArrowUpRight, SERIF } from '@/components/portfolio/portfolio-section-primitives';
import {
  HeroEditorialLayerFrame,
  heroGeomLayerPositionStyle,
} from '@/components/portfolio/portfolio-hero-geometric';
import {
  heroVerticalCellToPosition,
  heroVerticalVisualBandStyle,
  resolveHeroVerticalVisualBand,
} from '@/components/portfolio/portfolio-hero-vertical-cell-placement';
import {
  DEFAULT_CONTENT_GUTTER,
  portfolioHeroLayerInset,
  type PortfolioContentGutter,
} from '@/components/portfolio/portfolio-editorial-layout';
import type { PortfolioHeroMotifLayout, PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';
import { CreatorToolLogo } from '@/components/creator/studio/CreatorToolLogo';
import {
  portfolioMonochromeSocialBrandClass,
  isNoirPortfolioTheme,
} from '@/components/portfolio/portfolio-themes';
import type { PortfolioThemeId } from '@/components/portfolio/portfolio-themes';
import type {
  PortfolioHeroAvailabilityBorderRadius,
  PortfolioHeroAvailabilityBorderWidth,
  PortfolioHeroAvailabilityDesign,
  PortfolioHeroAvailabilityDotSize,
  PortfolioHeroAvailabilityPlacement,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  DEFAULT_AVAILABILITY_BACKGROUND_COLOR,
  DEFAULT_AVAILABILITY_BORDER_COLOR,
  DEFAULT_AVAILABILITY_DOT_COLOR,
  DEFAULT_AVAILABILITY_LABEL,
  DEFAULT_AVAILABILITY_TEXT_COLOR,
  DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR,
  DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR,
  DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR,
  DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL,
  DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR,
} from '@/components/portfolio/portfolio-hero-settings';
import {
  creatorNameFontStyle,
  formatPortraitSpecialtyText,
  portraitCaptionBandEdge,
  portraitFrameHasVisibleChrome,
  portraitFrameShellStyle,
  portraitImageMediaStyle,
  portraitMatFooterAlignClass,
  portraitPositionStyle,
  portraitRadiusClass,
  portraitWrapperSizeClass,
  resolvePortraitPositionForDivision,
  resolvePortraitVerticalCell,
  type PortraitInFrameTextPlacement,
  type PortfolioHeroProfileSettings,
} from '@/components/portfolio/portfolio-hero-profile-settings';
import {
  elementTextStyleClass,
  elementTextInlineStyle,
} from '@/components/portfolio/portfolio-element-text-style';
import { normalizeHeroElementStyles } from '@/components/portfolio/portfolio-hero-element-styles';
import type { PortfolioHeroData } from '@/components/portfolio/portfolio-hero-types';
import {
  formatMetaLocationDisplay,
  metaCardBorderStyle,
  metaCardIconStyle,
  metaCardInnerClass,
  metaCardShellClass,
  metaRowPositionStyle,
  metaValueSizeClass,
  resolveMetaCardAccentColor,
  resolveMetaCardAnchors,
  resolveMetaCardGapPx,
  resolveMetaCardsFillWidth,
  resolveMetaCardsOrientation,
  resolveMetaPositionForDivision,
  resolveMetaVerticalCell,
  resolveMetaCardFrameShape,
  type PortfolioHeroMetaCardId,
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
  label = DEFAULT_AVAILABILITY_LABEL,
  unavailableLabel = DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL,
  textColor = DEFAULT_AVAILABILITY_TEXT_COLOR,
  backgroundColor = DEFAULT_AVAILABILITY_BACKGROUND_COLOR,
  borderColor = DEFAULT_AVAILABILITY_BORDER_COLOR,
  borderWidth = 'thin',
  borderRadius = 'full',
  showDot = true,
  dotColor = DEFAULT_AVAILABILITY_DOT_COLOR,
  dotSize = 'md',
  dotPulse = true,
  unavailableTextColor = DEFAULT_AVAILABILITY_UNAVAILABLE_TEXT_COLOR,
  unavailableBackgroundColor = DEFAULT_AVAILABILITY_UNAVAILABLE_BACKGROUND_COLOR,
  unavailableBorderColor = DEFAULT_AVAILABILITY_UNAVAILABLE_BORDER_COLOR,
  unavailableDotColor = DEFAULT_AVAILABILITY_UNAVAILABLE_DOT_COLOR,
  textClassName = '',
  textStyle,
  marginTopPx = 0,
  marginBottomPx = 0,
}: {
  isAvailable?: boolean;
  responseTimeLabel?: string | null;
  showResponseTime?: boolean;
  design?: PortfolioHeroAvailabilityDesign;
  placement?: PortfolioHeroAvailabilityPlacement;
  pill?: boolean;
  layoutFlipped?: boolean;
  placementContext?: 'viewport' | 'inline';
  label?: string;
  unavailableLabel?: string;
  textColor?: string;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: PortfolioHeroAvailabilityBorderWidth;
  borderRadius?: PortfolioHeroAvailabilityBorderRadius;
  showDot?: boolean;
  dotColor?: string;
  dotSize?: PortfolioHeroAvailabilityDotSize;
  dotPulse?: boolean;
  unavailableTextColor?: string;
  unavailableBackgroundColor?: string;
  unavailableBorderColor?: string;
  unavailableDotColor?: string;
  textClassName?: string;
  textStyle?: CSSProperties;
  marginTopPx?: number;
  marginBottomPx?: number;
}) {
  const placementClass =
    placementContext === 'inline'
      ? 'relative'
      : placement === 'top-right'
        ? layoutFlipped
          ? 'absolute left-0 top-0 z-30 lg:left-6 lg:top-2'
          : 'absolute right-0 top-0 z-30 lg:right-6 lg:top-2'
        : placement === 'top-left'
          ? layoutFlipped
            ? 'absolute right-0 top-0 z-30 lg:right-6 lg:top-2'
            : 'absolute left-0 top-0 z-30 lg:left-6 lg:top-2'
          : placement === 'top-center'
            ? 'absolute left-1/2 top-0 z-30 -translate-x-1/2 lg:top-2'
            : 'relative';

  const radiusClass =
    borderRadius === 'none'
      ? 'rounded-none'
      : borderRadius === 'sm'
        ? 'rounded-md'
        : borderRadius === 'md'
          ? 'rounded-xl'
          : borderRadius === 'lg'
            ? 'rounded-2xl'
            : 'rounded-full';

  const borderPx =
    borderWidth === 'none' ? 0 : borderWidth === 'medium' ? 2 : borderWidth === 'thick' ? 3 : 1;

  const paddingClass = design === 'pill-minimal' ? 'px-0 py-1' : 'px-4 py-2';
  const shadowClass = design === 'pill-minimal' ? 'shadow-none' : 'shadow-sm';
  const unavailable = isAvailable === false;

  const shellStyle: CSSProperties = {
    color: unavailable ? unavailableTextColor : textColor,
    backgroundColor: unavailable
      ? unavailableBackgroundColor
      : design === 'pill-minimal'
        ? 'transparent'
        : backgroundColor,
    borderColor: unavailable ? unavailableBorderColor : borderColor,
    borderWidth: borderPx,
    borderStyle: borderPx > 0 ? 'solid' : 'none',
    marginTop: marginTopPx > 0 ? marginTopPx : undefined,
    marginBottom: marginBottomPx > 0 ? marginBottomPx : undefined,
  };

  const resolvedDotColor = unavailable ? unavailableDotColor : dotColor;
  const dotBoxClass =
    dotSize === 'sm' ? 'h-1.5 w-1.5' : dotSize === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5';

  const responseSuffix =
    !unavailable && showResponseTime && responseTimeLabel?.trim()
      ? ` · replies ${responseTimeLabel.toLowerCase()}`
      : '';

  const displayLabel = unavailable
    ? unavailableLabel.trim() || DEFAULT_AVAILABILITY_UNAVAILABLE_LABEL
    : label.trim() || DEFAULT_AVAILABILITY_LABEL;

  // Respect the toggle only — do not force pulse for pill-live.
  const pulse = !unavailable && showDot && dotPulse;

  return (
    <span
      className={`inline-flex w-fit max-w-full items-center gap-2.5 tracking-wide ${textClassName} ${placementClass} ${radiusClass} ${paddingClass} ${shadowClass}`.trim()}
      style={{ ...shellStyle, ...textStyle }}
    >
      {showDot ? (
        <span className={`relative flex shrink-0 ${dotBoxClass}`} aria-hidden>
          {pulse ? (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: resolvedDotColor }}
            />
          ) : null}
          <span
            className={`relative inline-flex rounded-full ${dotBoxClass}`}
            style={{ backgroundColor: resolvedDotColor }}
          />
        </span>
      ) : null}
      {displayLabel}
      {responseSuffix}
    </span>
  );
}

export function HeroCtas({
  creatorId,
  fullName,
  showWorkCta,
  showContactCta,
  contactHref = '#footer',
  workHref = '#work',
  onNavigateSection,
  primaryClass = 'inline-flex items-center gap-2 bg-orange-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-orange-700',
  secondaryClass = 'inline-flex items-center gap-2 border border-neutral-300 bg-white px-6 py-3 text-sm font-bold text-neutral-900 transition hover:border-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white',
}: Pick<
  PortfolioHeroData,
  'creatorId' | 'fullName' | 'showWorkCta' | 'showContactCta' | 'contactHref' | 'workHref' | 'onNavigateSection'
> & {
  primaryClass?: string;
  secondaryClass?: string;
}) {
  const handleSectionNav = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    if (!onNavigateSection) return;
    event.preventDefault();
    onNavigateSection(sectionId);
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showWorkCta ? (
        <a
          href={workHref}
          className={primaryClass}
          onClick={(event) => handleSectionNav(event, 'work')}
        >
          View my work
          <ArrowUpRight className="h-4 w-4" />
        </a>
      ) : null}
      {showContactCta ? (
        <a
          href={contactHref}
          className={secondaryClass}
          onClick={(event) => {
            if (!onNavigateSection) return;
            event.preventDefault();
            const id = contactHref.replace(/^#/, '') || 'contact';
            onNavigateSection(id === 'footer' ? 'contact' : id);
          }}
        >
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

/** Decorative frame — border + optional mat fill + padding around the portrait. */
export function HeroPortraitEditorialFrame({
  show = true,
  color = '#ffffff',
  width = 14,
  borderOpacity = 100,
  backgroundColor = '#ffffff',
  backgroundOpacity = 0,
  paddingTop = 0,
  paddingBottom = 0,
  paddingLeft = 0,
  paddingRight = 0,
  radiusClass = 'rounded-[2rem]',
  children,
}: {
  show?: boolean;
  color?: string;
  width?: number;
  borderOpacity?: number;
  backgroundColor?: string;
  backgroundOpacity?: number;
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  radiusClass?: string;
  children?: ReactNode;
}) {
  const chrome = {
    showPortraitFrame: show,
    portraitFrameColor: color,
    portraitFrameWidth: width,
    portraitFrameBorderOpacity: borderOpacity,
    portraitFrameBackgroundColor: backgroundColor,
    portraitFrameBackgroundOpacity: backgroundOpacity,
    portraitFramePaddingTop: paddingTop,
    portraitFramePaddingBottom: paddingBottom,
    portraitFramePaddingLeft: paddingLeft,
    portraitFramePaddingRight: paddingRight,
  };

  if (!portraitFrameHasVisibleChrome(chrome)) {
    return children ? <>{children}</> : null;
  }

  const shellStyle = portraitFrameShellStyle(chrome);

  if (children) {
    return (
      <div className={`relative ${radiusClass}`} style={shellStyle}>
        {children}
      </div>
    );
  }

  // Legacy overlay (border-only) when used without wrapping children.
  if ((width ?? 0) <= 0) return null;
  return (
    <div
      className={`pointer-events-none absolute inset-0 ${radiusClass}`}
      style={shellStyle}
      aria-hidden
    />
  );
}

type CaptionBandLine = {
  key: string;
  text: string;
  className: string;
  style?: CSSProperties;
};

type CaptionBandProfile = Pick<
  PortfolioHeroProfileSettings,
  | 'showCreatorName'
  | 'creatorNameInFrame'
  | 'creatorNameFramePlacement'
  | 'showSpecialtyInFrame'
  | 'specialtyFramePlacement'
  | 'portraitCaptionLayout'
  | 'portraitCaptionBarEnabled'
  | 'portraitCaptionBarEdge'
  | 'portraitCaptionBarColor'
  | 'portraitCaptionBarHeight'
  | 'portraitCaptionShowDot'
  | 'portraitSpecialtyUppercase'
  | 'portraitFrameBackgroundColor'
> & {
  /** Status dot mirrors the availability badge (same color + pulse). */
  availabilityDotColor?: string;
  availabilityDotPulse?: boolean;
};

function buildPortraitCaptionBands(
  fullName: string,
  specialite: string | null | undefined,
  profile: CaptionBandProfile,
  nameClassName: string,
  nameStyle?: CSSProperties
): { top: CaptionBandLine[]; bottom: CaptionBandLine[] } {
  const top: CaptionBandLine[] = [];
  const bottom: CaptionBandLine[] = [];

  const push = (
    placement: PortraitInFrameTextPlacement,
    line: CaptionBandLine,
    forceEdge?: 'top' | 'bottom'
  ) => {
    const edge =
      forceEdge ??
      (profile.portraitCaptionLayout === 'mat-footer'
        ? 'bottom'
        : portraitCaptionBandEdge(placement));
    (edge === 'top' ? top : bottom).push(line);
  };

  const showNameInFrame = Boolean(
    profile.showCreatorName &&
      fullName.trim() &&
      (profile.creatorNameInFrame || profile.portraitCaptionLayout === 'mat-footer')
  );

  if (showNameInFrame) {
    push(profile.creatorNameFramePlacement, {
      key: 'name',
      text: fullName.trim(),
      className: nameClassName,
      style: nameStyle,
    });
  }

  const specialtyText = formatPortraitSpecialtyText(
    specialite,
    profile.portraitSpecialtyUppercase
  );
  if (profile.showSpecialtyInFrame && specialtyText) {
    const specialtyStyle: CSSProperties =
      profile.portraitCaptionLayout === 'mat-footer'
        ? {
            ...nameStyle,
            color:
              typeof nameStyle?.color === 'string' &&
              nameStyle.color.toLowerCase() === '#ffffff'
                ? '#A3A3A3'
                : '#737373',
            fontWeight: 500,
          }
        : {
            ...nameStyle,
            textTransform: profile.portraitSpecialtyUppercase ? 'uppercase' : undefined,
          };

    push(
      profile.portraitCaptionLayout === 'mat-header'
        ? 'top-center'
        : profile.specialtyFramePlacement,
      {
        key: 'specialty',
        text: specialtyText,
        className:
          profile.portraitCaptionLayout === 'mat-header'
            ? `text-xs font-semibold tracking-[0.18em] sm:text-sm ${nameClassName}`
            : `text-sm leading-tight tracking-wide opacity-90 ${nameClassName}`,
        style: specialtyStyle,
      },
      profile.portraitCaptionLayout === 'mat-header' ? 'top' : undefined
    );
  }

  return { top, bottom };
}

/**
 * Dedicated caption rectangle — sibling of the photo, never overlapping the image.
 * Edge (top/bottom) is automatic from placement / template layout.
 */
export function HeroPortraitCaptionBand({
  edge,
  lines,
  profile,
  forceShow,
}: {
  edge: 'top' | 'bottom';
  lines: CaptionBandLine[];
  profile: CaptionBandProfile;
  /** Show an empty filled bar even without text (rare). */
  forceShow?: boolean;
}) {
  const barWantsThisEdge =
    profile.portraitCaptionBarEnabled &&
    (profile.portraitCaptionLayout === 'mat-header'
      ? edge === 'top'
      : profile.portraitCaptionLayout === 'mat-footer'
        ? edge === 'bottom'
        : profile.portraitCaptionBarEdge === edge);

  if (!lines.length && !forceShow && !barWantsThisEdge) return null;
  if (!lines.length && !barWantsThisEdge) return null;

  const alignSource = lines.find((line) => line.key === 'name')
    ? profile.creatorNameFramePlacement
    : profile.specialtyFramePlacement;
  const alignClass = portraitMatFooterAlignClass(
    profile.portraitCaptionLayout === 'mat-header' && edge === 'top'
      ? 'top-center'
      : alignSource
  );

  const usePlate = Boolean(
    (profile.portraitCaptionBarEnabled || barWantsThisEdge) &&
      !(profile.portraitCaptionLayout === 'mat-header' && edge === 'bottom')
  );
  const minHeight = usePlate
    ? Math.max(lines.length ? 44 : 0, profile.portraitCaptionBarHeight || 44)
    : undefined;

  // Raised plate only when caption bar is on for this edge; otherwise text sits in the mat.
  const plateColor = profile.portraitCaptionBarColor || '#0A0A0A';
  const bg = usePlate ? plateColor : 'transparent';

  // Blinking status dot on the right of the plate — mirrors the availability badge.
  const showDot = Boolean(profile.portraitCaptionShowDot && usePlate && barWantsThisEdge);
  const dotColor = profile.availabilityDotColor || '#00e5a0';
  const dotPulse = profile.availabilityDotPulse !== false;

  // Gap from the photo; content stays inside the frame padding box (no bleed).
  const gapFromPhoto = 12;

  return (
    <div
      className={`relative z-[1] flex w-full shrink-0 flex-col justify-center gap-1 ${
        usePlate ? 'rounded-xl px-3.5 py-3 sm:px-4 sm:py-3.5' : 'px-0.5 py-1'
      } ${alignClass}`}
      style={{
        minHeight,
        backgroundColor: bg,
        marginTop: edge === 'bottom' ? gapFromPhoto : 0,
        marginBottom: edge === 'top' ? gapFromPhoto : 0,
        paddingRight: showDot ? 32 : undefined,
      }}
      aria-hidden={lines.length === 0}
    >
      {lines.map((line) => (
        <p key={line.key} className={`leading-tight ${line.className}`} style={line.style}>
          {line.text}
        </p>
      ))}
      {showDot ? (
        <span
          className="absolute right-3.5 top-1/2 flex h-2.5 w-2.5 -translate-y-1/2 sm:right-4"
          aria-hidden
        >
          {dotPulse ? (
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: dotColor }}
            />
          ) : null}
          <span
            className="relative inline-flex h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: dotColor }}
          />
        </span>
      ) : null}
    </div>
  );
}

type EditorialPortraitLayerProps = {
  fullName: string;
  avatarUrl?: string | null;
  specialite?: string | null;
};

/** Pristine portrait + external frame, above the geom overlay so the photo is never filtered or clipped. */
export function PortfolioHeroEditorialPortraitLayer({
  fullName,
  avatarUrl,
  specialite,
  fadeOpacity = 1,
  motifLayout = 'centered',
  profile,
  contentGutter = DEFAULT_CONTENT_GUTTER,
  contentWidthClass = 'max-w-[90rem]',
  verticalDivision = false,
  layoutDivision,
}: EditorialPortraitLayerProps & {
  fadeOpacity?: number;
  motifLayout?: PortfolioHeroMotifLayout;
  profile: PortfolioHeroPresentationSettings;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  /** When true, use vertical free-placement coords and full-frame panel (not motif geom box). */
  verticalDivision?: boolean;
  /** Active screen division — used to pin layers to the visual half. */
  layoutDivision?: string;
}) {
  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const radiusClass = portraitRadiusClass(profile.portraitRadius);
  const elementStyles = normalizeHeroElementStyles(profile.elementStyles, profile);
  const creatorNameClass = elementTextStyleClass(elementStyles.creatorName, 'body');
  const creatorNameStyle = {
    ...elementTextInlineStyle(elementStyles.creatorName),
    ...creatorNameFontStyle(profile.creatorNameFont),
  };
  const showNameBelow =
    profile.showCreatorName &&
    !profile.creatorNameInFrame &&
    profile.portraitCaptionLayout !== 'mat-footer';
  const imageMediaStyle = portraitImageMediaStyle(profile);
  const captionBands = buildPortraitCaptionBands(
    fullName,
    specialite,
    profile,
    creatorNameClass,
    creatorNameStyle
  );
  const portraitPosition = resolvePortraitPositionForDivision(profile, verticalDivision);
  const portraitCell = resolvePortraitVerticalCell(profile);
  const visualBand = verticalDivision
    ? resolveHeroVerticalVisualBand(layoutDivision ?? '')
    : null;

  const portraitCard = (
    <>
      <div className={`relative ${portraitWrapperSizeClass(profile.portraitSize)}`}>
        <div className="relative w-full">
          <HeroPortraitEditorialFrame
            show={profile.showPortraitFrame}
            color={profile.portraitFrameColor}
            width={profile.portraitFrameWidth}
            borderOpacity={profile.portraitFrameBorderOpacity}
            backgroundColor={profile.portraitFrameBackgroundColor}
            backgroundOpacity={profile.portraitFrameBackgroundOpacity}
            paddingTop={profile.portraitFramePaddingTop}
            paddingBottom={profile.portraitFramePaddingBottom}
            paddingLeft={profile.portraitFramePaddingLeft}
            paddingRight={profile.portraitFramePaddingRight}
            radiusClass={radiusClass}
          >
            <div className="flex w-full flex-col">
              <HeroPortraitCaptionBand
                edge="top"
                lines={captionBands.top}
                profile={profile}
              />
              <div className={`relative aspect-[4/5] w-full overflow-hidden ${radiusClass}`}>
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={fullName}
                    width={360}
                    height={450}
                    className="aspect-[4/5] h-full w-full"
                    style={imageMediaStyle}
                    priority
                  />
                ) : (
                  <div className="flex aspect-[4/5] w-full items-center justify-center bg-neutral-200 text-4xl font-bold text-neutral-700">
                    {initials}
                  </div>
                )}
              </div>
              <HeroPortraitCaptionBand
                edge="bottom"
                lines={captionBands.bottom}
                profile={profile}
              />
            </div>
          </HeroPortraitEditorialFrame>
        </div>
      </div>
      {showNameBelow ? (
        <p className={`mt-4 text-center ${creatorNameClass}`} style={creatorNameStyle}>
          {fullName}
        </p>
      ) : null}
    </>
  );

  /**
   * Vertical screen division — same pattern as stats MetaLayer:
   * pin a band frame (definite height) then left% + top% inside it.
   * Avoid HeroEditorialLayerFrame's inset-y-0 which fights the band and kills Y.
   */
  if (verticalDivision && visualBand) {
    const localPos = heroVerticalCellToPosition(portraitCell);
    return (
      <div
        className={`pointer-events-none absolute inset-y-0 left-1/2 z-[25] hidden w-full -translate-x-1/2 overflow-visible xl:block ${contentWidthClass}`}
        style={fadeOpacity >= 1 ? undefined : { opacity: fadeOpacity, willChange: 'opacity' }}
        data-hero-portrait-layer="vertical"
        data-hero-portrait-band={visualBand}
      >
        <div
          className={`pointer-events-none absolute overflow-visible ${portfolioHeroLayerInset(contentGutter)}`}
          style={heroVerticalVisualBandStyle(visualBand)}
        >
          <div className="absolute inset-0 overflow-visible">
            <div
              className="pointer-events-auto absolute flex flex-col items-center"
              style={{
                left: `${localPos.x}%`,
                top: `${localPos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              data-hero-portrait
              data-hero-portrait-cell={portraitCell}
            >
              {portraitCard}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-[25] overflow-visible"
      style={{
        ...(verticalDivision ? {} : heroGeomLayerPositionStyle(motifLayout)),
        ...(fadeOpacity >= 1 ? {} : { opacity: fadeOpacity, willChange: 'opacity' }),
      }}
    >
      <div className="absolute inset-0 pb-8 pt-20 sm:pb-10 sm:pt-24 lg:pb-0 lg:pt-0">
        <div
          className="absolute flex flex-col items-center"
          style={portraitPositionStyle(portraitPosition)}
          data-hero-portrait
        >
          {portraitCard}
        </div>
      </div>
    </HeroEditorialLayerFrame>
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
  contentWidthClass = 'max-w-[90rem]',
  verticalDivision = false,
  layoutDivision,
}: EditorialMetaLayerProps & {
  motifLayout?: PortfolioHeroMotifLayout;
  meta: PortfolioHeroPresentationSettings;
  contentGutter?: PortfolioContentGutter;
  contentWidthClass?: string;
  verticalDivision?: boolean;
  /** Active screen division — used to pin layers to the visual half. */
  layoutDivision?: string;
}) {
  const fadeStyle = fadeOpacity >= 1 ? undefined : { opacity: fadeOpacity, willChange: 'opacity' as const };
  const visualBand = verticalDivision
    ? resolveHeroVerticalVisualBand(layoutDivision ?? '')
    : null;
  const metaCell = resolveMetaVerticalCell(meta);
  const metaItems = buildHeroMetaItems(yearsOfExperience, workCount, locationLabel, meta);

  const metaForPlacement: PortfolioHeroPresentationSettings = {
    ...meta,
    metaPosition: resolveMetaPositionForDivision(meta, verticalDivision),
    metaPlacementMode: verticalDivision ? 'free' : meta.metaPlacementMode,
  };

  /**
   * Vertical screen division — same proven pattern as the portrait layer:
   * 1) Pin a frame to the visual half (top/bottom → definite height tied to the section)
   * 2) Place the row with left% + top% *inside that frame*
   *
   * Do NOT use vh (preview/embed viewport ≠ section) and do NOT put inset-y-0 on the
   * band frame (it fights top/bottom and collapses usable height so only X moves).
   */
  if (verticalDivision && visualBand) {
    const localPos = heroVerticalCellToPosition(metaCell);
    return (
      <div
        className={`pointer-events-none absolute inset-y-0 left-1/2 z-[26] hidden w-full -translate-x-1/2 overflow-visible xl:block ${contentWidthClass}`}
        style={fadeStyle}
        data-hero-stats-layer="vertical"
        data-hero-stats-band={visualBand}
      >
        <div
          className={`pointer-events-none absolute overflow-visible ${portfolioHeroLayerInset(contentGutter)}`}
          style={heroVerticalVisualBandStyle(visualBand)}
        >
          <div className="absolute inset-0 overflow-visible">
            <div
              className={`pointer-events-auto absolute flex ${
                resolveMetaCardsOrientation(meta) === 'vertical'
                  ? 'flex-col items-start'
                  : 'items-center'
              } ${metaRowGapClass(meta.metaSpread)}`}
              style={{
                left: `${localPos.x}%`,
                top: `${localPos.y}%`,
                transform: 'translate(-50%, -50%)',
                gap: `${resolveMetaCardGapPx(meta)}px`,
              }}
              data-hero-stats
              data-hero-stats-cell={metaCell}
            >
              {metaItems.map((item) => (
                <HeroProfileMetaItem key={item.id} item={item} meta={meta} />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <HeroEditorialLayerFrame
      gutter={contentGutter}
      contentWidthClass={contentWidthClass}
      className="z-[26] overflow-visible"
      style={fadeStyle}
    >
      <HeroProfileMeta
        editorial
        elevated
        straddle
        motifLayout={motifLayout}
        meta={metaForPlacement}
        yearsOfExperience={yearsOfExperience}
        workCount={workCount}
        locationLabel={locationLabel}
      />
    </HeroEditorialLayerFrame>
  );
}

export function HeroPortrait({
  fullName,
  avatarUrl,
  specialite,
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
  specialite?: string | null;
  className?: string;
  wrapperClass?: string;
  rounded?: boolean;
  caption?: string | null;
  captionOnDark?: boolean;
  /** Editorial: hide in-flow image on lg (elevated layer renders the visible photo). */
  preserveLayoutOnDesktop?: boolean;
  profile?: PortfolioHeroPresentationSettings;
  children?: React.ReactNode;
}) {
  const radiusClass = profile ? portraitRadiusClass(profile.portraitRadius) : rounded ? 'rounded-[2rem]' : '';
  const shell = radiusClass ? `overflow-hidden ${radiusClass}` : '';
  const resolvedWrapperClass = profile ? portraitWrapperSizeClass(profile.portraitSize) : wrapperClass;
  const showCaption = profile
    ? profile.showCreatorName &&
      !profile.creatorNameInFrame &&
      profile.portraitCaptionLayout !== 'mat-footer'
    : Boolean(caption?.trim());
  const captionText = caption?.trim() || fullName;
  const elementStyles = profile ? normalizeHeroElementStyles(profile.elementStyles, profile) : null;
  const captionClass = elementStyles
    ? elementTextStyleClass(elementStyles.creatorName, 'body')
    : `text-base font-bold tracking-tight sm:text-lg ${
        captionOnDark
          ? 'text-neutral-950 lg:relative lg:z-30 lg:text-white dark:text-white'
          : 'text-neutral-950 dark:text-white'
      }`;
  const captionStyle = elementStyles
    ? {
        ...elementTextInlineStyle(elementStyles.creatorName),
        ...(profile ? creatorNameFontStyle(profile.creatorNameFont) : {}),
      }
    : undefined;

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const media = avatarUrl ? (
    <>
      <Image
        src={avatarUrl}
        alt={fullName}
        width={360}
        height={450}
        className={`${className}${preserveLayoutOnDesktop ? ' xl:hidden' : ''}`}
        style={profile ? portraitImageMediaStyle(profile) : undefined}
        priority
      />
      {preserveLayoutOnDesktop ? (
        <div className={`hidden xl:block ${className}`} aria-hidden />
      ) : null}
    </>
  ) : (
    <>
      <div
        className={`flex items-center justify-center bg-neutral-200 text-4xl font-bold text-neutral-700 dark:bg-neutral-800 dark:text-white ${className}${preserveLayoutOnDesktop ? ' xl:hidden' : ''}`}
      >
        {initials}
      </div>
      {preserveLayoutOnDesktop ? (
        <div className={`hidden xl:block ${className}`} aria-hidden />
      ) : null}
    </>
  );

  const captionBands = profile
    ? buildPortraitCaptionBands(fullName, specialite, profile, captionClass, captionStyle)
    : null;

  const framedMedia = profile ? (
    <HeroPortraitEditorialFrame
      show={profile.showPortraitFrame}
      color={profile.portraitFrameColor}
      width={profile.portraitFrameWidth}
      borderOpacity={profile.portraitFrameBorderOpacity}
      backgroundColor={profile.portraitFrameBackgroundColor}
      backgroundOpacity={profile.portraitFrameBackgroundOpacity}
      paddingTop={profile.portraitFramePaddingTop}
      paddingBottom={profile.portraitFramePaddingBottom}
      paddingLeft={profile.portraitFramePaddingLeft}
      paddingRight={profile.portraitFramePaddingRight}
      radiusClass={radiusClass || 'rounded-[2rem]'}
    >
      <div className="flex w-full flex-col">
        <HeroPortraitCaptionBand
          edge="top"
          lines={captionBands?.top ?? []}
          profile={profile}
        />
        <div className={`relative overflow-hidden ${radiusClass || 'rounded-[2rem]'}`}>
          {media}
        </div>
        <HeroPortraitCaptionBand
          edge="bottom"
          lines={captionBands?.bottom ?? []}
          profile={profile}
        />
      </div>
    </HeroPortraitEditorialFrame>
  ) : (
    media
  );

  return (
    <figure className={resolvedWrapperClass}>
      <div className="relative">
        <div className={`relative ${shell}`}>
          {framedMedia}
          {children}
        </div>
      </div>
      {showCaption ? (
        <figcaption className={`mt-4 text-center ${captionClass}`} style={captionStyle}>
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
  iconSurfaceStyle,
}: {
  tools: string[];
  layout?: 'column' | 'row';
  onDark?: boolean;
  /** Background / border from Typography → Tools. */
  iconSurfaceStyle?: CSSProperties;
}) {
  const items = Array.from(new Set(tools.map((item) => item.trim()).filter(Boolean))).slice(0, 6);
  if (items.length === 0) return null;

  const chipClass = iconSurfaceStyle
    ? 'shadow-sm'
    : onDark
      ? 'border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900 lg:border-neutral-200 lg:bg-white lg:shadow-md'
      : 'border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900';

  return (
    <div className={`flex ${layout === 'row' ? 'flex-row flex-wrap justify-start gap-2.5' : 'flex-col gap-3'}`}>
      {items.map((tool) => (
        <div
          key={tool}
          title={tool}
          aria-label={tool}
          className={`flex h-12 w-12 items-center justify-center overflow-hidden ${chipClass} ${
            iconSurfaceStyle ? '' : 'rounded-full'
          }`}
          style={iconSurfaceStyle}
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

/** locationLabel is stored as "city, country". */
function formatLocationDisplay(
  label: string,
  content: PortfolioHeroMetaSettings['metaLocationContent']
): string {
  return formatMetaLocationDisplay(label, content);
}

function HeroProfileMetaItem({
  item,
  meta,
  showStraddleHighlight = false,
}: {
  item: { id: string; value: string; label: string; icon: 'years' | 'projects' | 'location' };
  meta: PortfolioHeroPresentationSettings;
  showStraddleHighlight?: boolean;
}) {
  const isLocation = item.icon === 'location';
  const locationShape = isLocation ? resolveMetaCardFrameShape(meta, 'location') : null;
  const locationCompact = isLocation && locationShape === 'circle';
  const elementStyles = normalizeHeroElementStyles(meta.elementStyles, meta);
  const cardId = item.icon as PortfolioHeroMetaCardId;
  const cardAccent = resolveMetaCardAccentColor(meta, cardId);
  const valueSizeClass = metaValueSizeClass(
    meta.metaValueSize,
    isLocation,
    /* keep location type scale even in a round chip */
    false
  );
  const valueFormatClass = elementTextStyleClass(elementStyles.metaValue, 'body')
    .split(' ')
    .filter((token) => !token.startsWith('text-') && !token.startsWith('sm:text-'))
    .join(' ');
  const valueClass = `${valueSizeClass} ${valueFormatClass}`.trim();
  const labelClass = elementTextStyleClass(elementStyles.metaLabel, 'label');
  const valueStyle = {
    ...elementTextInlineStyle(elementStyles.metaValue),
    ...(meta.metaValueUsesCardAccent !== false ? { color: cardAccent } : null),
  };
  const labelStyle = elementTextInlineStyle(elementStyles.metaLabel);

  const icon = (
    <HeroMetaIcon type={item.icon} accentColor={cardAccent} visible={meta.showMetaIcons} />
  );

  const locationText = isLocation
    ? formatLocationDisplay(item.value, meta.metaLocationContent)
    : item.value;

  const valueNode = isLocation ? (
    <p
      className={`relative font-bold ${locationCompact ? 'max-w-[4.5rem] break-words px-0.5 sm:max-w-[5.25rem]' : 'max-w-[8.5rem] sm:max-w-[9.5rem]'} ${valueClass}`}
      style={valueStyle}
      title={item.value}
    >
      {locationText}
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
      className={metaCardShellClass(meta, item.icon)}
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

/**
 * Keep the horizontal stat row on ONE line: when the configured gap would
 * overflow the container, shrink the gap to what actually fits (never wrap).
 * Skips hidden (0-width) containers so they don't clamp the gap to 0/min.
 */
function useFittedMetaRowGap(
  configuredGapPx: number,
  itemCount: number,
  enabled: boolean
): { ref: RefObject<HTMLDivElement>; gapPx: number } {
  const ref = useRef<HTMLDivElement>(null);
  const [gapPx, setGapPx] = useState(configuredGapPx);

  useEffect(() => {
    if (!enabled || itemCount < 2) {
      setGapPx(configuredGapPx);
      return;
    }
    const el = ref.current;
    if (!el) {
      setGapPx(configuredGapPx);
      return;
    }

    /** Prefer the grid/half cell (fixed width), never the stack (grows with content). */
    const resolveContainer = () =>
      el.closest('[data-hero-stats-cell]') ??
      el.closest('[data-hero-visual-half]') ??
      el.parentElement;

    const fit = () => {
      const container = resolveContainer();
      if (!container) {
        setGapPx(configuredGapPx);
        return;
      }
      const containerWidth = container.clientWidth;
      // Hidden / not laid out yet — keep the configured gap, don't clamp.
      if (containerWidth <= 0) return;

      const children = Array.from(el.children) as HTMLElement[];
      if (children.length < 2) {
        setGapPx(configuredGapPx);
        return;
      }
      const cardsWidth = children.reduce((sum, child) => sum + child.getBoundingClientRect().width, 0);
      const available = containerWidth - cardsWidth;
      const maxFit = Math.floor(available / (children.length - 1));
      const next = Math.max(0, Math.min(configuredGapPx, maxFit));
      setGapPx((prev) => (prev === next ? prev : next));
    };

    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(el);
    const container = resolveContainer();
    if (container) observer.observe(container);
    return () => observer.disconnect();
  }, [configuredGapPx, itemCount, enabled]);

  return { ref, gapPx: enabled ? gapPx : configuredGapPx };
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
  meta: PortfolioHeroPresentationSettings;
}) {
  const items = buildHeroMetaItems(yearsOfExperience, workCount, locationLabel, meta);
  const verticalCards = resolveMetaCardsOrientation(meta) === 'vertical';
  const fillWidth = !verticalCards && resolveMetaCardsFillWidth(meta);
  const straddleMode =
    straddle &&
    elevated &&
    editorial &&
    (meta.metaPlacementMode === 'straddle-bottom' ||
      meta.metaPlacementMode === 'on-motif' ||
      meta.metaPlacementMode === 'free');
  const fitted = useFittedMetaRowGap(
    resolveMetaCardGapPx(meta),
    items.length,
    !verticalCards && !spread && !straddleMode && !fillWidth
  );

  if (items.length === 0) return null;

  if (straddle && elevated && editorial && meta.metaPlacementMode === 'straddle-bottom') {
    const anchors = resolveMetaCardAnchors(items.length, meta.metaPosition.x, meta.metaSpread);
    const rowTop = `${meta.metaPosition.y}%`;

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

  // on-motif + free: one even row (keeps all circles together on the motif panel).
  if (
    straddle &&
    elevated &&
    editorial &&
    (meta.metaPlacementMode === 'on-motif' || meta.metaPlacementMode === 'free')
  ) {
    return (
      <div
        className={`pointer-events-auto absolute flex ${
          resolveMetaCardsOrientation(meta) === 'vertical'
            ? 'flex-col items-start'
            : 'items-center'
        } ${metaRowGapClass(meta.metaSpread)} ${className}`.trim()}
        style={{
          ...metaRowPositionStyle(meta.metaPosition),
          gap: `${resolveMetaCardGapPx(meta)}px`,
        }}
      >
        {items.map((item) => (
          <HeroProfileMetaItem key={item.id} item={item} meta={meta} />
        ))}
      </div>
    );
  }

  const autoSpread = spread || fillWidth;

  return (
    <div
      ref={fitted.ref}
      className={`flex min-w-0 max-w-full ${
        verticalCards
          ? 'flex-col items-center xl:items-start'
          : `flex-nowrap items-center ${autoSpread ? 'w-full justify-between' : ''}`
      } ${className}`.trim()}
      style={
        autoSpread && !verticalCards
          ? undefined
          : { gap: `${verticalCards ? resolveMetaCardGapPx(meta) : fitted.gapPx}px` }
      }
      data-hero-meta-row={verticalCards ? 'vertical' : fillWidth ? 'fill' : 'horizontal'}
      data-hero-meta-gap={verticalCards ? resolveMetaCardGapPx(meta) : fillWidth ? 'auto' : fitted.gapPx}
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
    <nav className="hidden flex-col gap-3 xl:flex" aria-label="Accès rapide">
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
