'use client';

import { Fragment, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { CreatorProfileViewTracker } from '@/components/marketplace/CreatorProfileViewTracker';
import { formatAvailabilityHours, formatAvailabilityHoursLines, parseAvailabilityHours } from '@/lib/availabilityHours';
import {
  SocialPlatformIcon,
  socialPlatformBrandClass,
} from '@/components/marketplace/creator-profile-social-icons';
import {
  portfolioUsesMonochromeChrome,
  portfolioMonochromeSocialBrandClass,
} from '@/components/portfolio/portfolio-themes';
import { SOCIAL_PLATFORMS } from '@/types/ecosystem';
import type { MarketplaceContentItem, MarketplaceCreatorPublicProfile } from '@/types/marketplace';
import { PortfolioHeroSection } from '@/components/portfolio/PortfolioHeroSection';
import { PortfolioSectionShell } from '@/components/portfolio/PortfolioSectionShell';
import {
  PortfolioSplitScreenFrame,
} from '@/components/portfolio/portfolio-split-screen';
import { PortfolioSettingsButton, PortfolioSettingsModal } from '@/components/portfolio/PortfolioSettingsModal';
import { PortfolioThemeRoot } from '@/components/portfolio/PortfolioThemeRoot';
import { usePortfolioSettings } from '@/components/portfolio/use-portfolio-settings';
import {
  EditorialContactSection,
  EditorialExperienceList,
  EditorialExperienceYears,
  EditorialFaqList,
  EditorialPortfolioFooter,
  EditorialSectionStickyHeader,
  EditorialServicesSkillsSection,
  EditorialServicesCarousel,
  EditorialSkillShowcase,
  EditorialSideInfoPanel,
  EditorialStatGrid,
  EditorialWhyMeHeading,
  EditorialWhyMeList,
  EditorialWorkGallery,
  MarketplaceProfileLink,
  portfolioEditorialShellClass,
  PortfolioFloatingNav,
  PortfolioPerPageNav,
  SIDE_INFO_ICONS,
} from '@/components/portfolio/portfolio-section-primitives';
import { PortfolioMotionItem } from '@/components/portfolio/PortfolioMotionItem';

import { pickHeroPresentationSettings, resolveHeroTools } from '@/components/portfolio/portfolio-hero-settings';
import {
  pickWorkPresentationSettings,
  resolveWorkSectionSubtitle,
  resolveWorkSectionTitle,
  workHeaderFontClass,
  workHeaderFontStyle,
  workSubtitleColorStyle,
  workTitleColorStyle,
} from '@/components/portfolio/portfolio-work-settings';
import {
  aboutHeaderFontClass,
  aboutHeaderFontStyle,
  aboutMainGridClass,
  aboutSubtitleColorStyle,
  aboutTitleColorStyle,
  filterAboutStats,
  isAboutSideInfoItemVisible,
  pickAboutPresentationSettings,
  resolveAboutSectionSubtitle,
  resolveAboutSectionTitle,
} from '@/components/portfolio/portfolio-about-settings';
import {
  pickServicesPresentationSettings,
  resolveServicesSectionSubtitle,
  resolveServicesSectionTitle,
  servicesHeaderFontClass,
  servicesHeaderFontStyle,
  servicesSubtitleColorStyle,
  servicesTitleColorStyle,
} from '@/components/portfolio/portfolio-services-settings';
import {
  resolveDistinctBlockSectionSubtitle,
  resolveDistinctBlockSectionTitle,
  resolvePortfolioContentSectionOrder,
  resolveServicesBlockPresentation,
  servicesUsesDistinctSections,
} from '@/components/portfolio/portfolio-services-block-settings';
import {
  pickFaqPresentationSettings,
  resolveFaqSectionSubtitle,
  resolveFaqSectionTitle,
  faqHeaderFontClass,
  faqHeaderFontStyle,
  faqListPlacementClass,
  faqListMaxWidthClass,
  faqSubtitleColorStyle,
  faqTitleColorStyle,
} from '@/components/portfolio/portfolio-faq-settings';
import {
  pickExperiencePresentationSettings,
  resolveExperienceSectionSubtitle,
  resolveExperienceSectionTitle,
  experienceHeaderFontClass,
  experienceHeaderFontStyle,
  experienceSubtitleColorStyle,
  experienceTitleColorStyle,
} from '@/components/portfolio/portfolio-experience-settings';
import {
  pickContactPresentationSettings,
  resolveContactSectionSubtitle,
  resolveContactSectionTitle,
  contactHeaderFontClass,
  contactHeaderFontStyle,
  contactSubtitleColorStyle,
  contactTitleColorStyle,
} from '@/components/portfolio/portfolio-contact-settings';
import { pickFooterPresentationSettings, portfolioFooterNavClearanceClass } from '@/components/portfolio/portfolio-footer-settings';
import {
  applyHeroPaletteToAbout,
  applyHeroPaletteToContact,
  applyHeroPaletteToExperience,
  applyHeroPaletteToFaq,
  applyHeroPaletteToFooter,
  applyHeroPaletteToServices,
  applyHeroPaletteToWork,
  resolveHeroPaletteFromSettings,
} from '@/components/portfolio/portfolio-section-palette';
import {
  resolveNavItemLabel,
  type PortfolioNavSectionKey,
  type PortfolioNavIconVariant,
} from '@/components/portfolio/portfolio-nav-items';
import {
  globalBackgroundPatternStyle,
  globalBackgroundStyle,
  globalContentWidthClass,
  globalFixedBackgroundImageStyle,
  globalSectionTitleTopClass,
  globalSplitContentTopClass,
  hasGlobalPageBackground,
  hasGlobalSolidBackground,
  resolveGlobalSectionSubtitleTypography,
  resolveGlobalSectionTitleChrome,
  resolveGlobalSectionTitleTypography,
  resolveGlobalSplitTitleFrame,
  resolveSectionHeaderAlign,
  resolveSectionTitleOrientation,
} from '@/components/portfolio/portfolio-global-settings';
import {
  hasOpaqueSectionBackground,
  sectionBackgroundBlockColor,
  type PortfolioSectionBackgroundSettings,
} from '@/components/portfolio/portfolio-section-background-settings';
import {
  buildPortfolioNavChromeLinks,
} from '@/components/portfolio/portfolio-nav-extras';
import { DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES } from '@/components/portfolio/portfolio-settings-types';
import { motionProfileEnablesHeroGeomFade } from '@/components/portfolio/portfolio-motion-settings';

type PublicCreatorPortfolioPageProps = {
  creatorId: string;
  profile: MarketplaceCreatorPublicProfile;
  isAuthenticated: boolean;
  locationLabel: string | null;
  portfolioPosts?: MarketplaceContentItem[];
};

function socialLabel(platform: string): string {
  return SOCIAL_PLATFORMS.find((p) => p.value === platform)?.label ?? platform;
}

function formatMemberSince(value: string | null | undefined): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
}

function splitDisplayName(name: string): { lead: string; accent: string } {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) return { lead: name.trim(), accent: '' };
  const accent = parts.pop() ?? '';
  return { lead: parts.join(' '), accent };
}

function resolvePrimaryLink(profile: MarketplaceCreatorPublicProfile): { label: string; url: string } | null {
  const first = profile.profileLinks?.[0];
  if (first?.url?.trim()) {
    return { label: first.label?.trim() || 'Contact me', url: first.url.trim() };
  }
  if (profile.ctaUrl?.trim()) {
    return { label: profile.ctaLabel?.trim() || 'Contact me', url: profile.ctaUrl.trim() };
  }
  if (profile.contactEmail?.trim()) {
    return { label: 'Start a project', url: `mailto:${profile.contactEmail.trim()}` };
  }
  return null;
}

function resolveDisplayLinks(profile: MarketplaceCreatorPublicProfile) {
  if (profile.profileLinks && profile.profileLinks.length > 0) {
    return profile.profileLinks.filter((link) => link.url.trim());
  }
  const legacy: Array<{ id: string; label: string; url: string; type: string; platform?: string | null }> = [];
  if (profile.websiteUrl?.trim()) {
    legacy.push({ id: 'website', label: 'Website', url: profile.websiteUrl.trim(), type: 'WEBSITE' });
  }
  if (profile.ctaUrl?.trim()) {
    legacy.push({
      id: 'cta',
      label: profile.ctaLabel?.trim() || 'Contact me',
      url: profile.ctaUrl.trim(),
      type: 'CTA',
    });
  }
  if (profile.socialLinks) {
    for (const [platform, url] of Object.entries(profile.socialLinks)) {
      if (url.trim()) {
        legacy.push({ id: platform, label: socialLabel(platform), url, type: 'SOCIAL', platform });
      }
    }
  }
  return legacy;
}

