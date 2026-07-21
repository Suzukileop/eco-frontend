'use client';

import { useEffect, useState, type FocusEvent } from 'react';
import {
  SocialPlatformIcon,
  normalizeSocialPlatformKey,
  type SocialPlatformKey,
} from '@/components/marketplace/creator-profile-social-icons';
import { PortfolioNavContactCtaGlyph } from '@/components/portfolio/portfolio-nav-contact-cta-icons';
import {
  formatNavLabel,
  portfolioNavBarHostsInlineExtras,
  portfolioNavExtrasAllowedForBarWidth,
  portfolioNavFreeSpaceClusterClass,
  portfolioNavFreeSpaceSides,
  portfolioNavIsVertical,
  portfolioNavResolveExtrasPlacement,
  resolvePortfolioNavMobileChrome,
} from '@/components/portfolio/portfolio-nav-settings';
import type {
  PortfolioNavContactButtonDisplay,
  PortfolioNavContactCtaIcon,
  PortfolioNavLinkIconSource,
  PortfolioNavSettings,
} from '@/components/portfolio/portfolio-settings-types';

export type PortfolioNavChromeLink = {
  id: string;
  href: string;
  label: string;
  source: PortfolioNavLinkIconSource;
};

function useMinWidth(px: number) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${px}px)`);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, [px]);
  return matches;
}

function platformToSource(platform: string): PortfolioNavLinkIconSource | null {
  const key = normalizeSocialPlatformKey(platform);
  if (key === 'youtube') return 'youtube';
  if (key === 'twitter') return 'twitter';
  if (key === 'linkedin') return 'linkedin';
  if (key === 'github') return 'github';
  if (key === 'instagram') return 'instagram';
  if (key === 'tiktok') return 'tiktok';
  if (key === 'other') return 'other';
  return null;
}

export function buildPortfolioNavChromeLinks({
  sources,
  email,
  socialLinks,
}: {
  sources: PortfolioNavLinkIconSource[];
  email?: string | null;
  socialLinks: Array<{ id: string; platform: string; url: string; label: string }>;
}): PortfolioNavChromeLink[] {
  const enabled = new Set(sources);
  const links: PortfolioNavChromeLink[] = [];

  if (enabled.has('mail')) {
    const trimmed = email?.trim();
    if (trimmed) {
      links.push({
        id: 'mail',
        href: `mailto:${trimmed}`,
        label: 'Email',
        source: 'mail',
      });
    }
  }

  for (const social of socialLinks) {
    const source = platformToSource(social.platform);
    if (!source || !enabled.has(source)) continue;
    const href = social.url.trim();
    if (!href) continue;
    links.push({
      id: social.id || source,
      href,
      label: social.label || source,
      source,
    });
  }

  return links;
}

function MailGlyph({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 8l7.89 5.26a2 2 0 0 0 2.22 0L21 8M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
      />
    </svg>
  );
}

function resolveLinkIconColors(settings: PortfolioNavSettings) {
  return {
    background: settings.linkIconBackgroundColor ?? '#ffffff',
    icon: settings.linkIconColor ?? '#404040',
    border: settings.linkIconBorderColor ?? '#e5e5e5',
  };
}

function resolveContactButtonChrome(settings: PortfolioNavSettings) {
  return {
    background: settings.contactButtonBackgroundColor ?? '#171717',
    color: settings.contactButtonColor ?? '#ffffff',
    border: settings.contactButtonBorderColor ?? '#171717',
    borderEnabled: settings.contactButtonBorderEnabled ?? false,
    glass: settings.contactButtonGlassEffect ?? false,
    shadow: settings.contactButtonShadowEnabled ?? true,
  };
}

/** Configurable Contact glyph — phone variants. */
function ContactGlyph({
  className,
  icon = 'phone',
}: {
  className?: string;
  icon?: PortfolioNavContactCtaIcon;
}) {
  return <PortfolioNavContactCtaGlyph variant={icon} className={className} />;
}

function LinkIconButton({
  link,
  compact,
  colors,
}: {
  link: PortfolioNavChromeLink;
  compact?: boolean;
  colors: { background: string; icon: string; border: string };
}) {
  const size = compact ? 'h-9 w-9' : 'h-10 w-10';
  const shellStyle = {
    backgroundColor: colors.background,
    borderColor: colors.border,
    color: colors.icon,
  };

  if (link.source === 'mail') {
    return (
      <a
        href={link.href}
        aria-label={link.label}
        title={link.label}
        style={shellStyle}
        className={`inline-flex ${size} items-center justify-center rounded-full border shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:opacity-90`}
      >
        <MailGlyph className="h-4 w-4" />
      </a>
    );
  }

  const platform = normalizeSocialPlatformKey(link.source) as SocialPlatformKey;
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={link.label}
      title={link.label}
      style={shellStyle}
      className={`inline-flex ${size} items-center justify-center rounded-full border shadow-[0_8px_24px_rgba(0,0,0,0.08)] backdrop-blur-md transition hover:opacity-90`}
    >
      <SocialPlatformIcon platform={platform} className="h-3.5 w-3.5" />
    </a>
  );
}

function ContactFreeSpaceButton({
  label,
  labelCase,
  href,
  onNavigate,
  display = 'icon',
  icon = 'phone',
  chrome,
  compact,
}: {
  label: string;
  labelCase: PortfolioNavSettings['labelCase'];
  href: string;
  onNavigate?: () => void;
  display?: PortfolioNavContactButtonDisplay;
  icon?: PortfolioNavContactCtaIcon;
  chrome: ReturnType<typeof resolveContactButtonChrome>;
  compact?: boolean;
}) {
  const shadowClass = chrome.shadow ? 'shadow-[0_8px_24px_rgba(0,0,0,0.12)]' : 'shadow-none';
  const glassClass = chrome.glass ? 'backdrop-blur-md' : '';
  const shellStyle = {
    backgroundColor: chrome.background,
    color: chrome.color,
    borderColor: chrome.borderEnabled ? chrome.border : 'transparent',
    borderWidth: chrome.borderEnabled ? 1 : 0,
    borderStyle: 'solid' as const,
  };

  if (display !== 'button') {
    const size = compact ? 'h-9 w-9' : 'h-10 w-10';
    const iconClassName = `inline-flex ${size} items-center justify-center rounded-full transition hover:opacity-90 ${shadowClass} ${glassClass}`;
    const glyph = <ContactGlyph icon={icon} className="h-4 w-4" />;
    if (onNavigate) {
      return (
        <button
          type="button"
          onClick={onNavigate}
          aria-label={label}
          title={label}
          className={iconClassName}
          style={shellStyle}
        >
          {glyph}
        </button>
      );
    }
    return (
      <a href={href} aria-label={label} title={label} className={iconClassName} style={shellStyle}>
        {glyph}
      </a>
    );
  }

  const className = `inline-flex shrink-0 items-center justify-center gap-2 rounded-full text-xs font-bold uppercase tracking-[0.14em] transition hover:opacity-90 ${shadowClass} ${glassClass} ${
    compact ? 'min-h-9 px-3.5 py-1.5 text-[0.65rem]' : 'min-h-10 px-4 py-2'
  }`;
  const content = (
    <>
      <ContactGlyph icon={icon} className="h-3.5 w-3.5" />
      <span>{formatNavLabel(label, labelCase)}</span>
    </>
  );

  if (onNavigate) {
    return (
      <button type="button" onClick={onNavigate} aria-label={label} className={className} style={shellStyle}>
        {content}
      </button>
    );
  }

  return (
    <a href={href} aria-label={label} className={className} style={shellStyle}>
      {content}
    </a>
  );
}

export type PortfolioNavExtrasModel = {
  showContact: boolean;
  iconLinks: PortfolioNavChromeLink[];
  contactLabel: string;
  /** Side for link icons (null when none). */
  iconsSide: 'left' | 'right' | null;
  /** Side for Contact (may differ from icons when detached). */
  contactSide: 'left' | 'right' | null;
  /** @deprecated Use iconsSide / contactSide — kept for callers that only need “any extras”. */
  extrasSide: 'left' | 'right' | null;
  inlineInBar: boolean;
  verticalExtras: boolean;
};

/** Resolve which extras to show for the current viewport + settings. */
export function usePortfolioNavExtrasModel(
  settings: PortfolioNavSettings,
  links: PortfolioNavChromeLink[]
): PortfolioNavExtrasModel {
  const isMdUp = useMinWidth(768);
  const isLgUp = useMinWidth(1024);
  const isXlUp = useMinWidth(1280);
  const mobileChrome = resolvePortfolioNavMobileChrome(settings, isLgUp, isXlUp);
  const freeSides = portfolioNavFreeSpaceSides(mobileChrome.placement);

  const contactConfigured = settings.contactButtonEnabled ?? false;
  const iconsConfigured = Boolean(settings.linkIconsEnabled && links.length > 0);
  const showContact = Boolean(contactConfigured && (isLgUp || (isMdUp && !isLgUp)));
  const showIcons = Boolean(
    iconsConfigured && (isLgUp || (isMdUp && !isLgUp && !contactConfigured))
  );
  const fullWidthOnly = portfolioNavExtrasAllowedForBarWidth(mobileChrome.barWidth);
  const canShow = isMdUp && fullWidthOnly;
  const hasIcons = canShow && showIcons;
  const hasContact = canShow && showContact;
  const placement = portfolioNavResolveExtrasPlacement({
    freeSides,
    extrasPreference: settings.extrasSide ?? 'auto',
    contactPreference: settings.contactButtonSide ?? 'auto',
    hasIcons,
    hasContact,
    contactDetached: settings.contactButtonDetached ?? false,
  });

  return {
    showContact: hasContact,
    iconLinks: hasIcons ? links : [],
    contactLabel: (settings.contactButtonLabel ?? 'Contact').trim() || 'Contact',
    iconsSide: placement.iconsSide,
    contactSide: placement.contactSide,
    extrasSide: placement.iconsSide ?? placement.contactSide,
    inlineInBar:
      canShow && portfolioNavBarHostsInlineExtras(mobileChrome.barWidth, mobileChrome.placement),
    verticalExtras: portfolioNavIsVertical(mobileChrome.placement),
  };
}

/** Shared Contact + link icons cluster (optionally icons-only or contact-only). */
export function PortfolioNavExtrasCluster({
  settings,
  model,
  contactHref = '#contact',
  onContactNavigate,
  compact,
  className = '',
  includeIcons = true,
  includeContact = true,
}: {
  settings: PortfolioNavSettings;
  model: PortfolioNavExtrasModel;
  monochrome?: boolean;
  contactHref?: string;
  onContactNavigate?: () => void;
  /** @deprecated Display comes from settings.contactButtonDisplay. */
  iconOnlyContact?: boolean;
  compact?: boolean;
  className?: string;
  includeIcons?: boolean;
  includeContact?: boolean;
}) {
  const icons = includeIcons ? model.iconLinks : [];
  const showContact = includeContact && model.showContact;
  if (!showContact && icons.length === 0) return null;
  const colors = resolveLinkIconColors(settings);
  const contactChrome = resolveContactButtonChrome(settings);
  /** Side rails (left/right nav) only have a narrow edge band — labeled pills clip off-screen. */
  const contactDisplay: PortfolioNavContactButtonDisplay = model.verticalExtras
    ? 'icon'
    : ((settings.contactButtonDisplay ?? 'icon') as PortfolioNavContactButtonDisplay);
  const contactIcon = (settings.contactButtonIcon ?? 'phone') as PortfolioNavContactCtaIcon;

  return (
    <div
      className={`flex items-center gap-2 ${
        model.verticalExtras ? 'flex-col' : 'flex-row'
      } ${className}`}
    >
      {icons.map((link) => (
        <LinkIconButton key={link.id} link={link} compact={compact} colors={colors} />
      ))}
      {showContact ? (
        <ContactFreeSpaceButton
          label={model.contactLabel}
          labelCase={settings.labelCase}
          href={contactHref}
          onNavigate={onContactNavigate}
          display={contactDisplay}
          icon={contactIcon}
          chrome={contactChrome}
          compact={compact}
        />
      ) : null}
    </div>
  );
}

/**
 * Floating extras when the bar is hug/medium or vertical — hidden while the menu
 * handle is showing (collapsed), so the chrome does not look detached.
 * Hover/focus handlers keep reveal-on-hover open while the pointer crosses the gap.
 */
export function PortfolioNavFreeSpaceLinks({
  settings,
  links,
  monochrome,
  opacity = 1,
  contactHref = '#contact',
  onContactNavigate,
  navRevealed = true,
  onMouseEnter,
  onMouseLeave,
  onFocusCapture,
  onBlurCapture,
}: {
  settings: PortfolioNavSettings;
  links: PortfolioNavChromeLink[];
  monochrome?: boolean;
  opacity?: number;
  contactHref?: string;
  onContactNavigate?: () => void;
  /** False while the reveal handle is showing (menu collapsed). */
  navRevealed?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocusCapture?: () => void;
  onBlurCapture?: (event: FocusEvent<HTMLElement>) => void;
}) {
  const isLgUp = useMinWidth(1024);
  const isXlUp = useMinWidth(1280);
  const mobileChrome = resolvePortfolioNavMobileChrome(settings, isLgUp, isXlUp);
  const model = usePortfolioNavExtrasModel(settings, links);

  if (!navRevealed) return null;
  if (!settings.enabled) return null;
  if (model.inlineInBar) return null;
  if (!model.showContact && model.iconLinks.length === 0) return null;

  const sides = Array.from(
    new Set(
      [model.iconsSide, model.contactSide].filter(Boolean) as Array<'left' | 'right'>
    )
  );
  if (sides.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[95]"
      aria-label="Portfolio quick links"
      style={{ opacity }}
    >
      {sides.map((side) => (
        <div
          key={side}
          className={`pointer-events-auto absolute -m-4 p-4 ${portfolioNavFreeSpaceClusterClass(
            mobileChrome.placement,
            side,
            settings.edgeOffset,
            settings.edgeOffsetCloseOnMobile ?? true
          )}`}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onFocusCapture={onFocusCapture}
          onBlurCapture={onBlurCapture}
        >
          <PortfolioNavExtrasCluster
            settings={settings}
            model={model}
            monochrome={monochrome}
            contactHref={contactHref}
            onContactNavigate={onContactNavigate}
            includeIcons={model.iconsSide === side}
            includeContact={model.contactSide === side}
          />
        </div>
      ))}
    </div>
  );
}

/** Inline extras slot for wide/full horizontal bars (fills the empty side of the shell). */
export function PortfolioNavInlineExtras({
  settings,
  links,
  monochrome,
  contactHref = '#contact',
  onContactNavigate,
  side,
}: {
  settings: PortfolioNavSettings;
  links: PortfolioNavChromeLink[];
  monochrome?: boolean;
  contactHref?: string;
  onContactNavigate?: () => void;
  side: 'left' | 'right';
}) {
  const model = usePortfolioNavExtrasModel(settings, links);
  if (!model.inlineInBar) return null;
  const includeIcons = model.iconsSide === side;
  const includeContact = model.contactSide === side;
  if (!includeIcons && !includeContact) return null;

  return (
    <PortfolioNavExtrasCluster
      settings={settings}
      model={model}
      monochrome={monochrome}
      contactHref={contactHref}
      onContactNavigate={onContactNavigate}
      includeIcons={includeIcons}
      includeContact={includeContact}
      compact
      className="shrink-0"
    />
  );
}
