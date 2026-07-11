export type PortfolioGlobalMotionProfile = 'none' | 'editorial' | 'dynamic' | 'cinematic';

export const DEFAULT_MOTION_PROFILE: PortfolioGlobalMotionProfile = 'none';

export const PORTFOLIO_GLOBAL_MOTION_PROFILE_OPTIONS: {
  value: PortfolioGlobalMotionProfile;
  label: string;
  description: string;
}[] = [
  {
    value: 'none',
    label: 'Aucun',
    description: 'Pas d’animation d’entrée — le plus stable avec toutes les personnalisations.',
  },
  {
    value: 'editorial',
    label: 'Éditorial',
    description: 'Apparition douce carte par carte avec léger décalage.',
  },
  {
    value: 'dynamic',
    label: 'Dynamique',
    description: 'Comme Éditorial, avec un hover plus marqué sur les cartes.',
  },
  {
    value: 'cinematic',
    label: 'Cinématique',
    description: 'Entrées plus lentes + fondu géométrique accentué sur le hero.',
  },
];

export function isMotionProfileActive(profile: PortfolioGlobalMotionProfile): boolean {
  return profile !== 'none';
}

export function motionProfileStaggerSeconds(profile: PortfolioGlobalMotionProfile, index: number): number {
  if (!isMotionProfileActive(profile)) return 0;
  const step =
    profile === 'cinematic' ? 0.12 : profile === 'dynamic' ? 0.075 : 0.07;
  return Math.min(index * step, 0.6);
}

export function motionProfileDurationSeconds(profile: PortfolioGlobalMotionProfile): number {
  switch (profile) {
    case 'cinematic':
      return 0.85;
    case 'dynamic':
      return 0.55;
    case 'editorial':
      return 0.6;
    default:
      return 0;
  }
}

export function motionProfileEntryOffset(profile: PortfolioGlobalMotionProfile): number {
  switch (profile) {
    case 'cinematic':
      return 28;
    case 'dynamic':
      return 22;
    case 'editorial':
      return 20;
    default:
      return 0;
  }
}

export function motionProfileItemHoverClass(profile: PortfolioGlobalMotionProfile): string {
  if (profile === 'dynamic') {
    // Keep hover on the item box itself (rounded cards), not a full-bleed section wrapper.
    return 'rounded-[inherit] transition duration-200 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(249,115,22,0.35)]';
  }
  return '';
}

export function motionProfileEnablesHeroGeomFade(profile: PortfolioGlobalMotionProfile): boolean {
  return profile === 'cinematic' || profile === 'editorial';
}

export function mergeMotionProfile(base: PortfolioGlobalMotionProfile, patch: unknown): PortfolioGlobalMotionProfile {
  if (patch === 'none' || patch === 'editorial' || patch === 'dynamic' || patch === 'cinematic') {
    return patch;
  }
  return base;
}

/** Migrate legacy sectionReveal.enabled → editorial profile. */
export function resolveMotionProfileFromStorage(
  record: Record<string, unknown> | null,
  base: PortfolioGlobalMotionProfile
): PortfolioGlobalMotionProfile {
  const motionProfile = record?.motionProfile;
  if (
    motionProfile === 'none' ||
    motionProfile === 'editorial' ||
    motionProfile === 'dynamic' ||
    motionProfile === 'cinematic'
  ) {
    return motionProfile;
  }

  const legacyReveal = record?.sectionReveal;
  if (legacyReveal && typeof legacyReveal === 'object') {
    const enabled = (legacyReveal as Record<string, unknown>).enabled;
    if (enabled === true) return 'editorial';
  }

  return base;
}
