import type { CSSProperties } from 'react';
import type { PortfolioContentGutter } from '@/components/portfolio/portfolio-editorial-layout';
import type { PortfolioHeroPresentationSettings } from '@/components/portfolio/portfolio-hero-settings';

export type HeroStat = { value: string; label: string };

export type HeroSocialLink = {
  id: string;
  platform: string;
  url: string;
  label: string;
};

export type PortfolioHeroData = {
  creatorId: string;
  fullName: string;
  nameLead: string;
  nameAccent: string;
  specialite?: string | null;
  description: string;
  avatarUrl?: string | null;
  isVerified?: boolean;
  isAvailable?: boolean;
  responseTimeLabel?: string | null;
  yearsOfExperience?: number | null;
  workCount?: number;
  locationLabel?: string | null;
  stats: HeroStat[];
  socialLinks: HeroSocialLink[];
  tools: string[];
  contactHref: string;
  showWorkCta: boolean;
  showContactCta: boolean;
  navItems: { id: string; label: string }[];
  presentation: PortfolioHeroPresentationSettings;
  /** When a global page background is active, the hero uses the global color instead of its own. */
  suppressBackground?: boolean;
  globalBackgroundStyle?: CSSProperties;
  /** Fade geometric hero motif on scroll (cinematic / editorial motion profiles). */
  geomFadeEnabled?: boolean;
  /** Global left/right gutters for hero copy + absolute layers. */
  contentGutter?: PortfolioContentGutter;
};