function normalizeContactUrl(url: string): string {
  return url.trim().toLowerCase().replace(/\/$/, '');
}

function dedupeContactLinks(links: ReturnType<typeof resolveDisplayLinks>) {
  const seen = new Set<string>();
  return links.filter((link) => {
    const key = normalizeContactUrl(link.url);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildHeroDescription(
  profile: MarketplaceCreatorPublicProfile,
  locationLabel: string | null
): string {
  if (profile.bio?.trim()) {
    const text = profile.bio.trim().replace(/\s+/g, ' ');
    return text.length > 240 ? `${text.slice(0, 237)}…` : text;
  }

  const parts: string[] = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    parts.push(
      `${profile.yearsOfExperience} an${profile.yearsOfExperience > 1 ? 's' : ''} d'expérience`
    );
  }
  if (locationLabel) parts.push(`basé à ${locationLabel}`);
  return parts.join(' · ') || 'Découvrez mon travail et contactez-moi pour collaborer.';
}

function resolveHeroSocialLinks(
  profile: MarketplaceCreatorPublicProfile,
  displayLinks: ReturnType<typeof resolveDisplayLinks>
) {
  const fromProfileLinks = displayLinks
    .filter((link) => link.type === 'SOCIAL' && link.url.trim())
    .map((link) => ({
      id: link.id,
      platform: ('platform' in link ? link.platform : link.label) ?? link.label,
      url: link.url.trim(),
      label: link.label,
    }));

  if (fromProfileLinks.length > 0) return fromProfileLinks;

  if (!profile.socialLinks) return [];

  return Object.entries(profile.socialLinks)
    .filter(([, url]) => url?.trim())
    .map(([platform, url]) => ({
      id: platform,
      platform,
      url: url.trim(),
      label: socialLabel(platform),
    }));
}

function resolveExactContentCount(profile: MarketplaceCreatorPublicProfile): number | null {
  if (profile.contentCount != null && profile.contentCount > 0) {
    return profile.contentCount;
  }
  return null;
}

function buildHeroStats(
  profile: MarketplaceCreatorPublicProfile,
  languageCount: number
): Array<{ value: string; label: string }> {
  const stats: Array<{ value: string; label: string }> = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    stats.push({ value: `${profile.yearsOfExperience}+`, label: 'Years exp.' });
  }
  const contentCount = resolveExactContentCount(profile);
  if (contentCount != null && contentCount > 0) {
    stats.push({ value: String(contentCount), label: 'Projects' });
  }
  if (languageCount > 0) {
    stats.push({ value: String(languageCount), label: 'Languages' });
  } else if (profile.followerCount != null && profile.followerCount > 0) {
    stats.push({ value: `${profile.followerCount}+`, label: 'Followers' });
  } else if (profile.averageRating != null) {
    stats.push({ value: profile.averageRating.toFixed(1), label: 'Rating' });
  }
  return stats.slice(0, 3);
}

function buildStats(
  profile: MarketplaceCreatorPublicProfile,
  languageCount: number
): Array<{ value: string; label: string }> {
  const stats: Array<{ value: string; label: string }> = [];
  if (profile.yearsOfExperience != null && profile.yearsOfExperience > 0) {
    stats.push({ value: `${profile.yearsOfExperience}+`, label: 'Years' });
  }
  const contentCount = resolveExactContentCount(profile);
  if (contentCount != null && contentCount > 0) {
    stats.push({ value: String(contentCount), label: 'Content' });
  }
  if (languageCount > 0) {
    stats.push({ value: String(languageCount), label: 'Languages' });
  }
  if (profile.averageRating != null) {
    stats.push({ value: profile.averageRating.toFixed(1), label: 'Rating' });
  }
  return stats;
}

export function PublicCreatorPortfolioPage({
  creatorId,
  profile,
  isAuthenticated,
  locationLabel,
  portfolioPosts,
}: PublicCreatorPortfolioPageProps) {
  const { user, isLoading: authLoading } = useAuth();
  const isPortfolioOwner = !authLoading && user?.id === creatorId;
  const [profileVisits, setProfileVisits] = useState<number>(profile.profileVisits ?? 0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    settings,
    updateSection,
    resetSettings,
    resetBuiltinTheme,
    setThemeId,
    updateNavigation,
    updateGlobal,
    flushPendingSave,
    persistStatus,
    saveCustomTheme,
    renameCustomTheme,
    duplicateTheme,
    deleteCustomTheme,
    setColorMode,
    undoSettings,
    redoSettings,
    canUndo,
    canRedo,
  } =
    usePortfolioSettings(creatorId, {
      initialSettings: profile.portfolioSettings,
      canEdit: isPortfolioOwner,
    });

  useEffect(() => {
    if (!isPortfolioOwner) return;
    if (!(settings.global.settingsShortcutEnabled ?? true)) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const isComma = event.key === ',' || event.code === 'Comma';
      if (!isComma || !(event.metaKey || event.ctrlKey)) return;

      event.preventDefault();
      setSettingsOpen((open) => {
        if (open) {
          flushPendingSave();
          return false;
        }
        return true;
      });
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [
    isPortfolioOwner,
    settings.global.settingsShortcutEnabled,
    flushPendingSave,
  ]);

  const workItems = portfolioPosts ?? profile.portfolioPosts ?? [];
  const whyMeBlocks = profile.whyMeBlocks ?? [];
  const experienceBlocks = profile.experienceBlocks ?? [];
  const strengths = useMemo(
    () => profile.strengthsToolsMastered ?? [],
    [profile.strengthsToolsMastered]
  );
  const strengthNames = useMemo(
    () => strengths.map((item) => (typeof item === 'string' ? item : item.name)),
    [strengths]
  );
  const services = profile.profileServices ?? [];
  const faqItems = profile.faqItems ?? [];
  const displayLinks = resolveDisplayLinks(profile);
  const uniqueContactLinks = useMemo(() => dedupeContactLinks(displayLinks), [displayLinks]);
  const primaryLink = resolvePrimaryLink(profile);
  const legacyLanguages = profile.languages?.trim();
  const memberSinceLabel = formatMemberSince(profile.memberSince);
  const availabilityDisplay = profile.availabilityHours?.trim()
    ? formatAvailabilityHours(parseAvailabilityHours(profile.availabilityHours), profile.timezoneId)
    : null;
  const languageList = useMemo(() => {
    const spokenLanguages = profile.spokenLanguages ?? [];
    return spokenLanguages.length > 0
      ? spokenLanguages
      : legacyLanguages
        ? legacyLanguages.split(',').map((item) => item.trim()).filter(Boolean)
        : [];
  }, [profile.spokenLanguages, legacyLanguages]);
  const languageCount = languageList.length;

  const { lead: nameLead, accent: nameAccent } = splitDisplayName(profile.fullName);
  const heroDescription = buildHeroDescription(profile, locationLabel);
  const heroStats = buildHeroStats(profile, languageCount);
  const rawAboutStats = buildStats(profile, languageCount);

  const hasServicesSection = services.length > 0 || strengths.length > 0;
  const hasAboutSection = Boolean(
    whyMeBlocks.length > 0 ||
      rawAboutStats.length > 0 ||
      languageCount > 0 ||
      profile.gender?.trim() ||
      memberSinceLabel ||
      profile.responseTimeLabel?.trim() ||
      locationLabel
  );
  const hasExperienceSection = experienceBlocks.length > 0 || profile.yearsOfExperience != null;
  const hasFaqSection = faqItems.length > 0;
  const hasContactSection = Boolean(
    profile.contactEmail?.trim() ||
      profile.phone?.trim() ||
      locationLabel ||
      displayLinks.length > 0 ||
      primaryLink
  );

  const socialLinks = useMemo(
    () => resolveHeroSocialLinks(profile, displayLinks),
    [profile, displayLinks]
  );

  const navChromeLinks = useMemo(
    () =>
      buildPortfolioNavChromeLinks({
        sources: settings.navigation.linkIconSources ?? DEFAULT_PORTFOLIO_NAV_LINK_ICON_SOURCES,
        email: profile.contactEmail,
        socialLinks,
      }),
    [settings.navigation.linkIconSources, profile.contactEmail, socialLinks]
  );

  const usesMonochromeChrome = portfolioUsesMonochromeChrome(
    settings.themeId,
    settings.global.monochromeUi
  );

  const showWorkSection = workItems.length > 0 && settings.work.enabled;
  const showServicesSection = hasServicesSection && settings.services.enabled;
  const showAboutSection = hasAboutSection && settings.about.enabled;
  const showExperienceSection = hasExperienceSection && settings.experience.enabled;
  const showFaqSection = hasFaqSection && settings.faq.enabled;
  const showContactSectionResolved = hasContactSection && settings.contact.enabled;

  const heroTools = useMemo(
    () => resolveHeroTools(strengthNames, settings.hero.selectedTools),
    [strengthNames, settings.hero.selectedTools]
  );

  const heroPresentation = useMemo(
    () => pickHeroPresentationSettings(settings.hero),
    [settings.hero]
  );
  const heroPalette = useMemo(
    () => resolveHeroPaletteFromSettings(heroPresentation.palette),
    [heroPresentation.palette]
  );
  const workPresentation = useMemo(
    () => applyHeroPaletteToWork(pickWorkPresentationSettings(settings.work), heroPalette),
    [settings.work, heroPalette]
  );
  const workSectionTitle = useMemo(
    () => resolveWorkSectionTitle(settings.work),
    [settings.work]
  );
  const workSectionSubtitle = useMemo(
    () => resolveWorkSectionSubtitle(settings.work),
    [settings.work]
  );
  const aboutPresentation = useMemo(
    () => applyHeroPaletteToAbout(pickAboutPresentationSettings(settings.about), heroPalette),
    [settings.about, heroPalette]
  );
  const stats = useMemo(
    () => filterAboutStats(rawAboutStats, aboutPresentation),
    [rawAboutStats, aboutPresentation]
  );
  const aboutSectionTitle = useMemo(
    () => resolveAboutSectionTitle(settings.about),
    [settings.about]
  );
  const aboutSectionSubtitle = useMemo(
    () => resolveAboutSectionSubtitle(settings.about),
    [settings.about]
  );
  const experiencePresentation = useMemo(
    () =>
      applyHeroPaletteToExperience(
        pickExperiencePresentationSettings(settings.experience),
        heroPalette
      ),
    [settings.experience, heroPalette]
  );
  const experienceSectionTitle = useMemo(
    () => resolveExperienceSectionTitle(settings.experience),
    [settings.experience]
  );
  const experienceSectionSubtitle = useMemo(
    () => resolveExperienceSectionSubtitle(settings.experience),
    [settings.experience]
  );
  const servicesPresentation = useMemo(
    () =>
      applyHeroPaletteToServices(pickServicesPresentationSettings(settings.services), heroPalette),
    [settings.services, heroPalette]
  );
  const isDistinctServicesOrganization = servicesUsesDistinctSections(
    servicesPresentation.sectionOrganization
  );
  const contentSectionOrder = useMemo(
    () =>
      resolvePortfolioContentSectionOrder(
        settings.global.sectionOrder,
        servicesPresentation.sectionOrganization
      ),
    [settings.global.sectionOrder, servicesPresentation.sectionOrganization]
  );
  const sectionVisibility = useMemo(
    () => ({
      work: showWorkSection,
      services:
        showServicesSection &&
        (!isDistinctServicesOrganization || servicesPresentation.showServices),
      skills:
        showServicesSection &&
        isDistinctServicesOrganization &&
        servicesPresentation.showSkills &&
        strengths.length > 0,
      about: showAboutSection,
      experience: showExperienceSection,
      faq: showFaqSection,
      contact: showContactSectionResolved,
    }),
    [
      showWorkSection,
      showServicesSection,
      isDistinctServicesOrganization,
      servicesPresentation.showServices,
      servicesPresentation.showSkills,
      strengths.length,
      showAboutSection,
      showExperienceSection,
      showFaqSection,
      showContactSectionResolved,
    ]
  );
  const servicesSectionTitle = useMemo(
    () => resolveServicesSectionTitle(settings.services),
    [settings.services]
  );
  const servicesSectionSubtitle = useMemo(
    () => resolveServicesSectionSubtitle(settings.services),
    [settings.services]
  );
  const faqPresentation = useMemo(
    () => applyHeroPaletteToFaq(pickFaqPresentationSettings(settings.faq), heroPalette),
    [settings.faq, heroPalette]
  );
  const faqSectionTitle = useMemo(() => resolveFaqSectionTitle(settings.faq), [settings.faq]);
  const faqSectionSubtitle = useMemo(() => resolveFaqSectionSubtitle(settings.faq), [settings.faq]);
  const contactPresentation = useMemo(
    () =>
      applyHeroPaletteToContact(pickContactPresentationSettings(settings.contact), heroPalette),
    [settings.contact, heroPalette]
  );
  const contactSectionTitle = useMemo(
    () => resolveContactSectionTitle(settings.contact),
    [settings.contact]
  );
  const contactSectionSubtitle = useMemo(
    () => resolveContactSectionSubtitle(settings.contact, profile.responseTimeLabel),
    [settings.contact, profile.responseTimeLabel]
  );
  const footerPresentation = useMemo(
    () =>
      applyHeroPaletteToFooter(pickFooterPresentationSettings(settings.footer), heroPalette),
    [settings.footer, heroPalette]
  );
  const footerNavClearanceClass = useMemo(
    () =>
      portfolioFooterNavClearanceClass(settings.navigation.placement, {
        navMode: settings.navigation.navMode,
        enabled: settings.navigation.enabled,
      }),
    [
      settings.navigation.placement,
      settings.navigation.navMode,
      settings.navigation.enabled,
    ]
  );
  const navItems = useMemo(
    () =>
      contentSectionOrder
        .map((sectionKey) => {
          if (!sectionVisibility[sectionKey]) return null;

          return {
            id: sectionKey,
            label: resolveNavItemLabel(sectionKey, settings.navigation.itemLabels),
            icon: settings.navigation.itemIcons[sectionKey],
          };
        })
        .filter(Boolean) as { id: PortfolioNavSectionKey; label: string; icon: PortfolioNavIconVariant }[],
    [
      contentSectionOrder,
      sectionVisibility,
      settings.navigation.itemLabels,
      settings.navigation.itemIcons,
    ]
  );

  const perPageNavItems = useMemo(() => {
    const pages: { id: string; label: string; icon: PortfolioNavIconVariant }[] = [];
    if (settings.hero.enabled) {
      pages.push({ id: 'hero', label: 'Home', icon: 'home' });
    }
    pages.push(...navItems);
    return pages;
  }, [navItems, settings.hero.enabled]);

  const navMode = settings.navigation.navMode ?? 'default';
  const isPagesMode = navMode === 'pages';
  /** Large-screen split: title/description left (~40%), content right (~60%) — hero stays full-bleed. */
  const isSplitMode = navMode === 'split';
  const sectionContentLayout = isSplitMode ? 'split' : 'stacked';
  const globalTypographyContext = useMemo(
    () => ({ splitRail: isSplitMode }),
    [isSplitMode]
  );
  const [activePageId, setActivePageId] = useState(() => perPageNavItems[0]?.id ?? 'hero');

  useEffect(() => {
    if (!isPagesMode || perPageNavItems.length === 0) return;
    if (!perPageNavItems.some((item) => item.id === activePageId)) {
      setActivePageId(perPageNavItems[0].id);
    }
  }, [isPagesMode, perPageNavItems, activePageId]);

  useEffect(() => {
    if (!isPagesMode) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [isPagesMode]);

  const lastContentPageId = navItems[navItems.length - 1]?.id;
  const shouldShowFooterOnPage = (pageId: string) => {
    if (!settings.footer.enabled) return false;
    if (sectionVisibility.contact) return pageId === 'contact';
    return Boolean(lastContentPageId) && pageId === lastContentPageId;
  };

  const contactCtaHref =
    primaryLink?.url ??
    (profile.contactEmail?.trim() ? `mailto:${profile.contactEmail.trim()}` : '#footer');
  const pagesContactTarget = sectionVisibility.contact
    ? 'contact'
    : lastContentPageId ?? 'contact';
  const heroContactHref = isPagesMode ? `#${pagesContactTarget}` : '#footer';
  const navContactHref = isPagesMode
    ? `#${pagesContactTarget}`
    : sectionVisibility.contact
      ? '#contact'
      : contactCtaHref;
  const heroWorkHref = '#work';
  const onNavigateSection = isPagesMode
    ? (sectionId: string) => {
        const normalized = sectionId === 'footer' ? pagesContactTarget : sectionId;
        if (perPageNavItems.some((item) => item.id === normalized)) {
          setActivePageId(normalized);
        } else if (lastContentPageId) {
          setActivePageId(pagesContactTarget);
        }
      }
    : undefined;

  const isEditorialLayout = true;

  const hasGlobalBg = useMemo(() => hasGlobalPageBackground(settings.global), [settings.global]);
  /**
   * Global solid page color: sections without their own fill stay transparent so the
   * global color shows through. An enabled section background always paints on top
   * (section wins — e.g. footer fill overrides global on the footer only).
   * Image wallpaper never suppresses section fills.
   */
  const hasGlobalSolid = useMemo(
    () => hasGlobalSolidBackground(settings.global),
    [settings.global]
  );
  const suppressSectionBackground = (
    section?: Pick<PortfolioSectionBackgroundSettings, 'sectionBackgroundEnabled'> | null
  ) => hasGlobalSolid && !section?.sectionBackgroundEnabled;

  const sectionBackgroundByKey = useMemo((): Partial<
    Record<PortfolioNavSectionKey, PortfolioSectionBackgroundSettings>
  > => {
    return {
      work: workPresentation,
      skills: servicesPresentation,
      services: servicesPresentation,
      about: aboutPresentation,
      experience: experiencePresentation,
      faq: faqPresentation,
      contact: contactPresentation,
    };
  }, [
    workPresentation,
    servicesPresentation,
    aboutPresentation,
    experiencePresentation,
    faqPresentation,
    contactPresentation,
  ]);

  const resolvePageSectionBlocksGlobal = (sectionKey: PortfolioNavSectionKey) => {
    return hasOpaqueSectionBackground(sectionBackgroundByKey[sectionKey]);
  };
  const footerPaintsOwnBackground = Boolean(footerPresentation.sectionBackgroundEnabled);
  const globalBgStyle = useMemo(() => globalBackgroundStyle(settings.global), [settings.global]);
  const globalFixedBgStyle = useMemo(
    () => globalFixedBackgroundImageStyle(settings.global),
    [settings.global]
  );
  const globalPatternStyle = useMemo(
    () => globalBackgroundPatternStyle(settings.global),
    [settings.global]
  );
  const globalWidthClass = useMemo(
    () => globalContentWidthClass(settings.global.contentWidth),
    [settings.global.contentWidth]
  );
  const editorialShellClass = useMemo(
    () => portfolioEditorialShellClass(settings.global.contentGutter),
    [settings.global.contentGutter]
  );
  const titleScrollBehavior = settings.global.titleScroll;
  const effectiveTitleScroll = isSplitMode ? 'static' : titleScrollBehavior;
  const motionProfile = settings.global.motionProfile;
  const titleChrome = useMemo(
    () => resolveGlobalSectionTitleChrome(settings.global),
    [settings.global]
  );
  const splitTitleFrame = useMemo(
    () => resolveGlobalSplitTitleFrame(settings.global),
    [settings.global]
  );
  const sectionTopSpacingClass = useMemo(
    () =>
      isSplitMode
        ? globalSplitContentTopClass(settings.global.splitContentTopSpacing ?? 'compact')
        : globalSectionTitleTopClass(settings.global.sectionTitleTopSpacing),
    [
      isSplitMode,
      settings.global.splitContentTopSpacing,
      settings.global.sectionTitleTopSpacing,
    ]
  );

  const workHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.work.headerAlignment),
    [settings.global, settings.work.headerAlignment]
  );
  const servicesHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.services.headerAlignment),
    [settings.global, settings.services.headerAlignment]
  );
  const skillsHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.services.skillsHeader.headerAlignment),
    [settings.global, settings.services.skillsHeader.headerAlignment]
  );
  const distinctServicesHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.services.servicesHeader.headerAlignment),
    [settings.global, settings.services.servicesHeader.headerAlignment]
  );
  const aboutHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.about.headerAlignment),
    [settings.global, settings.about.headerAlignment]
  );
  const faqHeaderAlign = useMemo(() => {
    if (settings.faq.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    const sectionAlign = settings.faq.headerAlignment === 'center' ? 'center' : 'left';
    return resolveSectionHeaderAlign(settings.global, sectionAlign);
  }, [settings.global, settings.faq.headerAlignment]);
  const experienceHeaderAlign = useMemo(() => {
    if (settings.experience.headerAlignment === 'right') {
      return { centered: false, alignRight: true, alwaysCentered: true };
    }
    const sectionAlign = settings.experience.headerAlignment === 'center' ? 'center' : 'left';
    return resolveSectionHeaderAlign(settings.global, sectionAlign);
  }, [settings.global, settings.experience.headerAlignment]);
  const contactHeaderAlign = useMemo(
    () => resolveSectionHeaderAlign(settings.global, settings.contact.headerAlignment),
    [settings.global, settings.contact.headerAlignment]
  );

  const workHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: workHeaderFontClass(workPresentation.titleFont, 'title'),
      fontStyle: workHeaderFontStyle(workPresentation.titleFont),
      colorStyle: workTitleColorStyle(workPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: workHeaderFontClass(workPresentation.subtitleFont, 'subtitle'),
      fontStyle: workHeaderFontStyle(workPresentation.subtitleFont),
      colorStyle: workSubtitleColorStyle(workPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, workPresentation, globalTypographyContext]);

  const servicesHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(servicesPresentation.titleFont, 'title'),
      fontStyle: servicesHeaderFontStyle(servicesPresentation.titleFont),
      colorStyle: servicesTitleColorStyle(servicesPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(servicesPresentation.subtitleFont, 'subtitle'),
      fontStyle: servicesHeaderFontStyle(servicesPresentation.subtitleFont),
      colorStyle: servicesSubtitleColorStyle(servicesPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, servicesPresentation, globalTypographyContext]);

  const skillsHeaderTypography = useMemo(() => {
    const header = servicesPresentation.skillsHeader;
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(header.titleFont, 'title'),
      fontStyle: servicesHeaderFontStyle(header.titleFont),
      colorStyle: servicesTitleColorStyle(header.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(header.subtitleFont, 'subtitle'),
      fontStyle: servicesHeaderFontStyle(header.subtitleFont),
      colorStyle: servicesSubtitleColorStyle(header.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, servicesPresentation.skillsHeader, globalTypographyContext]);

  const distinctServicesHeaderTypography = useMemo(() => {
    const header = servicesPresentation.servicesHeader;
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(header.titleFont, 'title'),
      fontStyle: servicesHeaderFontStyle(header.titleFont),
      colorStyle: servicesTitleColorStyle(header.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: servicesHeaderFontClass(header.subtitleFont, 'subtitle'),
      fontStyle: servicesHeaderFontStyle(header.subtitleFont),
      colorStyle: servicesSubtitleColorStyle(header.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, servicesPresentation.servicesHeader, globalTypographyContext]);

  const aboutHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: aboutHeaderFontClass(aboutPresentation.titleFont, 'title'),
      fontStyle: aboutHeaderFontStyle(
        aboutPresentation.titleFont,
        aboutPresentation.subtitleSerif,
        'title'
      ),
      colorStyle: aboutTitleColorStyle(aboutPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: aboutHeaderFontClass(aboutPresentation.subtitleFont, 'subtitle'),
      fontStyle: aboutHeaderFontStyle(
        aboutPresentation.subtitleFont,
        aboutPresentation.subtitleSerif,
        'subtitle'
      ),
      colorStyle: aboutSubtitleColorStyle(aboutPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, aboutPresentation, globalTypographyContext]);

  const experienceHeaderTypography = useMemo(() => {
    const titleClass = [
      experienceHeaderFontClass(experiencePresentation.titleFont, 'title'),
      experiencePresentation.titleUppercase && experiencePresentation.titleFont !== 'display'
        ? 'uppercase'
        : '',
    ]
      .filter(Boolean)
      .join(' ');
    const subtitleClass = [
      experienceHeaderFontClass(experiencePresentation.subtitleFont, 'subtitle'),
      experiencePresentation.subtitleUppercase && experiencePresentation.subtitleFont !== 'display'
        ? 'uppercase'
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: titleClass,
      fontStyle: experienceHeaderFontStyle(experiencePresentation.titleFont),
      colorStyle: experienceTitleColorStyle(experiencePresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: subtitleClass,
      fontStyle: experienceHeaderFontStyle(experiencePresentation.subtitleFont),
      colorStyle: experienceSubtitleColorStyle(experiencePresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, experiencePresentation, globalTypographyContext]);

  const faqHeaderTypography = useMemo(() => {
    const titleClass = [
      faqHeaderFontClass(faqPresentation.titleFont, 'title'),
      faqPresentation.titleUppercase && faqPresentation.titleFont !== 'display' ? 'uppercase' : '',
    ]
      .filter(Boolean)
      .join(' ');
    const subtitleClass = [
      faqHeaderFontClass(faqPresentation.subtitleFont, 'subtitle'),
      faqPresentation.subtitleUppercase && faqPresentation.subtitleFont !== 'display'
        ? 'uppercase'
        : '',
    ]
      .filter(Boolean)
      .join(' ');

    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: titleClass,
      fontStyle: faqHeaderFontStyle(faqPresentation.titleFont),
      colorStyle: faqTitleColorStyle(faqPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: subtitleClass,
      fontStyle: faqHeaderFontStyle(faqPresentation.subtitleFont),
      colorStyle: faqSubtitleColorStyle(faqPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, faqPresentation, globalTypographyContext]);

  const contactHeaderTypography = useMemo(() => {
    const title = resolveGlobalSectionTitleTypography(
      settings.global,
      {
      fontClass: contactHeaderFontClass(contactPresentation.titleFont, 'title'),
      fontStyle: contactHeaderFontStyle(
        contactPresentation.titleFont,
        contactPresentation.subtitleSerif,
        'title'
      ),
      colorStyle: contactTitleColorStyle(contactPresentation.titleColor),
      },
      globalTypographyContext
    );
    const subtitle = resolveGlobalSectionSubtitleTypography(
      settings.global,
      {
      fontClass: contactHeaderFontClass(contactPresentation.subtitleFont, 'subtitle'),
      fontStyle: contactHeaderFontStyle(
        contactPresentation.subtitleFont,
        contactPresentation.subtitleSerif,
        'subtitle'
      ),
      colorStyle: contactSubtitleColorStyle(contactPresentation.subtitleColor),
      },
      globalTypographyContext
    );
    return { title, subtitle };
  }, [settings.global, contactPresentation, globalTypographyContext]);

  const aboutSideInfoItems = useMemo(() => {
    const items = [];

    if (locationLabel && isAboutSideInfoItemVisible('location', settings.about)) {
      items.push({
        id: 'location',
        icon: SIDE_INFO_ICONS.location,
        label: 'Location',
        title: locationLabel,
        subtitle:
          profile.timezoneId
            ? `${profile.timezoneId.replace(/_/g, ' ')}${availabilityDisplay ? ' · Available remotely' : ''}`
            : availabilityDisplay
              ? 'Available remotely'
              : undefined,
      });
    }

    if (languageCount > 0 && isAboutSideInfoItemVisible('languages', settings.about)) {
      items.push({
        id: 'languages',
        icon: SIDE_INFO_ICONS.languages,
        label: 'Languages',
        title: languageList.join(' · '),
        lines: languageList,
      });
    }

    if (profile.gender?.trim() && isAboutSideInfoItemVisible('gender', settings.about)) {
      items.push({
        id: 'gender',
        icon: SIDE_INFO_ICONS.gender,
        label: 'Gender',
        title: profile.gender,
      });
    }

    if (memberSinceLabel && isAboutSideInfoItemVisible('member-since', settings.about)) {
      items.push({
        id: 'member-since',
        icon: SIDE_INFO_ICONS.memberSince,
        label: 'Member since',
        title: memberSinceLabel,
      });
    }

    if (
      (profile.isAvailable === false || availabilityDisplay) &&
      isAboutSideInfoItemVisible('availability', settings.about)
    ) {
      const availabilityLines =
        profile.isAvailable === false
          ? undefined
          : profile.availabilityHours?.trim()
            ? formatAvailabilityHoursLines(parseAvailabilityHours(profile.availabilityHours))
            : undefined;
      items.push({
        id: 'availability',
        icon: SIDE_INFO_ICONS.availability,
        label: 'Availability',
        title: profile.isAvailable === false ? 'Currently unavailable' : (availabilityDisplay ?? ''),
        lines: availabilityLines,
        subtitle:
          profile.isAvailable !== false &&
          profile.responseTimeLabel?.trim() &&
          settings.about.showSidePanelResponseTime
            ? `Reply ${profile.responseTimeLabel.toLowerCase()}`
            : undefined,
      });
    }

    return items;
  }, [
    availabilityDisplay,
    languageCount,
    languageList,
    locationLabel,
    memberSinceLabel,
    profile.availabilityHours,
    profile.gender,
    profile.isAvailable,
    profile.responseTimeLabel,
    profile.timezoneId,
    settings.about,
  ]);

  function renderContentSection(sectionKey: PortfolioNavSectionKey) {
    if (!sectionVisibility[sectionKey]) return null;

    switch (sectionKey) {
      case 'work':
        return (
          <PortfolioSectionShell
            id="work"
            background={workPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(workPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            contentLayout={sectionContentLayout}
            header={
              <EditorialSectionStickyHeader
                title={workSectionTitle}
                subtitle={workSectionSubtitle || undefined}
                trailing={
                  settings.work.showMarketplaceLink ? (
                    <MarketplaceProfileLink
                      creatorId={creatorId}
                      color={workPresentation.titleColor}
                    />
                  ) : null
                }
                editorialLayout={isEditorialLayout}
                centered={workHeaderAlign.centered}
                alignRight={workHeaderAlign.alignRight}
                alwaysCentered={workHeaderAlign.alwaysCentered}
                titleTypographyClass={workHeaderTypography.title.className}
                titleTypographyStyle={workHeaderTypography.title.style}
                titleDecorationStyle={workHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={workHeaderTypography.title.customSizing}
                subtitleTypographyClass={workHeaderTypography.subtitle.className}
                subtitleTypographyStyle={workHeaderTypography.subtitle.style}
                subtitleDecorationStyle={workHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={workHeaderTypography.subtitle.customSizing}
                scrollBehavior={effectiveTitleScroll}
                orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'work')}
              />
            }
          >
            <EditorialWorkGallery
              items={workItems}
              presentation={workPresentation}
              motionProfile={motionProfile}
              forceSingleColumn={isSplitMode}
            />
          </PortfolioSectionShell>
        );
      case 'skills':
        return (
          <PortfolioSectionShell
            id="skills"
            background={servicesPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(servicesPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            contentLayout={sectionContentLayout}
            header={
              <EditorialSectionStickyHeader
                title={resolveDistinctBlockSectionTitle(settings.services, 'skills')}
                subtitle={resolveDistinctBlockSectionSubtitle(settings.services, 'skills') || undefined}
                editorialLayout={isEditorialLayout}
                centered={skillsHeaderAlign.centered}
                alignRight={skillsHeaderAlign.alignRight}
                alwaysCentered={skillsHeaderAlign.alwaysCentered}
                titleTypographyClass={skillsHeaderTypography.title.className}
                titleTypographyStyle={skillsHeaderTypography.title.style}
                titleDecorationStyle={skillsHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={skillsHeaderTypography.title.customSizing}
                subtitleTypographyClass={skillsHeaderTypography.subtitle.className}
                subtitleTypographyStyle={skillsHeaderTypography.subtitle.style}
                subtitleDecorationStyle={skillsHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={skillsHeaderTypography.subtitle.customSizing}
                scrollBehavior={effectiveTitleScroll}
                orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'skills')}
              />
            }
          >
            <EditorialSkillShowcase
              skills={strengths}
              presentation={resolveServicesBlockPresentation(servicesPresentation, 'skills')}
              motionProfile={motionProfile}
            />
          </PortfolioSectionShell>
        );
      case 'services':
        return (
          <PortfolioSectionShell
            id="services"
            background={servicesPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(servicesPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            contentLayout={sectionContentLayout}
            header={
              <EditorialSectionStickyHeader
                title={
                  isDistinctServicesOrganization
                    ? resolveDistinctBlockSectionTitle(settings.services, 'services')
                    : servicesSectionTitle
                }
                subtitle={
                  (isDistinctServicesOrganization
                    ? resolveDistinctBlockSectionSubtitle(settings.services, 'services')
                    : servicesSectionSubtitle) || undefined
                }
                trailing={
                  !isDistinctServicesOrganization &&
                  servicesPresentation.showResponseTime &&
                  profile.responseTimeLabel?.trim() ? (
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-400">
                      Typically replies {profile.responseTimeLabel.toLowerCase()}
                    </p>
                  ) : undefined
                }
                editorialLayout={isEditorialLayout}
                centered={
                  isDistinctServicesOrganization
                    ? distinctServicesHeaderAlign.centered
                    : servicesHeaderAlign.centered
                }
                alignRight={
                  isDistinctServicesOrganization
                    ? distinctServicesHeaderAlign.alignRight
                    : servicesHeaderAlign.alignRight
                }
                alwaysCentered={
                  isDistinctServicesOrganization
                    ? distinctServicesHeaderAlign.alwaysCentered
                    : servicesHeaderAlign.alwaysCentered
                }
                titleTypographyClass={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).title.className
                }
                titleTypographyStyle={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).title.style
                }
                titleDecorationStyle={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).title.decorationStyle
                }
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).title.customSizing
                }
                subtitleTypographyClass={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).subtitle.className
                }
                subtitleTypographyStyle={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).subtitle.style
                }
                subtitleDecorationStyle={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).subtitle.decorationStyle
                }
                customSubtitleSizing={
                  (isDistinctServicesOrganization
                    ? distinctServicesHeaderTypography
                    : servicesHeaderTypography
                  ).subtitle.customSizing
                }
                scrollBehavior={effectiveTitleScroll}
                orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'services')}
              />
            }
          >
            {isDistinctServicesOrganization ? (
              <>
                <EditorialServicesCarousel
                  services={services}
                  presentation={resolveServicesBlockPresentation(servicesPresentation, 'services')}
                  motionProfile={motionProfile}
                />
                {services.length === 0 ? (
                  <p className="mt-8 text-base leading-relaxed text-neutral-500">
                    Contact me to discuss a custom engagement.
                  </p>
                ) : null}
              </>
            ) : (
              <>
                <EditorialServicesSkillsSection
                  skills={strengths}
                  services={services}
                  presentation={servicesPresentation}
                  motionProfile={motionProfile}
                />

                {services.length === 0 && strengths.length > 0 && servicesPresentation.showSkills ? (
                  <p className="mt-8 text-base leading-relaxed text-neutral-500">
                    Contact me to discuss a custom engagement.
                  </p>
                ) : null}
              </>
            )}
          </PortfolioSectionShell>
        );
      case 'about':
        return (
          <PortfolioSectionShell
            id="about"
            background={aboutPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(aboutPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            contentLayout={sectionContentLayout}
            header={
              <EditorialSectionStickyHeader
                title={aboutSectionTitle}
                subtitle={aboutSectionSubtitle || undefined}
                subtitleSerif={settings.about.subtitleSerif}
                editorialLayout={isEditorialLayout}
                centered={aboutHeaderAlign.centered}
                alignRight={aboutHeaderAlign.alignRight}
                alwaysCentered={aboutHeaderAlign.alwaysCentered}
                titleTypographyClass={aboutHeaderTypography.title.className}
                titleTypographyStyle={aboutHeaderTypography.title.style}
                titleDecorationStyle={aboutHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={aboutHeaderTypography.title.customSizing}
                subtitleTypographyClass={aboutHeaderTypography.subtitle.className}
                subtitleTypographyStyle={aboutHeaderTypography.subtitle.style}
                subtitleDecorationStyle={aboutHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={aboutHeaderTypography.subtitle.customSizing}
                scrollBehavior={effectiveTitleScroll}
                orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'about')}
              />
            }
          >
            {(() => {
              const showPanel = settings.about.showSidePanel && aboutSideInfoItems.length > 0;
              // Split nav: profile as a full-width frame directly above Why Me (not a narrow sidebar).
              const splitProfileBand = isSplitMode && showPanel;
              const isFullWidth = splitProfileBand || settings.about.layoutMode === 'full-width';
              const hasSidebar = showPanel && !isFullWidth;
              const layoutMode = splitProfileBand ? 'full-width' : settings.about.layoutMode;
              const gridClass = aboutMainGridClass(layoutMode, hasSidebar);
              const panelPlacement = splitProfileBand
                ? 'below-stats'
                : settings.about.fullWidthPanelPlacement;
              const statsBlockSpacing = settings.about.showStats && stats.length > 0 ? 'mt-14' : 'mt-10';
              const whyMePresentation = isSplitMode
                ? {
                    ...aboutPresentation,
                    whyMeMediaPlacement:
                      aboutPresentation.whyMeMediaPlacement === 'text-only'
                        ? aboutPresentation.whyMeMediaPlacement
                        : ('media-top' as const),
                  }
                : aboutPresentation;
              const sidePanelPresentation = splitProfileBand
                ? {
                    ...aboutPresentation,
                    sidePanelDesign: 'framed' as const,
                    sidePanelFullWidthLayout: 'profile-frame' as const,
                    sidePanelAutoCenter: false,
                  }
                : aboutPresentation;

              const mainColumn = (
                <div className="space-y-12">
                  {settings.about.showWhyMe && whyMeBlocks.length > 0 ? (
                    <div>
                      <EditorialWhyMeHeading presentation={whyMePresentation} />
                      <EditorialWhyMeList
                        blocks={whyMeBlocks}
                        presentation={whyMePresentation}
                        motionProfile={motionProfile}
                        forceStack={isSplitMode}
                      />
                    </div>
                  ) : null}
                </div>
              );

              const sidePanelColumn = showPanel ? (
                <aside className={hasSidebar ? 'lg:sticky lg:top-32 lg:self-start xl:top-28' : undefined}>
                  <EditorialSideInfoPanel
                    items={aboutSideInfoItems}
                    presentation={sidePanelPresentation}
                    layoutMode={layoutMode}
                  />
                </aside>
              ) : null;

              const renderFullWidthPanel = (position: typeof panelPlacement) =>
                isFullWidth && sidePanelColumn && panelPlacement === position ? (
                  <div className={statsBlockSpacing}>{sidePanelColumn}</div>
                ) : null;

              if (isFullWidth) {
                const statsTopSpacing =
                  showPanel && panelPlacement === 'above-stats' ? 'mt-14' : undefined;

                return (
                  <>
                    {renderFullWidthPanel('above-stats')}
                    {settings.about.showStats && stats.length > 0 ? (
                      <div className={statsTopSpacing}>
                        <EditorialStatGrid stats={stats} presentation={aboutPresentation} motionProfile={motionProfile} />
                      </div>
                    ) : null}
                    {renderFullWidthPanel('below-stats')}
                    <div className={statsBlockSpacing}>{mainColumn}</div>
                    {renderFullWidthPanel('below-content')}
                  </>
                );
              }

              return (
                <>
                  {settings.about.showStats && stats.length > 0 ? (
                    <EditorialStatGrid stats={stats} presentation={aboutPresentation} motionProfile={motionProfile} />
                  ) : null}
                  <div className={`grid gap-8 sm:gap-10 ${gridClass}${statsBlockSpacing ? ` ${statsBlockSpacing}` : ''}`}>
                    {layoutMode === 'sidebar-left' ? (
                      <>
                        {sidePanelColumn}
                        {mainColumn}
                      </>
                    ) : (
                      <>
                        {mainColumn}
                        {sidePanelColumn}
                      </>
                    )}
                  </div>
                </>
              );
            })()}
          </PortfolioSectionShell>
        );
      case 'experience':
        return (
          <PortfolioSectionShell
            id="experience"
            background={experiencePresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            suppressBackground={suppressSectionBackground(experiencePresentation)}
            topSpacingClass={sectionTopSpacingClass}
            contentLayout={sectionContentLayout}
            header={
              <EditorialSectionStickyHeader
                title={experienceSectionTitle}
                subtitle={experienceSectionSubtitle || undefined}
                editorialLayout={isEditorialLayout}
                centered={experienceHeaderAlign.centered}
                alignRight={experienceHeaderAlign.alignRight}
                alwaysCentered={experienceHeaderAlign.alwaysCentered}
                className="mb-10 lg:mb-12"
                titleTypographyClass={experienceHeaderTypography.title.className}
                titleTypographyStyle={experienceHeaderTypography.title.style}
                titleDecorationStyle={experienceHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={experienceHeaderTypography.title.customSizing}
                subtitleTypographyClass={experienceHeaderTypography.subtitle.className}
                subtitleTypographyStyle={experienceHeaderTypography.subtitle.style}
                subtitleDecorationStyle={experienceHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={experienceHeaderTypography.subtitle.customSizing}
                scrollBehavior={effectiveTitleScroll}
                orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'experience')}
              />
            }
          >
            {settings.experience.showYears &&
            profile.yearsOfExperience != null &&
            profile.yearsOfExperience > 0 ? (
              <PortfolioMotionItem profile={motionProfile} index={0}>
                <EditorialExperienceYears years={profile.yearsOfExperience} presentation={experiencePresentation} />
              </PortfolioMotionItem>
            ) : null}
            <EditorialExperienceList
              blocks={experienceBlocks}
              presentation={experiencePresentation}
              motionProfile={motionProfile}
              forceSingleColumn={isSplitMode}
            />
          </PortfolioSectionShell>
        );
      case 'faq':
        return (
          <PortfolioSectionShell
            id="faq"
            background={faqPresentation}
            fitContent
            fillAvailableHeight={isPagesMode}
            className={navMode === 'per-page' ? 'pb-28 sm:pb-24' : undefined}
            suppressBackground={suppressSectionBackground(faqPresentation)}
            topSpacingClass={sectionTopSpacingClass}
            contentLayout={sectionContentLayout}
            header={
              <EditorialSectionStickyHeader
                title={faqSectionTitle}
                subtitle={faqSectionSubtitle || undefined}
                editorialLayout={isEditorialLayout}
                centered={faqHeaderAlign.centered}
                alignRight={faqHeaderAlign.alignRight}
                alwaysCentered={faqHeaderAlign.alwaysCentered}
                className="mb-10 lg:mb-12"
                titleTypographyClass={faqHeaderTypography.title.className}
                titleTypographyStyle={faqHeaderTypography.title.style}
                titleDecorationStyle={faqHeaderTypography.title.decorationStyle}
                titleChromeClass={titleChrome.className}
                titleChromeStyle={titleChrome.style}
                customTitleSizing={faqHeaderTypography.title.customSizing}
                subtitleTypographyClass={faqHeaderTypography.subtitle.className}
                subtitleTypographyStyle={faqHeaderTypography.subtitle.style}
                subtitleDecorationStyle={faqHeaderTypography.subtitle.decorationStyle}
                customSubtitleSizing={faqHeaderTypography.subtitle.customSizing}
                scrollBehavior={effectiveTitleScroll}
                orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'faq')}
              />
            }
          >
            <div
              className={`${faqListPlacementClass(faqPresentation.listPlacement)} ${faqListMaxWidthClass(
                faqPresentation.listMaxWidth
              )}`}
            >
              <EditorialFaqList items={faqItems} presentation={faqPresentation} motionProfile={motionProfile} />
            </div>
          </PortfolioSectionShell>
        );
      case 'contact':
        return (
          <EditorialContactSection
            email={profile.contactEmail}
            phone={profile.phone}
            locationLabel={locationLabel}
            links={uniqueContactLinks}
            ctaHref={contactCtaHref}
            responseTimeLabel={profile.responseTimeLabel}
            sectionTitle={contactSectionTitle}
            sectionSubtitle={contactSectionSubtitle || undefined}
            presentation={contactPresentation}
            motionProfile={motionProfile}
            topSpacingClass={sectionTopSpacingClass}
            contentLayout={sectionContentLayout}
            titleTypographyClass={contactHeaderTypography.title.className}
            titleTypographyStyle={contactHeaderTypography.title.style}
            titleDecorationStyle={contactHeaderTypography.title.decorationStyle}
            titleChromeClass={titleChrome.className}
            titleChromeStyle={titleChrome.style}
            customTitleSizing={contactHeaderTypography.title.customSizing}
            subtitleTypographyClass={contactHeaderTypography.subtitle.className}
            subtitleTypographyStyle={contactHeaderTypography.subtitle.style}
            subtitleDecorationStyle={contactHeaderTypography.subtitle.decorationStyle}
            customSubtitleSizing={contactHeaderTypography.subtitle.customSizing}
            centered={contactHeaderAlign.centered}
            alignRight={contactHeaderAlign.alignRight}
            alwaysCentered={contactHeaderAlign.alwaysCentered}
            suppressBackground={suppressSectionBackground(contactPresentation)}
            scrollBehavior={effectiveTitleScroll}
            orientation={isSplitMode ? 'horizontal' : resolveSectionTitleOrientation(settings.global, 'contact')}
            renderSocialIcon={(platform, className) => (
              <SocialPlatformIcon platform={platform} className={className} />
            )}
            socialBrandClass={
              portfolioUsesMonochromeChrome(settings.themeId, settings.global.monochromeUi)
                ? portfolioMonochromeSocialBrandClass
                : socialPlatformBrandClass
            }
            editorialLayout={isEditorialLayout}
            membersOnlyNode={
              !isAuthenticated && profile.membersOnlyContactAvailable ? (
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <Link
                    href={`/login?redirect=${encodeURIComponent(`/portfolio/${creatorId}`)}`}
                    className="font-semibold text-orange-600 hover:text-orange-700 dark:text-orange-400"
                  >
                    Sign in
                  </Link>{' '}
                  to see more contact details.
                </p>
              ) : null
            }
          />
        );
      default:
        return null;
    }
  }

  return (
    <PortfolioThemeRoot
      themeId={settings.themeId}
      customThemes={settings.customThemes}
      monochromeUi={settings.global.monochromeUi}
      bodyFont={settings.global.bodyFont}
      globalStyle={globalBgStyle}
      fixedBackgroundStyle={globalFixedBgStyle}
      patternBackgroundStyle={globalPatternStyle}
      suppressDefaultBackground={hasGlobalBg}
    >
      <CreatorProfileViewTracker creatorId={creatorId} onVisitRecorded={setProfileVisits} />
      {navMode === 'per-page' ? (
        <PortfolioPerPageNav items={perPageNavItems} settings={settings.navigation} />
      ) : (
        <>
          <PortfolioFloatingNav
            items={isPagesMode ? perPageNavItems : navItems}
            settings={settings.navigation}
            activeId={isPagesMode ? activePageId : undefined}
            onNavigate={
              isPagesMode
                ? (id) => setActivePageId(id === 'contact' ? pagesContactTarget : id)
                : undefined
            }
            chromeLinks={navChromeLinks}
            monochrome={usesMonochromeChrome}
            contactHref={navContactHref}
            onContactNavigate={
              isPagesMode ? () => setActivePageId(pagesContactTarget) : undefined
            }
          />
        </>
      )}

      {isPortfolioOwner ? (
        <PortfolioSettingsButton
          onClick={() => setSettingsOpen(true)}
          storageKey={`portfolio-settings-btn:${creatorId}`}
          shortcutHint={
            settings.global.settingsShortcutEnabled ?? true ? 'Ctrl+,' : null
          }
        />
      ) : null}

      {isPortfolioOwner ? (
        <PortfolioSettingsModal
          open={settingsOpen}
          onClose={() => {
            flushPendingSave();
            setSettingsOpen(false);
          }}
          settings={settings}
          persistStatus={persistStatus}
          onChange={updateSection}
          onThemeChange={setThemeId}
          onNavigationChange={updateNavigation}
          onGlobalChange={updateGlobal}
          onColorModeChange={setColorMode}
          onSaveCustomTheme={saveCustomTheme}
          onRenameCustomTheme={renameCustomTheme}
          onDuplicateTheme={duplicateTheme}
          onResetBuiltinTheme={resetBuiltinTheme}
          onDeleteCustomTheme={deleteCustomTheme}
          onReset={resetSettings}
          onUndo={undoSettings}
          onRedo={redoSettings}
          canUndo={canUndo}
          canRedo={canRedo}
          availableTools={strengthNames}
        />
      ) : null}

      {isPagesMode ? (
        <div className="relative flex h-[100dvh] flex-col overflow-hidden">
          {settings.hero.enabled && activePageId === 'hero' ? (
            <div
              key="hero-page"
              className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
            >
              <PortfolioHeroSection
                creatorId={creatorId}
                fullName={profile.fullName}
                nameLead={nameLead}
                nameAccent={nameAccent}
                specialite={profile.specialite}
                description={heroDescription}
                avatarUrl={profile.avatarUrl}
                isVerified={profile.isVerified}
                isAvailable={profile.isAvailable}
                responseTimeLabel={profile.responseTimeLabel}
                yearsOfExperience={profile.yearsOfExperience}
                workCount={resolveExactContentCount(profile) ?? undefined}
                locationLabel={locationLabel}
                stats={heroStats}
                socialLinks={socialLinks}
                tools={settings.hero.showTools ? heroTools : []}
                contactHref={heroContactHref}
                workHref={heroWorkHref}
                onNavigateSection={onNavigateSection}
                showWorkCta={showWorkSection}
                showContactCta={settings.hero.showContactCta}
                navItems={navItems}
                presentation={heroPresentation}
                suppressBackground={hasGlobalSolid}
                globalBackgroundStyle={globalBgStyle}
                geomFadeEnabled={motionProfileEnablesHeroGeomFade(motionProfile)}
                motionProfile={motionProfile}
                contentGutter={settings.global.contentGutter}
                contentWidthClass={globalWidthClass}
              />
            </div>
          ) : null}

          {contentSectionOrder.map((sectionKey) => {
            if (!sectionVisibility[sectionKey]) return null;
            if (activePageId !== sectionKey) return null;
            const showFooter = shouldShowFooterOnPage(sectionKey);
            const sectionBlocksGlobal = resolvePageSectionBlocksGlobal(sectionKey);
            const sectionBg = sectionBackgroundByKey[sectionKey];
            const pageFillColor =
              sectionBlocksGlobal && sectionBg
                ? sectionBackgroundBlockColor(sectionBg)
                : undefined;
            return (
              <div
                key={sectionKey}
                className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain"
              >
                {/*
                  Fill the scrollport height so short pages pin the footer to the bottom
                  (no white void under the footer).
                  When this page section has an opaque background, paint the page column
                  with that fill so the fixed global wallpaper cannot show in empty space.
                */}
                <div
                  className={`flex min-h-full w-full flex-col overflow-x-clip ${
                    !hasGlobalBg && !sectionBlocksGlobal ? 'bg-white' : ''
                  }`}
                  style={{
                    minHeight: '100%',
                    ...(pageFillColor ? { backgroundColor: pageFillColor } : null),
                  }}
                >
                  <main
                    className={`mx-auto flex w-full flex-1 grow flex-col ${editorialShellClass} ${globalWidthClass} ${
                      showFooter ? 'pb-0' : 'pb-24 sm:pb-28'
                    }`}
                  >
                    {renderContentSection(sectionKey)}
                  </main>
                  {showFooter ? (
                    <div className="mt-auto w-full shrink-0">
                      <EditorialPortfolioFooter
                        creatorName={profile.fullName}
                        creatorId={creatorId}
                        avatarUrl={profile.avatarUrl}
                        bio={profile.bio}
                        whyMeText={whyMeBlocks[0]?.text ?? null}
                        email={profile.contactEmail}
                        phone={profile.phone}
                        locationLabel={locationLabel}
                        hoursLabel={availabilityDisplay}
                        profileVisits={profileVisits}
                        links={uniqueContactLinks}
                        contentClassName={editorialShellClass}
                        presentation={footerPresentation}
                        transparentBase={hasGlobalBg && !footerPaintsOwnBackground}
                        isAvailable={profile.isAvailable}
                        responseTimeLabel={profile.responseTimeLabel}
                        contactHref={
                          profile.contactEmail?.trim()
                            ? `mailto:${profile.contactEmail.trim()}`
                            : heroContactHref
                        }
                        motionProfile={motionProfile}
                        bottomClearanceClass={footerNavClearanceClass}
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={`flex min-h-[100dvh] min-h-screen max-w-full flex-col ${
          isSplitMode ? '' : 'overflow-x-clip'
        }`}>
          {settings.hero.enabled ? (
            <PortfolioHeroSection
              creatorId={creatorId}
              fullName={profile.fullName}
              nameLead={nameLead}
              nameAccent={nameAccent}
              specialite={profile.specialite}
              description={heroDescription}
              avatarUrl={profile.avatarUrl}
              isVerified={profile.isVerified}
              isAvailable={profile.isAvailable}
              responseTimeLabel={profile.responseTimeLabel}
              yearsOfExperience={profile.yearsOfExperience}
              workCount={resolveExactContentCount(profile) ?? undefined}
              locationLabel={locationLabel}
              stats={heroStats}
              socialLinks={socialLinks}
              tools={settings.hero.showTools ? heroTools : []}
              contactHref={heroContactHref}
              workHref={heroWorkHref}
              onNavigateSection={onNavigateSection}
              showWorkCta={showWorkSection}
              showContactCta={settings.hero.showContactCta}
              navItems={navItems}
              presentation={heroPresentation}
              suppressBackground={hasGlobalSolid}
              globalBackgroundStyle={globalBgStyle}
              geomFadeEnabled={motionProfileEnablesHeroGeomFade(motionProfile)}
              motionProfile={motionProfile}
              contentGutter={settings.global.contentGutter}
              contentWidthClass={globalWidthClass}
            />
          ) : null}

          <main
            className={`mx-auto w-full flex-1 grow space-y-0 ${editorialShellClass} ${globalWidthClass} ${
              settings.footer.enabled ? 'pb-0' : 'pb-24 sm:pb-28 xl:pb-20'
            } ${hasGlobalBg ? '' : 'bg-white'}`}
          >
            {isSplitMode ? (
              <PortfolioSplitScreenFrame
                titleMotion={settings.global.splitTitleMotion ?? 'fade-up'}
                titleFrame={splitTitleFrame}
              >
                {contentSectionOrder.map((sectionKey) => (
                  <Fragment key={sectionKey}>{renderContentSection(sectionKey)}</Fragment>
                ))}
              </PortfolioSplitScreenFrame>
            ) : (
              contentSectionOrder.map((sectionKey) => (
                <Fragment key={sectionKey}>{renderContentSection(sectionKey)}</Fragment>
              ))
            )}
          </main>

          {settings.footer.enabled ? (
            <div className="mt-auto w-full shrink-0">
              <EditorialPortfolioFooter
                creatorName={profile.fullName}
                creatorId={creatorId}
                avatarUrl={profile.avatarUrl}
                bio={profile.bio}
                whyMeText={whyMeBlocks[0]?.text ?? null}
                email={profile.contactEmail}
                phone={profile.phone}
                locationLabel={locationLabel}
                hoursLabel={availabilityDisplay}
                profileVisits={profileVisits}
                links={uniqueContactLinks}
                contentClassName={editorialShellClass}
                presentation={footerPresentation}
                transparentBase={hasGlobalBg && !footerPaintsOwnBackground}
                isAvailable={profile.isAvailable}
                responseTimeLabel={profile.responseTimeLabel}
                contactHref={
                  profile.contactEmail?.trim()
                    ? `mailto:${profile.contactEmail.trim()}`
                    : heroContactHref
                }
                motionProfile={motionProfile}
                bottomClearanceClass={footerNavClearanceClass}
              />
            </div>
          ) : null}
        </div>
      )}
    </PortfolioThemeRoot>
  );
}
